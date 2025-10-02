import { useState, useEffect } from 'react';
import { gamificationAPI } from '../api/gamification';
import './Leaderboard.css';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'Student', 'Mentor'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    loadMyRank();
  }, [filter]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { role: filter, limit: 20 } : { limit: 20 };
      const { data } = await gamificationAPI.getLeaderboard(params);
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRank = async () => {
    try {
      const { data } = await gamificationAPI.getUserRank();
      setMyRank(data);
    } catch (error) {
      console.error('Error loading rank:', error);
    }
  };

  const getRankMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>🏆 Leaderboard</h2>
        <p>Top performers in our learning community</p>
      </div>

      {/* My Rank Card */}
      {myRank && (
        <div className="my-rank-card">
          <div className="rank-badge">#{myRank.rank}</div>
          <div className="rank-info">
            <div className="rank-name">{myRank.user.name}</div>
            <div className="rank-stats">
              <span>{myRank.user.points} points</span>
              <span>•</span>
              <span>Level {myRank.user.level}</span>
              <span>•</span>
              <span>{myRank.totalUsers} total users</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Users
        </button>
        <button
          className={filter === 'Student' ? 'active' : ''}
          onClick={() => setFilter('Student')}
        >
          Students
        </button>
        <button
          className={filter === 'Mentor' ? 'active' : ''}
          onClick={() => setFilter('Mentor')}
        >
          Mentors
        </button>
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No users yet</h3>
          <p>Be the first to earn points!</p>
        </div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((user, index) => (
            <div key={user._id} className={`leaderboard-item rank-${index + 1}`}>
              <div className="rank-position">{getRankMedal(index)}</div>
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
              <div className="user-stats">
                <div className="stat">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-value">{user.points}</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">📊</span>
                  <span className="stat-value">L{user.level}</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">🏅</span>
                  <span className="stat-value">{user.badges?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
