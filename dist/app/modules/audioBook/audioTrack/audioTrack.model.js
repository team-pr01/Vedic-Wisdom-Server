"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const audioTrackSchema = new mongoose_1.Schema({
    audioBookId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "AudioBook",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        required: true,
        index: true,
    },
}, { timestamps: true });
audioTrackSchema.index({ audioBookId: 1, order: 1 });
const AudioTrack = (0, mongoose_1.model)("AudioTrack", audioTrackSchema);
exports.default = AudioTrack;
