const express = require("express");
const cors = require("cors");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

// =========================================
// DATABASE
// =========================================

const connectDB = require("./config/db");

// =========================================
// ROUTES
// =========================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const matchRoutes = require("./routes/matchRoutes");
const fileRoutes = require("./routes/fileRoutes");
const messageRoutes = require("./routes/messageRoutes");
const roomRoutes = require("./routes/roomRoutes");
const aiRoutes = require("./routes/aiRoutes");
const conversationRoutes = require("./routes/conversationRoutes");

// =========================================
// SOCKETS
// =========================================

const chatSocket = require("./socket/chatSocket");
const videoSocket = require("./socket/videoSocket");
const { dmSocket } = require("./socket/dmSocket");

// =========================================
// APP
// =========================================

const app = express();
const server = http.createServer(app);

// =========================================
// SOCKET.IO
// =========================================

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// =========================================
// DATABASE CONNECTION
// =========================================

connectDB();

// =========================================
// MIDDLEWARE
// =========================================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

// =========================================
// API ROUTES
// =========================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/skills", skillRoutes);

app.use("/api/match", matchRoutes);

app.use("/api/files", fileRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/rooms", roomRoutes);

app.use("/api/conversations", conversationRoutes);

app.use("/api/ai", aiRoutes);

// =========================================
// SOCKET CONNECTIONS
// =========================================

chatSocket(io);
videoSocket(io);
dmSocket(io);

// =========================================
// HEALTH CHECK
// =========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SkillUp Backend Running",
    });
});

// =========================================
// ERROR HANDLER
// =========================================

app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
});

// =========================================
// SERVER
// =========================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `SkillUp Backend running on port ${PORT}`
    );
});