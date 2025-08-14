const express = require("express");
const passport = require("passport");
const router = express.Router();

// @route   GET /auth/login
// @desc    Initiates GitHub OAuth login
// @access  Public
router.get(
  "/login",
  passport.authenticate("github", { scope: ["profile", "user:email"] })
);

// @route   GET /auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/api-docs" }), // Redirect to docs on failure
  (req, res) => {
    // Successful authentication, redirect to the API docs.
    // The browser now has the session cookie.
    res.redirect("/api-docs");
  }
);

// @route   GET /auth/logout
// @desc    Logs user out by destroying the session
// @access  Private (requires user to be logged in)
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    // After logout, redirect to a public page, like the API docs.
    res.redirect("/api-docs");
  });
});

module.exports = router;

