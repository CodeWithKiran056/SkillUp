const multer = require("multer");

// Reasonable cap for a single recorded study session.
// Kept explicit so unlimited uploads are never silently allowed.
const RECORDING_MAX_BYTES = 200 * 1024 * 1024; // 200 MB

// Multer stores the recording in memory so it can be
// streamed straight to Cloudinary (no permanent temp files).
const recordingUpload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: RECORDING_MAX_BYTES,
    },

    fileFilter: (req, file, cb) => {
        // Browser uploads may include codec parameters after the
        // semicolon (e.g. "video/webm;codecs=vp9,opus"). Normalize to
        // the base container type before checking, but still keep the
        // allow-list enforcement in the controller for the final gate.
        const mime = String(file.mimetype || "")
            .split(";")[0]
            .trim()
            .toLowerCase();
        const name = (file.originalname || "").toLowerCase();
        const videoLike =
            mime.startsWith("video/") ||
            name.endsWith(".webm") ||
            name.endsWith(".mp4") ||
            name.endsWith(".ogg");

        if (videoLike) {
            return cb(null, true);
        }

        cb(
            new Error(
                "Unsupported recording format. Only video files are allowed."
            ),
            false
        );
    },
});

module.exports = recordingUpload;