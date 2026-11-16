/* eslint-disable @typescript-eslint/no-explicit-any */
import cron from "node-cron";
import { Message } from "../modules/conversation/message/message.model";
import { getIO } from "../socket";

export const startMessageCleanupCron = () => {
    // Run every minute
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();

            // Find messages that should be deleted right now
            const messagesToDelete = await Message.find({
                deleteAt: { $lte: now, $ne: null },
            });

            if (messagesToDelete.length === 0) return;

            const io = getIO();

            // 1. Emit to the chat rooms to remove the messages from UI instantly
            for (const msg of messagesToDelete) {
                io.to(msg.conversationId.toString()).emit("messageAutoDeleted", {
                    messageId: msg._id,
                });
            }

            // 2. Delete them manually (just in case TTL is slightly delayed)
            await Message.deleteMany({
                _id: { $in: messagesToDelete.map((m) => m._id) },
            });

            console.log(`🧹 Auto-deleted ${messagesToDelete.length} expired messages.`);
        } catch (error) {
            console.error("❌ Error in message cleanup cron:", error);
        }
    });

    console.log("⏰ Message Auto-Delete Cron Job Started.");
};