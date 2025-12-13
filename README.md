# JobAppTracker — Setup & Deployment Guide

Complete guide to scaffold, develop, and deploy JobAppTracker locally and to the cloud.

---

## Project Structure

```
jobapp/
├── backend/
│   ├── main.py                 # FastAPI app, routes, auth
│   ├── models.py               # SQLModel definitions
│   ├── parser.py               # JD & resume parsing (spaCy + rules)
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main app & routes
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Tailwind + global styles
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── .gitignore
├── docker-compose.yml          # Local dev (Postgres + Redis)
└── README.md                   # This file
```

---

## 0. Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.10+** (for backend)
- **Git**
- **Supabase account** (free tier) — [sign up](https://supabase.com)
- **Render or Fly.io account** (for deployment)

---

## 1. Clone & Setup Local Dev Environment

### 1.1 Clone repo & navigate

```bash
git clone https://github.com/yourusername/jobapp.git
cd jobapp
```

### 1.2 Create virtual env & install backend deps

```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
# or: venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

**Backend `requirements.txt`:**

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlmodel==0.0.14
sqlalchemy==2.0.25
pyjwt==2.8.1
python-dotenv==1.0.0
pydantic==2.5.3
httpx==0.26.0
psycopg2-binary==2.9.9
spacy==3.7.2
pdfminer.six==20221105
python-docx==0.8.11
```

### 1.3 Create `.env` file (backend)

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobapp
JWT_SECRET=your-super-secret-key-change-this
```

### 1.4 Set up frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

---

## 2. Local Development (Option A: Docker Compose)

### 2.1 Run Postgres locally with Docker Compose

**`docker-compose.yml`:**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: jobapp
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  pg_data:
```

```bash
docker-compose up -d
```

### 2.2 Run backend

```bash
cd backend
python main.py
# or: uvicorn main:app --reload
```

Backend will be live at `http://localhost:8000`. Check `http://localhost:8000/docs` for Swagger UI.

### 2.3 Run frontend (separate terminal)

```bash
cd frontend
npm run dev
```

Frontend will be live at `http://localhost:5173`.

---

## 2. Local Development (Option B: Supabase + Local Backend)

### 2.1 Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up.
2. Create a new project (choose `Free` tier).
3. Copy your **Database URL** and **Anon Key** from project settings.

### 2.2 Update `.env`

```env
DATABASE_URL=postgresql://postgres:[password]@db.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-key
```

### 2.3 Run backend & frontend

```bash
cd backend && python main.py
# Terminal 2:
cd frontend && npm run dev
```

Tables will auto-create on first run (via `SQLModel.metadata.create_all()`).

---

## 3. Deployment to Render

### 3.1 Prepare GitHub repo

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 3.2 Deploy backend to Render

1. Go to [render.com](https://render.com) and sign up.
2. Click **New → Web Service**.
3. Connect your GitHub repo.
4. Configure:
   - **Name:** `jobapp-api`
   - **Environment:** `Python 3`
   - **Build command:** `pip install -r backend/requirements.txt`
   - **Start command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`
5. Under **Environment**, add variables:
   - `DATABASE_URL` = your Supabase Postgres URL
   - `JWT_SECRET` = your secret key
6. **Deploy**.

### 3.3 Deploy frontend to Vercel (or Netlify)

**Option A: Vercel**

1. Go to [vercel.com](https://vercel.com) and sign up.
2. Click **Import Project** and select your GitHub repo.
3. Configure:
   - **Framework:** React
   - **Root Directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://jobapp-api.onrender.com`)
5. **Deploy**.

**Option B: Netlify**

Similar to Vercel. Site settings: set build command to `npm run build` and publish directory to `dist`.

### 3.4 Update CORS in backend

Once frontend is deployed, update `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Dev
        "https://jobapp.vercel.app",  # Production (change to your URL)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 4. Key Endpoints (Backend)

### Auth

- `POST /api/auth/signup` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (requires token)

### Jobs

- `POST /api/jobs` — Create job entry
- `GET /api/jobs` — List all jobs for user

### Health

- `GET /health` — Health check

---

## 5. Next Steps (Parser & Resume Upload)

Once core scaffold is working:

1. **Implement JD Parser** (`backend/parser.py`):
   - Extract title, company, location, salary, skills from raw JD text.
   - Use spaCy + regex for initial pass; optional LLM fallback.

2. **Resume Upload**:
   - Add `POST /api/resumes/upload` endpoint.
   - Extract text from PDF/DOCX using `pdfminer.six` & `python-docx`.
   - Store files in Supabase Storage.

3. **Advanced Features**:
   - Application status tracking.
   - Analytics & CSV export.
   - Background jobs (e.g., scheduled email reminders).

---

## 6. Environment Variables Reference

### Backend `.env`

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret-key
```

### Frontend `.env.local`

```env
VITE_API_URL=http://localhost:8000  # or production URL
```

---

## 7. Database Tables (Auto-created)

- `user` — User accounts
- `resume` — CV/resume versions
- `job` — Job postings
- `application` — User applications
- `activity` — Audit log (optional)

---

## Troubleshooting

**"Cannot connect to database"**
- Ensure `DATABASE_URL` is correct and Supabase project is active.
- Test connection: `psql <DATABASE_URL>`

**"CORS error when fetching API"**
- Update `CORS_ORIGINS` in `main.py` to include frontend URL.

**"Token invalid"**
- Ensure `JWT_SECRET` is the same on backend and frontend is storing token correctly.

---

## Support & Docs

- **FastAPI docs:** http://localhost:8000/docs
- **Supabase docs:** https://supabase.com/docs
- **Render docs:** https://render.com/docs
- **Vercel docs:** https://vercel.com/docs

---

**Happy coding! 🚀**