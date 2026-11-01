"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopBanner = void 0;
// models/shopBanner.model.ts
const mongoose_1 = require("mongoose");
const ShopBannerSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true,
    },
    link: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, {
    timestamps: true,
});
// Index for fetching active banners quickly
ShopBannerSchema.index({ isActive: 1, createdAt: -1 });
exports.ShopBanner = (0, mongoose_1.model)("ShopBanner", ShopBannerSchema);
