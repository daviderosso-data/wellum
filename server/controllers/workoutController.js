const Workout = require('../models/workoutModel');

exports.createWorkout = async (req, res) => {
  try {
    // Verifica che l'utente sia autenticato
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    const workoutData = {
      ...req.body,
      userId: req.auth.userId 
    };
    
    console.log(`Creazione workout per utente ${req.auth.userId}`);
    
    const workout = new Workout(workoutData);
    await workout.save();
    res.status(201).json(workout);
  } catch (err) {
    console.error("Error creating workout:", err);
    res.status(400).json({ error: err.message });
  }
};

exports.getUserWorkouts = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    const userId = req.auth.userId;
    
    if (req.params.userId && req.params.userId !== userId) {
      console.warn(`Tentativo di accesso ai workout di un altro utente. Autenticato: ${userId}`);
    }
    
    const workouts = await Workout.find({ userId }).sort({ completedAt: -1 });
    res.json(workouts);
  } catch (err) {
    console.error("Error fetching workouts:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    const userId = req.auth.userId;
    
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout non trovato' });
    }
    
    if (workout.userId !== userId) {
      console.warn(`Tentativo di eliminazione di un workout di un altro utente. Richiedente: ${userId}`);
      return res.status(403).json({ error: 'Non sei autorizzato ad eliminare questo workout' });
    }
    
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workout eliminato con successo' });
  } catch (err) {
    console.error("Error deleting workout:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getWorkoutById = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    const userId = req.auth.userId;
    
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout non trovato' });
    }
    
    if (workout.userId !== userId) {
      console.warn(`Tentativo di accesso a un workout di un altro utente. Richiedente: ${userId}`);
      return res.status(403).json({ error: 'Non sei autorizzato ad accedere a questo workout' });
    }
    
    res.json(workout);
  } catch (err) {
    console.error("Error fetching workout:", err);
    res.status(500).json({ error: err.message });
  }
};