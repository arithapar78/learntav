# LearnTAV - System Patterns

## Website Architecture

### Multi-Page Professional Website Structure
```
LearnTAV Website Architecture
┌─────────────────────────────────────────────────────────────┐
│                    LearnTAV Professional Website            │
├─────────────────────────────────────────────────────────────┤
│  Homepage (index.html)                                     │
│  ├── Hero Section with Value Proposition                    │
│  ├── Service Overview Cards                                │
│  ├── Social Proof & Testimonials                           │
│  ├── Call-to-Action Sections                               │
│  └── Footer with Contact Information                        │
├─────────────────────────────────────────────────────────────┤
│  Education Services (/education/)                          │
│  ├── Learning Paths Overview                               │
│  ├── Course Catalog                                       │
│  ├── Success Stories                                      │
│  ├── Pricing & Enrollment                                 │
│  └── FAQ Section                                          │
├─────────────────────────────────────────────────────────────┤
│  Consulting Services (/consulting/)                        │
│  ├── Service Categories                                    │
│  ├── Case Studies & Results                               │
│  ├── Methodology Overview                                 │
│  ├── Team Expertise                                       │
│  └── Consultation Booking                                 │
├─────────────────────────────────────────────────────────────┤
│  About Us (/about/)                                       │
│  ├── Company Mission & Vision                             │
│  ├── Team Profiles                                        │
│  ├── Our Approach                                         │
│  ├── Values & Philosophy                                  │
│  └── Company Timeline                                     │
├─────────────────────────────────────────────────────────────┤
│  Contact (/contact/)                                       │
│  ├── Multiple Contact Forms                               │
│  ├── Consultation Booking                                 │
│  ├── Office Information                                   │
│  ├── Response Time Expectations                           │
│  └── Alternative Contact Methods                          │
├─────────────────────────────────────────────────────────────┤
│  Resources (/resources/)                                   │
│  ├── Free Guides & Templates                              │
│  ├── Blog Articles                                        │
│  ├── Tool Recommendations                                 │
│  ├── Industry Reports                                     │
│  └── Newsletter Signup                                    │
└─────────────────────────────────────────────────────────────┘
```

## Design System Patterns

### Professional Corporate Design Language
```css
/* LearnTAV Design System Variables */
:root {
  /* Primary Brand Colors */
  --primary: #2563eb;        /* Professional Blue */
  --primary-dark: #1d4ed8;   /* Darker Blue for hover */
  --secondary: #10b981;      /* Success Green */
  --accent: #6366f1;         /* Purple Accent */
  
  /* Semantic Colors */
  --success: #059669;        /* Achievement Green */
  --warning: #d97706;        /* Alert Orange */
  --error: #dc2626;          /* Error Red */
  --info: #0891b2;           /* Information Teal */
  
  /* Neutral Palette */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Typography Scale */
  --font-primary: 'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-heading: 'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'SF Mono', Monaco, monospace;
  
  /* Spacing Scale (8px base) */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Component Architecture Patterns

#### Card Component Pattern
```css
.learntav-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  transition: var(--transition-normal);
  border: 1px solid var(--gray-200);
}

.learntav-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.learntav-card--service {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: center;
}

.learntav-card__icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto var(--space-4);
  color: var(--primary);
}

.learntav-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-3);
}

.learntav-card__description {
  color: var(--gray-600);
  line-height: 1.6;
  flex-grow: 1;
}
```

#### Button System Pattern
```css
.learntav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition-fast);
  cursor: pointer;
  border: none;
  font-family: inherit;
  font-size: 0.875rem;
}

.learntav-btn--primary {
  background: var(--primary);
  color: white;
}

.learntav-btn--primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.learntav-btn--secondary {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
}

.learntav-btn--secondary:hover {
  background: var(--primary);
  color: white;
}

.learntav-btn--large {
  padding: var(--space-4) var(--space-8);
  font-size: 1rem;
}
```

## Layout Patterns

### Responsive Grid System
```css
.learntav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.learntav-grid {
  display: grid;
  gap: var(--space-6);
}

