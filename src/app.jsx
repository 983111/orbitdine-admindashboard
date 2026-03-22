import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://ilcajwggnghfjuezsidk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsY2Fqd2dnbmdoZmp1ZXpzaWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMzM1NjMsImV4cCI6MjA4NzYwOTU2M30.s73b5_i-H6RR68xZ6SXSwmD3T-7QYgtGbgK66YNIrMc";

async function sb(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...opts.headers,
    },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.status === 204 ? null : res.json();
}

const get = (path, q = "") => sb(`${path}?${q}`);
const patch = (path, q, body) =>
  sb(`${path}?${q}`, { method: "PATCH", body: JSON.stringify(body) });

function cn(...args) {
  return args.filter(Boolean).join(" ");
}

function fmt(n, currency = "INR") {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtNum(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN").format(n);
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(d) {
  if (!d) return "—";
  const secs = Math.floor((Date.now() - new Date(d)) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  restaurants: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  payments: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  feedback: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  qr: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" />
      <rect x="3" y="16" width="5" height="5" /><rect x="11" y="11" width="2" height="2" />
      <rect x="15" y="11" width="2" height="2" /><rect x="19" y="11" width="2" height="2" />
      <rect x="11" y="15" width="2" height="2" /><rect x="15" y="15" width="2" height="2" />
      <rect x="19" y="19" width="2" height="2" />
    </svg>
  ),
  alerts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  trend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  dollar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data = [], color = "#f97316" }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts.join(" ")} />
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color = "orange", sparkData }) {
  const colors = {
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", spark: "#f97316" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", spark: "#10b981" },
    indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", spark: "#6366f1" },
    rose: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", spark: "#f43f5e" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", spark: "#f59e0b" },
    violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", spark: "#8b5cf6" },
  };
  const c = colors[color] || colors.orange;
  return (
    <div className="glass rounded-2xl p-5 space-y-3 hover:bg-white/[0.05] transition-all">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B6B9A]">{label}</p>
        <div className={cn("w-8 h-8 rounded-xl border flex items-center justify-center", c.bg, c.border)}>
          <span className={c.text}>{icon}</span>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-[#F0F0FF] font-mono">{value}</p>
          {sub && <p className="text-xs text-[#6B6B9A] mt-0.5">{sub}</p>}
        </div>
        {sparkData && <Sparkline data={sparkData} color={c.spark} />}
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ color = "gray", children }) {
  const m = {
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    red: "bg-red-500/15 text-red-400 border-red-500/20",
    indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    gray: "bg-white/5 text-[#6B6B9A] border-white/10",
    violet: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    rose: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border", m[color] || m.gray)}>
      {children}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p.slice(-3), { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, toast: add };
}

function Toasts({ toasts }) {
  const colors = {
    success: "border-emerald-500/30 text-emerald-400",
    error: "border-red-500/30 text-red-400",
    info: "border-indigo-500/30 text-indigo-400",
  };
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={cn("px-4 py-3 rounded-xl border bg-[#0E0E1C]/95 backdrop-blur text-sm font-medium shadow-2xl min-w-[280px]", colors[t.type] || colors.info)}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Empty({ text }) {
  return <div className="flex items-center justify-center h-32 text-sm text-[#4A4A6A]">{text}</div>;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [restaurants, orders, feedback, tables] = await Promise.all([
        get("restaurants", "select=id,name,is_operational,created_at"),
        get("orders", "select=id,total,status,created_at,restaurant_id"),
        get("feedback", "select=id,rating,created_at"),
        get("tables", "select=id,restaurant_id"),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter((o) => new Date(o.created_at) >= today);
      const paidOrders = orders.filter((o) => o.status === "paid");
      const todayPaid = todayOrders.filter((o) => o.status === "paid");
      const avgRating = feedback.length ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : 0;

      const revByDay = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
        const next = new Date(d); next.setDate(next.getDate() + 1);
        return paidOrders
          .filter((o) => { const c = new Date(o.created_at); return c >= d && c < next; })
          .reduce((s, o) => s + Number(o.total), 0);
      });

      const ordByDay = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
        const next = new Date(d); next.setDate(next.getDate() + 1);
        return orders.filter((o) => { const c = new Date(o.created_at); return c >= d && c < next; }).length;
      });

      const activeSessions = orders.filter((o) => o.status === "open" || o.status === "bill_requested").length;

      setData({
        totalRestaurants: restaurants.length,
        activeRestaurants: restaurants.filter((r) => r.is_operational).length,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        totalRevenue: paidOrders.reduce((s, o) => s + Number(o.total), 0),
        todayRevenue: todayPaid.reduce((s, o) => s + Number(o.total), 0),
        avgRating,
        totalFeedback: feedback.length,
        totalTables: tables.length,
        activeSessions,
        revByDay,
        ordByDay,
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) return <Loader />;
  if (!data) return <Empty text="Failed to load dashboard data" />;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0F0FF]">Command Center</h1>
          <p className="text-sm text-[#6B6B9A] mt-0.5">OrbitDine platform overview · Live</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {data.activeSessions} live sessions
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Restaurants" value={data.totalRestaurants} sub={`${data.activeRestaurants} active`} icon={icons.restaurants} color="orange" />
        <StatCard label="Today's Orders" value={fmtNum(data.todayOrders)} sub={`${fmtNum(data.totalOrders)} total`} icon={icons.orders} color="indigo" sparkData={data.ordByDay} />
        <StatCard label="Today's GMV" value={fmt(data.todayRevenue)} sub={`${fmt(data.totalRevenue)} all-time`} icon={icons.dollar} color="emerald" sparkData={data.revByDay} />
        <StatCard label="Avg Rating" value={data.avgRating.toFixed(2) + " ★"} sub={`${fmtNum(data.totalFeedback)} reviews`} icon={icons.star} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F0F0FF]">Revenue — Last 7 Days</h2>
            <span className="text-xs text-[#6B6B9A]">{fmt(data.revByDay.reduce((a, b) => a + b, 0))} total</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {data.revByDay.map((v, i) => {
              const max = Math.max(...data.revByDay, 1);
              const d = new Date(); d.setDate(d.getDate() - (6 - i));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg bg-orange-500/20 hover:bg-orange-500/40 transition-all relative group" style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1A1A2E] border border-white/10 px-2 py-1 rounded-lg text-[10px] text-white whitespace-nowrap z-10">
                      {fmt(v)}
                    </div>
                  </div>
                  <span className="text-[9px] text-[#4A4A6A]">{days[d.getDay()]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F0F0FF]">Orders — Last 7 Days</h2>
            <span className="text-xs text-[#6B6B9A]">{fmtNum(data.ordByDay.reduce((a, b) => a + b, 0))} total</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {data.ordByDay.map((v, i) => {
              const max = Math.max(...data.ordByDay, 1);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg bg-indigo-500/20 hover:bg-indigo-500/40 transition-all" style={{ height: `${(v / max) * 100}%`, minHeight: 4 }} />
                  <span className="text-[9px] text-[#4A4A6A]">{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-400">{icons.table}</div>
          <div><p className="text-xs text-[#6B6B9A]">Total Tables</p><p className="text-lg font-bold text-[#F0F0FF]">{fmtNum(data.totalTables)}</p></div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">{icons.activity}</div>
          <div><p className="text-xs text-[#6B6B9A]">Live Sessions</p><p className="text-lg font-bold text-[#F0F0FF]">{fmtNum(data.activeSessions)}</p></div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-400">{icons.zap}</div>
          <div><p className="text-xs text-[#6B6B9A]">Avg Order Value</p><p className="text-lg font-bold text-[#F0F0FF]">{fmt(data.totalRevenue / Math.max(data.totalOrders, 1))}</p></div>
        </div>
      </div>
    </div>
  );
}

// ─── Restaurants ──────────────────────────────────────────────────────────────
function Restaurants({ toast }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rests, orders, tables, feedback] = await Promise.all([
        get("restaurants", "select=id,name,is_operational,theme,created_at,owner_id,currency,address"),
        get("orders", "select=id,total,status,created_at,restaurant_id"),
        get("tables", "select=id,restaurant_id"),
        get("feedback", "select=id,rating,restaurant_id"),
      ]);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const enriched = rests.map((r) => {
        const ro = orders.filter((o) => o.restaurant_id === r.id);
        const todayRo = ro.filter((o) => new Date(o.created_at) >= today);
        const paidRo = ro.filter((o) => o.status === "paid");
        const rf = feedback.filter((f) => f.restaurant_id === r.id);
        const avgR = rf.length ? rf.reduce((s, f) => s + f.rating, 0) / rf.length : 0;
        return {
          ...r,
          todayOrders: todayRo.length,
          todayRevenue: todayRo.filter((o) => o.status === "paid").reduce((s, o) => s + Number(o.total), 0),
          totalRevenue: paidRo.reduce((s, o) => s + Number(o.total), 0),
          totalOrders: ro.length,
          tableCount: tables.filter((t) => t.restaurant_id === r.id).length,
          avgRating: avgR,
          lastOrder: ro.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at,
        };
      });
      setRestaurants(enriched.sort((a, b) => b.totalRevenue - a.totalRevenue));
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  const loadDetail = useCallback(async (r) => {
    setSelected(r);
    setDetailLoading(true);
    try {
      const [orders, tables, feedback, managers] = await Promise.all([
        get("orders", `select=id,total,status,created_at,order_items(id,name,price,quantity)&restaurant_id=eq.${r.id}&order=created_at.desc&limit=20`),
        get("tables", `select=*&restaurant_id=eq.${r.id}`),
        get("feedback", `select=*&restaurant_id=eq.${r.id}&order=created_at.desc&limit=10`),
        get("profiles", `select=id,full_name,email,status,created_at&restaurant_id=eq.${r.id}&role=eq.manager`),
      ]);
      setDetail({ orders, tables, feedback, managers });
    } catch (e) { toast(e.message, "error"); }
    setDetailLoading(false);
  }, [toast]);

  const toggleOperational = useCallback(async (r) => {
    try {
      await patch("restaurants", `id=eq.${r.id}`, { is_operational: !r.is_operational });
      toast(`Restaurant ${r.is_operational ? "suspended" : "reactivated"}`, "success");
      load();
    } catch (e) { toast(e.message, "error"); }
  }, [toast, load]);

  useEffect(() => { load(); }, [load]);

  const filtered = restaurants.filter((r) => {
    if (filter === "active" && !r.is_operational) return false;
    if (filter === "inactive" && r.is_operational) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <Loader />;

  return (
    <div className="flex gap-6 h-full">
      <div className={cn("flex flex-col space-y-4 transition-all", selected ? "w-1/2" : "w-full")}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#F0F0FF]">Restaurants</h1>
            <p className="text-xs text-[#6B6B9A]">{filtered.length} restaurants</p>
          </div>
          <button onClick={load} className="p-2 text-[#6B6B9A] hover:text-white hover:bg-white/5 rounded-lg transition-all">{icons.refresh}</button>
        </div>

        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurants…"
            className="flex-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-[#F0F0FF] placeholder-[#3A3A5C] focus:outline-none focus:border-orange-500/50" />
          {["all", "active", "inactive"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-2 rounded-xl text-xs font-semibold border capitalize transition-all",
                filter === f ? "bg-orange-500/20 border-orange-500/30 text-orange-400" : "bg-white/[0.03] border-white/[0.07] text-[#6B6B9A] hover:bg-white/[0.07]")}>
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-2 overflow-y-auto flex-1" style={{ maxHeight: "calc(100vh - 280px)" }}>
          {filtered.map((r) => (
            <div key={r.id} onClick={() => loadDetail(r)}
              className={cn("glass rounded-xl p-4 cursor-pointer hover:bg-white/[0.07] transition-all border",
                selected?.id === r.id ? "border-orange-500/40 bg-orange-500/5" : "border-transparent")}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                    r.is_operational ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                    {r.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F0F0FF] truncate">{r.name}</p>
                    <p className="text-[10px] text-[#6B6B9A]">{r.tableCount} tables · {fmtNum(r.totalOrders)} orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#F0F0FF]">{fmt(r.todayRevenue)}</p>
                    <p className="text-[10px] text-[#6B6B9A]">today</p>
                  </div>
                  <Badge color={r.is_operational ? "green" : "red"}>{r.is_operational ? "Active" : "Off"}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/[0.05]">
                <div className="flex items-center gap-3 text-[10px] text-[#6B6B9A]">
                  <span>{fmtNum(r.todayOrders)} today</span>
                  <span>·</span>
                  <span>{fmt(r.totalRevenue)} total</span>
                  {r.avgRating > 0 && <><span>·</span><span className="text-amber-400">★ {r.avgRating.toFixed(1)}</span></>}
                </div>
                <p className="text-[10px] text-[#4A4A6A]">{timeAgo(r.lastOrder)}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <Empty text="No restaurants match the filters" />}
        </div>
      </div>

      {selected && (
        <div className="w-1/2 glass rounded-2xl overflow-hidden flex flex-col animate-slide-right">
          <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F0F0FF]">{selected.name}</h3>
              <p className="text-xs text-[#6B6B9A] font-mono">{selected.id.slice(0, 20)}…</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleOperational(selected)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                  selected.is_operational ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20")}>
                {selected.is_operational ? "Suspend" : "Reactivate"}
              </button>
              <button onClick={() => { setSelected(null); setDetail(null); }} className="p-1.5 text-[#6B6B9A] hover:text-white hover:bg-white/5 rounded-lg">{icons.x}</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {detailLoading ? <Loader /> : detail ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Revenue", value: fmt(selected.totalRevenue) },
                    { label: "Total Orders", value: fmtNum(selected.totalOrders) },
                    { label: "Tables", value: selected.tableCount },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/[0.06]">
                      <p className="text-base font-bold text-[#F0F0FF]">{s.value}</p>
                      <p className="text-[10px] text-[#6B6B9A] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {detail.managers.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#6B6B9A] uppercase tracking-wider mb-2">Managers ({detail.managers.length})</p>
                    <div className="space-y-1.5">
                      {detail.managers.map((m) => (
                        <div key={m.id} className="flex items-center justify-between px-3 py-2 bg-white/[0.03] rounded-lg text-sm">
                          <span className="text-[#E0E0F0]">{m.full_name || m.email}</span>
                          <Badge color={m.status === "active" ? "green" : "gray"}>{m.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-[#6B6B9A] uppercase tracking-wider mb-2">Recent Orders</p>
                  <div className="space-y-1.5">
                    {detail.orders.slice(0, 8).map((o) => (
                      <div key={o.id} className="flex items-center justify-between px-3 py-2 bg-white/[0.03] rounded-lg text-xs">
                        <span className="text-[#8080A0] font-mono">#{o.id.slice(0, 8)}</span>
                        <span className="text-[#F0F0FF] font-semibold">{fmt(o.total)}</span>
                        <Badge color={o.status === "paid" ? "green" : o.status === "open" ? "amber" : "indigo"}>{o.status}</Badge>
                        <span className="text-[#4A4A6A]">{timeAgo(o.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {detail.feedback.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#6B6B9A] uppercase tracking-wider mb-2">Recent Feedback</p>
                    <div className="space-y-1.5">
                      {detail.feedback.slice(0, 5).map((f) => (
                        <div key={f.id} className="px-3 py-2 bg-white/[0.03] rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-amber-400">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
                            <span className="text-[#4A4A6A]">{timeAgo(f.created_at)}</span>
                          </div>
                          {f.comment && <p className="text-[#8080A0] italic">&ldquo;{f.comment}&rdquo;</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Orders Monitor ───────────────────────────────────────────────────────────
function OrdersMonitor({ toast }) {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState({});
  const [tables, setTables] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      const [ords, rests, tbls] = await Promise.all([
        get("orders", "select=id,total,status,created_at,restaurant_id,table_id,payment_status,customer_name,notes,order_items(id,name,price,quantity,status)&order=created_at.desc&limit=100"),
        get("restaurants", "select=id,name"),
        get("tables", "select=id,number"),
      ]);
      setOrders(ords);
      setRestaurants(Object.fromEntries(rests.map((r) => [r.id, r])));
      setTables(Object.fromEntries(tbls.map((t) => [t.id, t])));
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const STATUS_COLOR = { open: "amber", bill_requested: "indigo", paid: "green", cancelled: "red" };
  const filtered = orders.filter((o) => filter === "all" || o.status === filter);
  const active = orders.filter((o) => o.status === "open" || o.status === "bill_requested").length;
  const billReq = orders.filter((o) => o.status === "bill_requested").length;
  const todayPaid = orders.filter((o) => o.status === "paid" && new Date(o.created_at).toDateString() === new Date().toDateString());

  if (loading) return <Loader />;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F0F0FF]">Live Orders</h1>
          <p className="text-xs text-[#6B6B9A]">Real-time order monitoring across all restaurants</p>
        </div>
        <button onClick={load} className="p-2 text-[#6B6B9A] hover:text-white hover:bg-white/5 rounded-lg">{icons.refresh}</button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active Now", value: active, color: "amber" },
          { label: "Bill Pending", value: billReq, color: "indigo" },
          { label: "Today Paid", value: todayPaid.length, color: "green" },
          { label: "Today GMV", value: fmt(todayPaid.reduce((s, o) => s + Number(o.total), 0)), color: "orange" },
        ].map((s) => (
          <div key={s.label} className={cn("glass rounded-xl p-3.5 border",
            s.color === "amber" ? "border-amber-500/20" : s.color === "indigo" ? "border-indigo-500/20" : s.color === "green" ? "border-emerald-500/20" : "border-orange-500/20")}>
            <p className="text-xs text-[#6B6B9A]">{s.label}</p>
            <p className={cn("text-xl font-bold mt-0.5",
              s.color === "amber" ? "text-amber-400" : s.color === "indigo" ? "text-indigo-400" : s.color === "green" ? "text-emerald-400" : "text-orange-400")}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "open", "bill_requested", "paid", "cancelled"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all",
              filter === f ? "bg-orange-500/20 border-orange-500/30 text-orange-400" : "bg-white/[0.03] border-white/[0.07] text-[#6B6B9A] hover:bg-white/[0.07]")}>
            {f.replace("_", " ")}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#4A4A6A] self-center">{filtered.length} orders</span>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] text-[10px] font-bold uppercase tracking-wider text-[#4A4A6A] px-4 py-2.5 border-b border-white/[0.06]">
          <span>Order</span><span className="text-center w-24">Restaurant</span><span className="text-center w-16">Table</span>
          <span className="text-right w-20">Total</span><span className="text-center w-24">Status</span><span className="text-right w-20">Time</span>
        </div>
        <div className="divide-y divide-white/[0.04] overflow-y-auto" style={{ maxHeight: "55vh" }}>
          {filtered.map((o) => (
            <div key={o.id} onClick={() => setSelected(selected?.id === o.id ? null : o)}
              className={cn("grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center px-4 py-3 text-sm cursor-pointer hover:bg-white/[0.03] transition-all",
                (o.status === "open" || o.status === "bill_requested") && "bg-amber-500/[0.03]",
                selected?.id === o.id && "bg-white/[0.05]")}>
              <div>
                <p className="text-xs font-mono text-[#8080A0]">#{o.id.slice(0, 8)}</p>
                {o.customer_name && <p className="text-[10px] text-[#6B6B9A]">{o.customer_name}</p>}
              </div>
              <span className="text-xs text-[#C0C0E0] w-24 text-center truncate">{restaurants[o.restaurant_id]?.name || "—"}</span>
              <span className="text-xs text-[#6B6B9A] w-16 text-center">T{tables[o.table_id]?.number || "?"}</span>
              <span className="text-sm font-bold text-[#F0F0FF] w-20 text-right">{fmt(o.total)}</span>
              <span className="w-24 flex justify-center"><Badge color={STATUS_COLOR[o.status] || "gray"}>{o.status?.replace("_", " ")}</Badge></span>
              <span className="text-[10px] text-[#4A4A6A] w-20 text-right">{timeAgo(o.created_at)}</span>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-12 text-center text-sm text-[#4A4A6A]">No orders</div>}
        </div>
      </div>

      {selected && (
        <div className="glass rounded-2xl p-5 space-y-3 animate-fade-in border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#F0F0FF]">Order #{selected.id.slice(0, 8)} — {restaurants[selected.restaurant_id]?.name}</p>
            <button onClick={() => setSelected(null)} className="p-1 text-[#6B6B9A] hover:text-white">{icons.x}</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(selected.order_items || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-white/[0.03] rounded-lg text-xs">
                <span className="text-[#C0C0E0]">{item.name} ×{item.quantity}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#F0F0FF] font-semibold">{fmt(item.price * item.quantity)}</span>
                  <Badge color={item.status === "served" ? "green" : item.status === "ready" ? "indigo" : "amber"}>{item.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Payments ─────────────────────────────────────────────────────────────────
function Payments({ toast }) {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const since = new Date(); since.setDate(since.getDate() - parseInt(period, 10));
      const [ords, rests] = await Promise.all([
        get("orders", "select=id,total,status,payment_status,created_at,restaurant_id&order=created_at.desc"),
        get("restaurants", "select=id,name"),
      ]);
      setOrders(ords.filter((o) => new Date(o.created_at) >= since));
      setRestaurants(Object.fromEntries(rests.map((r) => [r.id, r])));
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [period, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader />;

  const paid = orders.filter((o) => o.status === "paid");
  const pending = orders.filter((o) => o.status !== "paid" && o.status !== "cancelled");
  const gmv = paid.reduce((s, o) => s + Number(o.total), 0);

  const restRevenue = Object.entries(
    paid.reduce((acc, o) => { acc[o.restaurant_id] = (acc[o.restaurant_id] || 0) + Number(o.total); return acc; }, {})
  ).map(([id, rev]) => ({ id, name: restaurants[id]?.name || id.slice(0, 8), rev }))
    .sort((a, b) => b.rev - a.rev).slice(0, 8);

  const maxRev = Math.max(...restRevenue.map((r) => r.rev), 1);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F0F0FF]">Payments & Finance</h1>
          <p className="text-xs text-[#6B6B9A]">Transaction overview and settlement status</p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-white/[0.08]">
          {["7", "30", "90"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn("px-4 py-2 text-xs font-semibold transition-all",
                period === p ? "bg-orange-500 text-white" : "bg-white/[0.03] text-[#6B6B9A] hover:bg-white/[0.07]")}>
              {p === "7" ? "7D" : p === "30" ? "30D" : "90D"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total GMV" value={fmt(gmv)} sub={`${paid.length} transactions`} icon={icons.dollar} color="emerald" />
        <StatCard label="Avg Order" value={fmt(gmv / Math.max(paid.length, 1))} sub="per transaction" icon={icons.trend} color="orange" />
        <StatCard label="Pending" value={fmtNum(pending.length)} sub="open orders" icon={icons.activity} color="amber" />
        <StatCard label="Restaurants" value={fmtNum(Object.keys(restaurants).length)} sub="active" icon={icons.restaurants} color="indigo" />
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-[#F0F0FF]">Revenue by Restaurant</h2>
        <div className="space-y-3">
          {restRevenue.map((r, i) => (
            <div key={r.id} className="flex items-center gap-3">
              <span className="text-[10px] text-[#4A4A6A] w-4">{i + 1}</span>
              <p className="text-xs text-[#C0C0E0] w-36 truncate">{r.name}</p>
              <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-orange-500/70 transition-all" style={{ width: `${(r.rev / maxRev) * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-[#F0F0FF] w-24 text-right">{fmt(r.rev)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-[#F0F0FF]">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-white/[0.04] overflow-y-auto" style={{ maxHeight: "40vh" }}>
          {orders.map((o) => (
            <div key={o.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-3 text-xs gap-4">
              <div>
                <p className="font-mono text-[#8080A0]">#{o.id.slice(0, 10)}</p>
                <p className="text-[10px] text-[#4A4A6A]">{restaurants[o.restaurant_id]?.name}</p>
              </div>
              <span className="font-bold text-[#F0F0FF]">{fmt(o.total)}</span>
              <Badge color={o.status === "paid" ? "green" : o.status === "open" ? "amber" : "gray"}>{o.status}</Badge>
              <span className="text-[#4A4A6A] text-right">{fmtDate(o.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Feedback ─────────────────────────────────────────────────────────────────
function FeedbackDashboard({ toast }) {
  const [feedback, setFeedback] = useState([]);
  const [restaurants, setRestaurants] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fb, rests] = await Promise.all([
        get("feedback", "select=id,rating,comment,created_at,restaurant_id,table_number,status,manager_response&order=created_at.desc"),
        get("restaurants", "select=id,name"),
      ]);
      setFeedback(fb);
      setRestaurants(Object.fromEntries(rests.map((r) => [r.id, r])));
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader />;

  const avgRating = feedback.length ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : 0;
  const dist = [5, 4, 3, 2, 1].map((r) => ({ r, n: feedback.filter((f) => f.rating === r).length }));
  const filtered = feedback.filter((f) =>
    filter === "all" ||
    String(f.rating) === filter ||
    (filter === "low" && f.rating <= 2) ||
    (filter === "unresponded" && !f.manager_response)
  );

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F0F0FF]">Feedback Monitor</h1>
          <p className="text-xs text-[#6B6B9A]">{feedback.length} total reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg Rating" value={avgRating.toFixed(2) + " ★"} sub={`${feedback.length} reviews`} icon={icons.star} color="amber" />
        <StatCard label="Positive (4-5★)" value={fmtNum(feedback.filter((f) => f.rating >= 4).length)} sub="happy customers" icon={icons.trend} color="emerald" />
        <StatCard label="Negative (1-2★)" value={fmtNum(feedback.filter((f) => f.rating <= 2).length)} sub="needs attention" icon={icons.alerts} color="rose" />
        <StatCard label="Unresponded" value={fmtNum(feedback.filter((f) => !f.manager_response).length)} sub="awaiting reply" icon={icons.feedback} color="indigo" />
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-[#F0F0FF]">Rating Distribution</h2>
        <div className="space-y-2">
          {dist.map(({ r, n }) => (
            <div key={r} className="flex items-center gap-3 text-xs">
              <span className="text-amber-400 w-6">{r}★</span>
              <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", r >= 4 ? "bg-emerald-500" : r === 3 ? "bg-amber-500" : "bg-red-500")}
                  style={{ width: feedback.length ? `${(n / feedback.length) * 100}%` : "0%" }} />
              </div>
              <span className="text-[#6B6B9A] w-6 text-right">{n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[["all", "All"], ["low", "Low (1-2★)"], ["unresponded", "Unresponded"], ["5", "5★"], ["4", "4★"], ["3", "3★"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
              filter === v ? "bg-orange-500/20 border-orange-500/30 text-orange-400" : "bg-white/[0.03] border-white/[0.07] text-[#6B6B9A] hover:bg-white/[0.07]")}>
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "50vh" }}>
        {filtered.map((f) => (
          <div key={f.id} className="glass rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-sm">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
                <Badge color={f.rating >= 4 ? "green" : f.rating === 3 ? "amber" : "red"}>{f.rating}/5</Badge>
                {f.table_number && <span className="text-xs text-[#6B6B9A]">T{f.table_number}</span>}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#4A4A6A]">
                <span className="text-[#6B6B9A]">{restaurants[f.restaurant_id]?.name}</span>
                <span>·</span>
                <span>{timeAgo(f.created_at)}</span>
              </div>
            </div>
            {f.comment && <p className="text-sm text-[#C0C0E0] italic">&ldquo;{f.comment}&rdquo;</p>}
            {f.manager_response && (
              <div className="pl-3 border-l-2 border-orange-500/40">
                <p className="text-[10px] text-orange-400 font-semibold mb-0.5">Manager response</p>
                <p className="text-xs text-[#8080A0]">{f.manager_response}</p>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <Empty text="No feedback matches the filter" />}
      </div>
    </div>
  );
}

// ─── QR Health ────────────────────────────────────────────────────────────────
function QRHealth({ toast }) {
  const [tables, setTables] = useState([]);
  const [restaurants, setRestaurants] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tbls, rests, ords] = await Promise.all([
        get("tables", "select=id,number,seats,restaurant_id,qr_code_url,created_at"),
        get("restaurants", "select=id,name,is_operational"),
        get("orders", "select=id,table_id,created_at&order=created_at.desc"),
      ]);
      setTables(tbls);
      setRestaurants(Object.fromEntries(rests.map((r) => [r.id, r])));
      setOrders(ords);
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader />;

  const enriched = tables.map((t) => {
    const tOrders = orders.filter((o) => o.table_id === t.id);
    const last = tOrders[0]?.created_at;
    const daysSinceLast = last ? Math.floor((Date.now() - new Date(last)) / 86400000) : 999;
    const hasQr = !!t.qr_code_url;
    const inactive = tOrders.length === 0 || daysSinceLast > 7;
    return { ...t, orderCount: tOrders.length, lastOrder: last, daysSinceLast, hasQr, inactive };
  });

  const issues = enriched.filter((t) => !t.hasQr || t.inactive);
  const healthy = enriched.filter((t) => t.hasQr && !t.inactive);

  const byRestaurant = Object.entries(
    enriched.reduce((acc, t) => {
      if (!acc[t.restaurant_id]) acc[t.restaurant_id] = { tables: 0, issues: 0, orders: 0 };
      acc[t.restaurant_id].tables++;
      if (!t.hasQr || t.inactive) acc[t.restaurant_id].issues++;
      acc[t.restaurant_id].orders += t.orderCount;
      return acc;
    }, {})
  ).map(([id, v]) => ({ id, name: restaurants[id]?.name || id.slice(0, 10), ...v })).sort((a, b) => b.issues - a.issues);

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-xl font-bold text-[#F0F0FF]">QR Health Monitor</h1>
        <p className="text-xs text-[#6B6B9A]">Track QR code status and table activity</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Tables" value={fmtNum(tables.length)} icon={icons.table} color="indigo" />
        <StatCard label="Healthy" value={fmtNum(healthy.length)} sub="active QR + recent orders" icon={icons.check} color="emerald" />
        <StatCard label="Issues" value={fmtNum(issues.length)} sub="inactive or missing QR" icon={icons.alerts} color="rose" />
        <StatCard label="No QR Code" value={fmtNum(enriched.filter((t) => !t.hasQr).length)} icon={icons.qr} color="amber" />
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-[#F0F0FF]">Restaurant Table Health</h2>
        <div className="space-y-2">
          {byRestaurant.slice(0, 12).map((r) => (
            <div key={r.id} className="flex items-center gap-3 text-xs">
              <p className="text-[#C0C0E0] w-40 truncate">{r.name}</p>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${r.tables ? ((r.tables - r.issues) / r.tables) * 100 : 0}%` }} />
                </div>
                <span className="text-[#6B6B9A] w-20 text-right">{r.tables - r.issues}/{r.tables} healthy</span>
              </div>
              {r.issues > 0 && <Badge color="red">{r.issues} issues</Badge>}
            </div>
          ))}
        </div>
      </div>

      {issues.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden border border-red-500/10">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <h2 className="text-sm font-bold text-[#F0F0FF]">Tables Needing Attention ({issues.length})</h2>
          </div>
          <div className="divide-y divide-white/[0.04] overflow-y-auto" style={{ maxHeight: "40vh" }}>
            {issues.map((t) => (
              <div key={t.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3 text-xs">
                <span className="text-[#F0F0FF] font-bold">T{t.number}</span>
                <span className="text-[#8080A0] truncate">{restaurants[t.restaurant_id]?.name}</span>
                <span className="text-[#6B6B9A]">{t.orderCount} orders</span>
                {!t.hasQr && <Badge color="red">No QR</Badge>}
                {t.hasQr && t.inactive && <Badge color="amber">Inactive {t.daysSinceLast === 999 ? "(never)" : `(${t.daysSinceLast}d)`}</Badge>}
                <span className="text-[#4A4A6A]">{t.lastOrder ? timeAgo(t.lastOrder) : "never"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
function Alerts({ toast }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const [orders, feedback, restaurants, tables] = await Promise.all([
        get("orders", "select=id,total,status,created_at,restaurant_id,payment_status&order=created_at.desc&limit=500"),
        get("feedback", "select=id,rating,restaurant_id,created_at&order=created_at.desc&limit=200"),
        get("restaurants", "select=id,name,is_operational"),
        get("tables", "select=id,restaurant_id,qr_code_url"),
      ]);

      const now = Date.now();
      const restMap = Object.fromEntries(restaurants.map((r) => [r.id, r]));
      const found = [];

      orders.filter((o) => o.status === "open").forEach((o) => {
        const mins = (now - new Date(o.created_at)) / 60000;
        if (mins > 45) found.push({ type: "stuck_order", severity: "high", title: "Stuck Order", body: `Order ${o.id.slice(0, 8)} at ${restMap[o.restaurant_id]?.name} open for ${Math.floor(mins)}m`, time: o.created_at });
      });

      const recentLow = feedback.filter((f) => f.rating <= 2 && now - new Date(f.created_at) < 86400000 * 3);
      const byRest = recentLow.reduce((acc, f) => { acc[f.restaurant_id] = (acc[f.restaurant_id] || 0) + 1; return acc; }, {});
      Object.entries(byRest).forEach(([id, n]) => {
        if (n >= 2) found.push({ type: "low_ratings", severity: "medium", title: "Low Rating Cluster", body: `${n} low ratings in last 3 days at ${restMap[id]?.name}`, time: new Date().toISOString() });
      });

      orders.filter((o) => o.status === "bill_requested").forEach((o) => {
        const mins = (now - new Date(o.created_at)) / 60000;
        if (mins > 20) found.push({ type: "bill_wait", severity: "medium", title: "Long Bill Wait", body: `Bill at ${restMap[o.restaurant_id]?.name} requested ${Math.floor(mins)}m ago`, time: o.created_at });
      });

      const noQr = tables.filter((t) => !t.qr_code_url);
      if (noQr.length > 0) found.push({ type: "missing_qr", severity: "low", title: "Missing QR Codes", body: `${noQr.length} tables across ${new Set(noQr.map((t) => t.restaurant_id)).size} restaurants have no QR code`, time: new Date().toISOString() });

      restaurants.filter((r) => !r.is_operational).forEach((r) => {
        found.push({ type: "inactive_rest", severity: "low", title: "Inactive Restaurant", body: `${r.name} is currently closed / suspended`, time: new Date().toISOString() });
      });

      const sevScore = { high: 3, medium: 2, low: 1 };
      setAlerts(found.sort((a, b) => sevScore[b.severity] - sevScore[a.severity]));
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { generate(); }, [generate]);

  if (loading) return <Loader />;

  const SEV = { high: { color: "rose", label: "Critical" }, medium: { color: "amber", label: "Warning" }, low: { color: "indigo", label: "Info" } };
  const high = alerts.filter((a) => a.severity === "high");
  const medium = alerts.filter((a) => a.severity === "medium");
  const low = alerts.filter((a) => a.severity === "low");

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F0F0FF]">Alerts & Monitoring</h1>
          <p className="text-xs text-[#6B6B9A]">Auto-generated from live data</p>
        </div>
        <button onClick={generate} className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.05] border border-white/[0.09] text-[#E0E0F0] rounded-xl text-xs font-semibold hover:bg-white/[0.09]">
          {icons.refresh} Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-4 border border-rose-500/20"><p className="text-xs text-[#6B6B9A]">Critical</p><p className="text-2xl font-bold text-rose-400">{high.length}</p></div>
        <div className="glass rounded-xl p-4 border border-amber-500/20"><p className="text-xs text-[#6B6B9A]">Warnings</p><p className="text-2xl font-bold text-amber-400">{medium.length}</p></div>
        <div className="glass rounded-xl p-4 border border-indigo-500/20"><p className="text-xs text-[#6B6B9A]">Info</p><p className="text-2xl font-bold text-indigo-400">{low.length}</p></div>
      </div>

      {alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">{icons.check}</div>
          <p className="text-sm font-semibold text-emerald-400">All systems healthy!</p>
          <p className="text-xs text-[#6B6B9A]">No alerts detected at this time</p>
        </div>
      )}

      <div className="space-y-2">
        {alerts.map((a, i) => {
          const sv = SEV[a.severity] || SEV.low;
          return (
            <div key={i} className={cn("glass rounded-xl p-4 flex items-start gap-3 border",
              a.severity === "high" ? "border-rose-500/20 bg-rose-500/[0.04]" : a.severity === "medium" ? "border-amber-500/20 bg-amber-500/[0.04]" : "border-indigo-500/15")}>
              <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0",
                a.severity === "high" ? "bg-rose-400" : a.severity === "medium" ? "bg-amber-400" : "bg-indigo-400")} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#F0F0FF]">{a.title}</p>
                  <Badge color={sv.color}>{sv.label}</Badge>
                </div>
                <p className="text-xs text-[#8080A0] mt-0.5">{a.body}</p>
              </div>
              <span className="text-[10px] text-[#4A4A6A] shrink-0">{timeAgo(a.time)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Admin Controls ───────────────────────────────────────────────────────────
function AdminControls({ toast }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const load = useCallback(async () => {
    try {
      const rests = await get("restaurants", "select=id,name,is_operational,theme,currency,created_at");
      setRestaurants(rests);
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (r) => {
    setSaving(r.id);
    try {
      await patch("restaurants", `id=eq.${r.id}`, { is_operational: !r.is_operational });
      toast(`${r.name} ${r.is_operational ? "suspended" : "reactivated"}`, "success");
      load();
    } catch (e) { toast(e.message, "error"); }
    setSaving(null);
  }, [toast, load]);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(restaurants, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "orbitdine_restaurants.json";
    a.click();
    toast("Exported!", "success");
  }, [restaurants, toast]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-xl font-bold text-[#F0F0FF]">Admin Controls</h1>
        <p className="text-xs text-[#6B6B9A]">Platform-wide management and controls</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#F0F0FF]">Restaurant Status Control</h2>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "60vh" }}>
            {restaurants.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 bg-white/[0.03] rounded-xl border border-white/[0.05] hover:bg-white/[0.06] transition-all">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#F0F0FF] truncate">{r.name}</p>
                  <p className="text-[10px] text-[#6B6B9A] font-mono">{r.id.slice(0, 16)}…</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge color={r.is_operational ? "green" : "red"}>{r.is_operational ? "Active" : "Off"}</Badge>
                  <button onClick={() => toggle(r)} disabled={saving === r.id}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50",
                      r.is_operational ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20")}>
                    {saving === r.id ? "…" : r.is_operational ? "Suspend" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#F0F0FF]">Platform Overview</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Total Restaurants", value: restaurants.length },
                { label: "Active", value: restaurants.filter((r) => r.is_operational).length },
                { label: "Suspended", value: restaurants.filter((r) => !r.is_operational).length },
                { label: "Themes Used", value: new Set(restaurants.map((r) => r.theme)).size },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <p className="text-xl font-bold text-[#F0F0FF]">{s.value}</p>
                  <p className="text-[10px] text-[#6B6B9A] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3 border border-amber-500/10">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">{icons.alerts}</span>
              <h2 className="text-sm font-bold text-[#F0F0FF]">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              <button onClick={() => { load(); toast("Data refreshed", "success"); }}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.07] rounded-xl border border-white/[0.05] transition-all text-left">
                <div>
                  <p className="text-sm font-semibold text-[#F0F0FF]">Refresh All Data</p>
                  <p className="text-xs text-[#6B6B9A]">Pull latest from Supabase</p>
                </div>
                <span className="text-[#6B6B9A]">{icons.zap}</span>
              </button>
              <button onClick={handleExport}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.07] rounded-xl border border-white/[0.05] transition-all text-left">
                <div>
                  <p className="text-sm font-semibold text-[#F0F0FF]">Export Restaurant List</p>
                  <p className="text-xs text-[#6B6B9A]">Download as JSON</p>
                </div>
                <span className="text-[#6B6B9A]">{icons.zap}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Overview", icon: "dashboard" },
  { id: "restaurants", label: "Restaurants", icon: "restaurants" },
  { id: "orders", label: "Live Orders", icon: "orders" },
  { id: "payments", label: "Payments", icon: "payments" },
  { id: "feedback", label: "Feedback", icon: "feedback" },
  { id: "qr", label: "QR Health", icon: "qr" },
  { id: "alerts", label: "Alerts", icon: "alerts" },
  { id: "controls", label: "Admin Controls", icon: "settings" },
];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [section, setSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, toast } = useToasts();

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <Dashboard />;
      case "restaurants": return <Restaurants toast={toast} />;
      case "orders": return <OrdersMonitor toast={toast} />;
      case "payments": return <Payments toast={toast} />;
      case "feedback": return <FeedbackDashboard toast={toast} />;
      case "qr": return <QRHealth toast={toast} />;
      case "alerts": return <Alerts toast={toast} />;
      case "controls": return <AdminControls toast={toast} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#07070F] text-[#F0F0FF]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #07070F; }
        .glass { background: rgba(255,255,255,0.035); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.07); }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes fade-up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slide-right { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fade-in { from { opacity:0; } to { opacity:1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-fade-up { animation: fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-slide-right { animation: slide-right 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-fade-in { animation: fade-in 0.3s ease both; }
        .animate-spin { animation: spin 0.8s linear infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-[#0A0A14] border-r border-white/[0.05] flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 py-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/25 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-4 h-4">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#F0F0FF]">OrbitDine</p>
              <p className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <button key={item.id} onClick={() => { setSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${section === item.id ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "text-[#6B6B9A] hover:bg-white/[0.04] hover:text-[#C0C0E0]"}`}>
              <span className="shrink-0">{icons[item.icon]}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 pb-5 border-t border-white/[0.05] pt-4">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center text-[10px] font-bold">SA</div>
            <div>
              <p className="text-xs font-semibold text-[#E0E0F0]">Super Admin</p>
              <p className="text-[9px] text-[#4A4A6A]">Full Access</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 px-4 lg:px-6 flex items-center justify-between border-b border-white/[0.05] bg-[#07070F]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-[#6B6B9A] hover:text-white hover:bg-white/[0.05] rounded-lg">
              {icons.menu}
            </button>
            <p className="text-sm text-[#6B6B9A] hidden sm:block">{NAV.find((n) => n.id === section)?.label}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
            <p className="text-xs text-[#4A4A6A] hidden sm:block">{new Date().toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {renderSection()}
        </main>
      </div>

      <Toasts toasts={toasts} />
    </div>
  );
}
