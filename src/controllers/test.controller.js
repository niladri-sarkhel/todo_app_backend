import { logger } from "#utils";

export const testController = {
  // 1. Basic connection ping
  ping: (req, res) => {
    logger.info(
      { controller: "testController", func: "ping" },
      "Ping check hit",
    );

    return res.status(200).json({
      status: "success",
      message: "🏓 pong!",
      timestamp: new Date().toISOString(),
    });
  },

  // 2. Request body & headers echo
  echo: (req, res) => {
    logger.info(
      { controller: "testController", func: "echo" },
      "Echo check hit",
    );

    return res.status(200).json({
      status: "success",
      message: "Data received successfully",
      receivedBody: req.body,
      receivedHeaders: req.headers,
      timestamp: new Date().toISOString(),
    });
  },

  // 3. Async event loop test
  asyncTest: async (req, res, next) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      logger.info(
        { controller: "testController", func: "asyncTest" },
        "Async check passed",
      );

      return res.status(200).json({
        status: "success",
        message: "Async event loop is responding correctly.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return next(error);
    }
  },
};
