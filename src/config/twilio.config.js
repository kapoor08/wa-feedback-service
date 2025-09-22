const twilio = require("twilio");
const config = require("./settings.config");

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

module.exports = client;
