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
exports.PopupControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const popup_services_1 = require("./popup.services");
// Create Popup
const createPopup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const popupData = req.body;
    const file = req.file;
    const result = yield popup_services_1.PopupServices.createPopup(popupData, file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Popup created successfully",
        data: result,
    });
}));
// Get All Popups (optionally filtered)
const getAllPopups = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword } = req.query;
    const result = yield popup_services_1.PopupServices.getAllPopups(keyword);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Popups fetched successfully",
        data: result,
    });
}));
// Get Single Popup by ID
const getPopupById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const popupId = req.params.popupId;
    const result = yield popup_services_1.PopupServices.getPopupById(popupId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Popup fetched successfully",
        data: result,
    });
}));
// Update Popup by ID
const updatePopup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const popupId = req.params.popupId;
    const updatedData = req.body;
    const file = req.file;
    const result = yield popup_services_1.PopupServices.updatePopup(popupId, updatedData, file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Popup updated successfully",
        data: result,
    });
}));
// Delete Popup by ID
const deletePopup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const popupId = req.params.popupId;
    const result = yield popup_services_1.PopupServices.deletePopup(popupId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Popup deleted successfully",
        data: result,
    });
}));
exports.PopupControllers = {
    createPopup,
    getAllPopups,
    getPopupById,
    updatePopup,
    deletePopup,
};
