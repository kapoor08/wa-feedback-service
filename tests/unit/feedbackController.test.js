const feedbackController = require("../../src/controllers/feedbackController");
const emailService = require("../../src/services/emailService");
const twilioService = require("../../src/services/twilioService");

// Mock services
jest.mock("../../src/services/emailService");
jest.mock("../../src/services/twilioService");

describe("FeedbackController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleFeedback", () => {
    it("should process valid feedback successfully", async () => {
      const mockEvent = {
        body: "From=whatsapp%3A%2B1234567890&Body=Great%20service%21%209",
        isBase64Encoded: false,
      };

      emailService.sendFeedbackEmail.mockResolvedValue({
        messageId: "email-123",
      });
      twilioService.sendMessage.mockResolvedValue({ sid: "msg-123" });

      const result = await feedbackController.handleFeedback(mockEvent);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toHaveProperty(
        "message",
        "Feedback processed successfully"
      );
    });

    it("should handle invalid input", async () => {
      const mockEvent = {
        body: "invalid-body",
        isBase64Encoded: false,
      };

      const result = await feedbackController.handleFeedback(mockEvent);

      expect(result.statusCode).toBe(400);
    });

    it("should extract rating correctly", () => {
      const rating = feedbackController.extractRating("9");
      expect(rating).toBe(9);
    });

    it("should return null for non-numeric rating", () => {
      const rating = feedbackController.extractRating("Great service!");
      expect(rating).toBe(null);
    });
  });
});
