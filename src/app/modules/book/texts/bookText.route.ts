import express from "express";
import auth from "../../../middlewares/auth";
import { BookTextController } from "./bookText.controller";
import { UserRole } from "../../auth/auth.constants";

const router = express.Router();

// Create a new book text
router.post(
  "/add",
  auth(UserRole.admin, UserRole.moderator),
  BookTextController.createBookText
);

// Get all book texts
router.get("/", BookTextController.getAllBookTexts);

router.get("/find-by-details", BookTextController.getBookTextByDetails);

router.get("/filter", BookTextController.filterBookTexts);

// Get all book texts by bookId
router.get("/:bookId", BookTextController.getAllBookTextsByBookId);

// Get a single book text by ID
router.get("/:bookTextId", BookTextController.getSingleBookText);

// Update a text translations
router.put(
  "/update/:bookTextId",
  auth(UserRole.admin, UserRole.moderator),
  BookTextController.updateTranslations
);

// Update a book text by ID
router.put(
  "/update/text/:bookTextId",
  auth(UserRole.admin, UserRole.moderator),
  BookTextController.updateTranslations
);

// Delete a book text by ID
router.delete(
  "/delete/:bookTextId",
  auth(UserRole.admin, UserRole.moderator),
  BookTextController.deleteBookText
);

export const BookTextRoutes = router;
