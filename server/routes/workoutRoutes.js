const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

// Save a new workout
router.post('/', workoutController.createWorkout);

// Get all workouts for a user
router.get('/user/:userId', workoutController.getUserWorkouts);

router.delete('/:id', workoutController.deletWorkout);

module.exports = router;