import Joi from "joi";

// Common Reusable Field Schemas
export const emailSchema = Joi.string().email().lowercase().trim().required();
export const passwordSchema = Joi.string().min(6).required();
export const otpSchema = Joi.string().length(6).required();
export const tokenSchema = Joi.string().hex().length(64).required();
export const objectIdSchema = Joi.string().hex().length(24).required();

// Unified API Response Schema Builder
export const baseSuccessResSchema = (
  dataSchema = Joi.any().valid(null),
  extraKeys = {},
) =>
  Joi.object({
    success: Joi.boolean().valid(true).required(),
    data: dataSchema,
    error: Joi.any().valid(null).required(),
    ...extraKeys,
  });
