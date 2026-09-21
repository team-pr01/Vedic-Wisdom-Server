"use strict";
// src/modules/rag/rag.config.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRAGConfig = exports.RAGConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.RAGConfig = {
    // OpenAI Configuration
    openai: {
        apiKey: process.env.OPENAI_API_KEY || "",
        embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
        chatModel: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
        embeddingDimensions: 1536, // text-embedding-3-small
        maxTokens: 4096,
        temperature: 0.3,
    },
    // MongoDB Configuration
    mongodb: {
        vectorSearchIndex: process.env.MONGODB_ATLAS_VECTOR_SEARCH_INDEX || "vedic_documents_vector_index",
        connectionString: process.env.DB_URL || "",
        databaseName: process.env.DB_USER || "",
        collectionName: "vedicdocuments",
    },
    // RAG Configuration
    rag: {
        maxChunkSize: parseInt(process.env.RAG_MAX_CHUNK_SIZE || "1000"),
        overlapSize: parseInt(process.env.RAG_OVERLAP_SIZE || "200"),
        maxContextDocuments: parseInt(process.env.RAG_MAX_CONTEXT_DOCUMENTS || "5"),
        topKResults: parseInt(process.env.RAG_TOP_K_RESULTS || "10"),
        minRelevanceScore: parseFloat(process.env.RAG_MIN_RELEVANCE_SCORE || "0.7"),
    },
    // File Upload Configuration
    upload: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedMimeTypes: [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ],
        allowedExtensions: [".pdf", ".docx", ".txt"],
    },
};
// Validate required environment variables
const validateRAGConfig = () => {
    const required = [
        "OPENAI_API_KEY",
        "DB_URL",
        "MONGODB_ATLAS_VECTOR_SEARCH_INDEX",
    ];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
    return true;
};
exports.validateRAGConfig = validateRAGConfig;
exports.default = exports.RAGConfig;
