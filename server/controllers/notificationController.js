const mongoose = require("mongoose");

const Notification = require("../models/Notification");
const {
    emitUnreadCount,
    shapeNotification,
} = require("../services/notificationService");

// ==========================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// ==========================================

const getNotifications = async (req, res) => {
    try {
        // Identity comes ONLY from the verified JWT.
        const notifications = await Notification.find({
            user: req.user.id,
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return res.status(200).json({
            success: true,
            count: notifications.length,
            notifications: notifications.map(shapeNotification),
        });
    } catch (error) {
        console.error("Get Notifications Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load notifications",
        });
    }
};

// ==========================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// ==========================================

const getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            user: req.user.id,
            read: false,
        });

        return res.status(200).json({
            success: true,
            unreadCount,
        });
    } catch (error) {
        console.error("Get Unread Count Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load unread count",
        });
    }
};

// ==========================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// ==========================================

const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !id ||
            typeof id !== "string" ||
            !mongoose.Types.ObjectId.isValid(id.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid notification ID is required",
            });
        }

        // Load AND enforce ownership in a single query.
        const notification = await Notification.findOne({
            _id: id.trim(),
            user: req.user.id,
        });

        if (!notification) {
            // Not found OR belongs to another user.
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        // Already read -> idempotent no-op (no extra write).
        if (notification.read) {
            return res.status(200).json({
                success: true,
                alreadyRead: true,
                notification: shapeNotification(notification),
            });
        }

        notification.read = true;
        await notification.save();

        // Push the decremented unread count to this user only.
        await emitUnreadCount(req.user.id);

        return res.status(200).json({
            success: true,
            notification: shapeNotification(notification),
        });
    } catch (error) {
        console.error("Mark Notification Read Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update notification",
        });
    }
};

// ==========================================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// ==========================================

const markAllRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { user: req.user.id, read: false },
            { $set: { read: true } }
        );

        await emitUnreadCount(req.user.id);

        return res.status(200).json({
            success: true,
            updatedCount: result.modifiedCount || 0,
        });
    } catch (error) {
        console.error("Mark All Read Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update notifications",
        });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllRead,
};