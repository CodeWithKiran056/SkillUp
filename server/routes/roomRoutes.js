const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createRoom,
    getRooms,
    requestToJoinRoom,
    getJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest,
    deleteRoom,
} = require("../controllers/roomController");

// Create room
router.post(
    "/create",
    authMiddleware,
    createRoom
);

// Get all rooms
router.get(
    "/",
    authMiddleware,
    getRooms
);

// Request to join
router.post(
    "/request/:roomId",
    authMiddleware,
    requestToJoinRoom
);

// Get pending requests
router.get(
    "/requests/:roomId",
    authMiddleware,
    getJoinRequests
);

// Accept request
router.post(
    "/requests/:roomId/accept/:userId",
    authMiddleware,
    acceptJoinRequest
);

// Reject request
router.post(
    "/requests/:roomId/reject/:userId",
    authMiddleware,
    rejectJoinRequest
);

// Delete room
router.delete(
    "/:roomId",
    authMiddleware,
    deleteRoom
);

module.exports = router;