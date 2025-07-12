// Definizione schema Exercise

const mongoose = require('mongoose')

const ExerciseSchema = new mongoose.Schema({ // Definizione dello schema per gli esercizi
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

// Esporto il modello
module.exports = mongoose.model('Exercise', ExerciseSchema)