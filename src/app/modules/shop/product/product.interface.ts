import { ObjectId } from "mongoose";

export type TProduct = {
  vendorId: ObjectId;

  name: string;
  category: string;

  imageUrls: string[];

  rating?: number;
  soldCount?: number;

  priceCurrency: string;

  basePrice: number;
  discountedPrice?: number;

  totalViews?: number;
  totalClicks?: number;

  createdAt?: Date;
  updatedAt?: Date;
};