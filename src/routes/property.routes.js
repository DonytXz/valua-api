const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { validatePropertyPayload } = require('../middleware/validator');
const { intakeLimiter } = require('../middleware/rateLimiter');

// GET /api/v1/properties - List properties with filtering & pagination
router.get('/', propertyController.getProperties);

// POST /api/v1/properties - Submit new valuation request (with rate limiting & validation)
router.post('/', intakeLimiter, validatePropertyPayload, propertyController.createProperty);

// GET /api/v1/properties/:id - Retrieve single property record
router.get('/:id', propertyController.getPropertyById);

module.exports = router;
