"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReportMantraSchema = new mongoose_1.Schema({
    bookId: { type: mongoose_1.Types.ObjectId, ref: "Books", required: true },
    textId: { type: mongoose_1.Types.ObjectId, ref: "BookText", required: true },
    originalText: { type: String, required: true },
    languageCode: { type: String, required: true },
    translation: { type: String, required: true },
    reason: { type: String, required: true },
    feedback: { type: String, required: true },
    status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
    isHumanVerified: { type: Boolean, default: false },
}, { timestamps: true });
const ReportMantra = (0, mongoose_1.model)("ReportMantra", ReportMantraSchema);
exports.default = ReportMantra;
