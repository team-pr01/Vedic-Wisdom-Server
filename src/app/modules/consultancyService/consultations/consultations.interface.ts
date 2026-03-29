import { ObjectId } from "mongoose";

export type TConsultation = {
  userId: ObjectId;
  consultationId: string;
  consultantId: ObjectId;
  concern?: string;
  scheduledAt?: Date;
  meetingLink?: string;
  status?: "pending" | "scheduled" | "closed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
};
