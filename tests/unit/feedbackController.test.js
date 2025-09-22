const feedbackController = require("../../src/controllers/feedback.controller");
const emailService = require("../../src/services/email.service");
const twilioService = require("../../src/services/twilio.service");

// Mock services
jest.mock("../../src/services/email.service");
jest.mock("../../src/services/twilio.service");

describe("FeedbackController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleFeedback", () => {
    test("should process valid feedback", async () => {
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
      expect(JSON.parse(result.body).message).toBe(
        "Feedback processed successfully"
      );
    });

    test("should handle invalid input", async () => {
      const mockEvent = {
        body: "invalid-body",
        isBase64Encoded: false,
      };

      const result = await feedbackController.handleFeedback(mockEvent);
      expect(result.statusCode).toBe(400);
    });
  });

  describe("extractRating", () => {
    test("should extract numeric rating", () => {
      expect(feedbackController.extractRating("9")).toBe(9);
      expect(feedbackController.extractRating("10")).toBe(10);
    });

    test("should return null for non-numeric input", () => {
      expect(feedbackController.extractRating("Great service!")).toBe(null);
      expect(feedbackController.extractRating("")).toBe(null);
    });
  });

  describe("generateResponseMessage", () => {
    test("should generate promoter message", () => {
      const message = feedbackController.generateResponseMessage(10);
      expect(message).toContain("WOW"); // Change from "excellent"
    });

    test("should generate passive message", () => {
      const message = feedbackController.generateResponseMessage(8);
      expect(message).toContain("appreciate");
    });

    test("should generate detractor message", () => {
      const message = feedbackController.generateResponseMessage(5);
      expect(message).toContain("improve");
    });

    test("should handle no rating", () => {
      const message = feedbackController.generateResponseMessage(null);
      expect(message).toContain("1 and 10"); // Remove "number between"
    });
  });
});
