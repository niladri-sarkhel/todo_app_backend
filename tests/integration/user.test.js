import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "#app";
import { redis } from "#config";
import { User } from "#models";

describe("User Endpoints (Real DB & Redis)", () => {
  describe("DELETE /api/v1/user/confirm-delete", () => {
    it("should delete existing MongoDB document when valid OTP is provided", async () => {
      const user = await User.create({
        email: "delete_me@example.com",
        password: "Password123!",
        name: "Delete Me",
      });

      const userId = user._id.toString();
      const otp = "654321";

      // Seed Redis with account deletion key
      await redis.set(`otp:delete_account:${userId}`, otp, "EX", 300);

      // Execute endpoint call passing session context or ID parameter
      const res = await request(app)
        .delete("/api/v1/user/confirm-delete")
        .send({ userId, otp });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Confirm user is deleted from MongoDB
      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();

      // Confirm Redis key expired/deleted
      const redisOtp = await redis.get(`otp:delete_account:${userId}`);
      expect(redisOtp).toBeNull();
    });
  });
});
