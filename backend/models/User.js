const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "employee", "customer"],
      required: true,
      default: "customer",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (_, value) => {
    delete value.passwordHash;
    delete value.tokenVersion;
    return value;
  },
});

module.exports = mongoose.model("User", userSchema);
