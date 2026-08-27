const userSockets = new Map();

const videoSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(
            "Video socket connected:",
            socket.id
        );

        // Register logged-in user
        socket.on("registerUser", (userId) => {
            if (!userId) return;

            userSockets.set(
                userId.toString(),
                socket.id
            );

            console.log(
                `User ${userId} registered with socket ${socket.id}`
            );
        });

        // Join Video Study Room
        socket.on("joinVideoRoom", (roomId) => {
            const room = io.sockets.adapter.rooms.get(roomId);

            const existingUsers = room
                ? Array.from(room)
                : [];

            socket.emit(
                "existingUsers",
                existingUsers
            );

            socket.join(roomId);

            socket.to(roomId).emit(
                "userJoined",
                socket.id
            );

            console.log(
                `User ${socket.id} joined video room ${roomId}`
            );
        });

        // Real-time Join Request Notification
        socket.on(
            "joinRequestSent",
            ({
                roomId,
                creatorId,
                requester
            }) => {
                if (!creatorId) return;

                const creatorSocketId =
                    userSockets.get(
                        creatorId.toString()
                    );

                if (!creatorSocketId) {
                    console.log(
                        "Creator is not currently connected"
                    );
                    return;
                }

                io.to(creatorSocketId).emit(
                    "newJoinRequest",
                    {
                        roomId,
                        requester
                    }
                );

                console.log(
                    `Join request sent to creator ${creatorId}`
                );
            }
        );

        // WebRTC Offer
        socket.on(
            "offer",
            ({ target, offer }) => {
                io.to(target).emit(
                    "offer",
                    {
                        sender: socket.id,
                        offer
                    }
                );
            }
        );

        // WebRTC Answer
        socket.on(
            "answer",
            ({ target, answer }) => {
                io.to(target).emit(
                    "answer",
                    {
                        sender: socket.id,
                        answer
                    }
                );
            }
        );

        // ICE Candidate
        socket.on(
            "iceCandidate",
            ({ target, candidate }) => {
                io.to(target).emit(
                    "iceCandidate",
                    {
                        sender: socket.id,
                        candidate
                    }
                );
            }
        );

        // Media state (camera / microphone toggles) relay
        socket.on(
            "mediaState",
            ({ target, cameraEnabled, micEnabled }) => {
                if (!target) return;

                io.to(target).emit(
                    "mediaState",
                    {
                        sender: socket.id,
                        cameraEnabled: Boolean(cameraEnabled),
                        micEnabled: Boolean(micEnabled),
                    }
                );
            }
        );

        // Leave Video Room
        socket.on(
            "leaveVideoRoom",
            (roomId) => {
                socket.to(roomId).emit(
                    "userLeft",
                    socket.id
                );

                socket.leave(roomId);

                console.log(
                    `User ${socket.id} left video room ${roomId}`
                );
            }
        );

        // Notify video-room peers when a socket leaves WITHOUT an explicit
        // leaveVideoRoom event (tab close, refresh, or network drop) so the
        // other side releases the peer connection promptly.
        socket.on("disconnecting", () => {
            for (const roomId of socket.rooms) {
                if (roomId === socket.id) continue;

                socket.to(roomId).emit("userLeft", socket.id);
            }
        });

        // Disconnect
        socket.on(
            "disconnect",
            () => {
                for (
                    const [userId, socketId]
                    of userSockets.entries()
                ) {
                    if (
                        socketId === socket.id
                    ) {
                        userSockets.delete(userId);

                        console.log(
                            `User ${userId} disconnected`
                        );

                        break;
                    }
                }

                console.log(
                    "Video socket disconnected:",
                    socket.id
                );
            }
        );
    });
};

module.exports = videoSocket;