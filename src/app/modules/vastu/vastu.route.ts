import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "../auth/auth.constants";
import { VastuControllers } from "./vastu.controllers";

const router = express.Router();

// For admin only
router.post("/add", auth(UserRole.admin, UserRole.moderator), VastuControllers.addVastu);

router.get("/", VastuControllers.getAllVastus);
router.get("/:vastuId", VastuControllers.getSingleVastuById);

router.put("/update/:vastuId", auth(UserRole.admin, UserRole.moderator), VastuControllers.updateVastu);

router.delete("/delete/:vastuId", auth(UserRole.admin, UserRole.moderator), VastuControllers.deleteVastu);

export const VastuRoutes = router;