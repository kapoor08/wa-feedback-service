const twilioService = require("../services/twilio.service");
const validationService = require("../services/validation.service");
const logger = require("../utils/logger.utils");
const {
  createSuccessResponse,
  createErrorResponse,
} = require("../utils/responseHelper.utils");

class SurveyController {
  async sendSurvey(event) {
    try {
      const { to } = event.queryStringParameters || {};

      // Validate input
      const validation = validationService.validateSurveyInput({ to });
      if (!validation.isValid) {
        return createErrorResponse(400, validation.error);
      }

      // Send survey message
      const surveyMessage = this.generateSurveyMessage();
      await twilioService.sendMessage(`whatsapp:${to}`, surveyMessage);

      logger.info("Survey sent successfully", { to });

      return createSuccessResponse(200, {
        status: "success",
        message: "Survey sent successfully",
        sentTo: to,
      });
    } catch (error) {
      logger.error("Error sending survey", {
        error: error.message,
        to: event.queryStringParameters?.to,
      });

      return createErrorResponse(500, "Failed to send survey");
    }
  }

  generateSurveyMessage() {
    return `🙏 Thank you for choosing us!

On a scale of 1 to 10, how likely are you to recommend us to others?

🌟 9-10: Very Likely - You're amazing!
😊 7-8: Likely - We appreciate you!
😞 1-6: Unlikely - Help us improve!

Simply reply with your rating (1-10).`;
  }
}

module.exports = new SurveyController();
