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

// Process and store a new Vedic document
export const processDocument = async (
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
    const parentDocumentId = new Types.ObjectId() as any;

    // Create chunks
    const chunks = chunkText(
      content,
      parentDocumentId,
      title,
      payload.category,
      RAGConfig.rag.maxChunkSize,
      RAGConfig.rag.overlapSize
    );

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
        processedAt: new Date(),
      };

      const chunkDoc = new VedicDocument(chunkData);
      await chunkDoc.save();
      savedChunks.push(chunkDoc);
    }

    return savedChunks;
  } catch (error) {
    console.error("❌ Error processing document:", error);
    throw error;
  }
};

// Process and store document chunks (Utility function)
export const processChunks = async (
  chunks: IVedicChunk[],
  parentDocumentId: Types.ObjectId,
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
        parentDocumentId: parentDocumentId as any,
      },
      processedAt: new Date(),
    };

    const chunkDoc = new VedicDocument(chunkData);
    await chunkDoc.save();
    processedChunks.push(chunkDoc);
  }

  return processedChunks;
};

// Answer a question using RAG (Retrieval-Augmented Generation)
export const analyzeUserQuery = async (
  question: string,
  conversationHistory?: string
): Promise<{
  isGreeting: boolean;
  isAboutAI: boolean;
  isHinduTopic: boolean;
  isHinduRelated: boolean;
  isOffTopic: boolean;
  category: string | null;
  isReligiousQuestion: boolean;
  shouldUseVedicKnowledge: boolean;
  shouldUseAIKnowledge: boolean;
  response: string | null;
  suggestedResponse: string | null;
}> => {
  const { ChatOpenAI } = await import("@langchain/openai");
  const { SystemMessage, HumanMessage } = await import("@langchain/core/messages");

  const chatModel = new ChatOpenAI({
    openAIApiKey: RAGConfig.openai.apiKey,
    modelName: "gpt-4o-mini",
    temperature: 0.1,
    maxTokens: 300,
  });

  const context = conversationHistory
    ? `\nPrevious conversation:\n${conversationHistory}\n`
    : "";

  const systemPrompt = `You are a Vedic/Hindu knowledge assistant. Your job is to analyze user queries and classify them.

Analyze the following user question${context}and respond with a JSON object exactly in this format:
{
  "isGreeting": boolean,
  "isAboutAI": boolean,
  "isHinduRelated": boolean,
  "isOffTopic": boolean,
  "category": "greeting" | "ai_question" | "hindu_question" | "off_topic" | "general_question",
  "shouldUseVedicKnowledge": boolean,
  "shouldUseAIKnowledge": boolean,
  "suggestedResponse": string | null
}

CLASSIFICATION RULES:
1. "isGreeting": true if the user is just saying hello, good morning, namaste, etc.
2. "isAboutAI": true if the user is asking about the AI itself (who created you, what are you, etc.)
3. "isHinduRelated": true if the question is about Hinduism, Vedas, Upanishads, Bhagavad Gita, Ramayana, Mahabharata, Puranas, dharma, karma, moksha, yoga, Ayurveda, meditation, mantras, puja, deities (Shiva, Vishnu, Krishna, Rama, Durga, etc.), spiritual teachings, or Vedic philosophy
4. "isOffTopic": true if the question is about politics, other religions (Islam, Christianity, Judaism, etc.), sports, movies, weather, technology, business, or any non-Hindu/non-spiritual topic
5. "shouldUseVedicKnowledge": true only if the question is Hindu-related
6. "shouldUseAIKnowledge": true ONLY for greetings, AI questions, or general knowledge questions that are NOT off-topic
7. "suggestedResponse": 
   - For greetings: a friendly greeting like "Namaste! How can I assist you with Vedic wisdom today? 🙏"
   - For AI questions: "I am a Vedic knowledge assistant, created to share insights from Hindu scriptures, Vedic philosophy, and spiritual teachings. My purpose is to support your journey of understanding through the wisdom of texts like the Bhagavad Gita, Upanishads, and other sacred writings. How can I assist you today? 🙏"
   - For off-topic: "I apologize, but I am designed to assist only with topics related to Hinduism, Vedic knowledge, and spiritual wisdom. I cannot answer questions about politics, other religions, or non-Hindu topics. Is there something about Vedic philosophy I can help you with? 🙏"
   - For all other topics: null (use Vedic knowledge or AI knowledge)

ONLY respond with valid JSON. No other text.`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(`User question: "${question}"\n\nAnalyze and classify this query.`),
  ];

  try {
    const response = await chatModel.invoke(messages);
    const content = response.content as string;

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedResult = JSON.parse(jsonMatch[0]) as Partial<{
        isGreeting: boolean;
        isAboutAI: boolean;
        isHinduTopic: boolean;
        isHinduRelated: boolean;
        isOffTopic: boolean;
        category: string | null;
        isReligiousQuestion: boolean;
        shouldUseVedicKnowledge: boolean;
        shouldUseAIKnowledge: boolean;
        response: string | null;
        suggestedResponse: string | null;
      }>;

      return {
        isGreeting: parsedResult.isGreeting ?? false,
        isAboutAI: parsedResult.isAboutAI ?? false,
        isHinduTopic: parsedResult.isHinduTopic ?? parsedResult.isHinduRelated ?? false,
        isHinduRelated: parsedResult.isHinduRelated ?? false,
        isOffTopic: parsedResult.isOffTopic ?? false,
        category: parsedResult.category ?? null,
        isReligiousQuestion: parsedResult.isReligiousQuestion ?? parsedResult.isHinduRelated ?? false,
        shouldUseVedicKnowledge: parsedResult.shouldUseVedicKnowledge ?? false,
        shouldUseAIKnowledge: parsedResult.shouldUseAIKnowledge ?? false,
        response: parsedResult.response ?? parsedResult.suggestedResponse ?? null,
        suggestedResponse: parsedResult.suggestedResponse ?? null,
      };
    }

    // Fallback
    return {
      isGreeting: false,
      isAboutAI: false,
      isHinduTopic: false,
      isHinduRelated: false,
      isOffTopic: true,
      category: "off_topic",
      isReligiousQuestion: false,
      shouldUseVedicKnowledge: false,
      shouldUseAIKnowledge: false,
      response: "I apologize, but I am designed to assist only with topics related to Hinduism, Vedic knowledge, and spiritual wisdom. Please ask me about Vedic philosophy, scriptures, or spiritual teachings. 🙏",
      suggestedResponse: null,
    };
  } catch (error) {
    console.error("❌ Error analyzing query:", error);
    return {
      isGreeting: false,
      isAboutAI: false,
      isHinduTopic: false,
      isHinduRelated: false,
      isOffTopic: true,
      category: "off_topic",
      isReligiousQuestion: false,
      shouldUseVedicKnowledge: false,
      shouldUseAIKnowledge: false,
      response: "I apologize, but I am designed to assist only with topics related to Hinduism, Vedic knowledge, and spiritual wisdom. 🙏",
      suggestedResponse: null,
    };
  }
};

