import { Types } from "mongoose";

export type TItemType = "book" | "audioBook";

export interface TSavedItem {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  itemId: Types.ObjectId;
  itemType: TItemType;
  createdAt?: Date;
  updatedAt?: Date;
}