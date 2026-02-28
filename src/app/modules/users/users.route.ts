import express from "express";
import { UserControllers } from "./users.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.admin, UserRole.staff),
  UserControllers.getAllUser
);
// router.get(
//   "/me",
//   auth(
//     UserRole.user,
//     UserRole.admin,
//     UserRole.staff,
//     UserRole.tutor,
//     UserRole.guardian
//   ),
//   UserControllers.getMe
// );

router.patch(
  "/suspend/:userId",
  auth(UserRole.admin, UserRole.staff),
  UserControllers.suspendUser
);
router.patch(
  "/active/:userId",
  auth(UserRole.admin, UserRole.staff),
  UserControllers.activeUser
);
router.get(
  "/:userId",
  auth(UserRole.admin, UserRole.staff),
  UserControllers.getSingleUserById
);

// router.patch(
//   "/update-profile",
//   auth(
//     UserRole.user,
//     UserRole.admin,
//     UserRole.staff,
//     UserRole.tutor,
//     UserRole.guardian
//   ),
//   multerUpload.single("file"),
//   UserControllers.updateProfile
// );

router.patch(
  "/delete-account",
  auth(UserRole.user, UserRole.guardian, UserRole.tutor),
  UserControllers.deleteAccount
);

// For admin and staff only
router.patch(
  "/account/restore/:userId",
  auth(UserRole.admin, UserRole.staff),
  UserControllers.restoreDeletedAccount
);

export const UserRoutes = router;
