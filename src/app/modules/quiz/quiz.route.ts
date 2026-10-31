import express from "express";
import auth from "../../middlewares/auth";
import { QuizController } from "./quiz.controller";
import { UserRole } from "../auth/auth.constants";
const router = express.Router();

// Start a quiz (Creates the QuizProgress document)
router.post("/start/:quizId", auth(UserRole.user, UserRole.admin, UserRole.moderator), QuizController.startQuiz);

// Submit answers for a specific level
router.post("/submit/:quizId/level/:levelNo", auth(UserRole.user, UserRole.admin, UserRole.moderator), QuizController.submitLevelAnswers);


// Admin Routes
router.post("/add", auth(UserRole.admin), QuizController.addQuiz);
router.get("/all", auth(UserRole.admin, UserRole.moderator), QuizController.getAllQuizzes);
router.get("/active", QuizController.getActiveQuizzes);
router.patch("/update/:id", auth(UserRole.admin), QuizController.updateQuiz);
router.delete("/delete/:id", auth(UserRole.admin), QuizController.deleteQuiz);



// User Routes
router.get("/:id", QuizController.getSingleQuizById);

export const QuizRoutes = router;