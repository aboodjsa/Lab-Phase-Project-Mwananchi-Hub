import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../auth";
export default function Provider() {
  const { id } = useParams(), { user } = useAuth();
  const [d, setD] = useState(null), [b, setB] = useState({ description: "", address: "", scheduledDate: "" }), [msg, setMsg] = useState("");
  useEffect(() => { api.get(`/providers/${id}`).then((r) => setD(r.data)); }, [id]);
  if (!d) return <p>Loading...</p>;
  const { provider: p, reviews } = d;
  const set = (k) => (e) => setB({ ...b, [k]: e.target.value });
  const book = async (e) => {
    e.preventDefault();
    try { await api.post("/bookings", { ...b, provider: p._id }); setMsg("Request sent. Track it in your dashboard."); } catch (x) { setMsg(x.response?.data?.message || "Could not send request"); }
  };
  return (<div>
    <div className="row">{p.photo && <img className="ava big" src={p.photo} alt={p.user?.name} />}<div><h1>{p.user?.name}</h1><p>{p.headline}</p></div></div>
    <p className="tag">{p.category?.name}</p>
    <p>{p.bio || "No bio yet."}</p>
    <p>{p.city} · {p.experienceYears} yrs experience · <b>KSh {p.hourlyRate}/hr</b> · {p.numReviews ? `${p.averageRating} ★ (${p.numReviews} reviews)` : "No reviews yet"}</p>
    {user?.role === "customer" ? (
      <form className="box" onSubmit={book}><h2>Request this service</h2>
        {msg && <p>{msg}</p>}
        <textarea placeholder="Describe the job" required value={b.description} onChange={set("description")} />
        <input placeholder="Address" required value={b.address} onChange={set("address")} />
        <input type="datetime-local" required value={b.scheduledDate} onChange={set("scheduledDate")} />
        <button>Send request</button></form>
    ) : !user && <p><Link to="/login">Log in</Link> as a customer to book.</p>}
    <h2>Reviews</h2>
    {reviews.map((r) => <div className="card" key={r._id}><b>{r.customer?.name}</b> · {r.rating} ★<p>{r.comment}</p></div>)}
    {!reviews.length && <p>No reviews yet.</p>}
  </div>);
}
