import { Schema, model } from "mongoose";
import { TTemple } from "./temple.interface";

const TempleSchema = new Schema<TTemple>(
    {
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
                    (arr: string[]) => arr.length <= 10,
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
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

TempleSchema.index({ "basicInfo.templeName": "text" });

export const Temple = model<TTemple>("Temple", TempleSchema);