const crypto = require('crypto');
const db = require('../config/db');

class PropertyService {
    // Generate an algorithmic valuation range based on condition and location
    calculateValuationEstimate(condition, lat, lng) {
        // Deterministic baseline seed based on spatial coordinates
        const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233)) * 43758.5453;
        const basePrice = 140000 + (Math.floor(seed % 160) * 1000); // 140k - 300k base

        let conditionMultiplier = 1.0;
        switch (condition) {
            case 'Brand new':
                conditionMultiplier = 1.25;
                break;
            case 'Very good':
                conditionMultiplier = 1.12;
                break;
            case 'Good':
                conditionMultiplier = 1.0;
                break;
            case 'Need work':
                conditionMultiplier = 0.82;
                break;
        }

        const estimatedVal = Math.round(basePrice * conditionMultiplier / 1000) * 1000;
        const low = Math.round(estimatedVal * 0.93 / 1000) * 1000;
        const high = Math.round(estimatedVal * 1.07 / 1000) * 1000;

        return {
            currency: "USD",
            estimatedMidpoint: estimatedVal,
            rangeLow: low,
            rangeHigh: high,
            confidence: "Automated Preliminary Geospatial Valuation"
        };
    }

    // Mask PII for public view
    maskPII(record) {
        const masked = { ...record };
        if (masked.email) {
            const parts = masked.email.split('@');
            if (parts.length === 2) {
                const name = parts[0];
                const domain = parts[1];
                masked.email = name.length > 2 
                    ? `${name[0]}***${name[name.length - 1]}@${domain}` 
                    : `*@${domain}`;
            }
        }
        if (masked.phone) {
            const p = masked.phone;
            masked.phone = p.length > 4 ? `***-***-${p.slice(-4)}` : '***';
        }
        return masked;
    }

    async createProperty(data) {
        const id = 'val_' + crypto.randomBytes(6).toString('hex');
        const estimate = this.calculateValuationEstimate(data.condition, data.lat, data.lng);

        const newRecord = {
            id,
            ...data,
            valuationEstimate: estimate,
            createdAt: new Date().toISOString()
        };

        await db.add(newRecord);
        return newRecord;
    }

    async getProperties({ limit = 20, offset = 0, urgency, search } = {}) {
        let items = await db.readAll();

        if (urgency && urgency !== 'ALL') {
            items = items.filter(i => (i.urgency || '').toLowerCase() === urgency.toLowerCase());
        }

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(i => 
                (i.address || '').toLowerCase().includes(q) ||
                (i.name || '').toLowerCase().includes(q)
            );
        }

        const total = items.length;
        const paginated = items.slice(offset, offset + limit);

        // Mask PII on public listing
        const sanitized = paginated.map(this.maskPII);

        return {
            items: sanitized,
            total,
            limit,
            offset
        };
    }

    async getPropertyById(id) {
        const item = await db.findById(id);
        if (!item) return null;
        return this.maskPII(item);
    }
}

module.exports = new PropertyService();
