import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from collections import Counter
from datetime import datetime

def _parse_ts(t):
    try:
        return pd.to_datetime(t)
    except Exception:
        try:
            return datetime.fromisoformat(t)
        except Exception:
            return pd.NaT

def build_features(logs):
    if not logs:
        return pd.DataFrame()
    df = pd.DataFrame(logs)
    # required columns: ip, timestamp
    if "timestamp" not in df.columns:
        df["timestamp"] = pd.NaT
    df["ts"] = df["timestamp"].apply(_parse_ts)
    df["hour"] = df["ts"].dt.hour.fillna(-1).astype(int)
    # group by ip
    grouped = df.groupby("ip")
    rows = []
    for ip, g in grouped:
        attempts = len(g)
        unique_usernames = g["username"].nunique() if "username" in g.columns else 0
        unique_passwords = g["password"].nunique() if "password" in g.columns else 0
        avg_pw_len = float(g["password"].str.len().mean()) if "password" in g.columns and not g["password"].empty else 0.0
        # intervals
        times = sorted([t for t in g["ts"].tolist() if pd.notna(t)])
        intervals = []
        for i in range(1, len(times)):
            intervals.append((times[i] - times[i-1]).total_seconds())
        avg_interval = np.mean(intervals) if intervals else -1.0
        hour_entropy = 0.0
        if not g["hour"].empty:
            counts = np.array(list(Counter(g["hour"]).values()), dtype=float)
            p = counts / counts.sum()
            hour_entropy = float(-np.sum([x * np.log2(x) for x in p if x > 0.0]))
        rows.append({
            "ip": ip,
            "attempts": attempts,
            "unique_usernames": int(unique_usernames),
            "unique_passwords": int(unique_passwords),
            "avg_pw_len": float(avg_pw_len) if not np.isnan(avg_pw_len) else 0.0,
            "avg_interval": float(avg_interval),
            "hour_entropy": hour_entropy
        })
    feat = pd.DataFrame(rows)
    if feat.empty:
        return feat
    feat.fillna(-1.0, inplace=True)
    return feat

def detect_anomalies_and_clusters(logs, iso_contamination=0.05, n_clusters=3):
    feat = build_features(logs)
    if feat.empty:
        return {"anomalies": [], "clusters": {} , "summary": {}}
    features = feat[["attempts","unique_usernames","unique_passwords","avg_pw_len","avg_interval","hour_entropy"]].values
    # IsolationForest
    try:
        iso = IsolationForest(contamination=iso_contamination, random_state=42)
        iso.fit(features)
        scores = iso.decision_function(features)
        preds = iso.predict(features)  # -1 anomaly, 1 normal
    except Exception:
        scores = np.zeros(features.shape[0])
        preds = np.ones(features.shape[0])
    anomalies = []
    for i, ip in enumerate(feat["ip"].tolist()):
        anomalies.append({
            "ip": ip,
            "score": float(scores[i]),
            "is_anomaly": bool(preds[i] == -1),
            "attempts": int(feat.loc[feat["ip"]==ip, "attempts"].iloc[0])
        })
    # clustering
    k = min(max(1, n_clusters), feat.shape[0])
    try:
        km = KMeans(n_clusters=k, random_state=42)
        clusters = km.fit_predict(features)
    except Exception:
        clusters = [0] * feat.shape[0]
    cluster_map = {ip: int(cluster) for ip, cluster in zip(feat["ip"].tolist(), clusters)}
    # summary
    total_attacks = len(logs)
    unique_ips = feat.shape[0]
    top_offenders = feat.sort_values("attempts", ascending=False).head(10).to_dict(orient="records")
    # timeseries: attacks per hour
    df = pd.DataFrame(logs)
    if "timestamp" in df.columns:
        df["ts"] = df["timestamp"].apply(_parse_ts)
        df = df[df["ts"].notna()]
        df["hour"] = df["ts"].dt.strftime("%Y-%m-%d %H:00:00")
        timeseries = df.groupby("hour").size().to_dict()
    else:
        timeseries = {}
    return {
        "anomalies": anomalies,
        "clusters": cluster_map,
        "summary": {
            "total_attacks": int(total_attacks),
            "unique_ips": int(unique_ips),
            "top_offenders": top_offenders,
            "timeseries": timeseries
        }
    }
