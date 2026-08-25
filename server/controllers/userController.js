const User = require("../models/User");
const cloudinary = require("../config/cloudinary");


// Get User Profile

const getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .select("-password");


        if (!user) {

            return res.status(404).json({
                success:false,
                message:"User not found"
            });

        }


        res.status(200).json({

            success:true,
            user

        });


    } catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};




// Update User Profile

const updateProfile = async (req,res)=>{


    try{


        const {
            name,
            profileImage,
            skills,
            interests,
            learningRequirements
        } = req.body;


        // Arrays of strings only (both fields stay optional)

        const isStringArray = (value) =>
            Array.isArray(value) &&
            value.every(item => typeof item === "string");


        const updateData = {
            name,
            profileImage,
            skills
        };

        if (interests !== undefined) {

            if (!isStringArray(interests)) {

                return res.status(400).json({

                    success: false,

                    message: "interests must be an array of strings"

                });

            }

            updateData.interests = interests;

        }

        if (learningRequirements !== undefined) {

            if (!isStringArray(learningRequirements)) {

                return res.status(400).json({

                    success: false,

                    message: "learningRequirements must be an array of strings"

                });

            }

            updateData.learningRequirements = learningRequirements;

        }


        const user = await User.findByIdAndUpdate(

            req.user.id,

            updateData,

            {
                new:true,
                runValidators:true
            }

        )
        .select("-password");



        res.status(200).json({

            success:true,

            message:"Profile updated successfully",

            user

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};



// -------------------------------------------------------
// CONNECTIONS
// -------------------------------------------------------

// Send Connection Request
// POST /api/users/connect/:userId
// Private

const sendConnectionRequest = async (req, res) => {

    try {

        const senderId = req.user.id;
        const receiverId = req.params.userId;

        // Reject self-request
        if (String(senderId) === String(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a connection request to yourself"
            });
        }

        // Find receiver
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Already connected?
        if (receiver.connections.some(id => String(id) === String(senderId))) {
            return res.status(400).json({
                success: false,
                message: "You are already connected with this user"
            });
        }

        // Request already pending?
        if (receiver.connectionRequests.some(id => String(id) === String(senderId))) {
            return res.status(400).json({
                success: false,
                message: "Connection request already sent"
            });
        }

        // Add sender to receiver's pending requests
        await User.findByIdAndUpdate(receiverId, {
            $addToSet: { connectionRequests: senderId }
        });

        res.status(200).json({
            success: true,
            message: "Connection request sent"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};


// Get Incoming Connection Requests
// GET /api/users/connections/requests
// Private

const getConnectionRequests = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .populate("connectionRequests", "id name profileImage role skills")
            .select("connectionRequests");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            requests: user.connectionRequests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};


// Accept Connection Request
// POST /api/users/connections/:userId/accept
// Private

const acceptConnectionRequest = async (req, res) => {

    try {

        const receiverId = req.user.id;
        const requesterId = req.params.userId;

        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Requester must be in connectionRequests
        const hasPendingRequest = receiver.connectionRequests.some(
            id => String(id) === String(requesterId)
        );

        if (!hasPendingRequest) {
            return res.status(400).json({
                success: false,
                message: "No pending connection request from this user"
            });
        }

        // Remove from pending and add to connections on both sides
        await User.findByIdAndUpdate(receiverId, {
            $pull:     { connectionRequests: requesterId },
            $addToSet: { connections: requesterId }
        });

        await User.findByIdAndUpdate(requesterId, {
            $addToSet: { connections: receiverId }
        });

        res.status(200).json({
            success: true,
            message: "Connection request accepted"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};


// Reject Connection Request
// POST /api/users/connections/:userId/reject
// Private

const rejectConnectionRequest = async (req, res) => {

    try {

        const receiverId = req.user.id;
        const requesterId = req.params.userId;

        await User.findByIdAndUpdate(receiverId, {
            $pull: { connectionRequests: requesterId }
        });

        res.status(200).json({
            success: true,
            message: "Connection request rejected"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};


// Update Profile Photo
// POST /api/users/profile-image
// Private - reuses existing Cloudinary infrastructure

const updateProfileImage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Please select an image"
            });

        }

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(req.file.mimetype)) {

            return res.status(400).json({
                success: false,
                message: "Only JPG, PNG or WEBP images are allowed"
            });

        }

        const result = await cloudinary.uploader.upload(

            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,

            {
                resource_type: "image",
                folder: "skillup_avatars"
            }

        );

        // Identity comes ONLY from the JWT.
        // Backend stores the real hosted URL on the User document,
        // so Find Partner and refreshes see the same image.
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profileImage: result.secure_url },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        res.status(200).json({
            success: true,
            message: "Profile photo updated",
            profileImage: user.profileImage,
            user
        });

    } catch (error) {

        console.error("Profile Image Upload Error");

        res.status(500).json({
            success: false,
            message: "Unable to upload profile photo"
        });

    }

};


module.exports = {

    getProfile,
    updateProfile,
    updateProfileImage,
    sendConnectionRequest,
    getConnectionRequests,
    acceptConnectionRequest,
    rejectConnectionRequest

};