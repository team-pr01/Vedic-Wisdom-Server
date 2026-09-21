"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const audioBookSchema = new mongoose_1.Schema({
    thumbnailUrl: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },
    soldCount: {
        type: Number,
        default: 0,
    },
    isPremium: {
        type: Boolean,
        default: false,
        index: true,
    },
    coinPrice: {
        type: Number,
        required: function () {
            return this.isPremium === true;
        },
        min: 0,
    },
}, { timestamps: true });
/* TEXT SEARCH */
audioBookSchema.index({
    name: "text",
    description: "text",
});
audioBookSchema.index({ createdAt: -1 });
const AudioBook = (0, mongoose_1.model)("AudioBook", audioBookSchema);
exports.default = AudioBook;
