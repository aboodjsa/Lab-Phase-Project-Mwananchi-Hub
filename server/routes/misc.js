const r = require("express").Router(), { Booking, Review, Provider, Notification, User, notify } = require("../models"), { protect, allow } = require("../middleware/auth");
r.use(protect);
r.post("/reviews", allow("customer"), async (q, s) => {
  const b = await Booking.findById(q.body.booking);
  if (!b || !b.customer.equals(q.user._id) || b.status !== "completed") return s.status(400).json({ message: "You can only review your own completed bookings" });
  const rv = await Review.create({ booking: b._id, customer: q.user._id, provider: b.provider, rating: q.body.rating, comment: q.body.comment });
  const all = await Review.find({ provider: b.provider });
  const p = await Provider.findByIdAndUpdate(b.provider, { numReviews: all.length, averageRating: +(all.reduce((a, x) => a + x.rating, 0) / all.length).toFixed(1) });
  await notify(p.user, `You received a ${rv.rating}-star review`);
  s.status(201).json(rv);
});
r.get("/notifications", async (q, s) => s.json(await Notification.find({ user: q.user._id }).sort("-createdAt").limit(20)));
r.put("/notifications/read", async (q, s) => { await Notification.updateMany({ user: q.user._id }, { isRead: true }); s.json({ message: "ok" }); });
r.get("/admin/users", allow("admin"), async (q, s) => s.json(await User.find().select("-password").sort("-createdAt")));
r.delete("/admin/users/:id", allow("admin"), async (q, s) => {
  if (q.params.id === String(q.user._id)) return s.status(400).json({ message: "You cannot delete yourself" });
  await Provider.deleteOne({ user: q.params.id }); await User.findByIdAndDelete(q.params.id); s.json({ message: "Deleted" });
});
r.get("/admin/stats", allow("admin"), async (q, s) => {
  const [users, providers, bookings, reviews] = await Promise.all([User.countDocuments(), Provider.countDocuments(), Booking.countDocuments(), Review.countDocuments()]);
  const by = await Booking.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]);
  s.json({ users, providers, bookings, reviews, byStatus: Object.fromEntries(by.map((x) => [x._id, x.n])) });
});
module.exports = r;
