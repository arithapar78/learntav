# LearnTAV Email Notification System - Deployment Guide

This guide walks through deploying the comprehensive email notification system for all LearnTAV forms.

## 🎯 System Overview

The email notification system provides:
- **Admin notifications** sent to `hello@learntav.com` for every form submission
- **Gmail redirects** for users to compose personalized emails
- **Multiple form support**: Vibe Coding 101, contact forms, newsletter, consulting
- **Spam protection** and input validation
- **Mobile-friendly** fallback mechanisms

## 📋 Pre-Deployment Checklist

### 1. Gmail Account Setup
- [ ] Enable 2-Factor Authentication on `hello@learntav.com`
- [ ] Generate Gmail App Password:
  1. Go to Google Account → Security → App passwords
  2. Select "Mail" as the app
  3. Copy the generated 16-character password
- [ ] Test SMTP connection with credentials

### 2. Server Requirements
- [ ] Node.js 18+ installed
- [ ] npm 9+ available
- [ ] Port 3001 available (or configure different port)
- [ ] SSL certificate for HTTPS (production)

### 3. Environment Configuration
- [ ] Copy `api/.env.example` to `api/.env`
- [ ] Configure all required environment variables
- [ ] Test SMTP connectivity

## 🚀 Deployment Steps

### Step 1: Install Dependencies
```bash
cd api
npm install --production
```

### Step 2: Configure Environment
```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

**Required Environment Variables:**
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@learntav.com
SMTP_PASS=your_16_char_gmail_app_password
NOTIFICATION_EMAIL=hello@learntav.com

# Security
NODE_ENV=production
ALLOWED_ORIGINS=https://learntav.com,https://www.learntav.com

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

### Step 3: Start the API Server

**For Development:**
```bash
npm run dev
```

**For Production (with PM2):**
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start form-handler.js --name "learntav-forms"

# Configure PM2 to restart on reboot
pm2 startup
pm2 save
```

### Step 4: Configure Reverse Proxy (Nginx)
```nginx
# Add to your nginx site configuration
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
    
    # Increase timeout for form processing
    proxy_read_timeout 60s;
    proxy_connect_timeout 60s;
}
```

### Step 5: Test Deployment
```bash
# Health check
curl https://learntav.com/api/health

# Test form submission
curl -X POST https://learntav.com/api/form-handler \
  -F "form_type=general" \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "subject=Deployment Test" \
  -F "message=Testing the email notification system"
```

## 🧪 Testing All Forms

### 1. Vibe Coding 101 Enrollment
- Navigate to: `https://learntav.com/education/vibe-coding-101/`
- Fill out enrollment form completely
- Submit and verify:
  - [ ] Gmail opens with pre-filled template
  - [ ] Admin notification received at hello@learntav.com
  - [ ] Email contains all student/parent details

### 2. Contact Forms
- Navigate to: `https://learntav.com/contact/`
- Test each tab:
  - [ ] **Free Consultation**: Complete form and submit
  - [ ] **Education Inquiry**: Fill out program interests
  - [ ] **Consulting Request**: Enter project details
  - [ ] **General Contact**: Send basic message

### 3. Newsletter Subscription
- Navigate to: `https://learntav.com/resources/newsletter/`
- Test both newsletter forms (header and footer)
- Verify:
  - [ ] Gmail opens with subscription request
  - [ ] Admin receives subscription notification

### 4. Error Handling & Fallbacks
- Test validation errors (empty required fields)
- Test network errors (disconnect internet briefly)
- Verify fallback mailto functionality works
- Check honeypot spam protection

## 📧 Email Templates Verification

### Admin Notification Format
Admin emails should contain:
- **Subject**: Form type + submitter name
- **Header**: LearnTAV branding with form type
- **Content**: Structured data in tables
- **Footer**: Action required within 24 hours
- **Styling**: Professional HTML formatting

### Gmail Template Format
User templates should include:
- **Subject**: Relevant to form type
- **Greeting**: Professional salutation
- **Content**: All form data organized clearly
- **Contact**: Email and phone (if provided)
- **Signature**: User's name

## 🔧 Troubleshooting

### Common Issues & Solutions

**1. SMTP Authentication Failed**
```bash
# Test SMTP credentials
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'hello@learntav.com',
    pass: 'your_app_password'
  }
});
transporter.verify().then(() => console('SMTP OK')).catch(console.error);
"
```

**2. Forms Not Submitting**
- Check browser console for JavaScript errors
- Verify API endpoint is accessible
- Test with curl command
- Check rate limiting (5 requests per 15 min per IP)

**3. Gmail URLs Not Working**
- Test URL encoding manually
- Check popup blockers
- Verify Gmail is accessible
- Test fallback mailto functionality

**4. Missing Email Notifications**
- Check spam folder
- Verify SMTP credentials
- Test with different email provider
- Check server logs for errors

### Debug Mode
Enable detailed logging:
```env
DEBUG=true
LOG_LEVEL=debug
```

## 📱 Mobile Testing

Test all forms on mobile devices:
- [ ] Forms render correctly on small screens
- [ ] Validation messages are visible
- [ ] Gmail redirect works on mobile
- [ ] Touch interactions work properly
- [ ] Error states display clearly

## 🔒 Security Verification

Confirm security measures are working:
- [ ] Rate limiting prevents spam (test with multiple quick submissions)
- [ ] Honeypot fields catch bots
- [ ] Input sanitization prevents XSS
- [ ] Email validation works correctly
- [ ] CORS headers are properly configured

## 📊 Monitoring Setup

### Health Monitoring
Set up monitoring for:
- API endpoint availability (`/api/health`)
- Email delivery success rates
- Form submission volumes
- Error rates and types

### Log Monitoring
Monitor logs for:
- Failed SMTP connections
- Validation errors
- Rate limiting triggers
- Spam detection events

### Alerts
Configure alerts for:
- API downtime
- Email delivery failures
- High error rates
- Unusual submission patterns

## 🔄 Maintenance

### Regular Tasks
- [ ] Monitor email delivery rates weekly
- [ ] Review form submission analytics monthly
- [ ] Update Gmail app passwords annually
- [ ] Test all forms after any website updates

### Updates & Scaling
- Monitor form submission volumes
- Scale server resources if needed
- Consider database storage for form submissions
- Add additional spam protection if required

## ✅ Go-Live Checklist

Before going live, verify:
- [ ] All environment variables configured correctly
- [ ] SMTP connection tested and working
- [ ] All form types tested end-to-end
- [ ] Mobile compatibility confirmed
- [ ] Security measures verified
- [ ] Error handling tested
- [ ] Fallback mechanisms working
- [ ] Monitoring and alerts configured
- [ ] Team trained on troubleshooting

## 📞 Support

For deployment issues:
1. Check the API logs: `pm2 logs learntav-forms`
2. Test health endpoint: `curl https://learntav.com/api/health`
3. Review environment variables in `.env`
4. Contact: hello@learntav.com

---

**Deployment Complete!** 🎉

Your LearnTAV email notification system is now ready to handle all form submissions with professional email notifications and seamless Gmail integration.