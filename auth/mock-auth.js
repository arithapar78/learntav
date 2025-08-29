/**
 * Mock Authentication System for Local Development
 * Simulates Supabase authentication without requiring actual credentials
 */

// Mock users database
const MOCK_USERS = [
  {
    id: 'user-123',
    email: 'demo@learntav.com',
    password: 'demo123', // In real app, this would be hashed
    user_metadata: {
      full_name: 'Demo User'
    },
    role: 'user',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'admin-456',
    email: 'admin@learntav.com',
    password: 'admin123',
    user_metadata: {
      full_name: 'Admin User'
    },
    role: 'admin',
    created_at: new Date('2024-01-01').toISOString()
  }
];

// Mock session storage
const SESSION_KEY = 'learntav_session';
const USER_KEY = 'learntav_user';

class MockSupabaseClient {
  constructor() {
    this.auth = new MockAuth();
  }
}

class MockAuth {
  constructor() {
    this.callbacks = [];
  }

  // Mock sign in with password
  async signInWithPassword({ email, password }) {
    console.log('Mock: Signing in with', email);
    
    // Find user
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return {
        data: null,
        error: { message: 'Invalid login credentials' }
      };
    }

    // Create mock session
    const session = {
      access_token: 'mock-token-' + Date.now(),
      refresh_token: 'mock-refresh-' + Date.now(),
      expires_at: Date.now() + (3600 * 1000), // 1 hour
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.created_at
      }
    };

    // Store session
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(USER_KEY, JSON.stringify({ ...user, password: undefined }));

    // Notify callbacks
    this.notifyCallbacks('SIGNED_IN', session);

    return {
      data: { session, user: session.user },
      error: null
    };
  }

  // Mock sign up
  async signUp({ email, password, options = {} }) {
    console.log('Mock: Signing up with', email);
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      return {
        data: null,
        error: { message: 'User already registered' }
      };
    }

    // Create new user
    const newUser = {
      id: 'user-' + Date.now(),
      email,
      password, // In real app, this would be hashed
      user_metadata: options.data || {},
      role: 'user',
      created_at: new Date().toISOString()
    };

    // Add to mock database
    MOCK_USERS.push(newUser);

    // Create session
    const session = {
      access_token: 'mock-token-' + Date.now(),
      refresh_token: 'mock-refresh-' + Date.now(),
      expires_at: Date.now() + (3600 * 1000), // 1 hour
      user: {
        id: newUser.id,
        email: newUser.email,
        user_metadata: newUser.user_metadata,
        created_at: newUser.created_at
      }
    };

    // Store session
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(USER_KEY, JSON.stringify({ ...newUser, password: undefined }));

    // Notify callbacks
    this.notifyCallbacks('SIGNED_IN', session);

    return {
      data: { session, user: session.user },
      error: null
    };
  }

  // Mock sign out
  async signOut() {
    console.log('Mock: Signing out');
    
    // Clear storage
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);

    // Notify callbacks
    this.notifyCallbacks('SIGNED_OUT', null);

    return { error: null };
  }

  // Mock get session
  async getSession() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    
    if (!sessionData) {
      return { data: { session: null }, error: null };
    }

    try {
      const session = JSON.parse(sessionData);
      
      // Check if session is expired
      if (session.expires_at < Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(USER_KEY);
        return { data: { session: null }, error: null };
      }

      return { data: { session }, error: null };
    } catch (error) {
      return { data: { session: null }, error };
    }
  }

  // Mock password reset
  async resetPasswordForEmail(email, options = {}) {
    console.log('Mock: Password reset for', email);
    
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      return { error: { message: 'User not found' } };
    }

    // In a real app, this would send an email
    console.log('Mock: Password reset email would be sent to', email);
    return { error: null };
  }

  // Mock update user
  async updateUser(updates) {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const session = JSON.parse(sessionData);
    const user = MOCK_USERS.find(u => u.id === session.user.id);
    
    if (!user) {
      return { data: null, error: { message: 'User not found' } };
    }

    // Update user data
    if (updates.password) {
      user.password = updates.password;
    }
    if (updates.data) {
      user.user_metadata = { ...user.user_metadata, ...updates.data };
    }

    // Update session
    session.user.user_metadata = user.user_metadata;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(USER_KEY, JSON.stringify({ ...user, password: undefined }));

    return { data: { user: session.user }, error: null };
  }

  // Mock OAuth sign in
  async signInWithOAuth({ provider, options = {} }) {
    console.log('Mock: OAuth sign in with', provider);
    
    // For demo purposes, create a mock OAuth user
    const oauthUser = {
      id: 'oauth-' + Date.now(),
      email: `demo-${provider}@learntav.com`,
      user_metadata: {
        full_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`
      },
      role: 'user',
      created_at: new Date().toISOString()
    };

    MOCK_USERS.push(oauthUser);

    const session = {
      access_token: 'mock-oauth-token-' + Date.now(),
      refresh_token: 'mock-oauth-refresh-' + Date.now(),
      expires_at: Date.now() + (3600 * 1000),
      user: {
        id: oauthUser.id,
        email: oauthUser.email,
        user_metadata: oauthUser.user_metadata,
        created_at: oauthUser.created_at
      }
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(USER_KEY, JSON.stringify(oauthUser));

    this.notifyCallbacks('SIGNED_IN', session);

    return { data: { session, user: session.user }, error: null };
  }

  // Mock auth state change listener
  onAuthStateChange(callback) {
    this.callbacks.push(callback);
    
    // Check current session on registration
    this.getSession().then(({ data }) => {
      if (data.session) {
        callback('SIGNED_IN', data.session);
      } else {
        callback('SIGNED_OUT', null);
      }
    });

    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
          }
        }
      }
    };
  }

  // Notify all callbacks
  notifyCallbacks(event, session) {
    this.callbacks.forEach(callback => {
      try {
        callback(event, session);
      } catch (error) {
        console.error('Error in auth callback:', error);
      }
    });
  }
}

// Mock database operations
class MockDatabase {
  constructor(tableName) {
    this.tableName = tableName;
  }

  select(columns = '*') {
    return new MockQueryBuilder(this.tableName, 'select', columns);
  }

  insert(data) {
    return new MockQueryBuilder(this.tableName, 'insert', data);
  }

  update(data) {
    return new MockQueryBuilder(this.tableName, 'update', data);
  }

  from(tableName) {
    return new MockDatabase(tableName);
  }
}

class MockQueryBuilder {
  constructor(tableName, operation, data) {
    this.tableName = tableName;
    this.operation = operation;
    this.data = data;
    this.conditions = [];
  }

  eq(column, value) {
    this.conditions.push({ column, operator: 'eq', value });
    return this;
  }

  single() {
    this.returnSingle = true;
    return this;
  }

  async then() {
    // Mock database operations
    console.log(`Mock DB: ${this.operation} on ${this.tableName}`, this.data);
    
    if (this.tableName === 'profiles') {
      const userData = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
      
      if (this.operation === 'select') {
        const profile = {
          id: userData.id,
          full_name: userData.user_metadata?.full_name || userData.email?.split('@')[0],
          email: userData.email,
          role: userData.role || 'user',
          created_at: userData.created_at,
          updated_at: new Date().toISOString()
        };
        
        return { data: this.returnSingle ? profile : [profile], error: null };
      }
      
      if (this.operation === 'insert' || this.operation === 'update') {
        return { data: [this.data], error: null };
      }
    }
    
    if (this.tableName === 'contact_submissions') {
      if (this.operation === 'insert') {
        const submission = {
          id: Date.now(),
          ...this.data,
          created_at: new Date().toISOString()
        };
        console.log('Mock: Contact form submitted', submission);
        return { data: [submission], error: null };
      }
    }
    
    if (this.tableName === 'admin_logs') {
      if (this.operation === 'insert') {
        console.log('Mock: Admin action logged', this.data);
        return { data: [{ id: Date.now(), ...this.data }], error: null };
      }
    }
    
    return { data: [], error: null };
  }
}

// Create mock Supabase instance
export const mockSupabase = new MockSupabaseClient();

// Add from method to mock the full Supabase API
mockSupabase.from = (tableName) => new MockDatabase(tableName);

// Export demo credentials for testing
export const DEMO_CREDENTIALS = {
  user: { email: 'demo@learntav.com', password: 'demo123' },
  admin: { email: 'admin@learntav.com', password: 'admin123' }
};

console.log('Mock Authentication System loaded');
console.log('Demo credentials:', DEMO_CREDENTIALS);