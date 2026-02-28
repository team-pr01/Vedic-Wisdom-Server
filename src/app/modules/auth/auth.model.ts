import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import config from "../../config";
import { TUser, UserModel } from "./auth.interface";
import crypto from "crypto";

function generateUserId() {
  const prefix = "BTC";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const random = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char random
  return `${prefix}-${date}-${random}`;
}

const userSchema = new Schema<TUser, UserModel>(
  {
    userId: {
      type: String,
      unique: true,
      default: generateUserId,
    },
    profilePicture: {
      type: String,
      required: false,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    area: {
      type: String,
      required: false,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "staff", "tutor", "guardian"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpireAt: {
      type: Date,
      default: null,
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpireAt: {
      type: Date,
      default: null,
    },
    isResetOtpVerified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    suspensionReason: {
      type: String,
      trim: true,
      default: null,
    },
    accountDeleteReason: {
      type: String,
      trim: true,
      default: null,
    },
    expoPushToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hashing password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_round)
    );
  }
  next();
});

// Hide password after saving
userSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

// Static methods
userSchema.statics.isUserExists = async function (email: string) {
  return await this.findOne({ email }).select("+password");
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

// Automatically remove expired OTP (for unverified users)
userSchema.index(
  { otpExpireAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { isOtpVerified: false } }
);

export const User = model<TUser, UserModel>("User", userSchema);
