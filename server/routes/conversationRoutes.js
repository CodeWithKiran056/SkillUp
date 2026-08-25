const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getConversations,
    createOrGetConversation,
    getDirectMessages,
    sendDirectMessage,
} = require("../controllers/conversationController");

// All conversation routes are private (JWT)
router.use(authMiddleware);

// My conversations
// GET /api/conversations
router.get("/", getConversations);

// Create or get a conversation with a connected partner
// POST /api/conversations/:partnerUserId
router.post("/:partnerUserId", createOrGetConversation);

// DM history
// GET /api/conversations/:conversationId/messages
router.get(
    "/:conversationId/messages",
    getDirectMessages
);

// Send DM (REST path; sender = JWT user)
// POST /api/conversations/:conversationId/messages
router.post(
    "/:conversationId/messages",
    sendDirectMessage
);

module.exports = router;
