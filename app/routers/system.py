from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
def status():
    return {
        "honeypot_listeners": "running",
        "ml_engine": "available",
        "storage": "daily json logs",
    }
