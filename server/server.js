require("dotenv").config();
require("express-async-errors");
const express = require("express"), cors = require("cors"), helmet = require("helmet"), rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

["MONGO_URI", "JWT_SECRET"].forEach((k) => {
  if (!process.env[k]) { console.error(`Missing ${k}. Add it to server/.env`); if (!process.env.VERCEL) process.exit(1); }
});

const allowed = (process.env.CLIENT_URL || "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
const isLocal = (o) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(o);

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: (o, cb) => cb(null, !o || allowed.includes(o) || isLocal(o)) }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (q, s) => s.send("ServiceHub API is running"));
app.get("/api/health", (q, s) => s.json({ status: "ok", time: new Date() }));
app.use(async (q, s, n) => { await connectDB(); n(); });

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { message: "Too many attempts. Try again in 15 minutes." } });
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api", require("./routes/services"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api", require("./routes/misc"));

app.use((q, s) => s.status(404).json({ message: `Not found: ${q.originalUrl}` }));
app.use((err, q, s, n) => {
  const bad = ["ValidationError", "CastError"].includes(err.name) || err.code === 11000;
  if (!bad) console.error(err);
  s.status(bad ? 400 : 500).json({ message: err.code === 11000 ? "Already exists" : bad ? err.message : "Server error" });
});

if (!process.env.VERCEL) app.listen(process.env.PORT || 5000, () => console.log(`API running on port ${process.env.PORT || 5000}`));
module.exports = app;
