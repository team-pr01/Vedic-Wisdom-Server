import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ChatServices } from "./chat.service";

/* Get Chat List */
const getChatList = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    console.log(userId);
    const result = await ChatServices.getChatList(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Chat list fetched successfully",
        data: result,
    });
});


export const ChatControllers = {
    getChatList
};