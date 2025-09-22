const Joi = require("joi");

const feedbackSchema = Joi.object({
  id: Joi.string(),
  from: Joi.string().required(),
  body: Joi.string().required().max(500),
  rating: Joi.number().integer().min(1).max(10).allow(null),
  category: Joi.string().valid("promoter", "passive", "detractor").allow(null),
  timestamp: Joi.date().iso(),
  processed: Joi.boolean().default(false),
  emailSent: Joi.boolean().default(false),
  responseSent: Joi.boolean().default(false),
});

class Feedback {
  constructor(data) {
    const { error, value } = feedbackSchema.validate(data);
    if (error) {
      throw new Error(`Invalid feedback data: ${error.message}`);
    }
    Object.assign(this, value);
  }

  static create(data) {
    return new Feedback(data);
  }

  toJSON() {
    return {
      id: this.id,
      from: this.from,
      body: this.body,
      rating: this.rating,
      category: this.category,
      timestamp: this.timestamp,
      processed: this.processed,
      emailSent: this.emailSent,
      responseSent: this.responseSent,
    };
  }
}

module.exports = Feedback;
