const r = require("express").Router(), bcrypt = require("bcryptjs"), jwt = require("jsonwebtoken");
const { User } = require("../models"), { protect } = require("../middleware/auth");
const out = (u) => ({ token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" }), user: { _id: u._id, name: u.name, email: u.email, role: u.role, city: u.city, phone: u.phone } });
const EMAIL = /^\S+@\S+\.\S+$/;

r.post("/register", async (q, s) => {
  const { name, password, role, phone, city } = q.body, email = (q.body.email || "").trim().toLowerCase();
  if (!name?.trim()) return s.status(400).json({ message: "Name is required" });
  if (!EMAIL.test(email)) return s.status(400).json({ message: "Enter a valid email address" });
  if (!password || password.length < 6) return s.status(400).json({ message: "Password must be at least 6 characters" });
  if (await User.findOne({ email })) return s.status(409).json({ message: "This email is already registered. Try logging in." });
  const u = await User.create({ name: name.trim(), email, phone, city, role: role === "provider" ? "provider" : "customer", password: await bcrypt.hash(password, 10) });
  s.status(201).json(out(u));
});

r.post("/login", async (q, s) => {
  const email = (q.body.email || "").trim().toLowerCase();
  const u = await User.findOne({ email });
  if (!u || !(await bcrypt.compare(q.body.password || "", u.password))) return s.status(401).json({ message: "Wrong email or password" });
  s.json(out(u));
});

r.get("/me", protect, (q, s) => s.json(q.user));

r.put("/me", protect, async (q, s) => {
  const { name, phone, city } = q.body;
  if (name !== undefined) q.user.name = name; if (phone !== undefined) q.user.phone = phone; if (city !== undefined) q.user.city = city;
  await q.user.save(); s.json(q.user);
});

r.put("/me/password", protect, async (q, s) => {
  const u = await User.findById(q.user._id);
  if (!(await bcrypt.compare(q.body.currentPassword || "", u.password))) return s.status(400).json({ message: "Current password is incorrect" });
  if (!q.body.newPassword || q.body.newPassword.length < 6) return s.status(400).json({ message: "New password must be at least 6 characters" });
  u.password = await bcrypt.hash(q.body.newPassword, 10); await u.save(); s.json({ message: "Password updated" });
});
module.exports = r;
