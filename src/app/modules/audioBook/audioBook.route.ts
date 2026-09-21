import express from "express";
import { AudioBookControllers } from "./audioBook.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../auth/auth.constants";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();


router.post(
    "/add",
    auth(UserRole.admin),
    multerUpload.single("file"),
    AudioBookControllers.addAudioBook
);

router.get("/other", AudioBookControllers.getAllAudioBooks);
router.get("/new-arrivals", AudioBookControllers.getNewArrivals);
router.get("/popular", AudioBookControllers.getMostPopularAudioBooks);

router.get("/:audioBookId", AudioBookControllers.getSingleAudioBook);

router.patch(
    "/update/:audioBookId",
    auth(UserRole.admin),
    multerUpload.single("file"),
    AudioBookControllers.updateAudioBook
);

router.delete(
    "/delete/:audioBookId",
    auth(UserRole.admin),
    AudioBookControllers.deleteAudioBook
);


export const AudioBookRoutes = router;