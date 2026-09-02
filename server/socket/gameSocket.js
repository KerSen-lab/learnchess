import Game from '../models/Game.js';
import { Chess } from 'chess.js';

const activeGames = new Map();
const playerSockets = new Map();

export const setupGameSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-game', (gameId, userId) => {
      socket.join(`game-${gameId}`);
      playerSockets.set(userId, socket.id);

      if (!activeGames.has(gameId)) {
        activeGames.set(gameId, {
          chess: new Chess(),
          moves: [],
          players: {}
        });
      }

      io.to(`game-${gameId}`).emit('player-joined', { userId, socketId: socket.id });
    });

    socket.on('make-move', (gameId, move, userId) => {
      const game = activeGames.get(gameId);

      if (game && game.chess.moves().includes(move)) {
        try {
          game.chess.move(move);
          game.moves.push(move);

          io.to(`game-${gameId}`).emit('move-made', {
            move,
            fen: game.chess.fen(),
            moves: game.moves
          });
        } catch (error) {
          socket.emit('invalid-move', { error: error.message });
        }
      }
    });

    socket.on('end-game', (gameId, result) => {
      io.to(`game-${gameId}`).emit('game-ended', { result });
      activeGames.delete(gameId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      playerSockets.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          playerSockets.delete(userId);
        }
      });
    });
  });
};
