import mongoose from 'mongoose';

const openingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  eco: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  moves: [String],
  fen: [String],
  variations: [{
    name: String,
    moves: [String],
    description: String
  }],
  famousGames: [{
    white: String,
    black: String,
    year: Number,
    pgn: String
  }],
  statistics: {
    whiteWinRate: Number,
    drawRate: Number,
    blackWinRate: Number
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Opening', openingSchema);
