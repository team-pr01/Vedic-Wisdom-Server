import { Schema, model } from "mongoose";
import { TProjectTransaction } from "./projectTransaction.interface";

const ProjectTransactionSchema = new Schema<TProjectTransaction>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        donorName: {
            type: String,
            required: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "BDT",
        },
        transactionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["pending", "paid", "failed", "cancelled"],
            default: "pending",
        },
        paymentGatewayData: {
            type: Schema.Types.Mixed,
            required: false,
        },
    },
    { timestamps: true }
);

ProjectTransactionSchema.index({ projectId: 1, status: 1 });
ProjectTransactionSchema.index({ userId: 1, status: 1 });

const ProjectTransaction = model<TProjectTransaction>(
    "ProjectTransaction",
    ProjectTransactionSchema
);

export default ProjectTransaction;