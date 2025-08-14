const request = require("supertest");
const app = require("../server");

describe("GET /profiles", () => {
  it("should return all caregiver profiles", async () => {
    const res = await request(app).get("/profiles");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /profiles/:id", () => {
  it("should return a caregiver profile by user ID", async () => {
    // You should mock a valid userId here
    // Example:
    // const res = await request(app).get('/profiles/validUserId');
    // expect(res.statusCode).toBe(200);
  });
});
