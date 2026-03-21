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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const emergency_model_1 = __importDefault(require("./emergency.model"));
const emergency_model_2 = __importDefault(require("./emergency.model"));
const sendSingleNotification_1 = require("../../utils/sendSingleNotification");
const auth_model_1 = require("../auth/auth.model");
const sendNotificationToMultipleUsers_1 = require("../../utils/sendNotificationToMultipleUsers");
const forwardMessageToOthers = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { emergencyMessageId, userIds } = payload;
    const emergencyMessage = yield emergency_model_2.default.findById(emergencyMessageId).populate("userId");
    if (!emergencyMessage) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Emergency message not found");
    }
    ;
    const title = "Emergency alert on your area";
    const message = (emergencyMessage === null || emergencyMessage === void 0 ? void 0 : emergencyMessage.message) || "";
    const data = {
        name: ((_a = emergencyMessage === null || emergencyMessage === void 0 ? void 0 : emergencyMessage.userId) === null || _a === void 0 ? void 0 : _a.name) || "",
        location: (emergencyMessage === null || emergencyMessage === void 0 ? void 0 : emergencyMessage.location) || "",
        phoneNumber: (emergencyMessage === null || emergencyMessage === void 0 ? void 0 : emergencyMessage.phoneNumber) || ((_b = emergencyMessage === null || emergencyMessage === void 0 ? void 0 : emergencyMessage.userId) === null || _b === void 0 ? void 0 : _b.phoneNumber) || "",
    };
    yield (0, sendNotificationToMultipleUsers_1.sendNotificationToMultipleUsers)(userIds, title, message, data);
    return {};
});
// Create emergency post (For user)
const postEmergency = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield emergency_model_2.default.create(payload);
    //FInding Admins and Moderators
    const adminsAndModerators = yield auth_model_1.User.find({
        role: { $in: ["admin", "moderator"] },
    }).select("_id");
    // Sending Notification
    const notificationPromises = adminsAndModerators.map((admin) => (0, sendSingleNotification_1.sendSingleNotification)(admin._id, "Emergency Alert 🚨", `A new emergency has been reported from ${(payload === null || payload === void 0 ? void 0 : payload.location) || ""}.`, `/dashboard/emergency/${result._id}`));
    yield Promise.all(notificationPromises);
    return result;
});
// Get all emergency posts with search and filter by status
const getAllEmergencyPosts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, status } = query;
    const filter = {};
    if (keyword) {
        filter.message = { $regex: keyword, $options: "i" };
    }
    if (status) {
        filter.status = status;
    }
    const result = yield emergency_model_2.default.find(filter).populate("userId");
    return result;
});
// Get single emergency post by id
const getSingleEmergencyPostById = (emergencyId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield emergency_model_2.default.findById(emergencyId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Emergency post not found");
    }
    return result;
});
// Change emergency post status
const changeEmergencyPostStatus = (emergencyId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const emergencyPost = yield emergency_model_2.default.findById(emergencyId);
    if (!emergencyPost) {
        throw new Error("Emergency post not found");
    }
    // Update status
    emergencyPost.status = status;
    if (status === "resolved") {
        emergencyPost.resolvedAt = new Date();
    }
    yield emergencyPost.save();
    return emergencyPost;
});
// Update emergency post
const updateEmergencyPost = (emergencyId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingPost = yield emergency_model_2.default.findById(emergencyId);
    if (!existingPost) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Emergency post not found");
    }
    const result = yield emergency_model_2.default.findByIdAndUpdate(emergencyId, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
// Delete product by id
const deleteEmergencyPost = (emergencyId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield emergency_model_1.default.findByIdAndDelete(emergencyId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Emergency post not found");
    }
    return {};
});
exports.EmergencyServices = {
    forwardMessageToOthers,
    postEmergency,
    getAllEmergencyPosts,
    getSingleEmergencyPostById,
    updateEmergencyPost,
    changeEmergencyPostStatus,
    deleteEmergencyPost,
};
