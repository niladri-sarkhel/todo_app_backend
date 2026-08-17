import Joi from "joi";
import { objectIdSchema, baseSuccessResSchema } from "./common.contract.js";

const taskEntitySchema = Joi.object({
  _id: objectIdSchema,
  title: Joi.string().trim().max(50).required(),
  description: Joi.string().trim().allow("").default(""),
  isCompleted: Joi.boolean().default(false),
  order: Joi.number().integer().min(0).default(0),
  dueDate: Joi.date().iso().allow(null).default(null),
  list: objectIdSchema,
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});

export const createTaskContract = Object.freeze({
  reqSchema: Joi.object({
    params: Joi.object({
      listId: objectIdSchema,
    }).required(),
    body: Joi.object({
      title: Joi.string().trim().max(50).required(),
      description: Joi.string().trim().allow("").optional(),
      isCompleted: Joi.boolean().optional(),
      order: Joi.number().integer().min(0).optional(),
      dueDate: Joi.date().iso().allow(null).optional(),
    }).required(),
  }),

  resSchema: baseSuccessResSchema(taskEntitySchema, {
    message: Joi.string().optional(),
  }),
});

export const getTasksContract = Object.freeze({
  reqSchema: Joi.object({
    params: Joi.object({
      listId: objectIdSchema,
    }).required(),
    query: Joi.object({
      isCompleted: Joi.boolean().optional(),
    }),
  }),
  resSchema: baseSuccessResSchema(Joi.array().items(taskEntitySchema)),
});

export const updateTaskContract = Object.freeze({
  reqSchema: Joi.object({
    params: Joi.object({
      id: objectIdSchema,
    }).required(),
    body: Joi.object({
      title: Joi.string().trim().max(50).optional(),
      description: Joi.string().trim().allow("").optional(),
      isCompleted: Joi.boolean().optional(),
      order: Joi.number().integer().min(0).optional(),
      dueDate: Joi.date().iso().allow(null).optional(),
    })
      .min(1)
      .required(),
  }),
  resSchema: baseSuccessResSchema(taskEntitySchema, {
    message: Joi.string().optional(),
  }),
});

export const reorderTasksContract = Object.freeze({
  reqSchema: Joi.object({
    params: Joi.object({
      listId: objectIdSchema,
    }).required(),
    body: Joi.object({
      tasks: Joi.array()
        .items(
          Joi.object({
            _id: objectIdSchema,
            order: Joi.number().integer().min(0).required(),
          }),
        )
        .min(1)
        .required(),
    }).required(),
  }),
  resSchema: baseSuccessResSchema(
    Joi.object({
      message: Joi.string().required(),
    }),
  ),
});

export const deleteTaskContract = Object.freeze({
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