.learntav-grid--2-col {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.learntav-grid--3-col {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.learntav-grid--4-col {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

@media (max-width: 768px) {
  .learntav-grid {
    gap: var(--space-4);
  }
  
  .learntav-grid--2-col,
  .learntav-grid--3-col,
  .learntav-grid--4-col {
    grid-template-columns: 1fr;
  }
}
```

### Navigation Pattern
```css
.learntav-nav {
  background: white;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.learntav-nav__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
}

.learntav-nav__logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
}

.learntav-nav__menu {
  display: flex;
  list-style: none;
  gap: var(--space-6);
  margin: 0;
  padding: 0;
}

.learntav-nav__link {
  color: var(--gray-700);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition-fast);
}

.learntav-nav__link:hover,
.learntav-nav__link--active {
  color: var(--primary);
}

@media (max-width: 768px) {
  .learntav-nav__menu {
    display: none;
  }
  
  .learntav-nav__toggle {
    display: block;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--gray-700);
  }
}
```

## Form Handling Patterns

### Contact Form Structure
```html
<form class="learntav-form" action="/contact/submit" method="POST">
  <!-- CSRF Protection -->
  <input type="hidden" name="csrf_token" value="...">
  
  <!-- Honeypot for Spam Protection -->
  <div class="learntav-form__honeypot">
    <label for="website">Website (leave blank):</label>
    <input type="text" name="website" id="website" tabindex="-1">
  </div>
  
  <!-- Form Fields -->
  <div class="learntav-form__group">
    <label for="name" class="learntav-form__label">Full Name *</label>
    <input type="text" id="name" name="name" class="learntav-form__input" required>
  </div>
  
  <div class="learntav-form__group">
    <label for="email" class="learntav-form__label">Email Address *</label>
    <input type="email" id="email" name="email" class="learntav-form__input" required>
  </div>
  
  <div class="learntav-form__group">
    <label for="company" class="learntav-form__label">Company/Organization</label>
    <input type="text" id="company" name="company" class="learntav-form__input">
  </div>
  
  <div class="learntav-form__group">
    <label for="service" class="learntav-form__label">Service Interest *</label>
    <select id="service" name="service" class="learntav-form__select" required>
      <option value="">Select a service...</option>
      <option value="education-apps">Education: App Development</option>
      <option value="education-ai">Education: AI Workplace Skills</option>
      <option value="consulting-environmental">Consulting: Environmental Impact</option>
      <option value="consulting-healthcare">Consulting: Healthcare AI</option>
      <option value="other">Other</option>
    </select>
  </div>
  
  <div class="learntav-form__group">
    <label for="message" class="learntav-form__label">Message *</label>
    <textarea id="message" name="message" class="learntav-form__textarea" rows="5" required></textarea>
  </div>
  
  <button type="submit" class="learntav-btn learntav-btn--primary learntav-btn--large">
    Send Message
  </button>
</form>
```

### Form Validation Pattern
```javascript
class LearnTAVFormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.errors = {};
    this.setupValidation();
  }
  
  setupValidation() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validate()) {
        this.submitForm();
      }
    });
    
    // Real-time validation
    this.form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
    });
  }
  
  validate() {
    this.errors = {};
    
    // Required field validation
    const requiredFields = this.form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        this.addError(field.name, 'This field is required');
      }
    });
    
    // Email validation
    const emailField = this.form.querySelector('input[type="email"]');
    if (emailField && emailField.value && !this.isValidEmail(emailField.value)) {
      this.addError('email', 'Please enter a valid email address');
    }
    
    // Honeypot check (spam protection)
    const honeypot = this.form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      this.addError('spam', 'Spam detected');
    }
    
    this.displayErrors();
    return Object.keys(this.errors).length === 0;
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  addError(field, message) {
    this.errors[field] = message;
  }
  
  displayErrors() {
    // Clear existing errors
    this.form.querySelectorAll('.learntav-form__error').forEach(error => {
      error.remove();
    });
    
    // Display new errors
    Object.entries(this.errors).forEach(([field, message]) => {
      const fieldElement = this.form.querySelector(`[name="${field}"]`);
      if (fieldElement) {
        const errorElement = document.createElement('div');
        errorElement.className = 'learntav-form__error';
        errorElement.textContent = message;
        fieldElement.parentNode.appendChild(errorElement);
        fieldElement.classList.add('learntav-form__input--error');
      }
    });
  }
}
```

## Performance Optimization Patterns

### Image Optimization Pattern
```html
<!-- Responsive Images with WebP Support -->
<picture class="learntav-image">
  <source srcset="/assets/images/hero-image.webp" type="image/webp">
  <source srcset="/assets/images/hero-image.jpg" type="image/jpeg">
  <img src="/assets/images/hero-image.jpg" 
       alt="LearnTAV Education Platform" 
       loading="lazy"
       width="800" 
       height="600">
</picture>
```

### CSS Loading Strategy
```html
<!-- Critical CSS inlined in head -->
<style>
  /* Critical above-the-fold styles */
  .learntav-nav { ... }
  .learntav-hero { ... }
</style>

<!-- Non-critical CSS loaded asynchronously -->
<link rel="preload" href="/assets/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/assets/css/main.css"></noscript>
```

### JavaScript Loading Pattern
```html
<!-- Essential JavaScript -->
<script src="/assets/js/critical.min.js"></script>

<!-- Non-critical JavaScript -->
<script async src="/assets/js/main.min.js"></script>

<!-- Third-party scripts -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

This comprehensive system pattern documentation provides the foundation for building a professional, scalable, and maintainable website that aligns with LearnTAV's brand and business objectives.