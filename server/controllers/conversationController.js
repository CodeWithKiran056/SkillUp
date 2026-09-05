const Conversation = require("../models/Conversation");
const DirectMessage = require("../models/DirectMessage");
const User = require("../models/User");
const { emitToUsers } = require("../socket/dmSocket");
const { createNotification } = require("../services/notificationService");

// ==========================================
// HELPERS
// ==========================================

// Deterministic lookup so A <-> B always
// resolves to the same conversation.
const findConversationBetween = (userA, userB) =>
    Conversation.findOne({
        participants: {
            $all: [userA, userB],
        },
    });

const isValidObjectId = (value) =>
    typeof value === "string" &&
    /^[0-9a-fA-F]{24}$/.test(value);

// Bidirectional connection check against the
// REAL User.connections arrays. Frontend
// connectionStatus is never trusted.
const areConnected = async (userA, userB) => {
    const [a, b] = await Promise.all([
        User.findById(userA).select("connections"),
        User.findById(userB).select("connections"),
    ]);

    if (!a || !b) return false;

    const aKnowsB = (a.connections || []).some(
        (id) => String(id) === String(userB)
    );

    const bKnowsA = (b.connections || []).some(
        (id) => String(id) === String(userA)
    );

    return aKnowsB && bKnowsA;
};

// Participant authorization for every
// conversation-scoped request.
const getConversationIfParticipant = async (
    conversationId,
    userId
) => {
    if (!isValidObjectId(conversationId)) return null;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
    });

    return conversation;
};

// Shape a conversation for the authenticated user:
// partner info + last message. No email, no
// password, no reset tokens.
const shapeConversation = (conversation, userId) => {
    const participants = conversation.participants.map((p) =>
        typeof p === "object" && p !== null ? p : { _id: p }
    );

    const partnerDoc =
        participants.find(
            (p) => String(p._id) !== String(userId)
        ) || {};

    return {
        conversationId: String(conversation._id),
        partner: {
            id: String(partnerDoc._id || ""),
            name: partnerDoc.name || "Student",
            profileImage: partnerDoc.profileImage || "",
            role: partnerDoc.role || "student",
        },
        lastMessage: conversation.lastMessage || "",
        lastMessageAt: conversation.lastMessageAt || null,
    };
};

// ==========================================
// GET MY CONVERSATIONS
// GET /api/conversations
// ==========================================

const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate(
                "participants",
                "name profileImage role"
            )
            .sort({ lastMessageAt: -1, createdAt: -1 });

        // Only conversations of the authenticated
        // user are ever returned.
        const shaped = conversations.map((c) =>
            shapeConversation(c, userId)
        );

        return res.status(200).json({
            success: true,
            count: shaped.length,
            conversations: shaped,
        });
    } catch (error) {
        console.error("Get Conversations Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load conversations",
        });
    }
};

// ==========================================
// CREATE OR GET CONVERSATION
// POST /api/conversations/:partnerUserId
// ==========================================

const createOrGetConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { partnerUserId } = req.params;

        // Valid target?
        if (!isValidObjectId(partnerUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid partner id",
            });
        }

        // Never allow self conversation
        if (String(userId) === String(partnerUserId)) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot start a conversation with yourself",
            });
        }

        // Partner must exist (and we need connection data)
        const partner = await User.findById(
            partnerUserId
        ).select("name profileImage role connections");

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "Partner not found",
            });
        }

        // Both users must be connected in BOTH User documents
        const connected = await areConnected(
            userId,
            partnerUserId
        );

        if (!connected) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only message connected study partners",
            });
        }

        // Existing conversation? Return it unchanged.
        let conversation = await findConversationBetween(
            userId,
            partnerUserId
        ).populate("participants", "name profileImage role");

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, partnerUserId],
                lastMessage: "",
                lastMessageAt: null,
            });

            conversation = await Conversation.findById(
                conversation._id
            ).populate(
                "participants",
                "name profileImage role"
            );
        }

        return res.status(200).json({
            success: true,
            conversation: shapeConversation(
                conversation,
                userId
            ),
        });
    } catch (error) {
        console.error("Create Conversation Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to open conversation",
        });
    }
};


// ==========================================
// GET DM HISTORY
// GET /api/conversations/:conversationId/messages
// ==========================================

const getDirectMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        const conversation =
            await getConversationIfParticipant(
                conversationId,
                userId
            );

        // 404 (not 403) avoids leaking existence
        // of other users' conversations.
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        const messages = await DirectMessage.find({
            conversationId: conversation._id,
        })
            .populate("sender", "name profileImage")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: messages.length,
            messages,
        });
    } catch (error) {
        console.error("Get Direct Messages Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load messages",
        });
    }
};

// ==========================================
// SEND DM (REST path)
// POST /api/conversations/:conversationId/messages
// ==========================================

const sendDirectMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        const conversation =
            await getConversationIfParticipant(
                conversationId,
                userId
            );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        // Sender is ALWAYS the authenticated user.
        // senderId from the body is ignored entirely.
        const trimmed =
            typeof req.body?.message === "string"
                ? req.body.message.trim()
                : "";

        if (!trimmed && !req.body?.fileUrl) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty",
            });
        }

        const newMessage = await DirectMessage.create({
            conversationId: conversation._id,
            sender: userId,
            message: trimmed,
            fileUrl: req.body?.fileUrl || "",
            fileName: req.body?.fileName || "",
            fileType: req.body?.fileType || "",
        });

        const populatedMessage = await DirectMessage.findById(
            newMessage._id
        ).populate("sender", "name profileImage");

        conversation.lastMessage = trimmed;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        // Real-time delivery via the isolated DM socket map
        emitToUsers(
            conversation.participants.map((p) => String(p)),
            "receiveDirectMessage",
            populatedMessage
        );

        // Real event -> notify the other participant(s) only.
        // The sender is NEVER notified about their own message.
        const recipientIds = conversation.participants
            .map((p) => String(p))
            .filter((p) => p !== String(userId));

        if (recipientIds.length > 0) {
            const sender = await User.findById(userId).select("name");

            await Promise.all(
                recipientIds.map((recipientId) =>
                    createNotification({
                        user: recipientId,
                        type: "message",
                        title: "New Message",
                        message: `${sender?.name || "A student"} sent you a new message.`,
                        relatedId: String(conversation._id),
                        relatedType: "conversation",
                        eventKey: `dm:${newMessage._id}:${recipientId}`,
                    })
                )
            );
        }

        return res.status(201).json({
            success: true,
            message: populatedMessage,
        });
    } catch (error) {
        console.error("Send Direct Message Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send message",
        });
    }
};

module.exports = {
    getConversations,
    createOrGetConversation,
    getDirectMessages,
    sendDirectMessage,
};

