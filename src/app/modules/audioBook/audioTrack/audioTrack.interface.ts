import { ObjectId } from "mongoose";

export type TAudioTrack = {
  audioBookId: ObjectId;
  title: string;
  url: string;
  duration: string;
  order: number;

  createdAt?: Date;
  updatedAt?: Date;
};