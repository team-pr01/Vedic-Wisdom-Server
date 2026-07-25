/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from "mongoose";
import { TCoinTransaction } from "./coinTransaction.interface";

const CoinTransactionSchema = new Schema<TCoinTransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        packageId: {
            type: Schema.Types.ObjectId,
            ref: "CoinPackage",
            required: true,
            index: true
        },
        coinAmount: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 1
        },
        transactionId: {
            type: String,
            trim: true,
            sparse: true,
            index: true
        },
        status: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes for better query performance
CoinTransactionSchema.index({ userId: 1, status: 1 });
CoinTransactionSchema.index({ createdAt: -1 });
CoinTransactionSchema.index({ transactionId: 1 });

export const CoinTransaction = model<TCoinTransaction>("CoinTransaction", CoinTransactionSchema);