const express = require("express");

const router = express.Router();


const authMiddleware = require("../middleware/authMiddleware");


const {
    getMessages
} = require("../controllers/chatController");



// Get room messages

router.get(

    "/:roomId",

    authMiddleware,

    getMessages

);



module.exports = router;