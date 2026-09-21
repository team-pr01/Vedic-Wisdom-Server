"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DonationProgramSchema = new mongoose_1.Schema({
    imageUrl: {
        type: String,
        required: false,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    amountNeeded: {
        type: Number,
        required: true,
    },
    amountRaised: {
        type: Number,
        required: false,
        default: 0,
    },
    currency: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const DonationPrograms = (0, mongoose_1.model)("DonationPrograms", DonationProgramSchema);
exports.default = DonationPrograms;
