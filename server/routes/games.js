import express from 'express';
import Game from '../models/Game.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', verifyToken, async (req, res) => {
  try {
    const { opponentId, timeControl } = req.body;
    
    const game = new Game({
      whitePlayer: req.userId,
      blackPlayer: opponentId,
      timeControl: timeControl
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create game', error: error.message });
  }
});

router.get('/:gameId', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId)
      .populate('whitePlayer', 'username rating')
      .populate('blackPlayer', 'username rating');
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch game', error: error.message });
  }
});

router.get('/user/games', verifyToken, async (req, res) => {
  try {
    const games = await Game.find({
      $or: [
        { whitePlayer: req.userId },
        { blackPlayer: req.userId }
      ]
    })
      .populate('whitePlayer', 'username rating')
      .populate('blackPlayer', 'username rating')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch games', error: error.message });
  }
});

router.patch('/:gameId/move', verifyToken, async (req, res) => {
  try {
    const { move, fen } = req.body;
    const game = await Game.findByIdAndUpdate(
      req.params.gameId,
      {
        $push: { moves: move, fen: fen }
      },
      { new: true }
    );

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update move', error: error.message });
  }
});

router.patch('/:gameId/end', verifyToken, async (req, res) => {
  try {
    const { result } = req.body;
    const game = await Game.findByIdAndUpdate(
      req.params.gameId,
      {
        result,
        status: 'completed',
        endedAt: new Date()
      },
      { new: true }
    );

    // Update user statistics
    const whitePlayer = await User.findById(game.whitePlayer);
    const blackPlayer = await User.findById(game.blackPlayer);

    if (result === 'white') {
      whitePlayer.stats.wins++;
      blackPlayer.stats.losses++;
    } else if (result === 'black') {
      whitePlayer.stats.losses++;
      blackPlayer.stats.wins++;
    } else if (result === 'draw') {
      whitePlayer.stats.draws++;
      blackPlayer.stats.draws++;
    }

    whitePlayer.stats.totalGames++;
    blackPlayer.stats.totalGames++;

    await whitePlayer.save();
    await blackPlayer.save();

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Failed to end game', error: error.message });
  }
});

export default router;
