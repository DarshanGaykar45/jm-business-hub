# JM BUSINESS HUB
**Official Enterprise Platform for Jay Malhar Udyog Samuha**  
*Contact Person:* Mr. Abhishek Satav

---

## 1. Overview & Business Divisions

JM Business Hub is a dedicated full-stack platform powering the operations, rentals, renewable energy projects, material supply, and lead capture for **Jay Malhar Udyog Samuha**.

The platform powers three business divisions:
1. **Jay Malhar Construction Equipments** (`construction`): Heavy soil compactors, earthmoving machinery, equipment rentals, availability tracking, maintenance, and return management.
2. **Sundatta Renewables** (`solar`): Residential, commercial, and agricultural solar rooftop installations, technical specifications, solar savings calculator, and government subsidy schemes.
3. **Jay Malhar Suppliers & Traders** (`suppliers`): Crushed stones, natural & manufactured sand, coarse aggregates, material quantity estimator (brass/ton/cft), and fleet logistics dispatch.  
*(Note: Business 3 was previously known as "Nawlai Suppliers & Traders". It has been permanently renamed to Jay Malhar Suppliers & Traders).*

---

## 2. Technology Stack & Architecture

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Hook Form, Zod, React Helmet Async.
- **Backend:** Node.js, Express, Prisma ORM, Argon2id/bcryptjs, JWT/Cookie sessions, Zod validation, Helmet, CORS.
- **Database:** Relational with Prisma (SQLite for instant zero-dependency local development; 1-line switch to PostgreSQL for production).
- **Security:** Strict separation of frontend and backend. Zero secrets in `frontend/`. Private documents stored in `backend/storage/private-documents/` and streamed only through authenticated and authorized endpoints.

---

## 3. Getting Started & Installation

### Prerequisites
- Node.js (v18.x or higher — tested on v24)
- npm (v9.x or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd "JM BUISSNESS HUB"
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 4. Environment Setup

### Backend
1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Open `backend/.env` and verify your configuration:
   - `PORT=5000`
   - `FRONTEND_URL=http://localhost:5173`
   - `DATABASE_URL="file:./dev.db"`
   - `JWT_SECRET=<min-32-character-secret>`
   - `JWT_REFRESH_SECRET=<min-32-character-secret>`
   - `COOKIE_SECRET=<min-32-character-secret>`

### Frontend
1. Copy the example environment file:
   ```bash
   cd frontend
   cp .env.example .env
   ```
2. Verify `VITE_API_URL=http://localhost:5000/api` (NO secrets belong in frontend).

---

## 5. Running the Application

In development mode, run both services:

### Terminal 1 — Backend:
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

### Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 6. Background Images Guide

You can easily supply your own background photos without touching any code!

### Drop-in Location
Drop your background image files into:
```
frontend/public/assets/backgrounds/
```

### File Names Required
| File Name | Slot / Purpose |
| :--- | :--- |
| `hero-home.jpg` | Main homepage hero banner |
| `construction.jpg` | Construction Equipment division hero |
| `solar.jpg` | Sundatta Renewables solar hero |
| `suppliers.jpg` | Jay Malhar Suppliers & Traders hero |
| `about.jpg` | About Us group banner |
| `contact.jpg` | Contact Us & Location banner |
| `cta.jpg` | Bottom lead capture strip banner |

### Image Optimization Guidelines
- **Dimensions:** Recommended max width of **1920px**.
- **Format:** High quality `.webp` or compressed `.jpg`.
- **File Size:** Keep each image **under 300 KB** for fast page loading.
- **Fail-Safe Fallback:** If an image is missing or loading, the platform renders a branded gradient fallback with an integrated dark overlay (`linear-gradient(rgba(14,26,45,.72), rgba(14,26,45,.55))`) ensuring text legibility and zero layout shift.

---

## 7. Replacing `[[PENDING]]` Client Placeholders

In accordance with strict client data integrity rules, no client data (phone, email, GST, PAN, bank details) is fabricated. All unverified details are marked as `[[PENDING]]` in:
```
backend/src/config/company.config.js
```

To update with real client details:
1. Open `backend/src/config/company.config.js`.
2. Replace:
   - `phone: "[[CLIENT_PHONE_PENDING]]"` &rarr; `phone: "+91 98XXXXXXXX"`
   - `email: "[[CLIENT_EMAIL_PENDING]]"` &rarr; `email: "contact@jaymalhar.com"`
   - `address: "[[CLIENT_ADDRESS_PENDING]]"` &rarr; `address: "Real Office Address, Maharashtra"`
   - `gstin: "[[GSTIN_PENDING]]"` &rarr; `gstin: "27XXXXXXXXXXXZX"`
   - `bank.name`, `bank.accountNumber`, `bank.ifsc` &rarr; Real banking details.
3. Save the file. The frontend automatically updates upon reload via the `/api/public/company-info` API.

---

## 8. Security & Storage Rules

- `.env` files are strictly ignored by `.gitignore`.
- Documents uploaded to the Document Vault reside in `backend/storage/private-documents/` and are **never** served statically. They are accessed exclusively via authenticated streaming (`GET /api/documents/:id/download`) with role and division scope checks.
