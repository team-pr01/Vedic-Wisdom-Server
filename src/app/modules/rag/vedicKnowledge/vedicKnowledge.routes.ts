import express from "express";
import auth from "../../../middlewares/auth";
import { VedicKnowledgeControllers } from "./vedicKnowledge.controller";
import { UserRole } from "../../auth/auth.constants";
import { multerMemoryUpload } from "../../../config/multer.memory";

const router = express.Router();

// Upload new document
router.post(
  "/upload",
  auth(UserRole.admin, UserRole.moderator),
  multerMemoryUpload.array("files", 4),
  VedicKnowledgeControllers.uploadDocument
);

// Delete document
router.delete(
    "/delete/:documentId",
    auth(UserRole.admin, UserRole.moderator),
    VedicKnowledgeControllers.deleteDocument
);

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

// Rate answer helpfulness
router.post(
    "/rate/:documentId",
    auth(UserRole.admin, UserRole.moderator, UserRole.user),
    VedicKnowledgeControllers.rateAnswer
);

export const VedicKnowledgeRoutes = router;