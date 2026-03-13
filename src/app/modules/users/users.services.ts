/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../auth/auth.model";
import { infinitePaginate } from "../../utils/infinitePaginate";
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

  if (filters.premiumUnlocked !== undefined) {
    query.premiumUnlocked = filters.premiumUnlocked;
  }

  return infinitePaginate(User, query, skip, limit);
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
const restoreDeletedAccount = async (userId: string) => {
  const user = await User.findByIdAndUpdate(userId, { isDeleted: false });
  if (!user) throw new Error("User not found");

  return user;
};

// const requestToUnlockProfile = async (userId: string, payload: any) => {
//   const user = await User.findById(userId);
//   if (!user) throw new Error("User not found");

//   // For Tutor
//   if (user.role === "tutor") {
//     const updatedTutor = await Tutor.findOneAndUpdate(
//       { userId },
//       {
//         $set: {
//           hasAppliedForUnlock: true,
//           unlockRequestReason: payload?.unlockRequestReason,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedTutor) throw new Error("Tutor not found");
//     return updatedTutor;
//   }

//   // For Guardian
//   if (user.role === "guardian") {
//     const updatedGuardian = await Guardian.findOneAndUpdate(
//       { userId },
//       {
//         $set: {
//           hasAppliedForUnlock: true,
//           unlockRequestReason: payload?.unlockRequestReason,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedGuardian) throw new Error("Guardian not found");
//     return updatedGuardian;
//   }

//   // If role is neither tutor nor guardian
//   throw new AppError(
//     httpStatus.BAD_REQUEST,
//     "User role not supported for unlock request"
//   );
// };

// const toggleLockProfile = async (userId: string) => {
//   const user = await User.findById(userId);
//   if (!user) throw new Error("User not found");

//   if (user.role === "tutor") {
//     const tutor = await Tutor.findOne({ userId });
//     if (!tutor) throw new Error("Tutor not found");

//     const isLocked = tutor.profileStatus === "locked";

//     const updatedTutor = await Tutor.findOneAndUpdate(
//       { userId },
//       isLocked
//         ? {
//             profileStatus: "unlocked",
//             hasAppliedForUnlock: false,
//             unlockRequestReason: null,
//           }
//         : { profileStatus: "locked" },
//       {
//         runValidators: false,
//         new: true, // ✅ return updated doc
//       }
//     );

//     return updatedTutor;
//   }

//   if (user.role === "guardian") {
//     const guardian = await Guardian.findOne({ userId });
//     if (!guardian) throw new Error("Guardian not found");

//     guardian.profileStatus =
//       guardian.profileStatus === "locked" ? "unlocked" : "locked";

//     if (guardian.profileStatus === "unlocked") {
//       guardian.hasAppliedForUnlock = false;
//       guardian.unlockRequestReason = null;
//     }

//     await guardian.save({ validateBeforeSave: false });
//     return guardian;
//   }

//   throw new AppError(
//     httpStatus.BAD_REQUEST,
//     "User role not supported for lock/unlock"
//   );
// };

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
  getMe,
  suspendUser,
  withdrawSuspension,
  getSingleUserById,
  deleteAccount,
  restoreDeletedAccount,
  // requestToUnlockProfile,
  // toggleLockProfile,
  // updateProfile,
  saveUserPushToken
};
