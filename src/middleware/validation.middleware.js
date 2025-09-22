const logger = require("../utils/logger.utils");

const validateWebhook = (req, res, next) => {
  try {
    // Basic validation for Twilio webhook
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Check for required Twilio fields
    if (!req.body.From || !req.body.Body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    next();
  } catch (error) {
    logger.error("Webhook validation error", { error: error.message });
    res.status(400).json({ error: "Webhook validation failed" });
  }
};

const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(clientId)) {
      requests.set(clientId, []);
    }

    const clientRequests = requests.get(clientId);

    // Remove old requests
    const validRequests = clientRequests.filter(
      (time) => now - time < windowMs
    );
    requests.set(clientId, validRequests);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    validRequests.push(now);
    requests.set(clientId, validRequests);

    next();
  };
};

module.exports = {
  validateWebhook,
  rateLimiter,
};
