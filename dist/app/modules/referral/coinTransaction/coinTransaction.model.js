"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const coinTransactionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    coins: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ["REFERRAL", "DEPOSIT"],
        required: true,
    },
    referenceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Referral",
    },
}, {
    timestamps: true,
});
coinTransactionSchema.index({ userId: 1 });
const CoinTransaction = (0, mongoose_1.model)("CoinTransaction", coinTransactionSchema);
exports.default = CoinTransaction;
