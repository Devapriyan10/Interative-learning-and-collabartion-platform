import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    fileUrl: {
      type: String,
      trim: true,
      default: null
    },
    fileName: {
      type: String,
      trim: true,
      default: null
    },
    category: {
      type: String,
      default: 'General'
    },
    tags: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    likesCount: {
      type: Number,
      default: 0
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'posts'
  }
);

// Index for better query performance
postSchema.index({ createdBy: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
