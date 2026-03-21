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
exports.VendorControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const vendor_service_1 = require("./vendor.service");
const applyVendor = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files || [];
    const result = yield vendor_service_1.VendorServices.applyVendor(req.user, req.body, files);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Vendor applied successfully",
        data: result,
    });
}));
/* Pending Applications */
const getPendingVendorApplications = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { skip = "0", limit = "10" } = req.query;
    const result = yield vendor_service_1.VendorServices.getPendingVendorApplications(Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Pending vendor applications fetched",
        data: result,
    });
}));
/* All Vendors */
const getAllVendors = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, status, skip = "0", limit = "10" } = req.query;
    const filters = {
        keyword: keyword,
        status: status,
    };
    const result = yield vendor_service_1.VendorServices.getAllVendors(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Vendors fetched successfully",
        data: result,
    });
}));
/* Single Vendor */
const getSingleVendorById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorId } = req.params;
    const result = yield vendor_service_1.VendorServices.getSingleVendorById(vendorId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Vendor fetched successfully",
        data: result,
    });
}));
// For vendors
const getMyVendorStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.user);
    const result = yield vendor_service_1.VendorServices.getMyVendorStats(req.user.userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Vendor dashboard fetched",
        data: result,
    });
}));
const updateVendorStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorId } = req.params;
    const { status } = req.body;
    const result = yield vendor_service_1.VendorServices.updateVendorStatus(vendorId, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Vendor status updated",
        data: result,
    });
}));
/* Suspend Vendor */
const suspendVendor = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorId } = req.params;
    const result = yield vendor_service_1.VendorServices.suspendVendor(vendorId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Vendor suspended successfully",
        data: result,
    });
}));
/* Withdraw Suspension */
const withdrawVendorSuspension = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorId } = req.params;
    const result = yield vendor_service_1.VendorServices.withdrawVendorSuspension(vendorId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Vendor suspension withdrawn successfully",
        data: result,
    });
}));
exports.VendorControllers = {
    applyVendor,
    getPendingVendorApplications,
    getAllVendors,
    getSingleVendorById,
    getMyVendorStats,
    updateVendorStatus,
    suspendVendor,
    withdrawVendorSuspension,
};
