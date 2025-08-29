/**
 * Supabase Client Configuration
 * Handles all authentication and database interactions
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration - Replace with your actual values
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth state management
export const authState = {
  user: null,
  session: null,
  isAdmin: false,
  isAuthenticated: false
}

/**
 * Initialize authentication state
 * Call this when the app starts
 */
export async function initAuth() {
  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return false
    }

    if (session) {
      authState.session = session
      authState.user = session.user
      authState.isAuthenticated = true
      
      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (!profileError && profile) {
        authState.isAdmin = profile.role === 'admin'
      }
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      
      authState.session = session
      authState.user = session?.user || null
      authState.isAuthenticated = !!session
      
      if (session?.user) {
        // Check admin status for new session
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        authState.isAdmin = profile?.role === 'admin'
      } else {
        authState.isAdmin = false
      }
      
      // Update UI based on auth state
      updateUIAuthState()
    })
    
    return true
  } catch (error) {
    console.error('Error initializing auth:', error)
    return false
  }
}

/**
 * Sign up a new user
 */
export async function signUp({ email, password, fullName, metadata = {} }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          ...metadata
        }
      }
    })
    
    if (error) throw error
    
    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: 'user'
          }
        ])
      
      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { data: null, error }
  }
}

/**
 * Sign in existing user
 */
export async function signIn({ email, password }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    return { data: null, error }
  }
}

/**
 * Sign in admin with special validation
 */
export async function signInAdmin({ username, password, accessCode }) {
  try {
    // Validate admin credentials
    if (username !== 'LearnTAV-Admin') {
      throw new Error('Invalid admin username')
    }
    
    if (accessCode !== '0410') {
      throw new Error('Invalid access code')
    }
    
    // For admin, we'll use a special email format
    const adminEmail = 'admin@learntav.com'
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password
    })
    
    if (error) throw error
    
    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
    
    if (profileError || profile?.role !== 'admin') {
      await supabase.auth.signOut()
      throw new Error('Unauthorized: Admin access required')
    }
    
    // Log admin access
    await logAdminAccess(data.user.id, 'admin_login', {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    })
    
    return { data, error: null }
  } catch (error) {
    console.error('Admin sign in error:', error)
    return { data: null, error }
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear auth state
    authState.user = null
    authState.session = null
    authState.isAdmin = false
    authState.isAuthenticated = false
    
    // Update UI
    updateUIAuthState()
    
    return { error: null }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error }
  }
}

/**
 * Reset password
 */
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    console.error('Password reset error:', error)
    return { error }
  }
}

/**
 * Update password
 */
export async function updatePassword(password) {
  try {
    const { error } = await supabase.auth.updateUser({ password })
    
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    console.error('Password update error:', error)
    return { error }
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  if (!authState.user) return { data: null, error: new Error('No user logged in') }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authState.user.id)
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return { data: null, error }
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates) {
  if (!authState.user) return { error: new Error('No user logged in') }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', authState.user.id)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { data: null, error }
  }
}

/**
 * Submit contact form with comprehensive data handling
 */
