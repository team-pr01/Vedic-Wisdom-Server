import { UserServices } from "./users.services";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

// Get single user by ID
const getSingleUserById = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await UserServices.getSingleUserById(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User data fetched successfully.",
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await UserServices.getMe(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

// suspend user
const suspendUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await UserServices.suspendUser(userId, req.body);
  sendResponse(res, {
    success: true,
    message: "User suspended successfully",
    statusCode: httpStatus.OK,
    data: result,
  });
});

// activate user
const withdrawSuspension = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await UserServices.withdrawSuspension(userId);
  sendResponse(res, {
    success: true,
    message: "Suspension withdrawn successfully",
    statusCode: httpStatus.OK,
    data: result,
  });
});

// Delete account
const deleteAccount = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await UserServices.deleteAccount(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "It's sad to see you go.",
    data: result,
  });
});

// Restore Deleted account
const restoreDeletedAccount = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await UserServices.restoreDeletedAccount(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account restored successfully!",
    data: result,
  });
});

// Save Push Token
const savePushToken = catchAsync(async (req, res) => {
  const result = await UserServices.saveUserPushToken(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Push token saved successfully",
    data: result,
  });
});

export const UserControllers = {
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
  savePushToken,
};
