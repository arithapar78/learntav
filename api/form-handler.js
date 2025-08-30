/**
 * LearnTAV Form Handler API
 * Handles all form submissions, sends email notifications, and generates Gmail redirect URLs
 */

// Import required modules
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        error: 'Too many form submissions. Please wait before submitting again.',
        retryAfter: 15 * 60 * 1000
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/form-handler', limiter);

// Email transporter configuration
const createTransporter = () => {
    const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || 'hello@learntav.com',
            pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD
        }
    };

    return nodemailer.createTransporter(config);
};

// Form type configurations
const FORM_CONFIGS = {
    vibe_coding_101: {
        name: 'Vibe Coding 101 Enrollment',
        notificationSubject: 'New Vibe Coding 101 Enrollment',
        userEmailSubject: 'Enrollment Inquiry - Vibe Coding 101',
        requiredFields: ['studentName', 'studentAge', 'parentName', 'email', 'learningStyle', 'goals']
    },
    consultation: {
        name: 'Free Consultation Request',
        notificationSubject: 'New Consultation Request',
        userEmailSubject: 'Consultation Inquiry - LearnTAV',
        requiredFields: ['name', 'email', 'service_interest', 'goals']
    },
    education: {
        name: 'Education Inquiry',
        notificationSubject: 'New Education Program Inquiry',
        userEmailSubject: 'Education Program Inquiry - LearnTAV',
        requiredFields: ['name', 'email', 'experience_level', 'program_interest', 'learning_goals']
    },
    consulting: {
        name: 'Consulting Request',
        notificationSubject: 'New Consulting Request',
        userEmailSubject: 'Consulting Services Inquiry - LearnTAV',
        requiredFields: ['name', 'email', 'company', 'service_type', 'project_description']
    },
    general: {
        name: 'General Contact',
        notificationSubject: 'New General Contact Form',
        userEmailSubject: 'General Inquiry - LearnTAV',
        requiredFields: ['name', 'email', 'subject', 'message']
    },
    newsletter: {
        name: 'Newsletter Subscription',
        notificationSubject: 'New Newsletter Subscription',
        userEmailSubject: 'Welcome to LearnTAV Newsletter!',
        requiredFields: ['email']
    }
};

// Validation functions
const validateEmail = (email) => {
    return validator.isEmail(email) && validator.isLength(email, { max: 254 });
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return validator.escape(input.trim());
};

const validateFormData = (formType, data) => {
    const config = FORM_CONFIGS[formType];
    if (!config) {
        throw new Error('Invalid form type');
    }

    const errors = [];

    // Check required fields
    config.requiredFields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            errors.push(`${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`);
        }
    });

    // Validate email
    if (data.email && !validateEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }

    // Validate phone number if provided
    if (data.phone && data.phone.trim() && !validator.isMobilePhone(data.phone.replace(/\D/g, ''), 'any')) {
        errors.push('Please enter a valid phone number');
    }

    // Validate age if provided
    if (data.studentAge && (!validator.isInt(data.studentAge.toString(), { min: 6, max: 18 }))) {
        errors.push('Student age must be between 6 and 18');
    }

    // Check honeypot field
    if (data.website && data.website.trim() !== '') {
        throw new Error('Spam detected');
    }

    if (errors.length > 0) {
        throw new Error(errors.join(', '));
    }

    return true;
};

