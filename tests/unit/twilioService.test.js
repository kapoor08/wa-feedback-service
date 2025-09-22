const TwilioService = require("../../src/services/twilio.service");

// Mock Twilio
jest.mock("twilio", () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn(),
    },
  }));
});

describe("TwilioService", () => {
  test("should format phone number correctly", () => {
    const formatted = TwilioService.formatPhoneNumber("+1234567890");
    expect(formatted).toBe("whatsapp:+1234567890");
  });

  test("should not double-format whatsapp numbers", () => {
    const formatted = TwilioService.formatPhoneNumber("whatsapp:+1234567890");
    expect(formatted).toBe("whatsapp:+1234567890");
  });
});
