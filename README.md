# AgriGuard AI — Crop Disease Classification & Farmer Advisory System

AgriGuard AI is a full-stack smart agriculture platform that uses Deep Learning (PyTorch MobileNetV2), an Express.js backend, and a modern React Vite frontend to detect plant leaf diseases and provide actionable treatment advisories in multiple Indian languages.

---

## Architecture Overview

1. **MongoDB** (`mongodb://127.0.0.1:27017/agriguard`) — Database for users, diseases, scans, and regional advisories.
2. **ML Service** (`http://localhost:8000`) — FastAPI service serving a PyTorch MobileNetV2 model (`crop_disease_model.pth`) across 18 plant disease classes.
3. **Backend API** (`http://localhost:5000`) — Node.js Express server handling auth, scan history, weather advisories, and forwarding images to the ML engine.
4. **Frontend Client** (`http://localhost:5173`) — React 18 + Vite + Tailwind CSS dashboard with camera upload, audio advisory playback, multi-language support (English, Hindi, Tamil, Telugu, Marathi), and admin analytics.

---

## Prerequisites

- **Node.js**: v18+ (tested on Node v22) & **npm**
- **Python**: 3.10+ with `pip`
- **MongoDB**: Running locally on port 27017 (or MongoDB Atlas connection string in `server/.env`)

---

## Quick Start (One-Click)

You can launch all 3 services at once using either:

- **Command Prompt / Windows Batch**: Double-click or run `start-all.bat`
- **PowerShell**: Run `./run-all.ps1`

---

## Step-by-Step Manual Startup

Open **3 separate terminal windows** (one for each service):

### Terminal 1: ML Microservice (FastAPI + PyTorch)
```powershell
cd ml
python main.py
```
> Runs on **http://localhost:8000**  
> Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)  
> Health Check: [http://localhost:8000/health](http://localhost:8000/health)

*(If you ever need to reinstall Python dependencies: `pip install -r requirements.txt`)*

---

### Terminal 2: Backend API (Express.js)
```powershell
cd server
npm run dev
```
> Runs on **http://localhost:5000**  
> API Base: [http://localhost:5000/api](http://localhost:5000/api)  
> Server Health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(Optional) Seed Database with diseases, sample scans, and demo accounts:*
```powershell
cd server
npm run seed
```

---

### Terminal 3: Frontend Web Client (React + Vite)
```powershell
cd client
npm run dev
```
> Opens on **http://localhost:5173** (or `http://localhost:5173/` in your browser)

---

## Default Seeded Accounts

If you run `npm run seed` in the `server` folder, the following credentials are ready to use:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@agriguard.com` | `Admin@12345` | Full admin analytics, disease database management, advisory broadcasting |
| **Farmer** | `farmer@agriguard.com` | `Farmer@12345` | Crop scanning, disease diagnosis, weather dashboard, historical scans |

*(You can also click **Register** on the frontend to create a new farmer account at any time).*

---

## Environment Variables

### `server/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/agriguard
JWT_SECRET=agriguard_secure_production_secret_key_998877
WEATHER_API_KEY=your_openweather_api_key_here
ML_SERVICE_URL=http://127.0.0.1:8000
CLIENT_URL=http://localhost:5173
MAX_UPLOAD_SIZE_MB=15
```

---

## Verification & Health Check

Once all 3 terminals are up, you can verify:
1. `http://localhost:8000/health` → `{"status":"healthy","modelLoaded":true,"classesCount":18}`
2. `http://localhost:5000/api/health` → Shows database `connected` and ML service `healthy`
3. `http://localhost:5173` → Displays AgriGuard AI dashboard UI
