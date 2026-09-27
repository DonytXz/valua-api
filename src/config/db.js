const fs = require('fs');
const path = require('path');
const config = require('./index');

class DataStore {
    constructor() {
        this.driver = config.storageDriver;
        this.dataDir = path.join(__dirname, '../../data');
        this.dataFile = path.join(this.dataDir, 'properties.json');
        this.init();
    }

    init() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        if (!fs.existsSync(this.dataFile)) {
            // Seed with sample initial records
            const initialData = [
                {
                    id: "prop_demo_1",
                    address: "Av. Paseo de los Héroes 95, Zona Urbana Rio Tijuana, Tijuana, B.C.",
                    name: "Carlos Alvarez",
                    email: "carlos@example.com",
                    phone: "+52 (664) 123-4567",
                    condition: "Very good",
                    urgency: "Soon",
                    coments: "Prime corner commercial / residential zone, fully updated infrastructure.",
                    lat: 32.514946,
                    lng: -117.038246,
                    createdAt: new Date().toISOString()
                }
            ];
            fs.writeFileSync(this.dataFile, JSON.stringify(initialData, null, 2), 'utf-8');
        }
    }

    async readAll() {
        try {
            const raw = fs.readFileSync(this.dataFile, 'utf-8');
            return JSON.parse(raw);
        } catch (err) {
            console.error("Error reading JSON datastore:", err);
            return [];
        }
    }

    async writeAll(items) {
        try {
            fs.writeFileSync(this.dataFile, JSON.stringify(items, null, 2), 'utf-8');
            return true;
        } catch (err) {
            console.error("Error writing JSON datastore:", err);
            return false;
        }
    }

    async add(record) {
        const items = await this.readAll();
        items.unshift(record);
        await this.writeAll(items);
        return record;
    }

    async findById(id) {
        const items = await this.readAll();
        return items.find(item => item.id === id) || null;
    }
}

module.exports = new DataStore();
