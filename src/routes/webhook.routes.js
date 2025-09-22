const express = require("express");
const feedbackController = require("../controllers/feedback.controller");
const surveyController = require("../controllers/survey.controller");
const { validateWebhook } = require("../middleware/validation.middleware");
const logger = require("../utils/logger.utils");

const router = express.Router();

// WhatsApp webhook endpoint
router.post("/whatsapp", validateWebhook, async (req, res) => {
  try {
    const lambdaEvent = {
      body: new URLSearchParams(req.body).toString(),
      isBase64Encoded: false,
    };

    const result = await feedbackController.handleFeedback(lambdaEvent);
    const responseBody = JSON.parse(result.body);
    res.status(result.statusCode).json(responseBody);
  } catch (error) {
    logger.error("Webhook error", { error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
});

// Survey endpoint
router.get("/send-survey", async (req, res) => {
  try {
    const lambdaEvent = {
      queryStringParameters: req.query,
    };

    const result = await surveyController.sendSurvey(lambdaEvent);
    const responseBody = JSON.parse(result.body);
    res.status(result.statusCode).json(responseBody);
  } catch (error) {
    logger.error("Survey error", { error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
