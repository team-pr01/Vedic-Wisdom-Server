"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationToMultipleUsers = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const auth_model_1 = require("../modules/auth/auth.model");
const notification_model_1 = require("../modules/notification/notification.model");
const server_1 = require("../../server");
const sendNotificationToMultipleUsers = (userIds, title, message, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userIds.length)
        return;
    // 1️⃣ Fetch users
    const users = yield auth_model_1.User.find({ _id: { $in: userIds } }).select("_id");
    if (!users.length)
        return;
    // 2️⃣ Save ONE notification entry
    const createdNotification = yield notification_model_1.Notification.create({
        to: users.map((u) => u._id),
        title,
        message,
        data,
    });
    // 3️⃣ Emit socket event ONLY to intended users
    users.forEach((user) => {
        server_1.io.to(user._id.toString()).emit("new-notification", {
            _id: createdNotification._id,
            title,
            message,
            data,
            createdAt: createdNotification.createdAt,
        });
    });
});
exports.sendNotificationToMultipleUsers = sendNotificationToMultipleUsers;
