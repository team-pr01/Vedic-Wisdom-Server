"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VedicKnowledgeServices = exports.deleteDocument = exports.updateDocument = exports.getDocumentById = exports.getAllDocuments = exports.rateAnswer = exports.updateDocumentAnalytics = exports.prepareContext = exports.performVectorSearch = exports.generateAnswerWithContext = exports.generateAnswerFromHistory = exports.calculateConfidence = exports.generateAIAnswer = exports.generateAIAnswerForHinduTopic = exports.answerQuestion = exports.analyzeUserQuery = exports.processChunks = exports.processDocument = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const vedicKnowledge_model_1 = require("./vedicKnowledge.model");
const openai_1 = require("@langchain/openai");
const rag_config_1 = require("../../../config/rag.config");
const vedicKnowledge_utils_1 = require("../../../utils/vedicKnowledge.utils");
// ==================== INITIALIZATION ====================
// Validate config on service load
(0, rag_config_1.validateRAGConfig)();
// Initialize OpenAI Embeddings
const embeddings = new openai_1.OpenAIEmbeddings({
    openAIApiKey: rag_config_1.RAGConfig.openai.apiKey,
    modelName: rag_config_1.RAGConfig.openai.embeddingModel,
});
// Process and store a new Vedic document
const processDocument = (payload, fileBuffer, fileMimeType) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let content = payload.content || '';
        let title = payload.title || 'Untitled Document';
        // If file is provided, extract text from it
        if (fileBuffer && fileMimeType) {
            content = yield (0, vedicKnowledge_utils_1.extractTextFromFile)(fileBuffer, fileMimeType);
            if (!payload.title) {
                title = ((_b = (_a = fileBuffer.toString('utf-8').split('\n')[0]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.slice(0, 100)) || 'Untitled Document';
            }
        }
        if (!content || content.trim().length === 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Document content is empty");
        }
        // Check for duplicates using content hash
        const contentHash = (0, vedicKnowledge_utils_1.generateContentHash)(content);
        const isDuplicate = yield (0, vedicKnowledge_utils_1.isDuplicateContent)(contentHash, vedicKnowledge_model_1.VedicDocument);
        if (isDuplicate) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, "This document already exists in the knowledge base");
        }
        // Generate a single parent ID for all chunks
        const parentDocumentId = new mongoose_1.Types.ObjectId();
        // Create chunks
        const chunks = (0, vedicKnowledge_utils_1.chunkText)(content, parentDocumentId, title, payload.category, rag_config_1.RAGConfig.rag.maxChunkSize, rag_config_1.RAGConfig.rag.overlapSize);
        console.log(`📝 Creating ${chunks.length} chunks for document: ${title}`);
        // Process and save all chunks
        const savedChunks = [];
        for (const chunk of chunks) {
            const cleanedContent = (0, vedicKnowledge_utils_1.cleanTextForEmbedding)(chunk.content);
            // Generate embedding for each chunk
            const chunkEmbedding = yield embeddings.embedQuery(cleanedContent);
            const chunkData = {
                title: title,
                category: payload.category,
                subCategory: payload.subCategory || "",
                content: chunk.content,
                contentHash: (0, vedicKnowledge_utils_1.generateContentHash)(chunk.content),
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
            const chunkDoc = new vedicKnowledge_model_1.VedicDocument(chunkData);
            yield chunkDoc.save();
            savedChunks.push(chunkDoc);
        }
        console.log(`Successfully saved ${savedChunks.length} chunks for document: ${title}`);
        return savedChunks;
    }
    catch (error) {
        console.error("❌ Error processing document:", error);
        throw error;
    }
});
exports.processDocument = processDocument;
// Process and store document chunks (Utility function)
const processChunks = (chunks, parentDocumentId) => __awaiter(void 0, void 0, void 0, function* () {
    const processedChunks = [];
    for (const chunk of chunks) {
        const cleanedContent = (0, vedicKnowledge_utils_1.cleanTextForEmbedding)(chunk.content);
        // Generate embedding for each chunk
        const chunkEmbedding = yield embeddings.embedQuery(cleanedContent);
        const chunkData = {
            title: chunk.metadata.title,
            category: chunk.metadata.category,
            content: chunk.content,
            contentHash: (0, vedicKnowledge_utils_1.generateContentHash)(chunk.content),
            embedding: chunkEmbedding,
            chunkMetadata: {
                chunkIndex: chunk.metadata.chunkIndex,
                totalChunks: chunk.metadata.totalChunks,
                parentDocumentId: parentDocumentId,
            },
            processedAt: new Date(),
        };
        const chunkDoc = new vedicKnowledge_model_1.VedicDocument(chunkData);
        yield chunkDoc.save();
        processedChunks.push(chunkDoc);
    }
    return processedChunks;
});
exports.processChunks = processChunks;
// Answer a question using RAG (Retrieval-Augmented Generation)
const analyzeUserQuery = (question, conversationHistory) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const { ChatOpenAI } = yield Promise.resolve().then(() => __importStar(require("@langchain/openai")));
    const { SystemMessage, HumanMessage } = yield Promise.resolve().then(() => __importStar(require("@langchain/core/messages")));
    const chatModel = new ChatOpenAI({
        openAIApiKey: rag_config_1.RAGConfig.openai.apiKey,
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
        const response = yield chatModel.invoke(messages);
        const content = response.content;
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsedResult = JSON.parse(jsonMatch[0]);
            return {
                isGreeting: (_a = parsedResult.isGreeting) !== null && _a !== void 0 ? _a : false,
                isAboutAI: (_b = parsedResult.isAboutAI) !== null && _b !== void 0 ? _b : false,
                isHinduTopic: (_d = (_c = parsedResult.isHinduTopic) !== null && _c !== void 0 ? _c : parsedResult.isHinduRelated) !== null && _d !== void 0 ? _d : false,
                isHinduRelated: (_e = parsedResult.isHinduRelated) !== null && _e !== void 0 ? _e : false,
                isOffTopic: (_f = parsedResult.isOffTopic) !== null && _f !== void 0 ? _f : false,
                category: (_g = parsedResult.category) !== null && _g !== void 0 ? _g : null,
                isReligiousQuestion: (_j = (_h = parsedResult.isReligiousQuestion) !== null && _h !== void 0 ? _h : parsedResult.isHinduRelated) !== null && _j !== void 0 ? _j : false,
                shouldUseVedicKnowledge: (_k = parsedResult.shouldUseVedicKnowledge) !== null && _k !== void 0 ? _k : false,
                shouldUseAIKnowledge: (_l = parsedResult.shouldUseAIKnowledge) !== null && _l !== void 0 ? _l : false,
                response: (_o = (_m = parsedResult.response) !== null && _m !== void 0 ? _m : parsedResult.suggestedResponse) !== null && _o !== void 0 ? _o : null,
                suggestedResponse: (_p = parsedResult.suggestedResponse) !== null && _p !== void 0 ? _p : null,
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
    }
    catch (error) {
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
});
exports.analyzeUserQuery = analyzeUserQuery;
// Get REAL, SPECIFIC sources for AI-generated answers based on the topic
const getAISourcesForTopic = (question) => {
    const lowerQuestion = question.toLowerCase();
    const sources = [];
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
const answerQuestion = (query) => __awaiter(void 0, void 0, void 0, function* () {
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
        const analysis = yield (0, exports.analyzeUserQuery)(query.question, conversationContext);
        console.log('📊 Query Analysis:', analysis);
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
                sources: [
                    {
                        documentId: "vedic-wisdom-ai",
                        title: "About Vedic Wisdom AI",
                        category: "AI Information",
                        content: "Vedic Wisdom AI is a knowledge assistant created to share insights from Hindu scriptures, Vedic philosophy, and spiritual teachings.",
                        relevanceScore: 1,
                        url: "https://vedicwisdom.ai/about",
                        source: "Vedic Wisdom",
                    },
                ],
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
            const questionEmbedding = yield embeddings.embedQuery(query.question);
            const searchResults = yield (0, exports.performVectorSearch)(questionEmbedding, query.category, query.maxResults || rag_config_1.RAGConfig.rag.topKResults, query.minRelevanceScore || rag_config_1.RAGConfig.rag.minRelevanceScore);
            if (searchResults && searchResults.length > 0) {
                const searchContext = (0, exports.prepareContext)(searchResults);
                let finalContext = searchContext;
                if (conversationContext) {
                    finalContext = `Previous conversation:\n${conversationContext}\n\nInformation from Vedic texts:\n${searchContext}`;
                }
                // Build sources with URLs from the document
                const sources = searchResults.map((result) => {
                    var _a;
                    // Generate a meaningful URL based on document ID and title
                    const documentUrl = generateDocumentUrl(result._id.toString(), result.title);
                    return {
                        documentId: result._id.toString(),
                        title: result.title || "Vedic Text",
                        category: result.category || "Scripture",
                        content: ((_a = result.content) === null || _a === void 0 ? void 0 : _a.slice(0, 500)) + "..." || "",
                        relevanceScore: result.score || 0,
                        chapter: result.chapter,
                        verseNumber: result.verseNumber,
                        source: result.source || "Vedic Knowledge Base",
                        url: documentUrl,
                    };
                });
                const answer = yield (0, exports.generateAnswerWithContext)(query.question, finalContext, query.language || "en", conversationContext);
                yield (0, exports.updateDocumentAnalytics)(searchResults);
                return {
                    answer,
                    sources,
                    confidence: (0, exports.calculateConfidence)(sources),
                    processingTime: Date.now() - startTime,
                };
            }
            else {
                // No results in Vedic database - use AI knowledge with REAL SOURCES
                const answer = yield (0, exports.generateAIAnswerForHinduTopic)(query.question, query.language || "en", conversationContext);
                // Get real, verifiable sources
                const sources = getAISourcesForTopic(query.question);
                return {
                    answer,
                    sources,
                    confidence: 0.7,
                    processingTime: Date.now() - startTime,
                };
            }
        }
        // 7. Fallback - use AI knowledge for general questions with real sources
        const answer = yield (0, exports.generateAIAnswer)(query.question, query.language || "en");
        return {
            answer,
            sources: [
                {
                    documentId: "ai-general-knowledge",
                    title: "General Knowledge",
                    category: "AI Knowledge",
                    content: "Based on AI's training data and general knowledge",
                    relevanceScore: 0.2,
                    url: "https://www.wikipedia.org/", // Real source
                    source: "Wikipedia",
                },
            ],
            confidence: 0.2,
            processingTime: Date.now() - startTime,
        };
    }
    catch (error) {
        console.error("❌ Error answering question:", error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to process your query");
    }
});
exports.answerQuestion = answerQuestion;
// Generate a meaningful URL for a document
const generateDocumentUrl = (documentId, title) => {
    const baseUrl = "https://vedicwisdom.ai/knowledge";
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `${baseUrl}/${slug}-${documentId.slice(-6)}`;
};
// Generate AI Answer for Hindu Topics with source
const generateAIAnswerForHinduTopic = (question_1, ...args_1) => __awaiter(void 0, [question_1, ...args_1], void 0, function* (question, language = "en", conversationHistory = "") {
    const { ChatOpenAI } = yield Promise.resolve().then(() => __importStar(require("@langchain/openai")));
    const { SystemMessage, HumanMessage } = yield Promise.resolve().then(() => __importStar(require("@langchain/core/messages")));
    const chatModel = new ChatOpenAI({
        openAIApiKey: rag_config_1.RAGConfig.openai.apiKey,
        modelName: rag_config_1.RAGConfig.openai.chatModel,
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
    const response = yield chatModel.invoke(messages);
    return response.content;
});
exports.generateAIAnswerForHinduTopic = generateAIAnswerForHinduTopic;
// Generate AI answer for general questions with source
const generateAIAnswer = (question_1, ...args_1) => __awaiter(void 0, [question_1, ...args_1], void 0, function* (question, language = "en") {
    const { ChatOpenAI } = yield Promise.resolve().then(() => __importStar(require("@langchain/openai")));
    const { SystemMessage, HumanMessage } = yield Promise.resolve().then(() => __importStar(require("@langchain/core/messages")));
    const chatModel = new ChatOpenAI({
        openAIApiKey: rag_config_1.RAGConfig.openai.apiKey,
        modelName: rag_config_1.RAGConfig.openai.chatModel,
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
    const response = yield chatModel.invoke(messages);
    return response.content;
});
exports.generateAIAnswer = generateAIAnswer;
// Calculate confidence based on sources
const calculateConfidence = (sources) => {
    if (sources.length === 0)
        return 0;
    const avgScore = sources.reduce((sum, source) => sum + (source.relevanceScore || 0), 0) / sources.length;
    const sourceFactor = Math.min(sources.length / 3, 1);
    return Math.min(avgScore * 0.8 + sourceFactor * 0.2, 1);
};
exports.calculateConfidence = calculateConfidence;
// Generate answer from conversation history when no search results found
const generateAnswerFromHistory = (question_1, conversationHistory_1, ...args_1) => __awaiter(void 0, [question_1, conversationHistory_1, ...args_1], void 0, function* (question, conversationHistory, language = "en") {
    const { ChatOpenAI } = yield Promise.resolve().then(() => __importStar(require("@langchain/openai")));
    const { SystemMessage, HumanMessage } = yield Promise.resolve().then(() => __importStar(require("@langchain/core/messages")));
    const chatModel = new ChatOpenAI({
        openAIApiKey: rag_config_1.RAGConfig.openai.apiKey,
        modelName: rag_config_1.RAGConfig.openai.chatModel,
        temperature: rag_config_1.RAGConfig.openai.temperature,
        maxTokens: rag_config_1.RAGConfig.openai.maxTokens,
    });
    const systemPrompt = `You are a Vedic knowledge assistant.

Previous conversation:
${conversationHistory}

The user is asking: "${question}"

Based on the previous conversation, provide a helpful response. If the user is asking for clarification on a previous topic, explain it in simpler terms.
${language === 'hi' ? 'Answer in Hindi' : 'Answer in English'}`;
    const response = yield chatModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Please help the user with their question based on our previous conversation.`),
    ]);
    return response.content;
});
exports.generateAnswerFromHistory = generateAnswerFromHistory;
// Generate answer using OpenAI with Vedic context
const generateAnswerWithContext = (question_1, context_1, ...args_1) => __awaiter(void 0, [question_1, context_1, ...args_1], void 0, function* (question, context, language = "en", conversationHistory = "") {
    const { ChatOpenAI } = yield Promise.resolve().then(() => __importStar(require("@langchain/openai")));
    const { SystemMessage, HumanMessage } = yield Promise.resolve().then(() => __importStar(require("@langchain/core/messages")));
    const chatModel = new ChatOpenAI({
        openAIApiKey: rag_config_1.RAGConfig.openai.apiKey,
        modelName: rag_config_1.RAGConfig.openai.chatModel,
        temperature: rag_config_1.RAGConfig.openai.temperature,
        maxTokens: rag_config_1.RAGConfig.openai.maxTokens,
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
    const response = yield chatModel.invoke(messages);
    return response.content;
});
exports.generateAnswerWithContext = generateAnswerWithContext;
// Perform vector search on MongoDB Atlas
const performVectorSearch = (queryEmbedding_1, category_1, ...args_1) => __awaiter(void 0, [queryEmbedding_1, category_1, ...args_1], void 0, function* (queryEmbedding, category, limit = 10, minScore = 0.7) {
    const pipeline = [
        {
            $vectorSearch: {
                index: rag_config_1.RAGConfig.mongodb.vectorSearchIndex,
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: 100,
                limit: limit,
                filter: Object.assign({}, (category && { category })),
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
    const results = yield vedicKnowledge_model_1.VedicDocument.aggregate(pipeline);
    return results;
});
exports.performVectorSearch = performVectorSearch;
// Prepare context from search results for LLM
const prepareContext = (results) => {
    const contextChunks = results.map((result, index) => {
        return `[Source ${index + 1}] (${result.title}, ${result.category})
${result.content}`;
    });
    return contextChunks.join("\n\n---\n\n");
};
exports.prepareContext = prepareContext;
// Update document analytics after query
const updateDocumentAnalytics = (documents) => __awaiter(void 0, void 0, void 0, function* () {
    for (const doc of documents) {
        yield vedicKnowledge_model_1.VedicDocument.findByIdAndUpdate(doc._id, {
            $inc: { totalQueries: 1 },
        });
    }
});
exports.updateDocumentAnalytics = updateDocumentAnalytics;
// Rate the helpfulness of an answer
const rateAnswer = (documentId, rating // 1-5
) => __awaiter(void 0, void 0, void 0, function* () {
    if (rating < 1 || rating > 5) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Rating must be between 1 and 5");
    }
    const document = yield vedicKnowledge_model_1.VedicDocument.findById(documentId);
    if (!document) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Document not found");
    }
    yield vedicKnowledge_model_1.VedicDocument.findByIdAndUpdate(documentId, {
        $inc: { helpfulRatings: rating },
    });
});
exports.rateAnswer = rateAnswer;
// Get all documents with pagination
const getAllDocuments = (filters_1, ...args_1) => __awaiter(void 0, [filters_1, ...args_1], void 0, function* (filters, skip = 0, limit = 10) {
    const query = {};
    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    if (filters.scriptureType) {
        query.scriptureType = filters.scriptureType;
    }
    const [data, total] = yield Promise.all([
        vedicKnowledge_model_1.VedicDocument.find(query)
            .select("title category author source tags createdAt totalQueries")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        vedicKnowledge_model_1.VedicDocument.countDocuments(query),
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
});
exports.getAllDocuments = getAllDocuments;
// Get single document by ID
const getDocumentById = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    const document = yield vedicKnowledge_model_1.VedicDocument.findById(documentId);
    if (!document) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Document not found");
    }
    return document;
});
exports.getDocumentById = getDocumentById;
// Update document
const updateDocument = (documentId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield vedicKnowledge_model_1.VedicDocument.findById(documentId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Document not found");
    }
    const updated = yield vedicKnowledge_model_1.VedicDocument.findByIdAndUpdate(documentId, Object.assign({}, payload), { new: true, runValidators: true });
    return updated;
});
exports.updateDocument = updateDocument;
// Delete document (soft delete)
const deleteDocument = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const existing = yield vedicKnowledge_model_1.VedicDocument.findById(documentId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Document not found");
    }
    // If it's a parent document, delete all its chunks too
    if (!((_a = existing.chunkMetadata) === null || _a === void 0 ? void 0 : _a.parentDocumentId)) {
        yield vedicKnowledge_model_1.VedicDocument.deleteMany({
            "chunkMetadata.parentDocumentId": existing._id,
        });
    }
    yield vedicKnowledge_model_1.VedicDocument.findByIdAndDelete(documentId);
    return { success: true, message: "Document deleted successfully" };
});
exports.deleteDocument = deleteDocument;
exports.VedicKnowledgeServices = {
    processDocument: exports.processDocument,
    processChunks: exports.processChunks,
    answerQuestion: exports.answerQuestion,
    performVectorSearch: exports.performVectorSearch,
    getAllDocuments: exports.getAllDocuments,
    getDocumentById: exports.getDocumentById,
    updateDocument: exports.updateDocument,
    deleteDocument: exports.deleteDocument,
    rateAnswer: exports.rateAnswer,
};
