import express from "express";
import { EmergencyControllers } from "./emergency.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

router.post("/post", EmergencyControllers.postEmergency);
router.post("/forward", auth(UserRole.admin, UserRole.moderator), EmergencyControllers.forwardMessageToOthers);

router.get("/", auth(UserRole.admin, UserRole.moderator), EmergencyControllers.getAllEmergencyPosts);
router.get("/:emergencyId", auth(UserRole.admin, UserRole.moderator), EmergencyControllers.getSingleEmergencyPostById);

router.put("/:emergencyId", auth(UserRole.admin, UserRole.moderator), EmergencyControllers.updateEmergencyPost);
router.put("/update-status/:emergencyId", auth(UserRole.admin, UserRole.moderator), EmergencyControllers.changeEmergencyPostStatus);

router.delete("/delete/:emergencyId", auth(UserRole.admin, UserRole.moderator), EmergencyControllers.deleteEmergencyPost);

export const EmergencyRoutes = router;