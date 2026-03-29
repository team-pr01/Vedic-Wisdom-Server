// models/subscription.model.ts
import { Schema, model } from "mongoose";
import { TSubscription } from "./subscription.interface";

const SubscriptionSchema = new Schema<TSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      index: true,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "quarterly"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
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

    autoRenew: {
      type: Boolean,
      default: true,
    },

    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1, status: 1 });
SubscriptionSchema.index({ createdAt: -1 });

const Subscription = model<TSubscription>("Subscription", SubscriptionSchema);
export default Subscription;