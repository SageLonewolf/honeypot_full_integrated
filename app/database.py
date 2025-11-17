import json
from pathlib import Path
from datetime import datetime, timedelta
import os

LOG_DIR = Path("app/static/logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)
BLOCKLIST_FILE = Path("app/static/blocklist.txt")
RETENTION_DAYS = 30  # change as needed

def _today_file():
    return LOG_DIR / f"{datetime.utcnow().strftime('%Y-%m-%d')}.json"

def read_all_logs():
    """Return flattened list of all logs (from daily JSONs)."""
    logs = []
    for p in sorted(LOG_DIR.glob("*.json")):
        try:
            with p.open("r") as f:
                data = json.load(f)
                if isinstance(data, list):
                    logs.extend(data)
        except Exception:
            continue
    return logs

def read_logs_by_date(date_str):
    """date_str = YYYY-MM-DD"""
    p = LOG_DIR / f"{date_str}.json"
    if not p.exists():
        return []
    with p.open("r") as f:
        try:
            return json.load(f)
        except Exception:
            return []

def write_log(entry: dict):
    """Append entry to today's log file (daily split)."""
    p = _today_file()
    if p.exists():
        try:
            with p.open("r") as f:
                data = json.load(f)
        except Exception:
            data = []
    else:
        data = []
    data.append(entry)
    with p.open("w") as f:
        json.dump(data, f, indent=2)
    cleanup_old_logs() 

def cleanup_old_logs(retention_days=RETENTION_DAYS):
    cutoff = datetime.utcnow() - timedelta(days=retention_days)
    for p in LOG_DIR.glob("*.json"):
        try:
            try:
                date_part = p.stem  # YYYY-MM-DD
                file_date = datetime.strptime(date_part, "%Y-%m-%d")
            except Exception:
                file_date = datetime.utcfromtimestamp(p.stat().st_mtime)
            if file_date < cutoff:
                p.unlink()
                print(f"[cleanup] removed {p.name}")
        except Exception as e:
            print("[cleanup] error", e)

def read_blocklist():
    if not BLOCKLIST_FILE.exists():
        return []
    with BLOCKLIST_FILE.open("r") as f:
        return [line.strip() for line in f if line.strip()]

def add_block(ip: str):
    bl = read_blocklist()
    if ip not in bl:
        with BLOCKLIST_FILE.open("a") as f:
            f.write(ip + "\n")
    return True

def remove_block(ip: str):
    bl = read_blocklist()
    bl = [i for i in bl if i != ip]
    with BLOCKLIST_FILE.open("w") as f:
        f.write("\n".join(bl) + ("\n" if bl else ""))
    return True
