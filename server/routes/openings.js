import express from 'express';
import Opening from '../models/Opening.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { difficulty } = req.query;
    let query = {};
    
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const openings = await Opening.find(query).sort({ eco: 1 });
    res.json(openings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch openings', error: error.message });
  }
});

router.get('/:eco', async (req, res) => {
  try {
    const opening = await Opening.findOne({ eco: req.params.eco });
    
    if (!opening) {
      return res.status(404).json({ message: 'Opening not found' });
    }

    res.json(opening);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch opening', error: error.message });
  }
});

router.get('/search/:name', async (req, res) => {
  try {
    const openings = await Opening.find({
      $or: [
        { name: { $regex: req.params.name, $options: 'i' } },
        { eco: { $regex: req.params.name, $options: 'i' } }
      ]
    });

    res.json(openings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search openings', error: error.message });
  }
});

export default router;
