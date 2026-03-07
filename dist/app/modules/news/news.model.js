"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NewsTranslationSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
}, { _id: false });
const NewsSchema = new mongoose_1.Schema({
    imageUrl: { type: String, required: true },
    translations: {
        type: Map,
        of: NewsTranslationSchema,
        required: true,
    },
    category: { type: String, required: true },
    likes: { type: Number, default: 0, required: false },
    likedBy: [{ type: mongoose_1.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0, required: false },
    viewedBy: [{ type: mongoose_1.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
// TEXT INDEX
NewsSchema.index({
    title: "text",
    description: "text",
    category: "text",
    tags: "text",
});
// Sorting optimization
NewsSchema.index({ createdAt: -1 });
NewsSchema.index({ category: 1, createdAt: -1 });
const News = (0, mongoose_1.model)("News", NewsSchema);
exports.default = News;
