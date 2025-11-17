// src/services/api.ts
const BASE = "http://127.0.0.1:8000/api";

export async function getLogs() {
  const res = await fetch(`${BASE}/logs/`);
  if (!res.ok) throw new Error(`Failed to fetch logs: ${res.status}`);
  return res.json();
}

export async function getAnalyticsSummary() {
  const res = await fetch(`${BASE}/analytics/summary`);
  if (!res.ok) throw new Error(`Failed to fetch analytics summary: ${res.status}`);
  return res.json();
}

export async function blockIP(ip: string) {
  const res = await fetch(`${BASE}/actions/block?ip=${encodeURIComponent(ip)}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Failed to block IP: ${res.status}`);
  return res.json();
}

export async function getSystemInfo() {
  const res = await fetch(`${BASE}/system/status`);
  if (!res.ok) throw new Error(`Failed to fetch system info: ${res.status}`);
  return res.json();
}

export async function getBlockedList() {
  const res = await fetch(`${BASE}/actions/blocklist`);
  if (!res.ok) throw new Error(`Failed to fetch blocklist: ${res.status}`);
  return res.json();
}

export async function getBlockedCount() {
  try {
    const data = await getBlockedList();
    if (Array.isArray(data)) return data.length;
    if (typeof data === "object" && data !== null && "count" in data) return Number((data as any).count) || 0;
    return Number(data) || 0;
  } catch (e) {
    console.warn("getBlockedCount error:", e);
    return 0;
  }
}

export default {
  getLogs,
  getAnalyticsSummary,
  blockIP,
  getSystemInfo,
  getBlockedList,
  getBlockedCount,
};
