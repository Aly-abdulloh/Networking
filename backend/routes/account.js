const express = require("express");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { authenticate, authorize } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination, paginated } = require("../utils/pagination");

const router = express.Router();

router.use(authenticate, authorize("customer"));

async function customerFor(userId) {
  return Customer.findOne({ user: userId, deletedAt: null });
}

router.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const customer = await customerFor(req.user._id);
    if (!customer) {
      return res.status(404).json({ error: "Mijoz profili topilmadi" });
    }

    const { page, limit, skip } = getPagination(req.query);
    const filter = { customer: customer._id, deletedAt: null };
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json(paginated(items, total, page, limit));
  })
);

router.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const customer = await customerFor(req.user._id);
    const order = await Order.findOne({
      _id: req.params.id,
      customer: customer?._id,
      deletedAt: null,
    });
    if (!order) {
      return res.status(404).json({ error: "Buyurtma topilmadi" });
    }
    res.json(order);
  })
);

router.get(
  "/purchases",
  asyncHandler(async (req, res) => {
    const customer = await customerFor(req.user._id);
    if (!customer) {
      return res.status(404).json({ error: "Mijoz profili topilmadi" });
    }

    const purchases = await Order.aggregate([
      {
        $match: {
          customer: customer._id,
          deletedAt: null,
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $last: "$items.name" },
          sku: { $last: "$items.sku" },
          quantity: { $sum: "$items.quantity" },
          spent: {
            $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] },
          },
          lastPurchasedAt: { $max: "$createdAt" },
        },
      },
      { $sort: { lastPurchasedAt: -1 } },
    ]);

    res.json(purchases);
  })
);

module.exports = router;
