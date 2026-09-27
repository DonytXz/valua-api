const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const { standardLimiter } = require('./middleware/rateLimiter');
const apiV1Router = require('./routes');

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        if (config.corsOrigins.includes(origin) || config.corsOrigins.includes('*')) {
            return callback(null, true);
        }
        return callback(new Error(`Origin '${origin}' not permitted by CORS policy.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Body Parsing
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Global Rate Limiting
app.use(standardLimiter);

// Root landing info
app.get('/', (req, res) => {
    res.status(200).json({
        service: "Valua PropTech REST API",
        version: "1.0.0",
        docs: "/api/v1/health",
        endpoints: {
            health: "GET /api/v1/health",
            properties: "GET /api/v1/properties",
            submitValuation: "POST /api/v1/properties",
            propertyDetail: "GET /api/v1/properties/:id"
        }
    });
});

// API Routes
app.use('/api/v1', apiV1Router);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Application Error:", err.message);
    res.status(err.status || 500).json({
        success: false,
        error: config.nodeEnv === 'production' 
            ? "An unexpected internal server error occurred." 
            : err.message
    });
});

module.exports = app;