export async function submitContactForm(formData) {
  try {
    // Validate required fields
    if (!formData.name || !formData.email) {
      throw new Error('Name and email are required fields')
    }
    
    // Check for spam (honeypot field)
    if (formData.website && formData.website.trim() !== '') {
      throw new Error('Spam submission detected')
    }
    
    // Prepare base submission data
    const submissionData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      form_type: formData.formType || formData.form_type || 'general',
      status: 'unread',
      submitted_at: new Date().toISOString(),
      metadata: {
        user_agent: formData.userAgent || navigator.userAgent,
        timestamp: formData.timestamp || new Date().toISOString(),
        url: formData.url || window.location.href,
        referrer: document.referrer || null
      }
    }
    
    // Handle form-type specific fields
    const formType = submissionData.form_type
    
    // Common fields for all forms
    if (formData.phone) submissionData.phone = formData.phone.trim()
    if (formData.referral_source) submissionData.metadata.referral_source = formData.referral_source
    
    // Form-type specific processing
    switch (formType) {
      case 'consultation':
        submissionData.subject = 'Free Consultation Request'
        submissionData.message = formData.goals || ''
        
        // Consultation-specific fields
        if (formData.company) submissionData.metadata.company = formData.company.trim()
        if (formData.service_interest) submissionData.metadata.service_interest = formData.service_interest
        if (formData.timeline) submissionData.metadata.timeline = formData.timeline
        if (formData.budget) submissionData.metadata.budget = formData.budget
        break
      
      case 'education':
        submissionData.subject = 'Education Programs Inquiry'
        submissionData.message = formData.learning_goals || ''
        
        // Education-specific fields
        if (formData.experience_level) submissionData.metadata.experience_level = formData.experience_level
        if (formData.program_interest) submissionData.metadata.program_interest = formData.program_interest
        if (formData.preferred_start) submissionData.metadata.preferred_start = formData.preferred_start
        if (formData.learning_format) submissionData.metadata.learning_format = formData.learning_format
        break
      
      case 'consulting':
        submissionData.subject = 'Consulting Services Request'
        submissionData.message = formData.project_description || ''
        
        // Consulting-specific fields
        if (formData.company) submissionData.metadata.company = formData.company.trim()
        if (formData.job_title) submissionData.metadata.job_title = formData.job_title.trim()
        if (formData.company_size) submissionData.metadata.company_size = formData.company_size
        if (formData.service_type) submissionData.metadata.service_type = formData.service_type
        if (formData.timeline) submissionData.metadata.timeline = formData.timeline
        if (formData.budget) submissionData.metadata.budget = formData.budget
        break
      
      case 'general':
      default:
        submissionData.subject = formData.subject || 'General Inquiry'
        submissionData.message = formData.message || ''
        break
    }
    
    // Ensure message is not empty
    if (!submissionData.message || submissionData.message.trim() === '') {
      submissionData.message = 'No message provided'
    }
    
    // Insert into database
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([submissionData])
      .select()
    
    if (error) throw error
    
    // Log successful submission for admin tracking
    if (authState.user) {
      await logAdminAccess(authState.user.id, 'form_submitted', {
        form_type: formType,
        submission_id: data[0]?.id,
        timestamp: new Date().toISOString()
      })
    }
    
    return {
      success: true,
      data: data[0],
      error: null,
      message: 'Form submitted successfully'
    }
    
  } catch (error) {
    console.error('Contact form submission error:', error)
    
    // Return detailed error information
    return {
      success: false,
      data: null,
      error: error.message || 'Failed to submit form',
      details: error
    }
  }
}

/**
 * Log admin actions
 */
export async function logAdminAccess(adminId, action, details = {}) {
  try {
    await supabase
      .from('admin_logs')
      .insert([
        {
          admin_id: adminId,
          action,
          details,
          ip_address: null, // Would need external service to get IP
          created_at: new Date().toISOString()
        }
      ])
  } catch (error) {
    console.error('Error logging admin access:', error)
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return authState.isAuthenticated && authState.session
}

/**
 * Check if user is admin
 */
export function isAdmin() {
  return authState.isAdmin && authState.isAuthenticated
}

/**
 * Require authentication - redirect if not authenticated
 */
export function requireAuth(redirectUrl = '/') {
  if (!isAuthenticated()) {
    // Show auth modal or redirect
    showAuthModal()
    return false
  }
  return true
}

/**
 * Require admin access - redirect if not admin
 */
export function requireAdmin(redirectUrl = '/') {
  if (!isAdmin()) {
    window.location.href = redirectUrl
    return false
  }
  return true
}

/**
 * Update UI based on authentication state
 */
function updateUIAuthState() {
  // Update navigation
  const authButtons = document.querySelectorAll('[data-auth-state]')
  authButtons.forEach(button => {
    const requiredState = button.dataset.authState
    if (requiredState === 'authenticated' && isAuthenticated()) {
      button.style.display = 'block'
    } else if (requiredState === 'unauthenticated' && !isAuthenticated()) {
      button.style.display = 'block'
    } else if (requiredState === 'admin' && isAdmin()) {
      button.style.display = 'block'
    } else {
      button.style.display = 'none'
    }
  })
  
  // Dispatch custom event for other components
  window.dispatchEvent(new CustomEvent('authStateChanged', {
    detail: authState
  }))
}

/**
 * Show authentication modal
 */
function showAuthModal() {
  // This will be implemented in the auth modal component
  if (window.authModal) {
    window.authModal.show()
  }
}

// Export auth state for external access
export { authState as default }