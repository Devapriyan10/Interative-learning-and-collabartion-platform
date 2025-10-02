import { getLeaderboard } from '../utils/gamification.js';
import { User } from '../models/User.js';

// Get leaderboard
export const getLeaderboardData = async (req, res) => {
  try {
    const { limit = 10, role } = req.query;
    const leaderboard = await getLeaderboard(parseInt(limit), role);

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard', error: error.message });
  }
};

// Get user rank
export const getUserRank = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const user = await User.findById(userId).select('name email role points level');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's rank
    const higherRankedCount = await User.countDocuments({
      points: { $gt: user.points }
    });

    const rank = higherRankedCount + 1;

    // Get total users
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      rank,
      totalUsers,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user rank', error: error.message });
  }
};

// Get user's badges
export const getUserBadges = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const user = await User.findById(userId).select('badges name email avatar');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      badges: user.badges || [],
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch badges', error: error.message });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const user = await User.findById(userId)
      .select('name email avatar role points level badges stats enrolledCourses completedCourses studyGroups');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate progress to next level
    const currentPoints = user.points || 0;
    const currentLevel = user.level || 1;
    const nextLevelPoints = getNextLevelPoints(currentLevel);
    const currentLevelPoints = getCurrentLevelPoints(currentLevel);
    const pointsToNextLevel = nextLevelPoints - currentPoints;
    const levelProgress = ((currentPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      },
      gamification: {
        points: user.points || 0,
        level: user.level || 1,
        pointsToNextLevel,
        levelProgress: Math.round(levelProgress),
        badges: user.badges || [],
        badgeCount: user.badges?.length || 0
      },
      stats: user.stats || {},
      learning: {
        enrolledCourses: user.enrolledCourses?.length || 0,
        completedCourses: user.completedCourses?.length || 0,
        studyGroups: user.studyGroups?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user stats', error: error.message });
  }
};

// Helper functions
function getCurrentLevelPoints(level) {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];
  return thresholds[level - 1] || 0;
}

function getNextLevelPoints(level) {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000, 10000];
  return thresholds[level] || thresholds[thresholds.length - 1];
}
