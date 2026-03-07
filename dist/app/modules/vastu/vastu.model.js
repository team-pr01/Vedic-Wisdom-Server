"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VastuSchema = new mongoose_1.Schema({
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
        index: true
    },
    videoSource: {
        type: String,
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
    viewsCount: {
        type: Number,
        default: 0,
        index: true,
    },
    viewedBy: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});
VastuSchema.index({ createdAt: -1 });
VastuSchema.index({ category: 1, createdAt: -1 });
const Vastu = (0, mongoose_1.model)("Vastu", VastuSchema);
exports.default = Vastu;
