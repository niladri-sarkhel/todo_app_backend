import crypto from "node:crypto";

import { redis } from "#config";
import { User } from "#models";
import { generateOTP } from "#utils";
import { AuthService, MailService } from "#services";
import {
  ConflictError,
  ExpiredSessionError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "#errors";

export class UserServiceClass {
  _otpTtl = 300; // 5 minutes

  // ==========================================
  // PASSWORD CHANGE WORKFLOW
  // ==========================================

  async initiatePasswordChange(userId, currentPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new NotFoundError({ message: "User profile record missing." });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError({
        message: "Invalid current password provided.",
      });
    }

    const otp = generateOTP();
    const redisKey = `pending:password-change:${userId}`;
    await redis.setex(redisKey, this._otpTtl, otp);

    await MailService.sendEmail(
      user.email,
      otp,
      "Authorize Password Change Request",
      "A request was made to change your password. Valid for 5 minutes.",
    );

    return {
      message:
        "Security verification code sent to your registered email address.",
    };
  }

  async confirmPasswordChange(userId, submittedOtp, newPassword) {
    const redisKey = `pending:password-change:${userId}`;
    const cachedOtp = await redis.get(redisKey);

    if (!cachedOtp) {
      throw new ExpiredSessionError({
        message: "Password change session expired. Please request a new code.",
      });
    }

    if (cachedOtp !== submittedOtp) {
      throw new ValidationError({
        message: "Invalid verification code provided.",
        errors: ["OTP mismatch"],
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError({ message: "User profile record missing." });
    }

    user.password = newPassword;
    await user.save();

    await redis.del(redisKey);

    return { message: "Password updated successfully." };
  }

  // ==========================================
  // EMAIL CHANGE WORKFLOW
  // ==========================================

  async initiateEmailChange(userId, currentPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new NotFoundError({ message: "User profile record missing." });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError({
        message: "Invalid current password provided.",
      });
    }

    const otp = generateOTP();
    const redisKey = `pending:email-change:step1:${userId}`;
    await redis.setex(redisKey, this._otpTtl, otp);

    await MailService.sendEmail(
      user.email,
      otp,
      "Authorize Email Change Request",
      "Use this code to verify ownership of your current email address.",
    );

    return {
      message:
        "Security authorization code sent to your current email address.",
    };
  }

  async verifyExistingEmailOtp(userId, submittedOtp) {
    const redisKey = `pending:email-change:step1:${userId}`;
    const cachedOtp = await redis.get(redisKey);

    if (!cachedOtp) {
      throw new ExpiredSessionError({
        message:
          "Email verification session expired. Please restart the process.",
      });
    }

    if (cachedOtp !== submittedOtp) {
      throw new ValidationError({
        message: "Invalid verification code provided.",
        errors: ["OTP mismatch"],
      });
    }

    await redis.del(redisKey);

    const emailChangeToken = crypto.randomBytes(32).toString("hex");
    const tokenKey = `pending:email-change:authorized:${userId}`;
    await redis.setex(tokenKey, 600, emailChangeToken);

    return { emailChangeToken };
  }

  async requestNewEmailVerification(userId, emailChangeToken, newEmail) {
    const tokenKey = `pending:email-change:authorized:${userId}`;
    const storedToken = await redis.get(tokenKey);

    if (!storedToken || storedToken !== emailChangeToken) {
      throw new UnauthorizedError({
        message: "Unauthorized or expired email modification session.",
      });
    }

    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser) {
      throw new ConflictError({
        message: "An account with this target email address already exists.",
      });
    }

    const newOtp = generateOTP();
    const redisKey = `pending:email-change:step2:${userId}`;
    const payload = JSON.stringify({
      newEmail: newEmail.toLowerCase(),
      otp: newOtp,
    });

    await redis.setex(redisKey, this._otpTtl, payload);

    await MailService.sendEmail(
      newEmail,
      newOtp,
      "Verify Your New Email Address",
      "Please use this code to confirm and link your new email address.",
    );

    return { message: "Verification code sent to your new email address." };
  }

  async confirmNewEmailUpdate(
    userId,
    emailChangeToken,
    newEmail,
    submittedOtp,
  ) {
    const tokenKey = `pending:email-change:authorized:${userId}`;
    const storedToken = await redis.get(tokenKey);

    if (!storedToken || storedToken !== emailChangeToken) {
      throw new UnauthorizedError({
        message: "Unauthorized or expired email modification session.",
      });
    }

    const step2Key = `pending:email-change:step2:${userId}`;
    const cachedData = await redis.get(step2Key);

    if (!cachedData) {
      throw new ExpiredSessionError({
        message:
          "New email verification session expired. Please request a new code.",
      });
    }

    const { newEmail: targetEmail, otp: storedOtp } = JSON.parse(cachedData);

    if (targetEmail !== newEmail.toLowerCase() || storedOtp !== submittedOtp) {
      throw new ValidationError({
        message: "Invalid verification details or target email mismatch.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email: newEmail.toLowerCase() },
      { new: true },
    );

    await redis.del([tokenKey, step2Key]);

    return updatedUser;
  }

  // ==========================================
  // ACCOUNT OFFBOARDING
  // ==========================================

  // Step 1: Initiate Deletion Flow
  async initiateDeleteAccount(userId, currentPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new NotFoundError({ message: "Target user non-existent." });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError({ message: "Invalid current password." });
    }

    const otp = generateOTP();

    const redisKey = `otp:delete_account:${userId}`;
    await redis.setex(redisKey, this._otpTtl, otp);

    await MailService.sendEmail(
      user.email,
      otp,
      "Authorize Account Deletion Request",
      "A request was made to delete your account. Valid for 5 minutes.",
    );

    return { success: true };
  }

  // Step 2: Confirm Deletion Flow
  async confirmDeleteAccount(userId, otp, res) {
    const redisKey = `otp:delete_account:${userId}`;
    const cachedOtp = await redis.get(redisKey);

    if (!cachedOtp) {
      throw new ExpiredSessionError({
        message: "Account deletion session expired. Please request a new code.",
      });
    }

    if (cachedOtp !== otp) {
      throw new ValidationError({
        message: "Invalid verification code provided.",
        errors: ["OTP mismatch"],
      });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundError({ message: "Target user non-existent." });
    }

    await AuthService.logout(res);
    await redis.del(redisKey);

    return { success: true };
  }
}

export const UserService = new UserServiceClass();
