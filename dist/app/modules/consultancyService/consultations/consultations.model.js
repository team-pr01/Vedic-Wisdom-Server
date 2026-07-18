"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ConsultationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    consultationId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    consultantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ConsultancyService",
        required: true,
        index: true,
    },
    concern: {
        type: String,
        required: false,
        trim: true,
    },
    scheduledAt: {
        type: Date,
        required: false,
    },
    meetingLink: {
        type: String,
        required: false,
        trim: true,
    },
    status: {
        type: String,
        enum: ["pending", "scheduled", "closed", "cancelled"],
        default: "pending",
        index: true,
    },
}, {
    timestamps: true,
});
// Compound indexes
ConsultationSchema.index({ userId: 1, status: 1 });
ConsultationSchema.index({ consultationId: 1, status: 1 });
ConsultationSchema.index({ consultantId: 1, status: 1 });
ConsultationSchema.index({ createdAt: -1 });
// Text search index
ConsultationSchema.index({
    consultationId: "text",
    concern: "text",
});
const Consultation = (0, mongoose_1.model)("Consultation", ConsultationSchema);
exports.default = Consultation;
