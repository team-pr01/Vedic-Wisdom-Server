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
exports.TempleController = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const temple_service_1 = require("./temple.service");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const safeParse = (value) => {
    if (!value)
        return undefined;
    try {
        return typeof value === "string" ? JSON.parse(value) : value;
    }
    catch (_a) {
        throw new AppError_1.default(400, "Invalid JSON format in request body");
    }
};
const addTemple = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files || [];
    // Parse multipart JSON fields safely
    const parsedBody = Object.assign(Object.assign({}, req.body), { basicInfo: safeParse(req.body.basicInfo), socialMedia: safeParse(req.body.socialMedia), location: safeParse(req.body.location), otherInfo: safeParse(req.body.otherInfo), media: safeParse(req.body.media) || {} });
    const result = yield temple_service_1.TempleServices.addTemple(req.user, parsedBody, files);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Temple submitted successfully",
        data: result,
    });
}));
const getAllTemples = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, country, city, area, category, status, skip = "0", limit = "10", } = req.query;
    const filters = {
        keyword: keyword,
        country: country,
        city: city,
        area: area,
        category: category,
        status: status,
    };
    const result = yield temple_service_1.TempleServices.getAllTemples(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Temples retrieved successfully",
        data: {
            temples: result.data,
            meta: result.meta,
        },
    });
}));
/* ---------------- GET SINGLE ---------------- */
const getSingleTempleById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield temple_service_1.TempleServices.getSingleTempleById(req.params.templeId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Temple retrieved successfully",
        data: result,
    });
}));
/* ---------------- UPDATE ---------------- */
const updateTemple = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files || [];
    const parsedBody = Object.assign(Object.assign({}, req.body), { basicInfo: safeParse(req.body.basicInfo), socialMedia: safeParse(req.body.socialMedia), location: safeParse(req.body.location), otherInfo: safeParse(req.body.otherInfo), media: safeParse(req.body.media) });
    const result = yield temple_service_1.TempleServices.updateTemple(req.params.templeId, req.user, parsedBody, files);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Temple updated successfully",
        data: result,
    });
}));
/* ---------------- UPDATE STATUS ---------------- */
const updateTempleStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield temple_service_1.TempleServices.updateTempleStatus(req.params.templeId, req.body.status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Temple status updated successfully",
        data: result,
    });
}));
/* ---------------- DELETE ---------------- */
const deleteTemple = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield temple_service_1.TempleServices.deleteTemple(req.params.templeId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Temple deleted successfully",
        data: result,
    });
}));
const addEvent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templeId } = req.params;
    const files = req.files || [];
    const parsedBody = Object.assign(Object.assign({}, req.body), { event: safeParse(req.body.event) });
    const result = yield temple_service_1.TempleServices.addEvent(templeId, parsedBody.event, files);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Event added successfully",
        data: result,
    });
}));
// UPDATE EVENT
const updateEvent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templeId, eventId } = req.params;
    const files = req.files || [];
    const parsedBody = Object.assign(Object.assign({}, req.body), { event: safeParse(req.body.event) });
    const result = yield temple_service_1.TempleServices.updateEvent(templeId, eventId, parsedBody.event, files);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Event updated successfully",
        data: result,
    });
}));
// DELETE EVENT
const deleteEvent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templeId, eventId } = req.params;
    const result = yield temple_service_1.TempleServices.deleteEvent(templeId, eventId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Event deleted successfully",
        data: result,
    });
}));
exports.TempleController = {
    addTemple,
    getAllTemples,
    getSingleTempleById,
    updateTemple,
    updateTempleStatus,
    deleteTemple,
    addEvent,
    updateEvent,
    deleteEvent,
};
