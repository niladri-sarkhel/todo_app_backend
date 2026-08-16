import { describe, it, expect, vi } from "vitest";
import { testController } from "#controllers";

describe("testController Unit Tests", () => {
  it("ping() should return status success and 200 JSON response", () => {
    // 1. Create mock req and res objects
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // 2. Call the controller function directly
    testController.ping(req, res);

    // 3. Assert mock function invocations
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "🏓 pong!",
      timestamp: expect.any(String),
    });
  });
});
