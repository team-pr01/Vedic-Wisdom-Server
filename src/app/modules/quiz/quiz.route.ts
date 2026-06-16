import express from "express";
import auth from "../../middlewares/auth";
import { QuizController } from "./quiz.controller";
import { UserRole } from "../auth/auth.constants";
const router = express.Router();

// Admin Routes
router.post("/add", auth(UserRole.admin), QuizController.addQuiz);
router.get("/", QuizController.getAllQuizzes);
router.patch("/update/:id", auth(UserRole.admin), QuizController.updateQuiz);
router.delete("/delete/:id", auth(UserRole.admin), QuizController.deleteQuiz);

// User Routes
router.get("/:id", QuizController.getQuiz);
router.post("/participate/:id", auth(UserRole.user, UserRole.moderator, UserRole.admin), QuizController.participateQuiz);

export const QuizRoutes = router;