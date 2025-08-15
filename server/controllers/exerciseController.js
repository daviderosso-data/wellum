const Exercise = require('../models/exerciseModel')

// Crea nuovo esercizio
exports.createExercise = async (req, res) => {
  const { name, imageUrl, description } = req.body

  const exercise = new Exercise({ name, imageUrl, description, })
  await exercise.save()
  console.log(JSON.stringify(req.body, null, 2));
  res.json(exercise)
}
exports.createExerciseWithImage = async ({ name, description, imageUrl, group, videoUrl }) => {
  const exercise = new Exercise({ name, description, imageUrl, group, videoUrl });
  await exercise.save();
  return exercise;
};

// Lista tutti gli esercizi
exports.getExercises =  async (req, res) => {
  const exercises = await Exercise.find()
  res.json(exercises)
}

// Dettaglio di un esercizio
exports.getExerciseById = async (req, res) => {
  const exercise = await Exercise.findById(req.params.id)
  res.json(exercise)
}

// Modifica esercizio
exports.updateExercise = async (req, res) => {
  const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(exercise)
}

// Cancella esercizio
exports.deleteExercise = async (req, res) => {
  try {
    // Verifica che l'utente sia autenticato
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    console.log("Eliminazione esercizio richiesta da:", req.auth.userId);
    
    // Procedi con la cancellazione
    const result = await Exercise.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Esercizio non trovato' });
    }
    
    res.status(200).json({ message: 'Esercizio eliminato con successo' });
  } catch (error) {
    console.error("Errore eliminazione esercizio:", error);
    res.status(500).json({ error: "Errore durante l'eliminazione dell'esercizio" });
  }
};