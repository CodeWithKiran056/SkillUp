const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const recordingUpload = require("../middleware/recordingUpload");

const {
    uploadRecording,
    getRecordingsByRoom,
} = require("../controllers/recordingController");

// Upload a session recording
// POST /api/recordings
// Auth required. Multer errors (too large / bad type)
// are translated to friendly client responses instead of
// falling through as 500s.
router.post(
    "/",
    authMiddleware,
    (req, res, next) => {
        recordingUpload.single("recording")(req, res, (err) => {
            if (err) {
                const tooLarge =
                    err.code === "LIMIT_FILE_SIZE";

                return res
                    .status(tooLarge ? 413 : 400)
                    .json({
                        success: false,
                        message: tooLarge
                            ? "Recording file is too large (max 200 MB)."
                            : "Unsupported recording format. Only video files are allowed.",
                    });
            }

            next();
        });
    },
    uploadRecording
);

// Get recordings for a study room
// GET /api/recordings/:roomId
// Auth required. Room membership is enforced server-side.
router.get(
    "/:roomId",
    authMiddleware,
    getRecordingsByRoom
);

module.exports = router;