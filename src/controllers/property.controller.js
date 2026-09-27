const propertyService = require('../services/property.service');

const createProperty = async (req, res) => {
    try {
        const payload = req.sanitizedProperty;
        const result = await propertyService.createProperty(payload);

        return res.status(201).json({
            success: true,
            data: result,
            message: "Property appraisal request registered successfully."
        });
    } catch (error) {
        console.error("Controller Error - createProperty:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error while logging property valuation."
        });
    }
};

const getProperties = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
        const urgency = req.query.urgency;
        const search = req.query.search;

        const result = await propertyService.getProperties({ limit, offset, urgency, search });

        return res.status(200).json({
            success: true,
            count: result.items.length,
            total: result.total,
            limit: result.limit,
            offset: result.offset,
            data: result.items
        });
    } catch (error) {
        console.error("Controller Error - getProperties:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error while retrieving property directory."
        });
    }
};

const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await propertyService.getPropertyById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                error: `Property record with ID '${id}' not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error("Controller Error - getPropertyById:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error while retrieving property details."
        });
    }
};

module.exports = {
    createProperty,
    getProperties,
    getPropertyById
};
