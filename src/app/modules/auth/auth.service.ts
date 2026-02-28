/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { TLoginAuth, TUser } from "./auth.interface";
import AppError from "../../errors/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { createToken } from "./auth.utils";
import { User } from "./auth.model";
import bcrypt from "bcrypt";
import axios from "axios";
import { generateSequentialId } from "../../utils/customIdGenerators/generateSequentialId";
import { io } from "../../../server";
import Expo from "expo-server-sdk";

const signup = async (payload: Partial<TUser>) => {
  // Checking if user already exists
  const isUserExistsByEmail = await User.findOne({ email: payload.email });
  const isUserExistsByPhoneNumber = await User.findOne({
    phoneNumber: payload.phoneNumber,
  });

  if (isUserExistsByEmail) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this email."
    );
  }
  if (isUserExistsByPhoneNumber) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this phone number."
    );
  }

  return null;
};

// Login
const loginUser = async (payload: TLoginAuth) => {
  // 1️⃣ Check if user exists
  const user = await User.isUserExists(payload.email);

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No account found with this email address. Please sign up first."
    );
  }

  // 2️⃣ Check role mismatch
  if (user.role !== payload.role) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `This email is not registered as a ${payload.role}. Please select the correct account type.`
    );
  }

  // 4️⃣ Deleted account check
  if (user.isDeleted) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Your account has been deleted. Please contact our support team if you need assistance or call us at 09617785588"
    );
  }

  // 5️⃣ Suspended account check
  if (user.isSuspended) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been deactivated. Please contact our support team for further assistance or call us at 09617785588"
    );
  }

  // 7️⃣ Password validation
  const isPasswordMatched = await User.isPasswordMatched(
    payload.password,
    user.password
  );

  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Incorrect password. Please try again."
    );
  }

  // 8️⃣ JWT Payload
  const jwtPayload = {
    _id: user._id.toString(),
    userId: user.userId,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profilePicture: user.profilePicture || "",
    createdAt: user.createdAt,
  };

  // 9️⃣ Tokens
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profilePicture: user.profilePicture || "",
      createdAt: user.createdAt,
    },
  };
};

const refreshToken = async (token: string) => {
  // Checking if there is any token sent from the client or not.
  if (!token) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized to proceed!"
    );
  }

  // Checking if the token is valid or not.
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string
  ) as JwtPayload;

  const { email } = decoded;

  const user = await User.isUserExists(email);

  // Checking if the user already deleted or not
  const isUserDeleted = user?.isDeleted;
  if (isUserDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exists.");
  }

  // Have to check if the user is suspended or not

  const jwtPayload = {
    _id: user._id.toString(),
    userId: user.userId,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profilePicture: user.profilePicture || "",
    createdAt: user.createdAt,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (phoneNumber: string) => {
  const user = await User.findOne({ phoneNumber });

  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.isOtpVerified) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is not verified.");
  }

  if (user.isSuspended) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is suspended. Please contact support."
    );
  }

  // Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  user.resetOtp = otp;
  user.resetOtpExpireAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
  await user.save();

  return {};
};

const resendForgotPasswordOtp = async (phoneNumber: string) => {
  const user = await User.findOne({ phoneNumber });

  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.isOtpVerified) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is not verified.");
  }

  if (user.isSuspended) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is suspended. Please contact support."
    );
  }

  // Generate New OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  user.resetOtp = otp;
  user.resetOtpExpireAt = new Date(Date.now() + 2 * 60 * 1000); // 2 min
  await user.save();

  const message = `Your password reset OTP is ${otp}. It will expire in 2 minutes.`;


  return {};
};

const verifyResetOtp = async (phoneNumber: string, otp: string) => {
  const user = await User.findOne({ phoneNumber });

  if (!user || user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.resetOtp || user.resetOtp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (user.resetOtpExpireAt! < new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP expired");
  }

  user.isResetOtpVerified = true;
  user.resetOtp = null;
  user.resetOtpExpireAt = null;
  await user.save();

  return {};
};

const resetPassword = async (payload: {
  phoneNumber: string;
  newPassword: string;
}) => {
  const user = await User.findOne({ phoneNumber: payload.phoneNumber });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.isOtpVerified) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is not verified.");
  }

  if (user.isSuspended) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is suspended. Please contact support."
    );
  }

  if (!user.isResetOtpVerified) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "OTP not verified. Please verify OTP before resetting password."
    );
  }

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_round)
  );

  await User.findOneAndUpdate(
    { phoneNumber: payload.phoneNumber },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
      isResetOtpVerified: false,
    }
  );

  return {};
};

const changePassword = async (
  userId: string,
  payload: { currentPassword: string; newPassword: string }
) => {
  const user = await User.findById(userId).select("+password");

  // Checking if the user exists
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Check if the current password is correct
  const isPasswordMatched = await bcrypt.compare(
    payload.currentPassword,
    user.password
  );
  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Current password is incorrect!"
    );
  }

  // Hash the new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_round)
  );
  await User.findByIdAndUpdate(userId, {
    password: newHashedPassword,
  });
};

// Change user role (For admin)
const changeUserRole = async (payload: { userId: string; role: any }) => {
  const user = await User.findById(payload?.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await User.findByIdAndUpdate(
    payload?.userId,
    { role: payload?.role },
    {
      new: true,
      runValidators: true,
    }
  );

  return result;
};

export const AuthServices = {
  signup,
  loginUser,
  refreshToken,
  forgetPassword,
  verifyResetOtp,
  resendForgotPasswordOtp,
  resetPassword,
  changePassword,
  changeUserRole,
};
