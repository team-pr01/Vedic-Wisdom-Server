/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import AudioTrack from "./audioTrack.model";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import { deleteImageFromCloudinary, extractPublicId } from "../../../utils/deleteImageFromCloudinary";
import AudioBook from "../audioBook.model";
import path from "path";
import { v2 as cloudinary } from "cloudinary";


const addAudioTrack = async (
  payload: any,
  file?: Express.Multer.File
) => {

  const { audioBookId } = payload;

  const book = await AudioBook.findById(audioBookId);

  if (!book) {
    throw new AppError(httpStatus.NOT_FOUND, "AudioBook not found");
  }

  /* ---------- AUTO ORDER ---------- */

  const lastTrack = await AudioTrack
    .findOne({ audioBookId })
    .sort({ order: -1 })
    .select("order");

  const nextOrder = lastTrack ? lastTrack.order + 1 : 1;

  /* ---------- AUDIO UPLOAD ---------- */

  let audioUrl = "";
  let duration = "";

  if (file) {

    const ext = path.extname(file.originalname).replace(".", "");

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
      folder: "audio_tracks",
      format: ext,
    });

    audioUrl = result.secure_url;

    /* Extract duration from cloudinary */

    const seconds = result.duration || 0;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    duration = `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  /* ---------- CREATE TRACK ---------- */

  const track = await AudioTrack.create({
    ...payload,
    order: nextOrder,
    url: audioUrl,
    duration,
  });

  return track;
};

/* GET ALL TRACKS */
const getAllAudioTracks = async (
  filters: any = {},
  skip = 0,
  limit = 10
) => {

  const query: any = {};

  if (filters.audioBookId) {
    query.audioBookId = filters.audioBookId;
  }

  return infinitePaginate(AudioTrack, query, skip, limit, [
    { path: "audioBookId", select: "name" },
  ]);
};

/* GET SINGLE TRACK */
const getSingleAudioTrack = async (trackId: string) => {

  const track = await AudioTrack
    .findById(trackId)
    .populate("audioBookId", "name");

  if (!track) {
    throw new AppError(httpStatus.NOT_FOUND, "Track not found");
  }

  return track;
};

/* GET ALL TRACKS OF A BOOK */
const getAllAudioTracksOfABook = async (
  audioBookId: string
) => {

  const audioBook = await AudioBook.findById(audioBookId);

  const tracks = await AudioTrack
    .find({ audioBookId })
    .sort({ order: 1 });

  return {
    audioBookName: audioBook?.name,
    tracks,
  };
};


/* UPDATE TRACK */
const updateAudioTrack = async (
  trackId: string,
  payload: any,
  file?: Express.Multer.File
) => {

  const track = await AudioTrack.findById(trackId);

  if (!track) {
    throw new AppError(httpStatus.NOT_FOUND, "Track not found");
  }

  let audioUrl = track.url;

  /* ---------- REPLACE AUDIO IF NEW FILE ---------- */

  if (file) {

    /* Delete old audio from Cloudinary */

    if (track.url) {
      const publicId = extractPublicId(track.url);
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      });
    }

    /* Upload new audio */

    const ext = path.extname(file.originalname).replace(".", "");

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
      folder: "audio_tracks",
      format: ext,
    });

    audioUrl = result.secure_url;
  }

  /* ---------- UPDATE TRACK ---------- */

  const updatedTrack = await AudioTrack.findByIdAndUpdate(
    trackId,
    {
      ...payload,
      url: audioUrl,
    },
    { new: true }
  );

  return updatedTrack;
};

/* DELETE TRACK */
const deleteAudioTrack = async (trackId: string) => {

  const track = await AudioTrack.findById(trackId);

  if (!track) {
    throw new AppError(httpStatus.NOT_FOUND, "Track not found");
  }

  if (track.url) {
    const publicId = extractPublicId(track.url);
    await deleteImageFromCloudinary(publicId);
  }

  await AudioTrack.findByIdAndDelete(trackId);

  return true;
};


export const AudioTrackServices = {
  addAudioTrack,
  getAllAudioTracks,
  getSingleAudioTrack,
  updateAudioTrack,
  deleteAudioTrack,
  getAllAudioTracksOfABook,
};