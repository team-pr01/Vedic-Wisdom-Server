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

// message.controller.ts
const markMessagesAsRead = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    const result = await MessageServices.markMessagesAsRead(userId, otherUserId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Messages marked as read",
        data: result,
    });
});

/* Get Unread Count with Specific User */
const getUnreadCountWithUser = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    const count = await MessageServices.getUnreadCountWithUser(userId, otherUserId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Unread count fetched successfully",
        data: { unreadCount: count },
    });
});

export const MessageControllers = {
    getMessages,
    markMessagesAsRead,
    getUnreadCountWithUser
};