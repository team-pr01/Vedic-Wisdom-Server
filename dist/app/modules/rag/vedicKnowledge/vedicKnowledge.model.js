"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-this-alias */
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
exports.VedicDocument = void 0;
// ==================== IMPORTS ====================
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
// ==================== TRANSLATION SCHEMA ====================
const VedicTranslationSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String },
    language: {
        type: String,
        required: true
    },
}, { _id: false });
// ==================== MAIN DOCUMENT SCHEMA ====================
const VedicDocumentSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    subCategory: { type: String, trim: true },
    content: {
        type: String,
        required: true
    },
    contentHash: {
        type: String,
        unique: true, // Prevents duplicate uploads
        required: true
    },
    translations: {
        type: Map,
        of: VedicTranslationSchema,
    },
    author: { type: String, trim: true },
    source: { type: String, trim: true },
    publishedDate: { type: Date },
    tags: { type: [String], default: [], index: true },
    scriptureType: {
        type: String
    },
    chapter: { type: String, trim: true },
    verseNumber: { type: String, trim: true },
    // 🔥 CRITICAL: Vector embedding field for Atlas Vector Search
    embedding: {
        type: [Number],
        required: true,
        default: []
    },
    chunkMetadata: {
        chunkIndex: { type: Number, required: true },
        totalChunks: { type: Number, required: true },
        parentDocumentId: {
            type: mongoose_1.Types.ObjectId,
            ref: "VedicDocument"
        },
    },
    totalQueries: { type: Number, default: 0 },
    helpfulRatings: { type: Number, default: 0 },
    averageHelpfulness: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    processedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// ==================== INDEXES ====================
// 1️⃣ Text search index (for keyword search)
VedicDocumentSchema.index({ title: "text", content: "text", tags: "text" }, { weights: { title: 10, tags: 5, content: 1 } });
// 2️⃣ Compound indexes for common queries
VedicDocumentSchema.index({ category: 1, isActive: 1, createdAt: -1 });
VedicDocumentSchema.index({ scriptureType: 1, category: 1 });
VedicDocumentSchema.index({ "chunkMetadata.parentDocumentId": 1 });
// 3️⃣ For duplicate detection
VedicDocumentSchema.index({ contentHash: 1 });
// 4️⃣ For analytics
VedicDocumentSchema.index({ totalQueries: -1, createdAt: -1 });
// 5️⃣ Vector Search Index (IMPORTANT for MongoDB Atlas)
// Create this in MongoDB Atlas UI or via command
// This is just documentation, not actual code
/*
db.vedicdocuments.createSearchIndex({
  name: "vector_index",
  type: "vectorSearch",
  definition: {
    fields: [{
      type: "vector",
      path: "embedding",
      numDimensions: 1536, // For OpenAI text-embedding-3-small
      similarity: "cosine"
    }]
  }
});
*/
// ==================== VIRTUAL PROPERTIES ====================
VedicDocumentSchema.virtual("isChunk").get(function () {
    var _a;
    return !!((_a = this.chunkMetadata) === null || _a === void 0 ? void 0 : _a.parentDocumentId);
});
VedicDocumentSchema.virtual("helpfulnessScore").get(function () {
    if (this.totalQueries === 0)
        return 0;
    return this.helpfulRatings / this.totalQueries;
});
// ==================== PRE-SAVE HOOK ====================
VedicDocumentSchema.pre("save", function (next) {
    const doc = this;
    // Auto-generate content hash if not provided
    if (!doc.contentHash && doc.content) {
        doc.contentHash = crypto_1.default
            .createHash("sha256")
            .update(doc.content)
            .digest("hex");
    }
    // Ensure embedding field is initialized
    if (!doc.embedding || doc.embedding.length === 0) {
        doc.embedding = [];
    }
    next();
});
// ==================== POST-SAVE HOOK (for logging) ====================
VedicDocumentSchema.post("save", function (doc) {
    // You can add logging or analytics here
    console.log(`📄 Vedic document saved: ${doc.title} (${doc.category})`);
});
// ==================== STATIC METHODS ====================
// Find similar documents using vector search
VedicDocumentSchema.statics.findSimilarDocuments = function (category, content) {
    return __awaiter(this, void 0, void 0, function* () {
        // Will be implemented with vector search
        return this.find({
            category,
            content: { $regex: content.slice(0, 100), $options: "i" }
        }).limit(5);
    });
};
// ==================== MODEL ====================
const VedicDocument = (0, mongoose_1.model)("VedicDocument", VedicDocumentSchema);
exports.VedicDocument = VedicDocument;
