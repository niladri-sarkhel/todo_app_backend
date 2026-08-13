import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"; // 👈 Import here

import { testRouter } from "#routes";
// import { handleReqErrors } from "#errors";

export const app = express();
app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(cookieParser())
  .use(cors())
  // .use(env.API_PREFIX, apiV1Router)
  .use("/test", testRouter)
  .use((_, res) => {
    return res.status(404).json({ message: "page not found :(" });
  });
// .use(handleReqErrors);
