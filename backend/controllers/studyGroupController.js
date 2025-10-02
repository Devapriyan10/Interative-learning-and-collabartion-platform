import { StudyGroup } from '../models/StudyGroup.js';
import { User } from '../models/User.js';
import { awardPoints, updateUserStats, POINTS } from '../utils/gamification.js';

// Create a study group
export const createStudyGroup = async (req, res) => {
  try {
    const { name, description, category, tags, maxMembers, isPrivate, requireApproval, avatar } = req.body;

    const studyGroup = new StudyGroup({
      name,
      description,
      category,
      tags: tags || [],
      maxMembers: maxMembers || 50,
      isPrivate: isPrivate || false,
      requireApproval: requireApproval || false,
      avatar: avatar || '',
      creatorId: req.user.id,
      members: [{
        userId: req.user.id,
        role: 'admin',
        joinedAt: new Date()
      }],
      memberCount: 1
    });

    await studyGroup.save();

    // Update user's study groups
    const user = await User.findById(req.user.id);
    if (!user.studyGroups.includes(studyGroup._id)) {
      user.studyGroups.push(studyGroup._id);
      await user.save();
    }

    // Award points
    await awardPoints(req.user.id, POINTS.STUDY_GROUP_JOINED, 'Created a study group');
    await updateUserStats(req.user.id, 'studyGroupsJoined');

    res.status(201).json({ success: true, studyGroup });
  } catch (error) {
    console.error('Error creating study group:', error);
    res.status(500).json({ success: false, message: 'Failed to create study group', error: error.message });
  }
};

// Get all study groups
export const getAllStudyGroups = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = { isActive: true };

    // Only show public groups or groups the user is a member of
    if (req.user) {
      query.$or = [
        { isPrivate: false },
        { 'members.userId': req.user.id }
      ];
    } else {
      query.isPrivate = false;
    }

    if (category) query.category = category;
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const studyGroups = await StudyGroup.find(query)
      .populate('creatorId', 'name email avatar')
      .populate('members.userId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, studyGroups });
  } catch (error) {
    console.error('Error fetching study groups:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch study groups', error: error.message });
  }
};

// Get study group by ID
export const getStudyGroupById = async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id)
      .populate('creatorId', 'name email avatar role')
      .populate('members.userId', 'name email avatar role')
      .populate('posts');

    if (!studyGroup) {
      return res.status(404).json({ success: false, message: 'Study group not found' });
    }

    // Check if user has access (if private)
    if (studyGroup.isPrivate) {
      const isMember = studyGroup.members.some(m => m.userId._id.toString() === req.user.id);
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.json({ success: true, studyGroup });
  } catch (error) {
    console.error('Error fetching study group:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch study group', error: error.message });
  }
};

// Join a study group
export const joinStudyGroup = async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({ success: false, message: 'Study group not found' });
    }

    // Check if already a member
    const isMember = studyGroup.members.some(m => m.userId.toString() === req.user.id);
    if (isMember) {
      return res.status(400).json({ success: false, message: 'Already a member of this group' });
    }

    // Check if group is full
    if (studyGroup.members.length >= studyGroup.maxMembers) {
      return res.status(400).json({ success: false, message: 'Study group is full' });
    }

    // Add member
    studyGroup.members.push({
      userId: req.user.id,
      role: 'member',
      joinedAt: new Date()
    });
    studyGroup.memberCount = studyGroup.members.length;
    await studyGroup.save();

    // Update user's study groups
    const user = await User.findById(req.user.id);
    if (!user.studyGroups.includes(studyGroup._id)) {
      user.studyGroups.push(studyGroup._id);
      await user.save();
    }

    // Award points
    await awardPoints(req.user.id, POINTS.STUDY_GROUP_JOINED, 'Joined a study group');
    await updateUserStats(req.user.id, 'studyGroupsJoined');

    res.json({ success: true, message: 'Successfully joined study group', studyGroup });
  } catch (error) {
    console.error('Error joining study group:', error);
    res.status(500).json({ success: false, message: 'Failed to join study group', error: error.message });
  }
};

// Leave a study group
export const leaveStudyGroup = async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({ success: false, message: 'Study group not found' });
    }

    // Check if user is a member
    const memberIndex = studyGroup.members.findIndex(m => m.userId.toString() === req.user.id);
    if (memberIndex === -1) {
      return res.status(400).json({ success: false, message: 'Not a member of this group' });
    }

    // Cannot leave if you're the only admin
    const member = studyGroup.members[memberIndex];
    if (member.role === 'admin') {
      const adminCount = studyGroup.members.filter(m => m.role === 'admin').length;
      if (adminCount === 1 && studyGroup.members.length > 1) {
        return res.status(400).json({ success: false, message: 'Assign another admin before leaving' });
      }
    }

    // Remove member
    studyGroup.members.splice(memberIndex, 1);
    studyGroup.memberCount = studyGroup.members.length;
    await studyGroup.save();

    // Update user's study groups
    const user = await User.findById(req.user.id);
    user.studyGroups = user.studyGroups.filter(g => g.toString() !== studyGroup._id.toString());
    await user.save();

    res.json({ success: true, message: 'Successfully left study group' });
  } catch (error) {
    console.error('Error leaving study group:', error);
    res.status(500).json({ success: false, message: 'Failed to leave study group', error: error.message });
  }
};

// Get my study groups
export const getMyStudyGroups = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'studyGroups',
        populate: [
          { path: 'creatorId', select: 'name email avatar' },
          { path: 'members.userId', select: 'name email avatar' }
        ]
      });

    res.json({ success: true, studyGroups: user.studyGroups || [] });
  } catch (error) {
    console.error('Error fetching my study groups:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch study groups', error: error.message });
  }
};

// Update study group (Admin only)
export const updateStudyGroup = async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({ success: false, message: 'Study group not found' });
    }

    // Check if user is admin
    const member = studyGroup.members.find(m => m.userId.toString() === req.user.id);
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== 'members' && key !== 'creatorId') {
        studyGroup[key] = updates[key];
      }
    });

    await studyGroup.save();

    res.json({ success: true, message: 'Study group updated successfully', studyGroup });
  } catch (error) {
    console.error('Error updating study group:', error);
    res.status(500).json({ success: false, message: 'Failed to update study group', error: error.message });
  }
};

// Delete study group (Admin only)
export const deleteStudyGroup = async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({ success: false, message: 'Study group not found' });
    }

    // Check if user is admin
    const member = studyGroup.members.find(m => m.userId.toString() === req.user.id);
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await StudyGroup.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Study group deleted successfully' });
  } catch (error) {
    console.error('Error deleting study group:', error);
    res.status(500).json({ success: false, message: 'Failed to delete study group', error: error.message });
  }
};
