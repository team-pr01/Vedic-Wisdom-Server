import express from "express";
import { AiControllers } from "./ai.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../auth/auth.constants";
import { checkAiChatLimit, checkAiRecipesLimit, checkKundliLimit, checkMuhurtaLimit, checkVastuAiLimit } from "../../middlewares/checkLimit";

const router = express.Router();

router.post("/chat", auth(UserRole.user, UserRole.admin, UserRole.moderator), checkAiChatLimit, AiControllers.aiChat);
router.post("/translate-shloka", auth(UserRole.user, UserRole.admin, UserRole.moderator), AiControllers.translateShloka);
router.post("/generate-recipe", auth(UserRole.user, UserRole.admin, UserRole.moderator), checkAiRecipesLimit, AiControllers.generateRecipe);
router.post("/generate-quiz", auth(UserRole.user, UserRole.admin, UserRole.moderator), AiControllers.generateQuiz);
router.post("/translate-news", auth(UserRole.user, UserRole.admin, UserRole.moderator), AiControllers.translateNews);
router.post("/generate-kundli", auth(UserRole.user, UserRole.admin, UserRole.moderator), checkKundliLimit, AiControllers.generateKundli);
router.post("/generate-muhurta", auth(UserRole.user, UserRole.admin, UserRole.moderator), checkMuhurtaLimit, AiControllers.generateMuhurta);
router.post("/generate-vastu", auth(UserRole.user, UserRole.admin, UserRole.moderator), checkVastuAiLimit, AiControllers.generateVastuAnalysis);


export const AiRoutes = router;