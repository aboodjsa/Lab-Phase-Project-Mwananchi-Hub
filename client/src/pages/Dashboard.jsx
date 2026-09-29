import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../auth";
const next = { pending: ["accepted", "rejected"], accepted: ["in-progress"], "in-progress": ["completed"] };
function ProfileForm() {
  const [cats, setCats] = useState([]), [p, setP] = useState({ category: "", bio: "", experienceYears: 0, hourlyRate: "", city: "" }), [id, setId] = useState(null), [msg, setMsg] = useState("");
  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data));
    api.get("/providers/me").then((r) => { if (r.data) { setId(r.data._id); setP(r.data); } });
  }, []);
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { category: p.category, bio: p.bio, experienceYears: p.experienceYears, hourlyRate: p.hourlyRate, city: p.city, photo: p.photo, headline: p.headline };
      if (id) await api.put(`/providers/${id}`, body); else setId((await api.post("/providers", body)).data._id);
      setMsg("Profile saved");
    } catch (x) { setMsg(x.response?.data?.message || "Could not save"); }
  };
  return (<form className="box" onSubmit={save}><h2>My public profile</h2>{msg && <p>{msg}</p>}
    <select required value={p.category} onChange={set("category")}><option value="">Choose your service</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
    <textarea placeholder="About you" value={p.bio || ""} onChange={set("bio")} />
    <input type="number" min="0" placeholder="Years of experience" value={p.experienceYears} onChange={set("experienceYears")} />
    <input type="number" min="0" placeholder="Hourly rate (KSh)" required value={p.hourlyRate} onChange={set("hourlyRate")} />
    <input placeholder="City" value={p.city || ""} onChange={set("city")} /><input placeholder="Headline (e.g. Licensed plumber)" value={p.headline || ""} onChange={set("headline")} /><input placeholder="Photo URL" value={p.photo || ""} onChange={set("photo")} />
    <button>Save profile</button></form>);
}
export default function Dashboard() {
  const { user } = useAuth(), isP = user.role === "provider";
  const [bookings, setB] = useState([]), [notes, setN] = useState([]), [tab, setTab] = useState("all");
  const c = (s) => bookings.filter((b) => b.status === s).length;
  const load = () => { api.get("/bookings").then((r) => setB(r.data)); api.get("/notifications").then((r) => setN(r.data)); };
  useEffect(load, []);
  const status = async (id, st) => { await api.put(`/bookings/${id}/status`, { status: st }); load(); };
  const del = async (id) => { await api.delete(`/bookings/${id}`); load(); };
  const readAll = async () => { await api.put("/notifications/read"); load(); };
  const review = async (b) => {
    const rating = +prompt("Rating from 1 to 5"); if (!rating) return;
    try { await api.post("/reviews", { booking: b._id, rating, comment: prompt("Comment (optional)") || "" }); alert("Thanks for your review!"); } catch (x) { alert(x.response?.data?.message || "Could not save review"); }
  };
  return (<div>
    <h1>{isP ? "Provider" : "Customer"} dashboard</h1>
    {isP && <ProfileForm />}
    <h2>Notifications ({notes.filter((n) => !n.isRead).length} new)</h2>
    {notes.slice(0, 5).map((n) => <p key={n._id} className={n.isRead ? "" : "new"}>{n.message}</p>)}
    {!!notes.length && <button onClick={readAll}>Mark all as read</button>}
    <div className="stats">{[["Total", bookings.length], ["Pending", c("pending")], ["Active", c("accepted") + c("in-progress")], ["Completed", c("completed")]].map(([l, n]) => <div className="stat" key={l}><b>{n}</b><span>{l}</span></div>)}</div>
    <h2>Bookings</h2>
    <div className="tabs">{["all", "pending", "accepted", "in-progress", "completed", "cancelled"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
    {bookings.filter((b) => tab === "all" || b.status === tab).map((b) => (<div className="card" key={b._id}>
      {!isP && b.provider?.photo && <img className="ava" src={b.provider.photo} alt="" />}<b>{isP ? b.customer?.name : b.provider?.user?.name}</b> · {b.provider?.category?.name} · <span className="tag">{b.status}</span>
      <p>{b.description}</p><p>{b.address} · {new Date(b.scheduledDate).toLocaleString()}</p>
      {isP && (next[b.status] || []).map((s) => <button key={s} onClick={() => status(b._id, s)}>Mark {s}</button>)}
      {!isP && ["pending", "accepted"].includes(b.status) && <button onClick={() => status(b._id, "cancelled")}>Cancel</button>}
      {!isP && b.status === "completed" && <button onClick={() => review(b)}>Leave a review</button>}
      {!isP && <button className="danger" onClick={() => del(b._id)}>Delete</button>}
    </div>))}
    {!bookings.length && <p>No bookings yet.</p>}
  </div>);
}
