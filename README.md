# Inventory & Order Management System

A full-stack production-ready system built with **FastAPI + React + PostgreSQL**, fully containerized with Docker.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| Frontend | React (Vite) |
| Database | PostgreSQL 15 |
| Container | Docker, Docker Compose |

---

## Quick Start (Local with Docker)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env and set a secure POSTGRES_PASSWORD
```

### 3. Run everything
```bash
docker compose up --build
```

### 4. Access the app
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── database/       # DB connection
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API route handlers
│   │   ├── schemas/        # Pydantic schemas
│   │   └── main.py         # FastAPI entry point
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Products, Customers, Orders
│   │   ├── services/       # API calls (axios)
│   │   └── App.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
├── docker-compose.yml
└── .env.example
```

---

## API Reference

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | /products/ | List all products |
| POST | /products/ | Create product |
| GET | /products/{id} | Get product by ID |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | /customers/ | List all customers |
| POST | /customers/ | Create customer |
| GET | /customers/{id} | Get customer by ID |
| DELETE | /customers/{id} | Delete customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | /orders/ | List all orders |
| POST | /orders/ | Create order (auto-reduces stock) |
| GET | /orders/{id} | Get order details |
| DELETE | /orders/{id} | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | /dashboard/ | Summary stats + low stock alerts |

---

## Business Logic

- ✅ SKU must be unique per product
- ✅ Customer email must be unique
- ✅ Product quantity cannot go negative
- ✅ Orders blocked if insufficient stock
- ✅ Order creation auto-reduces inventory
- ✅ Order cancellation restores stock
- ✅ Total order amount calculated by backend
- ✅ All inputs validated before processing

---

## Deployment Guide

### Backend → Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `DATABASE_URL` (from Render's PostgreSQL add-on)
6. Create a Render PostgreSQL database and copy the internal URL

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Settings:
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy!

### Push Backend Docker image to Docker Hub

```bash
# Build
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend

# Login
docker login

# Push
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

---

## Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set DB URL
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```
