import { ObjectId } from "mongoose";

// salary type
export type TSalary =
    {
        minimum: number;
        maximum: number;
        currency: string;
    }

type TCompany = {
    name: string;
    logo?: string;

    location: {
        city: string;
        state: string;
        country: string;
        address: string;
    };

    description?: string;

    phoneNumber: string;
    email: string;
    website?: string;

    socialMedia?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
    };
};

// base job fields
export type TJob = {
    title: string;
    description: string;

    location: {
        city: string;
        state: string;
        country: string;
        address: string;
    };

    jobType: "fullTime" | "partTime" | "internship" | "contractual" | "freelance";

    workMode: "hybrid" | "remote" | "onsite";

    educationLevel: string;
    experienceLevel: string;

    salary: TSalary;

    responsibilities: string[];
    requiredSkills: string;
    qualifications: string[];

    applicationDeadline: Date;
    vacancy: number;

    company: TCompany;

    applicationCount?: number;
    applications?: ObjectId[];

    status: "pending" | "rejected" | "active" | "closed";
    postedBy: ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
};