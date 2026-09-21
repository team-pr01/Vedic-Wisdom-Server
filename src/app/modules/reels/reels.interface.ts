import { ObjectId } from "mongoose";

export type TReels = {
  title: string;
  description: string;
  videoSource: string;
  videoUrl: string;
  category: string;
  likes?: number;
  likedBy?: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
};