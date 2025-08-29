/**
 * Route Protection System
 * Handles authentication-based route access and user management
 */

import { authState, isAuthenticated, isAdmin, initAuth } from '../auth/supabase-client.js';

/**
 * Route Protection Configuration
 * Define which routes require authentication or admin access
 */
const ROUTE_CONFIG = {
  // Public routes (no authentication required)
  public: [
    '/',
    '/index.html',
    '/about/',
    '/education/',
    '/consulting/',
    '/resources/',
    '/ai-tools/',
    '/contact/',
    '/legal/'
  ],
  
  // Protected routes (authentication required)
  protected: [
    '/dashboard/',
    '/profile/',
    '/settings/'
  ],
  
  // Admin routes (admin role required)
  admin: [
    '/admin/'
  ],
  
  // Auth routes (redirect if already logged in)
  auth: [
    '/auth/',
    '/auth/login',
    '/auth/signup',
    '/auth/reset-password'
  ]
};

/**
 * Route Protection Manager
 */
class RouteProtectionManager {
  constructor() {
    this.currentPath = window.location.pathname;
    this.isInitialized = false;
    this.authModal = null;
    this.init();
  }

  /**
   * Initialize route protection
   */
  async init() {
    try {
      // Initialize authentication first
      await initAuth();
      
      // Check current route protection
      await this.checkRouteAccess();
      
      // Set up navigation handlers
      this.setupNavigationHandlers();
      
      // Update UI based on auth state
      this.updateAuthUI();
      
      // Listen for auth state changes
      this.setupAuthStateListeners();
      
      this.isInitialized = true;
      console.log('Route protection initialized');
      
    } catch (error) {
      console.error('Error initializing route protection:', error);
    }
  }

  /**
   * Check if current route requires authentication
   */
  async checkRouteAccess() {
    const path = this.currentPath;
    const routeType = this.getRouteType(path);
    
    switch (routeType) {
      case 'admin':
        if (!isAdmin()) {
          this.handleUnauthorizedAccess('admin');
          return false;
        }
        break;
        
      case 'protected':
        if (!isAuthenticated()) {
          this.handleUnauthorizedAccess('auth');
          return false;
        }
        break;
        
      case 'auth':
        if (isAuthenticated()) {
          this.redirectToDashboard();
          return false;
        }
        break;
        
      case 'public':
      default:
        // Public route, no restrictions
        break;
    }
    
    return true;
  }

  /**
   * Determine route type based on path
   */
  getRouteType(path) {
    // Normalize path
    path = path.toLowerCase();
    if (path.endsWith('/index.html')) {
      path = path.replace('/index.html', '/');
    }
    
    // Check admin routes first (most restrictive)
    if (ROUTE_CONFIG.admin.some(route => path.startsWith(route))) {
      return 'admin';
    }
    
    // Check protected routes
    if (ROUTE_CONFIG.protected.some(route => path.startsWith(route))) {
      return 'protected';
    }
    
    // Check auth routes
    if (ROUTE_CONFIG.auth.some(route => path.startsWith(route))) {
      return 'auth';
    }
    
    // Default to public
    return 'public';
  }

  /**
   * Handle unauthorized access attempts
   */
  handleUnauthorizedAccess(requiredLevel) {
    if (requiredLevel === 'admin') {
      // Redirect to home with error message
      this.showErrorMessage('Admin access required');
      window.location.href = '/';
    } else if (requiredLevel === 'auth') {
      // Show authentication modal or redirect to login
      this.showAuthModal();
    }
  }

  /**
   * Redirect to appropriate dashboard
   */
  redirectToDashboard() {
    if (isAdmin()) {
      window.location.href = '/admin/dashboard.html';
    } else {
      window.location.href = '/dashboard/';
    }
  }

  /**
   * Set up navigation handlers for protected links
   */
  setupNavigationHandlers() {
    // Handle all navigation clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return; // Skip hash links, mailto, tel
      }
      
      // Check if this link requires authentication
      if (this.requiresAuth(href)) {
        if (!isAuthenticated()) {
          e.preventDefault();
          this.showAuthModal();
          return;
        }
      }
      
