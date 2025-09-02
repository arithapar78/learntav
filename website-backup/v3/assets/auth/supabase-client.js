/**
 * Supabase Client Configuration
 * Handles database connections and authentication for LearnTAV
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase configuration - these should be set in your environment
const SUPABASE_URL = 'https://your-project.supabase.co' // Replace with your Supabase project URL
const SUPABASE_ANON_KEY = 'your-anon-key-here' // Replace with your anon key

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Authentication helpers
export const auth = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Users
  async getUsers(options = {}) {
    let query = supabase.from('users').select('*')
    
    if (options.limit) query = query.limit(options.limit)
    if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending })
    
    return await query
  },

  async getUserById(id) {
    return await supabase.from('users').select('*').eq('id', id).single()
  },

  // Enrollments
  async getEnrollments(options = {}) {
    let query = supabase
      .from('enrollments')
      .select(`
        *,
        users (
          id,
          email,
          name
        ),
        courses (
          id,
          title,
          slug
        )
      `)
    
    if (options.limit) query = query.limit(options.limit)
    if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending })
    
    return await query
  },

  async createEnrollment(enrollmentData) {
    return await supabase.from('enrollments').insert([enrollmentData])
  },

  // Consults
  async getConsults(options = {}) {
    let query = supabase
      .from('consults')
      .select(`
        *,
        users (
          id,
          email,
          name
        )
      `)
    
    if (options.limit) query = query.limit(options.limit)
    if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending })
    
    return await query
  },

  async createConsult(consultData) {
    return await supabase.from('consults').insert([consultData])
  },

  // Site settings
  async getSetting(key) {
    return await supabase.from('site_settings').select('value').eq('key', key).single()
  },

  async setSetting(key, value) {
    return await supabase.from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
  },

  // Admin functions
  async isAdmin(userId) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .single()
    
    return { isAdmin: !error && data !== null, error }
  },

  async addAdmin(userId) {
    return await supabase.from('admin_users').insert([{ user_id: userId }])
  }
}

// Contact form submission
export async function submitContactForm(formData) {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([{
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        form_type: formData.formType || 'general',
        status: 'unread',
        submitted_at: new Date().toISOString()
      }])
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return { success: false, error: error.message }
  }
}

// Realtime subscriptions
export function subscribeToTable(table, callback) {
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()
}

// Check if we're using real Supabase or need configuration
export function isConfigured() {
  return SUPABASE_URL !== 'https://your-project.supabase.co' && 
         SUPABASE_ANON_KEY !== 'your-anon-key-here'
}

export default supabase