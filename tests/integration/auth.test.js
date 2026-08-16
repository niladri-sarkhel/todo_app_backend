import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "#app";
import { redis } from "#config";
import { User } from "#models";

describe("Auth Endpoints (Real DB & Redis)", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should write registration OTP to Redis", async () => {
      const payload = {
        email: "real_test@example.com",
        password: "Password123!",
        name: "Real User",
      };

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify OTP presence in real Redis
      const keys = await redis.keys("otp:register:*");
      expect(keys.length).toBeGreaterThan(0);
    });

    it("should reject registration if user exists in MongoDB", async () => {
      await User.create({
        email: "existing@example.com",
        password: "Password123!",
        name: "Existing User",
      });

      const res = await request(app).post("/api/v1/auth/register").send({
        email: "existing@example.com",
        password: "Password123!",
        name: "Existing User",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/verify-otp", () => {
    it("should create user in MongoDB upon correct OTP verification", async () => {
      const email = "verify@example.com";
      const otp = "123456";
      const registrationPayload = JSON.stringify({
        email,
        password: "hashedPassword123",
        name: "OTP User",
        otp,
      });

      // Seed real Redis key directly
      await redis.set(`otp:register:${email}`, registrationPayload, "EX", 300);

      const res = await request(app)
        .post("/api/v1/auth/verify-otp")
        .send({ email, otp });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify record persist in real MongoDB
      const dbUser = await User.findOne({ email });
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe("OTP User");

      // Verify Redis key cleanup
      const cachedData = await redis.get(`otp:register:${email}`);
      expect(cachedData).toBeNull();
    });
  });
});
