import { ObjectId } from "mongoose";

export type TNewsTranslation = {
  title: string;
  overview: string;
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
  isTrending : boolean;
  createdAt?: Date;
  updatedAt?: Date;
};