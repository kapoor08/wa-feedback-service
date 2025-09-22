const emailService = require("../services/email.service");
const twilioService = require("../services/twilio.service");
const validationService = require("../services/validation.service");
const logger = require("../utils/logger.utils");
const {
  createSuccessResponse,
  createErrorResponse,
} = require("../utils/responseHelper.utils");

class FeedbackController {
  async handleFeedback(event) {
    try {
      // Parse request body
      const requestBody = this.parseRequestBody(event);

      // Validate input
      const validation = validationService.validateFeedbackInput(requestBody);
      if (!validation.isValid) {
        return createErrorResponse(400, validation.error);
      }

      const { Body, From } = validation.data;

      // Process feedback
      const response = await this.processFeedback(Body, From);

      return createSuccessResponse(200, {
        message: "Feedback processed successfully",
        response: response.message,
      });
    } catch (error) {
      logger.error("Error processing feedback", {
        error: error.message,
        stack: error.stack,
      });
      return createErrorResponse(500, "Internal server error");
    }
  }

  parseRequestBody(event) {
    try {
      let body = event.body;

      if (event.isBase64Encoded) {
        body = Buffer.from(event.body, "base64").toString("utf-8");
      }

      // Parse URL-encoded data (Twilio webhook format)
      const querystring = require("querystring");
      return querystring.parse(body);
    } catch (error) {
      logger.error("Error parsing request body", { error: error.message });
      throw new Error("Invalid request body format");
    }
  }

  async processFeedback(body, from) {
    const rating = this.extractRating(body);
    const responseMessage = this.generateResponseMessage(rating);

    // Process email and WhatsApp message concurrently
    const [emailResult, messageResult] = await Promise.allSettled([
      emailService.sendFeedbackEmail(from, body, rating),
      twilioService.sendMessage(from, responseMessage),
    ]);

    // Log results
    if (emailResult.status === "rejected") {
      logger.error("Email sending failed", { error: emailResult.reason });
    }

    if (messageResult.status === "rejected") {
      logger.error("WhatsApp message sending failed", {
        error: messageResult.reason,
      });
    }

    return {
      message: responseMessage,
      emailSent: emailResult.status === "fulfilled",
      messageSent: messageResult.status === "fulfilled",
    };
  }

  extractRating(body) {
    const trimmedBody = body.trim();

    if (validationService.isValidRating(trimmedBody)) {
      return parseInt(trimmedBody);
    }

    return null;
  }

  generateResponseMessage(rating) {
    if (!rating) {
      return `👋 *Thank you for your message!*

📊 Please reply with a number between *1 and 10* to rate your experience:

1️⃣ = Very Poor
5️⃣ = Average  
🔟 = Excellent

_Just send the number (e.g., "8")_`;
    }

    const category = validationService.categorizeRating(rating);

    const responses = {
      promoter: `🌟 *WOW! Thank you!* 🌟

You rated us *${rating}/10* - that's amazing! 

We're thrilled you had such a great experience with us! Your feedback means the world to our team! 💙

_Keep being awesome!_ ✨`,

      passive: `😊 *Thank you for the feedback!* 

You gave us *${rating}/10* - we really appreciate you taking the time to share your thoughts with us.

We're always working to improve and make your experience even better! 🚀

_Thanks for choosing us!_ 💙`,

      detractor: `🙏 *Thank you for your honest feedback*

You rated us *${rating}/10* and we really appreciate your honesty. 

We take all feedback seriously and will work hard to improve your experience. Our team will review this right away! 📈

_We value your input!_ 💙`,
    };

    return responses[category];
  }
}

module.exports = new FeedbackController();
