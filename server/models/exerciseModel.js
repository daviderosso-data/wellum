// xerciseModel
// This file defines the Exercise model for the application.

const mongoose = require('mongoose')

const ExerciseSchema = new mongoose.Schema({ 
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: false
  },
  group: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

module.exports = mongoose.model('Exercise', ExerciseSchema)