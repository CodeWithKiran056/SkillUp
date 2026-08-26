# SkillUp

### A Student Learning & Collaboration Platform

SkillUp is a full-stack web application designed to help students find compatible study partners, create collaborative study rooms, communicate with other learners, and use AI-powered assistance for their learning journey.

The platform combines student profiles, compatibility-based partner discovery, connection requests, real-time messaging, collaborative study rooms, video communication, session recording, analytics, and an AI assistant with RAG-based study-material support.

---

## 🌐 Live Demo

**Production Website:**  
https://skillup-frontend-up4n.onrender.com

**Backend API:**  
https://skillup-api-st8q.onrender.com

> The frontend and backend are deployed separately. The frontend communicates with the production backend through the configured `VITE_API_URL` environment variable.

---

## 🚀 Overview

Students often want to study with people who have similar subjects, skills, interests, schedules, or learning goals, but finding the right study partner can be difficult.

SkillUp brings these activities together in one platform:

- Create and manage a student learning profile
- Discover compatible study partners
- Send and manage connection requests
- Communicate through direct messaging
- Create and join collaborative study rooms
- Request access to other students' rooms
- Conduct study sessions with video communication
- Record study sessions with explicit user consent
- Use EDITH AI for learning assistance
- Upload study material for RAG-based AI assistance
- Track available learning and collaboration activity

SkillUp is built as a practical full-stack project using modern web technologies, real-time communication, AI services, cloud storage, and a cloud-hosted database.

---

## ✨ Features

### 🔐 Authentication & Account Security

- Student registration and login
- JWT-based authentication
- Protected routes
- Secure password hashing with bcrypt
- Server-side registration validation
- Forgot password workflow
- Password reset workflow
- Change password
- Authentication-related email support

---

### 👤 Student Profiles

Students can create and manage their learning profile.

Profile information includes:

- Name
- Profile photo
- Skills
- Interests
- Learning requirements

Profile images are uploaded through Cloudinary and profile information is stored through the backend.

---

### 🤝 Find Study Partners

SkillUp helps students discover and connect with other learners.

Features include:

- Student search
- Profile-based filtering
- Compatibility-based matching
- Partner profiles
- Connection requests
- Connection request management
- Partner discovery based on learning information

The goal is to make it easier for students to find people with relevant learning goals and interests.

---

### 💬 Direct Messaging

Connected students can communicate through real-time direct messaging.

Features include:

- One-to-one conversations
- Real-time message delivery
- Conversation history
- Message persistence
- Socket.IO communication
- User profile information within conversations

---

### 📚 Study Rooms

Study Rooms provide collaborative spaces where students can learn together.

Students can:

- Create their own study room
- Discover study rooms created by other students
- Send join requests
- Accept or reject requests when they own a room
- Join rooms after approval
- Manage room membership
- Participate in room communication
- Start collaborative study sessions

### New-user experience

A newly registered student does not automatically see existing study-room cards in their personal Study Rooms area.

Instead, the user sees:

> **Create or join the study room**

The user can then either:

- Create a new Study Room
- Explicitly open **Find Study Rooms** to discover rooms created by other students

This keeps the personal workspace clean while preserving the discovery flow.

---

### 🎥 Video Calling & Study Sessions

Study Rooms support browser-based video communication.

Current functionality includes:

- Camera access
- Microphone access
- Two-user video communication
- Join and leave calls
- Reconnection handling
- Screen sharing
- Study-session recording
- Session recording playback

#### Session Recording

Recording uses the browser's native `MediaRecorder` API.

Recording:

- Starts only after the participant explicitly clicks **Record**
- Displays a visible **● REC** indicator with a live timer
- Is uploaded through the authenticated backend
- Uses Cloudinary for recording storage
- Stores recording metadata with the study session in MongoDB
- Can be replayed through the browser's HTML5 video player

### Recording Privacy

Recording is an explicit user action. A recording does not start automatically.

Recordings are uploaded through the authenticated backend and are intended to be accessible only to members of the corresponding study session.

Camera, microphone, and screen sharing require the appropriate browser permissions.

---

### 🤖 EDITH AI

**EDITH** is SkillUp's integrated AI learning assistant.

It supports conversational learning assistance and can work with uploaded study material through a Retrieval-Augmented Generation (RAG) pipeline.

EDITH includes:

- Conversational AI interaction
- Follow-up questions
- Conversation history
- Study-material processing
- PDF processing
- Text chunking
- Embeddings
- Vector storage
- Document retrieval
- Context-aware responses

The AI service is integrated through the backend so provider credentials remain server-side.

---

### 📄 RAG Study Material Support

The RAG pipeline allows EDITH to use uploaded learning material as additional context.

High-level flow:

PDF / Study Material  
↓  
Document Processing  
↓  
Text Extraction  
↓  
Text Chunking  
↓  
Embeddings  
↓  
Vector Storage  
↓  
Relevant Context Retrieval  
↓  
EDITH AI Response

Pinecone is used for vector retrieval, while the backend manages document processing and AI-provider communication.

---

### 📊 Dashboard

The Dashboard provides a central view of the student's learning and collaboration activity.

Depending on available data, it can include:

- Study sessions
- Study partners
- Recent activity
- Study information
- Quick access to Study Rooms
- Application navigation

The application uses real backend data where tracking is available rather than presenting fabricated statistics.

---

### 📈 Analytics

The Analytics section presents available learning and collaboration metrics.

Where a metric is not currently tracked by the application, the interface uses values such as:

- `N/A`
- `Coming Soon`

instead of displaying made-up statistics.

---

### 🗓️ My Sessions

My Sessions provides the student's study-session view.

It is based on the student's own room membership and created rooms rather than simply displaying every room in the database.

Pending join requests are tracked separately so that a pending request does not incorrectly appear as an owned or joined study room.

---

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
- CORS

### AI & RAG

- NVIDIA AI API integration
- PDF processing
- Text chunking
- Embeddings
- Pinecone vector retrieval

### Cloud Services

- Render — frontend and backend deployment
- MongoDB Atlas — application database
- Cloudinary — profile images and study-session recordings
- Email service — authentication-related emails
- Pinecone — vector retrieval for RAG

---

## 🏗️ Project Architecture

```text
                         ┌─────────────────────────┐
                         │       SkillUp User      │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │   React + Vite Client   │
                         │        Frontend         │
                         └────────────┬────────────┘
                                      │ HTTPS
                                      │ REST / Socket.IO
                                      ▼
                         ┌─────────────────────────┐
                         │   Node.js + Express     │
                         │        Backend          │
                         └──────┬──────┬──────┬────┘
                                │      │      │
                ┌───────────────┘      │      └────────────────┐
                ▼                      ▼                       ▼
       ┌────────────────┐     ┌────────────────┐      ┌────────────────┐
       │ MongoDB Atlas  │     │ NVIDIA AI API  │      │   Cloudinary   │
       │ Application DB │     │    EDITH AI    │      │ Images/Records │
       └────────────────┘     └────────────────┘      └────────────────┘
                                      │
                                      ▼
                              ┌────────────────┐
                              │    Pinecone    │
                              │ Vector Search  │
                              └────────────────┘

📁 Project Structure

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
│       ├── config/
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
├── .gitignore
└── README.md

Security

Cloud-service credentials and AI-provider keys remain server-side.
Cloudinary recording storage reuses the existing server-side Cloudinary credentials. No new recording-specific credentials are required.

