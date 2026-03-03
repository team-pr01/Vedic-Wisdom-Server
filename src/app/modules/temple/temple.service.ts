/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { infinitePaginate } from "../../utils/infinitePaginate";
import { Temple } from "./temple.model";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";

const addTemple = async (
    user: any,
    payload: any,
    files: Express.Multer.File[] = []
) => {
    if (!payload) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid payload");
    }

    if (!payload.basicInfo) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "basicInfo is required"
        );
    }

    if (!payload.location) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "location is required"
        );
    }

    /* ---------------- IMAGE VALIDATION ---------------- */
    if (files.length > 10) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Maximum 10 images allowed"
        );
    }

    /* ---------------- UPLOAD IMAGES ---------------- */
    let imageUrls: string[] = [];

    if (files.length > 0) {
        const uploadPromises = files.map(async (file, index) => {
            const imageName = `${payload.basicInfo.templeName || "temple"
                }-${Date.now()}-${index}`;

            const { secure_url } = await sendImageToCloudinary(
                imageName,
                file.path
            );

            return secure_url;
        });

        imageUrls = await Promise.all(uploadPromises);
    }

    /* ---------------- STATUS ---------------- */
    const status =
        user.role === "admin" ? "approved" : "pending";

    /* ---------------- FINAL DATA ---------------- */
    const templeData = {
        ...payload,
        media: {
            ...(payload.media || {}),
            imageUrls,
        },
        createdBy: user.userId,
        status,
    };

    return Temple.create(templeData);
};


const splitMulti = (value?: string) =>
    value ? value.split(",").map((v) => v.trim()) : [];

const getAllTemples = async (
    filters: any = {},
    skip = 0,
    limit = 10
) => {
    const filteredQuery: any = { status: { $regex: "^approved$", $options: "i" } };

    /* -------- SEARCH (TEXT INDEX) -------- */
    if (filters.keyword) {
        filteredQuery.$text = { $search: filters.keyword };
    }

    /* -------- COUNTRY -------- */
    if (filters.country) {
        const countries = splitMulti(filters.country);

        filteredQuery["location.country"] =
            countries.length === 1
                ? { $regex: `^${countries[0]}$`, $options: "i" }
                : {
                    $in: countries.map(
                        (c) => new RegExp(`^${c}$`, "i")
                    ),
                };
    }

    /* -------- CITY -------- */
    if (filters.city) {
        const cities = splitMulti(filters.city);

        filteredQuery["location.city"] =
            cities.length === 1
                ? { $regex: `^${cities[0]}$`, $options: "i" }
                : {
                    $in: cities.map(
                        (c) => new RegExp(`^${c}$`, "i")
                    ),
                };
    }

    /* -------- AREA -------- */
    if (filters.area) {
        const areas = splitMulti(filters.area);

        filteredQuery["location.area"] =
            areas.length === 1
                ? { $regex: `^${areas[0]}$`, $options: "i" }
                : {
                    $in: areas.map(
                        (a) => new RegExp(`^${a}$`, "i")
                    ),
                };
    }

    /* -------- CATEGORY -------- */
    if (filters.category) {
        const categories = splitMulti(filters.category);

        filteredQuery.category =
            categories.length === 1
                ? categories[0]
                : { $in: categories };
    }

    /* -------- STATUS (ADMIN) -------- */
    if (filters.status) {
        filteredQuery.status = {
            $regex: `^${filters.status}$`,
            $options: "i",
        };
    }

    return infinitePaginate(
        Temple,
        filteredQuery,
        skip,
        limit,
        [
            { path: "category", select: "name" },
            { path: "createdBy", select: "name email" },
        ]
    );
};


//    GET SINGLE
const getSingleTempleById = async (templeId: string) => {
    const temple = await Temple.findById(templeId)
        .populate("category", "name")
        .populate("createdBy", "name email");

    if (!temple) {
        throw new AppError(httpStatus.NOT_FOUND, "Temple not found");
    }

    return temple;
};

