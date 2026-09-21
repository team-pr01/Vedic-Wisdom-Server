import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { VastuServices } from "./vastu.services";

// Add vastu (For admin)
const addVastu = catchAsync(async (req, res) => {
  const result = await VastuServices.addVastu(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vastu added successfully',
    data: result,
  });
});

// Get all vastus
const getAllVastus = catchAsync(async (req, res) => {
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

  const result = await VastuServices.getAllVastus(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vastus fetched successfully.",
    data: {
      vastu: result.data,
      meta: result.meta,
    },
  });
});

// Get single vastu by id
const getSingleVastuById = catchAsync(async (req, res) => {
  const { vastuId } = req.params;
  const result = await VastuServices.getSingleVastuById(vastuId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vastu fetched successfully.',
    data: result,
  });
});

// Update vastu
const updateVastu = catchAsync(async (req, res) => {
  const { vastuId } = req.params;
  const result = await VastuServices.updateVastu(vastuId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vastu details updated successfully',
    data: result,
  });
});

// Delete vastu by id
const deleteVastu = catchAsync(async (req, res) => {
  const { vastuId } = req.params;
  const result = await VastuServices.deleteVastu(vastuId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vastu deleted successfully',
    data: result,
  });
});

export const VastuControllers = {
  addVastu,
  getAllVastus,
  getSingleVastuById,
  updateVastu,
  deleteVastu,
};
