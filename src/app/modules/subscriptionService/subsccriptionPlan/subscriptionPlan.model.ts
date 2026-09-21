// models/subscriptionPlan.model.ts
import { Schema, model } from "mongoose";
import { TSubscriptionPlan } from "./subscriptionPlan.interface";

const SubscriptionPlanSchema = new Schema<TSubscriptionPlan>(
  {
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
  },
  {
    timestamps: true,
  }
);

// Indexes
SubscriptionPlanSchema.index({ status: 1, isPopular: -1 });
SubscriptionPlanSchema.index({ billingType: 1, status: 1 });

const SubscriptionPlan = model<TSubscriptionPlan>("SubscriptionPlan", SubscriptionPlanSchema);
export default SubscriptionPlan;