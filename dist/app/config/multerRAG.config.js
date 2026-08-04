"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/multerRAG.config.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRAGFile = exports.handleMulterError = exports.uploadRAGDocuments = exports.uploadRAGDocument = exports.multerRAGUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const rag_config_1 = __importDefault(require("./rag.config"));
/**
 * Memory storage for RAG document uploads
 * This allows us to read the file buffer for text extraction
 */
const storage = multer_1.default.memoryStorage();
/**
 * File filter for RAG documents
 * Only allows PDF, DOCX, and TXT files
 */
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = rag_config_1.default.upload.allowedMimeTypes || [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ];
    // const allowedExtensions = RAGConfig.upload.allowedExtensions || [
    //   ".pdf",
    //   ".docx",
    //   ".txt",
    // ];
    // Check mime type
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}`));
    }
};
/**
 * Multer upload instance for RAG documents
 * - Memory storage for file buffer access
 * - File size limit: 50MB
 * - Single file upload (field name: "file")
 */
exports.multerRAGUpload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: rag_config_1.default.upload.maxFileSize || 50 * 1024 * 1024, // 50MB
        files: 1, // Only allow 1 file per request
    },
});
/**
 * Middleware for single RAG file upload
 * Field name: "file"
 */
exports.uploadRAGDocument = exports.multerRAGUpload.single("file");
/**
 * Middleware for multiple RAG files upload
 * Field name: "files"
 */
exports.uploadRAGDocuments = exports.multerRAGUpload.array("files", 5);
/**
 * Custom error handler for multer errors
 */
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        // Multer uses 'LIMIT_FILE_SIZE' for file size limit errors
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum size: ${rag_config_1.default.upload.maxFileSize / (1024 * 1024)}MB`,
            });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message: "Unexpected file field. Please use 'file' as the field name.",
            });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files. Maximum: 5 files allowed.",
            });
        }
        return res.status(400).json({
            success: false,
            message: `Multer error: ${err.message}`,
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next();
};
exports.handleMulterError = handleMulterError;
/**
 * Utility to validate uploaded file
 */
const validateRAGFile = (file) => {
    if (!file) {
        throw new Error("No file uploaded");
    }
    const allowedMimeTypes = rag_config_1.default.upload.allowedMimeTypes || [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error(`Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}`);
    }
    if (file.size > (rag_config_1.default.upload.maxFileSize || 50 * 1024 * 1024)) {
        throw new Error(`File too large. Maximum size: ${rag_config_1.default.upload.maxFileSize / (1024 * 1024)}MB`);
    }
    return true;
};
exports.validateRAGFile = validateRAGFile;
exports.default = exports.multerRAGUpload;
