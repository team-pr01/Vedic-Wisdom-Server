"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrls: {
        type: [String],
        default: [],
    },
    rating: {
        type: Number,
        default: 0,
    },
    soldCount: {
        type: Number,
        default: 0,
    },
    priceCurrency: {
        type: String,
        default: "INR",
    },
    basePrice: {
        type: Number,
        required: true,
    },
    discountedPrice: {
        type: Number,
    },
    totalClicks: {
        type: Number,
        default: 0,
    },
    addedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});
/* TEXT SEARCH INDEX */
productSchema.index({
    name: "text",
    description: "text",
    category: "text",
});
productSchema.index({ addedBy: 1 });
productSchema.index({ category: 1 });
const Product = (0, mongoose_1.model)("Product", productSchema);
exports.default = Product;
