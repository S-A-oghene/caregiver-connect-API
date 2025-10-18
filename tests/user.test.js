const request = require("supertest");
const express = require("express");
const userRoutes = require("../routes/user.routes");
const User = require("../models/User");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const mockUserId = new mongoose.Types.ObjectId();

// Mock the auth middleware
jest.mock("../middleware/auth", () => (req, res, next) => {
  req.user = { id: mockUserId.toString(), role: "client" };
  next();
});

app.use("/users", userRoutes);

describe("GET /users/me", () => {
  it("should return the profile of the currently logged-in user", async () => {
    // Create a user to be found by the mock auth middleware
    await new User({
      _id: mockUserId,
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    }).save();

    const res = await request(app).get("/users/me");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("email", "test@example.com");
    expect(res.body).toHaveProperty("firstName", "Test");
    expect(res.body._id.toString()).toBe(mockUserId.toString());
  });
});
