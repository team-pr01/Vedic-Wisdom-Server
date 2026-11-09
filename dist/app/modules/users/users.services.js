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
exports.UserServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const auth_model_1 = require("../auth/auth.model");
const infinitePaginate_1 = require("../../utils/infinitePaginate");
const deleteImageFromCloudinary_1 = require("../../utils/deleteImageFromCloudinary");
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const mongoose_1 = require("mongoose");
const conversation_model_1 = require("../conversation/conversation.model");
// import AppError from "../../errors/AppError";
// import httpStatus from "http-status";
// import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
// import mongoose from "mongoose";
// import { calculateProfileSections } from "../../utils/calculateTutorProfileSections";
const getAllUsers = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    if (filters.keyword) {
        query.$or = [
            { email: { $regex: filters.keyword, $options: 'i' } },
        ];
    }
    /* TEXT SEARCH */
    if (filters.keyword) {
        query.$text = {
            $search: filters.keyword,
        };
    }
    /* FILTERS */
    if (filters.role)
        query.role = filters.role;
    if (filters.country)
        query.country = filters.country;
    if (filters.state)
        query.state = filters.state;
    if (filters.city)
        query.city = filters.city;
    if (filters.area)
        query.area = filters.area;
    /* STATUS LOGIC */
    if (filters.status && filters.status !== "all") {
        query.isSuspended = filters.status === "true";
    }
    if (filters.premiumUnlocked && filters.premiumUnlocked !== "all") {
        query.premiumUnlocked = filters.premiumUnlocked === "true";
    }
    return (0, infinitePaginate_1.infinitePaginate)(auth_model_1.User, query, skip, limit);
});
const getAllUsersForChat = (userId_1, conversationId_1, keyword_1, ...args_1) => __awaiter(void 0, [userId_1, conversationId_1, keyword_1, ...args_1], void 0, function* (userId, conversationId, keyword, skip = 0, limit = 10) {
    const currentUserId = new mongoose_1.Types.ObjectId(userId);
    // 1. Build the base query
    const query = {
        _id: { $ne: currentUserId },
        isDeleted: false,
    };
    // 2. Exclude users who are ALREADY in the group
    if (conversationId) {
        const group = yield conversation_model_1.Conversation.findById(conversationId).select("members");
        if (!group) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Group not found");
        }
        query._id = {
            $ne: currentUserId,
            $nin: group.members
        };
    }
    // 3. Text Search
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: "i" } },
            { email: { $regex: keyword, $options: "i" } },
        ];
    }
    // 4. Aggregation Pipeline
    const pipeline = [
        { $match: query },
        { $sort: { name: 1 } },
        // ✅ Join with Conversation to check status
        {
            $lookup: {
                from: "conversations",
                let: { otherUserId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            isGroup: false,
                            $expr: {
                                $and: [
                                    { $in: [currentUserId, "$members"] },
                                    { $in: ["$$otherUserId", "$members"] },
                                ],
                            },
                        },
                    },
                    // Project only the status we need
                    { $project: { messageRequestStatus: 1 } }
                ],
                as: "existingChat",
            },
        },
        // ✅ Calculate the new isConnected logic
        {
            $addFields: {
                // isConnected is TRUE only if a chat exists AND the status is "accepted"
                isConnected: {
                    $cond: {
                        if: { $gt: [{ $size: "$existingChat" }, 0] },
                        then: {
                            $eq: [
                                { $arrayElemAt: ["$existingChat.messageRequestStatus", 0] },
                                "accepted"
                            ]
                        },
                        else: false
                    }
                },
                // isMessageReqAccepted is the exact same logic here
                isMessageReqAccepted: {
                    $cond: {
                        if: { $gt: [{ $size: "$existingChat" }, 0] },
                        then: {
                            $eq: [
                                { $arrayElemAt: ["$existingChat.messageRequestStatus", 0] },
                                "accepted"
                            ]
                        },
                        else: false
                    }
                },
            },
        },
        // 5. Format output
        {
            $project: {
                _id: 1,
                name: 1,
                email: 1,
                profilePicture: 1,
                isConnected: 1,
                isMessageReqAccepted: 1,
            },
        },
        // 6. Pagination
        { $skip: skip },
        { $limit: limit },
    ];
    const [users, total] = yield Promise.all([
        auth_model_1.User.aggregate(pipeline),
        auth_model_1.User.countDocuments(query),
    ]);
    return {
        data: users,
        meta: {
            total,
            filteredTotal: total,
            skip,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + users.length < total,
        },
    };
});
const getSingleUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_model_1.User.findById(userId);
    return result;
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const result = yield auth_model_1.User.findById(userId);
    return result;
});
// Suspend user - actual operation on User model
const suspendUser = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findByIdAndUpdate(userId, { isSuspended: true, suspensionReason: payload.suspensionReason });
    if (!user)
        throw new Error("User not found");
    return {};
});
const updateProfile = (userId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    let profilePicture = user.profilePicture;
    /* HANDLE IMAGE UPDATE */
    if (file) {
        /* DELETE OLD IMAGE */
        if (user.profilePicture) {
            const publicId = (0, deleteImageFromCloudinary_1.extractPublicId)(user.profilePicture);
            yield (0, deleteImageFromCloudinary_1.deleteImageFromCloudinary)(publicId);
        }
        /* UPLOAD NEW IMAGE */
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(`profile-${Date.now()}`, file.path);
        profilePicture = secure_url;
    }
    const updatedUser = yield auth_model_1.User.findByIdAndUpdate(userId, Object.assign(Object.assign({}, payload), { profilePicture }), { new: true });
    return updatedUser;
});
// Activate user back
const withdrawSuspension = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findByIdAndUpdate(userId, { isSuspended: false, suspensionReason: null });
    if (!user)
        throw new Error("User not found");
    return {};
});
// Activate user back
const deleteAccount = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findByIdAndUpdate(userId, { isDeleted: true, accountDeleteReason: payload.accountDeleteReason });
    if (!user)
        throw new Error("User not found");
    return user;
});
// Activate user back
const restoreUsersDeletedAccount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findByIdAndUpdate(userId, { isDeleted: false, accountDeleteReason: null });
    if (!user)
        throw new Error("User not found");
    return user;
});
// Update tutor profile
// const updateProfile = async (
//   userId: string,
//   payload: Partial<any>,
//   file: any | undefined
// ) => {
//   // ✅ Step 1: Find user and check their role
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }
//   // Determine which model to update
//   const isTutor = user.role === "tutor";
//   const isGuardian = user.role === "guardian";
//   const existing = isTutor
//     ? await Tutor.findOne({ userId })
//     : isGuardian
//       ? await Guardian.findOne({ userId })
//       : null;
//   if (!existing) {
//     throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
//   }
//   // ✅ Step 2: Handle image upload
//   let imageUrl: string | undefined;
//   if (file) {
//     const imageName = `${existing.userId}-${Date.now()}`;
//     const path = file.path;
//     const { secure_url } = await sendImageToCloudinary(imageName, path);
//     imageUrl = secure_url;
//   }
//   // ✅ Step 3: Split payload for user & role-specific model
//   const userUpdatePayload: any = {};
//   const roleUpdatePayload: any = {};
//   const userFields = ["name", "email", "phoneNumber", "gender", "city", "area"];
//   Object.entries(payload).forEach(([key, value]) => {
//     if (userFields.includes(key)) {
//       userUpdatePayload[key] = value;
//     } else {
//       roleUpdatePayload[key] = value;
//     }
//   });
//   if (imageUrl) {
//     roleUpdatePayload.imageUrl = imageUrl;
//   }
//   // ✅ Step 4: Update base User info
//   if (Object.keys(userUpdatePayload).length > 0) {
//     await User.findByIdAndUpdate(existing.userId, userUpdatePayload, {
//       new: true,
//       runValidators: true,
//     });
//   }
//   // ✅ Step 5: Update either Tutor or Guardian
//   const updatedProfile = isTutor
//     ? await Tutor.findOneAndUpdate({ userId }, roleUpdatePayload, {
//         new: true,
//         runValidators: true,
//       }).populate("userId")
//     : await Guardian.findOneAndUpdate({ userId }, roleUpdatePayload, {
//         new: true,
//         runValidators: true,
//       }).populate("userId");
//   if (!updatedProfile) {
//     throw new AppError(httpStatus.NOT_FOUND, "Profile update failed");
//   }
//   await updatedProfile.save();
//   // Saving profile pic in user colletion also
//   await User.findOneAndUpdate(
//     { _id: userId },
//     { profilePicture: imageUrl },
//     { new: true }
//   );
//   return updatedProfile;
// };
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
exports.UserServices = {
    getAllUsers,
    getAllUsersForChat,
    getMe,
    suspendUser,
    withdrawSuspension,
    getSingleUserById,
    updateProfile,
    deleteAccount,
    restoreUsersDeletedAccount,
    assignPagesToUser,
    saveUserPushToken
};
