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
exports.DonationProgramsController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const donationPrograms_services_1 = require("./donationPrograms.services");
// Create donation program (For admin)
const addDonationProgram = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const result = yield donationPrograms_services_1.DonationProgramsService.addDonationProgram(req.body, file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donation program created successfully",
        data: result,
    });
}));
// Get all donation programs
const getAllDonationPrograms = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, skip = "0", limit = "10" } = req.query;
    const result = yield donationPrograms_services_1.DonationProgramsService.getAllDonationPrograms(keyword, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All donation programs fetched successfully",
        data: {
            donationPrograms: result.data,
            meta: result.meta,
        },
    });
}));
// Get single donation program by ID
const getSingleDonationProgramById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { donationProgramId } = req.params;
    const result = yield donationPrograms_services_1.DonationProgramsService.getSingleDonationProgramById(donationProgramId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donation program fetched successfully",
        data: result,
    });
}));
// Update donation program
const updateDonationProgram = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const { donationProgramId } = req.params;
    const result = yield donationPrograms_services_1.DonationProgramsService.updateDonationProgram(donationProgramId, req.body, file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donation program updated successfully",
        data: result,
    });
}));
// Delete donation program
const deleteDonationProgram = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { donationProgramId } = req.params;
    const result = yield donationPrograms_services_1.DonationProgramsService.deleteDonationProgram(donationProgramId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donation program deleted successfully",
        data: result,
    });
}));
exports.DonationProgramsController = {
    addDonationProgram,
    getAllDonationPrograms,
    getSingleDonationProgramById,
    updateDonationProgram,
    deleteDonationProgram,
};
