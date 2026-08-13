// index.js
import { env } from "#config";
import { startServer } from "#server";

startServer({
  port: env.PORT,
  appName: env.APP_NAME,
  appUrl: env.APP_URL,
  databaseUrl: env.MONGO_URI,
});
