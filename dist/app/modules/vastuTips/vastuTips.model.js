"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VastuTips = void 0;
const mongoose_1 = require("mongoose");
const VastuTipsSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: "text", // for search
    },
    category: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true, // for filtering
    },
    tips: {
        type: [String],
        required: true,
        validate: [
            (arr) => arr.length > 0,
            "At least one tip is required",
        ],
    },
}, {
    timestamps: true,
});
// Sorting optimization
VastuTipsSchema.index({ createdAt: -1 });
VastuTipsSchema.index({ category: 1, createdAt: -1 });
exports.VastuTips = (0, mongoose_1.model)("VastuTips", VastuTipsSchema);
