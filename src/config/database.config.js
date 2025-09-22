const logger = require("../utils/logger.utils");

class Database {
  constructor() {
    // In-memory storage for demo purposes
    // In production, you'd use DynamoDB, MongoDB, or another database
    this.feedback = [];
    this.surveys = [];
  }

  async saveFeedback(feedbackData) {
    try {
      const feedback = {
        id: this.generateId(),
        ...feedbackData,
        timestamp: new Date().toISOString(),
      };

      this.feedback.push(feedback);
      logger.info("Feedback saved to database", { feedbackId: feedback.id });
      return feedback;
    } catch (error) {
      logger.error("Error saving feedback to database", {
        error: error.message,
      });
      throw error;
    }
  }

  async getFeedback(id) {
    try {
      const feedback = this.feedback.find((f) => f.id === id);
      return feedback;
    } catch (error) {
      logger.error("Error retrieving feedback from database", {
        error: error.message,
      });
      throw error;
    }
  }

  async getAllFeedback() {
    try {
      return this.feedback;
    } catch (error) {
      logger.error("Error retrieving all feedback from database", {
        error: error.message,
      });
      throw error;
    }
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = new Database();
