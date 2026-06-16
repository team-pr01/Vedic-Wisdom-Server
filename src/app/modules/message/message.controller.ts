/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MessageServices } from "./message.service";


/* Get Messages Between Two Users */
const getMessages = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const { otherUserId } = req.params;
    const { skip = "0", limit = "50" } = req.query;

    const result = await MessageServices.getMessages(
        userId,
        otherUserId,
        Number(skip),
        Number(limit)
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Messages fetched successfully",
        data: result,
    });
});

/* Get Unread Count */
const getUnreadCount = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const result = await MessageServices.getUnreadCount(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Unread count fetched successfully",
        data: { unreadCount: result },
    });
});

/* Mark Single Message as Read */
const markSingleMessageAsRead = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const { messageId } = req.params;

    const result = await MessageServices.markSingleMessageAsRead(userId, messageId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: result.data,
    });
});

export const MessageControllers = {
    getMessages,
    getUnreadCount,
    markSingleMessageAsRead
};