      // Check if this link requires admin access
      if (this.requiresAdmin(href)) {
        if (!isAdmin()) {
          e.preventDefault();
          this.showErrorMessage('Admin access required');
          return;
        }
      }
    });
  }

  /**
   * Check if a URL requires authentication
   */
  requiresAuth(url) {
    const path = new URL(url, window.location.origin).pathname;
    const routeType = this.getRouteType(path);
    return routeType === 'protected' || routeType === 'admin';
  }

  /**
   * Check if a URL requires admin access
   */
  requiresAdmin(url) {
    const path = new URL(url, window.location.origin).pathname;
    const routeType = this.getRouteType(path);
    return routeType === 'admin';
  }

  /**
   * Update UI based on authentication state
   */
  updateAuthUI() {
    // Update navigation items based on auth state
    const authButtons = document.querySelectorAll('[data-auth-state]');
    authButtons.forEach(button => {
      const requiredState = button.dataset.authState;
      
      switch (requiredState) {
        case 'authenticated':
          button.style.display = isAuthenticated() ? 'block' : 'none';
          break;
        case 'unauthenticated':
          button.style.display = !isAuthenticated() ? 'block' : 'none';
          break;
        case 'admin':
          button.style.display = isAdmin() ? 'block' : 'none';
          break;
      }
    });

    // Update user-specific content
    this.updateUserContent();
    
    // Update navigation menu
    this.updateNavigationMenu();
  }

  /**
   * Update user-specific content in the UI
   */
  updateUserContent() {
    const userNameElements = document.querySelectorAll('[data-user-name]');
    const userEmailElements = document.querySelectorAll('[data-user-email]');
    const userRoleElements = document.querySelectorAll('[data-user-role]');

    if (isAuthenticated() && authState.user) {
      const userData = authState.user.user_metadata || {};
      const userEmail = authState.user.email || '';
      const userName = userData.full_name || userEmail.split('@')[0];
      const userRole = isAdmin() ? 'Admin' : 'User';

      userNameElements.forEach(el => el.textContent = userName);
      userEmailElements.forEach(el => el.textContent = userEmail);
      userRoleElements.forEach(el => el.textContent = userRole);
    } else {
      userNameElements.forEach(el => el.textContent = 'Guest');
      userEmailElements.forEach(el => el.textContent = '');
      userRoleElements.forEach(el => el.textContent = '');
    }
  }

  /**
   * Update navigation menu with auth-specific items
   */
  updateNavigationMenu() {
    const nav = document.querySelector('.learntav-nav__menu');
    if (!nav) return;

    // Remove existing auth items
    nav.querySelectorAll('.nav-auth-item').forEach(item => item.remove());

    // Add appropriate items based on auth state
    if (isAuthenticated()) {
      // Add authenticated user items
      this.addNavItem(nav, {
        href: isAdmin() ? '/admin/dashboard.html' : '/dashboard/',
        text: 'Dashboard',
        className: 'nav-auth-item'
      });

      this.addNavItem(nav, {
        href: '/profile/',
        text: 'Profile', 
        className: 'nav-auth-item'
      });

      if (isAdmin()) {
        this.addNavItem(nav, {
          href: '/admin/dashboard.html',
          text: 'Admin Panel',
          className: 'nav-auth-item admin-item'
        });
      }
    }
  }

  /**
   * Add navigation item
   */
  addNavItem(nav, { href, text, className = '' }) {
    const link = document.createElement('a');
    link.href = href;
    link.className = `learntav-nav__link ${className}`;
    link.textContent = text;
    nav.appendChild(link);
  }

  /**
   * Set up auth state change listeners
   */
  setupAuthStateListeners() {
    window.addEventListener('authStateChanged', (e) => {
      console.log('Auth state changed:', e.detail);
      
      // Update UI
      this.updateAuthUI();
      
      // Re-check current route access
      this.checkRouteAccess();
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('routeProtectionUpdated', {
        detail: {
          isAuthenticated: isAuthenticated(),
          isAdmin: isAdmin(),
          user: authState.user
        }
      }));
    });
  }

  /**
   * Show authentication modal
   */
  showAuthModal() {
    // Try to use existing auth modal
    if (window.authModal && typeof window.authModal.show === 'function') {
      window.authModal.show();
      return;
    }

    // Fallback: redirect to auth page or show simple modal
    if (this.shouldRedirectToAuth()) {
      window.location.href = '/auth/';
    } else {
      this.showSimpleAuthModal();
    }
  }

  /**
   * Check if should redirect to auth page vs show modal
   */
  shouldRedirectToAuth() {
    // Redirect if we're not on a page that supports modals
    return window.innerWidth < 768 || !document.querySelector('.learntav-nav');
  }

  /**
   * Show simple authentication modal (fallback)
   */
  showSimpleAuthModal() {
    if (document.getElementById('simple-auth-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'simple-auth-modal';
    modal.className = 'simple-auth-modal';
    modal.innerHTML = `
      <div class="simple-auth-modal__backdrop">
        <div class="simple-auth-modal__content">
          <h3>Authentication Required</h3>
          <p>Please sign in to access this content.</p>
          <div class="simple-auth-modal__actions">
            <button onclick="window.location.href='/auth/'" class="learntav-btn learntav-btn--primary">
              Sign In
            </button>
            <button onclick="document.getElementById('simple-auth-modal').remove()" class="learntav-btn learntav-btn--secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.querySelector('.simple-auth-modal__backdrop').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        modal.remove();
      }
    });
  }

  /**
   * Show error message
   */
  showErrorMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'route-protection-toast error';
    toast.innerHTML = `
      <span class="toast-icon">⚠️</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    `;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto hide
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);

    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });
  }
}

/**
 * Initialize route protection when DOM is ready
 */
let routeManager = null;

document.addEventListener('DOMContentLoaded', function() {
  routeManager = new RouteProtectionManager();
});

// Export for external use
export { RouteProtectionManager, ROUTE_CONFIG };

// Make available globally for debugging
window.routeProtection = routeManager;