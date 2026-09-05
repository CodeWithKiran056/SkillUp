const Notification = require("../models/Notification");
const { emitToUser } = require("../socket/notificationSocket");

// ==========================================
// NOTIFICATION SERVICE
// - Single place that persists a notification
//   AND pushes it over Socket.IO to the
//   intended user only.
// - `eventKey` is the dedupe key: controllers
//   pass a deterministic value so re-firing the
//   same real event can never create duplicates
//   (a unique (user, eventKey) index also hard-
//   guarantees this at the database level).
// ==========================================

/* Shape a notification document for the client. */
const shapeNotification = (notification) => ({
    _id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message || "",
    read: Boolean(notification.read),
    relatedId: notification.relatedId ?? null,
    relatedType: notification.relatedType || "",
    createdAt: notification.createdAt,
});

/* Push the fresh unread count to the user's sockets. */
const emitUnreadCount = async (userId) => {
    try {
        const unreadCount = await Notification.countDocuments({
            user: userId,
            read: false,
        });

        emitToUser(userId, "notification:unread", {
            unreadCount,
        });

        return unreadCount;
    } catch (error) {
        console.error("Emit unread count error:", error.message);
        return null;
    }
};

/**
 * Create a notification for `user` and emit it to that
 * user's sockets only.
 *
 * Returns the created (or existing) notification and the
 * boolean `created` so callers can react to duplicates.
 */
const createNotification = async ({
    user,
    type,
    title,
    message = "",
    relatedId = null,
    relatedType = "",
    eventKey = "",
}) => {
    if (!user) return { notification: null, created: false };

    let created = true;
    let notification;

    try {
        notification = await Notification.create({
            user,
            type,
            title,
            message,
            read: false,
            relatedId:
                relatedId === undefined ? null : relatedId,
            relatedType: relatedType || "",
            eventKey: eventKey || "",
        });
    } catch (error) {
        // 11000 = duplicate (user, eventKey): the same real
        // event already created a notification for this user.
        // That is the intended dedupe behavior, not an error.
        if (error && error.code === 11000) {
            created = false;
            notification = await Notification.findOne({
                user,
                eventKey,
            });
        } else {
            console.error("Create notification error:", error.message);
            return { notification: null, created: false };
        }
    }

    if (created && notification) {
        const unreadCount = await emitUnreadCount(user);

        emitToUser(user, "notification:new", {
            notification: shapeNotification(notification),
            unreadCount,
        });
    }

    return { notification, created };
};

module.exports = {
    createNotification,
    emitUnreadCount,
    shapeNotification,
};