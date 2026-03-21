"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/* ---------------- SALARY ---------------- */
const salarySchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["paid", "unpaid"],
        required: true,
    },
    minimum: Number,
    maximum: Number,
    currency: String,
}, { _id: false });
/* ---------------- LOCATION ---------------- */
const locationSchema = new mongoose_1.Schema({
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
}, { _id: false });
/* ---------------- SOCIAL MEDIA ---------------- */
const socialMediaSchema = new mongoose_1.Schema({
    facebook: String,
    instagram: String,
    linkedin: String,
}, { _id: false });
/* ---------------- COMPANY ---------------- */
const companySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    logo: String,
    location: locationSchema,
    description: String,
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    website: String,
    socialMedia: socialMediaSchema,
    tradeLicense: String,
}, { _id: false });
/* ---------------- INDIVIDUAL ---------------- */
const individualSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    identityNumber: { type: String, required: true },
    identityDocument: String,
}, { _id: false });
/* ---------------- BASE JOB ---------------- */
const jobSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: locationSchema,
    jobType: {
        type: String,
        enum: ["fullTime", "partTime", "internship", "contractual", "freelance"],
        required: true,
    },
    workMode: {
        type: String,
        enum: ["hybrid", "remote", "onsite"],
        required: true,
    },
    experienceLevel: {
        type: String,
        required: true,
    },
    salary: salarySchema,
    responsibilities: [{ type: String, required: true }],
    qualification: [{ type: String, required: true }],
    benefits: [String],
    applicationDeadline: { type: Date, required: true },
    applicationCount: { type: Number, default: 0 },
    applications: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Application" }],
    status: {
        type: String,
        enum: ["pending", "rejected", "active", "closed"],
        default: "pending",
    },
    /* Discriminator Key */
    hiringType: {
        type: String,
        enum: ["company", "individual"],
        required: true,
    },
    /* These are conditionally required */
    company: companySchema,
    individual: individualSchema,
    postedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true,
    discriminatorKey: "hiringType",
});
/* ---------------- INDEXES ---------------- */
jobSchema.index({ title: "text", description: "text" });
jobSchema.index({ status: 1 });
jobSchema.index({ "location.city": 1 });
jobSchema.index({ "location.state": 1 });
jobSchema.index({ "location.country": 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ experienceLevel: 1 });
/* ---------------- MODEL ---------------- */
const Job = (0, mongoose_1.model)("Job", jobSchema);
exports.default = Job;
