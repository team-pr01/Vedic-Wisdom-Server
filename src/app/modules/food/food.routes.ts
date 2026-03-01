import express from "express";
import auth from "../../middlewares/auth";
import { FoodController } from "./food.controller";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

router.post("/add-recipe", auth(UserRole.admin, UserRole.moderator, UserRole.user), FoodController.addFood);

router.get("/", FoodController.getAllFoods);

router.get("/:foodId", FoodController.getSingleFood);

router.put("/update/:foodId", auth(UserRole.admin, UserRole.moderator), FoodController.updateFood);

router.delete("/delete/:foodId", auth(UserRole.admin, UserRole.moderator, UserRole.user), FoodController.deleteFood);

export const FoodRoutes = router;