import { ObjectId } from "mongoose";

export type TConversation = {
  _id?: ObjectId;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  members: ObjectId[];
  admins?: ObjectId[];
  lastMessage?: ObjectId;
  blockedBy?: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
};