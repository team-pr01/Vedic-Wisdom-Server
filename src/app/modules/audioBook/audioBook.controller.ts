import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { AudioBookServices } from "./audioBook.service";
import sendResponse from "../../utils/sendResponse";



/* ADD AUDIOBOOK */

const addAudioBook = catchAsync(async (req, res) => {

  const file = req.file;

  const result = await AudioBookServices.addAudioBook(
    req.body,
    file
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "AudioBook created successfully",
    data: result,
  });
});



/* GET ALL */

const getAllAudioBooks = catchAsync(async (req, res) => {

  const {
    keyword,
    isPremium,
    skip = "0",
    limit = "10",
  } = req.query;

  const filters = {
    keyword,
    isPremium:
      isPremium === undefined
        ? undefined
        : isPremium === "true",
  };

  const result = await AudioBookServices.getAllAudioBooks(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "AudioBooks fetched successfully",
    data: result,
  });
});



/* GET SINGLE */

const getSingleAudioBook = catchAsync(async (req, res) => {

  const result =
    await AudioBookServices.getSingleAudioBook(
      req.params.audioBookId
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "AudioBook fetched successfully",
    data: result,
  });
});



/* UPDATE */

const updateAudioBook = catchAsync(async (req, res) => {

  const file = req.file;

  const result = await AudioBookServices.updateAudioBook(
    req.params.audioBookId,
    req.body,
    file
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "AudioBook updated successfully",
    data: result,
  });
});



/* DELETE */

const deleteAudioBook = catchAsync(async (req, res) => {

  await AudioBookServices.deleteAudioBook(
    req.params.audioBookId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "AudioBook deleted successfully",
    data: null,
  });
});



export const AudioBookControllers = {
  addAudioBook,
  getAllAudioBooks,
  getSingleAudioBook,
  updateAudioBook,
  deleteAudioBook,
};