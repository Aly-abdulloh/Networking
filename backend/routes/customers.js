const express = require("express");
const bcrypt = require("bcryptjs");
const Customer = require("../models/Customer");
const User = require("../models/User");
const Order = require("../models/Order");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const { getPagination, paginated } = require("../utils/pagination");
const {
  customerSchema,
  customerAccountSchema,
} = require("../validation/schemas");

const router = express.Router();

router.use(authenticate, authorize("admin", "employee"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, status, type } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = { deletedAt: null };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      const term = escapeRegex(search);
      filter.$or = ["name", "company", "email", "phone"].map((key) => ({
        [key]: { $regex: term, $options: "i" },
      }));
    }

    const [items, total] = await Promise.all([
      Customer.find(filter)
        .populate("user", "email status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(filter),
    ]);

    res.json(paginated(items, total, page, limit));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({
      _id: req.params.id,
      deletedAt: null,
    }).populate("user", "email status");

    if (!customer) {
      return res.status(404).json({ error: "Mijoz topilmadi" });
    }

    const orders = await Order.find({
      customer: customer._id,
      deletedAt: null,
    })
      .select("total status items createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ customer, orders });
  })
);

router.post(
  "/",
  validate(customerSchema),
  asyncHandler(async (req, res) => {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  })
);

router.put(
  "/:id",
  validate(customerSchema),
  asyncHandler(async (req, res) => {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ error: "Mijoz topilmadi" });
    }

    if (customer.user) {
      await User.findByIdAndUpdate(customer.user, {
        name: customer.name,
        ...(customer.email ? { email: customer.email } : {}),
      });
    }

    res.json(customer);
  })
);

router.post(
  "/:id/account",
  authorize("admin"),
  validate(customerAccountSchema),
  asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!customer) {
      return res.status(404).json({ error: "Mijoz topilmadi" });
    }
    if (customer.user) {
      return res.status(409).json({ error: "Mijoz accounti allaqachon mavjud" });
    }

    const exists = await User.exists({ email: req.body.email });
    if (exists) {
      return res.status(409).json({ error: "Bu email avval ro'yxatdan o'tgan" });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      name: customer.name,
      email: req.body.email,
      passwordHash,
      role: "customer",
    });

    customer.user = user._id;
    customer.email = req.body.email;
    await customer.save();

    res.status(201).json({ message: "Mijoz accounti yaratildi" });
  })
);

router.delete(
  "/:id",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!customer) {
      return res.status(404).json({ error: "Mijoz topilmadi" });
    }

    customer.deletedAt = new Date();
    customer.status = "inactive";
    await customer.save();

    if (customer.user) {
      await User.findByIdAndUpdate(customer.user, {
        $set: { status: "inactive" },
        $inc: { tokenVersion: 1 },
      });
    }

    res.json({ message: "Mijoz arxivlandi" });
  })
);

module.exports = router;
