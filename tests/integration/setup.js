import { beforeAll, afterAll, beforeEach, vi } from "vitest";
import mongoose from "mongoose";
import { env, redis } from "#config";

// Mock mail service to avoid sending emails during test runs
vi.mock("#services", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    sendMail: vi.fn().mockResolvedValue(true),
  };
});

beforeAll(async () => {
  const mongoUri = env.MONGO_URI || "mongodb://localhost:27017/todo_test";
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
});

beforeEach(async () => {
  await redis.flushdb();

  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await redis.quit();
});