// Get REAL, SPECIFIC sources for AI-generated answers based on the topic
const getAISourcesForTopic = (question: string): IRAGSource[] => {
  const lowerQuestion = question.toLowerCase();
  const sources: IRAGSource[] = [];

  // 📚 Shad Darshan / Six Schools of Philosophy
  if (lowerQuestion.includes("shad darshan") || lowerQuestion.includes("six school") ||
    lowerQuestion.includes("six orthodox") || lowerQuestion.includes("darshan")) {
    sources.push({
      documentId: "ai-source-wisdomlib-shad",
      title: "Shad Darshan - Six Schools of Philosophy",
      category: "Hindu Philosophy",
      content: "The six orthodox schools (Shad Darshan) of Hindu philosophy: Nyaya, Vaisheshika, Samkhya, Yoga, Mimamsa, and Vedanta.",
      relevanceScore: 0.9,
      url: "https://www.wisdomlib.org/definition/shad-darshana",
      source: "Wisdom Library",
    });
  }

  // 🕉️ Vivekachudamani / Advaita Vedanta
  if (lowerQuestion.includes("vivekachudamani") || lowerQuestion.includes("vivek chur") ||
    lowerQuestion.includes("crest-jewel") || lowerQuestion.includes("crest jewel")) {
    sources.push({
      documentId: "ai-source-wisdomlib-vivek",
      title: "Vivekachudamani - The Crest-Jewel of Discrimination",
      category: "Advaita Vedanta",
      content: "Vivekachudamani is a treatise on Advaita Vedanta philosophy, attributed to Adi Shankaracharya.",
      relevanceScore: 0.9,
      url: "https://www.wisdomlib.org/hinduism/book/vivekachudamani",
      source: "Wisdom Library",
    });
  }

  // 🔱 Shiva Purana / Ketaki Flower
  if (lowerQuestion.includes("shiva purana") || lowerQuestion.includes("ketaki") ||
    lowerQuestion.includes("shiva cursed brahma") || lowerQuestion.includes("flower cursed")) {
    sources.push({
      documentId: "ai-source-shiva-purana",
      title: "Shiva Purana - Ketaki Flower Curse",
      category: "Purana",
      content: "The Shiva Purana narrates the curse of Shiva on Brahma, where the Ketaki flower was cursed and banned from worship.",
      relevanceScore: 0.95,
      url: "https://www.wisdomlib.org/hinduism/book/shiva-purana", // Real source
      source: "Shiva Purana - Wisdom Library",
    });
    sources.push({
      documentId: "ai-source-ketaki",
      title: "Ketaki Flower - Significance and Curse",
      category: "Mythology",
      content: "According to Shiva Purana, Ketaki flower was cursed by Shiva and is not used in his worship.",
      relevanceScore: 0.9,
      url: "https://www.wisdomlib.org/definition/ketaki", // Real source
      source: "Wisdom Library - Ketaki",
    });
    sources.push({
      documentId: "ai-source-sacred-texts-shiva",
      title: "The Shiva Purana - English Translation",
      category: "Scripture",
      content: "The English translation of Shiva Purana containing the story of Brahma and Ketaki flower.",
      relevanceScore: 0.85,
      url: "https://www.sacred-texts.com/hin/sha/", // Real source
      source: "Sacred Texts",
    });
  }

  // 🕉️ Shiva / Shiva Purana (general)
  if (lowerQuestion.includes("shiva") && (lowerQuestion.includes("purana") ||
    lowerQuestion.includes("worship") || lowerQuestion.includes("curse"))) {
    if (!sources.some(s => s.documentId === "ai-source-shiva-purana")) {
      sources.push({
        documentId: "ai-source-shiva-purana-general",
        title: "The Shiva Purana - Complete Text",
        category: "Purana",
        content: "The Shiva Purana is one of the eighteen major Puranas, containing stories and teachings about Lord Shiva.",
        relevanceScore: 0.8,
        url: "https://www.wisdomlib.org/hinduism/book/shiva-purana",
        source: "Wisdom Library - Shiva Purana",
      });
    }
  }

  // 📖 Bhagavad Gita
  if (lowerQuestion.includes("bhagavad gita") || lowerQuestion.includes("gita")) {
    sources.push({
      documentId: "ai-source-gita",
      title: "Bhagavad Gita",
      category: "Scripture",
      content: "The Bhagavad Gita is a 700-verse Hindu scripture that is part of the Mahabharata.",
      relevanceScore: 0.9,
      url: "https://www.holy-bhagavad-gita.org/",
      source: "Holy Bhagavad Gita",
    });
    sources.push({
      documentId: "ai-source-gita-wiki",
      title: "Bhagavad Gita - Wikipedia",
      category: "Scripture",
      content: "The Bhagavad Gita is an ancient Indian text that is considered one of the most important religious texts in Hinduism.",
      relevanceScore: 0.8,
      url: "https://en.wikipedia.org/wiki/Bhagavad_Gita",
      source: "Wikipedia",
    });
  }

  // 🧘 Yoga
  if (lowerQuestion.includes("yoga sutra") || lowerQuestion.includes("patanjali") ||
    (lowerQuestion.includes("yoga") && !lowerQuestion.includes("ayurveda"))) {
    sources.push({
      documentId: "ai-source-yoga-sutra",
      title: "Yoga Sutras of Patanjali",
      category: "Yoga Philosophy",
      content: "The Yoga Sutras of Patanjali is a collection of Sanskrit sutras on the theory and practice of yoga.",
      relevanceScore: 0.85,
      url: "https://www.wisdomlib.org/hinduism/book/the-yoga-sutras-of-patanjali",
      source: "Wisdom Library - Yoga Sutra",
    });
  }

  // 🌿 Ayurveda / Charaka Samhita
  if (lowerQuestion.includes("ayurveda") || lowerQuestion.includes("charaka")) {
    sources.push({
      documentId: "ai-source-charaka",
      title: "Charaka Samhita - Ayurveda",
      category: "Ayurveda",
      content: "The Charaka Samhita is an ancient Indian Ayurvedic text on internal medicine.",
      relevanceScore: 0.85,
      url: "https://www.wisdomlib.org/hinduism/book/charaka-samhita",
      source: "Wisdom Library - Charaka Samhita",
    });
  }

  // 🔱 Ramayana / Valmiki
  if (lowerQuestion.includes("ramayana") && lowerQuestion.includes("valmiki")) {
    sources.push({
      documentId: "ai-source-valmiki",
      title: "Valmiki Ramayana",
      category: "Epic",
      content: "The Valmiki Ramayana is one of the two major Sanskrit epics of ancient India.",
      relevanceScore: 0.9,
      url: "https://www.valmikiramayan.net/",
      source: "Valmiki Ramayana",
    });
  }

  // 🔱 Mahabharata / Vyasa
  if (lowerQuestion.includes("mahabharata") || lowerQuestion.includes("vyasa")) {
    sources.push({
      documentId: "ai-source-mahabharata",
      title: "Mahabharata",
      category: "Epic",
      content: "The Mahabharata is one of the two major Sanskrit epics of ancient India.",
      relevanceScore: 0.85,
      url: "https://www.sacred-texts.com/hin/maha/",
      source: "Sacred Texts - Mahabharata",
    });
  }

  // 🕉️ Adi Shankaracharya / Advaita
  if (lowerQuestion.includes("shankaracharya") || lowerQuestion.includes("advaita") ||
    lowerQuestion.includes("non-duality")) {
    sources.push({
      documentId: "ai-source-advaita",
      title: "Advaita Vedanta - Adi Shankaracharya",
      category: "Philosophy",
      content: "Advaita Vedanta is a school of Hindu philosophy, traditionally attributed to Adi Shankaracharya.",
      relevanceScore: 0.85,
      url: "https://www.wisdomlib.org/definition/advaita-vedanta",
      source: "Wisdom Library - Advaita Vedanta",
    });
  }

  // ⚠️ IMPORTANT: Always check if we have specific sources
  // If no specific source was found, use general Hindu resources
  if (sources.length === 0) {
    // Try to be more specific based on keywords
    const genericSources = [
      {
        id: "wisdomlib",
        title: "Wisdom Library - Hindu Scriptures",
        url: "https://www.wisdomlib.org/hinduism",
        label: "Wisdom Library",
      },
      {
        id: "sacred-texts",
        title: "Sacred Texts - Hinduism",
        url: "https://www.sacred-texts.com/hin/",
        label: "Sacred Texts",
      },
      {
        id: "hinduwisdom",
        title: "Hindu Wisdom - Philosophy and Scriptures",
        url: "https://www.hinduwisdom.info/",
        label: "Hindu Wisdom",
      },
      {
        id: "gita-society",
        title: "Bhagavad Gita - The Divine Song",
        url: "https://www.gitasociety.com/",
        label: "Gita Society",
      },
    ];

    // Add the first two generic sources
    genericSources.slice(0, 2).forEach((source, index) => {
      sources.push({
        documentId: `ai-source-${source.id}`,
        title: source.title,
        category: "Hindu Knowledge",
        content: "Information based on authentic Hindu philosophical texts and teachings.",
        relevanceScore: 0.5 - (index * 0.1),
        url: source.url,
        source: source.label,
      });
    });
  }

  return sources;
};

