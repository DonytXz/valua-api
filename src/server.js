const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(`Valua PropTech API running on port ${config.port}`);
    console.log(`Environment:    ${config.nodeEnv}`);
    console.log(`Storage Driver: ${config.storageDriver}`);
    console.log(`Health Check:   http://localhost:${config.port}/api/v1/health`);
    console.log(`===============================================`);
});

// Graceful shutdown
const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
        console.log('HTTP server closed cleanly.');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
