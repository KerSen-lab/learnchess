import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/games.js';
import userRoutes from './routes/users.js';
import puzzleRoutes from './routes/puzzles.js';
import openingRoutes from './routes/openings.js';
import analysisRoutes from './routes/analysis.js';
import dailyTaskRoutes from './routes/dailyTasks.js';
import { setupGameSocket } from './socket/gameSocket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.VITE_API_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnchess')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/puzzles', puzzleRoutes);
app.use('/api/openings', openingRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/daily-tasks', dailyTaskRoutes);

// Socket.io setup
setupGameSocket(io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
