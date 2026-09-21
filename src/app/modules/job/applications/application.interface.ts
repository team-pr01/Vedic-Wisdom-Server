import { ObjectId } from "mongoose";

export type TApplication = {
  jobId: ObjectId;
  userId: ObjectId;
  status?: "applied" | "withdrawn" | "shortlisted" | "hired" | "rejected";
  selectedCandidate?: ObjectId;
  resume: string;
  noteFromApplicant?: string;
};