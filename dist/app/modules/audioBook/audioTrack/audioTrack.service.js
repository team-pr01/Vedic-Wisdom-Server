"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioTrackServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const audioTrack_model_1 = __importDefault(require("./audioTrack.model"));
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const deleteImageFromCloudinary_1 = require("../../../utils/deleteImageFromCloudinary");
const audioBook_model_1 = __importDefault(require("../audioBook.model"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const addAudioTrack = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const { audioBookId } = payload;
    const book = yield audioBook_model_1.default.findById(audioBookId);
    if (!book) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "AudioBook not found");
    }
    /* ---------- AUTO ORDER ---------- */
    const lastTrack = yield audioTrack_model_1.default
        .findOne({ audioBookId })
        .sort({ order: -1 })
        .select("order");
    const nextOrder = lastTrack ? lastTrack.order + 1 : 1;
    /* ---------- AUDIO UPLOAD ---------- */
    let audioUrl = "";
    let duration = "";
    if (file) {
        const ext = path_1.default.extname(file.originalname).replace(".", "");
        const result = yield cloudinary_1.v2.uploader.upload(file.path, {
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
    const track = yield audioTrack_model_1.default.create(Object.assign(Object.assign({}, payload), { order: nextOrder, url: audioUrl, duration }));
    return track;
});
/* GET ALL TRACKS */
const getAllAudioTracks = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    if (filters.audioBookId) {
        query.audioBookId = filters.audioBookId;
    }
    return (0, infinitePaginate_1.infinitePaginate)(audioTrack_model_1.default, query, skip, limit, [
        { path: "audioBookId", select: "name" },
    ]);
});
/* GET SINGLE TRACK */
const getSingleAudioTrack = (trackId) => __awaiter(void 0, void 0, void 0, function* () {
    const track = yield audioTrack_model_1.default
        .findById(trackId)
        .populate("audioBookId", "name");
    if (!track) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Track not found");
    }
    return track;
});
/* GET ALL TRACKS OF A BOOK */
const getAllAudioTracksOfABook = (audioBookId) => __awaiter(void 0, void 0, void 0, function* () {
    const audioBook = yield audioBook_model_1.default.findById(audioBookId);
    const tracks = yield audioTrack_model_1.default
        .find({ audioBookId })
        .sort({ order: 1 });
    return {
        audioBookName: audioBook === null || audioBook === void 0 ? void 0 : audioBook.name,
        tracks,
    };
});
/* UPDATE TRACK */
const updateAudioTrack = (trackId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const track = yield audioTrack_model_1.default.findById(trackId);
    if (!track) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Track not found");
    }
    let audioUrl = track.url;
    /* ---------- REPLACE AUDIO IF NEW FILE ---------- */
    if (file) {
        /* Delete old audio from Cloudinary */
        if (track.url) {
            const publicId = (0, deleteImageFromCloudinary_1.extractPublicId)(track.url);
            yield cloudinary_1.v2.uploader.destroy(publicId, {
                resource_type: "video",
            });
        }
        /* Upload new audio */
        const ext = path_1.default.extname(file.originalname).replace(".", "");
        const result = yield cloudinary_1.v2.uploader.upload(file.path, {
            resource_type: "video",
            folder: "audio_tracks",
            format: ext,
        });
        audioUrl = result.secure_url;
    }
    /* ---------- UPDATE TRACK ---------- */
    const updatedTrack = yield audioTrack_model_1.default.findByIdAndUpdate(trackId, Object.assign(Object.assign({}, payload), { url: audioUrl }), { new: true });
    return updatedTrack;
});
/* DELETE TRACK */
const deleteAudioTrack = (trackId) => __awaiter(void 0, void 0, void 0, function* () {
    const track = yield audioTrack_model_1.default.findById(trackId);
    if (!track) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Track not found");
    }
    if (track.url) {
        const publicId = (0, deleteImageFromCloudinary_1.extractPublicId)(track.url);
        yield (0, deleteImageFromCloudinary_1.deleteImageFromCloudinary)(publicId);
    }
    yield audioTrack_model_1.default.findByIdAndDelete(trackId);
    return true;
});
exports.AudioTrackServices = {
    addAudioTrack,
    getAllAudioTracks,
    getSingleAudioTrack,
    updateAudioTrack,
    deleteAudioTrack,
    getAllAudioTracksOfABook,
};
