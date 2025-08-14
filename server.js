require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
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
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/users", userRoutes);
app.use("/profiles", profileRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);

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

// OAuth routes (Google)
require("./config/passport");
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.cookie("token", req.user.token, { httpOnly: true });
    res.redirect("/");
  }
);
app.get("/auth/logout", (req, res) => {
  req.logout();
  res.clearCookie("token");
  res.send("Logged out");
});
app.get("/auth/status", (req, res) => {
  if (req.isAuthenticated()) {
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
