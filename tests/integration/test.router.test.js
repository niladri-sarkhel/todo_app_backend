import { describe, it, expect } from "vitest"; // 👈 Vitest provides the test runner structure
import request from "supertest";
import { app } from "#app";
import { echoContract, pingContract } from "#contracts";

describe("GET /api/v1/test/ping", () => {
  it("should conform strictly to pingContract.resSchema", async () => {
    const response = await request(app).get("/api/v1/test/ping").expect(200);

    const { error } = pingContract.resSchema.validate(response.body);
    expect(error).toBeUndefined();
  });
});

describe("POST /api/v1/test/echo", () => {
  it("should conform strictly to echoContract.resSchema when sent valid JSON", async () => {
    const payload = { task: "Test contracts" };

    const response = await request(app)
      .post("/api/v1/test/echo")
      .send(payload)
      .expect(200);

    const { error } = echoContract.resSchema.validate(response.body);
    expect(error).toBeUndefined();
  });
});
