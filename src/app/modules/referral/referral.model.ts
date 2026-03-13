import { Schema, model } from "mongoose";
import { TReferral } from "./referral.interface";


const referralSchema = new Schema<TReferral>(
  {
    referrer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    referredUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    rank: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ---------------- Indexes ---------------- */

referralSchema.index({ referrer: 1 });
referralSchema.index({ referredUser: 1 }, { unique: true });

const Referral = model<TReferral>("Referral", referralSchema);

export default Referral;