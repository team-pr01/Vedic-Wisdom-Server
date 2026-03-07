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
exports.VastuControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const vastu_services_1 = require("./vastu.services");
// Add vastu (For admin)
const addVastu = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vastu_services_1.VastuServices.addVastu(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Vastu added successfully',
        data: result,
    });
}));
// Get all vastus
const getAllVastus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, category, skip = "0", limit = "10", } = req.query;
    const filters = {
        keyword: keyword,
        category: category,
    };
    const result = yield vastu_services_1.VastuServices.getAllVastus(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Vastus fetched successfully.",
        data: {
            vastus: result.data,
            meta: result.meta,
        },
    });
}));
// Get single vastu by id
const getSingleVastuById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vastuId } = req.params;
    const result = yield vastu_services_1.VastuServices.getSingleVastuById(vastuId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Vastu fetched successfully.',
        data: result,
    });
}));
// Update vastu
const updateVastu = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vastuId } = req.params;
    const result = yield vastu_services_1.VastuServices.updateVastu(vastuId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Vastu details updated successfully',
        data: result,
    });
}));
// Delete vastu by id
const deleteVastu = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vastuId } = req.params;
    const result = yield vastu_services_1.VastuServices.deleteVastu(vastuId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Vastu deleted successfully',
        data: result,
    });
}));
exports.VastuControllers = {
    addVastu,
    getAllVastus,
    getSingleVastuById,
    updateVastu,
    deleteVastu,
};
