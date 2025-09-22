const logger = require("../utils/logger.utils");
const { createErrorResponse } = require("../utils/responseHelper.utils");

class ErrorHandler {
  /**
   * Main error handler middleware
   * @param {Error} error - The error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static handle(error, req, res, next) {
    // Log the error with context
    logger.error("Unhandled error", {
      error: error.message,
      stack: error.stack,
      url: req?.url || req?.requestContext?.http?.path,
      method: req?.method || req?.requestContext?.http?.method,
      timestamp: new Date().toISOString(),
      userAgent: req?.headers?.["user-agent"],
      ip: req?.ip || req?.connection?.remoteAddress,
    });

    // Default error response
    let statusCode = 500;
    let message = "Internal server error";

    // Handle specific error types
    if (error.name === "ValidationError") {
      statusCode = 400;
      message = error.message;
    } else if (
      error.name === "TwilioError" ||
      error.name === "TwilioException"
    ) {
      statusCode = 502;
      message = "SMS service temporarily unavailable";
    } else if (error.code === "EAUTH") {
      statusCode = 500;
      message = "Email service authentication failed";
    } else if (error.name === "TimeoutError") {
      statusCode = 408;
      message = "Request timeout";
    } else if (error.code === "ECONNREFUSED") {
      statusCode = 503;
      message = "Service unavailable";
    } else if (error.statusCode) {
      // Use custom status code if available
      statusCode = error.statusCode;
      message = error.message || message;
    }

    // For Lambda context, return error response object
    if (req.requestContext) {
      return createErrorResponse(statusCode, message);
    }

    // For Express context, send response
    if (res && typeof res.status === "function") {
      const errorResponse = createErrorResponse(statusCode, message);
      return res.status(statusCode).json(JSON.parse(errorResponse.body));
    }

    // Fallback for other contexts
    return createErrorResponse(statusCode, message);
  }

  /**
   * 404 Not Found handler
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static notFound(req, res, next) {
    const path = req?.url || req?.requestContext?.http?.path || "unknown";
    const method =
      req?.method || req?.requestContext?.http?.method || "unknown";

    const error = new Error(`Route not found: ${method} ${path}`);
    error.statusCode = 404;
    error.name = "NotFoundError";

    logger.warn("Route not found", {
      path,
      method,
      timestamp: new Date().toISOString(),
    });

    // Pass to main error handler
    if (next && typeof next === "function") {
      return next(error);
    }

    // Handle directly if no next function
    return ErrorHandler.handle(error, req, res, next);
  }

  /**
   * Async error wrapper for route handlers
   * @param {Function} fn - Async route handler function
   * @returns {Function} Wrapped function with error handling
   */
  static asyncWrapper(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Lambda-specific error handler
   * @param {Error} error - The error object
   * @param {Object} event - Lambda event object
   * @param {Object} context - Lambda context object
   * @returns {Object} Lambda response object
   */
  static handleLambdaError(error, event, context) {
    logger.error("Lambda function error", {
      error: error.message,
      stack: error.stack,
      requestId: context?.awsRequestId,
      functionName: context?.functionName,
      event: {
        path: event?.requestContext?.http?.path,
        method: event?.requestContext?.http?.method,
        headers: event?.headers,
      },
      timestamp: new Date().toISOString(),
    });

    // Map common errors to HTTP status codes
    let statusCode = 500;
    let message = "Internal server error";

    if (error.name === "ValidationError") {
      statusCode = 400;
      message = "Invalid input data";
    } else if (
      error.name === "TwilioError" ||
      error.name === "TwilioException"
    ) {
      statusCode = 502;
      message = "External service error";
    } else if (error.code === "EAUTH") {
      statusCode = 500;
      message = "Service configuration error";
    } else if (error.statusCode) {
      statusCode = error.statusCode;
      message = error.message || message;
    }

    return createErrorResponse(statusCode, message);
  }

  /**
   * Custom error classes for better error handling
   */
  static get CustomErrors() {
    return {
      ValidationError: class ValidationError extends Error {
        constructor(message, field = null) {
          super(message);
          this.name = "ValidationError";
          this.statusCode = 400;
          this.field = field;
        }
      },

      ServiceUnavailableError: class ServiceUnavailableError extends Error {
        constructor(service, message = null) {
          super(message || `${service} service is temporarily unavailable`);
          this.name = "ServiceUnavailableError";
          this.statusCode = 503;
          this.service = service;
        }
      },

      NotFoundError: class NotFoundError extends Error {
        constructor(resource = "Resource") {
          super(`${resource} not found`);
          this.name = "NotFoundError";
          this.statusCode = 404;
        }
      },

      UnauthorizedError: class UnauthorizedError extends Error {
        constructor(message = "Unauthorized access") {
          super(message);
          this.name = "UnauthorizedError";
          this.statusCode = 401;
        }
      },

      RateLimitError: class RateLimitError extends Error {
        constructor(message = "Rate limit exceeded") {
          super(message);
          this.name = "RateLimitError";
          this.statusCode = 429;
        }
      },
    };
  }
}

module.exports = ErrorHandler;
