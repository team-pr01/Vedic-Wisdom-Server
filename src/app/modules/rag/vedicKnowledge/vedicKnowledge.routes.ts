import express from "express";
import auth from "../../../middlewares/auth";
import { VedicKnowledgeControllers } from "./vedicKnowledge.controller";
import { UserRole } from "../../auth/auth.constants";
import { handleMulterError, uploadRAGDocument } from "../../../config/multerRAG.config";

const router = express.Router();

// ==================== ADMIN/MODERATOR ROUTES ====================

// Upload new document (with file)
router.post(
    "/upload",
    auth(UserRole.admin, UserRole.moderator),
    (req, res, next) => {
        uploadRAGDocument(req, res, (err) => {
            if (err) {
                return handleMulterError(err, req, res, next);
            }
            next();
        });
    },
    VedicKnowledgeControllers.uploadDocument
);

// Update document
router.put(
    "/:documentId",
    auth(UserRole.admin, UserRole.moderator),
    VedicKnowledgeControllers.updateDocument
);

// Delete document
router.delete(
    "/:documentId",
    auth(UserRole.admin, UserRole.moderator),
    VedicKnowledgeControllers.deleteDocument
);

// ==================== PUBLIC/ALL USER ROUTES ====================

// Get all documents (with filters)
router.get(
    "/",
    VedicKnowledgeControllers.getAllDocuments
);

// Get single document
router.get(
    "/:documentId",
    VedicKnowledgeControllers.getDocumentById
);

// ==================== RAG QUERY ROUTES ====================

// Ask a question (Vedic AI)
router.post(
    "/ask",
    auth(UserRole.admin, UserRole.moderator, UserRole.user),
    VedicKnowledgeControllers.askQuestion
);

// Rate answer helpfulness
router.post(
    "/rate/:documentId",
    auth(UserRole.admin, UserRole.moderator, UserRole.user),
    VedicKnowledgeControllers.rateAnswer
);

// ==================== EXPORT ====================

export const VedicKnowledgeRoutes = router;