import { ObjectId } from "mongoose";

export type TNewsTranslation = {
  title: string;
  content: string;
  tags: string[];
};

export type TNews = {
  imageUrl: string;
  translations: Map<string, TNewsTranslation>;
   category: string;
  likes?: number;
  likedBy?: ObjectId[];
  views?: number;
  viewedBy?: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
};