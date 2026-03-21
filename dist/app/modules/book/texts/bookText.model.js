"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SanskritWordSchema = new mongoose_1.Schema({
    sanskritWord: { type: String, required: true, trim: true },
    shortMeaning: { type: String, required: true, trim: true },
    descriptiveMeaning: { type: String, required: true, trim: true },
}, { _id: false });
const TranslationSchema = new mongoose_1.Schema({
    langCode: { type: String, required: true, trim: true },
    translation: { type: String, required: true, trim: true },
    sanskritWordBreakdown: [SanskritWordSchema],
    isHumanVerified: { type: Boolean, default: false },
}, { _id: false });
const BookTextSchema = new mongoose_1.Schema({
    bookId: { type: mongoose_1.Types.ObjectId, ref: "Books", required: true },
    location: [
        {
            levelName: { type: String, required: true },
            value: { type: String, required: true, trim: true },
        },
    ],
    originalText: { type: String, required: true, trim: true },
    primaryTranslation: { type: String, required: true, trim: true },
    translations: { type: [TranslationSchema], default: [] },
    tags: { type: [String], default: [] },
}, { timestamps: true });
const BookText = (0, mongoose_1.model)("BookText", BookTextSchema);
exports.default = BookText;
