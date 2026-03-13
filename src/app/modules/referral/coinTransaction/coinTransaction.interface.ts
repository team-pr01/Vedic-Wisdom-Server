import { ObjectId } from "mongoose";

export type TCoinTransaction = {
  userId: ObjectId;
  coins: number;
  type: "REFERRAL" | "DEPOSIT";
  referenceId?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};