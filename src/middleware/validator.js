const validatePropertyPayload = (req, res, next) => {
    const { address, name, email, phone, condition, urgency, coments, lat, lng } = req.body;
    const errors = [];

    // Address validation
    if (!address || typeof address !== 'string' || address.trim().length < 5) {
        errors.push("Property address is required and must be at least 5 characters.");
    }

    // Name validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
        errors.push("Client name is required and must be at least 2 characters.");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
        errors.push("A valid email address is required.");
    }

    // Phone validation
    const cleanPhone = String(phone || '').replace(/[^0-9+]/g, '');
    if (!phone || cleanPhone.length < 7) {
        errors.push("A valid phone number with at least 7 digits is required.");
    }

    // Coordinates validation
    const numLat = Number(lat);
    const numLng = Number(lng);
    if (isNaN(numLat) || numLat < -90 || numLat > 90) {
        errors.push("Latitude must be a valid number between -90 and 90.");
    }
    if (isNaN(numLng) || numLng < -180 || numLng > 180) {
        errors.push("Longitude must be a valid number between -180 and 180.");
    }

    // Condition validation
    const validConditions = ['Brand new', 'Very good', 'Good', 'Need work'];
    if (condition && !validConditions.includes(condition)) {
        errors.push(`Condition must be one of: ${validConditions.join(', ')}`);
    }

    // Urgency validation
    const validUrgencies = ['Immediately', 'Soon', 'I can wait', 'Only curious'];
    if (urgency && !validUrgencies.includes(urgency)) {
        errors.push(`Urgency must be one of: ${validUrgencies.join(', ')}`);
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: "Validation failed",
            details: errors
        });
    }

    // Sanitize values
    req.sanitizedProperty = {
        address: address.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        condition: condition || 'Standard',
        urgency: urgency || 'Flexible',
        coments: (coments || '').trim().substring(0, 1000),
        lat: numLat,
        lng: numLng
    };

    next();
};

module.exports = {
    validatePropertyPayload
};
