import { Schema, model } from "mongoose";
import { TCoinTransaction } from "./coinTransaction.interface";

const coinTransactionSchema = new Schema<TCoinTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "Referral",
    },
  },
  {
    timestamps: true,
  }
);

coinTransactionSchema.index({ userId: 1 });

const CoinTransaction = model<TCoinTransaction>(
  "CoinTransaction",
  coinTransactionSchema
);

export default CoinTransaction;