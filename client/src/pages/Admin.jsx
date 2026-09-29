import { useEffect, useState } from "react";
import api from "../api";
export default function Admin() {
  const [st, setSt] = useState(null), [users, setU] = useState([]), [cats, setC] = useState([]), [bk, setB] = useState([]), [tab, setTab] = useState("users"), [name, setName] = useState("");
  const load = () => { api.get("/admin/stats").then((r) => setSt(r.data)); api.get("/admin/users").then((r) => setU(r.data)); api.get("/categories").then((r) => setC(r.data)); api.get("/bookings").then((r) => setB(r.data)); };
  useEffect(load, []);
  const act = (fn) => async () => { await fn(); load(); };
  const by = st?.byStatus || {}, max = Math.max(1, ...Object.values(by));
  return (<div>
    <h1>Admin dashboard</h1>
    {st && <div className="stats">{[["Users", st.users], ["Providers", st.providers], ["Bookings", st.bookings], ["Reviews", st.reviews]].map(([l, n]) => <div className="stat" key={l}><b>{n}</b><span>{l}</span></div>)}</div>}
    <h2>Bookings by status</h2>
    <div className="bars">{["pending", "accepted", "in-progress", "completed", "rejected", "cancelled"].map((s) => <div key={s}><span>{s}</span><i style={{ width: `${((by[s] || 0) / max) * 100}%` }} /><b>{by[s] || 0}</b></div>)}</div>
    <div className="tabs">{["users", "bookings", "categories"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === "users" && users.map((u) => <div className="card" key={u._id}><b>{u.name}</b> · {u.email} · <span className="tag">{u.role}</span>{u.role !== "admin" && <button className="danger" onClick={act(() => api.delete(`/admin/users/${u._id}`))}>Delete</button>}</div>)}
    {tab === "bookings" && bk.map((b) => <div className="card" key={b._id}>{b.customer?.name} → {b.provider?.user?.name} · <span className="tag">{b.status}</span><button className="danger" onClick={act(() => api.delete(`/bookings/${b._id}`))}>Delete</button></div>)}
    {tab === "categories" && <>
      <form className="row" onSubmit={async (e) => { e.preventDefault(); await api.post("/categories", { name }); setName(""); load(); }}><input placeholder="New category" required value={name} onChange={(e) => setName(e.target.value)} /><button>Add</button></form>
      {cats.map((c) => <span className="tag chip" key={c._id}>{c.icon} {c.name} <button className="x" onClick={act(() => api.delete(`/categories/${c._id}`))}>×</button></span>)}</>}
  </div>);
}
