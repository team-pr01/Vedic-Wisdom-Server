
export interface IRAGQuery {
  question: string;
  language?: string;
  category?: string;
  maxResults?: number;
  minRelevanceScore?: number;
  history?: {
    role: "user" | "assistant";
    content: string;
  }[];
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
  url?: string;
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