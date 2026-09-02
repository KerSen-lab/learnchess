import mongoose from 'mongoose';

const dailyTaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  tasks: [{
    taskType: {
      type: String,
      enum: ['puzzle', 'game', 'opening', 'lesson'],
      required: true
    },
    target: Number,
    completed: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    reward: { type: Number, default: 0 },
    rewardClaimed: { type: Boolean, default: false }
  }],
  totalReward: { type: Number, default: 0 },
  claimedReward: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('DailyTask', dailyTaskSchema);
