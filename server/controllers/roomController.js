const Room = require("../models/Room");

// ==========================================
// CREATE STUDY ROOM
// ==========================================

const createRoom = async (req, res) => {
    try {
        const { name, subject, description = "" } = req.body;

        if (!name?.trim() || !subject?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Room name and subject are required",
            });
        }

        const userId = req.user.id;

        const existingRoom = await Room.findOne({
            name: name.trim(),
            subject: subject.trim(),
            createdBy: userId,
        });

        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: "You already created this room",
            });
        }

        const roomId = `study-room-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 7)}`;

        const room = await Room.create({
            roomId,
            name: name.trim(),
            subject: subject.trim(),
            description: description.trim(),
            createdBy: userId,
            members: [userId],
            pendingRequests: [],
        });

        const populatedRoom = await Room.findById(room._id)
            .populate("createdBy", "name email")
            .populate("members", "name email")
            .populate("pendingRequests", "name email");

        return res.status(201).json({
            success: true,
            message: "Study room created successfully",
            room: populatedRoom,
        });
    } catch (error) {
        console.error("Create Room Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create study room",
        });
    }
};

// ==========================================
// GET ALL ROOMS
// ==========================================

const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find()
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email")
            .populate("members", "name email")
            .populate("pendingRequests", "name email");

        return res.status(200).json({
            success: true,
            count: rooms.length,
            rooms,
        });
    } catch (error) {
        console.error("Get Rooms Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load study rooms",
        });
    }
};

// ==========================================
// REQUEST TO JOIN ROOM
// ==========================================

const requestToJoinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Study room not found",
            });
        }

        // Creator cannot request to join own room
        if (room.createdBy.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are the creator of this room",
            });
        }

        // Already a member
        const alreadyMember = room.members.some(
            (member) => member.toString() === userId.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: "You are already a member of this room",
            });
        }

        // Already requested
        const alreadyRequested = room.pendingRequests.some(
            (request) => request.toString() === userId.toString()
        );

        if (alreadyRequested) {
            return res.status(400).json({
                success: false,
                message: "Join request already sent",
            });
        }

        room.pendingRequests.push(userId);

        await room.save();

        return res.status(200).json({
            success: true,
            message: "Join request sent successfully",
        });
    } catch (error) {
        console.error("Join Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send join request",
        });
    }
};

// ==========================================
// GET JOIN REQUESTS
// ==========================================

const getJoinRequests = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findOne({
            roomId,
            createdBy: req.user.id,
        }).populate("pendingRequests", "name email");

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found or you are not the creator",
            });
        }

        return res.status(200).json({
            success: true,
            requests: room.pendingRequests,
        });
    } catch (error) {
        console.error("Get Join Requests Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load join requests",
        });
    }
};

// ==========================================
// ACCEPT JOIN REQUEST
// ==========================================

const acceptJoinRequest = async (req, res) => {
    try {
        const { roomId, userId } = req.params;

        const room = await Room.findOne({
            roomId,
            createdBy: req.user.id,
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found or you are not the creator",
            });
        }

        const requestIndex = room.pendingRequests.findIndex(
            (request) => request.toString() === userId.toString()
        );

        if (requestIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Join request not found",
            });
        }

        room.pendingRequests.splice(requestIndex, 1);

        const alreadyMember = room.members.some(
            (member) => member.toString() === userId.toString()
        );

        if (!alreadyMember) {
            room.members.push(userId);
        }

        await room.save();

        const updatedRoom = await Room.findById(room._id)
            .populate("createdBy", "name email")
            .populate("members", "name email")
            .populate("pendingRequests", "name email");

        return res.status(200).json({
            success: true,
            message: "Join request accepted",
            room: updatedRoom,
        });
    } catch (error) {
        console.error("Accept Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to accept join request",
        });
    }
};

// ==========================================
// REJECT JOIN REQUEST
// ==========================================

const rejectJoinRequest = async (req, res) => {
    try {
        const { roomId, userId } = req.params;

        const room = await Room.findOne({
            roomId,
            createdBy: req.user.id,
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found or you are not the creator",
            });
        }

        const requestIndex = room.pendingRequests.findIndex(
            (request) => request.toString() === userId.toString()
        );

        if (requestIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Join request not found",
            });
        }

        room.pendingRequests.splice(requestIndex, 1);

        await room.save();

        return res.status(200).json({
            success: true,
            message: "Join request rejected",
        });
    } catch (error) {
        console.error("Reject Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reject join request",
        });
    }
};

// ==========================================
// DELETE ROOM
// ==========================================

const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findOne({
            roomId,
            createdBy: req.user.id,
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found or you are not the creator",
            });
        }

        await Room.deleteOne({
            _id: room._id,
        });

        return res.status(200).json({
            success: true,
            message: "Study room deleted successfully",
        });
    } catch (error) {
        console.error("Delete Room Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete study room",
        });
    }
};

module.exports = {
    createRoom,
    getRooms,
    requestToJoinRoom,
    getJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest,
    deleteRoom,
};