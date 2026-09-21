import { ObjectId } from "mongoose";
import { Document } from "mongoose";

export interface IVedicTranslation {
    title: string;
    content: string;
    summary?: string;
    language: string; // English, Hindi, Sanskrit
}

export interface IVedicDocument extends Document {
    // Core document info
    title: string;
    category: string;
    subCategory?: string;

    // Content
    content: string; // Full text content
    contentHash: string; // For duplicate detection

    // Translations (multi-language support)
    translations?: Map<string, IVedicTranslation>;

    // Metadata
    author?: string;
    source?: string; // Book name, scripture name
    publishedDate?: Date;
    tags: string[];

    // Vedic specific fields
    scriptureType?: string;
    chapter?: string;
    verseNumber?: string;

    // For RAG - Vector embeddings
    embedding: number[]; // OpenAI embedding (1536 dimensions)
    chunkMetadata: {
        chunkIndex: number;
        totalChunks: number;
        parentDocumentId: ObjectId; // If this is a chunk
    };

    // Stats
    totalQueries: number;
    helpfulRatings: number;
    averageHelpfulness: number;

    // Admin controls
    isActive: boolean;
    isFeatured: boolean;
    processedAt: Date;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// For creating new documents
export interface ICreateVedicDocument {
    title: string;
    category: string;
    subCategory ?: string;
    content: string;
    author?: string;
    source?: string;
    tags?: string[];
    scriptureType?: IVedicDocument["scriptureType"];
    chapter?: string;
    verseNumber?: string;
    translations?: Map<string, IVedicTranslation>;
}

// For chunking
export interface IVedicChunk {
    content: string;
    metadata: {
        documentId: ObjectId;
        title: string;
        category: string;
        chapter?: string;
        verseNumber?: string;
        chunkIndex: number;
        totalChunks: number;
    };
}