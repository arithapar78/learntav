# LearnTAV - Tech Context

## Technologies Used

### Frontend Technologies
- **HTML5**: Semantic markup with accessibility standards (WCAG 2.1 AA)
- **CSS3**: Modern styling with Grid, Flexbox, and Custom Properties
- **JavaScript (ES2022+)**: Progressive enhancement and interactive features
- **Responsive Design**: Mobile-first approach with fluid layouts
- **Performance Optimization**: Image optimization, lazy loading, and caching

### Development Tools
- **VS Code**: Primary development environment
- **Git**: Version control and collaboration
- **Chrome DevTools**: Testing and debugging
- **Lighthouse**: Performance and accessibility auditing
- **W3C Validators**: HTML and CSS validation

### Hosting & Deployment
- **Standard Web Hosting**: Compatible with shared hosting, VPS, or cloud platforms
- **Static Site Hosting**: Can be deployed on Netlify, Vercel, or GitHub Pages
- **WordPress Hosting**: Easily adaptable to WordPress hosting environments
- **CDN Integration**: Ready for Content Delivery Network optimization

## Development Setup

### Prerequisites
```bash
# Basic requirements (no build tools needed for initial version)
Web Browser (Chrome, Firefox, Safari, Edge)
Text Editor (VS Code recommended)
Local Web Server (optional - Live Server extension)
```

### Project Structure
```
learntav/
├── README.md                    # Main project documentation
├── memory-bank/                 # Documentation and planning files
│   ├── projectbrief.md         # Project requirements and scope
│   ├── productContext.md       # Product purpose and goals
│   ├── systemPatterns.md       # Architecture and design patterns
│   ├── techContext.md          # This file - technical details
│   ├── activeContext.md        # Current work and decisions
│   └── progress.md             # Status tracking and roadmap
└── website/                     # Website files (to be created)
    ├── index.html              # Homepage
    ├── education/              # Education service pages
    ├── consulting/             # Consulting service pages
    ├── about/                  # Company information
    ├── contact/                # Contact forms and information
    ├── assets/                 # Images, fonts, and media
    │   ├── css/               # Stylesheets
    │   ├── js/                # JavaScript files
    │   └── images/            # Image assets
    └── resources/             # Downloadable resources
```

### Development Commands
```bash
# Setup (no build process required)
# Simply open files in browser or use Live Server

# For VS Code Live Server extension:
# Right-click on index.html and select "Open with Live Server"

# For Python simple server (if needed):
python -m http.server 8000

# For Node.js simple server (if needed):
npx serve .
```

## Technical Constraints

### Hosting Compatibility
- **Shared Hosting**: Must work on basic shared hosting with PHP/HTML support
- **WordPress Compatibility**: Structure should allow easy WordPress migration
- **No Build Requirements**: Avoid complex build tools for hosting simplicity
- **Database Optional**: Initial version uses static files, database features planned for later

### Performance Requirements
- **Page Load Time**: < 3 seconds on 3G connections
- **Lighthouse Score**: 90+ for Performance, Accessibility, Best Practices, SEO
- **Mobile Performance**: Optimized for mobile-first experience
- **Image Optimization**: WebP format with fallbacks, lazy loading

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Accessibility**: Screen reader compatible, keyboard navigation

### Security Considerations
- **Form Security**: CSRF protection and input validation
- **Content Security Policy**: Prevent XSS attacks
- **HTTPS Ready**: All resources use HTTPS-compatible paths
- **Privacy Compliant**: GDPR-ready contact forms

## Dependencies

### Production Dependencies (CDN-based)
```html
<!-- CSS Framework (optional) -->
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

<!-- Icons (optional) -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### JavaScript Libraries (if needed)
- **Form Handling**: Vanilla JavaScript for contact forms
- **Animations**: CSS-based animations with minimal JavaScript
- **Analytics**: Google Analytics 4 (optional)
- **Performance Monitoring**: Core Web Vitals tracking

## Tool Usage Patterns

### Development Workflow
1. **Design First**: Create wireframes and mockups
2. **Content Strategy**: Write and structure all content
3. **Progressive Development**: Build page by page
4. **Testing**: Cross-browser and device testing
5. **Optimization**: Performance and SEO optimization

### Quality Assurance
- **HTML Validation**: W3C Markup Validator
- **CSS Validation**: W3C CSS Validator  
- **Accessibility Testing**: axe-core, WAVE, manual keyboard testing
- **Performance Testing**: Lighthouse, PageSpeed Insights
- **Cross-Browser Testing**: BrowserStack or manual testing

### SEO Implementation
```html
<!-- Essential Meta Tags -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LearnTAV - AI Education & Consulting</title>
<meta name="description" content="Professional AI education and consulting services">
<meta name="keywords" content="AI education, app development, consulting">

<!-- Open Graph -->
<meta property="og:title" content="LearnTAV - AI Education & Consulting">
<meta property="og:description" content="Professional AI education and consulting services">
<meta property="og:image" content="/assets/images/og-image.jpg">
<meta property="og:url" content="https://learntav.com">

<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "LearnTAV",
  "description": "AI education and consulting services"
}
</script>
```

### Performance Optimization
```css
/* Critical CSS inlined in <head> */
/* Non-critical CSS loaded asynchronously */

/* Image optimization */
img {
  loading: lazy;
  width: 100%;
  height: auto;
}

/* Web fonts optimization */
@font-face {
  font-family: 'Inter';
  font-display: swap;
}
```

## Security Best Practices

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
">
```

### Form Security
- Input validation and sanitization
- CSRF token implementation (for dynamic forms)
- Rate limiting for contact forms
- Honeypot fields for spam protection

### Privacy Implementation
- Cookie consent banner
- Privacy policy integration
- GDPR-compliant contact forms
- Optional analytics with user consent

## Deployment Strategy

### Static Deployment
1. **File Upload**: Upload all files via FTP/SFTP
2. **URL Structure**: Clean URLs with proper redirects
3. **SSL Certificate**: Ensure HTTPS implementation
4. **Caching Headers**: Optimize browser and server caching

### WordPress Integration (Future)
- Convert to WordPress theme structure
- Implement WordPress contact form integration
- Add CMS capabilities for content management
- Maintain current design and functionality

This technical foundation provides a robust, scalable, and maintainable platform for LearnTAV's digital presence while ensuring compatibility with standard hosting environments.