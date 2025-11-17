from fastapi import APIRouter
from app.database import read_all_logs
from app.ml_analyzer import detect_anomalies_and_clusters

router = APIRouter()

@router.get("/summary")
def summary():
    logs = read_all_logs()
    total = len(logs)
    unique_ips = len(set([l.get("ip") for l in logs]))
    by_country = {}
    for l in logs:
        c = l.get("country", "Unknown")
        by_country[c] = by_country.get(c, 0) + 1
    return {"total_attacks": total, "unique_ips": unique_ips, "by_country": by_country}

@router.get("/insights")
def insights():
    logs = read_all_logs()
    return detect_anomalies_and_clusters(logs)
