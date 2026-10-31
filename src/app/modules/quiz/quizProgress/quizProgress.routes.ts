import express from "express";
import { UserRole } from "../../auth/auth.constants";
import auth from "../../../middlewares/auth";
import { QuizProgressControllers } from "./quizProgress.controller";

const router = express.Router();

// All routes here require the user to be logged in
router.use(auth(UserRole.user, UserRole.admin, UserRole.moderator));


// Get user's current progress on a quiz
router.get("/:quizId/progress", QuizProgressControllers.getMyProgress);

// Get leaderboard for a quiz (Can be public, but auth doesn't hurt)
router.get("/:quizId/leaderboard", QuizProgressControllers.getLeaderboard);

// Claim reward (Coins or Payment)
router.post("/:quizId/claim-reward", QuizProgressControllers.claimReward);

export const QuizProgressRoutes = router;