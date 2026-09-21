/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TNews } from "./news.interface";
import News from "./news.model";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { infinitePaginate } from "../../utils/infinitePaginate";

const addNews = async (
  payload: TNews,
  file: Express.Multer.File | undefined
) => {
  let imageUrl = "";

  if (file) {
    const imageName = `${Date.now()}`;
    const path = file.path;

    const { secure_url } = await sendImageToCloudinary(imageName, path);
    imageUrl = secure_url;
  }

  let translations = payload.translations;
  if (typeof translations === "string") {
    translations = JSON.parse(translations);
  }

  const payloadData = {
    ...payload,
    imageUrl,
    translations,
  };

  const result = await News.create(payloadData);
  return result;
};

const getAllNews = async (
  filters: any = {},
  skip = 0,
  limit = 10
) => {
  const query: any = {};

  const languageCode = filters.languageCode || "en";

  // 🔥 EXCLUDE trending news from regular feed
  query.isTrending = { $ne: true };

  // CATEGORY FILTER
  if (filters.category) {
    query.category = { $regex: `^${filters.category.trim()}$`, $options: "i" };
  }

  // KEYWORD SEARCH (title + content + tags)
  if (filters.keyword) {
    query.$or = [
      {
        [`translations.${languageCode}.title`]: {
          $regex: filters.keyword,
          $options: "i",
        },
      },
      {
        [`translations.${languageCode}.content`]: {
          $regex: filters.keyword,
          $options: "i",
        },
      },
      {
        [`translations.${languageCode}.tags`]: {
          $elemMatch: {
            $regex: filters.keyword,
            $options: "i",
          },
        },
      },
    ];
  }

  const result = await infinitePaginate(
    News,
    query,
    skip,
    limit,
    []
  );

  // Transform response → return only selected language
  result.data = result.data.map((news: any) => {
    const translation =
      news.translations.get(languageCode) ||
      news.translations.get("en");

    const languages = Array.from(news.translations.keys());

    return {
      _id: news._id,
      imageUrl: news.imageUrl,
      category: news.category,
      likes: news.likes,
      likedBy: news.likedBy,
      views: news.views,
      languages,
      createdAt: news.createdAt,
      title: translation?.title || "",
      overview: translation?.overview || "",
      content: translation?.content || "",
      tags: translation?.tags || [],
      isTrending: news.isTrending || false,
    };
  });

  return result;
};

const getAllTrendingNews = async (
  filters: any = {},
  skip = 0,
  limit = 10
) => {
  const query: any = {};

  const languageCode = filters.languageCode || "en";

  // 🔥 ONLY fetch trending news
  query.isTrending = true;

  // CATEGORY FILTER
  if (filters.category) {
    query.category = { $regex: `^${filters.category.trim()}$`, $options: "i" };
  }

  // KEYWORD SEARCH (title + content + tags)
  if (filters.keyword) {
    query.$or = [
      {
        [`translations.${languageCode}.title`]: {
          $regex: filters.keyword,
          $options: "i",
        },
      },
      {
        [`translations.${languageCode}.content`]: {
          $regex: filters.keyword,
          $options: "i",
        },
      },
      {
        [`translations.${languageCode}.tags`]: {
          $elemMatch: {
            $regex: filters.keyword,
            $options: "i",
          },
        },
      },
    ];
  }


  const result = await infinitePaginate(
    News,
    query,
    skip,
    limit,
    [],
  );

  // Transform response → return only selected language
  result.data = result.data.map((news: any) => {
    const translation =
      news.translations.get(languageCode) ||
      news.translations.get("en");

    const languages = Array.from(news.translations.keys());

    return {
      _id: news._id,
      imageUrl: news.imageUrl,
      category: news.category,
      likes: news.likes,
      likedBy: news.likedBy,
      views: news.views,
      languages,
      createdAt: news.createdAt,
      trendingAt: news.trendingAt,
      title: translation?.title || "",
      overview: translation?.overview || "",
      content: translation?.content || "",
      tags: translation?.tags || [],
      isTrending: true,
    };
  });

  return result;
};

const getSingleNewsById = async (
  newsId: string,
  languageCode = "en"
) => {
  const result = await News.findById(newsId);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "News not found");
  }

  const translation = result.translations.get(languageCode);

  if (!translation) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Translation not available for this language.`
    );
  }

  const languages = Array.from(result.translations.keys());

  return {
    _id: result._id,
    imageUrl: result.imageUrl,
    category: result.category,
    likes: result.likes,
    likedBy: result.likedBy,
    views: result.views,
    languages,
    createdAt: result.createdAt,

    title: translation.title,
    overview: translation.overview,
    content: translation.content,
    tags: translation.tags,
    isTrending: result.isTrending
  };
};

const updateNews = async (
  newsId: string,
  payload: Partial<TNews>,
  file: any
) => {
  const existing = await News.findById(newsId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "News not found");
  }

  let imageUrl: string | undefined;

  if (file) {
    const imageName = `${Date.now()}`;
    const path = file.path;

    const { secure_url } = await sendImageToCloudinary(imageName, path);
    imageUrl = secure_url;
  }

  const updatePayload: Partial<TNews> = {
    ...payload,
    ...(imageUrl && { imageUrl }),
  };

  const result = await News.findByIdAndUpdate(newsId, updatePayload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteNews = async (newsId: string) => {
  const existing = await News.findById(newsId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "News not found");
  }

  return await News.findByIdAndDelete(newsId);
};

const toggleLikeNews = async (newsId: string, userId: string) => {
  const news = await News.findById(newsId);
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, "News not found");
  }

  const likedIndex = news.likedBy!.findIndex((id) => id.toString() === userId);

  let updateOperation: any;

  if (likedIndex >= 0) {
    // User already liked -> unlike
    updateOperation = {
      $pull: { likedBy: userId },
      $inc: { likes: -1 }
    };
  } else {
    // User not liked -> like
    updateOperation = {
      $push: { likedBy: userId },
      $inc: { likes: 1 }
    };
  }

  const updatedNews = await News.findByIdAndUpdate(
    newsId,
    updateOperation,
    { new: true, runValidators: false } // Disable validators for this operation
  );

  if (!updatedNews) {
    throw new AppError(httpStatus.NOT_FOUND, "News not found");
  }

  return updatedNews;
};

const addNewsView = async (newsId: string, userId: string) => {
  const news = await News.findById(newsId);
  if (!news) throw new Error("News not found");

  // Only increment if user hasn't viewed yet
  if (!news.viewedBy!.includes(userId as any)) {
    news.viewedBy!.push(userId as any);
    news.views! += 1;
    await news.save();
  }

  return news;
};

const toggleIsTrendingNews = async (newsId: string) => {
  const news = await News.findById(newsId);
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, "News not found");
  }

  // Toggle the isTrending field
  const newTrendingStatus = !news.isTrending;

  news.isTrending = newTrendingStatus;

  await news.save();

  return {
    news,
    message: newTrendingStatus
      ? "News marked as trending successfully"
      : "News removed from trending successfully"
  };
};

export const NewsServices = {
  addNews,
  getAllNews,
  getAllTrendingNews,
  getSingleNewsById,
  updateNews,
  deleteNews,
  toggleLikeNews,
  addNewsView,
  toggleIsTrendingNews
};
