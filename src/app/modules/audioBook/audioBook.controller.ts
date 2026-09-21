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
  const { keyword, isPremium, category, skip = "0", limit = "10" } = req.query;

  const result = await AudioBookServices.getAllAudioBooks(
    { keyword, isPremium, category },
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All audio books fetched successfully",
    data: {
      audioBooks: result.data,
      meta: result.meta,
    },
  });
});

/* GET NEW ARRIVALS */
const getNewArrivals = catchAsync(async (req, res) => {
  const { keyword, isPremium, category, skip = "0", limit = "10" } = req.query;

  const result = await AudioBookServices.getNewArrivals(
    { keyword, isPremium, category },
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New arrivals fetched successfully",
    data: {
      audioBooks: result.data,
      meta: result.meta,
    },
  });
});

/* GET MOST POPULAR AUDIOBOOKS */
const getMostPopularAudioBooks = catchAsync(async (req, res) => {
  const { keyword, isPremium, category, skip = "0", limit = "10" } = req.query;

  const result = await AudioBookServices.getMostPopularAudioBooks(
    { keyword, isPremium, category },
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Most popular audio books fetched successfully",
    data: {
      audioBooks: result.data,
      meta: result.meta,
    },
  });
});

/* GET RECOMMENDED AUDIOBOOKS */
// const getRecommendedAudioBooks = catchAsync(async (req, res) => {
//   const { keyword, isPremium, skip = "0", limit = "10" } = req.query;

//   const result = await AudioBookServices.getRecommendedAudioBooks(
//     req.user._id,
//     { keyword, isPremium },
//     Number(skip),
//     Number(limit)
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Recommended audio books fetched successfully",
//     data: {
//       audioBooks: result.data,
//       meta: result.meta,
//     },
//   });
// });


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
  getNewArrivals,
  getMostPopularAudioBooks,
  getSingleAudioBook,
  updateAudioBook,
  deleteAudioBook,
};