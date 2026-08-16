import Joi from "joi";
import {
  emailSchema,
  passwordSchema,
  otpSchema,
  objectIdSchema,
  baseSuccessResSchema,
} from "./common.contract.js";

// Signup Workflows
export const initiateSignupContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      email: emailSchema,
      password: passwordSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
    }),
  ),
});

export const verifySignupContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      email: emailSchema,
      otp: otpSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
      userId: objectIdSchema,
      email: emailSchema,
    }),
  ),
});

// Authentication Workflows
export const initiateLoginContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      email: emailSchema,
      password: passwordSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      userId: objectIdSchema,
      message: Joi.string().required(),
    }),
  ),
});

export const verifyLoginContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      userId: objectIdSchema,
      otp: otpSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
      profile: Joi.object({
        id: objectIdSchema,
        email: emailSchema,
      }).required(),
      sessionCookieName: Joi.string().required(),
    }),
  ),
});

// Password Recovery Workflows
export const initiatePasswordResetContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      email: emailSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      userId: objectIdSchema.optional(),
      message: Joi.string().required(),
    }),
  ),
});

export const completePasswordResetContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      userId: objectIdSchema,
      otp: otpSchema,
      newPassword: passwordSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
    }),
  ),
});
