const express = require("express");

const router = express.Router();


const authMiddleware = require("../middleware/authMiddleware");


const {
    addSkill,
    getSkills,
    getSkillById,
    updateSkill,
    deleteSkill

} = require("../controllers/skillController");



// Add Skill
// POST /api/skills

router.post(
    "/",
    authMiddleware,
    addSkill
);



// Get All Skills
// GET /api/skills

router.get(
    "/",
    authMiddleware,
    getSkills
);



// Get Single Skill
// GET /api/skills/:id

router.get(
    "/:id",
    authMiddleware,
    getSkillById
);



// Update Skill
// PUT /api/skills/:id

router.put(
    "/:id",
    authMiddleware,
    updateSkill
);



// Delete Skill
// DELETE /api/skills/:id

router.delete(
    "/:id",
    authMiddleware,
    deleteSkill
);



module.exports = router;