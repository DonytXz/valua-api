const express = require('express');
const router = express.Router();
const propertyRoutes = require('./property.routes');
const config = require('../config');

// Health Check Endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'valua-api',
        version: '1.0.0',
        environment: config.nodeEnv,
        storageDriver: config.storageDriver,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// Property valuation endpoints
router.use('/properties', propertyRoutes);

module.exports = router;
