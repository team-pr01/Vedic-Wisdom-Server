// project.controller.ts
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProjectServices } from "./project.services";

// Create project (For admin)
const addProject = catchAsync(async (req, res) => {
  const file = req.file;
  const result = await ProjectServices.addProject(
    req.body,
    file
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project created successfully",
    data: result,
  });
});

// Get all projects
const getAllProjects = catchAsync(async (req, res) => {
  const { keyword, skip = "0", limit = "10" } = req.query;

  const result = await ProjectServices.getAllProjects(
    keyword as string,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All projects fetched successfully",
    data: {
      projects: result.data,
      meta: result.meta,
    },
  });
});

// Get single project by ID
const getSingleProjectById = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const result = await ProjectServices.getSingleProjectById(
    projectId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project fetched successfully",
    data: result,
  });
});

// Update project
const updateProject = catchAsync(async (req, res) => {
  const file = req.file;
  const { projectId } = req.params;
  const result = await ProjectServices.updateProject(
    projectId,
    req.body,
    file
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project updated successfully",
    data: result,
  });
});

// Delete project
const deleteProject = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const result = await ProjectServices.deleteProject(projectId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project deleted successfully",
    data: result,
  });
});

export const ProjectController = {
  addProject,
  getAllProjects,
  getSingleProjectById,
  updateProject,
  deleteProject,
};