import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DonationProgramsService } from "./donationPrograms.services";

// Create donation program (For admin)
const addDonationProgram = catchAsync(async (req, res) => {
  const file = req.file;
  const result = await DonationProgramsService.addDonationProgram(
    req.body,
    file
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation program created successfully",
    data: result,
  });
});

// Get all donation programs
const getAllDonationPrograms = catchAsync(async (req, res) => {
  const { keyword, skip = "0", limit = "10" } = req.query;

  const result = await DonationProgramsService.getAllDonationPrograms(
    keyword as string,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All donation programs fetched successfully",
    data: {
      donationPrograms: result.data,
      meta: result.meta,
    },
  });
});

// Get single donation program by ID
const getSingleDonationProgramById = catchAsync(async (req, res) => {
  const { donationProgramId } = req.params;
  const result = await DonationProgramsService.getSingleDonationProgramById(
    donationProgramId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation program fetched successfully",
    data: result,
  });
});

// Update donation program
const updateDonationProgram = catchAsync(async (req, res) => {
  const file = req.file;
  const { donationProgramId } = req.params;
  const result = await DonationProgramsService.updateDonationProgram(
    donationProgramId,
    req.body,
    file
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation program updated successfully",
    data: result,
  });
});

// Delete donation program
const deleteDonationProgram = catchAsync(async (req, res) => {
  const { donationProgramId } = req.params;
  const result = await DonationProgramsService.deleteDonationProgram(donationProgramId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation program deleted successfully",
    data: result,
  });
});

export const DonationProgramsController = {
  addDonationProgram,
  getAllDonationPrograms,
  getSingleDonationProgramById,
  updateDonationProgram,
  deleteDonationProgram,
};
