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
exports.TempleServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const infinitePaginate_1 = require("../../utils/infinitePaginate");
const temple_model_1 = require("./temple.model");
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const addTemple = (user_1, payload_1, ...args_1) => __awaiter(void 0, [user_1, payload_1, ...args_1], void 0, function* (user, payload, files = []) {
    if (!payload) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid payload");
    }
    if (!payload.basicInfo) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "basicInfo is required");
    }
    if (!payload.location) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "location is required");
    }
    /* ---------------- IMAGE VALIDATION ---------------- */
    if (files.length > 10) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Maximum 10 images allowed");
    }
    /* ---------------- UPLOAD IMAGES ---------------- */
    let imageUrls = [];
    if (files.length > 0) {
        const uploadPromises = files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
            const imageName = `${payload.basicInfo.templeName || "temple"}-${Date.now()}-${index}`;
            const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, file.path);
            return secure_url;
        }));
        imageUrls = yield Promise.all(uploadPromises);
    }
    /* ---------------- STATUS ---------------- */
    const status = user.role === "admin" ? "approved" : "pending";
    /* ---------------- FINAL DATA ---------------- */
    const templeData = Object.assign(Object.assign({}, payload), { media: Object.assign(Object.assign({}, (payload.media || {})), { imageUrls }), createdBy: user.userId, status });
    return temple_model_1.Temple.create(templeData);
});
const splitMulti = (value) => value ? value.split(",").map((v) => v.trim()) : [];
const getAllTemples = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const filteredQuery = { status: { $regex: "^approved$", $options: "i" } };
    /* -------- SEARCH (TEXT INDEX) -------- */
    if (filters.keyword) {
        filteredQuery.$text = { $search: filters.keyword };
    }
    /* -------- COUNTRY -------- */
    if (filters.country) {
        const countries = splitMulti(filters.country);
        filteredQuery["location.country"] =
            countries.length === 1
                ? { $regex: `^${countries[0]}$`, $options: "i" }
                : {
                    $in: countries.map((c) => new RegExp(`^${c}$`, "i")),
                };
    }
    /* -------- CITY -------- */
    if (filters.city) {
        const cities = splitMulti(filters.city);
        filteredQuery["location.city"] =
            cities.length === 1
                ? { $regex: `^${cities[0]}$`, $options: "i" }
                : {
                    $in: cities.map((c) => new RegExp(`^${c}$`, "i")),
                };
    }
    /* -------- AREA -------- */
    if (filters.area) {
        const areas = splitMulti(filters.area);
        filteredQuery["location.area"] =
            areas.length === 1
                ? { $regex: `^${areas[0]}$`, $options: "i" }
                : {
                    $in: areas.map((a) => new RegExp(`^${a}$`, "i")),
                };
    }
    /* -------- CATEGORY -------- */
    if (filters.category) {
        const categories = splitMulti(filters.category);
        filteredQuery.category =
            categories.length === 1
                ? categories[0]
                : { $in: categories };
    }
    /* -------- STATUS (ADMIN) -------- */
    if (filters.status) {
        filteredQuery.status = {
            $regex: `^${filters.status}$`,
            $options: "i",
        };
    }
    return (0, infinitePaginate_1.infinitePaginate)(temple_model_1.Temple, filteredQuery, skip, limit, [
        { path: "category", select: "name" },
        { path: "createdBy", select: "name email" },
    ]);
});
//    GET SINGLE
const getSingleTempleById = (templeId) => __awaiter(void 0, void 0, void 0, function* () {
    const temple = yield temple_model_1.Temple.findById(templeId)
        .populate("category", "name")
        .populate("createdBy", "name email");
    if (!temple) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Temple not found");
    }
    return temple;
});
//    UPDATE
const updateTemple = (templeId_1, user_1, payload_1, ...args_1) => __awaiter(void 0, [templeId_1, user_1, payload_1, ...args_1], void 0, function* (templeId, user, payload, files = []) {
    var _a;
    const temple = yield temple_model_1.Temple.findById(templeId);
    if (!temple) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Temple not found");
    }
    // Authorization
    if (temple.createdBy.toString() !== user.userId &&
        user.role !== "admin") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Not authorized");
    }
    /* ---------------- HANDLE IMAGE UPLOAD ---------------- */
    let imageUrls = ((_a = temple.media) === null || _a === void 0 ? void 0 : _a.imageUrls) || [];
    if (files.length > 0) {
        if (files.length + imageUrls.length > 10) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Maximum 10 images allowed");
        }
        const uploadPromises = files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const imageName = `${((_a = payload.basicInfo) === null || _a === void 0 ? void 0 : _a.templeName) ||
                ((_b = temple.basicInfo) === null || _b === void 0 ? void 0 : _b.templeName) ||
                "temple"}-${Date.now()}-${index}`;
            const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, file.path);
            return secure_url;
        }));
        const newImages = yield Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImages];
    }
    /* ---------------- BUILD UPDATE OBJECT ---------------- */
    const updateData = Object.assign(Object.assign({}, payload), { media: Object.assign(Object.assign(Object.assign({}, temple.media), (payload.media || {})), { imageUrls }) });
    const updatedTemple = yield temple_model_1.Temple.findByIdAndUpdate(templeId, updateData, { new: true, runValidators: true });
    return updatedTemple;
});
//    UPDATE STATUS
const updateTempleStatus = (templeId, status) => __awaiter(void 0, void 0, void 0, function* () {
    return temple_model_1.Temple.findByIdAndUpdate(templeId, { status }, { new: true });
});
//    DELETE
const deleteTemple = (templeId) => __awaiter(void 0, void 0, void 0, function* () {
    const temple = yield temple_model_1.Temple.findById(templeId);
    if (!temple) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Temple not found");
    }
    ;
    return temple_model_1.Temple.findByIdAndDelete(templeId);
});
// ADD EVENT
const addEvent = (templeId_1, eventPayload_1, ...args_1) => __awaiter(void 0, [templeId_1, eventPayload_1, ...args_1], void 0, function* (templeId, eventPayload, files = []) {
    if (!eventPayload) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Event data is required");
    }
    const temple = yield temple_model_1.Temple.findById(templeId);
    if (!temple) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Temple not found");
    }
    if (files.length > 5) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Maximum 5 images allowed for event");
    }
    let imageUrls = [];
    if (files.length > 0) {
        const uploadPromises = files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
            const imageName = `${eventPayload.name}-${Date.now()}-${index}`;
            const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, file.path);
            return secure_url;
        }));
        imageUrls = yield Promise.all(uploadPromises);
    }
    const newEvent = Object.assign(Object.assign({}, eventPayload), { imageUrls });
    temple.event = temple.event || [];
    temple.event.push(newEvent);
    yield temple.save();
    return temple;
});
// UPDATE EVENT
const updateEvent = (templeId_1, eventId_1, eventPayload_1, ...args_1) => __awaiter(void 0, [templeId_1, eventId_1, eventPayload_1, ...args_1], void 0, function* (templeId, eventId, eventPayload, files = []) {
    const temple = yield temple_model_1.Temple.findById(templeId);
    if (!temple) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Temple not found");
    }
    // Ensure event is an array
    if (!Array.isArray(temple.event)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid event structure");
    }
    const eventIndex = temple.event.findIndex((ev) => ev._id.toString() === eventId);
    if (eventIndex === -1) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Event not found");
    }
    const existingEvent = temple.event[eventIndex];
    /* ---------------- PARTIAL FIELD UPDATE ---------------- */
    if ((eventPayload === null || eventPayload === void 0 ? void 0 : eventPayload.name) !== undefined) {
        existingEvent.name = eventPayload.name;
    }
    if ((eventPayload === null || eventPayload === void 0 ? void 0 : eventPayload.date) !== undefined) {
        existingEvent.date = eventPayload.date;
    }
    if ((eventPayload === null || eventPayload === void 0 ? void 0 : eventPayload.description) !== undefined) {
        existingEvent.description = eventPayload.description;
    }
    /* ---------------- IMAGE UPDATE (REPLACE ONLY IF NEW FILES) ---------------- */
    if (files.length > 0) {
        if (files.length > 5) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Maximum 5 images allowed for event");
        }
        const uploadPromises = files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
            const imageName = `${existingEvent.name}-${Date.now()}-${index}`;
            const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, file.path);
            return secure_url;
        }));
        existingEvent.imageUrls = yield Promise.all(uploadPromises);
    }
    yield temple.save();
    return temple;
});
// DELETE EVENT
const deleteEvent = (templeId, eventId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const temple = yield temple_model_1.Temple.findById(templeId);
    if (!temple) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Temple not found");
    }
    temple.event = (_a = temple.event) === null || _a === void 0 ? void 0 : _a.filter((ev) => ev._id.toString() !== eventId);
    yield temple.save();
    return temple;
});
exports.TempleServices = {
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
