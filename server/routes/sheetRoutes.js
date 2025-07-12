const express = require('express');
const router = express.Router();
const sheetController = require('../controllers/sheetControllers');

// Crea una nuova scheda
router.post('/', sheetController.createSheet);

// Ottieni tutte le schede di un utente
router.get('/user/:userID', sheetController.getSheetsByUser);

// Ottieni una singola scheda per ID
router.get('/:id', sheetController.getSheetById);

// Aggiorna una scheda
router.put('/:id', sheetController.updateSheet);

// Elimina una scheda
router.delete('/:id', sheetController.deleteSheet);

module.exports = router;