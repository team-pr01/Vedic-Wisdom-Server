import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { AudioTrackServices } from "./audioTrack.service";


const addAudioTrack = catchAsync(async (req, res) => {

  const file = req.file;

  const result = await AudioTrackServices.addAudioTrack(
    req.body,
    file
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Audio track added successfully",
    data: result,
  });
});


const getAllAudioTracks = catchAsync(async (req, res) => {

  const { audioBookId, skip = "0", limit = "10" } = req.query;

  const filters = {
    audioBookId,
  };

  const result = await AudioTrackServices.getAllAudioTracks(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tracks fetched successfully",
    data: result,
  });
});


const getSingleAudioTrack = catchAsync(async (req, res) => {

  const result =
    await AudioTrackServices.getSingleAudioTrack(
      req.params.trackId
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Track fetched successfully",
    data: result,
  });
});


const getAllAudioTracksOfABook = catchAsync(async (req, res) => {

  const result =
    await AudioTrackServices.getAllAudioTracksOfABook(
      req.params.audioBookId
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tracks fetched successfully",
    data: result,
  });
});


const updateAudioTrack = catchAsync(async (req, res) => {

  const file = req.file;

  const result = await AudioTrackServices.updateAudioTrack(
    req.params.trackId,
    req.body,
    file
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Track updated successfully",
    data: result,
  });
});


const deleteAudioTrack = catchAsync(async (req, res) => {

  await AudioTrackServices.deleteAudioTrack(
    req.params.trackId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Track deleted successfully",
    data: null,
  });
});


export const AudioTrackControllers = {
  addAudioTrack,
  getAllAudioTracks,
  getSingleAudioTrack,
  updateAudioTrack,
  deleteAudioTrack,
  getAllAudioTracksOfABook,
};