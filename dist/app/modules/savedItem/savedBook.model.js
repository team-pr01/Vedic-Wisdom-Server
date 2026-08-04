"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedItem = void 0;
const mongoose_1 = require("mongoose");
const SavedItemSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    itemId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        refPath: "itemType",
    },
    itemType: {
        type: String,
        enum: ["book", "audioBook"],
        required: true,
    },
}, {
    timestamps: true,
});
SavedItemSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });
SavedItemSchema.index({ userId: 1, itemType: 1 });
SavedItemSchema.index({ createdAt: -1 });
exports.SavedItem = (0, mongoose_1.model)("SavedItem", SavedItemSchema);
