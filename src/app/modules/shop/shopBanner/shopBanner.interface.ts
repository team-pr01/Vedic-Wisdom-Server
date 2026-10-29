// interfaces/shopBanner.interface.ts
import { Types } from "mongoose";

export interface TShopBanner {
  _id: Types.ObjectId;
  title: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}