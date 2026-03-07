"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const food_controller_1 = require("./food.controller");
const auth_constants_1 = require("../auth/auth.constants");
const router = express_1.default.Router();
router.post("/add-recipe", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), food_controller_1.FoodController.addFood);
router.get("/", food_controller_1.FoodController.getAllFoods);
router.get("/:foodId", food_controller_1.FoodController.getSingleFood);
router.put("/update/:foodId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), food_controller_1.FoodController.updateFood);
router.delete("/delete/:foodId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), food_controller_1.FoodController.deleteFood);
exports.FoodRoutes = router;
