import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";
export default function Browse() {
  const [sp] = useSearchParams();
  const [f, setF] = useState({ search: sp.get("search") || "", category: sp.get("category") || "", city: sp.get("city") || "", minRating: "", sort: "" }), [cats, setCats] = useState([]), [list, setList] = useState([]);
  useEffect(() => { api.get("/categories").then((r) => setCats(r.data)); }, []);
  useEffect(() => { api.get("/providers", { params: f }).then((r) => setList(r.data)); }, [f]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (<div>
    <h1>Find a trusted local professional</h1>
    <div className="filters">
      <input placeholder="Search by name or skill" value={f.search} onChange={set("search")} />
      <select value={f.category} onChange={set("category")}><option value="">All categories</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
      <input placeholder="City" value={f.city} onChange={set("city")} />
      <select value={f.minRating} onChange={set("minRating")}><option value="">Any rating</option><option value="3">3+ stars</option><option value="4">4+ stars</option></select>
      <select value={f.sort} onChange={set("sort")}><option value="">Newest</option><option value="rating">Top rated</option><option value="price">Lowest price</option><option value="experience">Most experienced</option></select>
    </div>
    <div className="grid">{list.map((p) => (
      <Link key={p._id} className="card" to={`/provider/${p._id}`}>
        {p.photo && <img className="ava" src={p.photo} alt={p.user?.name} />}<h3>{p.user?.name}</h3><p>{p.headline}</p><p className="tag">{p.category?.name}</p>
        <p>{p.city} · {p.experienceYears} yrs experience</p>
        <p><b>KSh {p.hourlyRate}/hr</b> · {p.numReviews ? `${p.averageRating} ★ (${p.numReviews})` : "No reviews yet"}</p>
      </Link>))}</div>
    {!list.length && <p>No providers match these filters. Try clearing one.</p>}
  </div>);
}
