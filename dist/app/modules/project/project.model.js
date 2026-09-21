"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// project.model.ts
const mongoose_1 = require("mongoose");
const DonorSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: String,
        required: true,
    },
    donatedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });
const ProjectSchema = new mongoose_1.Schema({
    imageUrl: {
        type: String,
        required: false,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    startDate: {
        type: Date,
        required: false,
    },
    currency: {
        type: String,
        required: true,
        trim: true,
        default: "USD",
    },
    amountNeeded: {
        type: Number,
        required: true,
        min: 0,
    },
    amountRaised: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
    },
    donors: {
        type: [DonorSchema],
        required: false,
        default: [],
    },
}, {
    timestamps: true,
});
// Indexes for better query performance
ProjectSchema.index({ title: "text", description: "text" });
ProjectSchema.index({ location: 1 });
ProjectSchema.index({ startDate: -1 });
ProjectSchema.index({ amountRaised: -1 });
// Virtual for remaining amount
ProjectSchema.virtual("remainingAmount").get(function () {
    return this.amountNeeded - (this.amountRaised || 0);
});
// Virtual for percentage raised
ProjectSchema.virtual("percentageRaised").get(function () {
    if (this.amountNeeded === 0)
        return 0;
    return ((this.amountRaised || 0) / this.amountNeeded) * 100;
});
// Ensure virtuals are included in JSON output
ProjectSchema.set("toJSON", { virtuals: true });
ProjectSchema.set("toObject", { virtuals: true });
const Project = (0, mongoose_1.model)("Project", ProjectSchema);
exports.default = Project;
