import express from 'express';
import Puzzle from '../models/Puzzle.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/random', async (req, res) => {
  try {
    const { difficulty = 'intermediate' } = req.query;
    const puzzles = await Puzzle.find({ difficulty }).countDocuments();
    const random = Math.floor(Math.random() * puzzles);
    const puzzle = await Puzzle.findOne({ difficulty }).skip(random);

    res.json(puzzle);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch puzzle', error: error.message });
  }
});

router.get('/:puzzleId', async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.puzzleId);
    
    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    res.json(puzzle);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch puzzle', error: error.message });
  }
});

router.post('/:puzzleId/solve', verifyToken, async (req, res) => {
  try {
    const { correct } = req.body;
    const puzzle = await Puzzle.findById(req.params.puzzleId);
    
    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    if (correct) {
      puzzle.solves++;
      await puzzle.save();

      const user = await User.findById(req.userId);
      user.points += 10;
      user.stats.totalGames++;
      await user.save();

      res.json({ message: 'Puzzle solved!', points: 10 });
    } else {
      res.json({ message: 'Puzzle not solved', points: 0 });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to solve puzzle', error: error.message });
  }
});

export default router;
