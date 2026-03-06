import express from "express";
import auth from "../../middlewares/auth";
import { AyurvedaControllers } from "./ayurveda.controller";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

router.post(
  "/add",
  auth(UserRole.admin, UserRole.moderator),
  AyurvedaControllers.addAyurveda
);

router.get("/", AyurvedaControllers.getAllAyurveda);
router.get("/:ayurvedaId", AyurvedaControllers.getSingleAyurvedaById);

router.put(
  "/update/:ayurvedaId",
  auth(UserRole.admin, UserRole.moderator),
  AyurvedaControllers.updateAyurveda
);

router.delete(
  "/delete/:ayurvedaId",
  auth(UserRole.admin, UserRole.moderator),
  AyurvedaControllers.deleteAyurveda
);

export const AyurvedaRoutes = router;