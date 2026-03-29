/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import Consultation from "./consultations.model";
import { TConsultation } from "./consultations.interface";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import { sendSingleNotification } from "../../../utils/sendSingleNotification";

const generateConsultationId = (): string => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 random digits
  return `C-${randomDigits}`;
};

// Book a consultation
const bookConsultation = async (payload: TConsultation, userId: string) => {
  const payloadData = {
    ...payload,
    userId,
    consultationId: generateConsultationId(),
  };

  const result = await Consultation.create(payloadData);
  return result;
};

// Get all consultations (admin)
const getAllConsultations = async (
  keyword?: string,
  status?: string,
  skip = 0,
  limit = 10
) => {
  const query: any = {};

  /*  SEARCH */
  if (keyword) {
    query.$or = [
      { consultationId: { $regex: keyword, $options: "i" } },

      { $text: { $search: keyword } },
    ];
  }

  /* FILTER */
  if (status) {
    query.status = status.trim().toLowerCase();
  }

  return infinitePaginate(Consultation, query, skip, limit, [
    { path: "userId", select: "name email phoneNumber" },
    { path: "consultantId", select: "name specialty category email phoneNumber" },
  ]);
};

// Get single consultation by id
const getSingleConsultationById = async (consultationId: string) => {
  const result = await Consultation.findById(consultationId);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Consultation not found");
  }
  return result;
};

// Get my consultations (logged-in user)
const getMyConsultations = async (userId: string) => {
  const result = await Consultation.find({ userId });
  return result;
};

const scheduleConsultation = async (consultationId: string, payload: any) => {
  const existing = await Consultation.findById(consultationId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Consultation not found");
  }

  existing.scheduledAt = new Date(payload?.scheduledAt);
  existing.meetingLink = payload?.meetingLink;
  existing.status = "scheduled";
  await existing.save();

  // Populate user and consultant for consistency
  const result = await Consultation.findById(consultationId)
    .populate("userId", "name email phoneNumber")
    .populate("consultantId", "name email phoneNumber");

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Consultation not found after update");
  }

  const userId = (result.userId as any)?._id;
  const meetingLink = result.meetingLink || "";

  if (userId) {
    sendSingleNotification(
      userId,
      "Consultation Scheduled 🗓️",
      `Your consultation has been scheduled. Meeting link: ${meetingLink}`,
      `/my-consultations/${result._id}`,
      meetingLink
    );
  }

  return result;
};

// Update consultation status (admin)
const updateConsultationStatus = async (
  consultationId: string,
  status: string
) => {
  const existing = await Consultation.findById(consultationId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Consultation not found");
  }

  const result = await Consultation.findByIdAndUpdate(
    consultationId,
    { status },
    { new: true, runValidators: true }
  );

  return result;
};

// Delete consultation
const deleteConsultation = async (consultationId: string) => {
  const result = await Consultation.findByIdAndDelete(consultationId);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Consultation not found");
  }
  return result;
};

export const ConsultationServices = {
  bookConsultation,
  getAllConsultations,
  getSingleConsultationById,
  getMyConsultations,
  scheduleConsultation,
  updateConsultationStatus,
  deleteConsultation,
};
