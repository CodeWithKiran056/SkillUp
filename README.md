# SkillUp

### A Student Learning & Collaboration Platform

SkillUp is a full-stack web platform designed to help students learn together, find suitable study partners, communicate with other learners, and manage their study sessions in one place.

The idea behind SkillUp came from a simple problem: finding serious and compatible students to study with can be difficult. SkillUp brings study partner matching, communication, study rooms, AI assistance, and student profiles together into a single platform.

---

## 🚀 What is SkillUp?

SkillUp is built around the idea of making collaborative learning easier.

Students can create their own profile, add the subjects and skills they are interested in, describe what they are currently looking for, and discover other students with similar learning goals.

Instead of treating every student the same, SkillUp uses profile information such as skills, interests, and learning requirements to help find more relevant study partners.

The platform also provides tools for students to communicate and study together after connecting.

---

## ✨ Main Features

### 🔐 Authentication

- Student registration and login
- Secure password hashing
- JWT-based authentication
- Protected routes
- Forgot password functionality
- Password reset flow
- Change password from Settings
- Server-side registration validation

### 👤 Student Profiles

Students can maintain their learning profile with:

- Name
- Profile photo
- Skills
- Interests
- Learning requirements

Profile information is stored on the backend and can be updated from the Settings page.

Profile photos are uploaded and hosted using Cloudinary rather than being stored as local files.

---

### 🤝 Find Study Partners

SkillUp includes a study partner matching system that helps students discover other learners based on their profile information.

Students can:

- Browse available study partners
- Search for students
- Filter matches
- View partner profiles
- Check compatibility information
- Send connection requests
- Manage connection requests

Updated profile information is also used by the matching system.

---

### 💬 Connections & Messaging

After connecting with another student, users can communicate through the platform.

The messaging system supports:

- Direct conversations
- Real-time messages
- Message persistence
- Conversation history
- Bidirectional communication

Real-time communication is handled using Socket.IO.

---

### 📚 Study Rooms

Students can use Study Rooms to study together.

Study Rooms provide a shared space where students can:

- Join study sessions
- Communicate through room chat
- Interact with other members
- Continue collaborative study sessions

---

### 🎥 Video Calling

SkillUp includes real-time video calling for study sessions.

The video system is designed around browser-based communication and real-time socket events.

Supported functionality includes:

- Two-user video communication
- Camera access
- Microphone access
- Joining and leaving calls
- Reconnecting to sessions
- Screen sharing

Screen sharing uses the browser's media capture capabilities.

> Video and screen-sharing functionality requires browser permissions for camera, microphone, and screen capture.

---

### 🤖 EDITH AI

SkillUp includes an AI assistant called **EDITH**.

EDITH can interact with students through the platform and provide AI-based assistance.

The project also includes a document-based RAG pipeline for working with uploaded study material.

The RAG system includes components for:

- PDF processing
- Text chunking
- Embeddings
- Vector storage
- Document retrieval
- Context-based AI responses

This allows the project to move beyond a simple chatbot and experiment with AI-assisted learning using student-provided material.

---

### 📊 Dashboard

The dashboard provides a central place for students to view their learning activity.

It includes areas such as:

- Study activity
- Study partners
- Recent activity
- Progress information
- Study room access
- Platform navigation

The dashboard is connected to real application data rather than relying on fabricated user statistics.

---

### 📈 Analytics

SkillUp includes an Analytics section for displaying available learning-related metrics.

Where a metric is not currently tracked by the system, the application uses an honest `N/A` or `Coming Soon` state instead of displaying made-up statistics.

---

### ⚙️ Settings

The Settings section allows students to manage their account and profile.

Available functionality includes:

- Profile information
- Skills
- Interests
- Learning requirements
- Profile photo
- Password change
- Appearance settings
- Account-related settings

Email changing is currently read-only because a verified email-change flow has not been implemented yet.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Lucide React
- Socket.IO Client
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Socket.IO

### AI & RAG

- AI API integration
- Document processing
- PDF processing
- Text chunking
- Embeddings
- Vector retrieval

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
