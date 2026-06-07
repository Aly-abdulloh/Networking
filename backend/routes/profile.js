const express = require("express");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { profileSchema } = require("../validation/schemas");

const router = express.Router();

router.use(authenticate);

async function getProfile(user) {
  if (user.role === "customer") {
    return Customer.findOne({ user: user._id, deletedAt: null });
  }
  if (user.role === "employee") {
    return Employee.findOne({ user: user._id, deletedAt: null });
  }
  return null;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({ user: req.user, profile: await getProfile(req.user) });
  })
);

router.put(
  "/",
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );

    let profile = null;
    if (user.role === "customer") {
      profile = await Customer.findOneAndUpdate(
        { user: user._id, deletedAt: null },
        {
          name: req.body.name,
          ...(req.body.phone !== undefined ? { phone: req.body.phone } : {}),
          ...(req.body.company !== undefined ? { company: req.body.company } : {}),
          ...(req.body.city !== undefined ? { city: req.body.city } : {}),
        },
        { new: true, runValidators: true }
      );
    }

    if (user.role === "employee") {
      profile = await Employee.findOneAndUpdate(
        { user: user._id, deletedAt: null },
        {
          ...(req.body.phone !== undefined ? { phone: req.body.phone } : {}),
          ...(req.body.address !== undefined ? { address: req.body.address } : {}),
        },
        { new: true, runValidators: true }
      );
    }

    res.json({ user, profile });
  })
);

module.exports = router;
