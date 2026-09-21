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
exports.ProjectServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const project_model_1 = __importDefault(require("./project.model"));
const infinitePaginate_1 = require("../../utils/infinitePaginate");
const deleteImageFromCloudinary_1 = require("../../utils/deleteImageFromCloudinary");
// Create project (admin only)
const addProject = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrl = "";
    if (file) {
        const imageName = `${payload.title}-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    const payloadData = Object.assign(Object.assign({}, payload), { amountNeeded: Number(payload.amountNeeded), amountRaised: 0, donors: [], imageUrl });
    const result = yield project_model_1.default.create(payloadData);
    return result;
});
// Get all projects (with optional keyword & category)
const getAllProjects = (keyword_1, ...args_1) => __awaiter(void 0, [keyword_1, ...args_1], void 0, function* (keyword, skip = 0, limit = 10) {
    const query = {};
    // 🔍 Search
    if (keyword) {
        query.$or = [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
        ];
    }
    return (0, infinitePaginate_1.infinitePaginate)(project_model_1.default, query, skip, limit, []);
});
// Get a single project by ID
const getSingleProjectById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield project_model_1.default.findById(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Project not found");
    }
    return result;
});
// Update project by ID
const updateProject = (id, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield project_model_1.default.findById(id);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Project not found");
    }
    let imageUrl;
    if (file) {
        const imageName = `${(payload === null || payload === void 0 ? void 0 : payload.title) || existing.title}-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    const updatePayload = Object.assign(Object.assign({}, payload), (imageUrl && { imageUrl }));
    const result = yield project_model_1.default.findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
    });
    return result;
});
// Delete project by ID
const deleteProject = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield project_model_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Project not found");
    }
    if (result.imageUrl) {
        const publicId = (0, deleteImageFromCloudinary_1.extractPublicId)(result.imageUrl);
        yield (0, deleteImageFromCloudinary_1.deleteImageFromCloudinary)(publicId);
    }
    return result;
});
exports.ProjectServices = {
    addProject,
    getAllProjects,
    getSingleProjectById,
    updateProject,
    deleteProject,
};
