import { ValidationError } from "#errors";

export class ValidateMiddlewareClass {
  // Validates incoming req against contract.reqSchema or raw Joi schema
  validate = (contractOrSchema) => {
    return (req, res, next) => {
      // Extract Joi schema if a contract object was passed
      const schema = contractOrSchema?.reqSchema || contractOrSchema;

      if (!schema || typeof schema.validate !== "function") {
        return next();
      }

      // Assemble request parts to validate against contract shape
      const toValidate = {
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      };

      const { error, value } = schema.validate(toValidate, {
        abortEarly: false,
        stripUnknown: true, // Automatically strip unmapped keys
        allowUnknown: true, // Allow Express internal header/req fields
      });

      if (error) {
        const errorDetails = error.details.map((detail) => detail.message);
        return next(
          new ValidationError({
            message: "Request validation failed.",
            errors: errorDetails,
          }),
        );
      }

      // Re-assign sanitized values back to Express request safely
      if (value.body) req.body = value.body;

      if (value.query && req.query) {
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, value.query);
      }

      if (value.params && req.params) {
        Object.keys(req.params).forEach((key) => delete req.params[key]);
        Object.assign(req.params, value.params);
      }

      next();
    };
  };
}

export const ValidateMiddleware = new ValidateMiddlewareClass();
