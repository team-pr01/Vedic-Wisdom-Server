import { ObjectId } from "mongoose";

export type TMessage = {
    _id?: ObjectId;
    sender: ObjectId;
    receiver: ObjectId;
    messageType: "text" | "image" | "video" | "file";
    content: string;
    status: "sent" | "delivered" | "read";
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}