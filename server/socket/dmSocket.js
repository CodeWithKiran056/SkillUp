const jwt = require("jsonwebtoken");
const Conversation = require("../models/Conversation");
const DirectMessage = require("../models/DirectMessage");

// ==========================================
// DIRECT MESSAGE SOCKET
// - Fully isolated from chatSocket (rooms)
//   and videoSocket (WebRTC).
// - Identity comes from a JWT verified on
//   the server ("registerDmUser"). The
//   client payload NEVER determines who is
//   sending a message.
// - userId -> Set<socketId> so multiple
//   tabs/devices of one user all receive.
// ==========================================

// userId -> Set of socketIds
const dmSockets = new Map();

/* Deliver an event to every registered socket
   of the given users. Used by both the socket
   send path and the REST send path. */
const emitToUsers = (userIds, event, payload) => {
    let delivered = 0;

    (userIds || []).forEach((userId) => {
        const sockets = dmSockets.get(String(userId));

        if (!sockets) return;

        sockets.forEach((socketId) => {
            const target =
                global.__dmIO?.sockets?.sockets?.get(socketId);

            if (target) {
                target.emit(event, payload);
                delivered += 1;
            }
        });
    });

    return delivered;
};

const removeSocket = (userId, socketId) => {
    const sockets = dmSockets.get(String(userId));
    if (!sockets) return;

    sockets.delete(socketId);
    if (sockets.size === 0) {
        dmSockets.delete(String(userId));
    }
};

const dmSocket = (io) => {
    // Kept for emitToUsers delivery
    global.__dmIO = io;

    io.on("connection", (socket) => {
        let authenticatedUserId = null;

        // ==============================
        // AUTHENTICATE (isolated)
        // Client sends its JWT; identity is
        // derived from it and never from any
        // later event payloads.
        // ==============================

        socket.on("registerDmUser", ({ token } = {}) => {
            try {
                if (!token) return;

                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                authenticatedUserId = String(decoded.id);

                if (!dmSockets.has(authenticatedUserId)) {
                    dmSockets.set(
                        authenticatedUserId,
                        new Set()
                    );
                }

                dmSockets.get(authenticatedUserId).add(socket.id);

                // Acknowledge so the client knows DM
                // real-time delivery is armed.
                socket.emit("dmRegistered", {
                    ok: true,
                    userId: authenticatedUserId,
                });
            } catch {
                // Invalid/expired token: ignore silently.
            }
        });

        // ==============================
        // SEND DIRECT MESSAGE
        // ==============================

        socket.on("sendDirectMessage", async (data) => {
            try {
                // Must have authenticated with a valid JWT
                if (!authenticatedUserId) return;

                const { conversationId, message } = data || {};

                if (!conversationId) return;

                const trimmed =
                    typeof message === "string"
                        ? message.trim()
                        : "";

                if (!trimmed) return;

                // Participant authorization
                const conversation = await Conversation.findById(
                    conversationId
                );

                if (!conversation) return;

                const isParticipant = conversation.participants.some(
                    (p) => String(p._id || p) === authenticatedUserId
                );

                if (!isParticipant) return;

                // Sender is ALWAYS the authenticated user
                const newMessage = await DirectMessage.create({
                    conversationId,
                    sender: authenticatedUserId,
                    message: trimmed,
                });

                const populatedMessage = await DirectMessage.findById(
                    newMessage._id
                ).populate("sender", "name profileImage");

                conversation.lastMessage = trimmed;
                conversation.lastMessageAt = new Date();
                await conversation.save();

                // Real-time delivery to BOTH participants'
                // registered sockets (echo included).
                emitToUsers(
                    conversation.participants.map(
                        (p) => String(p._id || p)
                    ),
                    "receiveDirectMessage",
                    populatedMessage
                );
            } catch (error) {
                console.error(
                    "DM Socket Error:",
                    error.message
                );
            }
        });

        // ==============================
        // DISCONNECT (cleanup)
        // ==============================

        socket.on("disconnect", () => {
            if (authenticatedUserId) {
                removeSocket(authenticatedUserId, socket.id);
            }
        });
    });
};

module.exports = { dmSocket, emitToUsers };
