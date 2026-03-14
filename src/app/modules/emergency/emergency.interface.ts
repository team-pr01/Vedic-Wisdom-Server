import { Types } from "mongoose";

export type TEmergency = {
  userId: Types.ObjectId;
  phoneNumber: string;
  location: string;
  message: string;
  status?: "pending" | "processing" | "resolved";
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};
