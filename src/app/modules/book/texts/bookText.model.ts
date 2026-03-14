import { Schema, model, Types } from "mongoose";
import { TBookText, TSanskritWord, TTranslation } from "./bookText.interface";

const SanskritWordSchema = new Schema<TSanskritWord>(
  {
    sanskritWord: { type: String, required: true, trim: true },
    shortMeaning: { type: String, required: true, trim: true },
    descriptiveMeaning: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const TranslationSchema = new Schema<TTranslation>(
  {
    langCode: { type: String, required: true, trim: true },
    translation: { type: String, required: true, trim: true },
    sanskritWordBreakdown: [SanskritWordSchema],
    isHumanVerified : { type: Boolean, default: false },
  },
  { _id: false }
);

const BookTextSchema = new Schema<TBookText>(
  {
    bookId: { type: Types.ObjectId, ref: "Books", required: true },
    location: [
      {
        levelName: { type: String, required: true },
        value: { type: String, required: true, trim: true },
      },
    ],
    originalText: { type: String, required: true, trim: true },
    primaryTranslation: { type: String, required: true, trim: true },
    translations: { type: [TranslationSchema], default: [] },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const BookText = model<TBookText>("BookText", BookTextSchema);
export default BookText;
