import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import StudentChatbot from '../components/StudentChatbot';
import { postsAPI } from '../api/posts.js';
import api from '../api/client.js';
import './Dashboard.css';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
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

      // Load all posts
      const postsResponse = await postsAPI.getAllPosts();
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

  const handleCommentSubmit = (postId, comment) => {
    // This is handled by the PostCard component now
    // We could refresh the posts here if needed
    console.log('Comment submitted:', postId, comment);
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
              <div className="user-avatar student-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className="user-name">{user?.name || 'Student'}</span>
              <span className="user-role">Student</span>
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
            <h1>Student Dashboard</h1>
            <p>Stay updated with your courses and assignments</p>
          </div>

          {/* Course Feed */}
          <div className="posts-section">
            <div className="posts-header">
              <h2>Course Feed</h2>
              <div className="feed-stats">
                <span className="stat-item">
                  <span className="stat-number">{posts.length}</span>
                  <span className="stat-label">Posts</span>
                </span>
                <span className="stat-item">
                  <span className="stat-number">
                    {posts.reduce((total, post) => total + (post.comments?.length || 0), 0)}
                  </span>
                  <span className="stat-label">Comments</span>
                </span>
              </div>
            </div>
            
            <div className="posts-list">
              {posts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>No posts available</h3>
                  <p>Your mentors haven't posted anything yet. Check back later!</p>
                </div>
              ) : (
                posts.map(post => (
                  <PostCard 
                    key={post._id} 
                    post={post} 
                    showComments={true}
                    onCommentSubmit={handleCommentSubmit}
                    currentUser={user}
                  />
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="action-card">
              <div className="action-icon">📝</div>
              <h3>Assignments</h3>
              <p>View and submit your assignments</p>
              <button className="action-btn">View All</button>
            </div>
            
            <div className="action-card">
              <div className="action-icon">📊</div>
              <h3>Grades</h3>
              <p>Check your performance and grades</p>
              <button className="action-btn">View Grades</button>
            </div>
            
            <div className="action-card">
              <div className="action-icon">📅</div>
              <h3>Schedule</h3>
              <p>View upcoming classes and events</p>
              <button className="action-btn">View Schedule</button>
            </div>
          </div>
        </div>
      </main>

      {/* Study Buddy Chatbot - Only for students */}
      <StudentChatbot currentUser={user} />
    </div>
  );
}
