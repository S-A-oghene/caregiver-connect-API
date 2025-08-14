const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const userController = require("../controllers/userController");

// This auth middleware is assumed to exist at middleware/auth.js
// It decodes the JWT from the cookie and attaches the user to the request.
const auth = require("../middleware/auth");

// @route   GET /users/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", auth, userController.getCurrentUser);

// @route   PUT /users/me
// @desc    Update current user's profile
// @access  Private
router.put(
  "/me",
  [
    auth,
    // Add any validation rules you need here
    check("firstName", "First name cannot be empty").optional().not().isEmpty(),
  ],
  userController.updateCurrentUser
);

module.exports = router;