// Email template generators
const generateAdminNotification = (formType, data) => {
    const config = FORM_CONFIGS[formType];
    const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    let emailContent = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #667eea; margin: 0; font-size: 28px; font-weight: 700;">LearnTAV</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 16px;">${config.name}</p>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 22px; font-weight: 600;">📋 Submission Details</h2>
            <p style="color: #374151; margin: 5px 0;"><strong>Form Type:</strong> ${config.name}</p>
            <p style="color: #374151; margin: 5px 0;"><strong>Submitted:</strong> ${timestamp}</p>
            <p style="color: #374151; margin: 5px 0;"><strong>IP Address:</strong> ${data._metadata?.ip || 'Unknown'}</p>
        </div>
    `;

    if (formType === 'vibe_coding_101') {
        emailContent += `
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">🎓 Student Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #374151; font-weight: 600;">Student Name:</td><td style="padding: 8px 0; color: #1f2937;">${data.studentName}</td></tr>
                <tr><td style="padding: 8px 0; color: #374151; font-weight: 600;">Age:</td><td style="padding: 8px 0; color: #1f2937;">${data.studentAge} years old</td></tr>
                <tr><td style="padding: 8px 0; color: #374151; font-weight: 600;">Parent/Guardian:</td><td style="padding: 8px 0; color: #1f2937;">${data.parentName}</td></tr>
                <tr><td style="padding: 8px 0; color: #374151; font-weight: 600;">Email:</td><td style="padding: 8px 0; color: #1f2937;"><a href="mailto:${data.email}" style="color: #667eea;">${data.email}</a></td></tr>
                ${data.phone ? `<tr><td style="padding: 8px 0; color: #374151; font-weight: 600;">Phone:</td><td style="padding: 8px 0; color: #1f2937;"><a href="tel:${data.phone}" style="color: #667eea;">${data.phone}</a></td></tr>` : ''}
            </table>
        </div>

        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">🎯 Program Details</h3>
            <p style="color: #374151; margin: 10px 0;"><strong>Learning Style:</strong> ${data.learningStyle}</p>
            ${data.experience ? `<p style="color: #374151; margin: 10px 0;"><strong>Experience:</strong> ${data.experience}</p>` : ''}
            <p style="color: #374151; margin: 10px 0;"><strong>Goals:</strong> ${data.goals}</p>
            ${data.timing ? `<p style="color: #374151; margin: 10px 0;"><strong>Preferred Timing:</strong> ${data.timing}</p>` : ''}
        </div>
        `;
    } else if (['consultation', 'education', 'consulting', 'general'].includes(formType)) {
        emailContent += `
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">👤 Contact Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #374151; font-weight: 600;">Name:</td><td style="padding: 8px 0; color: #1f2937;">${data.name}</td></tr>
                <tr><td style="padding: 8px 0; color: #374151; font-weight: 600;">Email:</td><td style="padding: 8px 0; color: #1f2937;"><a href="mailto:${data.email}" style="color: #667eea;">${data.email}</a></td></tr>
                ${data.company ? `<tr><td style="padding: 8px 0; color: #374151; font-weight: 600;">Company:</td><td style="padding: 8px 0; color: #1f2937;">${data.company}</td></tr>` : ''}
                ${data.phone ? `<tr><td style="padding: 8px 0; color: #374151; font-weight: 600;">Phone:</td><td style="padding: 8px 0; color: #1f2937;"><a href="tel:${data.phone}" style="color: #667eea;">${data.phone}</a></td></tr>` : ''}
            </table>
        </div>
        `;

        // Add form-specific content sections
        const contentFields = {
            consultation: ['service_interest', 'goals', 'timeline', 'budget'],
            education: ['experience_level', 'program_interest', 'learning_goals', 'learning_format'],
            consulting: ['service_type', 'project_description', 'timeline', 'budget'],
            general: ['subject', 'message']
        };

        const fields = contentFields[formType] || [];
        if (fields.length > 0) {
            emailContent += `
            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
                <h3 style="color: #667eea; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📝 Details</h3>
            `;

            fields.forEach(field => {
                if (data[field]) {
                    const label = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    emailContent += `<p style="color: #374151; margin: 10px 0;"><strong>${label}:</strong> ${data[field]}</p>`;
                }
            });

            emailContent += '</div>';
        }
    } else if (formType === 'newsletter') {
        emailContent += `
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📧 Newsletter Subscription</h3>
            <p style="color: #374151; margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #667eea;">${data.email}</a></p>
            ${data.interests ? `<p style="color: #374151; margin: 10px 0;"><strong>Interests:</strong> ${data.interests}</p>` : ''}
        </div>
        `;
    }

    emailContent += `
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">⚡ Action Required</h3>
            <p style="color: #92400e; margin: 0; font-weight: 500;">Please respond within 24 hours to maintain our high service standard.</p>
        </div>

        <div style="text-align: center; padding: 30px 0; border-top: 1px solid #e5e7eb; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This notification was sent automatically from the LearnTAV contact system.
            </p>
        </div>
    </div>
    `;

    return {
        subject: `${config.notificationSubject} - ${data.name || data.parentName || data.email}`,
        html: emailContent,
        text: `New ${config.name} submission from ${data.name || data.parentName || data.email}. Please check the admin panel for full details.`
    };
};

const generateUserGmailTemplate = (formType, data) => {
    const config = FORM_CONFIGS[formType];
    let subject = config.userEmailSubject;
    let body = '';

    if (formType === 'vibe_coding_101') {
        subject = 'Enrollment Inquiry - Vibe Coding 101';
        body = `Hi,

This is ${data.parentName}, parent of ${data.studentName} (${data.studentAge} years old) reaching out to Learn TAV because I want to enroll my child in Vibe Coding 101.

Student Details:
• Name: ${data.studentName}
• Age: ${data.studentAge} years old
• Experience Level: ${data.experience || 'Not specified'}
• Learning Style Preference: ${data.learningStyle}
• Preferred Timing: ${data.timing || 'Flexible'}

Goals: ${data.goals}

Please contact me at ${data.email}${data.phone ? ` or ${data.phone}` : ''} to discuss enrollment and scheduling.

Best regards,
${data.parentName}`;

    } else if (formType === 'consultation') {
        subject = `Consultation Request - ${data.service_interest || 'General'}`;
        body = `Hi,

This is ${data.name} reaching out to LearnTAV to request a free consultation.

Contact Information:
• Name: ${data.name}
• Email: ${data.email}
${data.company ? `• Company: ${data.company}` : ''}
${data.phone ? `• Phone: ${data.phone}` : ''}

Service Interest: ${data.service_interest}
${data.timeline ? `Timeline: ${data.timeline}` : ''}
${data.budget ? `Budget Range: ${data.budget}` : ''}

Goals & Challenges:
${data.goals}

${data.referral_source ? `I heard about LearnTAV through: ${data.referral_source}` : ''}

Looking forward to discussing how LearnTAV can help achieve my goals.

Best regards,
${data.name}`;

    } else if (formType === 'education') {
        subject = `Education Program Inquiry - ${data.program_interest || 'General'}`;
        body = `Hi,

This is ${data.name} reaching out to LearnTAV regarding your education programs.

Contact Information:
• Name: ${data.name}
• Email: ${data.email}
${data.phone ? `• Phone: ${data.phone}` : ''}

Program Details:
• Experience Level: ${data.experience_level}
• Program Interest: ${data.program_interest}
${data.learning_format ? `• Preferred Format: ${data.learning_format}` : ''}
${data.preferred_start ? `• Preferred Start Date: ${data.preferred_start}` : ''}

Learning Goals:
${data.learning_goals}

I would appreciate detailed information about the programs and next steps.

Best regards,
${data.name}`;

    } else if (formType === 'consulting') {
        subject = `Consulting Services Inquiry - ${data.service_type || 'General'}`;
        body = `Hi,

This is ${data.name} from ${data.company} reaching out to LearnTAV regarding consulting services.

Contact Information:
• Name: ${data.name}
• Company: ${data.company}
• Email: ${data.email}
${data.job_title ? `• Title: ${data.job_title}` : ''}
${data.phone ? `• Phone: ${data.phone}` : ''}
${data.company_size ? `• Company Size: ${data.company_size}` : ''}

Project Details:
• Service Needed: ${data.service_type}
${data.timeline ? `• Timeline: ${data.timeline}` : ''}
${data.budget ? `• Budget Range: ${data.budget}` : ''}

Project Description:
${data.project_description}

I would like to discuss this project and explore how LearnTAV can help.

Best regards,
${data.name}`;

    } else if (formType === 'general') {
        subject = data.subject;
        body = `Hi,

This is ${data.name} reaching out to LearnTAV.

Subject: ${data.subject}

Message:
${data.message}

${data.referral_source ? `I heard about LearnTAV through: ${data.referral_source}` : ''}

Please contact me at ${data.email} with any questions.

Best regards,
${data.name}`;

    } else if (formType === 'newsletter') {
        subject = 'Newsletter Subscription Confirmation';
        body = `Hi,

I would like to subscribe to the LearnTAV newsletter.

Email: ${data.email}
${data.interests ? `Interests: ${data.interests}` : ''}

Please add me to your mailing list for weekly AI insights and updates.

Thank you!`;
    }

    return {
        subject: encodeURIComponent(subject),
        body: encodeURIComponent(body)
    };
};

// Main form handler endpoint
app.post('/api/form-handler', async (req, res) => {
    try {
        // Get client IP for logging
        const clientIP = req.headers['x-forwarded-for'] || 
                        req.headers['x-real-ip'] || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress ||
                        'unknown';

        // Extract and sanitize form data
        const formData = { ...req.body };
        const formType = formData.form_type || 'general';

        // Add metadata
        formData._metadata = {
            ip: clientIP,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString(),
            referer: req.headers.referer
        };

        // Sanitize all string inputs
        Object.keys(formData).forEach(key => {
            if (typeof formData[key] === 'string' && !key.startsWith('_')) {
                formData[key] = sanitizeInput(formData[key]);
            }
        });

        console.log(`Form submission received: ${formType} from ${clientIP}`);

        // Validate form data
        validateFormData(formType, formData);

        // Create email transporter
        const transporter = createTransporter();

        // Generate admin notification email
        const adminNotification = generateAdminNotification(formType, formData);
        
        // Generate user Gmail template
        const userGmailTemplate = generateUserGmailTemplate(formType, formData);

        // Send admin notification email
        const mailOptions = {
            from: `"LearnTAV Forms" <${process.env.SMTP_USER || 'hello@learntav.com'}>`,
            to: process.env.NOTIFICATION_EMAIL || 'hello@learntav.com',
            subject: adminNotification.subject,
            html: adminNotification.html,
            text: adminNotification.text,
            replyTo: formData.email
        };

        await transporter.sendMail(mailOptions);
        console.log(`Admin notification sent for ${formType} form`);

        // Generate Gmail redirect URL
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=hello@learntav.com&su=${userGmailTemplate.subject}&body=${userGmailTemplate.body}`;

        // Send successful response
        res.status(200).json({
            success: true,
            message: 'Form submitted successfully',
            gmailUrl: gmailUrl,
            formType: formType,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Form submission error:', error);

        // Log error details
        const errorDetails = {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            formData: req.body
        };

        // Send error response
        res.status(400).json({
            success: false,
            error: error.message || 'Form submission failed',
            timestamp: new Date().toISOString()
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`LearnTAV Form Handler running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
}

module.exports = app;