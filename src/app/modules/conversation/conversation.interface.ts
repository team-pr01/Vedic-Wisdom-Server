import { Types } from "mongoose";

export type TMessageRequestStatus = "pending" | "accepted" | "rejected" | "none";

export type TConversation = {
  _id?: Types.ObjectId;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  members: Types.ObjectId[];
  admins?: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  blockedBy?: Types.ObjectId[];
  
  messageRequestStatus: TMessageRequestStatus;
  requestedBy?: Types.ObjectId;
  
  createdAt?: Date;
  updatedAt?: Date;
};