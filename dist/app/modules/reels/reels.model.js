"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReelsSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videoSource: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    likes: { type: Number, default: 0, required: false },
    likedBy: [{ type: mongoose_1.Types.ObjectId, ref: "User" }],
}, {
    timestamps: true,
});
const Reels = (0, mongoose_1.model)("Reels", ReelsSchema);
exports.default = Reels;
