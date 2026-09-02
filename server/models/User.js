import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  rating: {
    bullet: { type: Number, default: 1200 },
    blitz: { type: Number, default: 1200 },
    rapid: { type: Number, default: 1200 },
    classical: { type: Number, default: 1200 }
  },
  stats: {
    totalGames: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 }
  },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  avatar: String,
  bio: String,
  dailyTasksCompleted: [{
    date: Date,
    tasks: [String]
  }],
  achievements: [String],
  followers: [mongoose.Schema.Types.ObjectId],
  following: [mongoose.Schema.Types.ObjectId],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
