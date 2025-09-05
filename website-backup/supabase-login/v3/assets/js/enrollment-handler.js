/**
 * Enrollment Handler
 * Handles course enrollments and integrates with Supabase
 */

import { supabase, auth, db } from '../auth/supabase-client.js';

export class EnrollmentHandler {
  constructor() {
    this.init();
  }

  async init() {
    this.bindEvents();
  }

  bindEvents() {
    // Look for enrollment forms on the page
    document.querySelectorAll('.enrollment-form').forEach(form => {
      form.addEventListener('submit', (e) => this.handleEnrollment(e));
    });

    // Look for enrollment buttons
    document.querySelectorAll('.enroll-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleEnrollmentClick(e));
    });
  }

  async handleEnrollmentClick(e) {
    e.preventDefault();
    
    const button = e.currentTarget;
    const courseSlug = button.dataset.course;
    const courseTitle = button.dataset.title;
    const price = button.dataset.price;

    // Check if user is authenticated
    const { user } = await auth.getUser();
    
    if (!user) {
      // Redirect to login or show login modal
      alert('Please sign in to enroll in courses.');
      return;
    }

    try {
      // Show loading state
      button.disabled = true;
      button.textContent = 'Enrolling...';

      // Create enrollment record
      const enrollmentData = {
        user_id: user.id,
        course_id: null, // We'll look this up by slug
        status: 'pending',
        source: 'form',
        payment_ref: null, // Will be filled by payment webhook
        enrolled_at: new Date().toISOString()
      };

      // First get the course ID
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', courseSlug)
        .single();

      if (courseError || !course) {
        throw new Error('Course not found');
      }

      enrollmentData.course_id = course.id;

      // Create enrollment
      const { data, error } = await db.createEnrollment(enrollmentData);
      
      if (error) throw error;

      // Show success message
      this.showSuccess(`Successfully enrolled in ${courseTitle}!`);
      
      // If this is a paid course, redirect to payment
      if (price && parseFloat(price) > 0) {
        this.initiatePayment(data[0].id, courseSlug, courseTitle, price);
      } else {
        // For free courses, mark as paid immediately
        await supabase
          .from('enrollments')
          .update({ status: 'paid' })
          .eq('id', data[0].id);
      }

    } catch (error) {
      console.error('Enrollment error:', error);
      this.showError('Failed to enroll. Please try again.');
    } finally {
      // Reset button state
      button.disabled = false;
      button.textContent = 'Enroll Now';
    }
  }

  async handleEnrollment(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const enrollmentData = {
      course_slug: formData.get('course_slug'),
      user_email: formData.get('email'),
      user_name: formData.get('name'),
      payment_method: formData.get('payment_method') || 'stripe'
    };

    try {
      // Check if user exists or create them
      const { user } = await auth.getUser();
      
      if (!user) {
        // For non-authenticated users, you might want to create a pending enrollment
        // and send them a magic link to complete it
        throw new Error('Authentication required');
      }

      await this.createEnrollment(user.id, enrollmentData.course_slug);
      
    } catch (error) {
      console.error('Enrollment submission error:', error);
      this.showError(error.message);
    }
  }

  async createEnrollment(userId, courseSlug) {
    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', courseSlug)
      .single();

    if (courseError) throw new Error('Course not found');

    // Create enrollment
    const enrollmentData = {
      user_id: userId,
      course_id: course.id,
      status: 'pending',
      source: 'form'
    };

    const { data, error } = await db.createEnrollment(enrollmentData);
    
    if (error) throw error;

    return data[0];
  }

  initiatePayment(enrollmentId, courseSlug, courseTitle, price) {
    // This would integrate with your payment provider
    // For now, just show a message
    const paymentUrl = `/payment?enrollment=${enrollmentId}&course=${courseSlug}&amount=${price}`;
    
    if (confirm(`Proceed to payment for ${courseTitle} ($${price})?`)) {
      window.location.href = paymentUrl;
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem;
      background: ${type === 'success' ? '#22c55e' : '#ef4444'};
      color: white;
      border-radius: 8px;
      z-index: 9999;
      max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Auto-initialize if forms exist
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.enrollment-form, .enroll-btn')) {
    new EnrollmentHandler();
  }
});

export default EnrollmentHandler;