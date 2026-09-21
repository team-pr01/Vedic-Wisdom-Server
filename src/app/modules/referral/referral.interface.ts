import { ObjectId } from "mongoose";

export type TReferral = {
  referrer: ObjectId;
  referredUser: ObjectId;
  rank: number;
  createdAt?: Date;
  updatedAt?: Date;
};