/* eslint-disable no-constant-binary-expression */
/* eslint-disable no-misleading-character-class */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import config from "../../../config";

const ragClient = axios.create({
  baseURL: `${config.rag_host}/api/v1`,
  headers: {
    "x-auth-key": config.rag_api_key,
    "Content-Type": "application/json",
  },
});

const handleRagError = (error: any, fallbackMessage: string) => {
  console.error(
    `[RAG] ${fallbackMessage}:`,
    error.response?.data || error.message
  );
  // Re-throw so catchAsync / global error handler deals with it,
  // but attach a cleaner message if the upstream didn't provide one.
  if (error.response?.data) {
    throw error;
  }
  throw new Error(error.message || fallbackMessage);
};

const uploadDocument = async (files: Express.Multer.File[]) => {
  const ragHost = config.rag_host;
  const ragApiKey = config.rag_api_key;

  const form = new FormData();

  for (const file of files) {
    form.append(
      "files",
      new Blob([file.buffer as unknown as BlobPart], {
        type: file.mimetype,
      }),
      file.originalname
    );
  }

  try {
    const response = await axios.post(
      `${ragHost}/api/v1/documents/upload`,
      form,
      {
        headers: {
          "x-auth-key": ragApiKey,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error uploading to RAG host:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get all documents with pagination
const getAllDocuments = async (
  filters: any,
  skip: number = 0,
  limit: number = 10
) => {
  const params: Record<string, any> = {
    skip,
    limit,
  };

  try {
    const response = await ragClient.get("/documents", { params });
    return response.data;
  } catch (error: any) {
    handleRagError(error, "Failed to fetch documents");
  }
};

// Get single document by ID
const getDocumentById = async (documentId: string) => {
  try {
    const response = await ragClient.get(`/documents/${documentId}`);
    return response.data;
  } catch (error: any) {
    handleRagError(error, `Failed to fetch document ${documentId}`);
  }
};

// Delete document
const deleteDocument = async (documentId: string) => {
  try {
    const response = await ragClient.delete(`/documents/${documentId}`);
    return response.data;
  } catch (error: any) {
    handleRagError(error, `Failed to delete document ${documentId}`);
  }
};


export const VedicKnowledgeServices = {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
};



