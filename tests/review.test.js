const request = require("supertest");
const app = require("../server");

describe("GET /reviews/caregiver/:caregiverId", () => {
  it("should return all reviews for a caregiver", async () => {
    // You should mock a valid caregiverId here
    // Example:
    // const res = await request(app).get('/reviews/caregiver/validCaregiverId');
    // expect(res.statusCode).toBe(200);
    // expect(Array.isArray(res.body)).toBe(true);
  });
});
