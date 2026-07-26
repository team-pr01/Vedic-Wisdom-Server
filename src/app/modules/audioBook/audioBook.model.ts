import { Schema, model } from "mongoose";
import { TAudioBook } from "./audioBook.interface";

const audioBookSchema = new Schema<TAudioBook>(
  {
    thumbnailUrl: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    soldCount: {
      type: Number,
      default: 0,
    },

    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },

    coinPrice: {
      type: Number,
      required: function (this: TAudioBook) {
        return this.isPremium === true;
      },
      min: 0,
    },
  },
  { timestamps: true }
);

/* TEXT SEARCH */
audioBookSchema.index({
  name: "text",
  description: "text",
});

audioBookSchema.index({ createdAt: -1 });

const AudioBook = model<TAudioBook>("AudioBook", audioBookSchema);

export default AudioBook;