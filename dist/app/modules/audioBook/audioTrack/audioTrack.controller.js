"use strict";
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
exports.AudioTrackControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const audioTrack_service_1 = require("./audioTrack.service");
const addAudioTrack = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const result = yield audioTrack_service_1.AudioTrackServices.addAudioTrack(req.body, file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Audio track added successfully",
        data: result,
    });
}));
const getAllAudioTracks = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { audioBookId, skip = "0", limit = "10" } = req.query;
    const filters = {
        audioBookId,
    };
    const result = yield audioTrack_service_1.AudioTrackServices.getAllAudioTracks(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Tracks fetched successfully",
        data: result,
    });
}));
const getSingleAudioTrack = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield audioTrack_service_1.AudioTrackServices.getSingleAudioTrack(req.params.trackId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Track fetched successfully",
        data: result,
    });
}));
const getAllAudioTracksOfABook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield audioTrack_service_1.AudioTrackServices.getAllAudioTracksOfABook(req.params.audioBookId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Tracks fetched successfully",
        data: result,
    });
}));
const updateAudioTrack = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const result = yield audioTrack_service_1.AudioTrackServices.updateAudioTrack(req.params.trackId, req.body, file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Track updated successfully",
        data: result,
    });
}));
const deleteAudioTrack = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield audioTrack_service_1.AudioTrackServices.deleteAudioTrack(req.params.trackId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Track deleted successfully",
        data: null,
    });
}));
exports.AudioTrackControllers = {
    addAudioTrack,
    getAllAudioTracks,
    getSingleAudioTrack,
    updateAudioTrack,
    deleteAudioTrack,
    getAllAudioTracksOfABook,
};
