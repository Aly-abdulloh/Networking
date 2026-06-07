const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    sku: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: { type: [orderItemSchema], default: [] },
    total: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["new", "processing", "shipped", "completed", "cancelled"],
      default: "new",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    inventoryReserved: { type: Boolean, default: true },
    notes: { type: String, trim: true, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
