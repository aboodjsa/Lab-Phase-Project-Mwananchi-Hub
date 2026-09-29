const jwt = require("jsonwebtoken"), { User } = require("../models");
exports.protect = async (req, res, next) => {
  try {
    const t = (req.headers.authorization || "").split(" ")[1];
    if (!t) return res.status(401).json({ message: "Not authorized" });
    req.user = await User.findById(jwt.verify(t, process.env.JWT_SECRET).id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (e) { res.status(401).json({ message: "Invalid token" }); }
};
exports.allow = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: "Forbidden" });
