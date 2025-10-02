import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Mentor', 'Student'], required: true },

    // Profile Information
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    skills: [{ type: String }],
    interests: [{ type: String }],

    // Gamification
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{
      name: String,
      icon: String,
      description: String,
      earnedAt: { type: Date, default: Date.now }
    }],

    // Stats & Analytics
    stats: {
      postsCreated: { type: Number, default: 0 },
      commentsPosted: { type: Number, default: 0 },
      questionsAnswered: { type: Number, default: 0 },
      coursesCompleted: { type: Number, default: 0 },
      studyGroupsJoined: { type: Number, default: 0 },
      loginStreak: { type: Number, default: 0 },
      lastLoginDate: { type: Date },
    },

    // Learning Progress (for students)
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    studyGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup' }],
  },
  { timestamps: true, collection: 'users' }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);


