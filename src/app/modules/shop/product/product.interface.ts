import { ObjectId } from "mongoose";

export type TProduct = {
  name: string;
  category: string;
  description: string;
  imageUrls: string[];
  rating?: number;
  soldCount?: number;
  priceCurrency: string;
  basePrice: number;
  discountedPrice?: number;
  totalClicks?: number;
  addedBy: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};