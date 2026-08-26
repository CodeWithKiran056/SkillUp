const { Readable } = require("stream");

const cloudinary = require("../config/cloudinary");
const Room = require("../models/Room");
const SessionRecording = require("../models/SessionRecording");

// ==========================================
// AUTHORIZATION HELPERS
// ==========================================

// A user may upload/read recordings for a room if they are
// the creator OR a confirmed member. Derives identity ONLY
// from the authenticated JWT (req.user.id), never the client.
const getAuthorizedRoom = async (roomId, userId) => {
    if (!roomId || typeof roomId !== "string") {
        return null;
    }

    const room = await Room.findOne({ roomId });

    if (!room) {
        return null;
    }

    const createdBy =
        room.createdBy?.toString?.() || String(room.createdBy);
    const isCreator = createdBy === String(userId);
    const isMember = (room.members || []).some(
        (member) =>
            (member?.toString?.() || String(member)) ===
            String(userId)
    );

    if (!isCreator && !isMember) {
        return { room, forbidden: true };
    }

    return { room, forbidden: false };
};

const shapeRecording = (recording) => ({
    _id: recording._id,
    roomId: recording.roomId,
    recordingUrl: recording.recordingUrl,
    cloudinaryPublicId: recording.cloudinaryPublicId,
    fileName: recording.fileName,
    mimeType: recording.mimeType,
    duration: recording.duration,
    sizeBytes: recording.sizeBytes,
    createdAt: recording.createdAt,
});

// Browser MediaRecorder MIME strings may carry codec parameters after
// the semicolon (e.g. "video/webm;codecs=vp9,opus"). Strip the
// parameters so the format is validated by its container type only.
const getBaseMimeType = (mimeType) =>
    String(mimeType || "")
        .split(";")[0]
        .trim()
        .toLowerCase();

// Strict allow-list of recording containers this feature supports.
const ALLOWED_RECORDING_MIME_TYPES = [
    "video/webm",
    "video/mp4",
    "video/ogg",
];

// The multipart parser (busboy via multer) rewrites a part whose
// Content-Type carries parameters (e.g. "video/webm;codecs=vp9,opus")
// to "text/plain", so the header alone is not a reliable signal.
// Sniff the actual container from the first bytes of the file instead.
const sniffContainerMimeType = (buffer) => {
    if (!buffer || buffer.length < 12) {
        return null;
    }

    // WebM / Matroska: EBML magic "1A 45 DF A3"
    if (
        buffer[0] === 0x1a &&
        buffer[1] === 0x45 &&
        buffer[2] === 0xdf &&
        buffer[3] === 0xa3
    ) {
        return "video/webm";
    }

    // MP4 / ISO BMFF: "ftyp" box at offset 4
    if (buffer.slice(4, 8).toString("latin1") === "ftyp") {
        return "video/mp4";
    }

    // Ogg: "OggS" magic
    if (
        buffer[0] === 0x4f &&
        buffer[1] === 0x67 &&
        buffer[2] === 0x67 &&
        buffer[3] === 0x53
    ) {
        return "video/ogg";
    }

    return null;
};

// ==========================================
// UPLOAD RECORDING
// POST /api/recordings
// ==========================================

const uploadRecording = async (req, res) => {
    try {
        const { roomId } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please attach a recording file",
            });
        }

        // The reported MIME header is unreliable: browser codec params
        // (e.g. "video/webm;codecs=vp9,opus") are rewritten to
        // "text/plain" by the multipart parser. Authority comes from
        // sniffing the real container bytes, cross-checked against the
        // reported type whenever the header survived parsing intact.
        const reportedMime = getBaseMimeType(req.file.mimetype);
        const mime = sniffContainerMimeType(req.file.buffer);

        if (
            !mime ||
            !ALLOWED_RECORDING_MIME_TYPES.includes(mime)
        ) {
            return res.status(400).json({
                success: false,
                message: "Unsupported recording format",
            });
        }

        if (
            reportedMime &&
            reportedMime !== "text/plain" &&
            !ALLOWED_RECORDING_MIME_TYPES.includes(reportedMime)
        ) {
            return res.status(400).json({
                success: false,
                message: "Unsupported recording format",
            });
        }

        const authorized = await getAuthorizedRoom(
            roomId,
            req.user.id
        );

        if (!authorized || !authorized.room) {
            return res.status(404).json({
                success: false,
                message: "Study room not found",
            });
        }

        if (authorized.forbidden) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have access to this study room",
            });
        }

        // Stream the buffer to Cloudinary as a video resource. The
        // explicit format (webm/mp4/ogg) keeps the stored asset
        // compatible with the actual uploaded container.
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "video",
                    folder: "skillup_recordings",
                    format: mime.split("/")[1],
                },
                (error, result) =>
                    error ? reject(error) : resolve(result)
            );

            Readable.from([req.file.buffer]).pipe(uploadStream);
        });

        const duration = Number.isFinite(Number(result.duration))
            ? Number(result.duration)
            : Number(req.body.duration) > 0
              ? Number(req.body.duration)
              : null;

        const recording = await SessionRecording.create({
            user: req.user.id,
            roomId: roomId.trim(),
            recordingUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            fileName: result.original_filename || req.file.originalname || "",
            mimeType: mime || "video/webm",
            duration,
            sizeBytes: req.file.size || 0,
        });

        // Public-safe payload only (URL + public_id, no secrets).
        return res.status(201).json({
            success: true,
            message: "Recording saved",
            recording: shapeRecording(recording),
        });
    } catch (error) {
        console.error("Upload Recording Error:", error);

        return res.status(500).json({
            success: false,
            message: "Recording could not be saved",
        });
    }
};

// ==========================================
// GET RECORDINGS BY ROOM
// GET /api/recordings/:roomId
// ==========================================

const getRecordingsByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const authorized = await getAuthorizedRoom(
            roomId,
            req.user.id
        );

        if (!authorized || !authorized.room) {
            return res.status(404).json({
                success: false,
                message: "Study room not found",
            });
        }

        if (authorized.forbidden) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have access to this study room",
            });
        }

        const recordings = await SessionRecording.find({
            roomId: roomId.trim(),
        })
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json({
            success: true,
            count: recordings.length,
            recordings: recordings.map(shapeRecording),
        });
    } catch (error) {
        console.error("Get Recordings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load recordings",
        });
    }
};

module.exports = {
    uploadRecording,
    getRecordingsByRoom,
};