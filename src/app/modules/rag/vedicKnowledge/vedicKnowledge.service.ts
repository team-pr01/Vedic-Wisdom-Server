// src/modules/rag/vedicKnowledge/vedicKnowledge.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../../errors/AppError";
import { VedicDocument } from "./vedicKnowledge.model";
import { 
  ICreateVedicDocument, 
  IVedicDocument, 
  IVedicChunk 
} from "./vedicKnowledge.interface";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RAGConfig, validateRAGConfig } from "../../../config/rag.config";
import { IRAGQuery, IRAGResponse, IRAGSource } from "../rag.types";
import { chunkText, cleanTextForEmbedding, extractTextFromFile, generateContentHash, isDuplicateContent } from "../../../utils/vedicKnowledge.utils";

// ==================== INITIALIZATION ====================

// Validate config on service load
validateRAGConfig();

// Initialize OpenAI Embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: RAGConfig.openai.apiKey,
  modelName: RAGConfig.openai.embeddingModel,
});

// ==================== DOCUMENT PROCESSING ====================

/**
 * Process and store a new Vedic document
 */
export const processDocument = async (
  userId: string,
  payload: ICreateVedicDocument,
  fileBuffer?: Buffer,
  fileMimeType?: string,
): Promise<IVedicDocument[]> => {
  try {
    let content = payload.content || '';
    let title = payload.title || 'Untitled Document';

    // If file is provided, extract text from it
    if (fileBuffer && fileMimeType) {
      content = await extractTextFromFile(fileBuffer, fileMimeType);
      if (!payload.title) {
        title = fileBuffer.toString('utf-8').split('\n')[0]?.trim()?.slice(0, 100) || 'Untitled Document';
      }
    }

    if (!content || content.trim().length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Document content is empty");
    }

    // Check for duplicates using content hash
    const contentHash = generateContentHash(content);
    const isDuplicate = await isDuplicateContent(contentHash, VedicDocument);
    if (isDuplicate) {
      throw new AppError(httpStatus.CONFLICT, "This document already exists in the knowledge base");
    }

    // Generate a single parent ID for all chunks
    const parentDocumentId = new Types.ObjectId();

    // Create chunks
    const chunks = chunkText(
      content,
      parentDocumentId,
      title,
      payload.category,
      RAGConfig.rag.maxChunkSize,
      RAGConfig.rag.overlapSize
    );

    console.log(`📝 Creating ${chunks.length} chunks for document: ${title}`);

    // Process and save all chunks
    const savedChunks: IVedicDocument[] = [];

    for (const chunk of chunks) {
      const cleanedContent = cleanTextForEmbedding(chunk.content);
      
      // Generate embedding for each chunk
      const chunkEmbedding = await embeddings.embedQuery(cleanedContent);

      const chunkData: Partial<IVedicDocument> = {
        title: title,
        category: payload.category,
        subCategory: payload.subCategory || "",
        content: chunk.content,
        contentHash: generateContentHash(chunk.content),
        author: payload.author || "",
        source: payload.source || "",
        tags: payload.tags || [],
        scriptureType: payload.scriptureType || "",
        chapter: payload.chapter || "",
        verseNumber: payload.verseNumber || "",
        embedding: chunkEmbedding,
        chunkMetadata: {
          chunkIndex: chunk.metadata.chunkIndex,
          totalChunks: chunks.length,
          parentDocumentId: parentDocumentId,
        },
        processedBy: new Types.ObjectId(userId),
        processedAt: new Date(),
        isActive: true,
      };

      const chunkDoc = new VedicDocument(chunkData);
      await chunkDoc.save();
      savedChunks.push(chunkDoc);
    }

    console.log(`✅ Successfully saved ${savedChunks.length} chunks for document: ${title}`);

    return savedChunks;
  } catch (error) {
    console.error("❌ Error processing document:", error);
    throw error;
  }
};

/**
 * Process and store document chunks (Utility function)
 */
