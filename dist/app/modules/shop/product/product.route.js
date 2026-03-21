"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("./product.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const auth_constants_1 = require("../../auth/auth.constants");
const multer_config_1 = require("../../../config/multer.config");
const router = express_1.default.Router();
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.user), multer_config_1.multerUpload.array("files", 4), product_controller_1.ProductControllers.addProduct);
router.get("/", product_controller_1.ProductControllers.getAllProducts);
// For vendor to get their own products
router.get("/my-products", (0, auth_1.default)(auth_constants_1.UserRole.user), product_controller_1.ProductControllers.getMyProducts);
router.get("/:productId", product_controller_1.ProductControllers.getSingleProductById);
// For admin/moderators to get vendor products
router.get("/vendor-products/:userId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), product_controller_1.ProductControllers.getVendorProducts);
router.patch("/update/:productId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), multer_config_1.multerUpload.array("files", 4), product_controller_1.ProductControllers.updateProduct);
router.delete("/delete/:productId", (0, auth_1.default)(auth_constants_1.UserRole.user), product_controller_1.ProductControllers.deleteProduct);
exports.ProductRoutes = router;
