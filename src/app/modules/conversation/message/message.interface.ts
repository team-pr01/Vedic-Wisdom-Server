import { ObjectId } from "mongoose";

export type TMessage = {
  _id?: ObjectId;
  conversationId: ObjectId;
  sender: ObjectId;
  text: string;
  readBy: ObjectId[];
  deleteAt?: Date | null;
  isSystemMessage?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};