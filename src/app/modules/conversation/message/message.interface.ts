import { ObjectId } from "mongoose";

export type TMessage = {
  _id?: ObjectId;
  conversationId: ObjectId;
  sender: ObjectId;
  text: string;
  readBy: ObjectId[];
  deleteAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};