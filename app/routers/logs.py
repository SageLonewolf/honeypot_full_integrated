from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.database import read_all_logs, read_logs_by_date, write_log
from datetime import datetime

router = APIRouter(tags=["Logs"])

@router.get("/")
def get_logs(date: Optional[str] = Query(None), ip: Optional[str] = Query(None), attack_type: Optional[str] = Query(None)):
    if date:
        logs = read_logs_by_date(date)
    else:
        logs = read_all_logs()
    if ip:
        logs = [l for l in logs if l.get("ip") == ip]
    if attack_type:
        logs = [l for l in logs if l.get("attack_type") and attack_type.lower() in l.get("attack_type", "").lower()]
    return logs

@router.post("/")
def add_log(entry: dict):
    # minimal validation
    if "ip" not in entry:
        raise HTTPException(status_code=400, detail="Missing ip")
    entry["timestamp"] = entry.get("timestamp", datetime.utcnow().isoformat())
    write_log(entry)
    return {"status": "ok", "entry": entry}
