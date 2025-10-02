import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['comment', 'reply', 'badge', 'course', 'studygroup', 'mention', 'achievement'],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    icon: { type: String, default: '🔔' },

    // Related entities
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    relatedCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    relatedGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup' },

    // Status
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true, collection: 'notifications' }
);

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
