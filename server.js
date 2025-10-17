require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const userRoutes = require("./routes/user.routes");
const profileRoutes = require("./routes/profile.routes");
// const bookingRoutes = require("./routes/booking.routes"); // To be implemented in Week 06
// const reviewRoutes = require("./routes/review.routes"); // To be implemented in Week 07

require("./config/passport"); // Configure passport strategies

const app = express();

// Trust the first proxy in front of the app (e.g., on Render)
app.set("trust proxy", 1);

// CORS Configuration
const allowedOrigins = [
  "https://caregiver-connect-api.onrender.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // This is important for cookies
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
  }),
  cookie: {},
};

if (app.get("env") === "production") {
  sessionOptions.cookie.secure = true; // Serve secure cookies in production
}

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/users", userRoutes);
app.use("/profiles", profileRoutes);
// app.use("/bookings", bookingRoutes); // To be implemented in Week 06
// app.use("/reviews", reviewRoutes); // To be implemented in Week 07

app.get("/", (req, res) => {
  // Redirect to the API documentation for a better user experience
  res.redirect("/api-docs");
});

// OAuth routes (Github)
app.get(
  "/auth/login",
  passport.authenticate("github", { scope: ["profile", "user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/api-docs" }),
  (req, res) => {
    // Successful authentication, redirect to the API docs.
    // The browser now has the session cookie.
    res.redirect("/api-docs");
  }
);

// @route   GET /auth/status
// @desc    Checks if the user is currently authenticated and returns user data.
// @access  Private
app.get("/auth/status", (req, res) => {
  // This is an alias for /users/me for frontend clarity as per the proposal
  return req.user
    ? res.status(200).json(req.user)
    : res.status(401).json({ message: "Unauthorized" });
});

// @route   GET /auth/logout
// @desc    Logs user out by destroying the session
// @access  Private (requires user to be logged in)
app.get("/auth/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/api-docs");
  });
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

// Error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
