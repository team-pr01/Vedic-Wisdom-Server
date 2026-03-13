import { Schema, model } from "mongoose";
import { TProduct } from "./product.interface";

const productSchema = new Schema<TProduct>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

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

const Product = model<TProduct>("Product", productSchema);

export default Product;