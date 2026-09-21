import express from "express";
import auth from "../../../middlewares/auth";
import { UserRole } from "../../auth/auth.constants";
import { multerUpload } from "../../../config/multer.config";
import { AudioTrackControllers } from "./audioTrack.controller";
import { uploadAudio } from "../../../utils/uploadAudioToCloudinary";

const router = express.Router();


router.post(
  "/add",
  auth(UserRole.admin, UserRole.moderator),
  uploadAudio.single("file"),
  AudioTrackControllers.addAudioTrack
);

router.get("/",  AudioTrackControllers.getAllAudioTracks);

router.get("/book/:audioBookId",
  AudioTrackControllers.getAllAudioTracksOfABook
);

router.get("/:trackId",
  AudioTrackControllers.getSingleAudioTrack
);

router.patch(
  "/update/:trackId",
  auth(UserRole.admin, UserRole.moderator),
  multerUpload.single("file"),
  AudioTrackControllers.updateAudioTrack
);

router.delete(
  "/delete/:trackId",
  auth(UserRole.admin, UserRole.moderator),
  AudioTrackControllers.deleteAudioTrack
);


export const AudioTracksRoutes = router;