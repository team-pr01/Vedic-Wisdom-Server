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
  avatar?: string;
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  password: string;
  role: "user" | "admin" | "moderator" | "temple";
  assignedPages?: string[];
  totalQuizTaken?: number;
  expoPushToken: string;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  isSuspended: boolean;
  lastLoggedIn?: Date;
  plan?: string;
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
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
};

export interface UserModel extends Model<TUser> {
  isUserExists(email: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof UserRole;