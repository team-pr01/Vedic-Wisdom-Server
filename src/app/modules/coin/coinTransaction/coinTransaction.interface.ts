import { ObjectId } from "mongoose";

export type TTransactionStatus = "pending" | "paid" | "failed";
export type TCoinTransaction = {
    userId: ObjectId;
    packageId: ObjectId;
    coinAmount: number;
    price: number;
    transactionId: string;
    status: TTransactionStatus;
    createdAt?: Date;
    updatedAt?: Date;
}