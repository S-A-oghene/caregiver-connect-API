require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

const userRoutes = require("./routes/user.routes");
const profileRoutes = require("./routes/profile.routes");
const bookingRoutes = require("./routes/booking.routes");
const reviewRoutes = require("./routes/review.routes");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/users", userRoutes);
app.use("/profiles", profileRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);

app.get("/", (req, res) => {
  // Redirect to the API documentation for a better user experience
  res.redirect("/api-docs");
});

// Swagger API docs
const swaggerFile = path.join(__dirname, "swagger", "swagger.json");
if (fs.existsSync(swaggerFile)) {
  const swaggerDocument = require(swaggerFile);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  app.get("/api-docs", (req, res) =>
    res.status(404).send("Swagger documentation not found.")
  );
}

// OAuth routes (Github)
require("./config/passport");
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["profile", "user:email"] })
);
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    // Token is now generated here, only at login time.
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.redirect("/");
  }
);
app.get("/auth/logout", (req, res, next) => { // Add next to handle errors properly
  // req.logout() now requires a callback function.
  req.logout(function(err) {
    if (err) { return next(err); }
    res.clearCookie("token");
    res.redirect("/");
  });
});
app.get("/auth/status", (req, res) => {
  if (req.isAuthenticated()) {
    // req.user is now the clean user object.
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
