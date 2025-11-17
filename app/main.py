from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pathlib
from contextlib import asynccontextmanager
from app.routers import logs, analytics, actions, system

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Honeypot backend starting up...")
    yield
    print("🛑 Honeypot backend shutting down...")

app = FastAPI(
    title="Honeypot Intrusion Monitoring API",
    description="Backend API for the Honeypot Security Dashboard with GeoIP and ML analytics.",
    version="1.0.0",
    lifespan=lifespan
)



# Enable CORS for local frontend during development; when serving built frontend same-origin is used.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve built frontend (place build output in app/static_site)
_static_dir = pathlib.Path(__file__).parent.resolve() / "static_site"
if _static_dir.exists():
    app.mount("/", StaticFiles(directory=str(_static_dir), html=True), name="static")
else:
    # no built frontend present yet
    pass

app.include_router(logs.router, prefix="/api/logs", tags=["Logs"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(actions.router, prefix="/api/actions", tags=["Actions"])
app.include_router(system.router, prefix="/api/system", tags=["System"])

@app.get("/")
def root():
    return {"message": "Honeypot backend is running successfully 🚀"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
