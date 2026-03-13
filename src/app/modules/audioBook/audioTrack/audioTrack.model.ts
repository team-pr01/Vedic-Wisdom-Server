import { Schema, model } from "mongoose";
import { TAudioTrack } from "./audioTrack.interface";

const audioTrackSchema = new Schema<TAudioTrack>(
  {
    audioBookId: {
      type: Schema.Types.ObjectId,
      ref: "AudioBook",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

audioTrackSchema.index({ audioBookId: 1, order: 1 });

const AudioTrack = model<TAudioTrack>("AudioTrack", audioTrackSchema);

export default AudioTrack;