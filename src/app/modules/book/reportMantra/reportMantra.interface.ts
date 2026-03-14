import { ObjectId } from "mongoose";

export type TReportMantra = {
  bookId: ObjectId;
  textId: ObjectId;
  originalText: string;
  languageCode: string;
  translation: string;
  reason : string;
  feedback : string;
  status : "pending" | "resolved" | "dismissed";
  isHumanVerified?: boolean;
};
