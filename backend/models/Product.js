const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, uppercase: true, default: "", index: true },
    category: {
      type: String,
      enum: ["mens", "womens", "kids", "accessories"],
      default: "mens",
    },
    size: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 20 },
    description: { type: String, trim: true, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold;
});

productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
