import express from "express";
import { VastuTipsControllers } from "./vastuTips.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

router.post("/add", auth(UserRole.admin, UserRole.moderator), VastuTipsControllers.addVastuTips);

router.get("/", VastuTipsControllers.getAllVastuTips);

router.get("/:id", VastuTipsControllers.getSingleVastuTips);

router.put("/update/:id", auth(UserRole.admin, UserRole.moderator), VastuTipsControllers.updateVastuTips);

router.delete("/delete/:id", auth(UserRole.admin, UserRole.moderator), VastuTipsControllers.deleteVastuTips);

export const VastuTipsRoutes = router;