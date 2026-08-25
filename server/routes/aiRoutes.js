const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
chatWithAI
}=require("../controllers/aiController");


// AI endpoints are private (JWT) - protects NVIDIA/Pinecone resources
router.post(
"/chat",
authMiddleware,
upload.single("file"),
chatWithAI
);


module.exports = router;