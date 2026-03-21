"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const referralSchema = new mongoose_1.Schema({
    referrer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    referredUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    },
    rank: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});
/* ---------------- Indexes ---------------- */
referralSchema.index({ referrer: 1 });
referralSchema.index({ referredUser: 1 }, { unique: true });
const Referral = (0, mongoose_1.model)("Referral", referralSchema);
exports.default = Referral;
