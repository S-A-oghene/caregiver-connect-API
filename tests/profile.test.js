const request = require("supertest");
const express = require("express");
const profileRoutes = require("../routes/profile.routes");
const CaregiverProfile = require("../models/CaregiverProfile");
const User = require("../models/User");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const mockUserId = new mongoose.Types.ObjectId();

// Mock the auth middleware for protected routes if needed
jest.mock("../middleware/auth", () => (req, res, next) => {
  // Make the mock user object more complete to match a real user
  req.user = {
    id: mockUserId.toString(),
    _id: mockUserId,
    role: "caregiver",
    email: "caregiver@test.com",
  };
  next();
});

app.use("/profiles", profileRoutes);

describe("Profile GET Endpoints", () => {
  let user;
  let profile;

  beforeEach(async () => {
    user = await new User({
      _id: mockUserId,
      email: "caregiver@test.com",
      firstName: "Test",
      lastName: "Caregiver",
      role: "caregiver",
    }).save();
    profile = await new CaregiverProfile({
      userId: user._id,
      bio: "Experienced caregiver.",
      yearsOfExperience: 5,
      hourlyRate: 25,
    }).save();
  });

  it("GET /profiles - should return all caregiver profiles", async () => {
    const res = await request(app).get("/profiles");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    // Check populated user data from the controller logic
    expect(res.body[0]).toHaveProperty("bio", "Experienced caregiver.");
    expect(res.body[0].userId).toHaveProperty("email", "caregiver@test.com");
  });

  it("GET /profiles/:id - should return a single caregiver profile by user ID", async () => {
    const res = await request(app).get(`/profiles/${user._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.body.userId._id.toString()).toBe(user._id.toString());
    expect(res.body).toHaveProperty("bio", "Experienced caregiver.");
  });

  it("GET /profiles/:id - should return 404 for a non-existent profile ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/profiles/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
  });
});
