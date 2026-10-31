import httpStatus from "http-status";
import { QuizProgressServices } from "./quizProgress.service";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";



const getMyProgress = catchAsync(async (req, res) => {
  const { id: quizId } = req.params;
  const userId = req.user._id;

  const result = await QuizProgressServices.getMyProgress(quizId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Progress fetched successfully",
    data: result,
  });
});



const getLeaderboard = catchAsync(async (req, res) => {
  const { id: quizId } = req.params;

  const result = await QuizProgressServices.getLeaderboard(quizId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Leaderboard fetched successfully",
    data: result,
  });
});

const claimReward = catchAsync(async (req, res) => {
  const { id: quizId } = req.params;
  const { rewardClaimMethod, paymentDetails } = req.body;
  const userId = req.user._id;

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

export const QuizProgressControllers = {
  getMyProgress,
  getLeaderboard,
  claimReward,
};