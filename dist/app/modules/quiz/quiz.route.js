"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const quiz_controller_1 = require("./quiz.controller");
const auth_constants_1 = require("../auth/auth.constants");
const router = express_1.default.Router();
// Start a quiz (Creates the QuizProgress document)
router.post("/start/:quizId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), quiz_controller_1.QuizController.startQuiz);
// Submit answers for a specific level
router.post("/submit/:quizId/level/:levelNo", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), quiz_controller_1.QuizController.submitLevelAnswers);
// Admin Routes
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin), quiz_controller_1.QuizController.addQuiz);
router.get("/all", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), quiz_controller_1.QuizController.getAllQuizzes);
router.get("/active", quiz_controller_1.QuizController.getActiveQuizzes);
router.patch("/update/:id", (0, auth_1.default)(auth_constants_1.UserRole.admin), quiz_controller_1.QuizController.updateQuiz);
router.delete("/delete/:id", (0, auth_1.default)(auth_constants_1.UserRole.admin), quiz_controller_1.QuizController.deleteQuiz);
router.get("/:quizId/level/:levelNo", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), quiz_controller_1.QuizController.getQuizQuestionsByLevelNo);
// User Routes
router.get("/:id", quiz_controller_1.QuizController.getSingleQuizById);
exports.QuizRoutes = router;
