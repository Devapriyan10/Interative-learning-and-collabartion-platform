import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

// Point values for different actions
export const POINTS = {
  POST_CREATED: 50,
  COMMENT_POSTED: 10,
  REPLY_GIVEN: 15,
  COURSE_COMPLETED: 100,
  BADGE_EARNED: 200,
  DAILY_LOGIN: 5,
  STUDY_GROUP_JOINED: 20,
  HELPING_STUDENT: 25,
  FIRST_POST: 100,
  POST_LIKED: 5,
};

// Level thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, minPoints: 0 },
  { level: 2, minPoints: 100 },
  { level: 3, minPoints: 300 },
  { level: 4, minPoints: 600 },
  { level: 5, minPoints: 1000 },
  { level: 6, minPoints: 1500 },
  { level: 7, minPoints: 2100 },
  { level: 8, minPoints: 2800 },
  { level: 9, minPoints: 3600 },
  { level: 10, minPoints: 5000 },
];

// Badge definitions
export const BADGES = {
  FIRST_POST: {
    name: 'First Post',
    icon: '🎯',
    description: 'Created your first post'
  },
  HELPFUL_MENTOR: {
    name: 'Helpful Mentor',
    icon: '🌟',
    description: 'Answered 10 student questions'
  },
  ACTIVE_LEARNER: {
    name: 'Active Learner',
    icon: '📚',
    description: 'Posted 10 comments'
  },
  COURSE_MASTER: {
    name: 'Course Master',
    icon: '🎓',
    description: 'Completed 5 courses'
  },
  SOCIAL_BUTTERFLY: {
    name: 'Social Butterfly',
    icon: '🦋',
    description: 'Joined 3 study groups'
  },
  WEEKLY_WARRIOR: {
    name: 'Weekly Warrior',
    icon: '🔥',
    description: '7-day login streak'
  },
  KNOWLEDGE_SHARER: {
    name: 'Knowledge Sharer',
    icon: '💡',
    description: 'Created 5 posts'
  },
  EXPERT: {
    name: 'Expert',
    icon: '👑',
    description: 'Reached level 5'
  },
  TEAM_PLAYER: {
    name: 'Team Player',
    icon: '🤝',
    description: 'Active in study groups'
  },
  RISING_STAR: {
    name: 'Rising Star',
    icon: '⭐',
    description: 'Earned 500 points'
  }
};

/**
 * Award points to a user and update their level
 */
export async function awardPoints(userId, points, reason = '') {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const oldPoints = user.points || 0;
    const newPoints = oldPoints + points;
    user.points = newPoints;

    // Check for level up
    const oldLevel = user.level || 1;
    const newLevel = calculateLevel(newPoints);

    if (newLevel > oldLevel) {
      user.level = newLevel;

      // Create level up notification
      await createNotification({
        userId,
        type: 'achievement',
        title: `Level Up! 🎉`,
        message: `Congratulations! You've reached level ${newLevel}`,
        icon: '🎊'
      });

      // Award badge for reaching level 5
      if (newLevel === 5 && !hasBadge(user, 'EXPERT')) {
        await awardBadge(userId, 'EXPERT');
      }
    }

    await user.save();
    return { user, pointsAwarded: points, leveledUp: newLevel > oldLevel, newLevel };
  } catch (error) {
    console.error('Error awarding points:', error);
    return null;
  }
}

/**
 * Calculate user level based on points
 */
export function calculateLevel(points) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i].minPoints) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

/**
 * Award a badge to a user
 */
export async function awardBadge(userId, badgeKey) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const badge = BADGES[badgeKey];
    if (!badge) return null;

    // Check if user already has this badge
    if (hasBadge(user, badgeKey)) {
      return null;
    }

    // Add badge
    user.badges.push({
      name: badge.name,
      icon: badge.icon,
      description: badge.description,
      earnedAt: new Date()
    });

    // Award points for earning badge
    user.points = (user.points || 0) + POINTS.BADGE_EARNED;

    await user.save();

    // Create notification
    await createNotification({
      userId,
      type: 'badge',
      title: `New Badge Earned! ${badge.icon}`,
      message: `You've earned the "${badge.name}" badge: ${badge.description}`,
      icon: badge.icon
    });

    return badge;
  } catch (error) {
    console.error('Error awarding badge:', error);
    return null;
  }
}

