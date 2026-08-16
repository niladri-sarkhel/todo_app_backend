import Joi from "joi";
import { objectIdSchema, baseSuccessResSchema } from "./common.contract.js";

const hexColorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const listEntitySchema = Joi.object({
  _id: objectIdSchema,
  title: Joi.string().trim().max(30).required(),
  color: Joi.string().pattern(hexColorPattern).default("#6366f1"),
  user: objectIdSchema,
  isArchived: Joi.boolean().default(false),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});

export const createListContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object({
      title: Joi.string().trim().max(30).required(),
      color: Joi.string().pattern(hexColorPattern).optional(),
    }).required(),
  }),
  resSchema: baseSuccessResSchema(listEntitySchema, {
    message: Joi.string().optional(),
  }),
});

export const getListsContract = Object.freeze({
  reqSchema: Joi.object({
    query: Joi.object({
      isArchived: Joi.boolean().optional(),
    }),
  }),
  resSchema: baseSuccessResSchema(Joi.array().items(listEntitySchema)),
});

export const getListByIdContract = Object.freeze({
  reqSchema: Joi.object({
    params: Joi.object({
      id: objectIdSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(listEntitySchema),
});

export const updateListContract = Object.freeze({
  reqSchema: Joi.object({
    params: Joi.object({
      id: objectIdSchema,
    }).required(),
    body: Joi.object({
      title: Joi.string().trim().max(30).optional(),
      color: Joi.string().pattern(hexColorPattern).optional(),
      isArchived: Joi.boolean().optional(),
    })
      .min(1)
      .required(),
  }),
  resSchema: baseSuccessResSchema(listEntitySchema, {
    message: Joi.string().optional(),
  }),
});

export const deleteListContract = Object.freeze({
  reqSchema: Joi.object({
    params: Joi.object({
      id: objectIdSchema,
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
    }),
  ),
});
