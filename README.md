# 🎓 Interactive Learning & Collaboration Platform

> A full-stack MERN application for interactive learning, collaboration, and knowledge sharing with gamification, courses, study groups, and AI-powered assistance.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Features Overview](#features-overview)
- [Screenshots](#screenshots)

---

## ✨ Features

### 🎯 Core Features
- **Role-Based Authentication** - Separate dashboards for Students and Mentors
- **Posts & Discussion System** - Mentors can create posts, students can comment and discuss
- **AI-Powered Chatbot** - Google Generative AI integration for student assistance
- **Real-time Engagement** - Like posts, comment, and receive replies

### 🏆 Gamification System
- **Points & Levels** - Earn points for activities (posts, comments, logins, etc.)
- **Badges & Achievements** - Unlock badges for milestones
- **Leaderboard** - Compete with other users based on points and levels
- **Login Streaks** - Daily login rewards and streak tracking

### 📚 Learning Management
- **Courses Module** - Create, enroll in, and complete courses
- **Lesson Management** - Add lessons with videos, resources, and content
- **Progress Tracking** - Track enrollment and completion status
- **Categories & Tags** - Organize courses by difficulty and topics

### 👥 Study Groups
- **Create & Join Groups** - Collaborative learning spaces
- **Group Management** - Admin roles, member limits, privacy settings
- **Group Activities** - Share posts and resources within groups

### 🔔 Notification System
- **Real-time Notifications** - Get notified for comments, replies, badges, etc.
- **Notification Center** - View all notifications in one place
- **Mark as Read** - Track read/unread notifications

### 📊 Analytics & Profiles
- **User Profiles** - Avatar, bio, skills, interests
- **Stats Dashboard** - Track posts, comments, courses, achievements
- **User Rankings** - See your rank among all users
- **Progress Visualization** - Level progress, badges earned, stats

### 🔍 Additional Features
- **Search & Filter** - Find posts, courses, and study groups easily
- **Category System** - Organize content by categories
- **Responsive Design** - Mobile-friendly interface
- **User Management** - Profile customization and settings

---

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Google Generative AI** - Chatbot integration

### Frontend
- **React 19** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **CSS3** - Custom animations and styles

---

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google API Key for Generative AI

### Clone the Repository
```bash
git clone <your-repo-url>
cd Interative-learning-and-collabartion-platform
```

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Google AI (for Chatbot)
GEMINI_API_KEY=your_google_api_key
```

### Frontend Configuration
The frontend is already configured to connect to `http://localhost:5000`. If you change the backend port, update the API base URL in `frontend/src/api/client.js`.

---

## 🚀 Running the Application

### Development Mode

1. **Start MongoDB** (if running locally):
```bash
mongod
```

2. **Start the Backend**:
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

3. **Start the Frontend** (in a new terminal):
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

4. **Access the Application**:
Open your browser and navigate to `http://localhost:5173`

### Production Build

**Backend**:
```bash
cd backend
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
npm run preview
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts (with search, filter, category)
- `POST /api/posts` - Create a post (Mentor only)
- `GET /api/posts/my` - Get my posts (Mentor only)
- `PUT /api/posts/:id` - Update a post (Mentor only)
- `DELETE /api/posts/:id` - Delete a post (Mentor only)
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/like` - Unlike a post

### Comments
- `GET /api/comments/post/:id` - Get comments for a post
- `POST /api/comments/:id` - Add a comment (Student only)
- `POST /api/comments/:id/reply` - Reply to comment (Mentor only)
- `GET /api/comments/my` - Get comments on my posts (Mentor only)
- `DELETE /api/comments/:id` - Delete a comment

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create a course (Mentor only)
- `GET /api/courses/my` - Get my courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course (Student only)
- `POST /api/courses/:id/complete` - Complete course (Student only)
- `POST /api/courses/:id/lessons` - Add lesson (Mentor only)
- `PUT /api/courses/:id` - Update course (Mentor only)
- `DELETE /api/courses/:id` - Delete course (Mentor only)

### Study Groups
- `GET /api/studygroups` - Get all study groups
- `POST /api/studygroups` - Create a study group
- `GET /api/studygroups/my` - Get my study groups
- `GET /api/studygroups/:id` - Get study group details
- `POST /api/studygroups/:id/join` - Join a study group
- `POST /api/studygroups/:id/leave` - Leave a study group
- `PUT /api/studygroups/:id` - Update study group (Admin only)
- `DELETE /api/studygroups/:id` - Delete study group (Admin only)

### Gamification
- `GET /api/gamification/leaderboard` - Get leaderboard
- `GET /api/gamification/rank/:userId?` - Get user rank
- `GET /api/gamification/badges/:userId?` - Get user badges
- `GET /api/gamification/stats/:userId?` - Get user stats

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Users
- `GET /api/users` - Get all users (with search)
- `GET /api/users/profile/:userId?` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Chatbot
- `POST /api/chatbot/chat` - Send a message to AI chatbot
- `GET /api/chatbot/history` - Get chat history

---

## 📁 Project Structure

```
Interative-learning-and-collabartion-platform/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── postsController.js    # Posts management
│   │   ├── commentsController.js # Comments management
│   │   ├── courseController.js   # Courses management
│   │   ├── studyGroupController.js # Study groups
│   │   ├── gamificationController.js # Gamification
│   │   ├── notificationController.js # Notifications
│   │   ├── userController.js     # User profiles
│   │   └── chatbotController.js  # AI chatbot
│   ├── models/
│   │   ├── User.js               # User schema with gamification
│   │   ├── Post.js               # Post schema
│   │   ├── Comment.js            # Comment schema
│   │   ├── Course.js             # Course schema
│   │   ├── StudyGroup.js         # Study group schema
│   │   ├── Notification.js       # Notification schema
│   │   └── ChatHistory.js        # Chat history schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth routes
│   │   ├── posts.js              # Posts routes
│   │   ├── comments.js           # Comments routes
│   │   ├── courses.js            # Courses routes
│   │   ├── studygroups.js        # Study groups routes
│   │   ├── gamification.js       # Gamification routes
│   │   ├── notifications.js      # Notifications routes
│   │   ├── users.js              # Users routes
│   │   └── chatbot.js            # Chatbot routes
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication
│   ├── utils/
│   │   └── gamification.js       # Gamification utilities
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server
│   └── package.json              # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js         # Axios instance
│   │   │   ├── posts.js          # Posts API
│   │   │   ├── comments.js       # Comments API
│   │   │   ├── chatbot.js        # Chatbot API
│   │   │   ├── courses.js        # Courses API
│   │   │   ├── studygroups.js    # Study groups API
│   │   │   ├── gamification.js   # Gamification API
│   │   │   ├── notifications.js  # Notifications API
│   │   │   └── users.js          # Users API
│   │   ├── components/
│   │   │   ├── Auth/             # Login & Signup
│   │   │   ├── PostCard.jsx      # Post component
│   │   │   └── StudentChatbot.jsx # AI chatbot
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx      # Authentication page
│   │   │   ├── Dashboard.jsx     # Base dashboard
│   │   │   ├── MentorDashboard.jsx # Mentor view
│   │   │   └── StudentDashboard.jsx # Student view
│   │   ├── App.jsx               # Main app component
│   │   ├── App.css               # Global styles
│   │   ├── index.css             # Tailwind imports
│   │   └── main.jsx              # Entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.js            # Vite configuration
│   └── package.json              # Frontend dependencies
│
├── Web Development.pdf           # Assessment requirements
└── README.md                     # Project documentation
```

---

## 🎮 Features Overview

### For Students:
1. **Browse & Learn** - View posts from mentors
2. **Ask Questions** - Comment on posts with doubts
3. **AI Assistant** - Chat with AI for instant help
4. **Enroll in Courses** - Access structured learning paths
5. **Join Study Groups** - Collaborate with peers
6. **Earn Rewards** - Gain points, levels, and badges
7. **Track Progress** - View your stats and achievements

### For Mentors:
1. **Create Content** - Post articles, tutorials, resources
2. **Answer Questions** - Reply to student comments
3. **Create Courses** - Build structured courses with lessons
4. **Manage Study Groups** - Organize collaborative spaces
5. **Track Engagement** - See likes, comments, and views
6. **Earn Recognition** - Build reputation through gamification

---

## 🎯 Gamification System

### Point System
- **Post Created**: 50 points
- **Comment Posted**: 10 points
- **Reply Given**: 15 points
- **Course Completed**: 100 points
- **Badge Earned**: 200 points
- **Daily Login**: 5 points
- **Study Group Joined**: 20 points
- **Post Liked**: 5 points

### Levels
- Level 1: 0 points
- Level 2: 100 points
- Level 3: 300 points
- Level 4: 600 points
- Level 5: 1000 points
- Level 6: 1500 points
- Level 7: 2100 points
- Level 8: 2800 points
- Level 9: 3600 points
- Level 10: 5000 points

### Badges
- 🎯 **First Post** - Created your first post
- 🌟 **Helpful Mentor** - Answered 10 student questions
- 📚 **Active Learner** - Posted 10 comments
- 🎓 **Course Master** - Completed 5 courses
- 🦋 **Social Butterfly** - Joined 3 study groups
- 🔥 **Weekly Warrior** - 7-day login streak
- 💡 **Knowledge Sharer** - Created 5 posts
- 👑 **Expert** - Reached level 5
- ⭐ **Rising Star** - Earned 500 points

---

## 🔒 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation and sanitization

---

## 🎨 UI/UX Features
- Modern, clean interface
- Responsive design for all devices
- Smooth animations and transitions
- Intuitive navigation
- Loading states and error handling
- Empty states with helpful messages

---

## 📝 Notes

- The chatbot requires a Google Generative AI API key
- MongoDB must be running before starting the backend
- Both frontend and backend must be running for full functionality
- Default login credentials can be created via the signup page

---

## 🤝 Contributing
This project was created for the SuPrazo Technology Web Development Assessment.

---

## 📄 License
This project is created as part of a technical assessment.

---

## 🙏 Acknowledgments
- SuPrazo Technology for the assessment opportunity
- Google Generative AI for chatbot capabilities
- MongoDB for database solutions
- React and Express communities

---

## 📧 Contact
For any questions or feedback, please reach out through the assessment submission form.

---

**🚀 Built with passion for education and collaboration! 🎓**
