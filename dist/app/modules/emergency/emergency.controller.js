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
exports.EmergencyControllers = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const emergency_services_1 = require("./emergency.services");
// Send emergency message by admin
const forwardMessageToOthers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield emergency_services_1.EmergencyServices.forwardMessageToOthers(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Message forwarded successfully",
        data: result,
    });
}));
// Create emergency post (For user)
const postEmergency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield emergency_services_1.EmergencyServices.postEmergency(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "We have received your request and will get back to you soon.",
        data: result,
    });
}));
// Get all emergency posts with search and filter by status
const getAllEmergencyPosts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, status } = req.query;
    const result = yield emergency_services_1.EmergencyServices.getAllEmergencyPosts({
        keyword: keyword,
        status: status,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Emergency posts fetched successfully.",
        data: result,
    });
}));
// Get single product by id
const getSingleEmergencyPostById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emergencyId } = req.params;
    const result = yield emergency_services_1.EmergencyServices.getSingleEmergencyPostById(emergencyId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Post fetched successfully.",
        data: result,
    });
}));
// Update emergency post
const updateEmergencyPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emergencyId } = req.params;
    const result = yield emergency_services_1.EmergencyServices.updateEmergencyPost(emergencyId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Emergency post updated successfully",
        data: result,
    });
}));
// Change emergency post status
const changeEmergencyPostStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emergencyId } = req.params;
    const { status } = req.body;
    const result = yield emergency_services_1.EmergencyServices.changeEmergencyPostStatus(emergencyId, status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User role updated to admin successfully",
        data: result,
    });
}));
// Delete emergency post by id
const deleteEmergencyPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emergencyId } = req.params;
    const result = yield emergency_services_1.EmergencyServices.deleteEmergencyPost(emergencyId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Emergency post deleted successfully",
        data: result,
    });
}));
exports.EmergencyControllers = {
    forwardMessageToOthers,
    postEmergency,
    getAllEmergencyPosts,
    getSingleEmergencyPostById,
    updateEmergencyPost,
    changeEmergencyPostStatus,
    deleteEmergencyPost,
};
