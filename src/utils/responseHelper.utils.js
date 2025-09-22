const logger = require("./logger.utils");

function createSuccessResponse(statusCode, data) {
  const response = {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(data),
  };

  logger.info("Success response created", { statusCode, data });
  return response;
}

function createErrorResponse(statusCode, message) {
  const response = {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      error: true,
      message,
      timestamp: new Date().toISOString(),
    }),
  };

  logger.error("Error response created", { statusCode, message });
  return response;
}

module.exports = {
  createSuccessResponse,
  createErrorResponse,
};
