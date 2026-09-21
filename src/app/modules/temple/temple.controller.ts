/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TempleServices } from "./temple.service";
import AppError from "../../errors/AppError";

const safeParse = (value: any) => {
    if (!value) return undefined;
    try {
        return typeof value === "string" ? JSON.parse(value) : value;
    } catch {
        throw new AppError(400, "Invalid JSON format in request body");
    }
};

const addTemple = catchAsync(async (req, res) => {
    const files = (req.files as Express.Multer.File[]) || [];

    // Parse multipart JSON fields safely
    const parsedBody = {
        ...req.body,
        basicInfo: safeParse(req.body.basicInfo),
        socialMedia: safeParse(req.body.socialMedia),
        location: safeParse(req.body.location),
        otherInfo: safeParse(req.body.otherInfo),
        media: safeParse(req.body.media) || {},
    };

    const result = await TempleServices.addTemple(
        req.user,
        parsedBody,
        files
    );

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Temple submitted successfully",
        data: result,
    });
});


const getAllTemples = catchAsync(async (req, res) => {
    const {
        keyword,
        country,
        city,
        area,
        category,
        status,
        skip = "0",
        limit = "10",
    } = req.query;

    const filters = {
        keyword: keyword as string,
        country: country as string,
        city: city as string,
        area: area as string,
        category: category as string,
        status: status as string,
    };

    const result = await TempleServices.getAllTemples(
        filters,
        Number(skip),
        Number(limit)
    );

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Temples retrieved successfully",
        data: {
            temples: result.data,
            meta: result.meta,
        },
    });
});

/* ---------------- GET SINGLE ---------------- */
const getSingleTempleById = catchAsync(async (req, res) => {
    const result = await TempleServices.getSingleTempleById(
        req.params.templeId
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Temple retrieved successfully",
        data: result,
    });
});

/* ---------------- UPDATE ---------------- */

const updateTemple = catchAsync(async (req, res) => {
    const files = (req.files as Express.Multer.File[]) || [];

    const parsedBody = {
        ...req.body,
        basicInfo: safeParse(req.body.basicInfo),
        socialMedia: safeParse(req.body.socialMedia),
        location: safeParse(req.body.location),
        otherInfo: safeParse(req.body.otherInfo),
        media: safeParse(req.body.media),
    };

    const result = await TempleServices.updateTemple(
        req.params.templeId,
        req.user,
        parsedBody,
        files
    );

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Temple updated successfully",
        data: result,
    });
});

/* ---------------- UPDATE STATUS ---------------- */
const updateTempleStatus = catchAsync(async (req, res) => {
    const result = await TempleServices.updateTempleStatus(
        req.params.templeId,
        req.body.status
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Temple status updated successfully",
        data: result,
    });
});

/* ---------------- DELETE ---------------- */
const deleteTemple = catchAsync(async (req, res) => {
    const result = await TempleServices.deleteTemple(req.params.templeId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Temple deleted successfully",
        data: result,
    });
});


const addEvent = catchAsync(async (req, res) => {
  const { templeId } = req.params;

  const files = (req.files as Express.Multer.File[]) || [];

  const parsedBody = {
    ...req.body,
    event: safeParse(req.body.event),
  };

  const result = await TempleServices.addEvent(
    templeId,
    parsedBody.event,
    files
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event added successfully",
    data: result,
  });
});

// UPDATE EVENT
const updateEvent = catchAsync(async (req, res) => {
  const { templeId, eventId } = req.params;

  const files = (req.files as Express.Multer.File[]) || [];

  const parsedBody = {
    ...req.body,
    event: safeParse(req.body.event),
  };

  const result = await TempleServices.updateEvent(
    templeId,
    eventId,
    parsedBody.event,
    files
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event updated successfully",
    data: result,
  });
});

// DELETE EVENT
const deleteEvent = catchAsync(async (req, res) => {
  const { templeId, eventId } = req.params;

  const result = await TempleServices.deleteEvent(templeId, eventId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event deleted successfully",
    data: result,
  });
});

export const TempleController = {
    addTemple,
    getAllTemples,
    getSingleTempleById,
    updateTemple,
    updateTempleStatus,
    deleteTemple,
    addEvent,
    updateEvent,
    deleteEvent,
};