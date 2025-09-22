const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const webhookRoutes = require("./src/routes/webhook.routes");
const logger = require("./src/utils/logger.utils");
const { createErrorResponse } = require("./src/utils/responseHelper.utils");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the webhook routes
app.use(webhookRoutes);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/whatsapp`);
  console.log(
    `📨 Survey endpoint: http://localhost:${PORT}/send-survey?to=+1234567890`
  );
});

// Lambda handler for AWS deployment
exports.handler = async (event, context) => {
  const feedbackController = require("./src/controllers/feedback.controller");
  const surveyController = require("./src/controllers/survey.controller");

  context.callbackWaitsForEmptyEventLoop = false;

  logger.info("Lambda function invoked", {
    httpMethod: event.requestContext?.http?.method,
    path: event.requestContext?.http?.path,
  });

  try {
    const { method, path } = event.requestContext?.http || {};

    if (method === "POST" && path === "/whatsapp") {
      return await feedbackController.handleFeedback(event);
    }

    if (method === "GET" && path === "/send-survey") {
      return await surveyController.sendSurvey(event);
    }

    if (method === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    }

    logger.warn("Route not found", { method, path });
    return createErrorResponse(404, "Route not found");
  } catch (error) {
    logger.error("Unhandled error in Lambda handler", {
      error: error.message,
      stack: error.stack,
    });

    return createErrorResponse(500, "Internal server error");
  }
};