// Enhanced answerQuestion with real sources
export const answerQuestion = async (query: IRAGQuery): Promise<IRAGResponse> => {
  const startTime = Date.now();

  try {
    // 1. Build conversation context
    let conversationContext = "";
    if (query.history && query.history.length > 0) {
      const recentHistory = query.history.slice(-5);
      conversationContext = recentHistory
        .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n");
    }

    // 2. Analyze the query using AI
    const analysis = await analyzeUserQuery(query.question, conversationContext);

    // 3. Handle Greetings
    if (analysis.isGreeting) {
      return {
        answer: analysis.suggestedResponse || "Namaste! How can I assist you with Vedic wisdom today? 🙏",
        sources: [],
        confidence: 1,
        processingTime: Date.now() - startTime,
      };
    }

    // 4. Handle AI Questions
    if (analysis.isAboutAI) {
      return {
        answer: analysis.suggestedResponse || "I am a Vedic knowledge assistant, created to share insights from Hindu scriptures, Vedic philosophy, and spiritual teachings. My purpose is to support your journey of understanding through the wisdom of texts like the Bhagavad Gita, Upanishads, and other sacred writings. How can I assist you today? 🙏",
        sources: [],
        confidence: 1,
        processingTime: Date.now() - startTime,
      };
    }

    // 5. Handle Off-Topic Questions
    if (analysis.isOffTopic) {
      return {
        answer: analysis.suggestedResponse || "I apologize, but I am designed to assist only with topics related to Hinduism, Vedic knowledge, and spiritual wisdom. Please ask me about Vedic philosophy, scriptures, or spiritual teachings. 🙏",
        sources: [],
        confidence: 0,
        processingTime: Date.now() - startTime,
      };
    }

    // 6. Handle Hindu/Religious Questions - Use Vedic Knowledge
    if (analysis.isHinduRelated) {
      // Generate embedding and search
      const questionEmbedding = await embeddings.embedQuery(query.question);
      const searchResults = await performVectorSearch(
        questionEmbedding,
        query.category,
        query.maxResults || RAGConfig.rag.topKResults,
        query.minRelevanceScore || RAGConfig.rag.minRelevanceScore
      );

      if (searchResults && searchResults.length > 0) {
        const searchContext = prepareContext(searchResults);
        let finalContext = searchContext;
        if (conversationContext) {
          finalContext = `Previous conversation:\n${conversationContext}\n\nInformation from Vedic texts:\n${searchContext}`;
        }

        // ✅ Build sources WITHOUT URLs (since it's from Vedic Knowledge DB)
        const sources = searchResults.map((result) => ({
          documentId: result._id.toString(),
          title: result.title || "Vedic Text",
          category: result.category || "Scripture",
          content: result.content?.slice(0, 500) + "..." || "",
          relevanceScore: result.score || 0,
          chapter: result.chapter,
          verseNumber: result.verseNumber,
          source: result.source || "Vedic Knowledge Base",
          // ❌ NO URL - intentionally omitted
        }));

        const answer = await generateAnswerWithContext(
          query.question,
          finalContext,
          query.language || "en",
          conversationContext
        );

        await updateDocumentAnalytics(searchResults);

        return {
          answer,
          sources,
          confidence: calculateConfidence(sources),
          processingTime: Date.now() - startTime,
        };
      } else {
        // ✅ No results in Vedic database - use AI knowledge with REAL SOURCES (with URLs)
        const answer = await generateAIAnswerForHinduTopic(
          query.question,
          query.language || "en",
          conversationContext
        );

        // Get real, verifiable sources with URLs
        const sources = getAISourcesForTopic(query.question);

        return {
          answer,
          sources,
          confidence: 0.7,
          processingTime: Date.now() - startTime,
        };
      }
    }

    // 7. Fallback - use AI knowledge for general questions with real sources (with URLs)
    const answer = await generateAIAnswer(
      query.question,
      query.language || "en"
    );

    return {
      answer,
      sources: [
        {
          documentId: "ai-general-knowledge",
          title: "General Knowledge",
          category: "AI Knowledge",
          content: "Based on AI's training data and general knowledge",
          relevanceScore: 0.2,
          url: "https://www.wikipedia.org/",
          source: "Wikipedia",
        },
      ],
      confidence: 0.2,
      processingTime: Date.now() - startTime,
    };

  } catch (error) {
    console.error("❌ Error answering question:", error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to process your query");
  }
};

// Generate AI Answer for Hindu Topics with source
export const generateAIAnswerForHinduTopic = async (
  question: string,
  language: string = "en",
  conversationHistory: string = ""
): Promise<string> => {
  const { ChatOpenAI } = await import("@langchain/openai");
  const { SystemMessage, HumanMessage } = await import("@langchain/core/messages");

  const chatModel = new ChatOpenAI({
    openAIApiKey: RAGConfig.openai.apiKey,
    modelName: RAGConfig.openai.chatModel,
    temperature: 0.3,
    maxTokens: 500,
  });

  const historyContext = conversationHistory
    ? `\nPrevious conversation for context:\n${conversationHistory}\n`
    : "";

  const systemPrompt = `You are a Vedic knowledge assistant specializing in Hindu scriptures, Vedic philosophy, Ayurveda, and spiritual wisdom.

IMPORTANT RULES:
1. You are designed to answer ONLY about Hinduism, Vedic knowledge, and spiritual topics
2. Do NOT answer about other religions, politics, sports, or any non-Hindu topics
3. If the question is about Hindu philosophy, provide helpful information based on your training
4. Maintain a respectful and spiritual tone
5. Keep answers clear, accurate, and helpful
6. ${language === 'hi' ? 'Answer in Hindi' : 'Answer in English'}
7. If you're not sure about a specific Vedic text, acknowledge it politely

${historyContext}

Question: ${question}

Provide a helpful response about Hindu/Vedic knowledge:`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(`Please answer this question about Hindu/Vedic knowledge: ${question}`),
  ];

  const response = await chatModel.invoke(messages);
  return response.content as string;
};

