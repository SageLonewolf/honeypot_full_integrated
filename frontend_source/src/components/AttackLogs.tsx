import React, { useEffect, useState } from "react";
import { Shield, Ban, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { getLogs, blockIP } from "../services/api"; // relative path from components/

type Log = {
  id?: string | number;
  ip?: string;
  timestamp?: string;
  username?: string;
  password?: string;
  attack_type?: string;
  attackType?: string; // some code uses camelCase
  country?: string;
  severity?: string;
};

const severityColors: Record<string, string> = {
  low: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  critical: "bg-red-500/20 text-red-400 border-red-500/50",
};

export default function AttackLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [blockedIps, setBlockedIps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getLogs();
        if (mounted) {
          // normalize keys if backend uses attack_type vs attackType
          const normalized = Array.isArray(data)
            ? data.map((l: any) => ({
                ...l,
                attackType: l.attackType || l.attack_type || "",
                timestamp: l.timestamp || l.time || l.date || "",
                severity: (l.severity || "low").toLowerCase(),
              }))
            : [];
          setLogs(normalized);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        if (mounted) setLogs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleBlockIp = async (ip?: string) => {
    if (!ip) return;
    try {
      await blockIP(ip);
      setBlockedIps((prev) => new Set(prev).add(ip));
    } catch (err) {
      console.error("Failed to block IP:", err);
    }
  };

  const markSafe = (ip?: string) => {
    if (!ip) return;
    setBlockedIps((prev) => {
      const next = new Set(prev);
      next.delete(ip);
      return next;
    });
  };

  const exportLogs = () => {
    const csv = logs
      .map((log) =>
        [
          log.ip || "",
          log.timestamp || "",
          log.username || "",
          log.password || "",
          (log.attackType || "").toString(),
          log.country || "",
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attack_logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="bg-black/40 border-green-500/30 p-6 text-green-400">
        Loading attack logs...
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-green-500/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2 text-green-400">
          <AlertTriangle className="h-5 w-5" />
          <span>Real-Time Attack Logs</span>
        </CardTitle>
        <Button
          onClick={exportLogs}
          variant="outline"
          size="sm"
          className="border-green-500/50 text-green-400 hover:bg-green-500/10"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow className="border-green-500/30">
                <TableHead className="text-green-400">IP Address</TableHead>
                <TableHead className="text-green-400">Timestamp</TableHead>
                <TableHead className="text-green-400">Username</TableHead>
                <TableHead className="text-green-400">Password</TableHead>
                <TableHead className="text-green-400">Attack Type</TableHead>
                <TableHead className="text-green-400">Location</TableHead>
                <TableHead className="text-green-400">Severity</TableHead>
                <TableHead className="text-green-400">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-green-300 p-4">
                    No logs found.
                  </TableCell>
                </TableRow>
              )}

              {logs.map((log, idx) => (
                <TableRow key={log.id ?? idx} className="border-green-500/20 hover:bg-green-500/5">
                  <TableCell className="font-mono text-blue-400">{log.ip || "-"}</TableCell>
                  <TableCell className="text-green-300">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-yellow-400">{log.username || "-"}</TableCell>
                  <TableCell className="text-red-400">{log.password || "-"}</TableCell>
                  <TableCell className="text-orange-400">{log.attackType || "-"}</TableCell>
                  <TableCell className="text-purple-400">{log.country || "Unknown"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={severityColors[log.severity || "low"]}>
                      {(log.severity || "low").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {blockedIps.has(log.ip || "") ? (
                        <Button
                          onClick={() => markSafe(log.ip)}
                          variant="outline"
                          size="sm"
                          className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleBlockIp(log.ip)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Ban className="h-3 w-3" />
                        </Button>
                      )}

                      <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                        <Shield className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
