"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongoose_1 = require("mongoose");
const conversationSchema = new mongoose_1.Schema({
    isGroup: { type: Boolean, default: false },
    groupName: { type: String }, // Only for groups
    groupAvatar: { type: String }, // Only for groups
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }],
    admins: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }], // For group admins
    lastMessage: { type: mongoose_1.Schema.Types.ObjectId, ref: "Message" }, // For chat list preview
    blockedBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }], // For 1-on-1 blocking
    messageRequestStatus: {
        type: String,
        enum: ["pending", "accepted", "rejected", "none"],
        default: "none"
    },
    requestedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    // To Track who deleted the chat from their side
    deletedBy: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            deletedAt: { type: Date, default: Date.now }
        }],
    lastActiveAt: { type: Date, default: Date.now },
    //To Track who left the group
    leftMembers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
exports.Conversation = (0, mongoose_1.model)("Conversation", conversationSchema);
