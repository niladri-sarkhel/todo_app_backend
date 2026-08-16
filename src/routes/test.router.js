import express from "express";

import { testController } from "#controllers";
import { echoContract } from "#contracts";
import { ValidateMiddleware } from "#middlewares";

export const testRouter = express.Router();

testRouter
  .get("/ping", testController.ping)
  .post("/echo", ValidateMiddleware.validate(echoContract), testController.echo)
  .get("/async", testController.asyncTest);
