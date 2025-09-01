/**
 * Consultation Handler
 * Handles consultation bookings and integrates with Supabase
 */

import { supabase, auth, db } from '../auth/supabase-client.js';

export class ConsultHandler {
  constructor() {
    this.init();
  }

  async init() {
    this.bindEvents();
  }

  bindEvents() {
    // Look for consultation forms on the page
    document.querySelectorAll('.consult-form').forEach(form => {
      form.addEventListener('submit', (e) => this.handleConsultBooking(e));
    });

    // Look for book consultation buttons
    document.querySelectorAll('.book-consult-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleConsultClick(e));
    });
  }

  async handleConsultClick(e) {
    e.preventDefault();
    
    const button = e.currentTarget;
    const timeSlot = button.dataset.timeslot;
    const duration = button.dataset.duration || 60; // Default 60 minutes

    // Check if user is authenticated
    const { user } = await auth.getUser();
    
    if (!user) {
      // Redirect to login or show login modal
      alert('Please sign in to book consultations.');
      return;
    }

    try {
      // Show loading state
      button.disabled = true;
      button.textContent = 'Booking...';

      // Parse time slot
      const startTime = new Date(timeSlot);
      const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));

      // Create consultation record
      const consultData = {
        user_id: user.id,
        timeslot_start: startTime.toISOString(),
        timeslot_end: endTime.toISOString(),
        status: 'pending',
        payment_ref: null, // Will be filled by payment webhook
        notes: null
      };

      // Create consultation booking
      const { data, error } = await db.createConsult(consultData);
      
      if (error) throw error;

      // Show success message
      this.showSuccess(`Consultation booked for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}!`);
      
      // Mark button as booked
      button.textContent = 'Booked';
      button.classList.add('booked');

    } catch (error) {
      console.error('Consultation booking error:', error);
      this.showError('Failed to book consultation. Please try again.');
      
      // Reset button state
      button.disabled = false;
      button.textContent = 'Book Consultation';
    }
  }

  async handleConsultBooking(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const consultData = {
      date: formData.get('date'),
      time: formData.get('time'),
      duration: formData.get('duration') || 60,
      topic: formData.get('topic'),
      notes: formData.get('notes'),
      contact_email: formData.get('email'),
      contact_name: formData.get('name')
    };

    try {
      // Check if user is authenticated
      const { user } = await auth.getUser();
      
      if (!user) {
        throw new Error('Please sign in to book consultations');
      }

      // Combine date and time
      const datetime = new Date(`${consultData.date}T${consultData.time}`);
      const endTime = new Date(datetime.getTime() + (consultData.duration * 60 * 1000));

      // Create consultation
      const booking = await this.createConsultation(user.id, {
        timeslot_start: datetime.toISOString(),
        timeslot_end: endTime.toISOString(),
        notes: consultData.notes ? `Topic: ${consultData.topic}\nNotes: ${consultData.notes}` : `Topic: ${consultData.topic}`,
        status: 'pending'
      });

      this.showSuccess('Consultation booked successfully! You will receive a confirmation email shortly.');
      form.reset();
      
    } catch (error) {
      console.error('Consultation booking error:', error);
      this.showError(error.message);
    }
  }

  async createConsultation(userId, consultData) {
    // Check for conflicts
    const { data: existingConsults, error: conflictError } = await supabase
      .from('consults')
      .select('*')
      .gte('timeslot_start', consultData.timeslot_start)
      .lte('timeslot_start', consultData.timeslot_end)
      .neq('status', 'canceled');

    if (conflictError) throw conflictError;

    if (existingConsults && existingConsults.length > 0) {
      throw new Error('This time slot is already booked. Please choose another time.');
    }

    // Create consultation
    const fullConsultData = {
      user_id: userId,
      ...consultData
    };

    const { data, error } = await db.createConsult(fullConsultData);
    
    if (error) throw error;

    return data[0];
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

  // Helper method to generate available time slots
  generateTimeSlots(date, duration = 60) {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17;  // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      const slot = new Date(date);
      slot.setHours(hour, 0, 0, 0);
      
      slots.push({
        time: slot.toISOString(),
        display: slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        available: true // You would check this against existing bookings
      });
    }
    
    return slots;
  }
}

// Auto-initialize if forms exist
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.consult-form, .book-consult-btn')) {
    new ConsultHandler();
  }
});

export default ConsultHandler;