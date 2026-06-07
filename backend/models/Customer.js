const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    type: {
      type: String,
      enum: ["retailer", "wholesaler", "online"],
      default: "retailer",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "lead"],
      default: "active",
    },
    notes: { type: String, trim: true, default: "" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
