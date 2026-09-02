import mongoose from 'mongoose';

const puzzleSchema = new mongoose.Schema({
  fen: {
    type: String,
    required: true
  },
  solution: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  theme: String,
  rating: {
    type: Number,
    default: 1500
  },
  description: String,
  source: String,
  solves: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Puzzle', puzzleSchema);
