import { Schema, model } from "mongoose";
import { TFood } from "./food.interface";

const FoodSchema = new Schema<TFood>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: "text",
        },

        category: {
            type: String,
            required: true,
            index: true,
        },

        videoSource: {
            type: String,
            enum: ["youtube", "facebook"],
            required: true,
        },

        videoUrl: {
            type: String,
            required: true,
        },

        duration: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Additional indexes
FoodSchema.index({ createdAt: -1 });
FoodSchema.index({ category: 1 });

export const Food = model<TFood>("Food", FoodSchema);