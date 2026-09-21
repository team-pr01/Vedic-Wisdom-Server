import { Schema, model } from "mongoose";
import { TVendor } from "./vendor.interface";

const vendorSchema = new Schema<TVendor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    shopName: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    documentUrls: {
      type: [String],
      default: [],
    },

    businessAddress: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    shopUrl: {
      type: String,
      unique: true,
      sparse: true,
    },

    status: {
      type: String,
      enum: ["applied", "suspended", "approved", "rejected"],
      default: "applied",
      index: true,
    },
    suspensionReason: {
      type: String,
    },

    suspendedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);



/* TEXT SEARCH INDEX */

vendorSchema.index({
  name: "text",
  email: "text",
  phoneNumber: "text",
  shopName: "text",
});


const Vendor = model<TVendor>("Vendor", vendorSchema);

export default Vendor;