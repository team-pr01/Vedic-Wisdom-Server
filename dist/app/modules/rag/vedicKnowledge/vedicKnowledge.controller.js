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
const multerRAG_config_1 = require("../../../config/multerRAG.config");
//Upload and process a new Vedic document
const uploadDocument = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    // Validate file
    if (!file) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "No file uploaded. Please attach a PDF, DOCX, or TXT file.",
            data: null,
        });
    }
    // Validate file type and size
    try {
        (0, multerRAG_config_1.validateRAGFile)(file);
    }
    catch (error) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: error.message,
            data: null,
        });
    }
    console.log('📁 File received:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        hasBuffer: !!file.buffer
    });
    // Parse payload
    let payload;
    try {
        if (req.body.data) {
            payload = typeof req.body.data === 'string'
                ? JSON.parse(req.body.data)
                : req.body.data;
        }
        else {
            // Fallback: support individual fields
            payload = {
                title: req.body.title || file.originalname.replace(/\.[^/.]+$/, ""),
                category: req.body.category,
                subCategory: req.body.subCategory || "",
                author: req.body.author || "",
                source: req.body.source || "",
                tags: req.body.tags ?
                    (typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags)
                    : [],
                scriptureType: req.body.scriptureType || "",
                chapter: req.body.chapter || "",
                verseNumber: req.body.verseNumber || "",
            };
        }
    }
    catch (error) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "Invalid JSON in 'data' field. Please check your request format.",
            data: null,
        });
    }
    // Validate required fields
    if (!payload.category) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "Category is required.",
            data: null,
        });
    }
    // Process document
    const result = yield vedicKnowledge_service_1.VedicKnowledgeServices.processDocument(payload, file.buffer, file.mimetype);
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
//Update document
const updateDocument = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { documentId } = req.params;
    const payload = req.body;
    const result = yield vedicKnowledge_service_1.VedicKnowledgeServices.updateDocument(documentId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Document updated successfully",
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
//Ask a question to the Vedic knowledge base
const askQuestion = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        question: req.body.question,
        language: req.body.language || "en",
        category: req.body.category,
        maxResults: req.body.maxResults,
        minRelevanceScore: req.body.minRelevanceScore,
    };
    if (!query.question || query.question.trim().length === 0) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "Question is required",
            data: null,
        });
    }
    const result = yield vedicKnowledge_service_1.VedicKnowledgeServices.answerQuestion(query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Answer generated successfully",
        data: result,
    });
}));
//Rate the helpfulness of an answer
const rateAnswer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { documentId } = req.params;
    const { rating } = req.body;
    yield vedicKnowledge_service_1.VedicKnowledgeServices.rateAnswer(documentId, rating);
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
    updateDocument,
    deleteDocument,
    askQuestion,
    rateAnswer,
};
