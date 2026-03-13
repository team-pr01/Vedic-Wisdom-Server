import { ObjectId } from "mongoose";

export type TVendor = {
  userId: ObjectId;

  name: string;
  shopName: string;
  phoneNumber: string;
  email: string;
  documentUrls: string[];
  businessAddress: string;
  description: string;
  shopUrl: string;
  status: "applied" | "suspended" | "approved" | "rejected";
  suspensionReason?: string;
  suspendedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};