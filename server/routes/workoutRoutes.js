// workoutRoutes
// Routes for managing user workouts

const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { requireAuth } = require('@clerk/express');

// Middleware for authentication
const authenticate = requireAuth({
  onError: (err, req, res, next) => {
    console.error('Errore autenticazione:', err);
    res.status(401).json({ error: 'Autenticazione richiesta' });
  }
});

// create a new workout
router.post('/', authenticate, workoutController.createWorkout);

// get all workouts for the authenticated user
router.get('/user/:userId', authenticate, workoutController.getUserWorkouts);

// get a workout by ID
router.get('/:id', authenticate, workoutController.getWorkoutById);

// update a workout
router.delete('/:id', authenticate, workoutController.deleteWorkout);

module.exports = router;