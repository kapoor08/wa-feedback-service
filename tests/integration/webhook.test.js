const request = require("supertest");
const express = require("express");
const webhookRoutes = require("../../src/routes/webhook.routes");

// Mock services for integration tests
jest.mock("../../src/services/email.service");
jest.mock("../../src/services/twilio.service");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", webhookRoutes);

describe("Webhook Integration Tests", () => {
  test("POST /whatsapp should process webhook", async () => {
    const response = await request(app).post("/whatsapp").send({
      From: "whatsapp:+1234567890",
      Body: "Great service! 9",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  test("GET /send-survey should send survey", async () => {
    const response = await request(app)
      .get("/send-survey")
      .query({ to: "+1234567890" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "success");
  });

  test("should reject invalid phone number", async () => {
    const response = await request(app)
      .get("/send-survey")
      .query({ to: "invalid" });

    expect(response.status).toBe(400);
  });
});
