// routes/coinPackage.routes.ts
import express from "express";
import auth from "../../../middlewares/auth";
import { UserRole } from "../../auth/auth.constants";
import { CoinPackageControllers } from "./coinPackage.controller";

const router = express.Router();

// Admin routes
router.post(
    "/add",
    auth(UserRole.admin, UserRole.moderator),
    CoinPackageControllers.addCoinPackage
);



router.put(
    "/update/:packageId",
    auth(UserRole.admin, UserRole.moderator),
    CoinPackageControllers.updateCoinPackage
);

router.delete(
    "/delete/:packageId",
    auth(UserRole.admin, UserRole.moderator),
    CoinPackageControllers.deleteCoinPackage
);

// Public routes (users)
router.get(
    "/all",
    CoinPackageControllers.getAllCoinPackages
);

router.get(
    "/:packageId",
    CoinPackageControllers.getSingleCoinPackageById
);

export const CoinPackageRoutes = router;