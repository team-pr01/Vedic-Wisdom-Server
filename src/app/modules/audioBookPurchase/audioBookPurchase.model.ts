import { Schema, model } from "mongoose";
import { TAudioBookPurchase } from "./audioBookPurchase.interface";

const AudioBookPurchaseSchema = new Schema<TAudioBookPurchase>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        audioBookId: {
            type: Schema.Types.ObjectId,
            ref: "AudioBook",
            required: true,
            index: true,
        },
        coinPrice: {
            type: Number,
            required: true,
            min: 0,
        }
    },
    {
        timestamps: true,
    }
);

AudioBookPurchaseSchema.index({ userId: 1, audioBookId: 1 }, { unique: true });
AudioBookPurchaseSchema.index({ userId: 1, purchaseDate: -1 });
AudioBookPurchaseSchema.index({ audioBookId: 1 });

export const AudioBookPurchase = model<TAudioBookPurchase>(
    "AudioBookPurchase",
    AudioBookPurchaseSchema
);