import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';

// Add a comment to a post (Student only)
export async function addComment(req, res) {
  try {
    const { id: postId } = req.params;
    const { message } = req.body || {};
    const { id: userId, role } = req.user || {};

    // Check if user is a student
    if (role !== 'Student') {
      return res.status(403).json({ message: 'Only students can add comments' });
    }

    // Validate required fields
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Check if post exists
    const post = await Post.findOne({ _id: postId, isActive: true });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create the comment
    const comment = await Comment.create({
      postId,
      userId,
      message: message.trim()
    });

    // Populate user info and return
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name email role')
      .populate('replies.mentorId', 'name email role')
      .lean();

    return res.status(201).json({ 
      message: 'Comment added successfully', 
      comment: populatedComment 
    });
  } catch (err) {
    console.error('Add comment error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get all comments for a post
export async function getPostComments(req, res) {
  try {
    const { id: postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if post exists
    const post = await Post.findOne({ _id: postId, isActive: true });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get comments with user and reply info
    const comments = await Comment.find({ postId, isActive: true })
      .populate('userId', 'name email role')
      .populate('replies.mentorId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Comment.countDocuments({ postId, isActive: true });

    return res.status(200).json({
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalComments: total,
        hasNext: skip + comments.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Get comments error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Add a reply to a comment (Mentor only)
export async function addReply(req, res) {
  try {
    const { id: commentId } = req.params;
    const { message } = req.body || {};
    const { id: mentorId, role } = req.user || {};

    // Check if user is a mentor
    if (role !== 'Mentor') {
      return res.status(403).json({ message: 'Only mentors can add replies' });
    }

    // Validate required fields
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Find the comment
    const comment = await Comment.findOne({ _id: commentId, isActive: true });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the post belongs to this mentor
    const post = await Post.findOne({ _id: comment.postId, createdBy: mentorId, isActive: true });
    if (!post) {
      return res.status(403).json({ message: 'You can only reply to comments on your own posts' });
    }

    // Add the reply
    const reply = {
      mentorId,
      message: message.trim(),
      createdAt: new Date()
    };

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $push: { replies: reply } },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email role')
      .populate('replies.mentorId', 'name email role')
      .lean();

    return res.status(200).json({ 
      message: 'Reply added successfully', 
      comment: updatedComment 
    });
  } catch (err) {
    console.error('Add reply error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get comments for mentor's posts (Mentor only)
export async function getMyPostsComments(req, res) {
  try {
    const { id: mentorId, role } = req.user || {};
    const { page = 1, limit = 20 } = req.query;

    // Check if user is a mentor
    if (role !== 'Mentor') {
      return res.status(403).json({ message: 'Only mentors can access this endpoint' });
    }

    // Get mentor's posts
    const mentorPosts = await Post.find({ createdBy: mentorId, isActive: true }).select('_id');
    const postIds = mentorPosts.map(post => post._id);

    if (postIds.length === 0) {
      return res.status(200).json({
        comments: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalComments: 0,
          hasNext: false,
          hasPrev: false
        }
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get comments on mentor's posts
    const comments = await Comment.find({ 
      postId: { $in: postIds }, 
      isActive: true 
    })
      .populate('userId', 'name email role')
      .populate('postId', 'title')
      .populate('replies.mentorId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Comment.countDocuments({ 
      postId: { $in: postIds }, 
      isActive: true 
    });

    return res.status(200).json({
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalComments: total,
        hasNext: skip + comments.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Get my posts comments error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Delete a comment (Student can delete own, Mentor can delete from their posts)
export async function deleteComment(req, res) {
  try {
    const { id: commentId } = req.params;
    const { id: userId, role } = req.user || {};

    // Find the comment
    const comment = await Comment.findOne({ _id: commentId, isActive: true });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    let canDelete = false;

    if (role === 'Student') {
      // Students can delete their own comments
      canDelete = comment.userId.toString() === userId;
    } else if (role === 'Mentor') {
      // Mentors can delete comments on their own posts
      const post = await Post.findOne({ _id: comment.postId, createdBy: userId, isActive: true });
      canDelete = !!post;
    }

    if (!canDelete) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    // Soft delete the comment
    await Comment.findByIdAndUpdate(commentId, { isActive: false });

    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Delete comment error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Delete a reply from a comment (Mentor only, own replies)
export async function deleteReply(req, res) {
  try {
    const { id: commentId, replyId } = req.params;
    const { id: userId, role } = req.user || {};

    // Check if user is a mentor
    if (role !== 'Mentor') {
      return res.status(403).json({ message: 'Only mentors can delete replies' });
    }

    // Find the comment
    const comment = await Comment.findOne({ _id: commentId, isActive: true });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Find the reply
    const replyIndex = comment.replies.findIndex(reply => reply._id.toString() === replyId);
    if (replyIndex === -1) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const reply = comment.replies[replyIndex];

    // Check if the mentor owns this reply
    if (reply.mentorId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own replies' });
    }

    // Remove the reply from the array
    comment.replies.splice(replyIndex, 1);
    await comment.save();

    // Return updated comment with populated fields
    const updatedComment = await Comment.findById(commentId)
      .populate('userId', 'name email role')
      .populate('replies.mentorId', 'name email role')
      .lean();

    return res.status(200).json({ 
      message: 'Reply deleted successfully',
      comment: updatedComment
    });
  } catch (err) {
    console.error('Delete reply error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
