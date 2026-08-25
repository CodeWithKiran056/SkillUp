const Message = require("../models/Message");

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