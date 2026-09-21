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
exports.VedicKnowledgeServices = void 0;
/* eslint-disable no-constant-binary-expression */
/* eslint-disable no-misleading-character-class */
/* eslint-disable @typescript-eslint/no-explicit-any */
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../config"));
const ragClient = axios_1.default.create({
    baseURL: `${config_1.default.rag_host}/api/v1`,
    headers: {
        "x-auth-key": config_1.default.rag_api_key,
        "Content-Type": "application/json",
    },
});
const handleRagError = (error, fallbackMessage) => {
    var _a, _b;
    console.error(`[RAG] ${fallbackMessage}:`, ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    // Re-throw so catchAsync / global error handler deals with it,
    // but attach a cleaner message if the upstream didn't provide one.
    if ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) {
        throw error;
    }
    throw new Error(error.message || fallbackMessage);
};
const uploadDocument = (files) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ragHost = config_1.default.rag_host;
    const ragApiKey = config_1.default.rag_api_key;
    const form = new FormData();
    for (const file of files) {
        form.append("files", new Blob([file.buffer], {
            type: file.mimetype,
        }), file.originalname);
    }
    try {
        const response = yield axios_1.default.post(`${ragHost}/api/v1/documents/upload`, form, {
            headers: {
                "x-auth-key": ragApiKey,
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });
        return response.data;
    }
    catch (error) {
        console.error("Error uploading to RAG host:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
});
// Get all documents with pagination
const getAllDocuments = (filters_1, ...args_1) => __awaiter(void 0, [filters_1, ...args_1], void 0, function* (filters, skip = 0, limit = 10) {
    const params = {
        skip,
        limit,
    };
    try {
        const response = yield ragClient.get("/documents", { params });
        return response.data;
    }
    catch (error) {
        handleRagError(error, "Failed to fetch documents");
    }
});
// Get single document by ID
const getDocumentById = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield ragClient.get(`/documents/${documentId}`);
        return response.data;
    }
    catch (error) {
        handleRagError(error, `Failed to fetch document ${documentId}`);
    }
});
// Delete document
const deleteDocument = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield ragClient.delete(`/documents/${documentId}`);
        return response.data;
    }
    catch (error) {
        handleRagError(error, `Failed to delete document ${documentId}`);
    }
});
exports.VedicKnowledgeServices = {
    uploadDocument,
    getAllDocuments,
    getDocumentById,
    deleteDocument,
};
