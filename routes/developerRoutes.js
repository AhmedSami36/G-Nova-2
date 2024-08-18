const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developerController');

// Get all developers
router.get('/all-dev', developerController.getAllDevelopers);

// Get a developer by ID
router.get('/get-dev/:id', developerController.getDeveloperById);

// Create a new developer
router.post('/new-dev', developerController.createDeveloper);

// Update a developer
router.put('/update-dev/:id', developerController.updateDeveloper);

// Delete a developer
router.delete('/del-dev/:id', developerController.deleteDeveloper);

module.exports = router;
