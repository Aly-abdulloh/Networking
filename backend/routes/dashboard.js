const express = require("express");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Employee = require("../models/Employee");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const statusKeys = ["new", "processing", "shipped", "completed", "cancelled"];

function monthlyRevenue(orders) {
  const months = [];
  const now = new Date();

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: new Intl.DateTimeFormat("uz-UZ", { month: "short" }).format(date),
      revenue: 0,
      orders: 0,
    });
  }

  const byKey = new Map(months.map((month) => [month.key, month]));
  for (const order of orders) {
    const date = new Date(order.createdAt);
    const bucket = byKey.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (bucket) {
      bucket.orders += 1;
      if (order.status !== "cancelled") bucket.revenue += order.total;
    }
  }

  return months.map(({ key, ...month }) => month);
}

function ordersByStatus(orders) {
  return statusKeys.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));
}

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user.role === "customer") {
      const customer = await Customer.findOne({
        user: req.user._id,
        deletedAt: null,
      });
      if (!customer) {
        return res.status(404).json({ error: "Mijoz profili topilmadi" });
      }

      const orders = await Order.find({
        customer: customer._id,
        deletedAt: null,
      }).sort({ createdAt: -1 });
      const purchases = orders
        .filter((order) => order.status !== "cancelled")
        .reduce(
          (total, order) =>
            total +
            order.items.reduce((sum, item) => sum + item.quantity, 0),
          0
        );
      const spent = orders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + order.total, 0);

      return res.json({
        role: "customer",
        stats: {
          orders: orders.length,
          activeOrders: orders.filter((order) =>
            ["new", "processing", "shipped"].includes(order.status)
          ).length,
          purchases,
          spent,
        },
        monthlyRevenue: monthlyRevenue(orders),
        ordersByStatus: ordersByStatus(orders),
        recentOrders: orders.slice(0, 5),
        lowStockProducts: [],
      });
    }

    const [customerCount, productCount, employeeCount, orders, products] =
      await Promise.all([
        Customer.countDocuments({ deletedAt: null }),
        Product.countDocuments({ deletedAt: null }),
        Employee.countDocuments({ deletedAt: null }),
        Order.find({ deletedAt: null })
          .populate("customer", "name company")
          .sort({ createdAt: -1 }),
        Product.find({ deletedAt: null }),
      ]);

    const revenue = orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + order.total, 0);
    const lowStock = products
      .filter((product) => product.stock <= product.lowStockThreshold)
      .sort((a, b) => a.stock - b.stock);

    res.json({
      role: req.user.role,
      stats: {
        customers: customerCount,
        products: productCount,
        orders: orders.length,
        employees: employeeCount,
        revenue,
        lowStockCount: lowStock.length,
      },
      monthlyRevenue: monthlyRevenue(orders),
      ordersByStatus: ordersByStatus(orders),
      recentOrders: orders.slice(0, 5),
      lowStockProducts: lowStock.slice(0, 5),
    });
  })
);

module.exports = router;
