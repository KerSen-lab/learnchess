import express from 'express';
import DailyTask from '../models/DailyTask.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/today', verifyToken, async (req, res) => {
  try {
    const today = new Date().toDateString();
    const dailyTask = await DailyTask.findOne({
      user: req.userId,
      date: { $gte: new Date(today), $lt: new Date(new Date(today).getTime() + 86400000) }
    });

    if (!dailyTask) {
      // Create default daily tasks
      const tasks = [
        { taskType: 'puzzle', target: 10, completed: 0, reward: 50 },
        { taskType: 'game', target: 1, completed: 0, reward: 30 },
        { taskType: 'opening', target: 1, completed: 0, reward: 20 }
      ];

      const newTask = new DailyTask({
        user: req.userId,
        date: new Date(),
        tasks,
        totalReward: 100
      });

      await newTask.save();
      return res.json(newTask);
    }

    res.json(dailyTask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch daily tasks', error: error.message });
  }
});

router.patch('/:taskId/complete', verifyToken, async (req, res) => {
  try {
    const { taskIndex } = req.body;
    const dailyTask = await DailyTask.findById(req.params.taskId);

    if (!dailyTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = dailyTask.tasks[taskIndex];
    if (task.completed < task.target) {
      task.completed++;
    }

    if (task.completed === task.target && !task.isCompleted) {
      task.isCompleted = true;
      dailyTask.totalReward = dailyTask.tasks
        .filter(t => t.isCompleted)
        .reduce((sum, t) => sum + t.reward, 0);
    }

    await dailyTask.save();
    res.json(dailyTask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete task', error: error.message });
  }
});

router.post('/:taskId/claim-reward', verifyToken, async (req, res) => {
  try {
    const dailyTask = await DailyTask.findById(req.params.taskId);

    if (!dailyTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const user = await User.findById(req.userId);
    const reward = dailyTask.tasks
      .filter(t => t.isCompleted && !t.rewardClaimed)
      .reduce((sum, t) => sum + t.reward, 0);

    user.points += reward;
    await user.save();

    dailyTask.claimedReward = true;
    dailyTask.tasks.forEach(t => t.rewardClaimed = true);
    await dailyTask.save();

    res.json({ message: 'Reward claimed', points: reward, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to claim reward', error: error.message });
  }
});

export default router;
