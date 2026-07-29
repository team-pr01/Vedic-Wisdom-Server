// src/modules/rag/rag.types.ts

export interface IRAGQuery {
  question: string;
  language?: "en" | "hi" | "sa";
  category?: string;
  maxResults?: number;
  minRelevanceScore?: number;
}

export interface IRAGResponse {
  answer: string;
  sources: IRAGSource[];
  confidence: number;
  totalTokens?: number;
  processingTime?: number;
}

export interface IRAGSource {
  documentId: string;
  title: string;
  category: string;
  content: string;
  relevanceScore: number;
  chapter?: string;
  verseNumber?: string;
  source?: string;
}

export interface IDocumentProcessingResult {
  documentId: string;
  title: string;
  totalChunks: number;
  embeddingDimension: number;
  processedAt: Date;
  success: boolean;
  error?: string;
}

export interface IEmbeddingOptions {
  model: string;
  dimensions: number;
  encodingFormat: "float" | "base64";
}