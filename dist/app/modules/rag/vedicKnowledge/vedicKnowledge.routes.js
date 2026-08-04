"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VedicKnowledgeRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const vedicKnowledge_controller_1 = require("./vedicKnowledge.controller");
const auth_constants_1 = require("../../auth/auth.constants");
const multerRAG_config_1 = require("../../../config/multerRAG.config");
const router = express_1.default.Router();
// ==================== ADMIN/MODERATOR ROUTES ====================
// Upload new document (with file)
router.post("/upload", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), (req, res, next) => {
    (0, multerRAG_config_1.uploadRAGDocument)(req, res, (err) => {
        if (err) {
            return (0, multerRAG_config_1.handleMulterError)(err, req, res, next);
        }
        next();
    });
}, vedicKnowledge_controller_1.VedicKnowledgeControllers.uploadDocument);
// Update document
router.put("/:documentId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vedicKnowledge_controller_1.VedicKnowledgeControllers.updateDocument);
// Delete document
router.delete("/:documentId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vedicKnowledge_controller_1.VedicKnowledgeControllers.deleteDocument);
// ==================== PUBLIC/ALL USER ROUTES ====================
// Get all documents (with filters)
router.get("/", vedicKnowledge_controller_1.VedicKnowledgeControllers.getAllDocuments);
// Get single document
router.get("/:documentId", vedicKnowledge_controller_1.VedicKnowledgeControllers.getDocumentById);
// ==================== RAG QUERY ROUTES ====================
// Ask a question (Vedic AI)
router.post("/ask", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), vedicKnowledge_controller_1.VedicKnowledgeControllers.askQuestion);
// Rate answer helpfulness
router.post("/rate/:documentId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), vedicKnowledge_controller_1.VedicKnowledgeControllers.rateAnswer);
// ==================== EXPORT ====================
exports.VedicKnowledgeRoutes = router;
