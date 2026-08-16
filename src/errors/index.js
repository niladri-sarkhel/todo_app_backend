import { logger } from "#utils";

function extractOrigin(stack) {
  if (typeof stack !== "string") return null;

  const lines = stack.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("at ")) continue;

    if (
      trimmed.includes("/errors/") ||
      trimmed.includes("\\errors\\") ||
      trimmed.includes("node:internal")
    ) {
      continue;
    }

    return trimmed;
  }

  return lines[1]?.trim() ?? null;
}

export class AppError extends Error {
  constructor({ message, statusCode = 500, errors = [], stack = null }) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) ? errors : [errors];

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    this.origin = extractOrigin(this.stack);
  }
}

export class BadRequestError extends AppError {
  constructor({
    message = "Bad request payload",
    errors = [],
    stack = null,
  } = {}) {
    super({ message, statusCode: 400, errors, stack });
  }
}

export class UnauthorizedError extends AppError {
  constructor({
    message = "Unauthorized access",
    errors = [],
    stack = null,
  } = {}) {
    super({ message, statusCode: 401, errors, stack });
  }
}

export class ForbiddenError extends AppError {
  constructor({
    message = "Access forbidden",
    errors = [],
    stack = null,
  } = {}) {
    super({ message, statusCode: 403, errors, stack });
  }
}

export class NotFoundError extends AppError {
  constructor({
    message = "Resource not found",
    errors = [],
    stack = null,
  } = {}) {
    super({ message, statusCode: 404, errors, stack });
  }
}

export class ConflictError extends AppError {
  constructor({
    message = "Resource conflict",
    errors = [],
    stack = null,
  } = {}) {
    super({ message, statusCode: 409, errors, stack });
  }
}

export class ExpiredSessionError extends AppError {
  constructor({
    message = "Session or verification code has expired",
    errors = [],
    stack = null,
  } = {}) {
    super({ message, statusCode: 410, errors, stack });
  }
}

export class ValidationError extends AppError {
  constructor({
    message = "Validation failed",
    errors = [],
    stack = null,
  } = {}) {
    super({ message, statusCode: 422, errors, stack });
  }
}

export class MailServiceError extends AppError {
  constructor({
    message = "Failed to send email transmission",
    errors = [],
    stack = null,
  } = {}) {
    super({
      message,
      statusCode: 500,
      errors: errors.length ? errors : ["Mail service delivery failure"],
      stack,
    });
  }
}

export class MailTemplateError extends AppError {
  constructor({
    message = "Mail template infrastructure missing",
    errors = [],
    stack = null,
  } = {}) {
    super({
      message,
      statusCode: 500,
      errors: errors.length ? errors : ["Failed to load email template layout"],
      stack,
    });
  }
}

export const normalizeError = (err) => {
  if (err instanceof AppError) {
    return err;
  }

  const rawStack = err?.stack || null;

  // 1. Mongoose Schema Validation Error
  if (err.name === "ValidationError" && err.errors) {
    const details = Object.values(err.errors).map((e) => e.message);
    return new ValidationError({
      message: "Database validation failed",
      errors: details,
      stack: rawStack,
    });
  }

  if (err.name === "CastError") {
    return new BadRequestError({
      message: `Invalid value '${err.value}' for field '${err.path}'`,
      errors: [`Field '${err.path}' expects a valid ${err.kind}`],
      stack: rawStack,
    });
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const fieldName = fields.length ? fields.join(", ") : "Field";
    return new ConflictError({
      message: `${fieldName} already exists`,
      errors: [`${fieldName} must be unique`],
      stack: rawStack,
    });
  }

  if (err.isJoi) {
    const details = err.details?.map((d) => d.message) || [err.message];
    return new ValidationError({
      message: err.message || "Input validation failed",
      errors: details,
      stack: rawStack,
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return new BadRequestError({
      message: "Invalid JSON body payload",
      errors: ["Malformed JSON syntax in request body"],
      stack: rawStack,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return new UnauthorizedError({
      message: "Invalid authentication token",
      errors: ["Provided JWT token signature is invalid"],
      stack: rawStack,
    });
  }

  if (err.name === "TokenExpiredError") {
    return new UnauthorizedError({
      message: "Token has expired",
      errors: ["JWT token has expired, please log in again"],
      stack: rawStack,
    });
  }

  return new AppError({
    message: err?.message || "An unexpected internal error occurred",
    statusCode: 500,
    errors: ["Internal server error"],
    stack: rawStack,
  });
};

export const handleReqErrors = (err, req, res, _next) => {
  const error = normalizeError(err);

  logger.error(
    {
      err: error,
      code: error.name,
      statusCode: error.statusCode,
      origin: error.origin,
      method: req.method,
      path: req.originalUrl || req.path,
      user: req.user?.id || req.body?.email,
      details: error.errors,
    },
    `[${req.method}] ${req.originalUrl || req.path} -> ${error.statusCode} ${error.message}`,
  );

  return res.status(error.statusCode || 500).json({
    success: false,
    data: null,
    error: {
      code: error.name,
      message: error.message,
      details: error.errors,
    },
  });
};
