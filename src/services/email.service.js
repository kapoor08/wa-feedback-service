const nodemailer = require("nodemailer");
const config = require("../config/settings.config");
const logger = require("../utils/logger.utils");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendFeedbackEmail(from, body, rating = null) {
    try {
      const subject = this.generateSubject(rating);
      const htmlContent = this.generateHtmlContent(from, body, rating);

      const mailOptions = {
        from: config.email.from,
        to: config.email.to,
        subject,
        text: `New feedback received:\n\nFrom: ${from}\nRating: ${rating}\nFeedback: ${body}`,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info("Feedback email sent successfully", {
        messageId: result.messageId,
        from,
        rating,
      });

      return result;
    } catch (error) {
      logger.error("Failed to send feedback email", {
        error: error.message,
        from,
        rating,
      });
      throw error;
    }
  }

  generateSubject(rating) {
    if (!rating) return "New WhatsApp Feedback Received";

    if (rating >= 9) return "🌟 Excellent Feedback Received (NPS 9-10)";
    if (rating >= 7) return "😊 Positive Feedback Received (NPS 7-8)";
    return "⚠️ Improvement Needed - Feedback Received (NPS 1-6)";
  }

  generateHtmlContent(from, body, rating) {
    const ratingEmoji = this.getRatingEmoji(rating);

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New WhatsApp Feedback ${ratingEmoji}</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${from}</p>
          <p><strong>Rating:</strong> ${
            rating ? `${rating}/10` : "Not provided"
          }</p>
          <p><strong>Feedback:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">
            ${body}
          </p>
        </div>
        <p style="color: #666; font-size: 12px;">
          Received on ${new Date().toLocaleString()}
        </p>
      </div>
    `;
  }

  getRatingEmoji(rating) {
    if (!rating) return "";
    if (rating >= 9) return "🌟";
    if (rating >= 7) return "😊";
    return "😞";
  }
}

module.exports = new EmailService();
