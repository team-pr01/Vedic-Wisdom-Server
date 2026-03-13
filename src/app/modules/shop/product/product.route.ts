import express from "express";
import { ProductControllers } from "./product.controller";
import auth from "../../../middlewares/auth";
import { UserRole } from "../../auth/auth.constants";
import { multerUpload } from "../../../config/multer.config";

const router = express.Router();

router.post(
  "/add",
  auth(UserRole.user),
  multerUpload.array("files", 10),
  ProductControllers.addProduct
);

router.delete(
  "/delete/:productId",
  auth(UserRole.user),
  ProductControllers.deleteProduct
);

router.get(
  "/vendor-products",
  auth(UserRole.user),
  ProductControllers.getVendorProducts
);

export const ProductRoutes = router;