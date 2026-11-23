# FoundIT — Universal Community Lost & Found Notice Board

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Tailwind%20CSS%20%7C%20Vite-0284c7.svg)](file:///client)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20Socket.IO-10b981.svg)](file:///server)
[![Maps](https://img.shields.io/badge/Geospatial-Leaflet%20%7C%20OpenStreetMap-2F6F4E.svg)](file:///client/src/components)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel%20Live-black.svg)](https://foundit-amber.vercel.app)
[![Railway Deployment](https://img.shields.io/badge/Deploy-Railway%20Live-blueviolet.svg)](https://ai-lost-and-found-client-production.up.railway.app)

**FoundIT** is an open, modern community lost-and-found board designed for neighborhoods, civic hubs, public transit networks, and municipal facilities. Built with an editorial warm-newsprint paper aesthetic, interactive OpenStreetMap geolocation, and a dual multimodal + proximity matching engine, FoundIT bridges the gap between those who lose belongings and those who find them—safely and privately.

---

## 🌐 Live Deployments

| Component | Platform | Live URL / Status |
| :--- | :--- | :--- |
| **Frontend Notice Board** | **Vercel** | [https://foundit-amber.vercel.app](https://foundit-amber.vercel.app) 🟢 |
| **Frontend Mirror** | **Railway** | [https://ai-lost-and-found-client-production.up.railway.app](https://ai-lost-and-found-client-production.up.railway.app) 🟢 |
| **Backend API & Sockets** | **Railway** | `ai-lost-and-found-server` (Project: `zealous-dedication`) 🟢 |
| **Database** | **Railway** | MongoDB Service (Project: `zealous-dedication`) 🟢 |
| **GitHub Repository** | **GitHub** | [https://github.com/likitha8276/foundit](https://github.com/likitha8276/foundit) 🟢 |

---

## ✨ Key Features & Architecture

### 1. Warm Editorial Notice Board Design
- **Paper & Carbon Ink Palette**: Custom cream newsprint background (`#F4EFE6`), carbon ink typography (`#1C1B19`), and rust red accents (`#D9531E`).
- **Physical Noticeboard Aesthetic**: Taped strips, slightly rotated paper notices, polaroid-style image previews, and rubber status stamps (`CLAIMED`, `FOUND`, `LOST`).
- **Universal Civic Focus**: 100% universal community notice board suitable for cities, transit lines, libraries, parks, and public plazas.

### 2. Leaflet & OpenStreetMap Geolocation Explorer
- **Interactive Dual Views**: Switch seamlessly between a high-density card notice feed and a full-bleed OpenStreetMap explorer.
- **Pin Dropping & Radius Selector**: Drop a GPS marker directly onto the map when posting, with an interactive radius slider ($100\text{ m} - 1000\text{ m}$) indicating the loss or discovery perimeter.
- **Civic Hub Geocoding**: Search and filter by landmark (e.g., Metro Station Concourse, Public Library, Central Plaza, City Park).

### 3. Dual Similarity & Proximity Matching Engine
- **Text & Visual Semantic Matching**: Evaluates item attributes, categories, and photographs using normalized embedding vectors.
- **Haversine Geographic Proximity**: Calculates real-world spherical distance between reported locations, weighting candidates that are physically close.
- **Instant Proximity Match Alert**: Pinning an item triggers real-time candidate detection and displays immediate match cards.

### 4. Privacy-First Claim & Exchange Workflow
- **Public Contact Masking**: Phone numbers and finder identities are concealed on public boards to prevent spam and fraud.
- **Distinguishing Proof Claim**: An owner claims an item by providing verifying details (e.g., lock-screen wallpaper, engraving, serial number, scratch marks).
- **Secure Contact Unlock**: Once verified, verified contact details are revealed directly to the legitimate owner.

### 5. Indian Localization Standard
- **Phone Number Format**: Localized to Indian standard (`+91 98765 43210`).
- **Representative Profiles**: Seeded with Indian community members (Priya Sharma, Ganga Raman, Siddharth M.) and `.in` email domains.
- **Transit & Civic Hubs**: Pre-populated with realistic metropolitan transit concourses and public amenities.

### 6. Zero-Downtime Standalone Resilience
- **Offline / Standalone Fallback**: If the cloud database or backend API is booting, cold-starting, or undergoing maintenance, the frontend automatically falls back to local storage and rich mock notices.
- **Resilient Registration & Demo Auth**: Sign-in with demo accounts or register new accounts instantly without being blocked by network timeouts.

---

## 🔑 Demo Credentials

Quick-login buttons are built directly into the [Sign In page](https://foundit-amber.vercel.app/login):

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Standard User** | `user1@lostfound.local` | `UserPass123!` | Report lost items, review proximity matches, submit verification claims |
| **System Admin** | `admin@lostfound.local` | `AdminPass123!` | Moderation queue, user management, audit trails, system performance metrics |

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: $\ge 18.0.0$
- **npm**: $\ge 9.0.0$
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/likitha8276/foundit.git
cd foundit
```

### 2. Install Dependencies
```bash
# Install root workspaces (server & client)
npm install
```

### 3. Start Backend Server
```bash
cd server
npm install
npm start
```
The server binds to port `5000` (`http://localhost:5000/api/health`).
*Note: If no external MongoDB daemon is active, local environments automatically spin up an embedded in-memory MongoDB instance.*

### 4. Start Frontend Client
```bash
cd ../client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Running with Docker Compose (Optional)

To launch the full stack (database, ML service, backend API, and client) in containers:

```bash
docker compose up --build
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)
- ML Microservice: [http://localhost:8000/health](http://localhost:8000/health)

---

## ☁️ Cloud Deployment Guide

### Deploying Frontend to Vercel
1. Import `likitha8276/foundit` repository in the [Vercel Dashboard](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Configure Environment Variables:
   - `VITE_API_URL`: Your live backend API URL (e.g. `https://<your-railway-backend>.up.railway.app/api`)
5. Deploy. Vercel automatically deploys to a global edge CDN (e.g., `https://foundit-amber.vercel.app`).

### Deploying Full Stack to Railway
1. Create a new Project in [Railway](https://railway.app).
2. Deploy the GitHub repository `likitha8276/foundit`. Railway will detect the `client` and `server` workspaces.
3. **Add Database**:
   - In Railway Canvas, click **+ Add** $\rightarrow$ **Database** $\rightarrow$ **MongoDB**.
4. **Configure `ai-lost-and-found-server`**:
   - Navigate to **Variables** tab in the server service.
   - Add reference variable:
     - `MONGO_URL` = `${{MongoDB.MONGO_URL}}`
   - Set `CLIENT_URL` = `https://<your-client-subdomain>.up.railway.app` (or `*` to allow all origins).
   - Set `JWT_SECRET` = `your-secure-random-jwt-string`.
5. **Configure `ai-lost-and-found-client`**:
   - In `client/vite.config.js`, `allowedHosts: true` is pre-configured to support Railway domain headers.
   - Under client Variables, set `VITE_API_URL` to your Railway server service URL with `/api`.

---

## 📋 Environment Variables Cheat Sheet

### Server (`server/.env` or Railway Variables)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for Express and Socket.IO server |
| `NODE_ENV` | `development` | Runtime environment (`production` or `development`) |
| `MONGO_URL` / `MONGODB_URI`| `mongodb://127.0.0.1:27017/lost-and-found` | MongoDB connection URI |
| `CLIENT_URL` | `http://localhost:5173` | Allowed frontend origin for CORS and WebSockets |
| `JWT_SECRET` | `super-secret-jwt-key-...` | Secret string for signing auth JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `ADMIN_EMAIL` | `admin@lostfound.local` | Initial system administrator email |
| `ADMIN_PASSWORD` | `AdminPass123!` | Initial administrator password |

### Client (`client/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `/api` | Base URL for backend REST API endpoints |
| `VITE_SOCKET_URL` | `http://localhost:5000` | Real-time WebSocket connection URL |

---

## 📡 Key API Endpoints

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health & database connectivity status |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive 7-day JWT |
| `GET` | `/api/auth/me` | User | Get current profile details |
| `GET` | `/api/items` | Public | List public notice records with masked contact info |
| `POST` | `/api/items` | User | Post lost or found item notice (supports photo upload) |
| `GET` | `/api/items/:id` | Public | Get notice record details and location |
| `GET` | `/api/items/:id/matches` | Owner / Admin | Retrieve top proximity & similarity candidates |
| `POST` | `/api/matches/:id/claim` | Owner | Submit ownership verification claim |
| `POST` | `/api/matches/:id/confirm` | Finder | Confirm claim and mark notice as `CLAIMED` |
| `GET` | `/api/admin/stats` | Admin | System counters (items, users, matches, claimed) |
| `GET` | `/api/admin/items` | Admin | Moderation feed of submitted notices |
| `PUT` | `/api/admin/items/:id/moderation`| Admin | Approve or remove notice record |
| `GET` | `/api/admin/audit-logs` | Admin | Immutable administrative action trail |

---

## 🛠️ Verification & Troubleshooting Checklist

1. **Why does Railway say "You have no collections"?**
   - Collections are auto-created when the server initializes and detects an empty database.
   - Ensure the `ai-lost-and-found-server` service has `MONGO_URL` configured with `${{MongoDB.MONGO_URL}}`. Once linked, the server auto-seeds demo notices and collections.
2. **"Blocked request. This host is not allowed" in Vite on Railway**:
   - Vite 6 restricts external Host headers by default. This is resolved by setting `server: { allowedHosts: true }` in `client/vite.config.js`.
3. **Session Refresh Loop on Login**:
   - The auth provider guards against infinite verification loops by preserving valid demo tokens without requiring an immediate `/auth/me` network request.
4. **Registration Resilience**:
   - If the backend is temporarily offline, registration automatically saves the user session to `localStorage` and redirects directly to the `/dashboard`, allowing continuous testing.

---

## 📄 License
This project is open-source and licensed under the [MIT License](file:///LICENSE).
