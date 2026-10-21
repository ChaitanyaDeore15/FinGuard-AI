# FinGuard AI — Deployment Guide & Production Setup

This guide provides step-by-step instructions for running FinGuard AI locally on Windows, deploying to containerized environments (Docker), and configuring production database connections.

---

## 1. Local Development Setup (Windows)

### Prerequisites
- Python 3.11+ (Python 3.13 supported)
- Node.js 18+ (Node v22 LTS tested)
- Git for Windows

### Step 1: Clone & Environment Setup
```powershell
# Open PowerShell in the project directory
git clone <repository_url>
cd "FinGuard AI"

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 2: Install Backend Dependencies
```powershell
.\venv\Scripts\python -m pip install --upgrade pip
.\venv\Scripts\pip install -r backend\requirements.txt
```

### Step 3: Database Migration & Model Training
```powershell
cd backend

# Apply database migrations
..\venv\Scripts\alembic upgrade head

# Train ML pipelines on benchmark distributions
..\venv\Scripts\python -m app.ml.train_fraud
..\venv\Scripts\python -m app.ml.train_credit

# Seed sample transactions, accounts, and staff users
..\venv\Scripts\python -m app.seed.seed_data

cd ..
```

### Step 4: Frontend Installation & Build
```powershell
cd frontend
npm install
npm run build # Verifies TypeScript bundling
cd ..
```

### Step 5: Start Development Servers
Run each in a separate terminal:

**Terminal 1 (Backend API):**
```powershell
cd backend
..\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

**Terminal 2 (Frontend Client):**
```powershell
cd frontend
npm run dev
```
Client will be available at: `http://localhost:5173`

---

## 2. Docker & Container Deployment

### 2.1. Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential libgomp1 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && python -m app.ml.train_fraud && python -m app.ml.train_credit && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

### 2.2. Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 3. Production PostgreSQL Database Configuration

To connect FinGuard AI to a production PostgreSQL database, update the `DATABASE_URL` in your `.env` file:

```env
DATABASE_URL="postgresql://finguard_admin:Secr3tPassword@db.production.company.internal:5432/finguard_production"
```

Alembic will automatically detect the PostgreSQL dialect and generate native PostgreSQL DDL constraints, sequences, and composite indices.
