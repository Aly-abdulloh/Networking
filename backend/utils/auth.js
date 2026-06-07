const jwt = require("jsonwebtoken");

const cookieName = process.env.COOKIE_NAME || "atlas_token";

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function cookieOptions() {
  const production = process.env.NODE_ENV === "production";
  const secure =
    process.env.COOKIE_SECURE === undefined
      ? production
      : process.env.COOKIE_SECURE === "true";
  return {
    httpOnly: true,
    secure,
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setAuthCookie(res, user) {
  res.cookie(cookieName, signToken(user), cookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(cookieName, {
    ...cookieOptions(),
    maxAge: undefined,
  });
}

module.exports = { setAuthCookie, clearAuthCookie };
