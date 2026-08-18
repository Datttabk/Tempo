# TEMPO - Personalised Cinematic Invitation-Video Platform MVP

**Tempo** is a complete, production-ready full-stack web application designed for creating high-resolution, personalized 4K vertical festival invitation videos for Ganesh Aagman, Ganesh Visarjan, and upcoming festival celebrations.

---

## 🌟 Key Product Features

1. **Clean, Pristine Master Videos (100% Deterministic)**:
   - Built using Telea inpainting algorithms to extract 100% clean backgrounds, golden banner textures, scroll parchments, light beams, and floor backgrounds. No sample text baked into master files.
2. **2 Active Templates + 8 "Coming Soon" Placeholders**:
   - `GANESH_AAGMAN_01`: Ganesh Aagman Invitation Video (25.43s).
   - `GANESH_VISARJAN_01`: Ganesh Visarjan Invitation Video (30.97s).
   - 8 Placeholder templates (`TEMPLATE_03` to `TEMPLATE_10`) displayed with distinct "Coming Soon" badges and disabled selection buttons.
3. **Dynamic 4K Video Rendering Engine**:
   - Generic Python OpenCV + PIL + FFmpeg renderer pipeline that dynamically fits user text, calculates keyframed timing slots, applies anti-aliased font rendering, fade-in / slide-up animations, drop shadows, and encodes to 4K (`2160x3840`) vertical MP4 at 30 FPS.
4. **Mandatory Confirmation & Payment Verification**:
   - Explicit confirmation checkbox required before payment (`[ ] I confirm that all entered information is correct`).
   - Payment abstraction layer with backend payment verification before render job creation.
5. **Centralized Pricing**:
   - Price configured centrally (`DEFAULT_PRICE_INR: 499`).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TailwindCSS, Vite, Lucide Icons, React Router.
- **Backend API**: FastAPI, Python 3.11, Pydantic v2, Uvicorn.
- **Database**: SQLite (Local) / PostgreSQL / Supabase with SQLAlchemy ORM.
- **Video Renderer**: Python OpenCV, Pillow, FFmpeg (with `h264_videotoolbox` hardware encoding on macOS & `libx264` on Cloud).
- **Payment Abstraction**: Pluggable Payment Gateway Layer (Mock Provider & Razorpay / Stripe adapters).
- **DevOps**: Docker, Docker Compose, Cloud Run, Nginx.

---

## 🚀 Quick Start (Local Execution)

### 1. Start Backend API Server
```bash
cd backend
python3 -m venv venv && source venv/bin/activate  # (Optional)
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend server runs at: `http://127.0.0.1:8000`
Health check: `http://127.0.0.1:8000/health`
Interactive API Docs: `http://127.0.0.1:8000/api/docs`

### 2. Start Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Application runs at: `http://localhost:3000`

---

## 🐳 Docker Deployment

To build and run the entire full-stack application using Docker Compose:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 📡 API Endpoints Summary

- `GET /health` - System availability, database, storage, and renderer status.
- `GET /api/templates` - List active & coming soon invitation templates.
- `GET /api/templates/{id}` - Fetch template configuration & field mapping rules.
- `POST /api/orders` - Create order (validates customer input length/word limits and confirmation).
- `GET /api/orders/{id}` - Retrieve order status and video download URL.
- `POST /api/payments/create` - Initiate payment session.
- `POST /api/payments/verify` - Backend verifies payment signature and queues render job.
- `GET /api/orders/{id}/video` - Stream & download final 4K rendered MP4 video.