/**
 * Check if user has a specific badge
 */
export function hasBadge(user, badgeKey) {
  const badge = BADGES[badgeKey];
  if (!badge) return false;
  return user.badges?.some(b => b.name === badge.name) || false;
}

/**
 * Update user stats
 */
export async function updateUserStats(userId, statType, increment = 1) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    if (!user.stats) {
      user.stats = {};
    }

    // Update the specific stat
    user.stats[statType] = (user.stats[statType] || 0) + increment;

    // Check for badge achievements based on stats
    await checkBadgeAchievements(user);

    await user.save();
    return user;
  } catch (error) {
    console.error('Error updating user stats:', error);
    return null;
  }
}

/**
 * Check and award badges based on user stats
 */
async function checkBadgeAchievements(user) {
  const stats = user.stats || {};

  // Check for specific achievements
  if (stats.postsCreated === 1 && !hasBadge(user, 'FIRST_POST')) {
    await awardBadge(user._id, 'FIRST_POST');
  }

  if (stats.postsCreated >= 5 && !hasBadge(user, 'KNOWLEDGE_SHARER')) {
    await awardBadge(user._id, 'KNOWLEDGE_SHARER');
  }

  if (stats.commentsPosted >= 10 && !hasBadge(user, 'ACTIVE_LEARNER')) {
    await awardBadge(user._id, 'ACTIVE_LEARNER');
  }

  if (stats.questionsAnswered >= 10 && !hasBadge(user, 'HELPFUL_MENTOR')) {
    await awardBadge(user._id, 'HELPFUL_MENTOR');
  }

  if (stats.coursesCompleted >= 5 && !hasBadge(user, 'COURSE_MASTER')) {
    await awardBadge(user._id, 'COURSE_MASTER');
  }

  if (stats.studyGroupsJoined >= 3 && !hasBadge(user, 'SOCIAL_BUTTERFLY')) {
    await awardBadge(user._id, 'SOCIAL_BUTTERFLY');
  }

  if (stats.loginStreak >= 7 && !hasBadge(user, 'WEEKLY_WARRIOR')) {
    await awardBadge(user._id, 'WEEKLY_WARRIOR');
  }

  if (user.points >= 500 && !hasBadge(user, 'RISING_STAR')) {
    await awardBadge(user._id, 'RISING_STAR');
  }
}

/**
 * Update login streak
 */
export async function updateLoginStreak(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    if (!user.stats) {
      user.stats = {};
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = user.stats.lastLoginDate ? new Date(user.stats.lastLoginDate) : null;
    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0);
    }

    // Check if this is a new day
    if (!lastLogin || today.getTime() !== lastLogin.getTime()) {
      const dayDiff = lastLogin ? Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24)) : 0;

      if (dayDiff === 1) {
        // Consecutive day - increase streak
        user.stats.loginStreak = (user.stats.loginStreak || 0) + 1;
        await awardPoints(userId, POINTS.DAILY_LOGIN, 'Daily login');
      } else if (dayDiff > 1) {
        // Streak broken - reset to 1
        user.stats.loginStreak = 1;
        await awardPoints(userId, POINTS.DAILY_LOGIN, 'Daily login');
      } else {
        // First login ever
        user.stats.loginStreak = 1;
      }

      user.stats.lastLoginDate = today;

      // Check for weekly warrior badge
      if (user.stats.loginStreak >= 7 && !hasBadge(user, 'WEEKLY_WARRIOR')) {
        await awardBadge(userId, 'WEEKLY_WARRIOR');
      }

      await user.save();
    }

    return user;
  } catch (error) {
    console.error('Error updating login streak:', error);
    return null;
  }
}

/**
 * Create a notification
 */
async function createNotification(notificationData) {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit = 10, role = null) {
  try {
    const query = role ? { role } : {};
    const leaderboard = await User.find(query)
      .select('name email role points level badges avatar')
      .sort({ points: -1, level: -1 })
      .limit(limit);

    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
