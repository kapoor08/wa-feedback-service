# WhatsApp Feedback Collection System

A serverless WhatsApp feedback collection system built with Node.js, AWS Lambda, and Twilio.

## Features

- **WhatsApp Integration**: Receive feedback via WhatsApp using Twilio API
- **NPS Rating System**: Collect and categorize Net Promoter Score ratings (1-10)
- **Email Notifications**: Automatic email notifications for new feedback
- **Serverless Architecture**: AWS Lambda deployment with Serverless Framework
- **Input Validation**: Comprehensive validation using Joi
- **Error Handling**: Robust error handling and logging with Winston
- **Rate Limiting**: Built-in rate limiting for webhook endpoints
- **Retry Logic**: Exponential backoff for failed message sends

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd whatsapp-feedback-nodejs
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Configure Twilio**

   - Sign up for a Twilio account
   - Get your Account SID and Auth Token
   - Set up WhatsApp sandbox or get approved WhatsApp number

5. **Configure Email**
   - Set up your email service (Gmail, SendGrid, etc.)
   - Add SMTP credentials to environment variables

## Deployment

### AWS Lambda (Recommended)

1. **Install Serverless Framework**

   ```bash
   npm install -g serverless
   ```

2. **Deploy to AWS**

   ```bash
   serverless deploy
   ```

3. **Set up Twilio Webhook**
   - Go to your Twilio Console
   - Configure webhook URL: `https://your-api-gateway-url/whatsapp`

### Local Development

```bash
npm run dev
```

## Usage

### Receiving Feedback

Users can send feedback to your WhatsApp number in two ways:

1. **Rating Only**: Send a number between 1-10
2. **Rating with Comment**: Send any message containing a rating

Example messages:

- "9" (rating only)
- "Great service! 10" (rating with comment)
- "The app is buggy and slow" (comment only)

### Sending Surveys

Trigger survey messages via API:

```bash
GET /send-survey?to=+1234567890
```

### API Endpoints

- `POST /whatsapp` - Webhook for receiving WhatsApp messages
- `GET /send-survey` - Send survey message to a phone number

## Configuration

### Environment Variables

| Variable                 | Description                              | Required |
| ------------------------ | ---------------------------------------- | -------- |
| `TWILIO_ACCOUNT_SID`     | Twilio Account SID                       | Yes      |
| `TWILIO_AUTH_TOKEN`      | Twilio Auth Token                        | Yes      |
| `TWILIO_WHATSAPP_NUMBER` | Your Twilio WhatsApp number              | Yes      |
| `EMAIL_HOST`             | SMTP host                                | Yes      |
| `EMAIL_PORT`             | SMTP port                                | Yes      |
| `EMAIL_USER`             | Email username                           | Yes      |
| `EMAIL_PASS`             | Email password/token                     | Yes      |
| `FROM_EMAIL`             | Sender email address                     | Yes      |
| `TO_EMAIL`               | Recipient email address                  | Yes      |
| `LOG_LEVEL`              | Logging level (error, warn, info, debug) | No       |
| `MAX_RETRY_ATTEMPTS`     | Max retry attempts for failed operations | No       |

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   Twilio API     │    │   AWS Lambda    │
│   User          │───▶│   Webhook        │───▶│   Function      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                         ┌─────────────────┐            │
                         │   Email         │◀───────────┘
                         │   Service       │
                         └─────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
