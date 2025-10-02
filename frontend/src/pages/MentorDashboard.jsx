import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { postsAPI } from '../api/posts.js';
import { commentsAPI } from '../api/comments.js';
import api from '../api/client.js';
import './Dashboard.css';

export default function MentorDashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'comments'
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    fileUrl: '',
    fileName: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadUserAndPosts();
  }, [navigate]);

  const loadUserAndPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      // Load user data
      const { data } = await api.get('/api/auth/me');
      setUser(data.user);

      // Load mentor's posts
      const postsResponse = await postsAPI.getMyPosts();
      setPosts(postsResponse.posts || []);
    } catch (error) {
      console.error('Error loading data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await commentsAPI.getMyPostsComments();
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Load comments when switching to comments tab
  useEffect(() => {
    if (activeTab === 'comments' && user) {
      loadComments();
    }
  }, [activeTab, user]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim() || submitting) return;

    try {
      setSubmitting(true);
      const response = await postsAPI.createPost({
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        fileUrl: newPost.fileUrl.trim() || null,
        fileName: newPost.fileName.trim() || null
      });

      // Add new post to the beginning of the list
      setPosts([response.post, ...posts]);
      
      // Reset form
      setNewPost({ title: '', content: '', fileUrl: '', fileName: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyToComment = async (commentId, replyMessage, updatedComment = null) => {
    try {
      if (updatedComment) {
        // This is from a delete operation, just update the comment
        setComments(comments.map(comment => 
          comment._id === commentId ? updatedComment : comment
        ));
      } else {
        // This is a new reply
        const response = await commentsAPI.addReply(commentId, {
          message: replyMessage
        });
        
        // Update the comment in the list with the new reply
        setComments(comments.map(comment => 
          comment._id === commentId ? response.comment : comment
        ));
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsAPI.deleteComment(commentId);
      // Remove the comment from the list
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Navigation Bar */}
      <nav className="dashboard-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <div className="logo">
              <span className="logo-icon">🎓</span>
              <span className="logo-text">EduPlatform</span>
            </div>
          </div>
          
          <div className="navbar-right">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <span className="user-name">{user?.name || 'Mentor'}</span>
              <span className="user-role">Mentor</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Mentor Dashboard</h1>
            <p>Manage your courses and interact with students</p>
          </div>

          {/* Tab Navigation */}
          <div className="dashboard-tabs">
            <button 
              className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              📝 My Posts ({posts.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              💬 Student Questions ({comments.length})
            </button>
          </div>

          {/* Create Post Section - Only show on posts tab */}
          {activeTab === 'posts' && (
            <div className="create-post-section">
            {!showCreateForm ? (
              <div className="create-post-prompt" onClick={() => setShowCreateForm(true)}>
                <div className="prompt-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'M'}
                </div>
                <div className="prompt-text">Share something with your students...</div>
              </div>
            ) : (
              <div className="create-post-form">
                <div className="form-header">
                  <h3>Create New Post</h3>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateForm(false)}
                    className="close-btn"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleCreatePost}>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Post title"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      className="form-input title-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <textarea
                      placeholder="Share details, instructions, or resources with your students..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      className="form-textarea"
                      rows="4"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <input
                      type="url"
                      placeholder="File URL (optional)"
                      value={newPost.fileUrl}
                      onChange={(e) => setNewPost({ ...newPost, fileUrl: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  
                  {newPost.fileUrl && (
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="File name (optional)"
                        value={newPost.fileName}
                        onChange={(e) => setNewPost({ ...newPost, fileName: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  )}
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      onClick={() => setShowCreateForm(false)} 
                      className="cancel-btn"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="post-btn"
                      disabled={submitting || !newPost.title.trim() || !newPost.content.trim()}
                    >
                      {submitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            </div>
          )}

          {/* Posts List - Only show on posts tab */}
          {activeTab === 'posts' && (
            <div className="posts-section">
            <div className="posts-header">
              <h2>Your Posts ({posts.length})</h2>
            </div>
            
            <div className="posts-list">
              {posts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No posts yet</h3>
                  <p>Create your first post to share with students</p>
                </div>
              ) : (
                posts.map(post => (
                  <PostCard 
                    key={post._id} 
                    post={post} 
                    showComments={true}
                    currentUser={user}
                  />
                ))
              )}
            </div>
            </div>
          )}

          {/* Comments Section - Only show on comments tab */}
          {activeTab === 'comments' && (
            <div className="comments-section">
              <div className="comments-header">
                <h2>Student Questions & Doubts</h2>
                <p>Respond to your students' questions and help them learn</p>
              </div>
              
              {commentsLoading ? (
                <div className="loading-comments">
                  <div className="loading-spinner"></div>
                  <p>Loading student questions...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💭</div>
                  <h3>No questions yet</h3>
                  <p>Students haven't asked any questions on your posts yet</p>
                </div>
              ) : (
                <div className="comments-list">
                  {comments.map(comment => (
                    <CommentCard 
                      key={comment._id} 
                      comment={comment} 
                      onReply={handleReplyToComment}
                      onDelete={handleDeleteComment}
                      currentUser={user}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Comment Card Component for Mentor Dashboard
function CommentCard({ comment, onReply, onDelete, currentUser }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || replySubmitting) return;

    try {
      setReplySubmitting(true);
      await onReply(comment._id, replyText.trim());
      setReplyText('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!window.confirm('Are you sure you want to delete this student\'s comment?')) {
      return;
    }
    
    try {
      await onDelete(comment._id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }
    
    try {
      const response = await commentsAPI.deleteReply(comment._id, replyId);
      // The parent component should handle updating the comment
      onReply(comment._id, null, response.comment);
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comment-card">
      <div className="comment-card-header">
        <div className="post-reference">
          <span className="post-title">📝 {comment.postId?.title || 'Post'}</span>
        </div>
        <span className="comment-date">{formatDate(comment.createdAt)}</span>
      </div>
      
      <div className="comment-main">
        <div className="student-info">
          <div className="student-avatar">
            {comment.userId?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
        <div className="student-details">
          <span className="student-name">{comment.userId?.name || 'Student'}</span>
          <span className="student-role">Student</span>
        </div>
        <button 
          className="delete-comment-btn"
          onClick={handleDeleteComment}
          title="Delete student's comment"
        >
          🗑️
        </button>
      </div>
      
      <div className="comment-content">
        <p className="comment-message">{comment.message}</p>
      </div>
      </div>

      {/* Existing Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-section">
          <h4>Your Replies:</h4>
          {comment.replies.map((reply, index) => (
            <div key={index} className="reply-item">
              <div className="reply-avatar">
                {reply.mentorId?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div className="reply-content">
                <div className="reply-header">
                  <span className="reply-author">{reply.mentorId?.name || 'You'}</span>
                  <span className="reply-time">{formatDate(reply.createdAt)}</span>
                  <button 
                    className="delete-reply-btn"
                    onClick={() => handleDeleteReply(reply._id)}
                    title="Delete reply"
                  >
                    🗑️
                  </button>
                </div>
                <p className="reply-text">{reply.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      <div className="reply-section">
        {!showReplyForm ? (
          <button 
            className="reply-button"
            onClick={() => setShowReplyForm(true)}
          >
            💬 Reply to Student
          </button>
        ) : (
          <form onSubmit={handleReplySubmit} className="reply-form">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your response to help the student..."
              className="reply-textarea"
              rows="3"
              disabled={replySubmitting}
            />
            <div className="reply-actions">
              <button 
                type="button" 
                onClick={() => setShowReplyForm(false)}
                className="reply-cancel"
                disabled={replySubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="reply-submit"
                disabled={replySubmitting || !replyText.trim()}
              >
                {replySubmitting ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
