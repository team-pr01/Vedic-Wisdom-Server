import express from "express";
import auth from "../../../middlewares/auth";
import { UserRole } from "../../auth/auth.constannts";
import { BooksController } from "./books.controller";
import authorizeRoute from "../../../middlewares/authorizeRoute";
import { multerUpload } from "../../../config/multer.config";

const router = express.Router();

// Create a new book (with optional image)
router.post(
  "/create-book",
  auth(UserRole.admin, UserRole.moderator, UserRole["super-admin"]),
  authorizeRoute(),
  multerUpload.single("file"),
  BooksController.createBook
);

// Get all books
router.get("/", BooksController.getAllBooks);

// Get a single book by ID
router.get("/:bookId", BooksController.getSingleBook);

// Update a book by ID (with optional new image)
router.put(
  "/update/:bookId",
  auth(UserRole.admin, UserRole.moderator, UserRole["super-admin"]),
  authorizeRoute(),
  multerUpload.single("file"),
  BooksController.updateBook
);

// Delete a book by ID
router.delete(
  "/delete/:bookId",
  auth(UserRole.admin, UserRole.moderator, UserRole["super-admin"]),
  authorizeRoute(),
  BooksController.deleteBook
);

export const BooksRoutes = router;
