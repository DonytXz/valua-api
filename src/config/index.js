const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:8080,https://donatoalvarez.dev,https://donytxz.github.io')
        .split(',')
        .map(o => o.trim()),
    storageDriver: process.env.STORAGE_DRIVER || 'file',
    rateLimit: {
        windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15) * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
    },
    firebase: {
        serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './serviceAccountKey.json',
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://property-valuator.firebaseio.com',
        projectId: process.env.FIREBASE_PROJECT_ID || 'property-valuator'
    }
};
