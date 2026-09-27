# Valua Backend API: System Architecture & Requirements Specification

## 1. Context & Motivation

### 1.1 The Client-Side Firebase Problem
In the initial architecture of the client application (`valua-proptech`), the Firebase configuration was embedded directly in client-side code:
```javascript
var firebaseConfig = {
    apiKey: "AIzaSy_REDACTED_PROJECT_IDENTIFIER",
    authDomain: "property-valuator.firebaseapp.com",
    projectId: "property-valuator",
    ...
};
```
While Google's documentation states that Firebase Web API keys are client identifiers (not private secrets like database passwords), **direct client-to-database communication presents critical business and security liabilities**:

1. **Unrestricted Database Pollution:** Any visitor can open the browser developer console and execute arbitrary script queries:
   ```javascript
   firebase.firestore().collection("Properties").add({ address: "FAKE", ... });
   ```
   Without server validation, spam bots can exhaust Firestore write quotas and pollute the dataset.
2. **Customer Data Exposure:** If client-side read permissions are open for the public listing, anyone can query and scrape sensitive customer personal details (names, phone numbers, email addresses, property locations).
3. **Proprietary Logic Vulnerability:** Appraisal calculations, algorithms, and lead scoring formulas cannot be safely executed on the client without being completely exposed.
4. **Lack of Automated Workflows:** A pure client-side Firestore write cannot easily execute transaction validation, email confirmations (SendGrid/Resend), or CRM lead dispatch.

---

## 2. Target Architecture

```
┌─────────────────────────────────┐
│     Client Application          │
│    (valua-proptech SPA)         │
└────────────────┬────────────────┘
                 │  HTTPS (REST / JSON)
                 ▼
┌────────────────────────────────────────────────────────┐
│                   Valua API Service                    │
│                                                        │
│  [Helmet Security Headers]                             │
│  [CORS Origin Filter: donatoalvarez.dev]               │
│  [Rate Limiter: 20 req/15min on appraisal intake]     │
│  [Input Sanitizer & Joi/Zod Schema Validator]          │
│  [Automated Appraisal Estimation Scoring Engine]       │
│                                                        │
│  ┌───────────────────────┬──────────────────────────┐  │
│  │ File Persistence Driver│ Firebase Admin (Private) │  │
│  │ (Zero-config Dev/Test) │ (Production Service Key) │  │
│  └───────────────────────┴──────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Key Architectural Improvements:
- **Zero Frontend Secrets:** No Firebase keys, database URIs, or credentials exist in the client.
- **Server-Side Data Sanitization:** Strict payload validation checks address format, coordinate ranges, email validity, and phone formatting before writing anything.
- **Rate-Limiting Protection:** IP-based throttling protects endpoints against bot floods.
- **Data Privacy by Design:** The public endpoint (`GET /api/v1/properties`) strips private contact info (phones and emails) and returns only public property badges and appraisal estimates. Private contact info is restricted to authorized administrative requests.

---

## 3. API Specification & Endpoints

### Base URL: `/api/v1`

### 3.1 `POST /api/v1/properties`
Submit a new property for appraisal and valuation estimation.

#### Request Headers
- `Content-Type: application/json`

#### Request Body
```json
{
  "address": "Av. Paseo de los Héroes 95, Tijuana, B.C.",
  "name": "Maria Gonzalez",
  "email": "maria@example.com",
  "phone": "+52 (664) 123-4567",
  "condition": "Very good",
  "urgency": "Soon",
  "coments": "3 bedroom house, newly remodeled kitchen, 2 parking spaces.",
  "lat": 32.514946,
  "lng": -117.038246
}
```

#### Validation Rules
| Field | Rules |
| :--- | :--- |
| `address` | Required, string, min 5 chars, max 300 chars |
| `name` | Required, string, min 2 chars, max 100 chars, sanitized |
| `email` | Required, valid email format |
| `phone` | Required, string, min 7 chars, max 25 chars |
| `condition` | One of: `"Brand new"`, `"Very good"`, `"Good"`, `"Need work"` |
| `urgency` | One of: `"Immediately"`, `"Soon"`, `"I can wait"`, `"Only curious"` |
| `coments` | Optional, string, max 1000 chars |
| `lat` | Required, number between -90 and 90 |
| `lng` | Required, number between -180 and 180 |

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "val_9f81a7b2c0",
    "address": "Av. Paseo de los Héroes 95, Tijuana, B.C.",
    "condition": "Very good",
    "urgency": "Soon",
    "lat": 32.514946,
    "lng": -117.038246,
    "estimatedValueRange": {
      "currency": "USD",
      "low": 185000,
      "high": 215000,
      "confidence": "Automated Preliminary Estimate"
    },
    "createdAt": "2026-09-26T19:45:00.000Z"
  },
  "message": "Appraisal request logged and preliminary estimate generated."
}
```

---

### 3.2 `GET /api/v1/properties`
Retrieve property appraisals list (sanitized for public registry view).

#### Query Parameters
- `limit` (optional, default: 20, max: 100)
- `offset` (optional, default: 0)
- `urgency` (optional filter: `"Immediately"`, `"Soon"`, etc.)
- `search` (optional keyword search for address)

#### Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "data": [
    {
      "id": "val_9f81a7b2c0",
      "address": "Av. Paseo de los Héroes 95, Tijuana, B.C.",
      "condition": "Very good",
      "urgency": "Soon",
      "clientName": "M. Gonzalez",
      "lat": 32.514946,
      "lng": -117.038246,
      "createdAt": "2026-09-26T19:45:00.000Z"
    }
  ]
}
```

---

### 3.3 `GET /api/v1/properties/:id`
Retrieve full details of a specific appraisal file by ID.

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "val_9f81a7b2c0",
    "address": "Av. Paseo de los Héroes 95, Tijuana, B.C.",
    "name": "Maria Gonzalez",
    "email": "m***a@example.com",
    "phone": "+52 (664) ***-4567",
    "condition": "Very good",
    "urgency": "Soon",
    "coments": "3 bedroom house, newly remodeled kitchen, 2 parking spaces.",
    "lat": 32.514946,
    "lng": -117.038246,
    "createdAt": "2026-09-26T19:45:00.000Z"
  }
}
```

---

### 3.4 `GET /api/v1/health`
Health check and system telemetry.

#### Response (`200 OK`)
```json
{
  "status": "healthy",
  "service": "valua-api",
  "version": "1.0.0",
  "storageDriver": "file",
  "uptimeSeconds": 142
}
```

---

## 4. Security & Hardening Requirements

1. **Helmet Middleware:** Enables standard HTTP headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`).
2. **CORS Whitelisting:** Configured via `CORS_ORIGIN` env to reject requests from unapproved domains.
3. **Rate Limiting:**
   - Global: 100 requests per 15 minutes per IP.
   - Intake (`POST /properties`): 15 submissions per 15 minutes per IP.
4. **Environment Isolation:** All secret keys, private database paths, and API tokens are kept in `.env` and excluded via `.gitignore`.
5. **PII Masking:** Public endpoints mask phone numbers and emails to protect applicant privacy.
