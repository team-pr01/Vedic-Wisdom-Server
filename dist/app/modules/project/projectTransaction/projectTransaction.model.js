"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProjectTransactionSchema = new mongoose_1.Schema({
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    donorName: {
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
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: "BDT",
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["pending", "paid", "failed", "cancelled"],
        default: "pending",
    },
    paymentGatewayData: {
        type: mongoose_1.Schema.Types.Mixed,
        required: false,
    },
}, { timestamps: true });
ProjectTransactionSchema.index({ projectId: 1, status: 1 });
ProjectTransactionSchema.index({ userId: 1, status: 1 });
const ProjectTransaction = (0, mongoose_1.model)("ProjectTransaction", ProjectTransactionSchema);
exports.default = ProjectTransaction;
