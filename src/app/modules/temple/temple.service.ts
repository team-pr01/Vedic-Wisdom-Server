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

    /* ---------------- PARSE VIDEO URLS ---------------- */
    let videoUrls: string[] = [];
    if (payload.videoUrls) {
        try {
            const parsedVideoUrls = typeof payload.videoUrls === 'string'
                ? JSON.parse(payload.videoUrls)
                : payload.videoUrls;

            // Convert YouTube URLs to embed URLs
            if (Array.isArray(parsedVideoUrls)) {
                videoUrls = parsedVideoUrls.map((url: string) => {
                    return convertToEmbedUrl(url);
                });
            } else {
                videoUrls = [];
            }
        } catch (error) {
            videoUrls = [];
        }
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
            const imageName = `${payload.templeName || "temple"}-${Date.now()}-${index}`;

            const { secure_url } = await sendImageToCloudinary(
                imageName,
                file.path
            );

            return secure_url;
        });

        imageUrls = await Promise.all(uploadPromises);
    }

    /* ---------------- STATUS ---------------- */
    const status = user.role === "admin" ? "approved" : "pending";

    /* ---------------- FINAL DATA ---------------- */
    const templeData = {
        basicInfo: {
            templeName: payload.templeName,
            mainDeity: payload.mainDeity,
            description: payload.description
        },
        socialMedia: {
            facebook: payload.facebook || "",
            youtube: payload.youtube || "",
            instagram: payload.instagram || "",
            linkedin: payload.linkedin || ""
        },
        location: {
            address: payload.address,
            city: payload.city,
            state: payload.state,
            country: payload.country,
            googleMapUrl: payload.googleMapUrl || ""
        },
        otherInfo: {
            establishedYear: payload.establishedYear ? Number(payload.establishedYear) : null,
            visitingHours: payload.visitingHours || "",
            phoneNumber: payload.phoneNumber || "",
            email: payload.email || "",
            website: payload.website || ""
        },
        category: payload.category,
        media: {
            imageUrls: imageUrls || [],
            videoUrls: videoUrls || []
        },
        createdBy: user.userId,
        status,
    };

    console.log("Final Temple Data:", JSON.stringify(templeData, null, 2));

    return Temple.create(templeData);
};

// Helper function to convert YouTube URLs to embed URLs
function convertToEmbedUrl(url: string): string {
    // If it's already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
        return url;
    }

    // Extract video ID from various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([\w-]+)/,
        /(?:youtu\.be\/)([\w-]+)/,
        /(?:youtube\.com\/shorts\/)([\w-]+)/,
        /(?:youtube\.com\/v\/)([\w-]+)/,
        /(?:youtube\.com\/embed\/)([\w-]+)/,
    ];

    let videoId: string | null = null;

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            videoId = match[1];
            break;
        }
    }

    // If no video ID found, return original URL
    if (!videoId) {
        return url;
    }

    // Return embed URL
    return `https://www.youtube.com/embed/${videoId}`;
}


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