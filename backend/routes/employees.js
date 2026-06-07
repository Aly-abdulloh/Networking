const express = require("express");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const User = require("../models/User");
const Order = require("../models/Order");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const { getPagination, paginated } = require("../utils/pagination");
const {
  employeeCreateSchema,
  employeeUpdateSchema,
} = require("../validation/schemas");

const router = express.Router();

router.use(authenticate, authorize("admin"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, status } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const userFilter = {};
    if (search) {
      const term = escapeRegex(search);
      userFilter.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
      ];
    }
    const users = search
      ? await User.find({ role: "employee", ...userFilter }).select("_id")
      : null;
    const filter = { deletedAt: null };
    if (status) filter.status = status;
    if (users) filter.user = { $in: users.map((user) => user._id) };

    const [items, total] = await Promise.all([
      Employee.find(filter)
        .populate("user", "name email status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Employee.countDocuments(filter),
    ]);

    res.json(paginated(items, total, page, limit));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({
      _id: req.params.id,
      deletedAt: null,
    }).populate("user", "name email status role createdAt");
    if (!employee) {
      return res.status(404).json({ error: "Xodim topilmadi" });
    }

    const orders = await Order.find({
      createdBy: employee.user._id,
      deletedAt: null,
    })
      .populate("customer", "name company")
      .select("customer total status createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ employee, orders });
  })
);

router.post(
  "/",
  validate(employeeCreateSchema),
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
      role: "employee",
      status: req.body.status,
    });

    try {
      const employee = await Employee.create({
        user: user._id,
        phone: req.body.phone,
        position: req.body.position,
        hiredAt: req.body.hiredAt,
        salary: req.body.salary,
        address: req.body.address,
        status: req.body.status,
      });
      await employee.populate("user", "name email status");
      res.status(201).json(employee);
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  })
);

router.put(
  "/:id",
  validate(employeeUpdateSchema),
  asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({
      _id: req.params.id,
      deletedAt: null,
    });
    if (!employee) {
      return res.status(404).json({ error: "Xodim topilmadi" });
    }

    const emailOwner = await User.exists({
      _id: { $ne: employee.user },
      email: req.body.email,
    });
    if (emailOwner) {
      return res.status(409).json({ error: "Bu email avval ro'yxatdan o'tgan" });
    }

    const userUpdate = {
      $set: {
        name: req.body.name,
        email: req.body.email,
        status: req.body.status,
      },
    };
    if (req.body.status === "inactive") {
      userUpdate.$inc = { tokenVersion: 1 };
    }
    await User.findByIdAndUpdate(employee.user, userUpdate);

    Object.assign(employee, {
      phone: req.body.phone,
      position: req.body.position,
      hiredAt: req.body.hiredAt,
      salary: req.body.salary,
      address: req.body.address,
      status: req.body.status,
    });
    await employee.save();
    await employee.populate("user", "name email status");
    res.json(employee);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({
      _id: req.params.id,
      deletedAt: null,
    });
    if (!employee) {
      return res.status(404).json({ error: "Xodim topilmadi" });
    }

    employee.deletedAt = new Date();
    employee.status = "inactive";
    await employee.save();
    await User.findByIdAndUpdate(employee.user, {
      $set: { status: "inactive" },
      $inc: { tokenVersion: 1 },
    });

    res.json({ message: "Xodim arxivlandi" });
  })
);

module.exports = router;
