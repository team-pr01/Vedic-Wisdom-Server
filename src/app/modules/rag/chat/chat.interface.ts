/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from "mongoose";
import { Document } from "mongoose";

export interface IChatSource {
  fileType?: string;
  displayName?: string;
  pages?: string;
  location?: string;
  chapter?: string;
  subChapter?: string;
  section?: string;
}

export interface IChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    isSourceVerified?: boolean;
    sources?: IChatSource[];
}

export interface IChat extends Document {
    userId: ObjectId;
    title: string;
    messages: IChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}