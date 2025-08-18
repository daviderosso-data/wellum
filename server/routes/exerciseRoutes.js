// ExerciseRoutes
// This file defines the routes for managing exercises in the application.

const express = require('express')
const router = express.Router()
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('@clerk/express');

const exerciseController = require('../controllers/exerciseController')

// Middleware for authentication
const authenticate = requireAuth({
  onError: (err, req, res, next) => {
    console.error('Errore autenticazione:', err);
    res.status(401).json({ error: 'Autenticazione richiesta' });
  }
});

// Multer configuration for file uploads
// This will save uploaded images to the 'uploads/foto' directory with a timestamp in the filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/foto'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST - create new exercise with image upload
router.post('/upload', authenticate, upload.single('image'), async (req, res) => {
  try {
    console.log(req.body)
    const { name, description, group, videoUrl } = req.body;
    const imageUrl = `${process.env.URL_SERVER}/uploads/foto/${req.file.filename}`;
    const exercise = await exerciseController.createExerciseWithImage({ name, description, imageUrl, group, videoUrl });
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - create new exercise without image upload
router.post('/', authenticate, exerciseController.createExercise)

// GET - list all exercises
router.get('/', authenticate, exerciseController.getExercises)

// GET - details of a specific exercise by ID
router.get('/:id', authenticate, exerciseController.getExerciseById)

// PUT - update an existing exercise
router.put('/:id', authenticate, exerciseController.updateExercise)

// DELETE - delete an exercise
router.delete('/:id', authenticate, exerciseController.deleteExercise)

module.exports = router