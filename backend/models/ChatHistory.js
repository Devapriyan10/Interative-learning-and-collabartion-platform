import mongoose from 'mongoose';

// Message schema for individual chat messages
const messageSchema = new mongoose.Schema({
  sender: { 
    type: String, 
    enum: ['student', 'bot'], 
    required: true 
  },
  text: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Chat history schema for storing conversation history
const chatHistorySchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    messages: [messageSchema],
    isActive: {
      type: Boolean,
      default: true
    },
    // Track the last interaction for cleanup/archiving
    lastInteraction: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true, 
    collection: 'chathistory' 
  }
);

// Index for better query performance
chatHistorySchema.index({ userId: 1, updatedAt: -1 });
chatHistorySchema.index({ lastInteraction: 1 }); // For cleanup queries

// Update lastInteraction whenever messages are added
chatHistorySchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastInteraction = new Date();
  }
  next();
});

export const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', chatHistorySchema);
