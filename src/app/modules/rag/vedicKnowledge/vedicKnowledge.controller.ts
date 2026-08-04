/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { VedicKnowledgeServices } from "./vedicKnowledge.service";
import { IRAGQuery } from "../rag.types";
import { validateRAGFile } from "../../../config/multerRAG.config";

//Upload and process a new Vedic document
const uploadDocument = catchAsync(async (req, res) => {
    const file = req.file;

    // Validate file
    if (!file) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "No file uploaded. Please attach a PDF, DOCX, or TXT file.",
            data: null,
        });
    }

    // Validate file type and size
    try {
        validateRAGFile(file);
    } catch (error: any) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
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
        } else {
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
    } catch (error) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Invalid JSON in 'data' field. Please check your request format.",
            data: null,
        });
    }

    // Validate required fields
    if (!payload.category) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Category is required.",
            data: null,
        });
    }

    // Process document
    const result = await VedicKnowledgeServices.processDocument(
        payload,
        file.buffer,
        file.mimetype,
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Document uploaded and processed successfully",
        data: result,
    });
});

//Get all documents with filters
const getAllDocuments = catchAsync(async (req, res) => {
    const {
        category,
        keyword,
        scriptureType,
        skip = "0",
        limit = "10",
    } = req.query;

    const filters = {
        category: category as string,
        keyword: keyword as string,
        scriptureType: scriptureType as string,
    };

    const result = await VedicKnowledgeServices.getAllDocuments(
        filters,
        Number(skip),
        Number(limit)
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Documents fetched successfully",
        data: result,
    });
});

//Get single document by ID
const getDocumentById = catchAsync(async (req, res) => {
    const { documentId } = req.params;
    const result = await VedicKnowledgeServices.getDocumentById(documentId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Document fetched successfully",
        data: result,
    });
});

//Update document
const updateDocument = catchAsync(async (req, res) => {
    const { documentId } = req.params;
    const payload = req.body;

    const result = await VedicKnowledgeServices.updateDocument(documentId, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Document updated successfully",
        data: result,
    });
});

//Delete document
const deleteDocument = catchAsync(async (req, res) => {
    const { documentId } = req.params;
    const result = await VedicKnowledgeServices.deleteDocument(documentId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: {},
    });
});

//Ask a question to the Vedic knowledge base
const askQuestion = catchAsync(async (req, res) => {
    const query: IRAGQuery = {
        question: req.body.question,
        language: req.body.language || "en",
        category: req.body.category,
        maxResults: req.body.maxResults,
        minRelevanceScore: req.body.minRelevanceScore,
    };

    if (!query.question || query.question.trim().length === 0) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Question is required",
            data: null,
        });
    }

    const result = await VedicKnowledgeServices.answerQuestion(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Answer generated successfully",
        data: result,
    });
});

//Rate the helpfulness of an answer
const rateAnswer = catchAsync(async (req, res) => {
    const { documentId } = req.params;
    const { rating } = req.body;

    await VedicKnowledgeServices.rateAnswer(documentId, rating);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Rating submitted successfully",
        data: {},
    });
});

export const VedicKnowledgeControllers = {
    uploadDocument,
    getAllDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    askQuestion,
    rateAnswer,
};