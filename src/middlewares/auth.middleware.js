import jwt from "jsonwebtoken";

import { env } from "#config";
import { UnauthorizedError } from "#errors";

export class AuthMiddlewareClass {
  authenticate = (req, res, next) => {
    try {
      // Retrieve token from cookies or Bearer Authorization header
      const token =
        req.cookies?.access_token ||
        req.headers.authorization?.replace(/^Bearer\s+/, "");

      if (!token) {
        throw new UnauthorizedError({
          message: "Authentication token is missing.",
        });
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = decoded; // Attach { id, email } to req
      next();
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        return next(
          new UnauthorizedError({
            message: "Invalid or expired session token.",
          }),
        );
      }
      next(error);
    }
  };
}

export const AuthMiddleware = new AuthMiddlewareClass();
