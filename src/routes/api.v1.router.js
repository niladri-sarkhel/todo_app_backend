import express from "express";

import { testRouter } from "./test.router.js";
import { authRouter } from "./auth.router.js";
import { userRouter } from "./user.router.js";

export const apiV1Router = express.Router();
apiV1Router.use("/test", testRouter);
apiV1Router.use("/auth", authRouter);
apiV1Router.use("/user", userRouter);
