const request = require("supertest");
const express = require("express");
const bookingRoutes = require("../routes/booking.routes");
const User = require("../models/User");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const mockUserId = new mongoose.Types.ObjectId();

// Mock the auth middleware to simulate a logged-in user
jest.mock("../middleware/auth", () => (req, res, next) => {
  req.user = { id: mockUserId.toString(), role: "client" };
  next();
});

app.use("/bookings", bookingRoutes);

describe("GET /bookings", () => {
  it("should return all bookings for the logged-in user", async () => {
    // Create dummy data
    const caregiverId = new mongoose.Types.ObjectId();
    await new Booking({
      clientId: mockUserId,
      caregiverId: caregiverId,
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
    }).save();

    const res = await request(app).get("/bookings");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].clientId.toString()).toBe(mockUserId.toString());
  });
});

describe("GET /bookings/:id", () => {
  it("should return a booking by ID", async () => {
    // Create dummy data
    const caregiverId = new mongoose.Types.ObjectId();
    const booking = await new Booking({
      clientId: mockUserId,
      caregiverId: caregiverId,
      date: new Date(),
      startTime: "10:00",
      endTime: "11:00",
    }).save();

    const res = await request(app).get(`/bookings/${booking._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("startTime", "10:00");
    expect(res.body._id.toString()).toBe(booking._id.toString());
  });

  it("should return 404 if booking not found", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/bookings/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
  });

  it("should return 403 if user is not authorized to view the booking", async () => {
    // Create a booking that does not belong to mockUserId
    const anotherUserId = new mongoose.Types.ObjectId();
    const caregiverId = new mongoose.Types.ObjectId();
    const booking = await new Booking({
      clientId: anotherUserId,
      caregiverId: caregiverId,
      date: new Date(),
      startTime: "12:00",
      endTime: "13:00",
    }).save();

    const res = await request(app).get(`/bookings/${booking._id}`);

    expect(res.statusCode).toBe(403);
  });
});
