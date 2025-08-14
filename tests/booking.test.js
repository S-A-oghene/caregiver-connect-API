const request = require("supertest");
const app = require("../server");

describe("GET /bookings", () => {
  it("should return all bookings for the logged-in user", async () => {
    // You should mock authentication and user data here
    // Example:
    // const res = await request(app).get('/bookings').set('Cookie', [`token=your_jwt_token`]);
    // expect(res.statusCode).toBe(200);
    // expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /bookings/:id", () => {
  it("should return a booking by ID", async () => {
    // You should mock a valid bookingId here
    // Example:
    // const res = await request(app).get('/bookings/validBookingId').set('Cookie', [`token=your_jwt_token`]);
    // expect(res.statusCode).toBe(200);
  });
});
