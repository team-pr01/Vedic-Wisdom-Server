// src/modules/rag/vedicKnowledge/vedicKnowledge.constants.ts

export const VEDIC_CATEGORIES = {
  SCRIPTURES: "scriptures",
  VEDIC_RECIPES: "vedic_recipes",
  AYURVEDA: "ayurveda",
  VEDIC_BOOKS: "vedic_books",
  SPIRITUAL_DISCOURSES: "spiritual_discourses",
  PURANAS: "puranas",
  UPANISHADS: "upanishads",
  MANTRAS: "mantras",
  YOGA: "yoga",
  MEDITATION: "meditation",
  VEDIC_ASTROLOGY: "vedic_astrology",
} as const;

export const SCRIPTURE_TYPES = {
  SHLOKA: "shloka",
  VERSE: "verse",
  SUTRA: "sutra",
  RECIPE: "recipe",
  DISCOURSE: "discourse",
} as const;

export const SUPPORTED_LANGUAGES = {
  ENGLISH: "en",
  HINDI: "hi",
  SANSKRIT: "sa",
} as const;

export const RAG_CONFIG = {
  MAX_CHUNK_SIZE: 1000,
  OVERLAP_SIZE: 200,
  MAX_CONTEXT_DOCUMENTS: 5,
  TOP_K_RESULTS: 10,
  MIN_RELEVANCE_SCORE: 0.7,
} as const;

export const VEDIC_DOCUMENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PROCESSING: "processing",
  FAILED: "failed",
} as const;