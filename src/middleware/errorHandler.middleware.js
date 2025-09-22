const logger = require("../utils/logger.utils");
const { createErrorResponse } = require("../utils/responseHelper.utils");

class ErrorHandler {
  static handle(error, req, res, next) {
    logger.error("Unhandled error", {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
    });

    // Default error
    let statusCode = 500;
    let message = "Internal server error";
    const logger = require("../utils/logger");
    const { createErrorResponse } = require("../utils/responseHelper");

    class ErrorHandler {
      static handle(error, req, res, next) {
        logger.error("Unhandled error", {
          error: error.message,
          stack: error.stack,
          url: req.url,
          method: req.method,
        });

        // Default error
        let statusCode = 500;
        let message = "Internal server error";

        // Handle specific error types
        if (error.name === "ValidationError") {
          statusCode = 400;
          message = error.message;
        } else if (error.name === "TwilioError") {
          statusCode = 502;
          message = "SMS service error";
        } else if (error.code === "EAUTH") {
          statusCode = 500;
          message = "Email authentication failed";
        }

        const errorResponse = createErrorResponse(statusCode, message);
        res.status(statusCode).json(JSON.parse(errorResponse.body));
      }

      static notFound(req, res, next) {
        const error = new Error(`Route not found: ${req.method} ${req.url}`);
        error.statusCode = 404;
        next(error);
      }
    }

    module.exports = ErrorHandler;
    // Handle specific error types
    if (error.name === "ValidationError") {
      statusCode = 400;
      message = error.message;
    } else if (error.name === "TwilioError") {
      statusCode = 502;
      message = "SMS service error";
    } else if (error.code === "EAUTH") {
      statusCode = 500;
      message = "Email authentication failed";
    }

    const errorResponse = createErrorResponse(statusCode, message);
    res.status(statusCode).json(JSON.parse(errorResponse.body));
  }

  static notFound(req, res, next) {
    const error = new Error(`Route not found: ${req.method} ${req.url}`);
    error.statusCode = 404;
    next(error);
  }
}

module.exports = ErrorHandler;
