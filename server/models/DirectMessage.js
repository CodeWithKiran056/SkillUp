const mongoose = require("mongoose");

// ==========================================
// DIRECT MESSAGE
// - Dedicated DM storage.
// - Does NOT reuse the room Message model
//   and never touches roomId-based chat.
// ==========================================

const directMessageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        message: {
            type: String,
            default: "",
            trim: true,
        },

        fileUrl: {
            type: String,
            default: "",
        },

        fileName: {
            type: String,
            default: "",
        },

        fileType: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("DirectMessage", directMessageSchema);
