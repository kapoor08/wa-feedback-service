// Global test setup
process.env.NODE_ENV = "test";
process.env.TWILIO_ACCOUNT_SID = "test_sid";
process.env.TWILIO_AUTH_TOKEN = "test_token";
process.env.TWILIO_WHATSAPP_NUMBER = "whatsapp:+1234567890";
process.env.EMAIL_HOST = "smtp.test.com";
process.env.EMAIL_PORT = "587";
process.env.EMAIL_USER = "test@test.com";
process.env.EMAIL_PASS = "test_password";
process.env.FROM_EMAIL = "test@test.com";
process.env.TO_EMAIL = "feedback@test.com";

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
