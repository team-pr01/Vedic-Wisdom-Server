/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import Course from "./course.model";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { infinitePaginate } from "../../utils/infinitePaginate";
import { deleteImageFromCloudinary, extractPublicId } from "../../utils/deleteImageFromCloudinary";

const addCourse = async (payload: any, file: Express.Multer.File | undefined) => {
  let thumbnail = "";

  if (file) {
    const imageName = `${Date.now()}`;
    const path = file.path;
    const { secure_url } = await sendImageToCloudinary(imageName, path);
    thumbnail = secure_url;
  }

  const payloadData = {
    ...payload,
    thumbnail,
  };

  const result = await Course.create(payloadData);
  return result;
};

const getAllCourses = async (filters: any = {}, skip = 0, limit = 10) => {
  const query: any = {};

  // Text search
  if (filters.keyword) {
    query.$text = { $search: filters.keyword };
  }

  // Category filter
  if (filters.category) {
    query.category = filters.category.trim().toLowerCase();
  }

  return infinitePaginate(Course, query, skip, limit, []);
};

const getSingleCourseById = async (courseId: string) => {
  const result = await Course.findById(courseId);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }
  return result;
};

const updateCourse = async (
  courseId: string,
  payload: any,
  file: Express.Multer.File | undefined
) => {
  const existing = await Course.findById(courseId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  let thumbnail: string | undefined;

  if (file) {
    const imageName = `${Date.now()}`;
    const path = file.path;
    const { secure_url } = await sendImageToCloudinary(imageName, path);
    thumbnail = secure_url;
  }

  const updatePayload = {
    ...payload,
    ...(thumbnail && { thumbnail }),
  };

  const result = await Course.findByIdAndUpdate(courseId, updatePayload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteCourse = async (courseId: string) => {
  const existing = await Course.findById(courseId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  if (existing.thumbnail) {
      const publicId = extractPublicId(existing.thumbnail);
      await deleteImageFromCloudinary(publicId);
    }

  return await Course.findByIdAndDelete(courseId);
};

export const CourseServices = {
  addCourse,
  getAllCourses,
  getSingleCourseById,
  updateCourse,
  deleteCourse,
};