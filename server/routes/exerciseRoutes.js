const express = require('express')
const router = express.Router()
const multer = require('multer');
const path = require('path');

const exerciseController = require('../controllers/exerciseController')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/foto'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Route per upload esercizio con immagine
// spsotare su Controller
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log(req.body)
    const { name, description, group, videoUrl } = req.body;
    const imageUrl = `http://localhost:3000/uploads/foto/${req.file.filename}`;
    const exercise = await exerciseController.createExerciseWithImage({ name, description, imageUrl, group, videoUrl });
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); // Insert login in controllers

// POST - crea nuovo esercizio
router.post('/', exerciseController.createExercise)

// GET - lista tutti gli esercizi
router.get('/', exerciseController.getExercises)

// GET - dettaglio esercizio
router.get('/:id', exerciseController.getExerciseById)

// PUT - modifica esercizio
router.put('/:id', exerciseController.updateExercise)

// DELETE - cancella esercizio
router.delete('/:id', exerciseController.deleteExercise)

module.exports = router