import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ConsultationServices } from "./consultations.services";

// Book a consultation
const bookConsultation = catchAsync(async (req, res) => {
  const result = await ConsultationServices.bookConsultation(req.body, req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Consultation booked successfully",
    data: result,
  });
});

// Get all consultations (admin)
const getAllConsultations = catchAsync(async (req, res) => {
  const { keyword, status, skip = "0", limit = "10" } = req.query;

  const result = await ConsultationServices.getAllConsultations(
    keyword as string,
    status as string,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Consultations fetched successfully",
    data: {
      consultations: result.data,
      meta: result.meta,
    },
  });
});

// Get single consultation by id
const getSingleConsultationById = catchAsync(async (req, res) => {
  const { consultationId } = req.params;
  const result = await ConsultationServices.getSingleConsultationById(consultationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Consultation fetched successfully.",
    data: result,
  });
});

// Get my consultations (for logged-in user)
const getMyConsultations = catchAsync(async (req, res) => {
  const result = await ConsultationServices.getMyConsultations(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your consultations fetched successfully.",
    data: result,
  });
});

// Schedule a consultation (update scheduledAt)
const scheduleConsultation = catchAsync(async (req, res) => {
  const { consultationId } = req.params;

  const result = await ConsultationServices.scheduleConsultation(consultationId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Consultation scheduled successfully",
    data: result,
  });
});



// Update consultation status (admin)
const updateConsultationStatus = catchAsync(async (req, res) => {
  const { consultationId } = req.params;
  const { status } = req.body;
  const result = await ConsultationServices.updateConsultationStatus(consultationId, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Consultation status updated successfully",
    data: result,
  });
});

// Delete consultation
const deleteConsultation = catchAsync(async (req, res) => {
  const { consultationId } = req.params;
  const result = await ConsultationServices.deleteConsultation(consultationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Consultation deleted successfully",
    data: result,
  });
});

export const ConsultationControllers = {
  bookConsultation,
  getAllConsultations,
  getSingleConsultationById,
  getMyConsultations,
  scheduleConsultation,
  updateConsultationStatus,
  deleteConsultation,
};
