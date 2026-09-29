const r = require("express").Router(), { Booking, Provider, notify } = require("../models"), { protect, allow } = require("../middleware/auth");
const pop = (x) => x.populate("customer", "name phone").populate({ path: "provider", populate: [{ path: "user", select: "name" }, { path: "category", select: "name" }] });
r.use(protect);
r.post("/", allow("customer"), async (q, s) => {
  const p = await Provider.findById(q.body.provider); if (!p) return s.status(404).json({ message: "Provider not found" });
  const { description, address, scheduledDate } = q.body;
  const b = await Booking.create({ customer: q.user._id, provider: p._id, description, address, scheduledDate });
  await notify(p.user, `New booking request from ${q.user.name}`);
  s.status(201).json(b);
});
r.get("/", async (q, s) => {
  const f = {};
  if (q.user.role === "customer") f.customer = q.user._id;
  if (q.user.role === "provider") { const p = await Provider.findOne({ user: q.user._id }); f.provider = p ? p._id : null; }
  s.json(await pop(Booking.find(f).sort("-createdAt")));
});
r.put("/:id/status", async (q, s) => {
  const b = await Booking.findById(q.params.id).populate("provider"); if (!b) return s.status(404).json({ message: "Not found" });
  const st = q.body.status;
  const isP = q.user.role === "provider" && b.provider.user.equals(q.user._id), isC = b.customer.equals(q.user._id);
  const ok = (isP && ["accepted", "rejected", "in-progress", "completed"].includes(st)) || (isC && st === "cancelled") || q.user.role === "admin";
  if (!ok) return s.status(403).json({ message: "Forbidden" });
  b.status = st; await b.save();
  await notify(isP ? b.customer : b.provider.user, `Booking status changed to ${st}`);
  s.json(b);
});
r.delete("/:id", async (q, s) => {
  const b = await Booking.findById(q.params.id); if (!b) return s.status(404).json({ message: "Not found" });
  if (q.user.role !== "admin" && !b.customer.equals(q.user._id)) return s.status(403).json({ message: "Forbidden" });
  await b.deleteOne(); s.json({ message: "Deleted" });
});
module.exports = r;
