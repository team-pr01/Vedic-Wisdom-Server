/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import Product from "./emergency.model";
import { TEmergency } from "./emergency.interface";
import Emergency from "./emergency.model";
import { sendSingleNotification } from "../../utils/sendSingleNotification";
import { User } from "../auth/auth.model";
import { Types } from "mongoose";
import { sendNotificationToMultipleUsers } from "../../utils/sendNotificationToMultipleUsers";

type TQuery = {
  keyword?: string;
  status?: string;
};

const forwardMessageToOthers = async (payload: any) => {
  const { emergencyMessageId, userIds } = payload;

  const emergencyMessage = await Emergency.findById(emergencyMessageId).populate("userId") as any;

  if (!emergencyMessage) {
    throw new AppError(httpStatus.NOT_FOUND, "Emergency message not found");
  };


  const title = "Emergency alert on your area";
  const message = emergencyMessage?.message || "";
  const data = {
    name: emergencyMessage?.userId?.name || "",
    location: emergencyMessage?.location || "",
    phoneNumber: emergencyMessage?.phoneNumber || emergencyMessage?.userId?.phoneNumber || "",
  }

  await sendNotificationToMultipleUsers(
    userIds,
    title,
    message,
    data
  );

  return {};
};

// Create emergency post (For user)
const postEmergency = async (payload: TEmergency) => {
  const result = await Emergency.create(payload);

  //FInding Admins and Moderators
  const adminsAndModerators = await User.find({
    role: { $in: ["admin", "moderator"] },
  }).select("_id");

  // Sending Notification
  const notificationPromises = adminsAndModerators.map((admin) =>
    sendSingleNotification(
      admin._id as unknown as Types.ObjectId,
      "Emergency Alert 🚨",
      `A new emergency has been reported from ${payload?.location || ""}.`,
      `/dashboard/emergency/${result._id}`
    )
  );

  await Promise.all(notificationPromises);

  return result;
};

// Get all emergency posts with search and filter by status
const getAllEmergencyPosts = async (query: TQuery) => {
  const { keyword, status } = query;

  const filter: any = {};

  if (keyword) {
    filter.message = { $regex: keyword, $options: "i" };
  }

  if (status) {
    filter.status = status;
  }

  const result = await Emergency.find(filter).populate("userId");
  return result;
};

// Get single emergency post by id
const getSingleEmergencyPostById = async (emergencyId: string) => {
  const result = await Emergency.findById(emergencyId);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Emergency post not found");
  }
  return result;
};

// Change emergency post status
const changeEmergencyPostStatus = async (
  emergencyId: string,
  status: "pending" | "processing" | "resolved"
) => {
  const emergencyPost = await Emergency.findById(emergencyId);
  if (!emergencyPost) {
    throw new Error("Emergency post not found");
  }

  // Update status
  emergencyPost.status = status;

  if (status === "resolved") {
    emergencyPost.resolvedAt = new Date();
  }

  await emergencyPost.save();
  return emergencyPost;
};

// Update emergency post
const updateEmergencyPost = async (
  emergencyId: string,
  payload: Partial<TEmergency>
) => {
  const existingPost = await Emergency.findById(emergencyId);

  if (!existingPost) {
    throw new AppError(httpStatus.NOT_FOUND, "Emergency post not found");
  }

  const result = await Emergency.findByIdAndUpdate(emergencyId, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

// Delete product by id
const deleteEmergencyPost = async (emergencyId: string) => {
  const result = await Product.findByIdAndDelete(emergencyId);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Emergency post not found");
  }
  return {};
};

export const EmergencyServices = {
  forwardMessageToOthers,
  postEmergency,
  getAllEmergencyPosts,
  getSingleEmergencyPostById,
  updateEmergencyPost,
  changeEmergencyPostStatus,
  deleteEmergencyPost,
};
