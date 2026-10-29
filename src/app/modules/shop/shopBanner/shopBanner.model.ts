// models/shopBanner.model.ts
import { Schema, model } from "mongoose";
import { TShopBanner } from "./shopBanner.interface";

const ShopBannerSchema = new Schema<TShopBanner>(
  {
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
  },
  {
    timestamps: true,
  }
);

// Index for fetching active banners quickly
ShopBannerSchema.index({ isActive: 1, createdAt: -1 });

export const ShopBanner = model<TShopBanner>("ShopBanner", ShopBannerSchema);