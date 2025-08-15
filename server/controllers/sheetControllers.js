const Sheet = require('../models/sheetModel');

// Crea una nuova scheda
exports.createSheet = async (req, res) => {
  try {
    // Verifica che l'utente sia autenticato
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    // Usa l'ID dell'utente autenticato anziché quello fornito nella richiesta
    const userID = req.auth.userId;
    
    if (req.body.exercises) {
      req.body.exercises = req.body.exercises.map(ex => ({
        ...ex,
        serie: ex.serie !== undefined ? Number(ex.serie) : 1 
      }));
    }
    
    const sheet = new Sheet({
      ...req.body,
      userID // Mantiene l'ID dell'utente autenticato
    });
    
    console.log("Creazione scheda per utente:", userID);
    console.log("Payload ricevuto:", JSON.stringify(req.body, null, 2));
    
    await sheet.save();
    res.status(201).json(sheet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Ottieni tutte le schede dell'utente autenticato
exports.getSheetsByUser = async (req, res) => {
  try {
    // Verifica che l'utente sia autenticato
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    // Usa l'ID dell'utente autenticato, ignorando il parametro dell'URL
    const userID = req.auth.userId;
    
    // Controlla se l'utente sta tentando di accedere alle schede di qualcun altro
    if (req.params.userID && req.params.userID !== userID) {
      console.warn(`Tentativo di accesso alle schede di un altro utente.  Autenticato: ${userID}`);
    }
    
    // Recupera solo le schede dell'utente autenticato
    const sheets = await Sheet.find({ userID });
    res.json(sheets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ottieni una singola scheda per ID
exports.getSheetById = async (req, res) => {
  try {
    // Verifica che l'utente sia autenticato
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    const userID = req.auth.userId;
    const sheet = await Sheet.findById(req.params.id);
    
    if (!sheet) return res.status(404).json({ error: 'Scheda non trovata' });
    
    // Verifica che la scheda appartenga all'utente autenticato
    if (sheet.userID !== userID) {
      console.warn(`Tentativo di accesso a una scheda di un altro utente.  Richiedente: ${userID}`);
      return res.status(403).json({ error: 'Non sei autorizzato ad accedere a questa scheda' });
    }
    
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Aggiorna una scheda
exports.updateSheet = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    const userID = req.auth.userId;
    
    const existingSheet = await Sheet.findById(req.params.id);
    if (!existingSheet) return res.status(404).json({ error: 'Scheda non trovata' });
    
    if (existingSheet.userID !== userID) {
      console.warn(`Tentativo di modifica di una scheda di un altro utente.Richiedente: ${userID}`);
      return res.status(403).json({ error: 'Non sei autorizzato a modificare questa scheda' });
    }
    
    console.log('Update sheet request received');
    console.log('Sheet ID:', req.params.id);
    console.log('Request body:', req.body);
    
    const updatedData = {
      ...req.body,
      userID: existingSheet.userID 
    };
    
    const sheet = await Sheet.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(sheet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Elimina una scheda
exports.deleteSheet = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    const userID = req.auth.userId;
    
    const existingSheet = await Sheet.findById(req.params.id);
    if (!existingSheet) return res.status(404).json({ error: 'Scheda non trovata' });
    
    if (existingSheet.userID !== userID) {
      console.warn(`Tentativo di eliminazione di una scheda di un altro utente. Richiedente: ${userID}`);
      return res.status(403).json({ error: 'Non sei autorizzato a eliminare questa scheda' });
    }
    
    const sheet = await Sheet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scheda eliminata' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};