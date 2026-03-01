/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { VastuTips } from "./vastuTips.model";
import { infinitePaginate } from "../../utils/infinitePaginate";

/* ================= ADD ================= */
const addVastuTips = async (payload: any) => {
  return VastuTips.create(payload);
};

/* ================= GET ALL ================= */
const getAllVastuTips = async (
  filters: any = {},
  skip = 0,
  limit = 10
) => {
  const query: any = {};

  if (filters.keyword) {
    query.$text = { $search: filters.keyword };
  }

  if (filters.category) {
    query.category = filters.category.trim().toLowerCase();
  }

  return infinitePaginate(VastuTips, query, skip, limit);
};

/* ================= GET SINGLE ================= */
const getSingleVastuTips = async (id: string) => {
  const result = await VastuTips.findById(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Vastu Tips not found");
  }

  return result;
};

/* ================= UPDATE ================= */
const updateVastuTips = async (
  id: string,
  payload: any
) => {
  const result = await VastuTips.findByIdAndUpdate(
    id,
    payload,
    { new: true, runValidators: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Vastu Tips not found");
  }

  return result;
};

/* ================= DELETE ================= */
const deleteVastuTips = async (id: string) => {
  const result = await VastuTips.findByIdAndDelete(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Vastu Tips not found");
  }

  return result;
};

export const VastuTipsServices = {
  addVastuTips,
  getAllVastuTips,
  getSingleVastuTips,
  updateVastuTips,
  deleteVastuTips,
};