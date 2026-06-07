require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Customer = require("./models/Customer");
const Product = require("./models/Product");
const Order = require("./models/Order");

async function ensureAdmin() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL va ADMIN_PASSWORD env qiymatlarini kiriting"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        passwordHash,
        role: "admin",
        status: "active",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function ensureDemoData() {
  let customers = await Customer.find({ deletedAt: null });
  if (customers.length === 0) {
    customers = await Customer.insertMany([
      {
        name: "Dilshod Karimov",
        company: "Moda Butik",
        email: "dilshod@modabutik.uz",
        phone: "+998 90 123 45 67",
        city: "Toshkent",
        type: "retailer",
        status: "active",
      },
      {
        name: "Nilufar Yusupova",
        company: "Style Market",
        email: "nilufar@stylemarket.uz",
        phone: "+998 91 234 56 78",
        city: "Samarqand",
        type: "wholesaler",
        status: "active",
      },
      {
        name: "Sardor Aliyev",
        company: "Trend Shop",
        email: "sardor@trendshop.uz",
        phone: "+998 93 345 67 89",
        city: "Buxoro",
        type: "online",
        status: "lead",
      },
    ]);
  }

  let products = await Product.find({ deletedAt: null });
  if (products.length === 0) {
    products = await Product.insertMany([
      {
        name: "Erkaklar ko'ylagi",
        sku: "MEN-SH-001",
        category: "mens",
        size: "M-XXL",
        price: 85000,
        stock: 320,
        lowStockThreshold: 50,
      },
      {
        name: "Ayollar libosi",
        sku: "WMN-DR-014",
        category: "womens",
        size: "S-L",
        price: 145000,
        stock: 18,
        lowStockThreshold: 30,
      },
      {
        name: "Bolalar futbolkasi",
        sku: "KID-TS-007",
        category: "kids",
        size: "2-10 yosh",
        price: 45000,
        stock: 540,
        lowStockThreshold: 80,
      },
    ]);
  }

  const orderCount = await Order.countDocuments({ deletedAt: null });
  if (orderCount === 0 && customers.length > 1 && products.length > 1) {
    await Order.create({
      customer: customers[0]._id,
      items: [
        {
          product: products[0]._id,
          name: products[0].name,
          sku: products[0].sku,
          quantity: 5,
          unitPrice: products[0].price,
        },
        {
          product: products[1]._id,
          name: products[1].name,
          sku: products[1].sku,
          quantity: 2,
          unitPrice: products[1].price,
        },
      ],
      total: products[0].price * 5 + products[1].price * 2,
      status: "completed",
      inventoryReserved: true,
    });
  }

  await Order.updateMany(
    { inventoryReserved: { $exists: false } },
    [
      {
        $set: {
          inventoryReserved: { $ne: ["$status", "cancelled"] },
        },
      },
    ]
  );
}

async function seed() {
  await connectDB();
  await ensureAdmin();
  await ensureDemoData();
  console.log("[SEED] Admin va boshlang'ich ma'lumotlar tayyor.");
  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error("[SEED] Xato:", error.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
