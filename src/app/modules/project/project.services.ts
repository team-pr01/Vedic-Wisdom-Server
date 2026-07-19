/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { TProject } from "./project.interface";
import Project from "./project.model";
import { infinitePaginate } from "../../utils/infinitePaginate";
import { deleteImageFromCloudinary, extractPublicId } from "../../utils/deleteImageFromCloudinary";

// Create project (admin only)
const addProject = async (
  payload: TProject,
  file: Express.Multer.File | undefined
) => {
  let imageUrl = "";

  if (file) {
    const imageName = `${payload.title}-${Date.now()}`;
    const path = file.path;

    const { secure_url } = await sendImageToCloudinary(imageName, path);
    imageUrl = secure_url;
  }

  const payloadData = {
    ...payload,
    amountNeeded: Number(payload.amountNeeded),
    amountRaised: 0,
    donors: [],
    imageUrl,
  };

  const result = await Project.create(payloadData);
  return result;
};

// Get all projects (with optional keyword & category)
const getAllProjects = async (
  keyword?: string,
  skip = 0,
  limit = 10
) => {
  const query: any = {};

  // 🔍 Search
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  return infinitePaginate(Project, query, skip, limit, []);
};

// Get a single project by ID
const getSingleProjectById = async (id: string) => {
  const result = await Project.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }
  return result;
};

// Update project by ID
const updateProject = async (
  id: string,
  payload: Partial<TProject>,
  file: Express.Multer.File | undefined
) => {
  const existing = await Project.findById(id);

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  let imageUrl: string | undefined;

  if (file) {
    const imageName = `${payload?.title || existing.title}-${Date.now()}`;
    const path = file.path;

    const { secure_url } = await sendImageToCloudinary(imageName, path);
    imageUrl = secure_url;
  }

  const updatePayload: Partial<TProject> = {
    ...payload,
    ...(imageUrl && { imageUrl }),
  };

  const result = await Project.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });

  return result;
};

// Delete project by ID
const deleteProject = async (id: string) => {
  const result = await Project.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  if (result.imageUrl) {
    const publicId = extractPublicId(result.imageUrl);
    await deleteImageFromCloudinary(publicId);
  }
  return result;
};

export const ProjectServices = {
  addProject,
  getAllProjects,
  getSingleProjectById,
  updateProject,
  deleteProject,
};