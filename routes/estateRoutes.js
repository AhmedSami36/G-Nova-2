const express = require('express');
const router = express.Router();
const estateController = require('../controllers/estateController');

// Get all states
router.get('/', estateController.getAllEstates);

// Get a state by ID
router.get('/:id', estateController.getEstateById);

// Create a new state
router.post('/', estateController.createEstate);

// Update a state
router.put('/:id', estateController.updateEstate);

// Delete a state
router.delete('/:id', estateController.deleteEstate);

module.exports = router;
