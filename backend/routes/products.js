const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const { getPagination, paginated } = require("../utils/pagination");
const { productSchema } = require("../validation/schemas");

const router = express.Router();

router.use(authenticate, authorize("admin", "employee"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, category, lowStock } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = { deletedAt: null };

    if (category) filter.category = category;
    if (search) {
      const term = escapeRegex(search);
      filter.$or = ["name", "sku"].map((key) => ({
        [key]: { $regex: term, $options: "i" },
      }));
    }

    if (lowStock === "true") {
      filter.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
    }

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json(paginated(items, total, page, limit));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!product) {
      return res.status(404).json({ error: "Mahsulot topilmadi" });
    }

    const orders = await Order.find({
      "items.product": product._id,
      deletedAt: null,
    })
      .populate("customer", "name company")
      .select("customer status total createdAt items")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ product, orders });
  })
);

router.post(
  "/",
  authorize("admin"),
  validate(productSchema),
  asyncHandler(async (req, res) => {
    if (req.body.sku) {
      const exists = await Product.exists({
        sku: req.body.sku,
        deletedAt: null,
      });
      if (exists) {
        return res.status(409).json({ error: "Bu SKU avval ishlatilgan" });
      }
    }

    const product = await Product.create(req.body);
    res.status(201).json(product);
  })
);

router.put(
  "/:id",
  validate(productSchema),
  asyncHandler(async (req, res) => {
    if (req.body.sku) {
      const exists = await Product.exists({
        _id: { $ne: req.params.id },
        sku: req.body.sku,
        deletedAt: null,
      });
      if (exists) {
        return res.status(409).json({ error: "Bu SKU avval ishlatilgan" });
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Mahsulot topilmadi" });
    }

    res.json(product);
  })
);

router.delete(
  "/:id",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Mahsulot topilmadi" });
    }

    res.json({ message: "Mahsulot arxivlandi" });
  })
);

module.exports = router;
