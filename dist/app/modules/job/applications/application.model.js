"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/* ---------------- SCHEMA ---------------- */
const applicationSchema = new mongoose_1.Schema({
    jobId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["applied", "withdrawn", "shortlisted", "hired", "rejected"],
        default: "applied",
        index: true,
    },
    selectedCandidate: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    resume: {
        type: String,
        required: true,
        trim: true,
    },
    noteFromApplicant: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
/* ---------------- INDEXES ---------------- */
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });
applicationSchema.index({ createdAt: -1 });
const Application = (0, mongoose_1.model)("Application", applicationSchema);
exports.default = Application;
