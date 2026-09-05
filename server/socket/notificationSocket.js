const jwt = require("jsonwebtoken");

// ==========================================
// NOTIFICATION SOCKET
// - Mirrors the existing dmSocket pattern:
//   the client registers with a JWT on the
//   SAME socket connection; identity is derived
//   from the token and NEVER from later event
//   payloads.
// - userId -> Set<socketId> so multiple
//   tabs/devices of one user all receive their
//   OWN notifications only.
// - Nothing is ever broadcast to all users.
// ==========================================

// userId -> Set of socketIds
const notificationSockets = new Map();

/* Deliver an event to every registered socket of
   ONE user. Private-by-construction: only sockets
   that authenticated as that exact user receive it. */
const emitToUser = (userId, event, payload) => {
    const sockets = notificationSockets.get(String(userId));

    if (!sockets) return 0;

    let deliveredCount = 0;

    sockets.forEach((socketId) => {
        const target =
            global.__notificationIO?.sockets?.sockets?.get(
                socketId
            );

        if (target) {
            target.emit(event, payload);
            deliveredCount += 1;
        }
    });

    return deliveredCount;
};

const removeSocket = (userId, socketId) => {
    const sockets = notificationSockets.get(String(userId));

    if (!sockets) return;

    sockets.delete(socketId);

    if (sockets.size === 0) {
        notificationSockets.delete(String(userId));
    }
};

const notificationSocket = (io) => {
    // Kept for emitToUser delivery.
    global.__notificationIO = io;

    io.on("connection", (socket) => {
        let authenticatedUserId = null;

        // ==============================
        // AUTHENTICATE (isolated)
        // Client sends its JWT; identity is
        // derived from it and never from any
        // later event payloads.
        // ==============================

        socket.on("registerNotificationUser", ({ token } = {}) => {
            try {
                if (!token) return;

                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                authenticatedUserId = String(decoded.id);

                if (!notificationSockets.has(authenticatedUserId)) {
                    notificationSockets.set(
                        authenticatedUserId,
                        new Set()
                    );
                }

                notificationSockets
                    .get(authenticatedUserId)
                    .add(socket.id);

                // Acknowledge so the client knows real-time
                // notification delivery is armed.
                socket.emit("notificationRegistered", {
                    ok: true,
                    userId: authenticatedUserId,
                });
            } catch {
                // Invalid/expired token: ignore silently.
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

module.exports = { notificationSocket, emitToUser };