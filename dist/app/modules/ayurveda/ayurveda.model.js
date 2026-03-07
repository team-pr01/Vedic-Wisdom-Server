"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ayurvedaSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    videoSource: {
        type: String,
        required: true,
        trim: true,
    },
    videoUrl: {
        type: String,
        required: true,
        trim: true,
    },
    duration: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
// Text search
ayurvedaSchema.index({ title: "text", category: "text" });
const Ayurveda = (0, mongoose_1.model)("Ayurveda", ayurvedaSchema);
exports.default = Ayurveda;
