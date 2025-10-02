import mongoose from 'mongoose';

const studyGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    avatar: { type: String, default: '' },
    category: { type: String, required: true },
    tags: [{ type: String }],

    // Group Creator
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Members
    members: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
      joinedAt: { type: Date, default: Date.now }
    }],
    maxMembers: { type: Number, default: 50 },

    // Group Settings
    isPrivate: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: false },

    // Group Activity
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],

    // Stats
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },

    // Status
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'studygroups' }
);

export const StudyGroup = mongoose.models.StudyGroup || mongoose.model('StudyGroup', studyGroupSchema);
