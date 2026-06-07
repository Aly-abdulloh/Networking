const Product = require("../models/Product");

async function buildItems(items) {
  const ids = items.map((item) => item.product);
  if (new Set(ids).size !== ids.length) {
    const error = new Error("Bir mahsulotni faqat bir marta kiriting");
    error.status = 422;
    throw error;
  }

  const products = await Product.find({
    _id: { $in: ids },
    deletedAt: null,
  });
  const byId = new Map(products.map((product) => [product._id.toString(), product]));

  return items.map((item) => {
    const product = byId.get(item.product);
    if (!product) {
      const error = new Error("Tanlangan mahsulot topilmadi");
      error.status = 422;
      throw error;
    }
    return {
      product: product._id,
      name: product.name,
      sku: product.sku,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });
}

async function reserveItems(items) {
  const reserved = [];
  try {
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product,
          deletedAt: null,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!product) {
        const error = new Error(`"${item.name}" uchun omborda yetarli qoldiq yo'q`);
        error.status = 409;
        throw error;
      }
      reserved.push(item);
    }
  } catch (error) {
    await releaseItems(reserved);
    throw error;
  }
}

async function releaseItems(items) {
  if (!items.length) return;
  await Promise.all(
    items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      })
    )
  );
}

function calculateTotal(items) {
  return items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
}

module.exports = { buildItems, reserveItems, releaseItems, calculateTotal };
