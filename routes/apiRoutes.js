// routes/apiRoutes.js

const express = require('express');
const router = express.Router();
const launchController = require('../controllers/launchController');
// const enrichController = require('../controllers/enrichController'); // Removed

// Define API routes
router.get('/launches', launchController.getLaunches);
// router.post('/enrich', enrichController.enrichData); // Removed

module.exports = router;