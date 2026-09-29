const r = require("express").Router(), { Category, Provider, Review } = require("../models"), { protect, allow } = require("../middleware/auth");
const pop = (x) => x.populate("user", "name phone city").populate("category", "name");
const nf = (s) => s.status(404).json({ message: "Not found" });
// Categories
r.get("/categories", async (q, s) => s.json(await Category.find().sort("name")));
r.post("/categories", protect, allow("admin"), async (q, s) => s.status(201).json(await Category.create(q.body)));
r.put("/categories/:id", protect, allow("admin"), async (q, s) => s.json(await Category.findByIdAndUpdate(q.params.id, q.body, { new: true, runValidators: true })));
r.delete("/categories/:id", protect, allow("admin"), async (q, s) => { await Category.findByIdAndDelete(q.params.id); s.json({ message: "Deleted" }); });
// Providers: search, filter, sort
r.get("/providers", async (q, s) => {
  const { search, category, city, minRating, sort } = q.query, f = {};
  if (category) f.category = category;
  if (city) f.city = new RegExp(city, "i");
  if (minRating) f.averageRating = { $gte: +minRating };
  const order = { rating: { averageRating: -1 }, price: { hourlyRate: 1 }, experience: { experienceYears: -1 } }[sort] || { createdAt: -1 };
  let list = await pop(Provider.find(f).sort(order));
  if (search) { const x = search.toLowerCase(); list = list.filter((p) => `${p.user?.name} ${p.bio || ""} ${p.category?.name}`.toLowerCase().includes(x)); }
  s.json(list);
});
r.get("/providers/me", protect, async (q, s) => s.json(await Provider.findOne({ user: q.user._id })));
r.get("/providers/:id", async (q, s) => {
  const p = await pop(Provider.findById(q.params.id)); if (!p) return nf(s);
  s.json({ provider: p, reviews: await Review.find({ provider: p._id }).populate("customer", "name").sort("-createdAt") });
});
r.post("/providers", protect, allow("provider"), async (q, s) => {
  const { user, averageRating, numReviews, ...b } = q.body;
  s.status(201).json(await Provider.create({ ...b, user: q.user._id }));
});
const own = async (q, s) => {
  const p = await Provider.findById(q.params.id); if (!p) { nf(s); return null; }
  if (q.user.role !== "admin" && !p.user.equals(q.user._id)) { s.status(403).json({ message: "Forbidden" }); return null; }
  return p;
};
r.put("/providers/:id", protect, allow("provider", "admin"), async (q, s) => {
  const p = await own(q, s); if (!p) return;
  const { user, averageRating, numReviews, ...b } = q.body; Object.assign(p, b); s.json(await p.save());
});
r.delete("/providers/:id", protect, allow("provider", "admin"), async (q, s) => {
  const p = await own(q, s); if (!p) return; await p.deleteOne(); s.json({ message: "Deleted" });
});
module.exports = r;
