const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllRead,
} = require("../controllers/notificationController");

// All notification routes are private (JWT). Every handler
// scopes by req.user.id — a client-supplied userId is never
// trusted anywhere in this router.
router.use(authMiddleware);

// My notifications (newest first)
// GET /api/notifications
router.get("/", getNotifications);

// Unread count for the notification badge
// GET /api/notifications/unread-count
router.get("/unread-count", getUnreadCount);

// Mark all of my notifications as read
// PATCH /api/notifications/read-all
router.patch("/read-all", markAllRead);

// Mark a single notification as read
// PATCH /api/notifications/:id/read
router.patch("/:id/read", markNotificationRead);

module.exports = router;