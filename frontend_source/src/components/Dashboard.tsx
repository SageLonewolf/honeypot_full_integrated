// src/components/Dashboard.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Shield, AlertTriangle, Activity, TrendingUp, Globe, Zap } from "lucide-react";
import AttackLogs from "./AttackLogs";
import GeoMap from "./GeoMap";
import { getSystemInfo, getAnalyticsSummary, getLogs, getBlockedCount } from "../services/api";

type SystemInfo = {
  hostname?: string;
  uptime?: string | number;
  load?: number | null;
  memory?: { total?: number; used?: number } | null;
};

export default function Dashboard() {
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [logsCount, setLogsCount] = useState<number | null>(null);
  const [blockedCount, setBlockedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        getSystemInfo(),
        getAnalyticsSummary(),
        getLogs(),
        getBlockedCount(),
      ]);

      const [sysRes, analyticsRes, logsRes, blockedRes] = results;

      if (sysRes.status === "fulfilled") setSystem(sysRes.value);
      else setSystem(null);

      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value);
      else setAnalytics(null);

      if (logsRes.status === "fulfilled") {
        const logs = logsRes.value;
        setLogsCount(Array.isArray(logs) ? logs.length : (typeof logs === "number" ? logs : 0));
      } else {
        setLogsCount(null);
      }

      if (blockedRes.status === "fulfilled") {
        const bc = blockedRes.value;
        setBlockedCount(typeof bc === "number" ? bc : Number(bc) || 0);
      } else {
        setBlockedCount(null);
      }
    } catch (e) {
      console.error("fetchAll error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const totalAttacks = analytics?.total_attacks ?? 0;
  const uniqueIps = analytics?.unique_ips ?? 0;
  const systemLoad = typeof system?.load === "number" ? Math.round(Number(system.load)) : null;
  const blocked = blockedCount ?? 0;
  const logs = logsCount ?? 0;

  const pct = (n: number, denom: number) => {
    if (!denom || denom <= 0) return 0;
    const val = Math.round((n / denom) * 100);
    return Math.max(0, Math.min(100, val));
  };

  return (
    <div className="space-y-6">
      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-black/40 border-green-500/30 hover:border-green-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{totalAttacks}</div>
            <p className="text-xs text-green-500/70">Unique IPs: {uniqueIps}</p>
            <Progress value={pct(totalAttacks, Math.max(1, uniqueIps))} className="mt-3 bg-gray-800" />
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-green-500/30 hover:border-green-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Blocked IPs</CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{blocked}</div>
            <p className="text-xs text-green-500/70">Updated every 5s</p>
            <Progress value={pct(blocked, Math.max(1, blocked + 50))} className="mt-3 bg-gray-800" />
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-green-500/30 hover:border-green-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">System Load</CardTitle>
            <Activity className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{systemLoad !== null ? `${systemLoad}%` : "N/A"}</div>
            <p className="text-xs text-green-500/70">Host: {system?.hostname ?? "Unknown"}</p>
            <Progress value={systemLoad ?? 0} className="mt-3 bg-gray-800" />
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-green-500/30 hover:border-green-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Detection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">82.2%</div>
            <p className="text-xs text-green-500/70">Model stable</p>
            <Progress value={82} className="mt-3 bg-gray-800" />
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-red-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-400">
                {totalAttacks > 50 ? "High-Severity Attack Detected" : "Monitoring"}
              </h3>
              <p className="text-red-300">
                {totalAttacks > 50
                  ? "Coordinated brute force attack from multiple IPs detected."
                  : "System running normally."}
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge variant="destructive">{totalAttacks > 50 ? "CRITICAL" : "OK"}</Badge>
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                {loading ? "UPDATING" : "STABLE"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Honeypot Status & GeoMap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-black/40 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-400">
              <Globe className="h-5 w-5" />
              <span>Honeypot Network</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "SSH Honeypot", status: "online", attacks: 4 },
                { name: "HTTP Honeypot", status: "online", attacks: 2 },
                { name: "FTP Honeypot", status: "warning", attacks: 0 },
                { name: "Telnet Honeypot", status: "online", attacks: 0 },
                { name: "SMTP Honeypot", status: "offline", attacks: 0 },
              ].map((hp, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-black/60 rounded border border-green-500/20">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${hp.status === "online" ? "bg-green-400" : hp.status === "warning" ? "bg-yellow-400" : "bg-red-400"}`} />
                    <span className="text-green-300">{hp.name}</span>
                  </div>
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    {hp.attacks} attacks
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <GeoMap />
        </div>
      </div>

      {/* Recent Attack Logs */}
      <AttackLogs />
    </div>
  );
}
