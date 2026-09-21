import { Schema, model } from "mongoose";
import { TCounter } from "./counter.interface";

const counterSchema = new Schema<TCounter>({
  id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = model<TCounter>("Counter", counterSchema);