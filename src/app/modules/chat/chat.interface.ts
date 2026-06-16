import { ObjectId } from "mongoose";

export type TChat = {
  participants: ObjectId[];
  lastMessage?: ObjectId;
  lastMessageAt?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};