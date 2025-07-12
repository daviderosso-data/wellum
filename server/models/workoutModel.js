const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sheetId: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
  totalSeconds: { type: Number, required: true },
  exercises: [
    {
      exerciseId: String,
      repetitions: Number,
      weight: Number,
      notes: String,
    }
  ]
});

module.exports = mongoose.model('Workout', workoutSchema);