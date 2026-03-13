import express from "express";
import { ProductControllers } from "./product.controller";
import auth from "../../../middlewares/auth";
import { UserRole } from "../../auth/auth.constants";
import { multerUpload } from "../../../config/multer.config";

const router = express.Router();

router.post(
  "/add",
  auth(UserRole.user),
  multerUpload.array("files", 4),
  ProductControllers.addProduct
);

router.get(
  "/",
  ProductControllers.getAllProducts
);

// For vendor to get their own products
router.get(
  "/my-products",
  auth(UserRole.user),
  ProductControllers.getMyProducts
);


router.get(
  "/:productId",
  ProductControllers.getSingleProductById
);

// For admin/moderators to get vendor products
router.get(
  "/vendor-products/:userId",
  auth(UserRole.admin, UserRole.moderator),
  ProductControllers.getVendorProducts
);

router.patch(
  "/update/:productId",
  auth(UserRole.user),
  multerUpload.array("files", 10),
  ProductControllers.updateProduct
);

router.delete(
  "/delete/:productId",
  auth(UserRole.user),
  ProductControllers.deleteProduct
);



export const ProductRoutes = router;