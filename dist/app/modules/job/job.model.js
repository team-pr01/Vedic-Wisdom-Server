"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/* ---------------- SALARY ---------------- */
const salarySchema = new mongoose_1.Schema({
    minimum: {
        type: Number,
        required: true,
        default: null
    },
    maximum: {
        type: Number,
        required: true,
        default: null
    },
    currency: {
        type: String,
        required: true,
        default: null
    },
}, { _id: false });
/* ---------------- LOCATION ---------------- */
const locationSchema = new mongoose_1.Schema({
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });
/* ---------------- SOCIAL MEDIA ---------------- */
const socialMediaSchema = new mongoose_1.Schema({
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true },
}, { _id: false });
/* ---------------- COMPANY ---------------- */
const companySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String,
        trim: true
    },
    location: locationSchema,
    description: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    socialMedia: socialMediaSchema,
    tradeLicense: {
        type: String,
        trim: true
    },
}, { _id: false });
/* ---------------- JOB SCHEMA ---------------- */
const jobSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    location: locationSchema,
    jobType: {
        type: String,
        enum: ["fullTime", "partTime", "internship", "contractual", "freelance"],
        required: true,
        index: true,
    },
    workMode: {
        type: String,
        enum: ["hybrid", "remote", "onsite"],
        required: true,
        index: true,
    },
    educationLevel: {
        type: String,
        required: true,
        index: true,
    },
    experienceLevel: {
        type: String,
        required: true,
        index: true,
    },
    salary: salarySchema,
    responsibilities: {
        type: [String],
        required: true,
        default: [],
    },
    requiredSkills: {
        type: String,
        required: true,
    },
    qualifications: {
        type: [String],
        required: true,
        default: [],
    },
    applicationDeadline: {
        type: Date,
        required: true,
        index: true,
    },
    vacancy: {
        type: Number,
        required: true,
        min: 1,
    },
    applicationCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    applications: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "Application",
        default: [],
    },
    company: companySchema,
    status: {
        type: String,
        enum: ["pending", "rejected", "active", "closed"],
        default: "pending",
        index: true,
    },
    postedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});
/* ---------------- INDEXES ---------------- */
// Text search indexes
jobSchema.index({ title: "text", description: "text" });
// Compound indexes for common queries
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ jobType: 1, status: 1 });
jobSchema.index({ workMode: 1, status: 1 });
jobSchema.index({ experienceLevel: 1, status: 1 });
// Location indexes
jobSchema.index({ "location.city": 1, status: 1 });
jobSchema.index({ "location.state": 1, status: 1 });
jobSchema.index({ "location.country": 1, status: 1 });
// Deadline indexes
jobSchema.index({ applicationDeadline: 1, status: 1 });
// PostedBy index
jobSchema.index({ postedBy: 1, createdAt: -1 });
/* ---------------- MODEL ---------------- */
const Job = (0, mongoose_1.model)("Job", jobSchema);
exports.default = Job;
