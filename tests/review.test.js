const request = require("supertest");
const express = require("express");
const reviewRoutes = require("../routes/review.routes");
const Review = require("../models/Review");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// GET route is public, so no auth mock needed for this specific test
app.use("/reviews", reviewRoutes);

describe("GET /reviews/caregiver/:caregiverId", () => {
  it("should return all reviews for a caregiver", async () => {
    // Create dummy data
    const caregiverId = new mongoose.Types.ObjectId();
    const clientId = new mongoose.Types.ObjectId();
    const bookingId = new mongoose.Types.ObjectId();

    await new Review({
      bookingId,
      clientId,
      caregiverId,
      rating: 5,
      comment: "Excellent service!",
    }).save();

    const res = await request(app).get(`/reviews/caregiver/${caregiverId}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty("rating", 5);
    expect(res.body[0].caregiverId.toString()).toBe(caregiverId.toString());
  });

  it("should return an empty array if caregiver has no reviews", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/reviews/caregiver/${nonExistentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});
