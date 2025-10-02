import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { updateLoginStreak } from '../utils/gamification.js';

function generateToken(user) {
  const payload = { id: user._id.toString(), email: user.email, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function signup(req, res) {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, role are required' });
    }
    if (!['Mentor', 'Student'].includes(role)) {
      return res.status(400).json({ message: 'role must be Mentor or Student' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role });

    // Update login streak for first login
    await updateLoginStreak(user._id);

    const token = generateToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points || 0,
        level: user.level || 1
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function login(req, res) {
  try {
    console.log('Login attempt:', { body: req.body, ip: req.ip });

    const { email, password, role } = req.body || {};
    if (!email || !password || !role) {
      console.log('Missing required fields:', { email: !!email, password: !!password, role: !!role });
      return res.status(400).json({ message: 'email, password, role are required' });
    }
    if (!['Mentor', 'Student'].includes(role)) {
      console.log('Invalid role:', role);
      return res.status(400).json({ message: 'role must be Mentor or Student' });
    }

    console.log('Searching for user:', { email: email.toLowerCase(), role });
    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found, checking password');
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for user:', user.email);

    // Update login streak and award points
    await updateLoginStreak(user._id);

    const token = generateToken(user);

    // Get updated user data with points and level
    const updatedUser = await User.findById(user._id).select('-password');

    return res.status(200).json({
      token,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        points: updatedUser.points || 0,
        level: updatedUser.level || 1,
        avatar: updatedUser.avatar || ''
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function me(req, res) {
  try {
    const { id } = req.user || {};
    if (!id) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}


