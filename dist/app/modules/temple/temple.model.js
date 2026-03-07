"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Temple = void 0;
const mongoose_1 = require("mongoose");
const TempleSchema = new mongoose_1.Schema({
    basicInfo: {
        templeName: { type: String, required: true, trim: true },
        mainDeity: { type: String, required: true },
        description: { type: String, required: true },
    },
    socialMedia: {
        facebook: String,
        youtube: String,
        instagram: String,
        linkedin: String,
    },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true, index: true },
        state: { type: String, required: true },
        country: { type: String, required: true, index: true },
        area: { type: String },
        googleMapUrl: String,
    },
    otherInfo: {
        establishedYear: Number,
        visitingHours: String,
        phoneNumber: String,
        email: String,
        website: String,
    },
    media: {
        imageUrls: {
            type: [String],
            validate: [
                (arr) => arr.length <= 10,
                "Maximum 10 images allowed",
            ],
        },
        videoUrls: {
            type: [String],
        },
    },
    event: [
        {
            name: { type: String },
            date: { type: Date },
            description: { type: String },
            imageUrls: [{ type: String }],
        },
    ],
    category: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["draft", "pending", "approved", "rejected"],
        default: "pending",
        index: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
TempleSchema.index({ "basicInfo.templeName": "text" });
exports.Temple = (0, mongoose_1.model)("Temple", TempleSchema);
