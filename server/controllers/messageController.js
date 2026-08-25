const Message = require("../models/Message");
const Room = require("../models/Room");


// ==========================================
// GET ROOM MESSAGES
// ==========================================

const getMessages = async (req, res) => {

    try {

        const { roomId } = req.params;

        const userId = req.user.id;


        // Find study room

        const room = await Room.findOne({
            roomId
        });


        if (!room) {

            return res.status(404).json({
                success: false,
                message: "Study room not found"
            });

        }


        // Check creator

        const isCreator =
            room.createdBy.toString() ===
            userId.toString();


        // Check member

        const isMember =
            room.members.some(
                (member) =>
                    member.toString() ===
                    userId.toString()
            );


        // Only creator or member
        // can access chat

        if (!isCreator && !isMember) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not a member of this study room"
            });

        }


        // Get messages

        const messages =
            await Message.find({
                roomId
            })
            .populate(
                "sender",
                "name email"
            )
            .sort({
                createdAt: 1
            });


        return res.status(200).json({

            success: true,

            count:
                messages.length,

            messages

        });

    } catch (error) {

        console.error(
            "Get Messages Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load messages"

        });

    }

};


module.exports = {
    getMessages
};