import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { NewsServices } from "./news.services";

// Add News
const addNews = catchAsync(async (req, res) => {
  const file = req.file;
  const result = await NewsServices.addNews(req.body, file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "News added successfully",
    data: result,
  });
});

// Get All
const getAllNews = catchAsync(async (req, res) => {
  const {
    keyword,
    category,
    skip = "0",
    limit = "10",
  } = req.query;

  const filters = {
    keyword: keyword as string,
    category: category as string,
  };

  const result = await NewsServices.getAllNews(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "News fetched successfully.",
    data: {
      news: result.data,
      meta: result.meta,
    },
  });
});

// Get Single
const getSingleNewsById = catchAsync(async (req, res) => {
  const { newsId } = req.params;
  const result = await NewsServices.getSingleNewsById(newsId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "News fetched successfully.",
    data: result,
  });
});

// Update 
const updateNews = catchAsync(async (req, res) => {
  const { newsId } = req.params;
  if (req.body.translations && typeof req.body.translations === "string") {
    req.body.translations = JSON.parse(req.body.translations);
  }

  const result = await NewsServices.updateNews(newsId, req.body, req.file);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "News updated successfully",
    data: result,
  });
});

// Delete
const deleteNews = catchAsync(async (req, res) => {
  const { newsId } = req.params;
  const result = await NewsServices.deleteNews(newsId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "News deleted successfully.",
    data: result,
  });
});

const toggleLikeNewsController = catchAsync(async (req, res) => {
  const { newsId } = req.params;
  const userId = req.user.userId;

  const updatedNews = await NewsServices.toggleLikeNews(newsId, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "News like toggled successfully",
    data: {
      likes: updatedNews.likes,
      likedByUser: updatedNews.likedBy!.includes(userId),
    },
  });
});

const viewNews = catchAsync(async (req, res) => {
  const { newsId } = req.params;
  const userId = req.user.userId;

  const news = await NewsServices.addNewsView(newsId, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "News view recorded",
    data: {
      views: news.views
    },
  });
});

export const NewsControllers = {
  addNews,
  getAllNews,
  getSingleNewsById,
  updateNews,
  deleteNews,
  toggleLikeNewsController,
  viewNews
};