const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { setAuthCookie, clearAuthCookie } = require("../utils/auth");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require("../validation/schemas");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring" },
});

async function userPayload(user) {
  let profile = null;
  if (user.role === "customer") {
    profile = await Customer.findOne({ user: user._id, deletedAt: null });
  }
  if (user.role === "employee") {
    profile = await Employee.findOne({ user: user._id, deletedAt: null });
  }
  return { user, profile };
}

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const exists = await User.exists({ email: req.body.email });
    if (exists) {
      return res.status(409).json({ error: "Bu email avval ro'yxatdan o'tgan" });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash,
      role: "customer",
    });

    try {
      const profile = await Customer.create({
        user: user._id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        company: req.body.company,
        city: req.body.city,
        type: "retailer",
        status: "active",
      });
      setAuthCookie(res, user);
      res.status(201).json({ user, profile });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  })
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select(
      "+passwordHash"
    );
    const valid = user && (await bcrypt.compare(req.body.password, user.passwordHash));

    if (!valid || user.status !== "active") {
      return res.status(401).json({ error: "Email yoki parol noto'g'ri" });
    }

    setAuthCookie(res, user);
    res.json(await userPayload(user));
  })
);

router.post(
  "/logout",
  authenticate,
  asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { tokenVersion: 1 },
    });
    clearAuthCookie(res);
    res.json({ message: "Tizimdan chiqildi" });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json(await userPayload(req.user));
  })
);

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("+passwordHash");
    const valid = await bcrypt.compare(
      req.body.currentPassword,
      user.passwordHash
    );
    if (!valid) {
      return res.status(422).json({ error: "Joriy parol noto'g'ri" });
    }

    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    user.tokenVersion += 1;
    await user.save();
    setAuthCookie(res, user);
    res.json({ message: "Parol yangilandi" });
  })
);

module.exports = router;
