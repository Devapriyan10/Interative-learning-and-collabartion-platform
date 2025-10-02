import { useState, useEffect } from 'react';
import { gamificationAPI } from '../api/gamification';
import './GamificationWidget.css';

export default function GamificationWidget({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await gamificationAPI.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="gamification-widget loading">Loading...</div>;
  if (!stats) return null;

  const { gamification, stats: userStats, learning } = stats;

  return (
    <div className="gamification-widget">
      {/* Level & Points Display */}
      <div className="level-display">
        <div className="level-badge">
          <span className="level-number">{gamification.level}</span>
          <span className="level-label">Level</span>
        </div>
        <div className="points-info">
          <div className="points-current">{gamification.points} Points</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${gamification.levelProgress}%` }}
            ></div>
          </div>
          <div className="points-next">{gamification.pointsToNextLevel} to next level</div>
        </div>
      </div>

      {/* Badges Display */}
      <div className="badges-section">
        <h3>Badges ({gamification.badgeCount})</h3>
        <div className="badges-grid">
          {gamification.badges.slice(0, 6).map((badge, index) => (
            <div key={index} className="badge-item" title={badge.description}>
              <span className="badge-icon">{badge.icon}</span>
              <span className="badge-name">{badge.name}</span>
            </div>
          ))}
          {gamification.badgeCount > 6 && (
            <div className="badge-item more">
              <span className="badge-icon">+{gamification.badgeCount - 6}</span>
              <span className="badge-name">More</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{userStats.postsCreated || 0}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-value">{userStats.commentsPosted || 0}</div>
          <div className="stat-label">Comments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{learning.enrolledCourses || 0}</div>
          <div className="stat-label">Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{userStats.loginStreak || 0}</div>
          <div className="stat-label">Day Streak</div>
        </div>
      </div>
    </div>
  );
}
