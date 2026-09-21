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
exports.VedicKnowledgeControllers = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const vedicKnowledge_service_1 = require("./vedicKnowledge.service");
//Upload and process a new Vedic document
const uploadDocument = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    if (!files || files.length === 0) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "No file uploaded. Please attach a PDF, DOCX, or TXT file.",
            data: null,
        });
    }
    const result = yield vedicKnowledge_service_1.VedicKnowledgeServices.uploadDocument(files);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Document uploaded and processed successfully",
        data: result,
    });
}));
//Get all documents with filters
const getAllDocuments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, keyword, scriptureType, skip = "0", limit = "10", } = req.query;
    const filters = {
        category: category,
        keyword: keyword,
        scriptureType: scriptureType,
    };
    const result = yield vedicKnowledge_service_1.VedicKnowledgeServices.getAllDocuments(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Documents fetched successfully",
        data: result,
    });
}));
//Get single document by ID
const getDocumentById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { documentId } = req.params;
    const result = yield vedicKnowledge_service_1.VedicKnowledgeServices.getDocumentById(documentId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Document fetched successfully",
        data: result,
    });
}));
//Delete document
const deleteDocument = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { documentId } = req.params;
    const result = yield vedicKnowledge_service_1.VedicKnowledgeServices.deleteDocument(documentId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: {},
    });
}));
//Rate the helpfulness of an answer
const rateAnswer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // await VedicKnowledgeServices.rateAnswer(documentId, rating);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Rating submitted successfully",
        data: {},
    });
}));
exports.VedicKnowledgeControllers = {
    uploadDocument,
    getAllDocuments,
    getDocumentById,
    deleteDocument,
    rateAnswer,
};
