const express = require("express");

const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    changePassword
} = require("../controllers/authController");


const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");


// Register API
router.post(
    "/register",
    registerUser
);


// Login API
router.post(
    "/login",
    loginUser
);


// Forgot Password API
router.post(
    "/forgot-password",
    forgotPassword
);


// Reset Password API
router.post(
    "/reset-password/:token",
    resetPassword
);


// Change Password (authenticated)
// POST /api/auth/change-password
router.post(
    "/change-password",
    authMiddleware,
    changePassword
);


module.exports = router;