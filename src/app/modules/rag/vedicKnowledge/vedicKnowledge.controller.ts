/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { VedicKnowledgeServices } from "./vedicKnowledge.service";

//Upload and process a new Vedic document
const uploadDocument = catchAsync(async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "No file uploaded. Please attach a PDF, DOCX, or TXT file.",
      data: null,
    });
  }

  const result = await VedicKnowledgeServices.uploadDocument(files);

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


//Rate the helpfulness of an answer
const rateAnswer = catchAsync(async (req, res) => {

    // await VedicKnowledgeServices.rateAnswer(documentId, rating);

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
    deleteDocument,
    rateAnswer,
};