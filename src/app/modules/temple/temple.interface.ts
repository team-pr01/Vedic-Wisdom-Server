import { Types } from "mongoose";

//    BASIC INFO
export interface TBasicInfo {
    templeName: string;
    mainDeity: string;
    description: string;
}

//    SOCIAL MEDIA
export interface TSocialMedia {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    linkedin?: string;
}

//    LOCATION
export interface TLocation {
    address: string;
    city: string;
    state: string;
    country: string;
    area?: string;
    googleMapUrl?: string;
}

//    OTHER INFO
export interface TOtherInfo {
    establishedYear?: number;
    visitingHours?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
}

//    MEDIA
export interface TMedia {
    imageUrls?: string[];
    videoUrls?: string[];
}

//    TEMPLE STATUS TYPE
export type TempleStatus =
    | "draft"
    | "pending"
    | "approved"
    | "rejected";

    export type TEvent = {
        name : string;
        date : Date;
        description : string;
        imageUrls : string[];
    }

//    MAIN TEMPLE INTERFACE
export interface TTemple {
    basicInfo: TBasicInfo;
    socialMedia?: TSocialMedia;
    location: TLocation;
    otherInfo?: TOtherInfo;
    media?: TMedia;
    event? : TEvent[];

    category: string;

    status?: TempleStatus;

    createdBy: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}