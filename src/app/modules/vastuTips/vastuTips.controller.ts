import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { VastuTipsServices } from "./vastuTips.service";

/* ================= ADD ================= */
const addVastuTips = catchAsync(async (req, res) => {
  const result = await VastuTipsServices.addVastuTips(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Vastu Tips added successfully",
    data: result,
  });
});

/* ================= GET ALL ================= */
const getAllVastuTips = catchAsync(async (req, res) => {
  const {
    keyword,
    category,
    skip = "0",
    limit = "10",
  } = req.query;

  const filters = {
    keyword: keyword as string,
    category: category as string,
  };

  const result = await VastuTipsServices.getAllVastuTips(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vastu Tips fetched successfully",
    data: {
      vastuTips: result.data,
      meta: result.meta,
    },
  });
});

/* ================= GET SINGLE ================= */
const getSingleVastuTips = catchAsync(async (req, res) => {
  const result = await VastuTipsServices.getSingleVastuTips(
    req.params.id
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vastu Tips fetched successfully",
    data: result,
  });
});

/* ================= UPDATE ================= */
const updateVastuTips = catchAsync(async (req, res) => {
  const result = await VastuTipsServices.updateVastuTips(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vastu Tips updated successfully",
    data: result,
  });
});

/* ================= DELETE ================= */
const deleteVastuTips = catchAsync(async (req, res) => {
  const result = await VastuTipsServices.deleteVastuTips(
    req.params.id
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vastu Tips deleted successfully",
    data: result,
  });
});

export const VastuTipsControllers = {
  addVastuTips,
  getAllVastuTips,
  getSingleVastuTips,
  updateVastuTips,
  deleteVastuTips,
};