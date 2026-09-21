"use strict";
// src/modules/rag/vedicKnowledge/vedicKnowledge.constants.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.VEDIC_DOCUMENT_STATUS = exports.RAG_CONFIG = exports.SUPPORTED_LANGUAGES = exports.SCRIPTURE_TYPES = exports.VEDIC_CATEGORIES = void 0;
exports.VEDIC_CATEGORIES = {
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
};
exports.SCRIPTURE_TYPES = {
    SHLOKA: "shloka",
    VERSE: "verse",
    SUTRA: "sutra",
    RECIPE: "recipe",
    DISCOURSE: "discourse",
};
exports.SUPPORTED_LANGUAGES = {
    ENGLISH: "en",
    HINDI: "hi",
    SANSKRIT: "sa",
};
exports.RAG_CONFIG = {
    MAX_CHUNK_SIZE: 1000,
    OVERLAP_SIZE: 200,
    MAX_CONTEXT_DOCUMENTS: 5,
    TOP_K_RESULTS: 10,
    MIN_RELEVANCE_SCORE: 0.7,
};
exports.VEDIC_DOCUMENT_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    PROCESSING: "processing",
    FAILED: "failed",
};
