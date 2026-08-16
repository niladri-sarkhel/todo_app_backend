import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"; // 👈 Import here

import { env } from "#config";
import { apiV1Router } from "#routes";
import { handleReqErrors, NotFoundError } from "#errors";

export const app = express();
app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(cookieParser())
  .use(cors())
  .use(env.API_PREFIX, apiV1Router)
  .use((req, _res, next) => {
    next(
      new NotFoundError({
        message: `Route [${req.method}] ${req.path} not found`,
      }),
    );
  })
  .use(handleReqErrors);
