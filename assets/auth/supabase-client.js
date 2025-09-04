/**
 * Supabase Client Configuration
 * Handles database connections and authentication for LearnTAV
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase configuration - using local storage for now
const SUPABASE_URL = 'https://learntav-local.supabase.co' // Local development
const SUPABASE_ANON_KEY = 'local-dev-key' // Local development key

// Create mock Supabase client for local development
export const supabase = {
  from: (table) => {
    const getTableData = (tableName) => {
      try {
        switch (tableName) {
          case 'users':
            return JSON.parse(localStorage.getItem('learntav_users') || '[]')
          case 'contact_submissions':
            return JSON.parse(localStorage.getItem('learntav_contact_submissions') || '[]')
          case 'enrollments':
            return JSON.parse(localStorage.getItem('learntav_enrollments') || '[]')
          case 'consults':
            return JSON.parse(localStorage.getItem('learntav_consults') || '[]')
          case 'admin_logs':
            return JSON.parse(localStorage.getItem('learntav_admin_logs') || '[]')
          default:
            return []
        }
      } catch {
        return []
      }
    }

    return {
      select: (columns = '*', options = {}) => {
        const data = getTableData(table)
        const count = data.length

        return {
          eq: (column, value) => ({
            single: () => {
              const item = data.find(row => row[column] === value)
              return Promise.resolve({ data: item || null, error: item ? null : { message: 'Not found' } })
            },
            limit: (n) => Promise.resolve({ data: data.filter(row => row[column] === value).slice(0, n), error: null, count }),
            range: (start, end) => Promise.resolve({ data: data.filter(row => row[column] === value).slice(start, end + 1), error: null, count }),
            order: (orderColumn, orderOptions) => ({
              limit: (n) => {
                const filtered = data.filter(row => row[column] === value)
                const sorted = orderOptions?.ascending === false
                  ? filtered.sort((a, b) => b[orderColumn] > a[orderColumn] ? 1 : -1)
                  : filtered.sort((a, b) => a[orderColumn] > b[orderColumn] ? 1 : -1)
                return Promise.resolve({ data: sorted.slice(0, n), error: null, count: filtered.length })
              },
              range: (start, end) => {
                const filtered = data.filter(row => row[column] === value)
                const sorted = orderOptions?.ascending === false
                  ? filtered.sort((a, b) => b[orderColumn] > a[orderColumn] ? 1 : -1)
                  : filtered.sort((a, b) => a[orderColumn] > b[orderColumn] ? 1 : -1)
                return Promise.resolve({ data: sorted.slice(start, end + 1), error: null, count: filtered.length })
              }
            })
          }),
          or: (conditions) => Promise.resolve({ data: data.slice(0, 50), error: null, count }),
          gte: (column, value) => ({
            order: (orderColumn, orderOptions) => ({
              limit: (n) => {
                const filtered = data.filter(row => new Date(row[column]) >= new Date(value))
                const sorted = orderOptions?.ascending === false
                  ? filtered.sort((a, b) => b[orderColumn] > a[orderColumn] ? 1 : -1)
                  : filtered.sort((a, b) => a[orderColumn] > b[orderColumn] ? 1 : -1)
                return Promise.resolve({ data: sorted.slice(0, n), error: null, count: filtered.length })
              }
            })
          }),
          order: (orderColumn, orderOptions) => ({
            limit: (n) => {
              const sorted = orderOptions?.ascending === false
                ? [...data].sort((a, b) => b[orderColumn] > a[orderColumn] ? 1 : -1)
                : [...data].sort((a, b) => a[orderColumn] > b[orderColumn] ? 1 : -1)
              return Promise.resolve({ data: sorted.slice(0, n), error: null, count })
            },
            range: (start, end) => {
              const sorted = orderOptions?.ascending === false
                ? [...data].sort((a, b) => b[orderColumn] > a[orderColumn] ? 1 : -1)
                : [...data].sort((a, b) => a[orderColumn] > b[orderColumn] ? 1 : -1)
              return Promise.resolve({ data: sorted.slice(start, end + 1), error: null, count })
            }
          }),
          limit: (n) => Promise.resolve({ data: data.slice(0, n), error: null, count }),
          range: (start, end) => Promise.resolve({ data: data.slice(start, end + 1), error: null, count })
        }
      },
      insert: (insertData) => {
        try {
          const data = getTableData(table)
          const newItems = Array.isArray(insertData) ? insertData : [insertData]
          const itemsWithIds = newItems.map(item => ({
            ...item,
            id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            created_at: item.created_at || new Date().toISOString()
          }))
          
          data.push(...itemsWithIds)
          localStorage.setItem(`learntav_${table}`, JSON.stringify(data))
          return Promise.resolve({ data: itemsWithIds, error: null })
        } catch (error) {
          return Promise.resolve({ data: null, error: { message: 'Insert failed' } })
        }
      },
      update: (updateData) => ({
        eq: (column, value) => {
          try {
            const data = getTableData(table)
            const index = data.findIndex(row => row[column] === value)
            if (index !== -1) {
              data[index] = { ...data[index], ...updateData, updated_at: new Date().toISOString() }
              localStorage.setItem(`learntav_${table}`, JSON.stringify(data))
              return Promise.resolve({ data: [data[index]], error: null })
            }
            return Promise.resolve({ data: null, error: { message: 'Not found' } })
          } catch (error) {
            return Promise.resolve({ data: null, error: { message: 'Update failed' } })
          }
        }
      }),
      upsert: (upsertData) => {
        try {
          const data = getTableData(table)
          const items = Array.isArray(upsertData) ? upsertData : [upsertData]
          
          items.forEach(item => {
            const existingIndex = data.findIndex(row => row.id === item.id)
            if (existingIndex !== -1) {
              data[existingIndex] = { ...data[existingIndex], ...item, updated_at: new Date().toISOString() }
            } else {
              data.push({
                ...item,
                id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                created_at: item.created_at || new Date().toISOString()
              })
            }
          })
          
          localStorage.setItem(`learntav_${table}`, JSON.stringify(data))
          return Promise.resolve({ data: items, error: null })
        } catch (error) {
          return Promise.resolve({ data: null, error: { message: 'Upsert failed' } })
        }
      }
    }
  },
  auth: {
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Local mode' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Local mode' } }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ user: null, error: null }),
    getSession: () => Promise.resolve({ session: null, error: null }),
    onAuthStateChange: () => ({ unsubscribe: () => {} })
  },
  channel: () => ({
    on: () => ({ subscribe: () => {} })
  })
}

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

// Database helpers with localStorage fallback
export const db = {
  // Users
  async getUsers(options = {}) {
    try {
      const users = JSON.parse(localStorage.getItem('learntav_users') || '[]')
      return { data: users.slice(0, options.limit || users.length), error: null, count: users.length }
    } catch {
      return { data: [], error: null, count: 0 }
    }
  },

  async getUserById(id) {
    try {
      const users = JSON.parse(localStorage.getItem('learntav_users') || '[]')
      const user = users.find(u => u.id === id)
      return { data: user || null, error: user ? null : { message: 'User not found' } }
    } catch {
      return { data: null, error: { message: 'Error loading user' } }
    }
  },

  // Enrollments
  async getEnrollments(options = {}) {
    try {
      const enrollments = JSON.parse(localStorage.getItem('learntav_enrollments') || '[]')
      return { data: enrollments.slice(0, options.limit || enrollments.length), error: null, count: enrollments.length }
    } catch {
      return { data: [], error: null, count: 0 }
    }
  },

  async createEnrollment(enrollmentData) {
    try {
      const enrollments = JSON.parse(localStorage.getItem('learntav_enrollments') || '[]')
      const newEnrollment = { ...enrollmentData, id: Date.now().toString(), created_at: new Date().toISOString() }
      enrollments.push(newEnrollment)
      localStorage.setItem('learntav_enrollments', JSON.stringify(enrollments))
      return { data: [newEnrollment], error: null }
    } catch (error) {
      return { data: null, error: { message: 'Failed to save enrollment' } }
    }
  },

  // Consults
  async getConsults(options = {}) {
    try {
      const consults = JSON.parse(localStorage.getItem('learntav_consults') || '[]')
      return { data: consults.slice(0, options.limit || consults.length), error: null, count: consults.length }
    } catch {
      return { data: [], error: null, count: 0 }
    }
  },

  async createConsult(consultData) {
    try {
      const consults = JSON.parse(localStorage.getItem('learntav_consults') || '[]')
      const newConsult = { ...consultData, id: Date.now().toString(), created_at: new Date().toISOString() }
      consults.push(newConsult)
      localStorage.setItem('learntav_consults', JSON.stringify(consults))
      return { data: [newConsult], error: null }
    } catch (error) {
      return { data: null, error: { message: 'Failed to save consultation' } }
    }
  },

  // Site settings
  async getSetting(key) {
    try {
      const value = localStorage.getItem(`learntav_setting_${key}`) || (key === 'admin_code' ? '2468' : null)
      return { data: { value }, error: null }
    } catch (error) {
      return { data: null, error: { message: 'Failed to get setting' } }
    }
  },

  async setSetting(key, value) {
    try {
      localStorage.setItem(`learntav_setting_${key}`, value)
      return { data: { key, value }, error: null }
    } catch (error) {
      return { data: null, error: { message: 'Failed to save setting' } }
    }
  },

  // Admin functions
  async isAdmin(userId) {
    // For demo purposes, allow admin access
    return { isAdmin: true, error: null }
  },

  async addAdmin(userId) {
    return { data: [{ user_id: userId }], error: null }
  }
}

// Contact form submission with localStorage
export async function submitContactForm(formData) {
  try {
    const submissions = JSON.parse(localStorage.getItem('learntav_contact_submissions') || '[]')
    const newSubmission = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      form_type: formData.formType || 'general',
      status: 'unread',
      submitted_at: new Date().toISOString()
    }
    
    submissions.push(newSubmission)
    localStorage.setItem('learntav_contact_submissions', JSON.stringify(submissions))
    
    return { success: true, data: [newSubmission] }
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
  return true // Local storage mode is always configured
}

export default supabase