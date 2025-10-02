import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  mentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const commentSchema = new mongoose.Schema(
  {
    postId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Post', 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    message: { 
      type: String, 
      required: true,
      maxlength: 1000
    },
    replies: [replySchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true, 
    collection: 'comments' 
  }
);

// Index for better query performance
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });

export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
