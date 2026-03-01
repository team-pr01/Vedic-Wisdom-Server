/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { TLoginAuth, TUser } from "./auth.interface";
import AppError from "../../errors/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { User } from "./auth.model";
import { sendEmail } from "../../utils/sendEmail";
import bcrypt from "bcrypt";
import { createToken } from "./auth.utils";
import { customUserIdGenerator } from "../../utils/customUserIdGenerator";
import { generate4DigitsOTP } from "../../utils/generate4DigitsOTP";


// Signup
const signup = async (
  payload: Partial<TUser>
) => {
  // Checking if user already exists by email address
  const isUserExistsByEmail = await User.findOne({ email: payload.email });
  if (isUserExistsByEmail) {
    throw new AppError(httpStatus.CONFLICT, "User already exists by this email address.");
  };

  // Checking if user already exists by phone number
  const isUserExistsByPhoneNumber = await User.findOne({ phoneNumber: payload.phoneNumber });
  if (isUserExistsByPhoneNumber) {
    throw new AppError(httpStatus.CONFLICT, "User already exists by this phone number.");
  };

  const userId = await customUserIdGenerator();

  const payloadData = {
    ...payload,
    role: payload.role || "user",
    userId,
    isDeleted: false,
    isSuspended: false,
    isVerified: false,
  };

  const result = await User.create(payloadData);
  return result;
};

// Login
const loginUser = async (payload: TLoginAuth) => {
  // Check if the user exists or not
  const user = await User.isUserExists(payload.email);

  if (!(await user)) {
    throw new AppError(httpStatus.NOT_FOUND, "Invalid email or password.");
  }

  // Check if the user already deleted or not
  if (user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Invalid email or password.");
  }

  // Check if the user suspended or not
  if (user?.isSuspended) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account has been suspended. Please contact support for assistance.");
  }

  // Check if the password is correct or not
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { lastLoggedIn: new Date() } }
  );

  // Create token
  const jwtPayload = {
    userId: user._id.toString(),
    name: user.name,
    email: user.email || "",
    phoneNumber: user.phoneNumber,
    role: user.role,
  };

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
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
  };
};

const refreshToken = async (token: string) => {
  // Check if there is any token sent from the client or not.
  if (!token) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized to proceed!"
    );
  }

  // Check if the token is valid or not.
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string
  ) as JwtPayload;

  const { userId } = decoded;

  const user = await User.findById(userId);

  // Checking if the user exists or not
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "User account deleted.");
  }

  if (user.isSuspended) {
    throw new AppError(httpStatus.FORBIDDEN, "Account suspended.");
  }

  const jwtPayload = {
    userId: user._id.toString(),
    name: user.name,
    email: user.email || "",
    phoneNumber: user.phoneNumber,
    role: user.role,
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

const forgetPassword = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  const otp = generate4DigitsOTP();

  await User.updateOne(
    { email },
    {
      resetPasswordOtp: otp,
      resetPasswordOtpExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 min
    }
  );

  const htmlBody = `
    <p>Hello <strong>${user?.name || "User"}</strong>,</p>
    <p>We received a request to reset your password.</p>
    <p>👉 <strong>Your reset OTP: ${otp}</strong></p>
    <p>Please follow these steps:</p>
    <ol>
      <li>Open the app.</li>
      <li>Go to the <strong>"Reset Password"</strong> screen.</li>
      <li>Paste the above OTP in the token input field.</li>
      <li>Enter your new password.</li>
      <li>Submit the form to complete the reset.</li>
    </ol>
    <p>If you didn’t request this, you can ignore this email.</p>
    <p>Thanks,<br/>AKF Team</p>
  `;

  await sendEmail(user?.email, htmlBody, "Reset your password within 2 minutes | Arya Kalyan Foundation");

  return {};
};

const verifyForgotPasswordOtp = async (payload: {
  email: string;
  otp: string;
}) => {
  const { email, otp } = payload;

  const user = await User.findOne({ email });

  if (
    !user ||
    !user.resetPasswordOtp ||
    !user.resetPasswordOtpExpiresAt
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP.");
  }

  // Expiry check
  if (new Date(user.resetPasswordOtpExpiresAt) < new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP expired.");
  }

  // Wrong OTP
  if (user.resetPasswordOtp !== otp) {
    await User.updateOne(
      { email },
      { $inc: { resetPasswordOtpAttempts: 1 } }
    );

    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP.");
  }

  return {};
};

const resendForgotPasswordOtp = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    return;
  }

  const otp = generate4DigitsOTP();

  await User.updateOne(
    { email },
    {
      resetPasswordOtp: otp,
      resetPasswordOtpExpiresAt: new Date(Date.now() + 2 * 60 * 1000),
      resetPasswordOtpAttempts: 0,
    }
  );

  await sendEmail(user.email, `
    <p>Your new OTP: <strong>${otp}</strong></p>
    <p>Valid for 2 minutes.</p>
  `, "Resend Reset Password OTP");
};

const resetPassword = async (payload: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const { email, otp, newPassword } = payload;

  const user = await User.findOne({ email });

  if (
    !user ||
    !user.resetPasswordOtp ||
    !user.resetPasswordOtpExpiresAt
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid request.");
  }

  // Expiry check
  if (new Date(user.resetPasswordOtpExpiresAt) < new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP expired.");
  }

  // OTP match check
  if (user.resetPasswordOtp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP.");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_round)
  );

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
      $unset: {
        resetPasswordOtp: "",
        resetPasswordOtpExpiresAt: "",
        resetPasswordOtpAttempts: "",
      },
    }
  );

  return {};
};

const changePassword = async (
  userId: string,
  payload: {
    currentPassword: string;
    newPassword: string;
  }
) => {
  const { currentPassword, newPassword } = payload;

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  // Check if user is deleted or suspended
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "User account deleted.");
  }

  if (user.isSuspended) {
    throw new AppError(httpStatus.FORBIDDEN, "Account suspended.");
  }

  // Verify current password
  const isPasswordMatched = await User.isPasswordMatched(
    currentPassword,
    user.password
  );

  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Current password is incorrect."
    );
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_round)
  );

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    }
  );

  return {};
};

const assignPagesToUser = async (payload: {
  userId: string;
  pages: string[];
}) => {
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await User.findByIdAndUpdate(
    payload.userId,
    { assignedPages: payload.pages },
    { new: true, runValidators: true }
  );

  return result;
};


export const AuthServices = {
  signup,
  loginUser,
  refreshToken,
  forgetPassword,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
  resetPassword,
  changePassword,
  assignPagesToUser,
};
