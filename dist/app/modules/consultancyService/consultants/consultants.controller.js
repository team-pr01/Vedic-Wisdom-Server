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
exports.ConsultantControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const consultants_services_1 = require("./consultants.services");
// Add consultancy service (For admin)
const addConsultant = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const result = yield consultants_services_1.ConsultancyServiceServices.addConsultant(req.body, file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Consultancy service added successfully",
        data: result,
    });
}));
// Get all consultancy services
const getAllConsultants = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, category, skip = "0", limit = "10" } = req.query;
    const result = yield consultants_services_1.ConsultancyServiceServices.getAllConsultants(keyword, category, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All consultancy services fetched successfully",
        data: {
            consultants: result.data,
            meta: result.meta,
        },
    });
}));
const getConsultantsByCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, skip = "0", limit = "10" } = req.query;
    const { category } = req.params;
    if (!category) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "Category is required",
            data: null,
        });
    }
    const result = yield consultants_services_1.ConsultancyServiceServices.getConsultantsByCategory(category, keyword, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Consultants fetched successfully by category",
        data: result,
    });
}));
// Get single consultancy service by ID
const getSingleConsultantsById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { consultantId } = req.params;
    const result = yield consultants_services_1.ConsultancyServiceServices.getSingleConsultantsById(consultantId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Consultancy service fetched successfully",
        data: result,
    });
}));
// Update consultancy service
const updateConsultant = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const { consultantId } = req.params;
    const result = yield consultants_services_1.ConsultancyServiceServices.updateConsultant(consultantId, req.body, file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Consultant updated successfully",
        data: result,
    });
}));
// Delete consultancy service
const deleteConsultant = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { consultantId } = req.params;
    const result = yield consultants_services_1.ConsultancyServiceServices.deleteConsultant(consultantId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Consultancy service deleted successfully",
        data: result,
    });
}));
exports.ConsultantControllers = {
    addConsultant,
    getAllConsultants,
    getConsultantsByCategory,
    getSingleConsultantsById,
    updateConsultant,
    deleteConsultant,
};
