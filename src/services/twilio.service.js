const twilio = require("twilio");
const config = require("../config/settings.config");
const logger = require("../utils/logger.utils");

class TwilioService {
  constructor() {
    this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
  }

  async sendMessage(to, body, retryCount = 0) {
    try {
      const message = await this.client.messages.create({
        body,
        from: config.twilio.whatsappNumber,
        to: this.formatPhoneNumber(to),
      });

      logger.info("WhatsApp message sent successfully", {
        messageId: message.sid,
        to,
        retryCount,
      });

      return message;
    } catch (error) {
      logger.error("Failed to send WhatsApp message", {
        error: error.message,
        to,
        retryCount,
      });

      if (retryCount < config.retry.maxAttempts) {
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.sendMessage(to, body, retryCount + 1);
      }

      throw error;
    }
  }

  formatPhoneNumber(phoneNumber) {
    // Ensure the phone number is in the correct format
    if (phoneNumber.startsWith("whatsapp:")) {
      return phoneNumber;
    }
    return `whatsapp:${phoneNumber}`;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new TwilioService();
