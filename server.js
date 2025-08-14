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
const bookingRoutes = require("./routes/booking.routes");
const reviewRoutes = require("./routes/review.routes");

require("./config/passport"); // Configure passport strategies

const app = express();

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
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);
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

// Error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
