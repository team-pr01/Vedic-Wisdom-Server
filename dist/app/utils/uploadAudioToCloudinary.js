"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAudio = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const name = Date.now() + ext;
        cb(null, name);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "audio/mpeg", // mp3
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/mp4",
        "video/mp4",
        "audio/aac",
        "audio/x-m4a"
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only audio/video files are allowed"), false);
    }
};
exports.uploadAudio = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
});
