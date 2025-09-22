const validationService = require("../../src/services/validation.service");

describe("ValidationService", () => {
  describe("validateFeedbackInput", () => {
    test("should validate correct feedback input", () => {
      const input = {
        From: "whatsapp:+1234567890",
        Body: "Great service!",
      };

      const result = validationService.validateFeedbackInput(input);

      expect(result.isValid).toBe(true);
      expect(result.data.From).toBe("whatsapp:+1234567890");
      expect(result.data.Body).toBe("Great service!");
    });

    test("should reject invalid phone format", () => {
      const input = {
        From: "invalid-phone",
        Body: "Great service!",
      };

      const result = validationService.validateFeedbackInput(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("From");
    });

    test("should reject empty body", () => {
      const input = {
        From: "whatsapp:+1234567890",
        Body: "",
      };

      const result = validationService.validateFeedbackInput(input);

      expect(result.isValid).toBe(false);
    });
  });

  describe("isValidRating", () => {
    test("should accept valid ratings", () => {
      expect(validationService.isValidRating("1")).toBe(true);
      expect(validationService.isValidRating("5")).toBe(true);
      expect(validationService.isValidRating("10")).toBe(true);
    });

    test("should reject invalid ratings", () => {
      expect(validationService.isValidRating("0")).toBe(false);
      expect(validationService.isValidRating("11")).toBe(false);
      expect(validationService.isValidRating("abc")).toBe(false);
    });
  });

  describe("categorizeRating", () => {
    test("should categorize ratings correctly", () => {
      expect(validationService.categorizeRating("10")).toBe("promoter");
      expect(validationService.categorizeRating("9")).toBe("promoter");
      expect(validationService.categorizeRating("8")).toBe("passive");
      expect(validationService.categorizeRating("7")).toBe("passive");
      expect(validationService.categorizeRating("6")).toBe("detractor");
      expect(validationService.categorizeRating("1")).toBe("detractor");
    });
  });
});
