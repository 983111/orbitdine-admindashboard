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
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

const get = (path, q = "") => sb(`${path}?${q}`);
const patch = (path, q, body) => sb(`${path}?${q}`, { method: "PATCH", body: JSON.stringify(body) });

function fmt(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function fmtNum(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN").format(n);
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function timeAgo(d) {
  if (!d) return "—";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, fill = "none", children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  dashboard:   <Icon><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></Icon>,
  restaurants: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"><polyline points="9,22 9,12 15,12 15,22"/></Icon>,
  orders:      <Icon><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></Icon>,
  payments:    <Icon><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></Icon>,
  feedback:    <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
  qr:          <Icon><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M11 11h2v2h-2zM15 11h2v2h-2zM19 11h2v2h-2zM11 15h2v2h-2zM15 15h2v2h-2zM19 19h2v2h-2z"/></Icon>,
  alerts:      <Icon><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>,
  settings:    <Icon><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></Icon>,
  menu:        <Icon><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></Icon>,
  refresh:     <Icon><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></Icon>,
  x:           <Icon><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>,
  star:        <Icon fill="currentColor" d="M0 0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>,
  trend:       <Icon><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Icon>,
  dollar:      <Icon><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></Icon>,
  activity:    <Icon><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>,
  table:       <Icon><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></Icon>,
  zap:         <Icon fill="currentColor" d="M0 0"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>,
  check:       <Icon><polyline points="20 6 9 17 4 12"/></Icon>,
};

// ── Primitives ─────────────────────────────────────────────────────────────────
function Badge({ color = "gray", children }) {
  return <span className={"badge badge-" + color}>{children}</span>;
}

function Loader() {
  return <div className="loader-wrap"><div className="spinner" /></div>;
}

function Empty({ text = "No data" }) {
  return <div className="empty">{text}</div>;
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p.slice(-3), { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, toast: add };
}

function Toasts({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => <div key={t.id} className={"toast " + t.type}>{t.msg}</div>)}
    </div>
  );
}

// ── Sparkline ──────────────────────────────────────────────────────────────────
function Sparkline({ data = [], color = "#F4793A", h = 32 }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1), min = Math.min(...data, 0), range = max - min || 1;
  const W = 72;
  const pts = data.map((v, i) => ((i / (data.length - 1)) * W) + "," + (h - ((v - min) / range) * h)).join(" ");
  return (
    <svg width={W} height={h} viewBox={`0 0 ${W} ${h}`} style={{ overflow: "visible" }}>
      <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color = "orange", spark }) {
  const sparkColor = { orange: "#F4793A", green: "#2DD4A0", blue: "#5B8EF4", amber: "#F5A623", violet: "#9B6CF7", rose: "#F45B6C" }[color] || "#F4793A";
  return (
    <div className={"stat-card " + color}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {spark && (
        <div style={{ marginTop: 10 }}>
          <Sparkline data={spark} color={sparkColor} />
        </div>
      )}
    </div>
  );
}

