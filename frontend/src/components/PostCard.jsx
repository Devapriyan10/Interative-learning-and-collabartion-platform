import { useState, useEffect } from 'react';
import { commentsAPI } from '../api/comments.js';
import './PostCard.css';

export default function PostCard({ post, showComments = false, onCommentSubmit, currentUser }) {
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load comments when comment section is opened
  useEffect(() => {
    if (showCommentSection && showComments) {
      loadComments();
    }
  }, [showCommentSection, showComments, post._id]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentsAPI.getPostComments(post._id);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const response = await commentsAPI.addComment(post._id, {
        message: newComment.trim()
      });
      
      setComments([response.comment, ...comments]);
      setNewComment('');
      
      if (onCommentSubmit) {
        onCommentSubmit(post._id, response.comment);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId, replyMessage) => {
    try {
      const response = await commentsAPI.addReply(commentId, {
        message: replyMessage
      });
      
      // Update the comment with the new reply
      setComments(comments.map(comment => 
        comment._id === commentId ? response.comment : comment
      ));
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentsAPI.deleteComment(commentId);
      // Remove the comment from the list
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      const response = await commentsAPI.deleteReply(commentId, replyId);
      // Update the comment with the updated replies
      setComments(comments.map(comment => 
        comment._id === commentId ? response.comment : comment
      ));
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

  const ReplyComponent = ({ comment }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replySubmitting, setReplySubmitting] = useState(false);

    const handleReplySubmit = async (e) => {
      e.preventDefault();
      if (!replyText.trim() || replySubmitting) return;

      try {
        setReplySubmitting(true);
        await handleReply(comment._id, replyText.trim());
        setReplyText('');
        setShowReplyForm(false);
      } catch (error) {
        console.error('Error submitting reply:', error);
      } finally {
        setReplySubmitting(false);
      }
    };

    const canDeleteReply = (reply) => {
      return currentUser?.role === 'Mentor' && reply.mentorId?._id === currentUser?.id;
    };

    return (
      <div className="reply-section">
        {comment.replies && comment.replies.map((reply, index) => (
          <div key={index} className="reply">
            <div className="reply-avatar">
              {reply.mentorId?.name?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div className="reply-content">
              <div className="reply-header">
                <span className="reply-author">{reply.mentorId?.name || 'Mentor'}</span>
                <span className="reply-time">{formatDate(reply.createdAt)}</span>
                {canDeleteReply(reply) && (
                  <button 
                    className="delete-reply-btn"
                    onClick={() => handleDeleteReply(comment._id, reply._id)}
                    title="Delete reply"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <p className="reply-text">{reply.message}</p>
            </div>
          </div>
        ))}
        
        {currentUser?.role === 'Mentor' && (
          <div className="reply-form-container">
            {!showReplyForm ? (
              <button 
                className="reply-btn"
                onClick={() => setShowReplyForm(true)}
              >
                Reply
              </button>
            ) : (
              <form onSubmit={handleReplySubmit} className="reply-form">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="reply-input"
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
                    disabled={replySubmitting}
                  >
                    {replySubmitting ? 'Sending...' : 'Reply'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {post.createdBy?.name?.charAt(0).toUpperCase() || 'M'}
          </div>
          <div className="author-info">
            <h4 className="author-name">{post.createdBy?.name || 'Mentor'}</h4>
            <span className="post-date">{formatDate(post.createdAt || new Date())}</span>
          </div>
        </div>
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-description">{post.content}</p>
        
        {post.fileUrl && (
          <div className="post-attachment">
            <div className="attachment-icon">📎</div>
            <a 
              href={post.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="attachment-link"
            >
              {post.fileName || 'View Attachment'}
            </a>
          </div>
        )}
      </div>

      {showComments && (
        <div className="post-actions">
          <button 
            className="comment-btn"
            onClick={() => setShowCommentSection(!showCommentSection)}
            disabled={loading}
          >
            💬 {loading ? 'Loading...' : `${comments.length} Comments`}
          </button>
        </div>
      )}

      {showCommentSection && (
        <div className="comment-section">
          {loading ? (
            <div className="loading-comments">Loading comments...</div>
          ) : (
            <>
              <div className="comments-list">
                {comments.map(comment => {
                  const canDeleteComment = 
                    (currentUser?.role === 'Student' && comment.userId?._id === currentUser?.id) ||
                    (currentUser?.role === 'Mentor' && post.createdBy?._id === currentUser?.id);

                  return (
                    <div key={comment._id} className="comment">
                      <div className="comment-avatar">
                        {comment.userId?.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.userId?.name || 'Student'}</span>
                          <span className="comment-time">{formatDate(comment.createdAt)}</span>
                          {canDeleteComment && (
                            <button 
                              className="delete-comment-btn"
                              onClick={() => handleDeleteComment(comment._id)}
                              title="Delete comment"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                        <p className="comment-text">{comment.message}</p>
                        <ReplyComponent comment={comment} />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {currentUser?.role === 'Student' && (
                <form onSubmit={handleCommentSubmit} className="comment-form">
                  <div className="comment-input-container">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="comment-input"
                      disabled={submitting}
                    />
                    <button 
                      type="submit" 
                      className="comment-submit"
                      disabled={submitting || !newComment.trim()}
                    >
                      {submitting ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
