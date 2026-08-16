import express from "express";

import { AuthController } from "#controllers";
import { ValidateMiddleware } from "#middlewares";
import {
  initiateSignupContract,
  verifySignupContract,
  initiateLoginContract,
  verifyLoginContract,
  initiatePasswordResetContract,
  completePasswordResetContract,
} from "#contracts";

export const authRouter = express.Router();

// Registration Workflow
authRouter.post(
  "/signup/initiate",
  ValidateMiddleware.validate(initiateSignupContract.reqSchema),
  AuthController.initiateSignup,
);

authRouter.post(
  "/signup/verify",
  ValidateMiddleware.validate(verifySignupContract.reqSchema),
  AuthController.verifySignup,
);

// Authentication Workflow
authRouter.post(
  "/login/initiate",
  ValidateMiddleware.validate(initiateLoginContract.reqSchema),
  AuthController.initiateLogin,
);

authRouter.post(
  "/login/verify",
  ValidateMiddleware.validate(verifyLoginContract.reqSchema),
  AuthController.verifyLogin,
);

// Account Recovery Workflow
authRouter.post(
  "/forgot-password",
  ValidateMiddleware.validate(initiatePasswordResetContract.reqSchema),
  AuthController.initiatePasswordReset,
);

authRouter.post(
  "/reset-password",
  ValidateMiddleware.validate(completePasswordResetContract.reqSchema),
  AuthController.completePasswordReset,
);
