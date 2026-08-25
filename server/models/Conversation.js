const mongoose = require("mongoose");

// ==========================================
// CONVERSATION (Direct Messages)
// - Represents exactly TWO users.
// - Never stored as a Room document.
// - Lookup is deterministic:
//     Conversation.findOne({
//       participants: { $all: [a, b] },
//     })
//   always resolves to the same single
//   conversation for A <-> B.
// ==========================================

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        lastMessage: {
            type: String,
            default: "",
            trim: true,
        },

        lastMessageAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Helpful index for "my conversations" queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
