import httpStatus from "http-status";
import { QuizProgressServices } from "./quizProgress.service";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";


const getMyProgress = catchAsync(async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.userId;

  const result = await QuizProgressServices.getMyProgress(quizId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Progress fetched successfully",
    data: result,
  });
});

const getMyAllProgress = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await QuizProgressServices.getMyAllProgress(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All progress fetched successfully",
    data: result,
  });
});

const getLeaderboard = catchAsync(async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.userId;

  const result = await QuizProgressServices.getLeaderboard(quizId,userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Leaderboard fetched successfully",
    data: result,
  });
});

const claimReward = catchAsync(async (req, res) => {
  const { quizId } = req.params;
  const { rewardClaimMethod, paymentDetails } = req.body;
  const userId = req.user.userId;

  const result = await QuizProgressServices.claimReward(
    quizId,
    userId,
    rewardClaimMethod,
    paymentDetails
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reward claimed successfully",
    data: result,
  });
});

const submitPaymentDetails = catchAsync(async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.userId;
  const { paymentDetails } = req.body;

  const result = await QuizProgressServices.submitPaymentDetails(
    quizId,
    userId,
    paymentDetails
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment details submitted successfully. Your reward will be processed shortly.",
    data: result,
  });
});

const submitCoinRequest = catchAsync(async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.userId;

  const result = await QuizProgressServices.submitCoinRequest(quizId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coin request submitted successfully. It will be processed by the admin.",
    data: result,
  });
});



export const QuizProgressControllers = {
  getMyProgress,
  getMyAllProgress,
  getLeaderboard,
  claimReward,
  submitPaymentDetails,
  submitCoinRequest,
};