export const processChunks = async (
  chunks: IVedicChunk[],
  parentDocumentId: Types.ObjectId,
  userId: string
): Promise<IVedicDocument[]> => {
  const processedChunks: IVedicDocument[] = [];

  for (const chunk of chunks) {
    const cleanedContent = cleanTextForEmbedding(chunk.content);
    
    // Generate embedding for each chunk
    const chunkEmbedding = await embeddings.embedQuery(cleanedContent);

    const chunkData: Partial<IVedicDocument> = {
      title: chunk.metadata.title,
      category: chunk.metadata.category,
      content: chunk.content,
      contentHash: generateContentHash(chunk.content),
      embedding: chunkEmbedding,
      chunkMetadata: {
        chunkIndex: chunk.metadata.chunkIndex,
        totalChunks: chunk.metadata.totalChunks,
        parentDocumentId: parentDocumentId,
      },
      processedBy: new Types.ObjectId(userId),
      processedAt: new Date(),
      isActive: true,
    };

    const chunkDoc = new VedicDocument(chunkData);
    await chunkDoc.save();
    processedChunks.push(chunkDoc);
  }

  return processedChunks;
};


// ==================== RAG QUERY PROCESSING ====================

/**
 * Answer a question using RAG (Retrieval-Augmented Generation)
 */
