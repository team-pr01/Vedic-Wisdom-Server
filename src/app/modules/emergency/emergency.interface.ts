import { Types } from "mongoose";

export type TEmergency = {
  userId: Types.ObjectId;
  name: string;
  phoneNumber: string;
  location: string;
  message: string;
  status?: "pending" | "processing" | "forwarded" | "resolved";
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};
