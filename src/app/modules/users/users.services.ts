/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../auth/auth.model";
import { infinitePaginate } from "../../utils/infinitePaginate";
import { deleteImageFromCloudinary, extractPublicId } from "../../utils/deleteImageFromCloudinary";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { Types } from "mongoose";
import { Conversation } from "../conversation/conversation.model";
// import AppError from "../../errors/AppError";
// import httpStatus from "http-status";
// import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
// import mongoose from "mongoose";
// import { calculateProfileSections } from "../../utils/calculateTutorProfileSections";

const getAllUsers = async (
  filters: any = {},
  skip = 0,
  limit = 10
) => {
  const query: any = {};

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
  if (filters.role) query.role = filters.role;
  if (filters.country) query.country = filters.country;
  if (filters.state) query.state = filters.state;
  if (filters.city) query.city = filters.city;
  if (filters.area) query.area = filters.area;

  /* STATUS LOGIC */
  if (filters.status && filters.status !== "all") {
    query.isSuspended = filters.status === "true";
  }

  if (filters.premiumUnlocked && filters.premiumUnlocked !== "all") {
    query.premiumUnlocked = filters.premiumUnlocked === "true";
  }

  return infinitePaginate(User, query, skip, limit);
};

const getAllUsersForChat = async (
  userId: string,
  conversationId?: string, 
  keyword?: string,
  skip = 0,
  limit = 10
) => {
  const currentUserId = new Types.ObjectId(userId);

  // 1. Build the base query
  const query: any = {
    _id: { $ne: currentUserId }, 
    isDeleted: false,
  };

  // 2. Exclude users who are ALREADY in the group
  if (conversationId) {
    const group = await Conversation.findById(conversationId).select("members");
    
    if (!group) {
      throw new AppError(httpStatus.NOT_FOUND, "Group not found");
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
  const pipeline: any[] = [
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
          // ✅ Project the status so we can use it
          { $project: { messageRequestStatus: 1 } }
        ],
        as: "existingChat",
      },
    },
    
    // ✅ Calculate connection status and expose the request status
    {
      $addFields: {
        // 1. Is there an accepted connection?
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
        // 2. Expose the raw status (pending, rejected, accepted, or none if no chat exists)
        connectionStatus: {
          $cond: {
            if: { $gt: [{ $size: "$existingChat" }, 0] },
            then: { $arrayElemAt: ["$existingChat.messageRequestStatus", 0] },
            else: "none" // No chat exists yet
          }
        }
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
        connectionStatus: 1, 
      },
    },
    
    // 6. Pagination
    { $skip: skip },
    { $limit: limit },
  ];

  const [users, total] = await Promise.all([
    User.aggregate(pipeline),
    User.countDocuments(query),
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
};

const getSingleUserById = async (userId: string) => {
  const result = await User.findById(userId);
  return result;
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await User.findById(userId);

  return result;
};

// Suspend user - actual operation on User model
const suspendUser = async (userId: string, payload: any) => {
  const user = await User.findByIdAndUpdate(userId, { isSuspended: true, suspensionReason: payload.suspensionReason });
  if (!user) throw new Error("User not found");

  return {};
};

const updateProfile = async (
  userId: string,
  payload: any,
  file?: Express.Multer.File
) => {

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  let profilePicture = user.profilePicture;

  /* HANDLE IMAGE UPDATE */

  if (file) {

    /* DELETE OLD IMAGE */
    if (user.profilePicture) {
      const publicId = extractPublicId(user.profilePicture);
      await deleteImageFromCloudinary(publicId);
    }

    /* UPLOAD NEW IMAGE */

    const { secure_url } = await sendImageToCloudinary(
      `profile-${Date.now()}`,
      file.path
    );

    profilePicture = secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      ...payload,
      profilePicture,
    },
    { new: true }
  );

  return updatedUser;
};

// Activate user back
const withdrawSuspension = async (userId: string) => {
  const user = await User.findByIdAndUpdate(userId, { isSuspended: false, suspensionReason: null });
  if (!user) throw new Error("User not found");

  return {};
};

// Activate user back
const deleteAccount = async (userId: string, payload: any) => {
  const user = await User.findByIdAndUpdate(userId, { isDeleted: true, accountDeleteReason: payload.accountDeleteReason });
  if (!user) throw new Error("User not found");

  return user;
};

// Activate user back
const restoreUsersDeletedAccount = async (userId: string) => {
  const user = await User.findByIdAndUpdate(userId, { isDeleted: false, accountDeleteReason: null });
  if (!user) throw new Error("User not found");

  return user;
};

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

export const UserServices = {
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
