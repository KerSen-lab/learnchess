import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  whitePlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blackPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timeControl: {
    initialTime: Number,
    increment: Number
  },
  result: {
    type: String,
    enum: ['white', 'black', 'draw', 'pending'],
    default: 'pending'
  },
  pgn: String,
  moves: [String],
  fen: [String],
  openingName: String,
  openingEco: String,
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'abandoned'],
    default: 'ongoing'
  },
  analysisRequested: { type: Boolean, default: false },
  analysis: {
    bestMoves: [Object],
    mistakes: [Object],
    blunders: [Object],
    comments: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date
});

export default mongoose.model('Game', gameSchema);
