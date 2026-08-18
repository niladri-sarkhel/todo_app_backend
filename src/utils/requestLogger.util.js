import { logger } from "#utils";

export const requestLogger = (req, res, next) => {
  logger.info(
    {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
    },
    "Incoming request",
  );

  next();
};
