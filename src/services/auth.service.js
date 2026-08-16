import jwt from "jsonwebtoken";

import { env, redis } from "#config";
import { User } from "#models";
import { generateOTP } from "#utils";
import { MailService } from "#services";
import {
  ConflictError,
  ExpiredSessionError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "#errors";

export class AuthServiceClass {
  _jwtSecret = env.JWT_SECRET;
  _otpTtl = 300; // 5 minutes
  _cookieName = "access_token";

  _getCookieOptions() {
    return {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }

  // ==========================================
  // SIGNUP WORKFLOW
  // ==========================================

  async initiateSignup({ email, password }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError({
        message: "An account with this email already exists.",
      });
    }

    const otp = generateOTP();
    const redisKey = `pending:signup:${email.toLowerCase()}`;
    const payload = JSON.stringify({
      email: email.toLowerCase(),
      password,
      otp,
    });

    await redis.setex(redisKey, this._otpTtl, payload);

    await MailService.sendEmail(
      email,
      otp,
      "Verify Your Registration",
      "Thank you for registering. Please use the following verification code to finalize creating your account. Valid for 5 minutes.",
    );

    return { message: "Verification OTP dispatched to email." };
  }

  async verifySignup(email, submittedOtp) {
    const redisKey = `pending:signup:${email.toLowerCase()}`;
    const cachedData = await redis.get(redisKey);

    if (!cachedData) {
      throw new ExpiredSessionError({
        message: "Verification session expired. Please register again.",
      });
    }

    const { password, otp } = JSON.parse(cachedData);

    if (otp !== submittedOtp) {
      throw new ValidationError({
        message: "Invalid verification code provided.",
        errors: ["OTP mismatch"],
      });
    }

    const newUser = await User.create({
      email: email.toLowerCase(),
      password,
    });

    await redis.del(redisKey);

    return newUser;
  }

  // ==========================================
  // LOGIN WORKFLOW
  // ==========================================

  async initiateLogin(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError({
        message: "Invalid email or password credentials.",
      });
    }

    const otp = generateOTP();
    const redisKey = `pending:auth:${user._id}`;

    await redis.setex(redisKey, this._otpTtl, otp);

    await MailService.sendEmail(
      user.email,
      otp,
      "2-Step Verification Login Request",
      "A login attempt was initiated for your profile. Input this security code to verify your session identity.",
    );

    return { userId: user._id, message: "2FA checkpoint reached. Code sent." };
  }

  async verifyLogin(userId, submittedOtp, res) {
    const redisKey = `pending:auth:${userId}`;
    const cachedOtp = await redis.get(redisKey);

    if (!cachedOtp) {
      throw new ExpiredSessionError({
        message: "Login verification session expired. Please re-authenticate.",
      });
    }

    if (cachedOtp !== submittedOtp) {
      throw new ValidationError({
        message: "Invalid security verification code.",
        errors: ["OTP mismatch"],
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError({
        message: "Account profile records non-existent.",
      });
    }

    const tokenPayload = { id: user._id, email: user.email };
    const token = jwt.sign(tokenPayload, this._jwtSecret, { expiresIn: "7d" });

    res.cookie(this._cookieName, token, this._getCookieOptions());

    await redis.del(redisKey);

    return { user, tokenName: this._cookieName };
  }

  // ==========================================
  // FORGOT / RESET PASSWORD WORKFLOW
  // ==========================================

  async initiatePasswordReset(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return {
        message: "If the account exists, a reset code has been dispatched.",
      };
    }

    const otp = generateOTP();
    const redisKey = `pending:reset:${user._id}`;
    await redis.setex(redisKey, this._otpTtl, otp);

    await MailService.sendEmail(
      user.email,
      otp,
      "Password Reset Code Verification",
      "We received a request to update your password credentials. Use this authorization code to proceed.",
    );

    return {
      userId: user._id,
      message: "If the account exists, a reset code has been dispatched.",
    };
  }

  async completePasswordReset(userId, submittedOtp, newPassword) {
    const redisKey = `pending:reset:${userId}`;
    const cachedOtp = await redis.get(redisKey);

    if (!cachedOtp) {
      throw new ExpiredSessionError({
        message: "Password authorization session expired.",
      });
    }

    if (cachedOtp !== submittedOtp) {
      throw new ValidationError({
        message: "Invalid password modification code.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError({ message: "User profile record missing." });
    }

    user.password = newPassword;
    await user.save();

    await redis.del(redisKey);
    return {
      success: true,
      message: "Password successfully reset.",
    };
  }

  // ==========================================
  // SESSION UTILITIES
  // ==========================================

  async logout(res) {
    res.clearCookie(this._cookieName, {
      ...this._getCookieOptions(),
      maxAge: 0,
    });
    return { success: true };
  }
}

export const AuthService = new AuthServiceClass();
