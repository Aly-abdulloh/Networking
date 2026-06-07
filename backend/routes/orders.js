const express = require("express");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const { getPagination, paginated } = require("../utils/pagination");
const {
  buildItems,
  reserveItems,
  releaseItems,
  calculateTotal,
} = require("../utils/orderInventory");
const {
  orderCreateSchema,
  orderUpdateSchema,
} = require("../validation/schemas");

const router = express.Router();

router.use(authenticate, authorize("admin", "employee"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, search } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = { deletedAt: null };

    if (status) filter.status = status;
    if (search) {
      const term = escapeRegex(search);
      const customers = await Customer.find({
        deletedAt: null,
        $or: [
          { name: { $regex: term, $options: "i" } },
          { company: { $regex: term, $options: "i" } },
        ],
      }).select("_id");
      filter.customer = { $in: customers.map((customer) => customer._id) };
    }

    const [items, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name company")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json(paginated(items, total, page, limit));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({
      _id: req.params.id,
      deletedAt: null,
    })
      .populate("customer")
      .populate("createdBy", "name email role");

    if (!order) {
      return res.status(404).json({ error: "Buyurtma topilmadi" });
    }

    res.json(order);
  })
);

router.post(
  "/",
  validate(orderCreateSchema),
  asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({
      _id: req.body.customer,
      deletedAt: null,
      status: { $ne: "inactive" },
    });
    if (!customer) {
      return res.status(422).json({ error: "Faol mijozni tanlang" });
    }

    const items = await buildItems(req.body.items);
    const inventoryReserved = req.body.status !== "cancelled";
    if (inventoryReserved) await reserveItems(items);

    try {
      const order = await Order.create({
        customer: customer._id,
        items,
        total: calculateTotal(items),
        status: req.body.status,
        notes: req.body.notes,
        createdBy: req.user._id,
        inventoryReserved,
      });
      await order.populate("customer", "name company");
      res.status(201).json(order);
    } catch (error) {
      if (inventoryReserved) await releaseItems(items);
      throw error;
    }
  })
);

router.put(
  "/:id",
  validate(orderUpdateSchema),
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({
      _id: req.params.id,
      deletedAt: null,
    });
    if (!order) {
      return res.status(404).json({ error: "Buyurtma topilmadi" });
    }

    const customerId = req.body.customer || order.customer.toString();
    const customer = await Customer.findOne({
      _id: customerId,
      deletedAt: null,
      status: { $ne: "inactive" },
    });
    if (!customer) {
      return res.status(422).json({ error: "Faol mijozni tanlang" });
    }

    const oldItems = order.items.map((item) => item.toObject());
    const oldReserved = order.inventoryReserved;
    const nextItems = req.body.items
      ? await buildItems(req.body.items)
      : oldItems;
    const nextStatus = req.body.status || order.status;
    const nextReserved = nextStatus !== "cancelled";

    if (oldReserved) await releaseItems(oldItems);

    try {
      if (nextReserved) await reserveItems(nextItems);
    } catch (error) {
      if (oldReserved) await reserveItems(oldItems);
      throw error;
    }

    try {
      order.customer = customer._id;
      order.items = nextItems;
      order.total = calculateTotal(nextItems);
      order.status = nextStatus;
      order.inventoryReserved = nextReserved;
      if (req.body.notes !== undefined) order.notes = req.body.notes;
      await order.save();
    } catch (error) {
      if (nextReserved) await releaseItems(nextItems);
      if (oldReserved) await reserveItems(oldItems);
      throw error;
    }

    await order.populate("customer", "name company");
    res.json(order);
  })
);

router.delete(
  "/:id",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!order) {
      return res.status(404).json({ error: "Buyurtma topilmadi" });
    }

    if (order.inventoryReserved) {
      await releaseItems(order.items);
      order.inventoryReserved = false;
    }
    order.deletedAt = new Date();
    await order.save();

    res.json({ message: "Buyurtma arxivlandi va qoldiq qaytarildi" });
  })
);

module.exports = router;