//    UPDATE
const updateTemple = async (
    templeId: string,
    user: any,
    payload: any,
    files: Express.Multer.File[] = []
) => {
    const temple = await Temple.findById(templeId);

    if (!temple) {
        throw new AppError(httpStatus.NOT_FOUND, "Temple not found");
    }

    // Authorization
    if (
        temple.createdBy.toString() !== user.userId &&
        user.role !== "admin"
    ) {
        throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
    }

    /* ---------------- HANDLE IMAGE UPLOAD ---------------- */

    let imageUrls = temple.media?.imageUrls || [];

    if (files.length > 0) {
        if (files.length + imageUrls.length > 10) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Maximum 10 images allowed"
            );
        }

        const uploadPromises = files.map(async (file, index) => {
            const imageName = `${payload.basicInfo?.templeName ||
                temple.basicInfo?.templeName ||
                "temple"
                }-${Date.now()}-${index}`;

            const { secure_url } = await sendImageToCloudinary(
                imageName,
                file.path
            );

            return secure_url;
        });

        const newImages = await Promise.all(uploadPromises);

        imageUrls = [...imageUrls, ...newImages];
    }


    /* ---------------- BUILD UPDATE OBJECT ---------------- */

    const updateData: any = {
        ...payload,
        media: {
            ...temple.media,
            ...(payload.media || {}),
            imageUrls,
        },
    };

    const updatedTemple = await Temple.findByIdAndUpdate(
        templeId,
        updateData,
        { new: true, runValidators: true }
    );

    return updatedTemple;
};

//    UPDATE STATUS
const updateTempleStatus = async (
    templeId: string,
    status: string
) => {
    return Temple.findByIdAndUpdate(
        templeId,
        { status },
        { new: true }
    );
};

//    DELETE
const deleteTemple = async (templeId: string) => {
    const temple = await Temple.findById(templeId);

    if (!temple) {
        throw new AppError(httpStatus.NOT_FOUND, "Temple not found");
    };
    return Temple.findByIdAndDelete(templeId);
};

// ADD EVENT
const addEvent = async (
    templeId: string,
    eventPayload: any,
    files: Express.Multer.File[] = []
) => {
    if (!eventPayload) {
        throw new AppError(httpStatus.BAD_REQUEST, "Event data is required");
    }

    const temple = await Temple.findById(templeId);

    if (!temple) {
        throw new AppError(httpStatus.NOT_FOUND, "Temple not found");
    }

    if (files.length > 5) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Maximum 5 images allowed for event"
        );
    }

    let imageUrls: string[] = [];

    if (files.length > 0) {
        const uploadPromises = files.map(async (file, index) => {
            const imageName = `${eventPayload.name}-${Date.now()}-${index}`;

            const { secure_url } = await sendImageToCloudinary(
                imageName,
                file.path
            );

            return secure_url;
        });

        imageUrls = await Promise.all(uploadPromises);
    }

    const newEvent = {
        ...eventPayload,
        imageUrls,
    };

    temple.event = temple.event || [];
    temple.event.push(newEvent);

    await temple.save();

    return temple;
};

// UPDATE EVENT
const updateEvent = async (
    templeId: string,
    eventId: string,
    eventPayload: any,
    files: Express.Multer.File[] = []
) => {
    const temple = await Temple.findById(templeId);

    if (!temple) {
        throw new AppError(httpStatus.NOT_FOUND, "Temple not found");
    }

    // Ensure event is an array
    if (!Array.isArray(temple.event)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid event structure");
    }

    const eventIndex = temple.event.findIndex(
        (ev: any) => ev._id.toString() === eventId
    );

    if (eventIndex === -1) {
        throw new AppError(httpStatus.NOT_FOUND, "Event not found");
    }

    const existingEvent = temple.event[eventIndex];

    /* ---------------- PARTIAL FIELD UPDATE ---------------- */

    if (eventPayload?.name !== undefined) {
        existingEvent.name = eventPayload.name;
    }

    if (eventPayload?.date !== undefined) {
        existingEvent.date = eventPayload.date;
    }

    if (eventPayload?.description !== undefined) {
        existingEvent.description = eventPayload.description;
    }

    /* ---------------- IMAGE UPDATE (REPLACE ONLY IF NEW FILES) ---------------- */

    if (files.length > 0) {
        if (files.length > 5) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Maximum 5 images allowed for event"
            );
        }

        const uploadPromises = files.map(async (file, index) => {
            const imageName = `${existingEvent.name}-${Date.now()}-${index}`;

            const { secure_url } = await sendImageToCloudinary(
                imageName,
                file.path
            );

            return secure_url;
        });

        existingEvent.imageUrls = await Promise.all(uploadPromises);
    }

    await temple.save();

    return temple;
};

// DELETE EVENT
const deleteEvent = async (templeId: string, eventId: string) => {
    const temple = await Temple.findById(templeId);

    if (!temple) {
        throw new AppError(httpStatus.NOT_FOUND, "Temple not found");
    }

    temple.event = temple.event?.filter(
        (ev: any) => ev._id.toString() !== eventId
    );

    await temple.save();

    return temple;
};


export const TempleServices = {
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