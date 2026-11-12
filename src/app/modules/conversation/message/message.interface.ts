import { ObjectId } from "mongoose";

export type TReaction = {
  emoji: string;
  userId: ObjectId;
  userName: string;
};

export type TMessage = {
  _id?: ObjectId;
  conversationId: ObjectId;
  sender: ObjectId;
  text: string;
  readBy: ObjectId[];
  deleteAt?: Date | null;
  isSystemMessage?: boolean;
  reactions?: TReaction[];
  mentions?: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
};