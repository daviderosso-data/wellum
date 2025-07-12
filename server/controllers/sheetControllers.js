const Sheet = require('../models/sheetModel');

// Crea una nuova scheda
exports.createSheet = async (req, res) => {
  try {
    if (req.body.exercises) {
      req.body.exercises = req.body.exercises.map(ex => ({
        ...ex,
        serie: ex.serie !== undefined ? Number(ex.serie) : 1 // valore di default se manca
      }));
    }
    const sheet = new Sheet(req.body);
    console.log("Payload ricevuto:", JSON.stringify(req.body, null, 2));
    await sheet.save();
    res.status(201).json(sheet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Ottieni tutte le schede di un utente
exports.getSheetsByUser = async (req, res) => {
  try {
    const sheets = await Sheet.find({ userID: req.params.userID });
    res.json(sheets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ottieni una singola scheda per ID
exports.getSheetById = async (req, res) => {
  try {
    const sheet = await Sheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ error: 'Scheda non trovata' });
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Aggiorna una scheda
exports.updateSheet = async (req, res) => {
  try {
    console.log('Update sheet request received');
    console.log('Sheet ID:', req.params.id);
    console.log('Request body:', req.body);
    const sheet = await Sheet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sheet) return res.status(404).json({ error: 'Scheda non trovata' });
    res.json(sheet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Elimina una scheda
exports.deleteSheet = async (req, res) => {
  try {
    const sheet = await Sheet.findByIdAndDelete(req.params.id);
    if (!sheet) return res.status(404).json({ error: 'Scheda non trovata' });
    res.json({ message: 'Scheda eliminata' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};