const Joi = require("joi");
const logger = require("../utils/logger.utils");

class ValidationService {
  validateFeedbackInput(data) {
    const schema = Joi.object({
      Body: Joi.string().required().min(1).max(500),
      From: Joi.string()
        .required()
        .pattern(/^whatsapp:\+\d{10,15}$/),
      // Allow additional Twilio fields
      SmsMessageSid: Joi.string().optional(),
      MessageSid: Joi.string().optional(),
      AccountSid: Joi.string().optional(),
      MessagingServiceSid: Joi.string().optional(),
      NumMedia: Joi.string().optional(),
      ProfileName: Joi.string().optional(),
      WaId: Joi.string().optional(),
      SmsStatus: Joi.string().optional(),
      To: Joi.string().optional(),
      NumSegments: Joi.string().optional(),
      ReferralNumMedia: Joi.string().optional(),
      MessageType: Joi.string().optional(),
      ApiVersion: Joi.string().optional(),
    }).unknown(true); // This allows any additional fields

    const { error, value } = schema.validate(data);

    if (error) {
      logger.warn("Invalid feedback input", { error: error.details });
      return { isValid: false, error: error.details[0].message };
    }

    return { isValid: true, data: value };
  }

  validateSurveyInput(data) {
    const schema = Joi.object({
      to: Joi.string()
        .required()
        .pattern(/^\+\d{10,15}$/),
    });

    const { error, value } = schema.validate(data);

    if (error) {
      logger.warn("Invalid survey input", { error: error.details });
      return { isValid: false, error: error.details[0].message };
    }

    return { isValid: true, data: value };
  }

  isValidRating(rating) {
    const numRating = parseInt(rating);
    return !isNaN(numRating) && numRating >= 1 && numRating <= 10;
  }

  categorizeRating(rating) {
    const numRating = parseInt(rating);

    if (numRating >= 9) return "promoter";
    if (numRating >= 7) return "passive";
    return "detractor";
  }
}

module.exports = new ValidationService();
