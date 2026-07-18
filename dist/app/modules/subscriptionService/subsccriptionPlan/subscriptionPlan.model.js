"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/subscriptionPlan.model.ts
const mongoose_1 = require("mongoose");
const SubscriptionPlanSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    currency: {
        type: String,
        required: true,
        default: "USD",
        uppercase: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    billingType: {
        type: String,
        enum: ["monthly", "yearly"],
        required: true,
        index: true,
    },
    features: {
        type: [String],
        required: true,
        default: [],
    },
    isPopular: {
        type: Boolean,
        default: false,
        index: true,
    },
    status: {
        type: String,
        enum: ["active", "draft"],
        default: "draft",
        index: true,
    },
}, {
    timestamps: true,
});
// Indexes
SubscriptionPlanSchema.index({ status: 1, isPopular: -1 });
SubscriptionPlanSchema.index({ billingType: 1, status: 1 });
const SubscriptionPlan = (0, mongoose_1.model)("SubscriptionPlan", SubscriptionPlanSchema);
exports.default = SubscriptionPlan;
