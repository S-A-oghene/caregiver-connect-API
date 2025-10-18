const request = require("supertest");
const express = require("express");
const reviewRoutes = require("../routes/review.routes");
const Review = require("../models/Review");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const mockClientId = new mongoose.Types.ObjectId();
const mockCaregiverId = new mongoose.Types.ObjectId();

// Mock the auth middleware for protected routes
jest.mock("../middleware/auth", () => (req, res, next) => {
  req.user = { id: mockClientId.toString(), role: "client" };
  next();
});

app.use("/reviews", reviewRoutes);

describe("GET /reviews/caregiver/:caregiverId", () => {
  it("should return all reviews for a specific caregiver", async () => {
    // Create dummy data
    await new Review({
      clientId: mockClientId,
      caregiverId: mockCaregiverId,
      bookingId: new mongoose.Types.ObjectId(),
      rating: 5,
      comment: "Excellent care!",
    }).save();

    const res = await request(app).get(`/reviews/caregiver/${mockCaregiverId}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].caregiverId.toString()).toBe(mockCaregiverId.toString());
    expect(res.body[0]).toHaveProperty("comment", "Excellent care!");
  });
});
