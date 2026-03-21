"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookTextRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const bookText_controller_1 = require("./bookText.controller");
const auth_constants_1 = require("../../auth/auth.constants");
const router = express_1.default.Router();
// Create a new book text
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), bookText_controller_1.BookTextController.createBookText);
// Get all book texts
router.get("/", bookText_controller_1.BookTextController.getAllBookTexts);
router.get("/find-by-details", bookText_controller_1.BookTextController.getBookTextByDetails);
router.get("/filter", bookText_controller_1.BookTextController.filterBookTexts);
// Get all book texts by bookId
router.get("/:bookId", bookText_controller_1.BookTextController.getAllBookTextsByBookId);
// Get a single book text by ID
router.get("/:bookTextId", bookText_controller_1.BookTextController.getSingleBookText);
// Update a text translations
router.put("/update/:bookTextId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), bookText_controller_1.BookTextController.updateTranslations);
// Update a book text by ID
router.put("/update/text/:bookTextId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), bookText_controller_1.BookTextController.updateTranslations);
// Delete a book text by ID
router.delete("/delete/:bookTextId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), bookText_controller_1.BookTextController.deleteBookText);
exports.BookTextRoutes = router;
