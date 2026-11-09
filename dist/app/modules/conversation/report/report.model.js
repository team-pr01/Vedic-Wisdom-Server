"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const mongoose_1 = require("mongoose");
const reportSchema = new mongoose_1.Schema({
    reporterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    targetId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    reportType: {
        type: String,
        enum: ["user", "group", "message"],
        required: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["pending", "resolved", "dismissed"],
        default: "pending",
        index: true,
    },
}, { timestamps: true });
exports.Report = (0, mongoose_1.model)("Report", reportSchema);
