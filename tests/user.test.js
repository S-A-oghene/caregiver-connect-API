const request = require("supertest");
const express = require("express");
const userRoutes = require("../routes/user.routes");
const User = require("../models/User");
const mongoose = require("mongoose");

// We create a new app instance for our tests and only use the user routes
const app = express();
app.use(express.json());

// Mock the auth middleware to simulate a logged-in user
jest.mock("../middleware/auth", () => (req, res, next) => {
  // This ID will be used in the test to find the correct user
  req.user = { id: "65b9a7b9f1d3e4c8a8b4f8b1", role: "client" };
  next();
});

app.use("/users", userRoutes);

describe("GET /users/me", () => {
  it("should return user profile if authenticated", async () => {
    // Create dummy data
    const mockUser = {
      _id: new mongoose.Types.ObjectId("65b9a7b9f1d3e4c8a8b4f8b1"),
      googleId: "12345",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      role: "client",
    };
    await new User(mockUser).save();

    const res = await request(app).get("/users/me");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("email", "test@example.com");
    expect(res.body._id).toBe("65b9a7b9f1d3e4c8a8b4f8b1");
  });
});
