"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinTransaction = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const CoinTransactionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    packageId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true
});
// Indexes for better query performance
CoinTransactionSchema.index({ userId: 1, status: 1 });
CoinTransactionSchema.index({ createdAt: -1 });
CoinTransactionSchema.index({ transactionId: 1 });
exports.CoinTransaction = (0, mongoose_1.model)("CoinTransaction", CoinTransactionSchema);
