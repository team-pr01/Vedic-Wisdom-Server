"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const vendorSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    shopName: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    documentUrls: {
        type: [String],
        default: [],
    },
    businessAddress: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    shopUrl: {
        type: String,
        unique: true,
        sparse: true,
    },
    status: {
        type: String,
        enum: ["applied", "suspended", "approved", "rejected"],
        default: "applied",
        index: true,
    },
    suspensionReason: {
        type: String,
    },
    suspendedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
/* TEXT SEARCH INDEX */
vendorSchema.index({
    name: "text",
    email: "text",
    phoneNumber: "text",
    shopName: "text",
});
const Vendor = (0, mongoose_1.model)("Vendor", vendorSchema);
exports.default = Vendor;
