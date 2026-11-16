"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMessageCleanupCron = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const node_cron_1 = __importDefault(require("node-cron"));
const message_model_1 = require("../modules/conversation/message/message.model");
const socket_1 = require("../socket");
const startMessageCleanupCron = () => {
    // Run every minute
    node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const now = new Date();
            // Find messages that should be deleted right now
            const messagesToDelete = yield message_model_1.Message.find({
                deleteAt: { $lte: now, $ne: null },
            });
            if (messagesToDelete.length === 0)
                return;
            const io = (0, socket_1.getIO)();
            // 1. Emit to the chat rooms to remove the messages from UI instantly
            for (const msg of messagesToDelete) {
                io.to(msg.conversationId.toString()).emit("messageAutoDeleted", {
                    messageId: msg._id,
                });
            }
            // 2. Delete them manually (just in case TTL is slightly delayed)
            yield message_model_1.Message.deleteMany({
                _id: { $in: messagesToDelete.map((m) => m._id) },
            });
            console.log(`🧹 Auto-deleted ${messagesToDelete.length} expired messages.`);
        }
        catch (error) {
            console.error("❌ Error in message cleanup cron:", error);
        }
    }));
    console.log("⏰ Message Auto-Delete Cron Job Started.");
};
exports.startMessageCleanupCron = startMessageCleanupCron;
