const express = require('express');
const router = express.Router();
const sheetController = require('../controllers/sheetControllers');
const { requireAuth } = require('@clerk/express');


const authenticate = requireAuth({
  onError: (err, req, res, next) => {
    console.error('Errore autenticazione:', err);
    res.status(401).json({ error: 'Autenticazione richiesta' });
  }
});


// Crea una nuova scheda
router.post('/', authenticate, sheetController.createSheet);

// Ottieni tutte le schede di un utente
router.get('/user/:userID', authenticate, sheetController.getSheetsByUser);

// Ottieni una singola scheda per ID
router.get('/:id', authenticate, sheetController.getSheetById);

// Aggiorna una scheda
router.put('/:id', authenticate, sheetController.updateSheet);

// Elimina una scheda
router.delete('/:id', authenticate, sheetController.deleteSheet);

module.exports = router;