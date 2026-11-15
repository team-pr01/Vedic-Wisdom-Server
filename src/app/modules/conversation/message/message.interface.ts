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
  deliveredTo?: { userId: ObjectId; deliveredAt: Date }[];
  deleteAt?: Date | null;
  isSystemMessage?: boolean;
  reactions?: TReaction[];
  replyTo?: ObjectId;
  mentions?: ObjectId[];
  deletedFor: ObjectId[];
  isDeletedForEveryone: boolean;
  isEdited?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};