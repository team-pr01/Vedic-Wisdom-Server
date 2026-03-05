import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CourseServices } from "./course.services";

// Add Course
const addCourse = catchAsync(async (req, res) => {
  const file = req.file;
  const result = await CourseServices.addCourse(req.body, file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course added successfully",
    data: result,
  });
});

// Get All Courses
const getAllCourses = catchAsync(async (req, res) => {
  const { keyword, category, skip = "0", limit = "10" } = req.query;

  const filters = {
    keyword: keyword as string,
    category: category as string,
  };

  const result = await CourseServices.getAllCourses(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses fetched successfully.",
    data: {
      courses: result.data,
      meta: result.meta,
    },
  });
});

// Get Single Course
const getSingleCourseById = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const result = await CourseServices.getSingleCourseById(courseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course fetched successfully.",
    data: result,
  });
});

// Update Course
const updateCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const result = await CourseServices.updateCourse(
    courseId,
    req.body,
    req.file
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course updated successfully",
    data: result,
  });
});

// Delete Course
const deleteCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const result = await CourseServices.deleteCourse(courseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course deleted successfully.",
    data: result,
  });
});

export const CourseControllers = {
  addCourse,
  getAllCourses,
  getSingleCourseById,
  updateCourse,
  deleteCourse,
};