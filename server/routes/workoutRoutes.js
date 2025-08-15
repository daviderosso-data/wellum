const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { requireAuth } = require('@clerk/express');

const authenticate = requireAuth({
  onError: (err, req, res, next) => {
    console.error('Errore autenticazione:', err);
    res.status(401).json({ error: 'Autenticazione richiesta' });
  }
});

// Crea un nuovo workout ()
router.post('/', authenticate, workoutController.createWorkout);

router.get('/user/:userId', authenticate, workoutController.getUserWorkouts);

router.get('/:id', authenticate, workoutController.getWorkoutById);

router.delete('/:id', authenticate, workoutController.deleteWorkout);

module.exports = router;