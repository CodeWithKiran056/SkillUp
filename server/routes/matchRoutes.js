const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    findMatches
} = require("../controllers/matchController");


// Find Skill Matches
// GET /api/match

router.get(
    "/",
    authMiddleware,
    findMatches
);


module.exports = router;