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
exports.CourseServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const course_model_1 = __importDefault(require("./course.model"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const infinitePaginate_1 = require("../../utils/infinitePaginate");
const addCourse = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    let thumbnail = "";
    if (file) {
        const imageName = `${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        thumbnail = secure_url;
    }
    const payloadData = Object.assign(Object.assign({}, payload), { thumbnail });
    const result = yield course_model_1.default.create(payloadData);
    return result;
});
const getAllCourses = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    // Text search
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    // Category filter
    if (filters.category) {
        query.category = filters.category.trim().toLowerCase();
    }
    return (0, infinitePaginate_1.infinitePaginate)(course_model_1.default, query, skip, limit, []);
});
const getSingleCourseById = (courseId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_model_1.default.findById(courseId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Course not found");
    }
    return result;
});
const updateCourse = (courseId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield course_model_1.default.findById(courseId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Course not found");
    }
    let thumbnail;
    if (file) {
        const imageName = `${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        thumbnail = secure_url;
    }
    const updatePayload = Object.assign(Object.assign({}, payload), (thumbnail && { thumbnail }));
    const result = yield course_model_1.default.findByIdAndUpdate(courseId, updatePayload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteCourse = (courseId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield course_model_1.default.findById(courseId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Course not found");
    }
    return yield course_model_1.default.findByIdAndDelete(courseId);
});
exports.CourseServices = {
    addCourse,
    getAllCourses,
    getSingleCourseById,
    updateCourse,
    deleteCourse,
};
