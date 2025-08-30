# LearnTAV Form Handler API

A comprehensive form handling API that processes all LearnTAV website forms, sends email notifications to administrators, and generates Gmail redirect URLs for users to compose personalized emails.

## 🚀 Features

- **Multi-form Support**: Handles all LearnTAV forms (Vibe Coding 101, contact forms, newsletter)
- **Email Notifications**: Sends beautifully formatted HTML emails to `hello@learntav.com`
- **Gmail Integration**: Generates pre-filled Gmail compose URLs for users
- **Spam Protection**: Honeypot fields and rate limiting
- **Input Validation**: Comprehensive validation and sanitization
- **Error Handling**: Graceful error handling with fallback options
- **Analytics Ready**: Tracks form submissions for analytics

## 📋 Supported Form Types

### 1. Vibe Coding 101 Enrollment (`vibe_coding_101`)
- Student and parent information
- Learning preferences and goals
- Age validation (6-18 years)
- Generates personalized enrollment email template

### 2. Free Consultation (`consultation`)
- Contact and company information
- Service interests and budget
- Timeline and goals
- Creates consultation request email

### 3. Education Inquiry (`education`)
- Experience level and program interest
- Learning goals and format preferences
- Start date preferences
- Generates education inquiry email

### 4. Consulting Request (`consulting`)
- Company details and project description
- Service type and timeline
- Budget range and requirements
- Creates professional consulting inquiry

### 5. General Contact (`general`)
- Basic contact form
- Subject and message
- Simple inquiry handling

### 6. Newsletter Subscription (`newsletter`)
- Email subscription
- Interest preferences
- Welcome email generation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm 9+
- SMTP email service (Gmail recommended)
- Environment variables configured

### Quick Start

1. **Install Dependencies**
```bash
cd api
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your SMTP credentials and settings
```

3. **Start the Server**
```bash
# Development
npm run dev

# Production
npm start
```

4. **Health Check**
```bash
curl http://localhost:3001/api/health
```

## ⚙️ Configuration

### Required Environment Variables

```env
# Email Configuration (Required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@learntav.com
SMTP_PASS=your_gmail_app_password
NOTIFICATION_EMAIL=hello@learntav.com

# Security
ALLOWED_ORIGINS=https://learntav.com,https://www.learntav.com
```

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use this password in the `SMTP_PASS` environment variable

## 📧 Email Templates

### Admin Notifications
- **Rich HTML formatting** with LearnTAV branding
- **Structured data display** with tables and sections
- **Action required alerts** for timely responses
- **Contact information** with clickable links

### User Gmail Templates
- **Form-specific messaging** tailored to each form type
- **Professional formatting** with proper structure
- **All form data included** in organized format
- **Clear call-to-action** and contact information

## 🔒 Security Features

### Spam Protection
- **Honeypot fields** to catch bots
- **Rate limiting** (5 requests per 15 minutes per IP)
- **Input sanitization** prevents XSS attacks
- **Email validation** with proper regex patterns

### Data Validation
- **Required field checking** for each form type
- **Email format validation** using industry standards
- **Phone number validation** for international formats
- **Age validation** for student enrollment (6-18 years)

## 🔧 API Endpoints

### POST `/api/form-handler`
Main form submission endpoint.

**Request Body:**
```javascript
{
  "form_type": "vibe_coding_101", // Required
  "email": "user@example.com",    // Required
  "name": "John Doe",             // Required (varies by form)
  // ... other form-specific fields
}
```

**Success Response:**
```javascript
{
  "success": true,
  "message": "Form submitted successfully",
  "gmailUrl": "https://mail.google.com/mail/?view=cm&fs=1&to=hello@learntav.com&su=...",
  "formType": "vibe_coding_101",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response:**
```javascript
{
  "success": false,
  "error": "Validation error message",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET `/api/health`
Health check endpoint for monitoring.

**Response:**
```javascript
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

## 📱 Client Integration

### Frontend JavaScript Example

```javascript
// Form submission with API integration
const form = document.getElementById('myForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  formData.set('form_type', 'consultation'); // Set form type
  
  try {
    const response = await fetch('/api/form-handler', {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    const result = await response.json();
    
    if (result.success && result.gmailUrl) {
      // Show success message
      showSuccess('Form submitted! Opening Gmail...');
      
      // Redirect to Gmail
      setTimeout(() => {
        window.open(result.gmailUrl, '_blank');
      }, 2000);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    // Show error with fallback options
    showError(error.message);
  }
});
```

## 🧪 Testing

### Manual Testing
1. Fill out each form type on the website
2. Check that admin notifications arrive at `hello@learntav.com`
3. Verify Gmail redirect URLs work correctly
4. Test error handling and fallback mechanisms
5. Confirm mobile compatibility

### API Testing with cURL

```bash
# Test Vibe Coding 101 enrollment
curl -X POST http://localhost:3001/api/form-handler \
  -F "form_type=vibe_coding_101" \
  -F "studentName=Test Student" \
  -F "studentAge=10" \
  -F "parentName=Test Parent" \
  -F "email=parent@example.com" \
  -F "learningStyle=group" \
  -F "goals=Learn to code apps"

# Test general contact form
curl -X POST http://localhost:3001/api/form-handler \
  -F "form_type=general" \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "subject=Test Message" \
  -F "message=This is a test message"
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Configure all required environment variables
   - Set up proper SMTP credentials

2. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start form-handler.js --name "learntav-forms"
   pm2 startup
   pm2 save
   ```

3. **Reverse Proxy (Nginx)**
   ```nginx
   location /api/ {
     proxy_pass http://localhost:3001;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection 'upgrade';
     proxy_set_header Host $host;
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header X-Forwarded-Proto $scheme;
     proxy_cache_bypass $http_upgrade;
   }
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Monitoring & Logs

### Health Monitoring
- Use `/api/health` endpoint for uptime monitoring
- Monitor response times and error rates
- Set up alerts for failed email deliveries

### Logging
- Form submissions are logged to console
- Error details include stack traces in development
- Analytics events can be integrated with Google Analytics

## 🔧 Troubleshooting

### Common Issues

1. **SMTP Authentication Failed**
   - Verify Gmail app password is correct
   - Check 2FA is enabled on Gmail account
   - Ensure SMTP settings match Gmail requirements

2. **Rate Limiting Triggered**
   - Default: 5 requests per 15 minutes per IP
   - Adjust `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS`
   - Consider IP whitelisting for testing

3. **Form Validation Errors**
   - Check required fields are populated
   - Verify email format is valid
   - Ensure student age is between 6-18 for enrollment

4. **Gmail URL Not Working**
   - Check URL encoding is proper
   - Verify Gmail is accessible in user's browser
   - Test fallback mailto functionality

### Debug Mode
Set `DEBUG=true` in environment variables for detailed logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Email**: hello@learntav.com
- **Documentation**: This README
- **Issues**: Create an issue in the repository

---

**LearnTAV Form Handler API** - Seamlessly connecting learners with LearnTAV through intelligent form processing and email integration.