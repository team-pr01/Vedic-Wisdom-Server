"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
// import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
const auth_model_1 = require("./auth.model");
const sendEmail_1 = require("../../utils/sendEmail");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_utils_1 = require("./auth.utils");
const customUserIdGenerator_1 = require("../../utils/customUserIdGenerator");
const generate4DigitsOTP_1 = require("../../utils/generate4DigitsOTP");
// Signup
const signup = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Checking if user already exists by email address
    const isUserExistsByEmail = yield auth_model_1.User.findOne({ email: payload.email });
    if (isUserExistsByEmail) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "User already exists by this email address.");
    }
    ;
    // Checking if user already exists by phone number
    const isUserExistsByPhoneNumber = yield auth_model_1.User.findOne({ phoneNumber: payload.phoneNumber });
    if (isUserExistsByPhoneNumber) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "User already exists by this phone number.");
    }
    ;
    const userId = yield (0, customUserIdGenerator_1.customUserIdGenerator)();
    const payloadData = Object.assign(Object.assign({}, payload), { role: payload.role || "user", userId, isDeleted: false, isSuspended: false, isVerified: false });
    const result = yield auth_model_1.User.create(payloadData);
    return result;
});
// Login
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the user exists or not
    const user = yield auth_model_1.User.isUserExists(payload.email);
    if (!(yield user)) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Invalid email or password.");
    }
    // Check if the user already deleted or not
    if (user === null || user === void 0 ? void 0 : user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Invalid email or password.");
    }
    // Check if the user suspended or not
    if (user === null || user === void 0 ? void 0 : user.isSuspended) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Your account has been suspended. Please contact support for assistance.");
    }
    // Check if the password is correct or not
    if (!(yield auth_model_1.User.isPasswordMatched(payload === null || payload === void 0 ? void 0 : payload.password, user === null || user === void 0 ? void 0 : user.password))) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid email or password.");
    }
    yield auth_model_1.User.updateOne({ _id: user._id }, { $set: { lastLoggedIn: new Date() } });
    // Create token
    const jwtPayload = {
        userId: user._id.toString(),
        name: user.name,
        email: user.email || "",
        phoneNumber: user.phoneNumber,
        role: user.role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
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
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if there is any token sent from the client or not.
    if (!token) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized to proceed!");
    }
    // Check if the token is valid or not.
    const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_refresh_secret);
    const { userId } = decoded;
    const user = yield auth_model_1.User.findById(userId);
    // Checking if the user exists or not
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "User account deleted.");
    }
    if (user.isSuspended) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Account suspended.");
    }
    const jwtPayload = {
        userId: user._id.toString(),
        name: user.name,
        email: user.email || "",
        phoneNumber: user.phoneNumber,
        role: user.role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return {
        accessToken,
    };
});
const forgetPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findOne({ email });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    const otp = (0, generate4DigitsOTP_1.generate4DigitsOTP)();
    yield auth_model_1.User.updateOne({ email }, {
        resetPasswordOtp: otp,
        resetPasswordOtpExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 min
    });
    const htmlBody = `
    <p>Hello <strong>${(user === null || user === void 0 ? void 0 : user.name) || "User"}</strong>,</p>
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
    yield (0, sendEmail_1.sendEmail)(user === null || user === void 0 ? void 0 : user.email, htmlBody, "Reset your password within 2 minutes | Arya Kalyan Foundation");
    return {};
});
const verifyForgotPasswordOtp = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = payload;
    const user = yield auth_model_1.User.findOne({ email });
    if (!user ||
        !user.resetPasswordOtp ||
        !user.resetPasswordOtpExpiresAt) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid OTP.");
    }
    // Expiry check
    if (new Date(user.resetPasswordOtpExpiresAt) < new Date()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "OTP expired.");
    }
    // Wrong OTP
    if (user.resetPasswordOtp !== otp) {
        yield auth_model_1.User.updateOne({ email }, { $inc: { resetPasswordOtpAttempts: 1 } });
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid OTP.");
    }
    return {};
});
const resendForgotPasswordOtp = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findOne({ email });
    if (!user) {
        return;
    }
    const otp = (0, generate4DigitsOTP_1.generate4DigitsOTP)();
    yield auth_model_1.User.updateOne({ email }, {
        resetPasswordOtp: otp,
        resetPasswordOtpExpiresAt: new Date(Date.now() + 2 * 60 * 1000),
        resetPasswordOtpAttempts: 0,
    });
    yield (0, sendEmail_1.sendEmail)(user.email, `
    <p>Your new OTP: <strong>${otp}</strong></p>
    <p>Valid for 2 minutes.</p>
  `, "Resend Reset Password OTP");
});
const resetPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp, newPassword } = payload;
    const user = yield auth_model_1.User.findOne({ email });
    if (!user ||
        !user.resetPasswordOtp ||
        !user.resetPasswordOtpExpiresAt) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid request.");
    }
    // Expiry check
    if (new Date(user.resetPasswordOtpExpiresAt) < new Date()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "OTP expired.");
    }
    // OTP match check
    if (user.resetPasswordOtp !== otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid OTP.");
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_round));
    yield auth_model_1.User.updateOne({ _id: user._id }, {
        $set: {
            password: hashedPassword,
            passwordChangedAt: new Date(),
        },
        $unset: {
            resetPasswordOtp: "",
            resetPasswordOtpExpiresAt: "",
            resetPasswordOtpAttempts: "",
        },
    });
    return {};
});
// Change user role (For admin)
const changeUserRole = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findById(payload === null || payload === void 0 ? void 0 : payload.userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const result = yield auth_model_1.User.findByIdAndUpdate(payload === null || payload === void 0 ? void 0 : payload.userId, { role: payload === null || payload === void 0 ? void 0 : payload.role }, {
        new: true,
        runValidators: true,
    });
    return result;
});
const assignPagesToUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findById(payload.userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const result = yield auth_model_1.User.findByIdAndUpdate(payload.userId, { assignedPages: payload.pages }, { new: true, runValidators: true });
    return result;
});
// Change user role (For admin)
const saveUserPushToken = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    const user = yield auth_model_1.User.findById(payload === null || payload === void 0 ? void 0 : payload.userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const result = yield auth_model_1.User.findByIdAndUpdate(payload.userId, { expoPushToken: payload.expoPushToken }, {
        new: true,
        runValidators: true,
    });
    return result;
});
exports.AuthServices = {
    signup,
    loginUser,
    refreshToken,
    forgetPassword,
    verifyForgotPasswordOtp,
    resendForgotPasswordOtp,
    resetPassword,
    changeUserRole,
    assignPagesToUser,
    saveUserPushToken,
};
