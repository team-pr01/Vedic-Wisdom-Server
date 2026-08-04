"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioBookPurchase = void 0;
const mongoose_1 = require("mongoose");
const AudioBookPurchaseSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    audioBookId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "AudioBook",
        required: true,
        index: true,
    },
    coinPrice: {
        type: Number,
        required: true,
        min: 0,
    }
}, {
    timestamps: true,
});
AudioBookPurchaseSchema.index({ userId: 1, audioBookId: 1 }, { unique: true });
AudioBookPurchaseSchema.index({ userId: 1, purchaseDate: -1 });
AudioBookPurchaseSchema.index({ audioBookId: 1 });
exports.AudioBookPurchase = (0, mongoose_1.model)("AudioBookPurchase", AudioBookPurchaseSchema);