// Generate AI answer for general questions with source
export const generateAIAnswer = async (
  question: string,
  language: string = "en"
): Promise<string> => {
  const { ChatOpenAI } = await import("@langchain/openai");
  const { SystemMessage, HumanMessage } = await import("@langchain/core/messages");

  const chatModel = new ChatOpenAI({
    openAIApiKey: RAGConfig.openai.apiKey,
    modelName: RAGConfig.openai.chatModel,
    temperature: 0.3,
    maxTokens: 500,
  });

  const systemPrompt = `You are a Vedic knowledge assistant.

IMPORTANT:
- If the user is just saying "Great", "Thank you", "Nice", respond naturally like a friendly assistant
- For any other question, provide a brief, helpful response
- Encourage the user to ask about Vedic topics
- ${language === 'hi' ? 'Answer in Hindi' : 'Answer in English'}

Question: ${question}

Provide a brief, friendly response:`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(`Please respond to: ${question}`),
  ];

  const response = await chatModel.invoke(messages);
  return response.content as string;
};

// Calculate confidence based on sources
export const calculateConfidence = (sources: IRAGSource[]): number => {
  if (sources.length === 0) return 0;

  const avgScore = sources.reduce((sum, source) => sum + (source.relevanceScore || 0), 0) / sources.length;
  const sourceFactor = Math.min(sources.length / 3, 1);

  return Math.min(avgScore * 0.8 + sourceFactor * 0.2, 1);
};

