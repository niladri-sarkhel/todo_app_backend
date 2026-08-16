import express from "express";

import { UserController } from "#controllers";
import { ValidateMiddleware, AuthMiddleware } from "#middlewares";
import {
  logoutContract,
  initiatePasswordChangeContract,
  confirmPasswordChangeContract,
  initiateEmailChangeContract,
  verifyExistingEmailOtpContract,
  requestNewEmailVerificationContract,
  confirmNewEmailUpdateContract,
  initiateDeleteAccountContract,
  confirmDeleteAccountContract,
} from "#contracts";

export const userRouter = express.Router();

// Session & Account Offboarding
userRouter.post(
  "/logout",
  AuthMiddleware.authenticate,
  ValidateMiddleware.validate(logoutContract.reqSchema),
  UserController.logout,
);

userRouter.post(
  "/account/delete-initiate",
  AuthMiddleware.authenticate,
  ValidateMiddleware.validate(initiateDeleteAccountContract.reqSchema),
  UserController.initiateDeleteAccount,
);

userRouter.delete(
  "/account/delete-confirm",
  AuthMiddleware.authenticate,
  ValidateMiddleware.validate(confirmDeleteAccountContract.reqSchema),
  UserController.confirmDeleteAccount,
);

// Password Change Flow
userRouter.post(
  "/account/password/change-initiate",
  AuthMiddleware.authenticate,
  ValidateMiddleware.validate(initiatePasswordChangeContract.reqSchema),
  UserController.initiatePasswordChange,
);

userRouter.post(
  "/account/password/change-confirm",
  AuthMiddleware.authenticate,
  ValidateMiddleware.validate(confirmPasswordChangeContract.reqSchema),
  UserController.confirmPasswordChange,
);

// Email Change Multi-Step Flow
userRouter.post(
  "/account/email/change-initiate",
  AuthMiddleware.authenticate,
  ValidateMiddleware.validate(initiateEmailChangeContract.reqSchema),
  UserController.initiateEmailChange,
);

userRouter.post(
  "/account/email/verify-current-otp",
  AuthMiddleware.authenticate,
  ValidateMiddleware.validate(verifyExistingEmailOtpContract.reqSchema),
  UserController.verifyExistingEmailOtp,
);

userRouter.post(
  "/account/email/request-new-otp",
  AuthMiddleware.authenticate,
  ValidateMiddleware.validate(requestNewEmailVerificationContract.reqSchema),
  UserController.requestNewEmailVerification,
);

userRouter.post(
  "/account/email/confirm-update",
  AuthMiddleware.authenticate,
  ValidateMiddleware.validate(confirmNewEmailUpdateContract.reqSchema),
  UserController.confirmNewEmailUpdate,
);
