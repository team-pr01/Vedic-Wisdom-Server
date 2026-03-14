import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import config from "../../config";
import { TUser, UserModel } from "./auth.interface";

const userSchema = new Schema<TUser, UserModel>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      required: false,
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
    countryCode: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
    country: {
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
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    assignedPages: {
      type: [String],
      default: [],
    },
    expoPushToken: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    accountDeleteReason: {
      type: String,
      default: null,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
      default: null,
    },
    resetPasswordOtp: {
      type: String,
      default: null,
    },
    resetPasswordOtpExpiresAt: {
      type: Date,
      default: null,
    },
    lastLoggedIn: {
      type: Date,
      default: null,
      required: false,
    },

    plan : {
      type: String,
      default: "free",
    },

    // Usage tracking for subscription
    usage: {
      aiChatDaily: { type: Number, default: 0 },
      aiRecipesMonthly: { type: Number, default: 0 },
      vastuAiMonthly: { type: Number, default: 0 },
      kundliMonthly: { type: Number, default: 0 },
      muhurtaMonthly: { type: Number, default: 0 },

      lastDailyReset: Date,
      lastMonthlyReset: Date,
    },
    referralCode: {
      type: String,
      unique: true,
      default: null,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    premiumUnlocked: {
      type: Boolean,
      default: false,
    },
    coins: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
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


/* TEXT SEARCH INDEX */
userSchema.index({
  name: "text",
  email: "text",
  phoneNumber: "text",
  userId: "text",
});

/* FILTER INDEXES */
userSchema.index({ role: 1 });
userSchema.index({ country: 1 });
userSchema.index({ state: 1 });
userSchema.index({ city: 1 });
userSchema.index({ area: 1 });
userSchema.index({ premiumUnlocked: 1 });

/* SORT / PAGINATION */

userSchema.index({ createdAt: -1 });


// Export the model
export const User = model<TUser, UserModel>("User", userSchema);
