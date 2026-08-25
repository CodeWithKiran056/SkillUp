const express = require("express");

const router = express.Router();

const multer = require("multer");

const authMiddleware = require("../middleware/authMiddleware");

const {
    getProfile,
    updateProfile,
    updateProfileImage,
    sendConnectionRequest,
    getConnectionRequests,
    acceptConnectionRequest,
    rejectConnectionRequest
} = require("../controllers/userController");


/* Avatar uploads: memory storage, images only, 5MB */
const avatarUpload = multer({

    storage: multer.memoryStorage(),

    limits: { fileSize: 5 * 1024 * 1024 },

    fileFilter: (req, file, cb) => {

        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/webp"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG or WEBP images are allowed"), false);
        }

    },

});



// Get User Profile
// GET /api/users/profile

router.get(
    "/profile",
    authMiddleware,
    getProfile
);



// Update User Profile
// PUT /api/users/profile

router.put(
    "/profile",
    authMiddleware,
    updateProfile
);


// Update Profile Photo (Cloudinary-backed)
// POST /api/users/profile-image

router.post(
    "/profile-image",
    authMiddleware,
    avatarUpload.single("image"),
    updateProfileImage
);


// Send Connection Request
// POST /api/users/connect/:userId

router.post(
    "/connect/:userId",
    authMiddleware,
    sendConnectionRequest
);


// Get Incoming Connection Requests
// GET /api/users/connections/requests

router.get(
    "/connections/requests",
    authMiddleware,
    getConnectionRequests
);


// Accept Connection Request
// POST /api/users/connections/:userId/accept

router.post(
    "/connections/:userId/accept",
    authMiddleware,
    acceptConnectionRequest
);


// Reject Connection Request
// POST /api/users/connections/:userId/reject

router.post(
    "/connections/:userId/reject",
    authMiddleware,
    rejectConnectionRequest
);



module.exports = router;