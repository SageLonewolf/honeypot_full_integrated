Integration notes
-----------------

This project contains the backend (FastAPI) and the frontend source (React Vite) in the `frontend_source/` folder.

To run locally (development, two processes):
1. Start backend:
   cd backend/HoneyPot-main
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirement.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

2. Start frontend dev server:
   cd frontend_source
   npm install
   npm run dev

To serve frontend from backend (single unified deploy):
1. Build frontend:
   cd frontend_source
   npm install
   npm run build
   # This produces a `dist/` folder. Copy it to backend app static_site:
   rm -rf app/static_site
   mkdir -p app/static_site
   cp -r dist/* app/static_site/

2. Start backend:
   (activate venv)
   uvicorn app.main:app --host 0.0.0.0 --port 8000

The backend has been patched to add CORS middleware and will serve the built frontend from app/static_site when present.
