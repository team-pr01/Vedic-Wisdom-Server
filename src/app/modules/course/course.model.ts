import { Schema, model } from "mongoose";
import { TCourse } from "./course.interface";

const courseSchema = new Schema<TCourse>(
  {
    thumbnail: { type: String },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, lowercase: true, trim: true },
    duration: { type: String, required: true },
    courseUrl: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// For text search
courseSchema.index({ title: "text", category: "text" });

const Course = model<TCourse>("Course", courseSchema);
export default Course;