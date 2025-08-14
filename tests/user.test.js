const request = require("supertest");
const app = require("../server");

describe("GET /users/me", () => {
  it("should return user profile if authenticated", async () => {
    // You should mock authentication and user data here
    // Example:
    // const res = await request(app).get('/users/me').set('Cookie', [`token=your_jwt_token`]);
    // expect(res.statusCode).toBe(200);
    // expect(res.body).toHaveProperty('email');
  });
});
