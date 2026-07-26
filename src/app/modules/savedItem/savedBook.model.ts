import { Schema, model } from "mongoose";
import { TSavedItem } from "./savedBook.interface";

const SavedItemSchema = new Schema<TSavedItem>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        itemId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "itemType",
        },
        itemType: {
            type: String,
            enum: ["book", "audioBook"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

SavedItemSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });
SavedItemSchema.index({ userId: 1, itemType: 1 });
SavedItemSchema.index({ createdAt: -1 });

export const SavedItem = model<TSavedItem>("SavedItem", SavedItemSchema);