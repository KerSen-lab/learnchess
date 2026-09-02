import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers following', 'username avatar');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

router.get('/search/:username', async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.username, $options: 'i' }
    }).select('-password').limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search users', error: error.message });
  }
});

router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { bio, avatar, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

router.post('/follow/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const targetUser = await User.findById(req.params.userId);

    if (!user.following.includes(req.params.userId)) {
      user.following.push(req.params.userId);
      targetUser.followers.push(req.userId);
      await user.save();
      await targetUser.save();
    }

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to follow user', error: error.message });
  }
});

router.get('/leaderboard/rating', async (req, res) => {
  try {
    const { format = 'blitz' } = req.query;
    const users = await User.find()
      .select(`-password username avatar rating.${format} stats`)
      .sort({ [`rating.${format}`]: -1 })
      .limit(100);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
});

export default router;
