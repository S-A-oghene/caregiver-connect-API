const User = require("../models/User");
const { validationResult } = require("express-validator");

// @route   GET /users/me
// @desc    Get current user's profile
// @access  Private
exports.getCurrentUser = async (req, res, next) => {
  try {
    // req.user is attached by the auth middleware from the cookie token
    const user = await User.findById(req.user.id).select("-googleId -githubId");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @route   PUT /users/me
// @desc    Update current user's profile
// @access  Private
exports.updateCurrentUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, phoneNumber, address } = req.body;

  // Build a fields object to update
  const profileFields = {};
  if (firstName) profileFields.firstName = firstName;
  if (lastName || lastName === "") profileFields.lastName = lastName;
  if (phoneNumber) profileFields.phoneNumber = phoneNumber;
  if (address) profileFields.address = address;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select("-googleId -githubId");

    res.json(user);
  } catch (err) {
    next(err);
  }
};