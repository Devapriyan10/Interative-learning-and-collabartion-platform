import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import StudentChatbot from '../components/StudentChatbot';
import GamificationWidget from '../components/GamificationWidget';
import Leaderboard from '../components/Leaderboard';
import { postsAPI } from '../api/posts.js';
import api from '../api/client.js';
import './Dashboard.css';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'leaderboard', 'profile'
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
            <div className="user-gamification">
              <div className="user-level-badge">
                <span className="level-icon">⭐</span>
                <span className="level-text">L{user?.level || 1}</span>
              </div>
              <div className="user-points">
                <span className="points-value">{user?.points || 0}</span>
                <span className="points-label">pts</span>
              </div>
            </div>
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
            <p>Stay updated with your courses and earn rewards!</p>
          </div>

          {/* Tab Navigation */}
          <div className="dashboard-tabs">
            <button
              className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              <span className="tab-icon">📚</span>
              Feed
            </button>
            <button
              className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <span className="tab-icon">🏆</span>
              Leaderboard
            </button>
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="tab-icon">👤</span>
              My Stats
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'feed' && (
            <>
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
                  <div className="action-icon">🏆</div>
                  <h3>Leaderboard</h3>
                  <p>See where you rank among learners</p>
                  <button className="action-btn" onClick={() => setActiveTab('leaderboard')}>
                    View Rankings
                  </button>
                </div>

                <div className="action-card">
                  <div className="action-icon">📊</div>
                  <h3>My Stats</h3>
                  {/* <div className="action-icon">📊</div> */}
                  <p>Track your learning progress and achievements</p>
                  <button className="action-btn" onClick={() => setActiveTab('profile')}>
                    View Stats
                  </button>
                </div>

                <div className="action-card">
                  <div className="action-icon">🎯</div>
                  <h3>Achievements</h3>
                  <p>View your badges and milestones</p>
                  <button className="action-btn" onClick={() => setActiveTab('profile')}>
                    View Badges
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'leaderboard' && (
            <Leaderboard />
          )}

          {activeTab === 'profile' && (
            <GamificationWidget user={user} />
          )}
        </div>
      </main>

      {/* Study Buddy Chatbot - Only for students */}
      <StudentChatbot currentUser={user} />
    </div>
  );
}