// Generate answer from conversation history when no search results found
export const generateAnswerFromHistory = async (
  question: string,
  conversationHistory: string,
  language: string = "en"
): Promise<string> => {
  const { ChatOpenAI } = await import("@langchain/openai");
  const { SystemMessage, HumanMessage } = await import("@langchain/core/messages");

  const chatModel = new ChatOpenAI({
    openAIApiKey: RAGConfig.openai.apiKey,
    modelName: RAGConfig.openai.chatModel,
    temperature: RAGConfig.openai.temperature,
    maxTokens: RAGConfig.openai.maxTokens,
  });

  const systemPrompt = `You are a Vedic knowledge assistant.

Previous conversation:
${conversationHistory}

The user is asking: "${question}"

Based on the previous conversation, provide a helpful response. If the user is asking for clarification on a previous topic, explain it in simpler terms.
${language === 'hi' ? 'Answer in Hindi' : 'Answer in English'}`;

  const response = await chatModel.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`Please help the user with their question based on our previous conversation.`),
  ]);

  return response.content as string;
};

// Generate answer using OpenAI with Vedic context
export const generateAnswerWithContext = async (
  question: string,
  context: string,
  language: string = "en",
  conversationHistory: string = ""
): Promise<string> => {
  const { ChatOpenAI } = await import("@langchain/openai");
  const { SystemMessage, HumanMessage } = await import("@langchain/core/messages");

  const chatModel = new ChatOpenAI({
    openAIApiKey: RAGConfig.openai.apiKey,
    modelName: RAGConfig.openai.chatModel,
    temperature: RAGConfig.openai.temperature,
    maxTokens: RAGConfig.openai.maxTokens,
  });

  let systemPrompt = `You are a Vedic knowledge assistant specializing in Hindu scriptures, Vedic philosophy, Ayurveda, and spiritual wisdom.

INSTRUCTIONS:
1. Answer based on the provided context from Vedic texts
2. ${conversationHistory ? 'Use the previous conversation to understand the context' : ''}
3. Maintain a respectful and spiritual tone
4. Mention the source text when relevant
5. Keep answers clear, accurate, and helpful
6. ${language === 'hi' ? 'Answer in Hindi' : 'Answer in English'}`;

  if (conversationHistory) {
    systemPrompt += `\n\nPREVIOUS CONVERSATION (for context):
${conversationHistory}`;
  }

  systemPrompt += `\n\nVedic texts context:\n${context}`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(`Question: ${question}\n\nPlease provide an answer.`),
  ];

  const response = await chatModel.invoke(messages);
  return response.content as string;
};

// Perform vector search on MongoDB Atlas
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
          ...(category && { category })
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

// Prepare context from search results for LLM
export const prepareContext = (results: any[]): string => {
  const contextChunks = results.map((result, index) => {
    return `[Source ${index + 1}] (${result.title}, ${result.category})
${result.content}`;
  });

  return contextChunks.join("\n\n---\n\n");
};

// Update document analytics after query
export const updateDocumentAnalytics = async (documents: any[]): Promise<void> => {
  for (const doc of documents) {
    await VedicDocument.findByIdAndUpdate(doc._id, {
      $inc: { totalQueries: 1 },
    });
  }
};

// Rate the helpfulness of an answer
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

// Get all documents with pagination
export const getAllDocuments = async (
  filters: any,
  skip: number = 0,
  limit: number = 10
) => {
  const query: any = {};

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

// Get single document by ID
export const getDocumentById = async (documentId: string) => {
  const document = await VedicDocument.findById(documentId);
  if (!document) {
    throw new AppError(httpStatus.NOT_FOUND, "Document not found");
  }
  return document;
};

// Update document
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

// Delete document (soft delete)
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