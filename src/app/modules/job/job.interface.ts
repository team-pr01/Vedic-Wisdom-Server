import { ObjectId } from "mongoose";

// salary type
export type TSalary =
    | {
        type: "paid";
        minimum: number;
        maximum: number;
        currency: string;
    }
    | {
        type: "unpaid";
    };

// company employer
export type TCompanyEmployer = {
    hiringType: "company";
    company: {
        name: string;
        logo?: string;

        location: {
            city: string;
            state: string;
            country: string;
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

        tradeLicense?: string;
    };
};

// individual employer
export type TIndividualEmployer = {
    hiringType: "individual";
    individual: {
        fullName: string;
        phoneNumber: string;
        email: string;
        address: string;

        identityNumber: string;
        identityDocument?: string;
    };
};

// base job fields
export type TJobBase = {
    title: string;
    description: string;

    location: {
        city: string;
        state: string;
        country: string;
    };

    jobType: "fullTime" | "partTime" | "internship" | "contractual" | "freelance";

    workMode: "hybrid" | "remote" | "onsite";

    experienceLevel: string;

    salary: TSalary;

    responsibilities: string[];
    qualification: string[];
    benefits?: string[];

    applicationDeadline: Date;

    applicationCount?: number;

    status: "pending" | "rejected" | "active" | "closed";
    postedBy : ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
};

export type TJob =
    | (TJobBase & TCompanyEmployer)
    | (TJobBase & TIndividualEmployer);