import { Schema, model } from "mongoose";
import { TProduct } from "./product.interface";

const productSchema = new Schema<TProduct>(
  {
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* TEXT SEARCH INDEX */
productSchema.index({
  name: "text",
  description: "text",
  category: "text",
});

productSchema.index({ addedBy: 1 });
productSchema.index({ category: 1 });

const Product = model<TProduct>("Product", productSchema);

export default Product;