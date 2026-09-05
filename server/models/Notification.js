const mongoose = require("mongoose");

// ==========================================
// NOTIFICATION
// - Ownership is ALWAYS tied to the owning
//   user (the `user` field). Read/update
//   operations only ever scope by the
//   authenticated JWT user id.
// - `eventKey` is a deterministic dedupe key
//   (e.g. "connection_request:receiver:sender")
//   so the same real event can never produce
//   duplicate notifications for one user.
// ==========================================

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            required: true,
            // Logical types used by the UI for the icon
            enum: [
                "connection_request",
                "connection_accepted",
                "message",
                "study_room_join_request",
                "study_room_join_accepted",
                "study_room_join_rejected",
                "study_room_member_joined",
                "study_room_deleted",
                "study_session",
                "account",
                "system",
            ],
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            default: "",
            trim: true,
        },

        read: {
            type: Boolean,
            default: false,
            index: true,
        },

        // Optional reference to the related entity
        // (a roomId string, a user ObjectId, a
        // message ObjectId, ...). Used only for
        // routing on click; type varies by event.
        relatedId: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        relatedType: {
            type: String,
            default: "",
        },

        // Deterministic dedupe key for the same event.
        eventKey: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// One unique, sparse index per (user, eventKey):
// - sparse lets docs without an eventKey coexist freely;
// - unique guarantees a duplicate event for one user can
//   never be inserted twice, even under concurrency.
notificationSchema.index(
    { user: 1, eventKey: 1 },
    { unique: true, sparse: true }
);

module.exports = mongoose.model("Notification", notificationSchema);