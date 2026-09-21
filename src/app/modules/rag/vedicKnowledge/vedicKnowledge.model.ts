/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-this-alias */

// ==================== IMPORTS ====================
import { Schema, Types, model } from "mongoose";
import { IVedicDocument, IVedicTranslation } from "./vedicKnowledge.interface";
import crypto from "crypto";

// ==================== TRANSLATION SCHEMA ====================
const VedicTranslationSchema = new Schema<IVedicTranslation>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String },
    language: {
      type: String,
      required: true
    },
  },
  { _id: false }
);

// ==================== MAIN DOCUMENT SCHEMA ====================
const VedicDocumentSchema = new Schema<IVedicDocument>(
  {
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
        type: Types.ObjectId,
        ref: "VedicDocument"
      },
    },

    totalQueries: { type: Number, default: 0 },
    helpfulRatings: { type: Number, default: 0 },
    averageHelpfulness: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false, index: true },
    processedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================

// 1️⃣ Text search index (for keyword search)
VedicDocumentSchema.index(
  { title: "text", content: "text", tags: "text" },
  { weights: { title: 10, tags: 5, content: 1 } }
);

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
  return !!this.chunkMetadata?.parentDocumentId;
});

VedicDocumentSchema.virtual("helpfulnessScore").get(function () {
  if (this.totalQueries === 0) return 0;
  return this.helpfulRatings / this.totalQueries;
});

// ==================== PRE-SAVE HOOK ====================

VedicDocumentSchema.pre<IVedicDocument>("save", function (next) {
  const doc = this;

  // Auto-generate content hash if not provided
  if (!doc.contentHash && doc.content) {
    doc.contentHash = crypto
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

VedicDocumentSchema.post<IVedicDocument>("save", function (doc) {
  // You can add logging or analytics here
  console.log(`📄 Vedic document saved: ${doc.title} (${doc.category})`);
});

// ==================== STATIC METHODS ====================

// Find similar documents using vector search
VedicDocumentSchema.statics.findSimilarDocuments = async function (
  category: string,
  content: string
) {
  // Will be implemented with vector search
  return this.find({
    category,
    content: { $regex: content.slice(0, 100), $options: "i" }
  }).limit(5);
};

// ==================== MODEL ====================

const VedicDocument = model<IVedicDocument>("VedicDocument", VedicDocumentSchema);

// ==================== EXPORTS ====================
export type VedicDocumentModel = typeof VedicDocument;
export { VedicDocument };