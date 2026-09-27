const rateLimit = require('express-rate-limit');
const config = require('../config');

// Standard API rate limiter
const standardLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many requests from this IP address. Please try again later."
    }
});

// Strict intake limiter for property valuation intake submissions
const intakeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // max 20 appraisal requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Appraisal submission rate limit reached. Please wait before submitting more properties."
    }
});

module.exports = {
    standardLimiter,
    intakeLimiter
};
