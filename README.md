# Valua PropTech REST API

A secure, production-ready Node.js & Express REST API for the **Valua** property valuation platform. Replaces direct client-side database connections with an enterprise-grade backend architecture.

---

## Features

- **Zero Client Database Exposure:** Database credentials and service account keys are stored server-side in `.env`, never exposed to the browser.
- **Enterprise Security:** Hardened with `helmet` HTTP headers, origin-whitelisted `cors`, and IP-based rate limiting via `express-rate-limit`.
- **Input Sanitization & Validation:** Validates physical addresses, geocoordinates, email patterns, phone formats, and conditions before logging records.
- **Privacy by Design:** Automatically masks Personally Identifiable Information (PII) on public endpoints.
- **Algorithmic Appraisal Scoring:** Generates automated preliminary valuation estimates server-side based on location and condition metrics.
- **Pluggable Storage:** Ships with a zero-setup persistent JSON datastore for development/testing, and supports Firebase Admin SDK for cloud deployments.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start the Server
```bash
# Production mode
npm start

# Development mode (with live reload)
npm run dev
```

The API will listen on port `5000` by default.

---

## Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status and uptime telemetry |
| `GET` | `/api/v1/properties` | List submitted appraisals (sanitized, with search/filter) |
| `POST` | `/api/v1/properties` | Submit new property for appraisal (rate limited) |
| `GET` | `/api/v1/properties/:id` | Retrieve single property record by ID |

For full request/response schemas, see [`REQUIREMENTS.md`](file:///c:/Users/CarlosDonatoAlvarezF/Proyects/valua-api/REQUIREMENTS.md).
