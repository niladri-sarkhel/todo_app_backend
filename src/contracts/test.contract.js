import Joi from "joi";

export const pingContract = Object.freeze({
  resSchema: Joi.object({
    status: Joi.string().valid("success").required(),
    message: Joi.string().valid("🏓 pong!").required(),
    timestamp: Joi.string().isoDate().required(),
  }),
});

export const echoContract = Object.freeze({
  reqSchema: Joi.object({
    body: Joi.object().required(),
    headers: Joi.object().unknown(true),
    query: Joi.object().unknown(false),
    params: Joi.object().unknown(false),
  }),

  resSchema: Joi.object({
    status: Joi.string().valid("success").required(),
    message: Joi.string().valid("Data received successfully").required(),
    receivedBody: Joi.object().required(),
    receivedHeaders: Joi.object().required(),
    timestamp: Joi.string().isoDate().required(),
  }),
});

export const asyncTestContract = Object.freeze({
  resSchema: Joi.object({
    status: Joi.string().valid("success").required(),
    message: Joi.string()
      .valid("Async event loop is responding correctly.")
      .required(),
    timestamp: Joi.string().isoDate().required(),
  }),
});
