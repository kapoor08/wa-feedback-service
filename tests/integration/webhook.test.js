const request = require("supertest");
const express = require("express");
const webhookRoutes = require("../../src/routes/webhook");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", webhookRoutes);

describe("Webhook Integration Tests", () => {
  describe("POST /api/whatsapp", () => {
    it("should process webhook request", async () => {
      const response = await request(app).post("/api/whatsapp").send({
        From: "whatsapp:+1234567890",
        Body: "Test feedback 8",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/send-survey", () => {
    it("should send survey to valid phone number", async () => {
      const response = await request(app)
        .get("/api/send-survey")
        .query({ to: "+1234567890" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "success");
    });

    it("should reject invalid phone number", async () => {
      const response = await request(app)
        .get("/api/send-survey")
        .query({ to: "invalid" });

      expect(response.status).toBe(400);
    });
  });
});
