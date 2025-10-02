import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  content: String,
  videoUrl: String,
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['pdf', 'video', 'article', 'link'] }
  }],
  order: { type: Number, default: 0 },
  duration: Number, // in minutes
  completed: { type: Boolean, default: false }
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    category: { type: String, required: true },
    tags: [{ type: String }],
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },

    // Course Content
    lessons: [lessonSchema],

    // Course Creator (Mentor)
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Enrollment Info
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxStudents: { type: Number, default: 100 },

    // Course Stats
    totalDuration: { type: Number, default: 0 }, // in minutes
    enrollmentCount: { type: Number, default: 0 },
    completionCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },

    // Status
    isPublished: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'courses' }
);

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
