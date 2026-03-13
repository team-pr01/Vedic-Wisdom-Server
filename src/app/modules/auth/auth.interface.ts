export type TLoginAuth = {
  email: string;
  role?: string
  password: string;
};

import { Model } from "mongoose";
import { UserRole } from "./auth.constants";

export type TUser = {
  _id: string;
  userId: string;
  profilePicture?: string;
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  password: string;
  role: "user" | "admin" | "moderator";
  assignedPages?: string[];
  expoPushToken: string;
  resetPasswordOtp: string | null;
  resetPasswordOtpExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  accountDeleteReason: string | null;
  isSuspended: boolean;
  suspensionReason: string | null;
  lastLoggedIn?: Date;
  // Usage tracking for subscription
  usage: {
    aiChatDaily: number;
    aiRecipesMonthly: number;
    vastuAiMonthly: number;
    kundliMonthly: number;
    muhurtaMonthly: number;

    lastDailyReset?: Date;
    lastMonthlyReset?: Date;
  };
  referralCode?: string;
  referralCount: number;
  premiumUnlocked: boolean;
  coins: number;
};

export interface UserModel extends Model<TUser> {
  isUserExists(email: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof UserRole;