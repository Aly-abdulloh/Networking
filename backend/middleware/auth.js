const jwt = require("jsonwebtoken");
const User = require("../models/User");

const cookieName = process.env.COOKIE_NAME || "atlas_token";

async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.[cookieName];
    if (!token) {
      return res.status(401).json({ error: "Tizimga kirish talab qilinadi" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (
      !user ||
      user.status !== "active" ||
      user.tokenVersion !== payload.tokenVersion
    ) {
      return res.status(401).json({ error: "Sessiya haqiqiy emas" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Sessiya muddati tugagan" });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Bu amal uchun ruxsat yo'q" });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
