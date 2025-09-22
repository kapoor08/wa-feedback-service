# WhatsApp Feedback Collection System

A Node.js application that collects customer feedback via WhatsApp using Twilio API, with automatic email notifications and customizable response messages.

## Features

- **WhatsApp Integration**: Receive feedback via WhatsApp using Twilio API
- **NPS Rating System**: Collect and categorize Net Promoter Score ratings (1-10)
- **Email Notifications**: Automatic email notifications for new feedback with HTML formatting
- **Custom Response Messages**: Personalized responses based on rating categories
- **Dual Deployment**: Works for both local development and AWS Lambda
- **Input Validation**: Comprehensive validation using Joi
- **Error Handling**: Robust error handling and logging with Winston
- **Retry Logic**: Exponential backoff for failed message sends

## Project Structure

```
whatsapp-feedback-nodejs/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── settings.js
│   │   └── twilio.js
│   ├── controllers/
│   │   ├── feedback.controller.js
│   │   └── survey.controller.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── twilioService.js
│   │   └── validationService.js
│   ├── models/
│   │   └── feedback.js
│   ├── routes/
│   │   └── webhook.routes.js
│   ├── utils/
│   │   ├── logger.utils.js
│   │   └── responseHelper.utils.js
│   └── middleware/
│       ├── errorHandler.js
│       └── validation.middleware.js
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
├── serverless.yml
├── index.js
└── README.md
```

## Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd whatsapp-feedback-nodejs
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

### 3. Configure Environment Variables

#### Twilio Configuration

1. Sign up at [Twilio.com](https://www.twilio.com)
2. Get Account SID and Auth Token from console dashboard
3. For testing: Use sandbox number `whatsapp:+14155238886`
4. For production: Apply for WhatsApp Business API approval

#### Email Configuration (Gmail)

1. Enable 2-Step Verification in Google Account
2. Generate App Password: Google Account → Security → App passwords
3. Select "Mail" app and generate 16-character password

#### Complete .env Configuration

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_16_char_app_password
FROM_EMAIL=your-email@gmail.com
TO_EMAIL=feedback@yourcompany.com

# Application Configuration
NODE_ENV=development
LOG_LEVEL=info
MAX_RETRY_ATTEMPTS=3

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Local Development

### 1. Start the Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 2. Set Up Public URL (Required for Webhooks)

**Option A: Using ngrok**

```bash
# Install ngrok from ngrok.com
# Get free static domain from ngrok dashboard
ngrok http 3000 --domain=your-static-domain.ngrok-free.app
```

**Option B: Using localtunnel**

```bash
npm install -g localtunnel
lt --port 3000 --subdomain your-custom-name
# Gets you: https://your-custom-name.loca.lt
```

### 3. Configure Twilio Webhook

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to Messaging → Try it out → Send a WhatsApp message
3. In Sandbox Configuration:
   - **When a message comes in**: `https://your-public-url/whatsapp`
   - **Method**: `POST`
4. Click "Save"

### 4. Connect to WhatsApp Sandbox

1. Save `+1 415 523 8886` in your contacts
2. Send WhatsApp message: `join your-sandbox-code`
3. Wait for confirmation message

## Testing

### Send Survey

```bash
# Note: Use %2B instead of + in URLs
curl "http://localhost:3000/send-survey?to=%2B917719447215"
```

### Test Webhook Directly

```bash
curl -X POST http://localhost:3000/whatsapp \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp%3A%2B917719447215&Body=Great%20service%21%209"
```

### Expected Flow

1. **Send survey** → User receives WhatsApp message with rating instructions
2. **User replies with rating** (e.g., "9" or "Great service! 9")
3. **System responds** with personalized message based on rating:
   - **9-10**: "🌟 Thank you for your excellent feedback!"
   - **7-8**: "😊 Thank you for your feedback!"
   - **1-6**: "We appreciate your honest feedback..."
4. **Email notification** sent to configured address

## Message Customization

Customize response messages in `src/controllers/feedback.controller.js`:

```javascript
generateResponseMessage(rating) {
  if (!rating) {
    return "Thank you! Please rate us 1-10.";
  }

  const category = validationService.categorizeRating(rating);

  const responses = {
    promoter: `🌟 Wow! ${rating}/10! You're amazing!`,
    passive: `😊 Thanks for the ${rating}/10 rating!`,
    detractor: `🙏 Thanks for ${rating}/10. We'll improve!`
  };

  return responses[category];
}
```

## Production Deployment

### AWS Lambda (Serverless)

```bash
# Install Serverless Framework
npm install -g serverless

# Deploy
serverless deploy

# Update Twilio webhook to deployed API Gateway URL
```

### Alternative Hosting Options

- **Railway**: `railway deploy`
- **Render**: Connect GitHub repository
- **Vercel**: `vercel --prod`

## API Endpoints

- `POST /whatsapp` - Webhook for receiving WhatsApp messages
- `GET /send-survey?to=+1234567890` - Send survey message

## Troubleshooting

### WhatsApp Messages Not Received

- Verify sandbox setup: Send `join your-code` to `+1 415 523 8886`
- Check phone number format: Must include country code with `+`
- Verify Twilio credentials in `.env`

### Webhook Not Working

- Ensure public URL is accessible (test with curl)
- Check Twilio webhook configuration points to correct URL
- Verify ngrok/localtunnel is running and pointing to port 3000

### Emails Not Sent

- Use Gmail App Password, not regular password
- Verify 2-Step Verification is enabled
- Check spam folder
- Test SMTP credentials

### Validation Errors

- Phone numbers must match pattern: `+[country_code][number]`
- URL encoding: Use `%2B` instead of `+` in browser URLs
- Ensure all required environment variables are set

## Development Scripts

```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm test           # Run tests
npm run lint       # Lint code
npm run format     # Format code with Prettier
```

## Dependencies

### Core Dependencies

- `twilio` - WhatsApp messaging
- `nodemailer` - Email notifications
- `joi` - Input validation
- `winston` - Logging
- `express` - Web framework
- `cors` - Cross-origin requests
- `helmet` - Security headers

### Development Dependencies

- `jest` - Testing framework
- `nodemon` - Development server
- `eslint` - Code linting
- `prettier` - Code formatting

## Security Considerations

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Implement rate limiting for production
- Validate all incoming webhook data
- Use HTTPS for webhook URLs

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review Twilio webhook logs
3. Check application logs for error messages
4. Verify environment configuration
