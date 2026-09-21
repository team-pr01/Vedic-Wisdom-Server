"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/subscription.model.ts
const mongoose_1 = require("mongoose");
const SubscriptionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    plan: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        index: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
        index: true,
    },
    cancelledAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Compound indexes
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1, status: 1 });
SubscriptionSchema.index({ createdAt: -1 });
const Subscription = (0, mongoose_1.model)("Subscription", SubscriptionSchema);
exports.default = Subscription;
