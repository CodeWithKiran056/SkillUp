# SkillUp

### A Student Learning & Collaboration Platform

SkillUp is a full-stack web application built to make collaborative learning easier for students.

The idea is simple: students often want to study with people who have similar interests, subjects, schedules, or learning goals, but finding the right study partner is not always easy. SkillUp brings study partner matching, communication, study rooms, AI assistance, and student profiles together in one platform.

---

## 🚀 Overview

SkillUp allows students to create a learning profile, discover other students, connect with them, communicate, and participate in collaborative study sessions.

A student's skills, interests, and learning requirements are used by the matching system to find more relevant study partners.

The platform is designed as a practical full-stack project, combining a React frontend with a Node.js backend, MongoDB, real-time communication, AI services, and cloud storage.

---

## ✨ Features

### 🔐 Authentication

- Student registration and login
- JWT-based authentication
- Protected routes
- Secure password hashing with bcrypt
- Forgot password
- Password reset
- Change password
- Server-side registration validation

### 👤 Student Profiles

Students can manage:

- Name
- Profile photo
- Skills
- Interests
- Learning requirements

Profile information is stored on the backend and can be updated from Settings.

Profile images are uploaded through Cloudinary.

### 🤝 Find Study Partners

Students can discover and connect with other learners based on their profile information.

Features include:

- Partner search
- Filters
- Compatibility-based matching
- Partner profiles
- Connection requests
- Connection management

### 💬 Direct Messaging

Connected students can communicate through real-time direct messaging.

- One-to-one conversations
- Real-time messages
- Message persistence
- Conversation history
- Socket.IO communication

### 📚 Study Rooms

Students can create and join collaborative study sessions.

Study Rooms include:

- Room membership
- Study session management
- Real-time room chat
- Collaborative learning space

### 🎥 Video Calling

Study Rooms support browser-based video communication.

Current functionality includes:

- Camera
- Microphone
- Two-user video communication
- Join and leave calls
- Reconnection handling
- Screen sharing

Camera, microphone, and screen sharing require the appropriate browser permissions.

### 🤖 EDITH AI

EDITH is the AI assistant integrated into SkillUp.

It supports conversational interaction and can work with uploaded study material through a Retrieval-Augmented Generation (RAG) pipeline.

The RAG system includes:

- PDF processing
- Text chunking
- Embeddings
- Vector storage
- Document retrieval
- Context-aware responses

EDITH also supports conversation history so follow-up questions can be understood in context.

### 📊 Dashboard

The dashboard provides a central view of available student activity and collaboration data.

It includes:

- Study sessions
- Study partners
- Recent activity
- Study information
- Quick access to study rooms
- Application navigation

The dashboard uses real backend data wherever tracking is available instead of displaying fabricated statistics.

### 📈 Analytics

Analytics provides available learning and collaboration metrics.

Metrics that are not currently tracked by the application are shown as `N/A` or `Coming Soon` rather than using made-up values.

### ⚙️ Settings

Students can manage their account and learning profile from Settings.

Available options include:

- Profile information
- Profile photo
- Skills
- Interests
- Learning requirements
- Password change
- Appearance settings
- Account settings

Email changing is currently read-only because a verified email-change workflow has not yet been implemented.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Axios
- React Markdown
- Socket.IO Client

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Socket.IO

### AI & RAG

- NVIDIA AI API integration
- PDF processing
- Text chunking
- Embeddings
- Vector retrieval
- Pinecone

### Cloud Services

- Cloudinary for profile image hosting
- MongoDB for application data
- Email service for authentication-related emails

---

## 🏗️ Project Structure

```text
SkillUp/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── socket/
│       ├── styles/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── rag/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   ├── utils/
│   └── server.js
│
└── .gitignore
