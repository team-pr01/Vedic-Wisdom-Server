import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ConsultancyServiceServices } from "./consultants.services";

// Add consultancy service (For admin)
const addConsultant = catchAsync(async (req, res) => {
  const file = req.file;
  const result = await ConsultancyServiceServices.addConsultant(
    req.body,
    file
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Consultancy service added successfully",
    data: result,
  });
});

// Get all consultancy services
const getAllConsultants = catchAsync(async (req, res) => {
  const { keyword, category, skip = "0", limit = "10" } = req.query;

  const result =
    await ConsultancyServiceServices.getAllConsultants(
      keyword as string,
      category as string,
      Number(skip),
      Number(limit)
    );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All consultancy services fetched successfully",
    data: {
      consultants: result.data,
      meta: result.meta,
    },
  });
});

const getConsultantsByCategory = catchAsync(async (req, res) => {
  const { keyword, skip = "0", limit = "10" } = req.query;
  const {category} = req.params

  if (!category) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Category is required",
      data: null,
    });
  }

  const result = await ConsultancyServiceServices.getConsultantsByCategory(
    category as string,
    keyword as string,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Consultants fetched successfully by category",
    data: result,
  });
});

// Get single consultancy service by ID
const getSingleConsultantsById = catchAsync(async (req, res) => {
  const { consultantId } = req.params;
  const result = await ConsultancyServiceServices.getSingleConsultantsById(
    consultantId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Consultancy service fetched successfully",
    data: result,
  });
});

// Update consultancy service
const updateConsultant = catchAsync(async (req, res) => {
  const file = req.file;
  const { consultantId } = req.params;
  const result = await ConsultancyServiceServices.updateConsultant(
    consultantId,
    req.body,
    file
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Consultant updated successfully",
    data: result,
  });
});

// Delete consultancy service
const deleteConsultant = catchAsync(async (req, res) => {
  const { consultantId } = req.params;
  const result = await ConsultancyServiceServices.deleteConsultant(
    consultantId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Consultancy service deleted successfully",
    data: result,
  });
});

export const ConsultantControllers = {
  addConsultant,
  getAllConsultants,
  getConsultantsByCategory,
  getSingleConsultantsById,
  updateConsultant,
  deleteConsultant,
};
