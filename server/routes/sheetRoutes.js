// sheetRoutes
// Routes for managing user sheets

const express = require('express');
const router = express.Router();
const sheetController = require('../controllers/sheetControllers');
const { requireAuth } = require('@clerk/express');

// Middleware for authentication
const authenticate = requireAuth({
  onError: (err, req, res, next) => {
    console.error('Errore autenticazione:', err);
    res.status(401).json({ error: 'Autenticazione richiesta' });
  }
});


// Create a new workout sheet
router.post('/', authenticate, sheetController.createSheet);

// get all workout sheets for the authenticated user
router.get('/user/:userID', authenticate, sheetController.getSheetsByUser);

// get a workout sheet by ID
router.get('/:id', authenticate, sheetController.getSheetById);

// update a workout sheet
router.put('/:id', authenticate, sheetController.updateSheet);

// delete a workout sheet
router.delete('/:id', authenticate, sheetController.deleteSheet);

module.exports = router;