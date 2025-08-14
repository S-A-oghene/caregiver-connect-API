const request = require("supertest");
const express = require("express");
const profileRoutes = require("../routes/profile.routes");
const User = require("../models/User");
const CaregiverProfile = require("../models/CaregiverProfile");
const mongoose = require("mongoose");

// We create a new app instance for our tests and only use the profile routes
const app = express();
app.use(express.json());

// Mock the auth middleware. For profile routes, we don't need it for GET requests
jest.mock("../middleware/auth", () => (req, res, next) => {
  req.user = { id: "mockUserId", role: "caregiver" };
  next();
});

app.use("/profiles", profileRoutes);

describe("GET /profiles", () => {
  it("should return all caregiver profiles", async () => {
    // Create dummy data
    const user = await new User({
      googleId: "1",
      email: "caregiver@test.com",
      firstName: "Test",
      lastName: "Caregiver",
      role: "caregiver",
    }).save();
    await new CaregiverProfile({ userId: user._id, bio: "Test bio" }).save();

    const res = await request(app).get("/profiles");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty("bio", "Test bio");
  });
});

describe("GET /profiles/:id", () => {
  it("should return a caregiver profile by user ID", async () => {
    // Create dummy data
    const user = await new User({
      googleId: "2",
      email: "caregiver2@test.com",
      firstName: "Test2",
      lastName: "Caregiver",
      role: "caregiver",
    }).save();
    await new CaregiverProfile({ userId: user._id, bio: "Another bio" }).save();

    const res = await request(app).get(`/profiles/${user._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("bio", "Another bio");
    expect(res.body.userId._id.toString()).toBe(user._id.toString());
  });

  it("should return 404 if profile not found", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/profiles/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
  });
});
