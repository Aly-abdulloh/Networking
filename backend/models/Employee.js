const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phone: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    hiredAt: { type: Date, required: true },
    salary: { type: Number, min: 0, default: 0 },
    address: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
