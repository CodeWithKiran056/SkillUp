const mongoose = require("mongoose");

const sessionRecordingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        roomId: {
            type: String,
            required: true,
            index: true,
        },

        recordingUrl: {
            type: String,
            required: true,
        },

        cloudinaryPublicId: {
            type: String,
            required: true,
        },

        fileName: {
            type: String,
            default: "",
        },

        mimeType: {
            type: String,
            default: "video/webm",
        },

        // Duration in seconds (from Cloudinary when available)
        duration: {
            type: Number,
            default: null,
        },

        sizeBytes: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "SessionRecording",
    sessionRecordingSchema
);