export const answerQuestion = async (query: IRAGQuery): Promise<IRAGResponse> => {
  const startTime = Date.now();

  try {
    // 1. Generate embedding for the question
    const questionEmbedding = await embeddings.embedQuery(query.question);

    // 2. Perform vector search in MongoDB
    const searchResults = await performVectorSearch(
      questionEmbedding,
      query.category,
      query.maxResults || RAGConfig.rag.topKResults,
      query.minRelevanceScore || RAGConfig.rag.minRelevanceScore
    );

    if (!searchResults || searchResults.length === 0) {
      return {
        answer: "I don't have information about that topic in the Vedic knowledge base.",
        sources: [],
        confidence: 0,
        processingTime: Date.now() - startTime,
      };
    }

    // 3. Prepare context from search results
    const context = prepareContext(searchResults);
    const sources = searchResults.map((result) => ({
      documentId: result._id.toString(),
      title: result.title,
      category: result.category,
      content: result.content.slice(0, 500) + "...",
      relevanceScore: result.score || 0,
      chapter: result.chapter,
      verseNumber: result.verseNumber,
      source: result.source,
    }));

    // 4. Generate answer using LLM
    const answer = await generateAnswerWithContext(query.question, context, query.language);

    // 5. Update analytics
    await updateDocumentAnalytics(searchResults);

    const processingTime = Date.now() - startTime;

    return {
      answer,
      sources,
      confidence: calculateConfidence(sources),
      processingTime,
    };
  } catch (error) {
    console.error("❌ Error answering question:", error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to process your query");
  }
};

// ==================== VECTOR SEARCH ====================

/**
 * Perform vector search on MongoDB Atlas
 */
export const performVectorSearch = async (
  queryEmbedding: number[],
  category?: string,
  limit: number = 10,
  minScore: number = 0.7
): Promise<any[]> => {
  const pipeline = [
    {
      $vectorSearch: {
        index: RAGConfig.mongodb.vectorSearchIndex,
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: limit,
        filter: {
          ...(category && { category }),
          isActive: true,
        },
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        content: 1,
        category: 1,
        chapter: 1,
        verseNumber: 1,
        source: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
    {
      $match: {
        score: { $gte: minScore },
      },
    },
  ];

  const results = await VedicDocument.aggregate(pipeline);
  return results;
};

// ==================== CONTEXT PREPARATION ====================

/**
 * Prepare context from search results for LLM
 */
export const prepareContext = (results: any[]): string => {
  const contextChunks = results.map((result, index) => {
    return `[Source ${index + 1}] (${result.title}, ${result.category})
${result.content}`;
  });

  return contextChunks.join("\n\n---\n\n");
};

// ==================== ANSWER GENERATION ====================

/**
 * Generate answer using OpenAI with context
 */
export const generateAnswerWithContext = async (
  question: string,
  context: string,
  language: string = "en"
): Promise<string> => {
  // Dynamic import for OpenAI (to avoid bundling issues)
  const { ChatOpenAI } = await import("@langchain/openai");
  const { SystemMessage, HumanMessage } = await import("@langchain/core/messages");

  const chatModel = new ChatOpenAI({
    openAIApiKey: RAGConfig.openai.apiKey,
    modelName: RAGConfig.openai.chatModel,
    temperature: RAGConfig.openai.temperature,
    maxTokens: RAGConfig.openai.maxTokens,
  });

  const systemPrompt = `You are a Vedic knowledge assistant specializing in Hindu scriptures, Vedic philosophy, Ayurveda, and spiritual wisdom.

INSTRUCTIONS:
1. Answer ONLY based on the provided context from Vedic texts
2. If the answer is not in the context, say "I don't have information about this in my Vedic knowledge base"
3. Maintain a respectful and spiritual tone
4. Mention the source text when relevant (e.g., "According to the Bhagavad Gita...")
5. Keep answers clear, accurate, and helpful
6. ${language === 'hi' ? 'Answer in Hindi' : 'Answer in English'}
7. If quoting verses, preserve the original meaning and intent

Context:
${context}

Question: ${question}

Answer based ONLY on the above context:`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(`Please answer the question based on the provided Vedic texts.`),
  ];

  const response = await chatModel.invoke(messages);
  return response.content as string;
};

// ==================== ANALYTICS ====================

/**
 * Update document analytics after query
 */
export const updateDocumentAnalytics = async (documents: any[]): Promise<void> => {
  for (const doc of documents) {
    await VedicDocument.findByIdAndUpdate(doc._id, {
      $inc: { totalQueries: 1 },
    });
  }
};

/**
 * Rate the helpfulness of an answer
 */
export const rateAnswer = async (
  documentId: string,
  rating: number // 1-5
): Promise<void> => {
  if (rating < 1 || rating > 5) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
  }

  const document = await VedicDocument.findById(documentId);
  if (!document) {
    throw new AppError(httpStatus.NOT_FOUND, "Document not found");
  }

  await VedicDocument.findByIdAndUpdate(documentId, {
    $inc: { helpfulRatings: rating },
  });
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate confidence score based on sources
 */
export const calculateConfidence = (sources: IRAGSource[]): number => {
  if (sources.length === 0) return 0;
  
  // Average relevance score
  const avgScore = sources.reduce((sum, source) => sum + source.relevanceScore, 0) / sources.length;
  
  // Higher confidence if we have more sources
  const sourceFactor = Math.min(sources.length / 3, 1);
  
  return Math.min(avgScore * 0.8 + sourceFactor * 0.2, 1);
};

// ==================== CRUD OPERATIONS ====================

/**
 * Get all documents with pagination
 */
export const getAllDocuments = async (
  filters: any,
  skip: number = 0,
  limit: number = 10
) => {
  const query: any = { isActive: true };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.keyword) {
    query.$text = { $search: filters.keyword };
  }

  if (filters.scriptureType) {
    query.scriptureType = filters.scriptureType;
  }

  const [data, total] = await Promise.all([
    VedicDocument.find(query)
      .select("title category author source tags createdAt totalQueries")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    VedicDocument.countDocuments(query),
  ]);

  return {
    data,
    meta: {
      total,
      skip,
      limit,
      hasMore: skip + limit < total,
    },
  };
};

/**
 * Get single document by ID
 */
export const getDocumentById = async (documentId: string) => {
  const document = await VedicDocument.findById(documentId);
  if (!document) {
    throw new AppError(httpStatus.NOT_FOUND, "Document not found");
  }
  return document;
};

/**
 * Update document
 */
export const updateDocument = async (
  documentId: string,
  payload: Partial<ICreateVedicDocument>
) => {
  const existing = await VedicDocument.findById(documentId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Document not found");
  }

  const updated = await VedicDocument.findByIdAndUpdate(
    documentId,
    { ...payload },
    { new: true, runValidators: true }
  );

  return updated;
};

/**
 * Delete document (soft delete)
 */
export const deleteDocument = async (documentId: string) => {
  const existing = await VedicDocument.findById(documentId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Document not found");
  }

  // If it's a parent document, delete all its chunks too
  if (!existing.chunkMetadata?.parentDocumentId) {
    await VedicDocument.deleteMany({
      "chunkMetadata.parentDocumentId": existing._id,
    });
  }

  await VedicDocument.findByIdAndDelete(documentId);
  return { success: true, message: "Document deleted successfully" };
};

// ==================== EXPORTS ====================

export const VedicKnowledgeServices = {
  processDocument,
  processChunks,
  answerQuestion,
  performVectorSearch,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  rateAnswer,
};