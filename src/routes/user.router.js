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

userRouter.use(AuthMiddleware.authenticate);

userRouter.post(
  "/logout",
  ValidateMiddleware.validate(logoutContract.reqSchema),
  UserController.logout,
);

userRouter.post(
  "/account/delete-initiate",
  ValidateMiddleware.validate(initiateDeleteAccountContract.reqSchema),
  UserController.initiateDeleteAccount,
);

userRouter.delete(
  "/account/delete-confirm",
  ValidateMiddleware.validate(confirmDeleteAccountContract.reqSchema),
  UserController.confirmDeleteAccount,
);

// Password Change Flow
userRouter.post(
  "/account/password/change-initiate",
  ValidateMiddleware.validate(initiatePasswordChangeContract.reqSchema),
  UserController.initiatePasswordChange,
);

userRouter.post(
  "/account/password/change-confirm",
  ValidateMiddleware.validate(confirmPasswordChangeContract.reqSchema),
  UserController.confirmPasswordChange,
);

// Email Change Multi-Step Flow
userRouter.post(
  "/account/email/change-initiate",
  ValidateMiddleware.validate(initiateEmailChangeContract.reqSchema),
  UserController.initiateEmailChange,
);

userRouter.post(
  "/account/email/verify-current-otp",
  ValidateMiddleware.validate(verifyExistingEmailOtpContract.reqSchema),
  UserController.verifyExistingEmailOtp,
);

userRouter.post(
  "/account/email/request-new-otp",
  ValidateMiddleware.validate(requestNewEmailVerificationContract.reqSchema),
  UserController.requestNewEmailVerification,
);

userRouter.post(
  "/account/email/confirm-update",
  ValidateMiddleware.validate(confirmNewEmailUpdateContract.reqSchema),
  UserController.confirmNewEmailUpdate,
);
