import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  Eye,
  FileText,
  RefreshCw,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loadPageViewStats,
  loadTotalPageViews,
  loadDailyPageViews,
  loadAllTimeDailyPageViews,
  loadTodayPageViews,
  type PageViewStat,
  type DailyViewStat,
} from "@/lib/content";

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-card/95 backdrop-blur-sm px-4 py-3 shadow-lg">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-1">{label}</p>
      <p className="font-display text-lg tabular-nums">{payload[0].value}</p>
      <p className="font-mono text-[10px] text-muted-foreground/60">page views</p>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  loading: boolean;
}) {
  return (
    <div className="saber-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-md saber-border flex items-center justify-center">
          <Icon className="h-4 w-4 text-saber-blue" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40">live</span>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-1">{label}</p>
        <p className="font-display text-3xl tabular-nums">
          {loading ? (
            <span className="text-muted-foreground/30 animate-pulse">…</span>
          ) : (
            typeof value === "number" ? value.toLocaleString() : value
          )}
        </p>
        {sub && <p className="text-xs text-muted-foreground/60 mt-1 font-mono">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Range selector ───────────────────────────────────────────────────────────

const RANGES = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "All", days: 0 },  // 0 = all time
];

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminAnalytics = () => {
  const [topPages, setTopPages] = useState<PageViewStat[]>([]);
  const [daily, setDaily] = useState<DailyViewStat[]>([]);
  const [total, setTotal] = useState(0);
  const [today, setToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState(30);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const load = useCallback(async (days: number, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const [pages, d, t, tod] = await Promise.all([
      loadPageViewStats(15),
      days === 0 ? loadAllTimeDailyPageViews() : loadDailyPageViews(days),
      loadTotalPageViews(),
      loadTodayPageViews(),
    ]);

    setTopPages(pages);
    setDaily(d);
    setTotal(t);
    setToday(tod);
    setLastRefreshed(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(range); }, [range, load]);

  const handleRefresh = () => load(range, true);

  const maxCount = topPages[0]?.count ?? 1;

  // Format date label for chart axis
  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Sparse tick — show every Nth label to avoid crowding
  const tickInterval = range === 7 ? 0 : range === 14 ? 1 : range === 30 ? 4 : Math.max(0, Math.floor(daily.length / 10) - 1);

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/40 mb-1">
              // site · analytics
            </p>
            <h2 className="font-display text-2xl font-bold">Visitor analytics</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Page-view tracking stored in Supabase. Admin routes excluded.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-muted-foreground/40 tabular-nums">
              {lastRefreshed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="saber-border gap-2"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Eye} label="Total page views" value={total} loading={loading} />
          <StatCard icon={Calendar} label="Views today" value={today} loading={loading} />
          <StatCard
            icon={FileText}
            label="Unique paths"
            value={topPages.length}
            sub="tracked routes"
            loading={loading}
          />
          <StatCard
            icon={TrendingUp}
            label="Top page"
            value={topPages[0]?.path ?? "—"}
            sub={topPages[0] ? `${topPages[0].count.toLocaleString()} views` : undefined}
            loading={loading}
          />
        </div>

        {/* ── Area chart ── */}
        <div className="saber-card p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">
                // views · over · time
              </p>
              <p className="text-sm font-medium">Daily page views</p>
            </div>
            {/* Range selector */}
            <div className="flex items-center gap-1 rounded-md border border-border/60 p-1">
              {RANGES.map((r) => (
                <button
                  key={r.days}
                  onClick={() => setRange(r.days)}
                  className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-[0.2em] transition-colors ${
                    range === r.days
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-56 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Activity className="h-8 w-8 text-muted-foreground/20 animate-pulse" />
                <p className="text-xs text-muted-foreground/40 font-mono uppercase tracking-[0.24em]">
                  Loading data…
                </p>
              </div>
            </div>
          ) : daily.every((d) => d.views === 0) ? (
            <div className="h-56 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No views recorded yet.</p>
                <p className="text-xs text-muted-foreground/50 font-mono">
                  Views appear as visitors browse the public site.
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={daily} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0 0% 96%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(0 0% 96%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 6"
                  stroke="hsl(0 0% 100% / 0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDate}
                  interval={tickInterval}
                  tick={{ fontSize: 10, fill: "hsl(0 0% 45%)", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "hsl(0 0% 45%)", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(0 0% 80%)"
                  strokeWidth={1.5}
                  fill="url(#viewsGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(0 0% 96%)", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Top pages table ── */}
        <div className="saber-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-0.5">
                // top · pages
              </p>
              <p className="text-sm font-medium">Pages by views</p>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/40 tabular-nums">
              all time
            </span>
          </div>

          {loading ? (
            <div className="divide-y divide-border/40">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="h-3 w-3 rounded-full bg-muted/40 animate-pulse" />
                  <div className="h-3 flex-1 rounded bg-muted/30 animate-pulse" />
                  <div className="h-3 w-12 rounded bg-muted/20 animate-pulse" />
                </div>
              ))}
            </div>
          ) : topPages.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">No page view data yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {topPages.map((page, i) => {
                const pct = Math.round((page.count / maxCount) * 100);
                return (
                  <div key={page.path} className="px-6 py-3.5 flex items-center gap-4 group hover:bg-muted/20 transition-colors">
                    {/* Rank */}
                    <span className="font-mono text-[10px] text-muted-foreground/30 w-5 shrink-0 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Path + bar */}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-foreground/80 truncate mb-1.5">{page.path}</p>
                      <div className="h-px w-full bg-foreground/8 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-foreground/50 to-foreground/20 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Count */}
                    <div className="text-right shrink-0">
                      <p className="font-display text-sm tabular-nums">{page.count.toLocaleString()}</p>
                      <p className="font-mono text-[9px] text-muted-foreground/40">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border/40 bg-background/20 flex items-center justify-between">
            <span className="font-mono text-[9px] text-muted-foreground/25 uppercase tracking-[0.22em]">
              vnr610 · realm · analytics
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/25 tabular-nums">
              {loading ? "syncing…" : `${total.toLocaleString()} total views`}
            </span>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
