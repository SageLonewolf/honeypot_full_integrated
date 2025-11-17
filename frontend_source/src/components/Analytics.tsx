import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getAnalyticsSummary } from "../services/api";
import { Badge } from "./ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Brain, AlertTriangle, Activity } from "lucide-react";
import { useEffect, useState } from "react";

// Define backend data types
interface AnalyticsSummary {
  total_attacks: number;
  unique_ips: number;
  by_country: Record<string, number>;
}

interface CountryEntry {
  country: string;
  count: number;
}

export function Analytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await getAnalyticsSummary();
        setSummary(d);
      } catch (e) {
        console.error("Failed to fetch analytics:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return <div className="text-green-400 p-4">Loading analytics...</div>;
  if (!summary)
    return <div className="text-red-400 p-4">No analytics data available.</div>;

  // ✅ Typed transformation for chart data
  const countryData: CountryEntry[] = Object.entries(summary.by_country || {}).map(
    ([country, count]) => ({
      country,
      count: Number(count) || 0,
    })
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Card className="bg-black/40 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-400">
            <Brain className="h-5 w-5" />
            <span>AI-Powered Security Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-500/10 p-4 rounded border border-green-500/30">
              <p className="text-green-400 text-sm">Total Attacks</p>
              <p className="text-2xl font-bold text-green-300">
                {summary.total_attacks ?? 0}
              </p>
            </div>

            <div className="bg-blue-500/10 p-4 rounded border border-blue-500/30">
              <p className="text-blue-400 text-sm">Unique IPs</p>
              <p className="text-2xl font-bold text-blue-300">
                {summary.unique_ips ?? 0}
              </p>
            </div>

            <div className="bg-yellow-500/10 p-4 rounded border border-yellow-500/30">
              <p className="text-yellow-400 text-sm">Active Honeypots</p>
              <p className="text-2xl font-bold text-yellow-300">8</p>
            </div>

            <div className="bg-purple-500/10 p-4 rounded border border-purple-500/30">
              <p className="text-purple-400 text-sm">ML Accuracy</p>
              <p className="text-2xl font-bold text-purple-300">94.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Distribution Pie Chart */}
      <Card className="bg-black/40 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400">Attacks by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={countryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ country, percent }: any) =>
                  `${country} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#10b981"
                dataKey="count"
              >
                {countryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"][
                        index % 5
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #10b981",
                  borderRadius: "8px",
                  color: "#10b981",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Attack Sources */}
      <Card className="bg-black/40 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400">Top Attack Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {countryData.length === 0 && (
              <div className="text-green-300">No data available.</div>
            )}
            {countryData.map((country, index) => (
              <div
                key={country.country}
                className="flex items-center justify-between p-3 bg-black/60 rounded border border-green-500/20"
              >
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className="border-green-500/50 text-green-400"
                  >
                    #{index + 1}
                  </Badge>
                  <span className="text-green-300">{country.country}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (country.count / countryData[0].count) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-green-400 min-w-[4rem] text-right">
                    {country.count.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
