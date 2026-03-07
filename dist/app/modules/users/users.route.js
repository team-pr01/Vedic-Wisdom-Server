"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const users_controller_1 = require("./users.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../auth/auth.constants");
const router = express_1.default.Router();
router.get("/", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.staff), users_controller_1.UserControllers.getAllUser);
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
router.patch("/suspend/:userId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.staff), users_controller_1.UserControllers.suspendUser);
router.patch("/active/:userId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.staff), users_controller_1.UserControllers.activeUser);
router.get("/:userId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.staff), users_controller_1.UserControllers.getSingleUserById);
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
router.patch("/save-push-token", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.temple, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), users_controller_1.UserControllers.savePushToken);
router.patch("/delete-account", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.guardian, auth_constants_1.UserRole.tutor), users_controller_1.UserControllers.deleteAccount);
// For admin and staff only
router.patch("/account/restore/:userId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.staff), users_controller_1.UserControllers.restoreDeletedAccount);
exports.UserRoutes = router;
