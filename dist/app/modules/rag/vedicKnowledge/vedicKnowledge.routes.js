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
const multer_memory_1 = require("../../../config/multer.memory");
const router = express_1.default.Router();
// Upload new document
router.post("/upload", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), multer_memory_1.multerMemoryUpload.array("files", 4), vedicKnowledge_controller_1.VedicKnowledgeControllers.uploadDocument);
// Delete document
router.delete("/delete/:documentId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vedicKnowledge_controller_1.VedicKnowledgeControllers.deleteDocument);
// Get all documents (with filters)
router.get("/", vedicKnowledge_controller_1.VedicKnowledgeControllers.getAllDocuments);
// Get single document
router.get("/:documentId", vedicKnowledge_controller_1.VedicKnowledgeControllers.getDocumentById);
// Rate answer helpfulness
router.post("/rate/:documentId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), vedicKnowledge_controller_1.VedicKnowledgeControllers.rateAnswer);
exports.VedicKnowledgeRoutes = router;
