import { Schema, Types, model } from "mongoose";
import { TNews, TNewsTranslation } from "./news.interface";

const NewsTranslationSchema = new Schema<TNewsTranslation>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  { _id: false }
);

const NewsSchema = new Schema<TNews>(
  {
    imageUrl: { type: String, required: true },
    translations: {
      type: Map,
      of: NewsTranslationSchema,
      required: true,
    },
    category: { type: String, required: true },
    likes: { type: Number, default: 0, required: false },
    likedBy: [{ type: Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0, required: false },
    viewedBy: [{ type: Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// TEXT INDEX
NewsSchema.index({
  "translations.en.title": "text",
  "translations.en.content": "text",
  "translations.en.tags": "text",
  category: "text",
});

// Sorting optimization
NewsSchema.index({ createdAt: -1 });
NewsSchema.index({ category: 1, createdAt: -1 });

const News = model<TNews>("News", NewsSchema);
export default News;
