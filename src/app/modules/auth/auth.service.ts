/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { TLoginAuth, TUser } from "./auth.interface";
import AppError from "../../errors/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
// import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { User } from "./auth.model";
import { sendEmail } from "../../utils/sendEmail";
import bcrypt from "bcrypt";
import { createToken } from "./auth.utils";
import { customUserIdGenerator } from "../../utils/customUserIdGenerator";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Ensures a 6-digit number
};



// const sendPushNotificationToUser = async (payload: {
//   userId: string;
//   title: string;
//   message: string;
// }) => {
//   const { userId, title, message } = payload;

//   const user = await User.findById(userId);
//   if (!user || !user.expoPushToken) {
//     throw new AppError(httpStatus.NOT_FOUND, "User or push token not found");
//   }

//   if (!Expo.isExpoPushToken(user.expoPushToken)) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Invalid Expo push token");
//   }

//   const messages = [
//     {
//       to: user.expoPushToken,
//       sound: 'default',
//       title,
//       body: message,
//       data: { userId },
//     },
//   ];

//   const tickets: Expo.PushTicket[] = [];
//   const chunks = expo.chunkPushNotifications(messages);

//   for (const chunk of chunks) {
//     try {
//       const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//       tickets.push(...ticketChunk);
//     } catch (error) {
//       console.error('Error sending push notification:', error);
//       throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to send push notification");
//     }
//   }

//   return tickets;
// };

// Create user
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

  const { email } = decoded;

  const user = await User.isUserExists(email);

  // Checking if the user exists or not
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Checking if the user is deleted or not

  // Have to check if the user is suspended or not

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

  const otp = generateOTP();

  await User.updateOne(
    { email },
    {
      resetPasswordToken: otp,
      resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min
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

  await sendEmail(user?.email, htmlBody);

  return {};
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
    !user.resetPasswordToken ||
    !user.resetPasswordExpires ||
    user.resetPasswordToken !== otp ||
    new Date(user.resetPasswordExpires) < new Date()
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired OTP.");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_round)
  );

  // Use updateOne to update password and clear OTP fields
  await User.updateOne(
    { email },
    {
      $set: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
      $unset: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    }
  );

  return {};
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

// Change user role (For admin)
const saveUserPushToken = async (payload: any) => {
  console.log(payload);
  const user = await User.findById(payload?.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await User.findByIdAndUpdate(
    payload.userId,
    { expoPushToken: payload.expoPushToken },
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
  resetPassword,
  changeUserRole,
  assignPagesToUser,
  saveUserPushToken,
};
