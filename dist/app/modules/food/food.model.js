"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Food = void 0;
const mongoose_1 = require("mongoose");
const FoodSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: "text",
    },
    category: {
        type: String,
        required: true,
        index: true,
    },
    videoSource: {
        type: String,
        enum: ["youtube", "facebook"],
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
}, { timestamps: true });
// Additional indexes
FoodSchema.index({ createdAt: -1 });
FoodSchema.index({ category: 1 });
exports.Food = (0, mongoose_1.model)("Food", FoodSchema);
