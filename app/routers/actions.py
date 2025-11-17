from fastapi import APIRouter, HTTPException
from app.database import add_block, remove_block, read_blocklist, read_all_logs
from pathlib import Path

router = APIRouter()

@router.post("/block")
def block(ip: str):
    add_block(ip)
    return {"status":"blocked","ip":ip}

@router.post("/unblock")
def unblock(ip: str):
    remove_block(ip)
    return {"status":"unblocked","ip":ip}

@router.get("/blocklist")
def blocklist():
    return read_blocklist()

@router.get("/export")
def export_logs():
    # simple export: return all logs as JSON (frontend can trigger download)
    return read_all_logs()
