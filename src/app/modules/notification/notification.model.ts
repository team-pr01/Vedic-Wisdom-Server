import { Schema, model } from "mongoose";
import { TNotification } from "./notification.interface";

const NotificationSchema = new Schema<TNotification>(
  {
    to: { type: [Schema.Types.ObjectId], ref: "User", required: true },
    title: String,
    message: String,
    isRead: { type: Boolean, default: false },
    data: Object,
    deepLink: { type: String, default: null },
    externalLink: { type: String, default: null },
  },
  { timestamps: true }
);

export const Notification = model<TNotification>("Notification", NotificationSchema);