import { ObjectId } from "mongoose";

export type TAudioBookPurchase = {
  _id: ObjectId;
  userId: ObjectId;
  audioBookId: ObjectId;
  coinPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}