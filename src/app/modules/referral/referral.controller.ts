import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { ReferralServices } from "./referral.service";
import sendResponse from "../../utils/sendResponse";

const generateReferralCode = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await ReferralServices.generateReferralCode(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Referral code generated successfully",
    data: result,
  });
});

const getMyReferrals = catchAsync(async (req, res) => {
  const { skip = "0", limit = "10" } = req.query;
  const userId = req.user.userId;

  const result = await ReferralServices.getMyReferrals(userId, Number(skip),
    Number(limit));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Referral list fetched successfully",
    data: result,
  });
});

const getAllReferralsOfAnUser = catchAsync(async (req, res) => {
  const { skip = "0", limit = "10" } = req.query;
  const { userId } = req.params;

  const result = await ReferralServices.getAllReferralsOfAnUser(userId, Number(skip),
    Number(limit));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Referral list fetched successfully",
    data: result,
  });
});

const getMyCoins = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await ReferralServices.getMyCoins(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Coin history fetched successfully",
    data: result,
  });
});

export const ReferralControllers = {
  generateReferralCode,
  getMyReferrals,
  getAllReferralsOfAnUser,
  getMyCoins,
};