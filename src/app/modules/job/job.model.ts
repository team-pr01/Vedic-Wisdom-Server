import { Schema, model } from "mongoose";
import { TJob } from "./job.interface";

/* ---------------- SALARY ---------------- */
const salarySchema = new Schema(
    {
        type: {
            type: String,
            enum: ["paid", "unpaid"],
            required: true,
        },
        minimum: Number,
        maximum: Number,
        currency: String,
    },
    { _id: false }
);

/* ---------------- LOCATION ---------------- */
const locationSchema = new Schema(
    {
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
    },
    { _id: false }
);

/* ---------------- SOCIAL MEDIA ---------------- */
const socialMediaSchema = new Schema(
    {
        facebook: String,
        instagram: String,
        linkedin: String,
    },
    { _id: false }
);

/* ---------------- COMPANY ---------------- */
const companySchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        logo: String,

        location: locationSchema,

        description: String,

        phoneNumber: { type: String, required: true },
        email: { type: String, required: true },
        website: String,

        socialMedia: socialMediaSchema,

        tradeLicense: String,
    },
    { _id: false }
);

/* ---------------- INDIVIDUAL ---------------- */
const individualSchema = new Schema(
    {
        fullName: { type: String, required: true, trim: true },
        phoneNumber: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },

        identityNumber: { type: String, required: true },
        identityDocument: String,
    },
    { _id: false }
);

/* ---------------- BASE JOB ---------------- */
const jobSchema = new Schema<TJob>(
    {
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
            enum: ["entry", "junior", "mid", "senior", "lead"],
            required: true,
        },

        salary: salarySchema,

        responsibilities: [{ type: String, required: true }],
        qualification: [{ type: String, required: true }],
        benefits: [String],

        applicationDeadline: { type: Date, required: true },

        applicationCount: { type: Number, default: 0 },

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
    },
    {
        timestamps: true,
        discriminatorKey: "hiringType",
    }
);

/* ---------------- INDEXES ---------------- */
jobSchema.index({ title: "text", description: "text" });
jobSchema.index({ status: 1 });
jobSchema.index({ "location.city": 1 });

/* ---------------- MODEL ---------------- */
const Job = model<TJob>("Job", jobSchema);
export default Job;