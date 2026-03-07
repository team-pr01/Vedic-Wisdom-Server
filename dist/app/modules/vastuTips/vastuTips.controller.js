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
exports.VastuTipsControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const vastuTips_service_1 = require("./vastuTips.service");
/* ================= ADD ================= */
const addVastuTips = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vastuTips_service_1.VastuTipsServices.addVastuTips(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Vastu Tips added successfully",
        data: result,
    });
}));
/* ================= GET ALL ================= */
const getAllVastuTips = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, category, skip = "0", limit = "10", } = req.query;
    const filters = {
        keyword: keyword,
        category: category,
    };
    const result = yield vastuTips_service_1.VastuTipsServices.getAllVastuTips(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Vastu Tips fetched successfully",
        data: {
            vastuTips: result.data,
            meta: result.meta,
        },
    });
}));
/* ================= GET SINGLE ================= */
const getSingleVastuTips = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vastuTips_service_1.VastuTipsServices.getSingleVastuTips(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Vastu Tips fetched successfully",
        data: result,
    });
}));
/* ================= UPDATE ================= */
const updateVastuTips = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vastuTips_service_1.VastuTipsServices.updateVastuTips(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Vastu Tips updated successfully",
        data: result,
    });
}));
/* ================= DELETE ================= */
const deleteVastuTips = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vastuTips_service_1.VastuTipsServices.deleteVastuTips(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Vastu Tips deleted successfully",
        data: result,
    });
}));
exports.VastuTipsControllers = {
    addVastuTips,
    getAllVastuTips,
    getSingleVastuTips,
    updateVastuTips,
    deleteVastuTips,
};
