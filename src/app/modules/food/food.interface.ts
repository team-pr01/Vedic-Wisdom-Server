import { Types } from "mongoose";

export type VideoSource = "youtube" | "facebook";

export interface TFood {
    title: string;
    category: string;
    videoSource: VideoSource;
    videoUrl: string;
    duration: string;

    createdBy: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}