// ── Bar Chart ──────────────────────────────────────────────────────────────────
function BarChart({ data, color = "#F4793A", labels }) {
  const max = Math.max(...data, 1);
  return (
    <div className="bar-chart">
      {data.map((v, i) => (
        <div key={i} className="bar-col">
          <div className="bar-fill" style={{ height: Math.max((v / max) * 100, 2) + "%", background: color, opacity: 0.7 }}>
            <div className="tooltip">{typeof v === "number" && v > 100 ? fmt(v) : fmtNum(v)}</div>
          </div>
          <div className="bar-label">{labels?.[i] || (i + 1)}</div>
        </div>
      ))}
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Page({ title, sub, actions, children }) {
  return (
    <div className="animate-in">
      <div className="section-header">
        <div>
          <h1 className="section-title">{title}</h1>
          {sub && <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>{sub}</p>}
        </div>
        {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
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
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const paid = orders.filter(o => o.status === "paid");
      const todayAll = orders.filter(o => new Date(o.created_at) >= today);
      const todayPaid = todayAll.filter(o => o.status === "paid");
      const avgRating = feedback.length ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : 0;
      const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const revByDay = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
        const n = new Date(d); n.setDate(n.getDate() + 1);
        return paid.filter(o => { const c = new Date(o.created_at); return c >= d && c < n; }).reduce((s, o) => s + +o.total, 0);
      });
      const ordByDay = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
        const n = new Date(d); n.setDate(n.getDate() + 1);
        return orders.filter(o => { const c = new Date(o.created_at); return c >= d && c < n; }).length;
      });
      const dayLabels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return DAYS[d.getDay()];
      });
      setData({
        totalR: restaurants.length, activeR: restaurants.filter(r => r.is_operational).length,
        totalOrders: orders.length, todayOrders: todayAll.length,
        totalRev: paid.reduce((s, o) => s + +o.total, 0),
        todayRev: todayPaid.reduce((s, o) => s + +o.total, 0),
        avgRating, totalFb: feedback.length, totalTables: tables.length,
        activeSessions: orders.filter(o => o.status === "open" || o.status === "bill_requested").length,
        revByDay, ordByDay, dayLabels,
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  if (loading) return <Loader />;
  if (!data) return <Empty text="Failed to load" />;

  return (
    <Page title="Command Center" sub="Live platform overview across all restaurants"
      actions={
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:20, background:"rgba(45,212,160,0.1)", border:"1px solid rgba(45,212,160,0.2)", fontSize:12, fontWeight:600, color:"var(--green)" }}>
          <span className="live-dot" />
          {data.activeSessions} live sessions
        </div>
      }>

      <div className="stat-grid mb-4">
        <StatCard label="Restaurants" value={data.totalR} sub={data.activeR + " active"} icon={Icons.restaurants} color="orange" />
        <StatCard label="Today's Orders" value={fmtNum(data.todayOrders)} sub={fmtNum(data.totalOrders) + " total"} icon={Icons.orders} color="blue" spark={data.ordByDay} />
        <StatCard label="Today's Revenue" value={fmt(data.todayRev)} sub={fmt(data.totalRev) + " all-time"} icon={Icons.dollar} color="green" spark={data.revByDay} />
        <StatCard label="Avg Rating" value={data.avgRating.toFixed(2) + " ★"} sub={fmtNum(data.totalFb) + " reviews"} icon={Icons.star} color="amber" />
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize:13, fontWeight:700, color:"var(--text)", fontFamily:"Syne, sans-serif" }}>Revenue — Last 7 Days</p>
            <span style={{ fontSize:11, color:"var(--text3)", fontFamily:"DM Mono, monospace" }}>{fmt(data.revByDay.reduce((a,b)=>a+b,0))}</span>
          </div>
          <BarChart data={data.revByDay} color="var(--accent)" labels={data.dayLabels} />
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize:13, fontWeight:700, color:"var(--text)", fontFamily:"Syne, sans-serif" }}>Orders — Last 7 Days</p>
            <span style={{ fontSize:11, color:"var(--text3)", fontFamily:"DM Mono, monospace" }}>{fmtNum(data.ordByDay.reduce((a,b)=>a+b,0))} orders</span>
          </div>
          <BarChart data={data.ordByDay} color="var(--blue)" labels={data.dayLabels} />
        </div>
      </div>

      <div className="grid-3">
        {[
          { label:"Total Tables", val: fmtNum(data.totalTables), color:"var(--violet)", icon: Icons.table },
          { label:"Live Sessions", val: fmtNum(data.activeSessions), color:"var(--green)", icon: Icons.activity },
          { label:"Avg Order Value", val: fmt(data.totalRev / Math.max(data.totalOrders, 1)), color:"var(--accent)", icon: Icons.zap },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", color: s.color, flexShrink:0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize:11, color:"var(--text3)", marginBottom:2 }}>{s.label}</p>
              <p style={{ fontSize:18, fontWeight:700, fontFamily:"Syne, sans-serif", color:"var(--text)" }}>{s.val}</p>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANTS
// ─────────────────────────────────────────────────────────────────────────────
function Restaurants({ toast }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rests, orders, tables, feedback] = await Promise.all([
        get("restaurants", "select=id,name,is_operational,theme,created_at,currency,address"),
        get("orders", "select=id,total,status,created_at,restaurant_id"),
        get("tables", "select=id,restaurant_id"),
        get("feedback", "select=id,rating,restaurant_id"),
      ]);
      const today = new Date(); today.setHours(0,0,0,0);
      const enriched = rests.map(r => {
        const ro = orders.filter(o => o.restaurant_id === r.id);
        const todayRo = ro.filter(o => new Date(o.created_at) >= today);
        const paidRo = ro.filter(o => o.status === "paid");
        const rf = feedback.filter(f => f.restaurant_id === r.id);
        return {
          ...r,
          todayOrders: todayRo.length,
          todayRev: todayRo.filter(o => o.status === "paid").reduce((s,o) => s + +o.total, 0),
          totalRev: paidRo.reduce((s,o) => s + +o.total, 0),
          totalOrders: ro.length,
          tableCount: tables.filter(t => t.restaurant_id === r.id).length,
          avgRating: rf.length ? rf.reduce((s,f) => s + f.rating, 0) / rf.length : 0,
          lastOrder: ro.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at,
        };
      });
      setList(enriched.sort((a,b) => b.totalRev - a.totalRev));
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  const loadDetail = useCallback(async (r) => {
    setSelected(r); setDetailLoading(true); setDetail(null);
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

  const toggleOp = useCallback(async (r) => {
    try {
      await patch("restaurants", `id=eq.${r.id}`, { is_operational: !r.is_operational });
      toast(`${r.name} ${r.is_operational ? "suspended" : "reactivated"}`, "success");
      load();
    } catch (e) { toast(e.message, "error"); }
  }, [toast, load]);

  useEffect(() => { load(); }, [load]);

  const filtered = list.filter(r => {
    if (filter === "active" && !r.is_operational) return false;
    if (filter === "inactive" && r.is_operational) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <Loader />;

  return (
    <Page title="Restaurants" sub={filtered.length + " restaurants"} actions={<button className="icon-btn" onClick={load}>{Icons.refresh}</button>}>
      <div className="flex items-center gap-2 mb-4">
        <input className="input" style={{ maxWidth: 280 }} placeholder="Search restaurants…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-tabs">
          {["all","active","inactive"].map(f => (
            <button key={f} className={"filter-tab" + (filter===f?" active":"")} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:16 }}>
        {/* List */}
        <div style={{ flex: selected ? "0 0 44%" : "1", minWidth:0 }}>
          <div className="section-rows">
            {filtered.map(r => (
              <div key={r.id} className={"row-item"} style={{ cursor:"pointer", borderColor: selected?.id===r.id ? "rgba(244,121,58,0.4)" : undefined, background: selected?.id===r.id ? "rgba(244,121,58,0.05)" : undefined }}
                onClick={() => loadDetail(r)}>
                <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background: r.is_operational ? "rgba(45,212,160,0.12)" : "rgba(244,91,108,0.12)", border:`1px solid ${r.is_operational?"rgba(45,212,160,0.25)":"rgba(244,91,108,0.25)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Syne,sans-serif", fontSize:14, fontWeight:800, color: r.is_operational ? "var(--green)" : "var(--rose)", flexShrink:0 }}>
                    {r.name[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:"var(--text)" }} className="truncate">{r.name}</p>
                    <p style={{ fontSize:11, color:"var(--text3)" }}>{r.tableCount} tables · {fmtNum(r.totalOrders)} orders · last {timeAgo(r.lastOrder)}</p>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"var(--text)", fontFamily:"DM Mono, monospace" }}>{fmt(r.todayRev)}</p>
                    <p style={{ fontSize:10, color:"var(--text3)" }}>today</p>
                  </div>
                  <Badge color={r.is_operational ? "green" : "red"}>{r.is_operational ? "Active" : "Off"}</Badge>
                  {r.avgRating > 0 && <span style={{ fontSize:11, color:"var(--amber)", fontWeight:600 }}>★ {r.avgRating.toFixed(1)}</span>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <Empty text="No restaurants match" />}
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <div className="detail-panel animate-in" style={{ flex:1, minWidth:0 }}>
            <div className="detail-header">
              <div>
                <p style={{ fontSize:14, fontWeight:700, fontFamily:"Syne, sans-serif", color:"var(--text)" }}>{selected.name}</p>
                <p className="mono" style={{ marginTop:2 }}>{selected.id.slice(0,22)}…</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className={"btn " + (selected.is_operational ? "danger" : "success")} onClick={() => toggleOp(selected)}>
                  {selected.is_operational ? "Suspend" : "Reactivate"}
                </button>
                <button className="icon-btn" onClick={() => { setSelected(null); setDetail(null); }}>{Icons.x}</button>
              </div>
            </div>
            <div className="detail-body">
              {detailLoading ? <Loader /> : detail ? (
                <>
                  <div className="mini-stats mb-4">
                    <div className="mini-stat"><div className="mini-stat-val">{fmt(selected.totalRev)}</div><div className="mini-stat-label">Total Revenue</div></div>
                    <div className="mini-stat"><div className="mini-stat-val">{fmtNum(selected.totalOrders)}</div><div className="mini-stat-label">Total Orders</div></div>
                    <div className="mini-stat"><div className="mini-stat-val">{selected.tableCount}</div><div className="mini-stat-label">Tables</div></div>
                  </div>

                  {detail.managers?.length > 0 && (
                    <div className="mb-4">
                      <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--text3)", marginBottom:8 }}>Managers</p>
                      <div className="section-rows">
                        {detail.managers.map(m => (
                          <div key={m.id} className="row-item">
                            <span style={{ fontSize:13, color:"var(--text)" }}>{m.full_name || m.email}</span>
                            <Badge color={m.status === "active" ? "green" : "gray"}>{m.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--text3)", marginBottom:8 }}>Recent Orders</p>
                    <div className="section-rows">
                      {detail.orders.slice(0,8).map(o => (
                        <div key={o.id} className="row-item">
                          <span className="mono">#{o.id.slice(0,8)}</span>
                          <span style={{ fontSize:13, fontWeight:700, color:"var(--text)", fontFamily:"DM Mono, monospace" }}>{fmt(o.total)}</span>
                          <Badge color={o.status==="paid"?"green":o.status==="open"?"amber":"blue"}>{o.status}</Badge>
                          <span style={{ fontSize:11, color:"var(--text3)" }}>{timeAgo(o.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {detail.feedback?.length > 0 && (
                    <div>
                      <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--text3)", marginBottom:8 }}>Recent Feedback</p>
                      <div className="section-rows">
                        {detail.feedback.slice(0,5).map(f => (
                          <div key={f.id} style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:"10px 14px" }}>
                            <div className="flex items-center justify-between">
                              <span style={{ color:"var(--amber)", fontSize:13 }}>{"★".repeat(f.rating)}{"☆".repeat(5-f.rating)}</span>
                              <span style={{ fontSize:11, color:"var(--text3)" }}>{timeAgo(f.created_at)}</span>
                            </div>
                            {f.comment && <p style={{ fontSize:12, color:"var(--text2)", marginTop:4, fontStyle:"italic" }}>&ldquo;{f.comment}&rdquo;</p>}
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
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE ORDERS
// ─────────────────────────────────────────────────────────────────────────────
function LiveOrders({ toast }) {
  const [orders, setOrders] = useState([]);
  const [rests, setRests] = useState({});
  const [tables, setTables] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      const [o, r, t] = await Promise.all([
        get("orders", "select=id,total,status,created_at,restaurant_id,table_id,customer_name,order_items(id,name,price,quantity,status)&order=created_at.desc&limit=100"),
        get("restaurants", "select=id,name"),
        get("tables", "select=id,number"),
      ]);
      setOrders(o);
      setRests(Object.fromEntries(r.map(x => [x.id, x])));
      setTables(Object.fromEntries(t.map(x => [x.id, x])));
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  const filtered = orders.filter(o => filter === "all" || o.status === filter);
  const active   = orders.filter(o => o.status === "open" || o.status === "bill_requested").length;
  const billReq  = orders.filter(o => o.status === "bill_requested").length;
  const todayPaid = orders.filter(o => o.status === "paid" && new Date(o.created_at).toDateString() === new Date().toDateString());
  const SC = { open:"amber", bill_requested:"blue", paid:"green", cancelled:"red" };

  if (loading) return <Loader />;

  return (
    <Page title="Live Orders" sub="Real-time monitoring across all restaurants"
      actions={<button className="icon-btn" onClick={load}>{Icons.refresh}</button>}>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Active Now", val: active, color:"var(--amber)" },
          { label:"Bill Requested", val: billReq, color:"var(--blue)" },
          { label:"Paid Today", val: todayPaid.length, color:"var(--green)" },
          { label:"Today GMV", val: fmt(todayPaid.reduce((s,o)=>s+ +o.total,0)), color:"var(--accent)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:"16px 18px" }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--text3)", marginBottom:6 }}>{s.label}</p>
            <p style={{ fontFamily:"Syne, sans-serif", fontSize:22, fontWeight:800, color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="filter-tabs">
          {["all","open","bill_requested","paid","cancelled"].map(f => (
            <button key={f} className={"filter-tab"+(filter===f?" active":"")} onClick={()=>setFilter(f)}>
              {f.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}
            </button>
          ))}
        </div>
        <span style={{ marginLeft:"auto", fontSize:11, color:"var(--text3)" }}>{filtered.length} orders</span>
      </div>

      <div className="table-wrap" style={{ maxHeight:"52vh", overflowY:"auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Order</th><th>Restaurant</th><th>Table</th>
              <th style={{ textAlign:"right" }}>Total</th>
              <th style={{ textAlign:"center" }}>Status</th>
              <th style={{ textAlign:"right" }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className={selected?.id===o.id ? "selected" : ""} onClick={() => setSelected(selected?.id===o.id ? null : o)}>
                <td>
                  <p className="mono">#{o.id.slice(0,8)}</p>
                  {o.customer_name && <p style={{ fontSize:11, color:"var(--text3)" }}>{o.customer_name}</p>}
                </td>
                <td style={{ fontSize:12, color:"var(--text2)" }}>{rests[o.restaurant_id]?.name || "—"}</td>
                <td style={{ fontSize:12, color:"var(--text3)" }}>T{tables[o.table_id]?.number || "?"}</td>
                <td style={{ textAlign:"right", fontFamily:"DM Mono, monospace", fontSize:13, fontWeight:700, color:"var(--text)" }}>{fmt(o.total)}</td>
                <td style={{ textAlign:"center" }}><Badge color={SC[o.status]||"gray"}>{o.status?.replace("_"," ")}</Badge></td>
                <td style={{ textAlign:"right", fontSize:11, color:"var(--text3)" }}>{timeAgo(o.created_at)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6}><Empty text="No orders" /></td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="card animate-in mt-4">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize:13, fontWeight:700, fontFamily:"Syne, sans-serif", color:"var(--text)" }}>
              Order #{selected.id.slice(0,8)} — {rests[selected.restaurant_id]?.name}
            </p>
            <button className="icon-btn" onClick={() => setSelected(null)}>{Icons.x}</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
            {(selected.order_items || []).map(item => (
              <div key={item.id} className="row-item">
                <span style={{ fontSize:12, color:"var(--text2)" }}>{item.name} ×{item.quantity}</span>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontFamily:"DM Mono,monospace", fontSize:12, fontWeight:600, color:"var(--text)" }}>{fmt(item.price * item.quantity)}</span>
                  <Badge color={item.status==="served"?"green":item.status==="ready"?"blue":"amber"}>{item.status}</Badge>
                </div>
              </div>
            ))}
            {(!selected.order_items || selected.order_items.length === 0) && <p style={{ fontSize:12, color:"var(--text3)", gridColumn:"span 2" }}>No items data</p>}
          </div>
        </div>
      )}
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────
function Payments({ toast }) {
  const [orders, setOrders] = useState([]);
  const [rests, setRests] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const since = new Date(); since.setDate(since.getDate() - parseInt(period, 10));
      const [o, r] = await Promise.all([
        get("orders", "select=id,total,status,created_at,restaurant_id&order=created_at.desc"),
        get("restaurants", "select=id,name"),
      ]);
      setOrders(o.filter(x => new Date(x.created_at) >= since));
      setRests(Object.fromEntries(r.map(x => [x.id, x])));
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [period, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader />;

  const paid = orders.filter(o => o.status === "paid");
  const pending = orders.filter(o => o.status !== "paid" && o.status !== "cancelled");
  const gmv = paid.reduce((s,o) => s + +o.total, 0);
  const restRev = Object.entries(paid.reduce((acc,o) => { acc[o.restaurant_id] = (acc[o.restaurant_id]||0) + +o.total; return acc; }, {}))
    .map(([id,rev]) => ({ id, name: rests[id]?.name || id.slice(0,8), rev }))
    .sort((a,b) => b.rev - a.rev).slice(0,8);
  const maxRev = Math.max(...restRev.map(r=>r.rev), 1);

  return (
    <Page title="Payments & Finance" sub="Transaction overview"
      actions={
        <div style={{ display:"flex", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden" }}>
          {["7","30","90"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding:"7px 16px", fontSize:12, fontWeight:600, cursor:"pointer", background: period===p ? "var(--accent)" : "var(--surface2)", color: period===p ? "#fff" : "var(--text3)", border:"none", fontFamily:"DM Sans, sans-serif" }}>
              {p}D
            </button>
          ))}
        </div>
      }>

      <div className="stat-grid mb-4">
        <StatCard label="Total GMV" value={fmt(gmv)} sub={paid.length + " transactions"} icon={Icons.dollar} color="green" />
        <StatCard label="Avg Order" value={fmt(gmv / Math.max(paid.length,1))} sub="per transaction" icon={Icons.trend} color="orange" />
        <StatCard label="Pending" value={fmtNum(pending.length)} sub="open orders" icon={Icons.activity} color="amber" />
        <StatCard label="Restaurants" value={fmtNum(Object.keys(rests).length)} sub="with transactions" icon={Icons.restaurants} color="blue" />
      </div>

      <div className="card mb-4">
        <p style={{ fontSize:13, fontWeight:700, fontFamily:"Syne,sans-serif", color:"var(--text)", marginBottom:16 }}>Revenue by Restaurant</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {restRev.map((r,i) => (
            <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:11, color:"var(--text3)", width:18, flexShrink:0, fontFamily:"DM Mono,monospace" }}>{i+1}</span>
              <span style={{ fontSize:12, color:"var(--text2)", width:140, flexShrink:0 }} className="truncate">{r.name}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:(r.rev/maxRev*100)+"%", background:"var(--accent)" }} />
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--text)", fontFamily:"DM Mono,monospace", width:90, textAlign:"right", flexShrink:0 }}>{fmt(r.rev)}</span>
            </div>
          ))}
          {restRev.length === 0 && <Empty text="No revenue data" />}
        </div>
      </div>

      <div className="table-wrap" style={{ maxHeight:"40vh", overflowY:"auto" }}>
        <table className="table">
          <thead><tr><th>Transaction</th><th>Restaurant</th><th style={{textAlign:"right"}}>Amount</th><th style={{textAlign:"center"}}>Status</th><th style={{textAlign:"right"}}>Date</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td><span className="mono">#{o.id.slice(0,10)}</span></td>
                <td style={{ fontSize:12, color:"var(--text2)" }}>{rests[o.restaurant_id]?.name || "—"}</td>
                <td style={{ textAlign:"right", fontFamily:"DM Mono,monospace", fontSize:13, fontWeight:700, color:"var(--text)" }}>{fmt(o.total)}</td>
                <td style={{ textAlign:"center" }}><Badge color={o.status==="paid"?"green":o.status==="open"?"amber":"gray"}>{o.status}</Badge></td>
                <td style={{ textAlign:"right", fontSize:11, color:"var(--text3)" }}>{fmtDate(o.created_at)}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5}><Empty /></td></tr>}
          </tbody>
        </table>
      </div>
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────
function FeedbackView({ toast }) {
  const [feedback, setFeedback] = useState([]);
  const [rests, setRests] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fb, r] = await Promise.all([
        get("feedback", "select=id,rating,comment,created_at,restaurant_id,table_number,manager_response&order=created_at.desc"),
        get("restaurants", "select=id,name"),
      ]);
      setFeedback(fb); setRests(Object.fromEntries(r.map(x => [x.id, x])));
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader />;

  const avg = feedback.length ? feedback.reduce((s,f)=>s+f.rating,0)/feedback.length : 0;
  const dist = [5,4,3,2,1].map(r => ({ r, n: feedback.filter(f=>f.rating===r).length }));
  const filtered = feedback.filter(f =>
    filter==="all" || String(f.rating)===filter ||
    (filter==="low" && f.rating<=2) || (filter==="unresponded" && !f.manager_response)
  );

  return (
    <Page title="Feedback Monitor" sub={feedback.length + " total reviews"}>
      <div className="stat-grid mb-4">
        <StatCard label="Avg Rating" value={avg.toFixed(2)+" ★"} sub={fmtNum(feedback.length)+" reviews"} icon={Icons.star} color="amber" />
        <StatCard label="Positive (4-5★)" value={fmtNum(feedback.filter(f=>f.rating>=4).length)} sub="happy customers" icon={Icons.trend} color="green" />
        <StatCard label="Negative (1-2★)" value={fmtNum(feedback.filter(f=>f.rating<=2).length)} sub="needs attention" icon={Icons.alerts} color="rose" />
        <StatCard label="Unresponded" value={fmtNum(feedback.filter(f=>!f.manager_response).length)} sub="awaiting reply" icon={Icons.feedback} color="blue" />
      </div>

      <div className="card mb-4">
        <p style={{ fontSize:13, fontWeight:700, fontFamily:"Syne,sans-serif", color:"var(--text)", marginBottom:12 }}>Rating Distribution</p>
        {dist.map(({r,n}) => (
          <div key={r} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <span style={{ fontSize:11, color:"var(--amber)", fontWeight:700, width:22, flexShrink:0 }}>{r}★</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: feedback.length?(n/feedback.length*100)+"%":"0%", background: r>=4?"var(--green)":r===3?"var(--amber)":"var(--rose)" }} />
            </div>
            <span style={{ fontSize:11, color:"var(--text3)", width:24, textAlign:"right", flexShrink:0, fontFamily:"DM Mono,monospace" }}>{n}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="filter-tabs">
          {[["all","All"],["low","Low (1-2★)"],["unresponded","Unresponded"],["5","5★"],["4","4★"],["3","3★"]].map(([v,l]) => (
            <button key={v} className={"filter-tab"+(filter===v?" active":"")} onClick={()=>setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="section-rows" style={{ maxHeight:"50vh", overflowY:"auto" }}>
        {filtered.map(f => (
          <div key={f.id} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r2)", padding:"14px 16px" }}>
            <div className="flex items-center justify-between">
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ color:"var(--amber)", fontSize:14 }}>{"★".repeat(f.rating)}{"☆".repeat(5-f.rating)}</span>
                <Badge color={f.rating>=4?"green":f.rating===3?"amber":"red"}>{f.rating}/5</Badge>
                {f.table_number && <span style={{ fontSize:11, color:"var(--text3)" }}>Table {f.table_number}</span>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:"var(--text3)" }}>
                <span style={{ color:"var(--text2)" }}>{rests[f.restaurant_id]?.name}</span>
                <span>·</span>
                <span>{timeAgo(f.created_at)}</span>
              </div>
            </div>
            {f.comment && <p style={{ fontSize:13, color:"var(--text2)", marginTop:8, fontStyle:"italic" }}>&ldquo;{f.comment}&rdquo;</p>}
            {f.manager_response && (
              <div style={{ marginTop:10, paddingLeft:12, borderLeft:"2px solid var(--accent)" }}>
                <p style={{ fontSize:10, fontWeight:700, color:"var(--accent)", marginBottom:2, textTransform:"uppercase", letterSpacing:"0.08em" }}>Manager response</p>
                <p style={{ fontSize:12, color:"var(--text3)" }}>{f.manager_response}</p>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <Empty text="No feedback matches filter" />}
      </div>
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QR HEALTH
// ─────────────────────────────────────────────────────────────────────────────
function QRHealth({ toast }) {
  const [tables, setTables] = useState([]);
  const [rests, setRests] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, r, o] = await Promise.all([
        get("tables", "select=id,number,seats,restaurant_id,qr_code_url,created_at"),
        get("restaurants", "select=id,name,is_operational"),
        get("orders", "select=id,table_id,created_at&order=created_at.desc"),
      ]);
      setTables(t); setRests(Object.fromEntries(r.map(x=>[x.id,x]))); setOrders(o);
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader />;

  const enriched = tables.map(t => {
    const to = orders.filter(o => o.table_id === t.id);
    const last = to[0]?.created_at;
    const days = last ? Math.floor((Date.now()-new Date(last))/86400000) : 999;
    const hasQr = !!t.qr_code_url;
    const inactive = to.length===0 || days>7;
    return { ...t, orderCount:to.length, lastOrder:last, daysSince:days, hasQr, inactive };
  });

  const issues = enriched.filter(t => !t.hasQr || t.inactive);
  const healthy = enriched.filter(t => t.hasQr && !t.inactive);

  const byRest = Object.entries(enriched.reduce((acc,t) => {
    if (!acc[t.restaurant_id]) acc[t.restaurant_id] = { tables:0, issues:0 };
    acc[t.restaurant_id].tables++;
    if (!t.hasQr || t.inactive) acc[t.restaurant_id].issues++;
    return acc;
  }, {})).map(([id,v]) => ({ id, name:rests[id]?.name||id.slice(0,10), ...v })).sort((a,b)=>b.issues-a.issues);

  return (
    <Page title="QR Health Monitor" sub="QR code status and table activity"
      actions={<button className="icon-btn" onClick={load}>{Icons.refresh}</button>}>

      <div className="stat-grid mb-4">
        <StatCard label="Total Tables" value={fmtNum(tables.length)} icon={Icons.table} color="blue" />
        <StatCard label="Healthy" value={fmtNum(healthy.length)} sub="QR active + recent" icon={Icons.check} color="green" />
        <StatCard label="Issues" value={fmtNum(issues.length)} sub="missing or inactive" icon={Icons.alerts} color="rose" />
        <StatCard label="No QR Code" value={fmtNum(enriched.filter(t=>!t.hasQr).length)} icon={Icons.qr} color="amber" />
      </div>

      <div className="card mb-4">
        <p style={{ fontSize:13, fontWeight:700, fontFamily:"Syne,sans-serif", color:"var(--text)", marginBottom:14 }}>Restaurant Table Health</p>
        {byRest.slice(0,12).map(r => (
          <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
            <span style={{ fontSize:12, color:"var(--text2)", width:150, flexShrink:0 }} className="truncate">{r.name}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width:r.tables?((r.tables-r.issues)/r.tables*100)+"%":"0%", background:"var(--green)" }} />
            </div>
            <span style={{ fontSize:11, color:"var(--text3)", width:90, textAlign:"right", flexShrink:0 }}>{r.tables-r.issues}/{r.tables} ok</span>
            {r.issues > 0 && <Badge color="red">{r.issues} issues</Badge>}
          </div>
        ))}
      </div>

      {issues.length > 0 && (
        <div className="table-wrap" style={{ borderColor:"rgba(244,91,108,0.2)", maxHeight:"40vh", overflowY:"auto" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(244,91,108,0.15)", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"var(--rose)", display:"inline-block" }} />
            <p style={{ fontSize:12, fontWeight:700, color:"var(--text)" }}>Tables Needing Attention ({issues.length})</p>
          </div>
          <table className="table">
            <thead><tr><th>Table</th><th>Restaurant</th><th>Orders</th><th>Issue</th><th>Last Activity</th></tr></thead>
            <tbody>
              {issues.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight:700, color:"var(--text)", fontFamily:"Syne,sans-serif" }}>T{t.number}</td>
                  <td style={{ fontSize:12, color:"var(--text2)" }}>{rests[t.restaurant_id]?.name}</td>
                  <td style={{ fontSize:12, color:"var(--text3)" }}>{t.orderCount}</td>
                  <td>{!t.hasQr ? <Badge color="red">No QR</Badge> : <Badge color="amber">Inactive {t.daysSince===999?"(never)":`(${t.daysSince}d)`}</Badge>}</td>
                  <td style={{ fontSize:11, color:"var(--text3)" }}>{t.lastOrder ? timeAgo(t.lastOrder) : "never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────────────────────────────────────────
function AlertsView({ toast }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const [orders, feedback, restaurants, tables] = await Promise.all([
        get("orders", "select=id,status,created_at,restaurant_id&order=created_at.desc&limit=500"),
        get("feedback", "select=id,rating,restaurant_id,created_at&order=created_at.desc&limit=200"),
        get("restaurants", "select=id,name,is_operational"),
        get("tables", "select=id,restaurant_id,qr_code_url"),
      ]);
      const now = Date.now();
      const rm = Object.fromEntries(restaurants.map(r=>[r.id,r]));
      const found = [];

      orders.filter(o=>o.status==="open").forEach(o => {
        const mins = (now-new Date(o.created_at))/60000;
        if (mins>45) found.push({ severity:"high", title:"Stuck Order", body:`Order ${o.id.slice(0,8)} at ${rm[o.restaurant_id]?.name} open for ${Math.floor(mins)}m`, time:o.created_at });
      });

      const recentLow = feedback.filter(f=>f.rating<=2 && now-new Date(f.created_at)<86400000*3);
      const byR = recentLow.reduce((acc,f)=>{ acc[f.restaurant_id]=(acc[f.restaurant_id]||0)+1; return acc; },{});
      Object.entries(byR).forEach(([id,n]) => {
        if (n>=2) found.push({ severity:"medium", title:"Low Rating Cluster", body:`${n} low ratings in 3 days at ${rm[id]?.name}`, time:new Date().toISOString() });
      });

      orders.filter(o=>o.status==="bill_requested").forEach(o => {
        const mins = (now-new Date(o.created_at))/60000;
        if (mins>20) found.push({ severity:"medium", title:"Long Bill Wait", body:`Bill at ${rm[o.restaurant_id]?.name} pending for ${Math.floor(mins)}m`, time:o.created_at });
      });

      const noQr = tables.filter(t=>!t.qr_code_url);
      if (noQr.length>0) found.push({ severity:"low", title:"Missing QR Codes", body:`${noQr.length} tables across ${new Set(noQr.map(t=>t.restaurant_id)).size} restaurants`, time:new Date().toISOString() });

      restaurants.filter(r=>!r.is_operational).forEach(r => {
        found.push({ severity:"low", title:"Restaurant Inactive", body:`${r.name} is currently suspended`, time:new Date().toISOString() });
      });

      const S = { high:3, medium:2, low:1 };
      setAlerts(found.sort((a,b)=>S[b.severity]-S[a.severity]));
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { generate(); }, [generate]);

  if (loading) return <Loader />;

  const high = alerts.filter(a=>a.severity==="high");
  const med  = alerts.filter(a=>a.severity==="medium");
  const low  = alerts.filter(a=>a.severity==="low");

  return (
    <Page title="Alerts & Monitoring" sub="Auto-generated from live data"
      actions={<button className="btn" onClick={generate}>{Icons.refresh} Refresh</button>}>

      <div className="counter-cards">
        <div className="counter-card high"><div className="counter-val">{high.length}</div><div className="counter-label">Critical</div></div>
        <div className="counter-card medium"><div className="counter-val">{med.length}</div><div className="counter-label">Warnings</div></div>
        <div className="counter-card low"><div className="counter-val">{low.length}</div><div className="counter-label">Info</div></div>
      </div>

      {alerts.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 0" }}>
          <div style={{ width:52, height:52, borderRadius:16, background:"rgba(45,212,160,0.1)", border:"1px solid rgba(45,212,160,0.2)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--green)", marginBottom:12 }}>{Icons.check}</div>
          <p style={{ fontSize:14, fontWeight:600, color:"var(--green)" }}>All systems healthy</p>
          <p style={{ fontSize:12, color:"var(--text3)", marginTop:4 }}>No alerts detected</p>
        </div>
      )}

      {alerts.map((a, i) => (
        <div key={i} className={"alert-item " + a.severity}>
          <div className="alert-bullet" />
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span className="alert-title">{a.title}</span>
              <Badge color={a.severity==="high"?"rose":a.severity==="medium"?"amber":"blue"}>
                {a.severity==="high"?"Critical":a.severity==="medium"?"Warning":"Info"}
              </Badge>
            </div>
            <p className="alert-body">{a.body}</p>
          </div>
          <span className="alert-time">{timeAgo(a.time)}</span>
        </div>
      ))}
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN CONTROLS
// ─────────────────────────────────────────────────────────────────────────────
function AdminControls({ toast }) {
  const [rests, setRests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await get("restaurants", "select=id,name,is_operational,theme,currency,created_at");
      setRests(r);
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (r) => {
    setSaving(r.id);
    try {
      await patch("restaurants", `id=eq.${r.id}`, { is_operational: !r.is_operational });
      toast(`${r.name} ${r.is_operational?"suspended":"reactivated"}`, "success");
      load();
    } catch (e) { toast(e.message, "error"); }
    setSaving(null);
  }, [toast, load]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(rests, null, 2)], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "orbitdine_restaurants.json";
    a.click();
    toast("Exported!", "success");
  }, [rests, toast]);

  if (loading) return <Loader />;

  return (
    <Page title="Admin Controls" sub="Platform-wide management">
      <div className="grid-2">
        <div className="card">
          <p style={{ fontSize:13, fontWeight:700, fontFamily:"Syne,sans-serif", color:"var(--text)", marginBottom:14 }}>Restaurant Status Control</p>
          <div className="section-rows" style={{ maxHeight:"60vh", overflowY:"auto" }}>
            {rests.map(r => (
              <div key={r.id} className="row-item">
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"var(--text)" }} className="truncate">{r.name}</p>
                  <p className="mono" style={{ marginTop:2, fontSize:10 }}>{r.id.slice(0,18)}…</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                  <Badge color={r.is_operational?"green":"red"}>{r.is_operational?"Active":"Off"}</Badge>
                  <button className={"btn " + (r.is_operational ? "danger" : "success")} disabled={saving===r.id} onClick={() => toggle(r)}>
                    {saving===r.id ? "…" : r.is_operational ? "Suspend" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="card">
            <p style={{ fontSize:13, fontWeight:700, fontFamily:"Syne,sans-serif", color:"var(--text)", marginBottom:14 }}>Platform Overview</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
              {[
                { label:"Total", val: rests.length },
                { label:"Active", val: rests.filter(r=>r.is_operational).length },
                { label:"Suspended", val: rests.filter(r=>!r.is_operational).length },
                { label:"Themes", val: new Set(rests.map(r=>r.theme)).size },
              ].map(s => (
                <div key={s.label} className="mini-stat">
                  <div className="mini-stat-val">{s.val}</div>
                  <div className="mini-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <p style={{ fontSize:13, fontWeight:700, fontFamily:"Syne,sans-serif", color:"var(--text)", marginBottom:12 }}>Quick Actions</p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { label:"Refresh All Data", sub:"Pull latest from Supabase", action:()=>{ load(); toast("Refreshed","success"); } },
                { label:"Export Restaurant List", sub:"Download as JSON", action: exportJSON },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"var(--r)", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}
                  onMouseOver={e=>e.currentTarget.style.borderColor="var(--border2)"}
                  onMouseOut={e=>e.currentTarget.style.borderColor="var(--border)"}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{a.label}</p>
                    <p style={{ fontSize:11, color:"var(--text3)", marginTop:1 }}>{a.sub}</p>
                  </div>
                  <span style={{ color:"var(--accent)" }}>{Icons.zap}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV + APP SHELL
// ─────────────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard",   label:"Overview",       icon:"dashboard"   },
  { id:"restaurants", label:"Restaurants",    icon:"restaurants" },
  { id:"orders",      label:"Live Orders",    icon:"orders"      },
  { id:"payments",    label:"Payments",       icon:"payments"    },
  { id:"feedback",    label:"Feedback",       icon:"feedback"    },
  { id:"qr",          label:"QR Health",      icon:"qr"          },
  { id:"alerts",      label:"Alerts",         icon:"alerts"      },
  { id:"controls",    label:"Admin Controls", icon:"settings"    },
];

export default function App() {
  const [section, setSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, toast } = useToasts();

  const current = NAV.find(n => n.id === section);

  function renderSection() {
    switch (section) {
      case "dashboard":   return <Dashboard />;
      case "restaurants": return <Restaurants toast={toast} />;
      case "orders":      return <LiveOrders toast={toast} />;
      case "payments":    return <Payments toast={toast} />;
      case "feedback":    return <FeedbackView toast={toast} />;
      case "qr":          return <QRHealth toast={toast} />;
      case "alerts":      return <AlertsView toast={toast} />;
      case "controls":    return <AdminControls toast={toast} />;
      default:            return <Dashboard />;
    }
  }

  return (
    <div className="layout">
      {/* Mobile overlay */}
      <div className={"overlay" + (sidebarOpen?" show":"")} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={"sidebar" + (sidebarOpen?" open":"")}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <div>
              <div className="logo-text">OrbitDine</div>
              <div className="logo-sub">Super Admin</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button key={item.id} className={"nav-item" + (section===item.id?" active":"")}
              onClick={() => { setSection(item.id); setSidebarOpen(false); }}>
              {Icons[item.icon]}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-chip">
            <div className="admin-avatar">SA</div>
            <div>
              <div className="admin-name">Super Admin</div>
              <div className="admin-role">Full Access</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>{Icons.menu}</button>
            <span className="breadcrumb">{current?.label}</span>
          </div>
          <div className="topbar-right">
            <div className="live-pill">
              <span className="live-dot" />
              Live
            </div>
            <span className="topbar-time">
              {new Date().toLocaleString("en-IN", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
            </span>
          </div>
        </header>

        <main className="content">
          {renderSection()}
        </main>
      </div>

      <Toasts toasts={toasts} />
    </div>
  );
}
