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
// Admin Routes
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin), quiz_controller_1.QuizController.addQuiz);
router.get("/", quiz_controller_1.QuizController.getAllQuizzes);
router.patch("/update/:id", (0, auth_1.default)(auth_constants_1.UserRole.admin), quiz_controller_1.QuizController.updateQuiz);
router.delete("/delete/:id", (0, auth_1.default)(auth_constants_1.UserRole.admin), quiz_controller_1.QuizController.deleteQuiz);
// User Routes
router.get("/:id", quiz_controller_1.QuizController.getQuiz);
router.post("/participate/:id", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.admin), quiz_controller_1.QuizController.participateQuiz);
exports.QuizRoutes = router;
