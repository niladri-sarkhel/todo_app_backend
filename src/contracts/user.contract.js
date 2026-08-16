import Joi from "joi";
import {
  emailSchema,
  passwordSchema,
  otpSchema,
  tokenSchema,
  objectIdSchema,
  baseSuccessResSchema,
} from "./common.contract.js";

// Session & Account Offboarding
export const logoutContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({}).unknown(false),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
    }),
  ),
});

export const initiateDeleteAccountContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      currentPassword: passwordSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
    }),
  ),
});

export const confirmDeleteAccountContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      otp: otpSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
    }),
  ),
});

// Password Change Workflows
export const initiatePasswordChangeContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      currentPassword: passwordSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
    }),
  ),
});

export const confirmPasswordChangeContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
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

// Email Change Multi-Step Workflows
export const initiateEmailChangeContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      currentPassword: passwordSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
    }),
  ),
});

export const verifyExistingEmailOtpContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      otp: otpSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      emailChangeToken: tokenSchema,
    }),
    { message: Joi.string().required() },
  ),
});

export const requestNewEmailVerificationContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      emailChangeToken: tokenSchema,
      newEmail: emailSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
    }),
  ),
});

export const confirmNewEmailUpdateContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      emailChangeToken: tokenSchema,
      newEmail: emailSchema,
      otp: otpSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      _id: objectIdSchema,
      email: emailSchema,
      createdAt: Joi.date().iso().optional(),
      updatedAt: Joi.date().iso().optional(),
    }),
    { message: Joi.string().required() },
  ),
});
