const mongoose = require('mongoose');

const ExerciseItemSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true }, 
  serie: {type: Number, required: true },
  repetitions: { type: Number, required: true },
  weight: { type: Number, required: false },
  notes: { type: String, required: false }
});

const SheetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userID: { type: String, required: true },
  exercises: [ExerciseItemSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sheet', SheetSchema);