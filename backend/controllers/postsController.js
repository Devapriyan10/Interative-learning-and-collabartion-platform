import { Post } from '../models/Post.js';
import { User } from '../models/User.js';

// Create a new post (Mentor only)
export async function createPost(req, res) {
  try {
    const { title, content, fileUrl, fileName } = req.body || {};
    const { id: userId, role } = req.user || {};

    // Check if user is a mentor
    if (role !== 'Mentor') {
      return res.status(403).json({ message: 'Only mentors can create posts' });
    }

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Create the post
    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      fileUrl: fileUrl?.trim() || null,
      fileName: fileName?.trim() || null,
      createdBy: userId
    });

    // Populate mentor info and return
    const populatedPost = await Post.findById(post._id)
      .populate('createdBy', 'name email role')
      .lean();

    return res.status(201).json({ 
      message: 'Post created successfully', 
      post: populatedPost 
    });
  } catch (err) {
    console.error('Create post error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get all posts with mentor info
export async function getAllPosts(req, res) {
  try {
    const { page = 1, limit = 10, mentorId } = req.query;
    
    // Build query
    const query = { isActive: true };
    if (mentorId) {
      query.createdBy = mentorId;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get posts with mentor info
    const posts = await Post.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    return res.status(200).json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasNext: skip + posts.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Get posts error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get posts by current mentor
export async function getMyPosts(req, res) {
  try {
    const { id: userId, role } = req.user || {};
    const { page = 1, limit = 10 } = req.query;

    // Check if user is a mentor
    if (role !== 'Mentor') {
      return res.status(403).json({ message: 'Only mentors can access this endpoint' });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get mentor's posts
    const posts = await Post.find({ createdBy: userId, isActive: true })
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Post.countDocuments({ createdBy: userId, isActive: true });

    return res.status(200).json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasNext: skip + posts.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Get my posts error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get a single post by ID
export async function getPostById(req, res) {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ _id: id, isActive: true })
      .populate('createdBy', 'name email role')
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({ post });
  } catch (err) {
    console.error('Get post by ID error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Update a post (Mentor only, own posts)
export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, content, fileUrl, fileName } = req.body || {};
    const { id: userId, role } = req.user || {};

    // Check if user is a mentor
    if (role !== 'Mentor') {
      return res.status(403).json({ message: 'Only mentors can update posts' });
    }

    // Find the post
    const post = await Post.findOne({ _id: id, isActive: true });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the mentor owns this post
    if (post.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update your own posts' });
    }

    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl?.trim() || null;
    if (fileName !== undefined) updateData.fileName = fileName?.trim() || null;

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role').lean();

    return res.status(200).json({ 
      message: 'Post updated successfully', 
      post: updatedPost 
    });
  } catch (err) {
    console.error('Update post error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Delete a post (Mentor only, own posts)
export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user || {};

    // Check if user is a mentor
    if (role !== 'Mentor') {
      return res.status(403).json({ message: 'Only mentors can delete posts' });
    }

    // Find the post
    const post = await Post.findOne({ _id: id, isActive: true });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the mentor owns this post
    if (post.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Soft delete the post
    await Post.findByIdAndUpdate(id, { isActive: false });

    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
