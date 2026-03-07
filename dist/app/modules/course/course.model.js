"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const courseSchema = new mongoose_1.Schema({
    thumbnail: { type: String },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, lowercase: true, trim: true },
    duration: { type: String, required: true },
    courseUrl: { type: String, required: true },
}, {
    timestamps: true,
});
// For text search
courseSchema.index({ title: "text", category: "text" });
const Course = (0, mongoose_1.model)("Course", courseSchema);
exports.default = Course;
