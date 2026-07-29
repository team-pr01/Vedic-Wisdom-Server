/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/multerRAG.config.ts

import multer from "multer";
import RAGConfig from "./rag.config";

/**
 * Memory storage for RAG document uploads
 * This allows us to read the file buffer for text extraction
 */
const storage = multer.memoryStorage();

/**
 * File filter for RAG documents
 * Only allows PDF, DOCX, and TXT files
 */
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = RAGConfig.upload.allowedMimeTypes || [
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
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}`
      )
    );
  }
};

/**
 * Multer upload instance for RAG documents
 * - Memory storage for file buffer access
 * - File size limit: 50MB
 * - Single file upload (field name: "file")
 */
export const multerRAGUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: RAGConfig.upload.maxFileSize || 50 * 1024 * 1024, // 50MB
    files: 1, // Only allow 1 file per request
  },
});

/**
 * Middleware for single RAG file upload
 * Field name: "file"
 */
export const uploadRAGDocument = multerRAGUpload.single("file");

/**
 * Middleware for multiple RAG files upload
 * Field name: "files"
 */
export const uploadRAGDocuments = multerRAGUpload.array("files", 5);

/**
 * Custom error handler for multer errors
 */
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    // Multer uses 'LIMIT_FILE_SIZE' for file size limit errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size: ${RAGConfig.upload.maxFileSize / (1024 * 1024)}MB`,
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

/**
 * Utility to validate uploaded file
 */
export const validateRAGFile = (file: Express.Multer.File) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  const allowedMimeTypes = RAGConfig.upload.allowedMimeTypes || [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(
      `Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}`
    );
  }

  if (file.size > (RAGConfig.upload.maxFileSize || 50 * 1024 * 1024)) {
    throw new Error(
      `File too large. Maximum size: ${RAGConfig.upload.maxFileSize / (1024 * 1024)}MB`
    );
  }

  return true;
};

export default multerRAGUpload;