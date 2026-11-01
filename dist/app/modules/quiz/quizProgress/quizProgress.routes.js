"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizProgressRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_constants_1 = require("../../auth/auth.constants");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const quizProgress_controller_1 = require("./quizProgress.controller");
const router = express_1.default.Router();
// All routes here require the user to be logged in
router.use((0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator));
// Get user's current progress on a quiz
router.get("/:quizId/progress", quizProgress_controller_1.QuizProgressControllers.getMyProgress);
// Get leaderboard for a quiz (Can be public, but auth doesn't hurt)
router.get("/:quizId/leaderboard", quizProgress_controller_1.QuizProgressControllers.getLeaderboard);
// Claim reward (Coins or Payment)
router.post("/:quizId/claim-reward", quizProgress_controller_1.QuizProgressControllers.claimReward);
exports.QuizProgressRoutes = router;
