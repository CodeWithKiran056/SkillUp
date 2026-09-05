const Message = require("../models/Message");
const Room = require("../models/Room");
const User = require("../models/User");
const { createNotification } = require("../services/notificationService");

const chatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(
            "Chat socket connected:",
            socket.id
        );

        // ==============================
        // JOIN STUDY ROOM
        // ==============================

        socket.on("joinRoom", (roomId) => {
            if (!roomId) return;

            socket.join(roomId);

            console.log(
                `Socket ${socket.id} joined room ${roomId}`
            );
        });

        // ==============================
        // LEAVE STUDY ROOM
        // ==============================

        socket.on("leaveRoom", (roomId) => {
            if (!roomId) return;

            socket.leave(roomId);

            console.log(
                `Socket ${socket.id} left room ${roomId}`
            );
        });

        // ==============================
        // SEND MESSAGE
        // ==============================

        socket.on(
            "sendMessage",
            async (data) => {
                try {
                    const {
                        roomId,
                        sender,
                        message,
                        fileUrl,
                        fileName,
                        fileType
                    } = data || {};

                    // Validation
                    if (
                        !roomId ||
                        !sender
                    ) {
                        return;
                    }

                    if (
                        !message?.trim() &&
                        !fileUrl
                    ) {
                        return;
                    }

                    // Save message
                    const newMessage =
                        await Message.create({
                            roomId,
                            sender,
                            message:
                                message?.trim() || "",
                            fileUrl:
                                fileUrl || "",
                            fileName:
                                fileName || "",
                            fileType:
                                fileType || "",
                        });

                    // Populate sender
                    const populatedMessage =
                        await Message.findById(
                            newMessage._id
                        ).populate(
                            "sender",
                            "name email"
                        );

                    console.log(
                        "Message saved:",
                        populatedMessage._id
                    );

                    // Send to everyone
                    // inside this study room
                    io.to(roomId).emit(
                        "receiveMessage",
                        populatedMessage
                    );

                    // Real event -> notify the OTHER room members.
                    // The sender is NEVER notified about their own message.
                    try {
                        const room = await Room.findOne({
                            roomId,
                        }).select("name members");

                        if (room) {
                            const recipientIds =
                                (room.members || [])
                                    .map((member) =>
                                        member.toString()
                                    )
                                    .filter(
                                        (memberId) =>
                                            memberId !==
                                            String(sender)
                                    );

                            if (recipientIds.length > 0) {
                                const senderDoc = await User.findById(
                                    sender
                                ).select("name");

                                await Promise.all(
                                    recipientIds.map((recipientId) =>
                                        createNotification({
                                            user: recipientId,
                                            type: "message",
                                            title: "New Message",
                                            message: `${senderDoc?.name || "A student"} sent a message in "${room.name}".`,
                                            relatedId: roomId,
                                            relatedType: "room",
                                            eventKey: `room_message:${newMessage._id}:${recipientId}`,
                                        })
                                    )
                                );
                            }
                        }
                    } catch (notifyError) {
                        console.error(
                            "Chat Notification Error:",
                            notifyError.message
                        );
                    }
                } catch (error) {
                    console.error(
                        "Chat Message Error:",
                        error.message
                    );
                }
            }
        );

        // ==============================
        // DISCONNECT
        // ==============================

        socket.on(
            "disconnect",
            (reason) => {
                console.log(
                    `Chat socket disconnected: ${socket.id}`,
                    reason
                );
            }
        );
    });
};

module.exports = chatSocket;