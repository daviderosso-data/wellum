const express = require('express')
const router = express.Router()
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('@clerk/express');

const exerciseController = require('../controllers/exerciseController')

const authenticate = requireAuth({
  onError: (err, req, res, next) => {
    console.error('Errore autenticazione:', err);
    res.status(401).json({ error: 'Autenticazione richiesta' });
  }
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/foto'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

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

// POST - crea nuovo esercizio
router.post('/', authenticate, exerciseController.createExercise)

// GET - lista tutti gli esercizi
router.get('/', authenticate, exerciseController.getExercises)

// GET - dettaglio esercizio
router.get('/:id', authenticate, exerciseController.getExerciseById)

// PUT - modifica esercizio
router.put('/:id', authenticate, exerciseController.updateExercise)

// DELETE - cancella esercizio
router.delete('/:id', authenticate, exerciseController.deleteExercise)

module.exports = router