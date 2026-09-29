import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
const STEPS = [["Tell us what you need", "Pick a service, your city and describe the job."], ["Choose your professional", "Compare photos, ratings, experience and rates."], ["Book and track", "Send a request, get notified, and review the work."]];
export default function Home() {
  const nav = useNavigate();
  const [cats, setC] = useState([]), [top, setT] = useState([]), [f, setF] = useState({ category: "", city: "", search: "" });
  useEffect(() => { api.get("/categories").then((r) => setC(r.data)); api.get("/providers", { params: { sort: "rating" } }).then((r) => setT(r.data.slice(0, 4))); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const go = (e) => { e.preventDefault(); nav(`/providers?${new URLSearchParams(Object.entries(f).filter(([, v]) => v))}`); };
  return (<>
    <section className="hero"><div className="hero-in">
      <div className="hero-text">
        <h1>Skilled help for your home, booked in minutes.</h1>
        <p>Service Mwananchi Hub connects you with vetted local plumbers, electricians, cleaners and more. See who you are hiring, read real reviews, and book with confidence.</p>
        <ul><li>Photos, ratings and rates upfront</li><li>Track every booking from request to completion</li><li>Reviews only from customers who used the service</li></ul>
      </div>
      <form className="hero-form" onSubmit={go}>
        <h2>Find a professional</h2>
        <select value={f.category} onChange={set("category")}><option value="">Any service</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}</select>
        <input placeholder="Your city" value={f.city} onChange={set("city")} />
        <input placeholder="What do you need done? (optional)" value={f.search} onChange={set("search")} />
        <button>Search professionals</button>
        <p className="small">Free to browse. Pay the provider directly.</p>
      </form>
    </div></section>
    <main>
      <h2>Popular services</h2>
      <div className="cats">{cats.map((c) => <Link key={c._id} to={`/providers?category=${c._id}`} className="cat"><span>{c.icon}</span>{c.name}</Link>)}</div>
      <h2>How it works</h2>
      <div className="grid">{STEPS.map(([t, d], i) => <div className="card" key={t}><h3>{i + 1}. {t}</h3><p>{d}</p></div>)}</div>
      <h2>Top-rated professionals</h2>
      <div className="grid">{top.map((p) => (
        <Link key={p._id} className="card" to={`/provider/${p._id}`}>
          {p.photo && <img className="ava" src={p.photo} alt={p.user?.name} />}<h3>{p.user?.name}</h3><p className="tag">{p.category?.name}</p>
          <p>{p.headline}</p><p><b>KSh {p.hourlyRate}/hr</b> · {p.averageRating} ★ ({p.numReviews})</p>
        </Link>))}</div>
      <div className="band"><h2>Are you a skilled professional?</h2><p>Create a free profile, receive booking requests and grow your customer base.</p><Link className="cta" to="/register">Join as a provider</Link></div>
    </main>
  </>);
}
