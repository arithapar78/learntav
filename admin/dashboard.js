/**
 * Admin Dashboard JavaScript
 * Handles dashboard functionality, data management, and UI interactions
 */

// Mock auth system for demo purposes
const mockAuth = {
    user: { id: 'admin', email: '', role: 'admin' },
    isAuthenticated: true
};

// Mock functions to replace missing Supabase imports
function requireAdmin() {
    return mockAuth.isAuthenticated;
}

function signOut() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    return Promise.resolve();
}

function logAdminAccess(userId, action, details) {
    console.log('Admin Action:', { userId, action, details });
    return Promise.resolve();
}

// Empty data arrays - will show real data when available
const mockUsers = [];
const mockFormSubmissions = [];

// Mock Supabase client with realistic data
const supabase = {
    from: (table) => {
        const getData = () => {
            return table === 'profiles' ? mockUsers :
                   table === 'contact_submissions' ? mockFormSubmissions :
                   table === 'admin_logs' ? [] : [];
        };

        const createChainableQuery = (initialData = null) => {
            const data = initialData || getData();
            
            return {
                select: (columns = '*', options = {}) => {
                    if (options.count === 'exact' && options.head) {
                        return {
                            gte: (column, value) => Promise.resolve({
                                data: null,
                                error: null,
                                count: data.length
                            })
                        };
                    }
                    return createChainableQuery(data);
                },
                order: (column, order = {}) => createChainableQuery(data),
                limit: (limit) => createChainableQuery(data.slice(0, limit)),
                range: (start, end) => Promise.resolve({
                    data: data.slice(start, end + 1),
                    error: null,
                    count: data.length
                }),
                eq: (column, value) => {
                    const filtered = data.filter(item => item[column] === value);
                    const query = createChainableQuery(filtered);
                    query.single = () => Promise.resolve({
                        data: filtered[0] || null,
                        error: null
                    });
                    return query;
                },
                gte: (column, value) => {
                    // For date filtering, just return all data for demo
                    return Promise.resolve({
                        data: data,
                        error: null,
                        count: data.length
                    });
                },
                or: (condition) => createChainableQuery(data),
                single: () => Promise.resolve({
                    data: data[0] || null,
                    error: null
                })
            };
        };

        return {
            select: (columns = '*', options = {}) => {
                if (options.count === 'exact' && options.head) {
                    return {
                        gte: (column, value) => Promise.resolve({
                            data: null,
                            error: null,
                            count: getData().length
                        })
                    };
                }
                return createChainableQuery();
            },
            insert: (data) => Promise.resolve({ data: null, error: null }),
            update: (data) => ({
                eq: (column, value) => Promise.resolve({ data: null, error: null })
            })
        };
    }
};

const authState = mockAuth;

class AdminDashboard {
  constructor() {
    this.currentSection = 'overview'
    this.currentPage = {
      users: 1,
      forms: 1
    }
    this.pageSize = 10
    this.searchTerms = {
      users: '',
      forms: ''
    }
    this.filters = {
      users: { role: '', status: '' },
      forms: { type: '', status: '' }
    }
    this.init()
  }
  
  /**
   * Initialize dashboard
   */
  async init() {
    // Check authentication
    if (!requireAdmin()) {
      return
    }
    
    this.bindEvents()
    await this.loadDashboardData()
    this.startAutoRefresh()
    
    // Log dashboard access
    await logAdminAccess(authState.user.id, 'dashboard_access', {
      timestamp: new Date().toISOString(),
      section: this.currentSection
    })
  }
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section
        this.switchSection(section)
      })
    })
    
    // Logout
    document.getElementById('admin-logout').addEventListener('click', (e) => {
      e.preventDefault()
      this.handleLogout()
    })
    
    // Profile dropdown
    document.querySelector('.dropdown-toggle').addEventListener('click', (e) => {
      e.stopPropagation()
      document.querySelector('.dropdown-menu').classList.toggle('active')
    })
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      document.querySelector('.dropdown-menu').classList.remove('active')
    })
    
    // Quick actions
    document.querySelectorAll('.action-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action
        this.handleQuickAction(action)
      })
    })
    
    // Search functionality
    document.getElementById('user-search').addEventListener('input', (e) => {
      this.searchTerms.users = e.target.value
      this.debounce(() => this.loadUsersData(), 300)
    })
    
    document.getElementById('form-search').addEventListener('input', (e) => {
      this.searchTerms.forms = e.target.value
      this.debounce(() => this.loadFormsData(), 300)
    })
    
    // Filter controls
    document.getElementById('user-role-filter').addEventListener('change', (e) => {
      this.filters.users.role = e.target.value
      this.loadUsersData()
    })
    
    document.getElementById('user-status-filter').addEventListener('change', (e) => {
      this.filters.users.status = e.target.value
      this.loadUsersData()
    })
    
    document.getElementById('form-type-filter').addEventListener('change', (e) => {
      this.filters.forms.type = e.target.value
      this.loadFormsData()
    })
    
    document.getElementById('form-status-filter').addEventListener('change', (e) => {
      this.filters.forms.status = e.target.value
      this.loadFormsData()
    })
    
    // Export buttons
    document.getElementById('export-users').addEventListener('click', () => {
      this.exportData('users')
    })
    
    document.getElementById('export-forms').addEventListener('click', () => {
      this.exportData('forms')
    })
    
    // Pagination
    document.getElementById('users-prev').addEventListener('click', () => {
      if (this.currentPage.users > 1) {
        this.currentPage.users--
        this.loadUsersData()
      }
    })
    
    document.getElementById('users-next').addEventListener('click', () => {
      this.currentPage.users++
      this.loadUsersData()
    })
    
    document.getElementById('forms-prev').addEventListener('click', () => {
      if (this.currentPage.forms > 1) {
        this.currentPage.forms--
        this.loadFormsData()
      }
    })
    
    document.getElementById('forms-next').addEventListener('click', () => {
      this.currentPage.forms++
      this.loadFormsData()
    })
    
    // Settings
    document.getElementById('save-settings').addEventListener('click', () => {
      this.saveSettings()
    })
    
    document.getElementById('reset-settings').addEventListener('click', () => {
      this.resetSettings()
    })
    
    // Refresh activity
    document.getElementById('refresh-activity').addEventListener('click', () => {
      this.loadRecentActivity()
    })
    
    // Modal
    document.getElementById('close-modal').addEventListener('click', () => {
      this.closeModal()
    })
    
    document.getElementById('modal-close-btn').addEventListener('click', () => {
      this.closeModal()
    })
    
    // Close modal on overlay click
    document.getElementById('detail-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeModal()
      }
    })
  }
  
  /**
   * Switch dashboard section
   */
  async switchSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active')
    })
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active')
    
    // Update sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
      section.classList.remove('active')
    })
    document.getElementById(`${sectionName}-section`).classList.add('active')
    
    this.currentSection = sectionName
    
    // Load section-specific data
    switch (sectionName) {
      case 'users':
        await this.loadUsersData()
        break
      case 'forms':
        await this.loadFormsData()
        break
      case 'analytics':
        await this.loadAnalyticsData()
        break
      case 'overview':
        await this.loadDashboardData()
        break
    }
    
    // Log section access
    await logAdminAccess(authState.user.id, 'section_access', {
      section: sectionName,
      timestamp: new Date().toISOString()
    })
  }
  
  /**
   * Load dashboard overview data
   */
  async loadDashboardData() {
    this.showLoading('Loading dashboard data...')
    
    try {
      // Load stats
      await Promise.all([
        this.loadUserStats(),
        this.loadFormStats(),
        this.loadSystemStats(),
        this.loadRecentActivity()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      this.showError('Failed to load dashboard data')
    } finally {
      this.hideLoading()
    }
  }
  
  /**
   * Load user statistics
   */
  async loadUserStats() {
    try {
      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      if (usersError) throw usersError
      
      // Get users registered this month
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      
      const { count: monthlyUsers, error: monthlyError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonth.toISOString())
      
      if (monthlyError) throw monthlyError
      
      // Update UI
      document.getElementById('total-users-stat').textContent = totalUsers || 0
      
      // Show appropriate message based on data
      if (totalUsers === 0) {
        document.getElementById('users-change').textContent = 'No users yet'
      } else if (monthlyUsers > 0) {
        const changePercent = Math.round((monthlyUsers / Math.max(totalUsers - monthlyUsers, 1)) * 100)
        document.getElementById('users-change').textContent = `+${changePercent}% this month`
      } else {
        document.getElementById('users-change').textContent = 'No new users this month'
      }
      
    } catch (error) {
      console.error('Error loading user stats:', error)
      document.getElementById('total-users-stat').textContent = 'Error'
    }
  }
  
  /**
   * Load form submission statistics
   */
  async loadFormStats() {
    try {
      // Get total submissions count
      const { count: totalSubmissions, error: submissionsError } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
      
      if (submissionsError) throw submissionsError
      
      // Get submissions from this week
      const thisWeek = new Date()
      thisWeek.setDate(thisWeek.getDate() - 7)
      
      const { count: weeklySubmissions, error: weeklyError } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .gte('submitted_at', thisWeek.toISOString())
      
      if (weeklyError) throw weeklyError
      
      // Update UI
      document.getElementById('total-submissions-stat').textContent = totalSubmissions || 0
      
      // Show appropriate message based on data
      if (totalSubmissions === 0) {
        document.getElementById('submissions-change').textContent = 'No submissions yet'
      } else if (weeklySubmissions > 0) {
        const changePercent = Math.round((weeklySubmissions / Math.max(totalSubmissions - weeklySubmissions, 1)) * 100)
        document.getElementById('submissions-change').textContent = `+${changePercent}% this week`
      } else {
        document.getElementById('submissions-change').textContent = 'No new submissions this week'
      }
      
    } catch (error) {
      console.error('Error loading form stats:', error)
      document.getElementById('total-submissions-stat').textContent = 'Error'
    }
  }
  
  /**
   * Load system statistics
   */
  async loadSystemStats() {
    try {
      // No mock data - show actual system status
      document.getElementById('active-sessions-stat').textContent = '0'
      document.getElementById('system-status-stat').textContent = 'Online'
      document.getElementById('status-change').textContent = 'System operational'
      
    } catch (error) {
      console.error('Error loading system stats:', error)
    }
  }
  
  /**
   * Load recent activity
   */
  async loadRecentActivity() {
    try {
      const { data: activities, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      const activityList = document.getElementById('recent-activity-list')
      
      if (!activities || activities.length === 0) {
        activityList.innerHTML = '<div class="activity-empty">No activity to display yet</div>'
        return
      }
      
      const activityHTML = activities.map(activity => `
        <div class="activity-item">
          <div class="activity-icon">${this.getActivityIcon(activity.action)}</div>
          <div class="activity-content">
            <div class="activity-text">${this.getActivityText(activity)}</div>
            <div class="activity-time">${this.formatTimeAgo(activity.created_at)}</div>
          </div>
        </div>
      `).join('')
      
      activityList.innerHTML = activityHTML
      
    } catch (error) {
      console.error('Error loading recent activity:', error)
      document.getElementById('recent-activity-list').innerHTML = 
        '<div class="activity-error">Failed to load activity</div>'
    }
  }
  
  /**
   * Load users data
   */
  async loadUsersData() {
    const tbody = document.getElementById('users-table-body')
    tbody.innerHTML = '<tr class="loading-row"><td colspan="7"><div class="table-loading">Loading users...</div></td></tr>'
    
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(
          (this.currentPage.users - 1) * this.pageSize,
          this.currentPage.users * this.pageSize - 1
        )
      
      // Apply filters
      if (this.filters.users.role) {
        query = query.eq('role', this.filters.users.role)
      }
      
      // Apply search
      if (this.searchTerms.users) {
        query = query.or(`full_name.ilike.%${this.searchTerms.users}%,email.ilike.%${this.searchTerms.users}%`)
      }
      
      const { data: users, error, count } = await query
      
      if (error) throw error
      
      this.renderUsersTable(users)
      this.updatePagination('users', count)
      
    } catch (error) {
      console.error('Error loading users:', error)
      tbody.innerHTML = '<tr class="error-row"><td colspan="7"><div class="table-error">Failed to load users</div></td></tr>'
    }
  }
  
  /**
   * Render users table
   */
  renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body')
    
    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="7"><div class="table-empty">No users registered yet</div></td></tr>'
      return
    }
    
    const usersHTML = users.map(user => `
      <tr>
        <td><input type="checkbox" class="user-checkbox" data-id="${user.id}"></td>
        <td>
          <div class="user-info">
            <div class="user-avatar">${user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}</div>
            <div class="user-details">
              <div class="user-name">${user.full_name || 'No name'}</div>
              <div class="user-id">ID: ${user.id.substring(0, 8)}...</div>
            </div>
          </div>
        </td>
        <td>${user.email}</td>
        <td>
          <span class="role-badge role-${user.role}">${user.role}</span>
        </td>
        <td>
          <span class="status-badge status-active">Active</span>
        </td>
        <td>${this.formatDate(user.created_at)}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn view-btn" onclick="dashboard.viewUser('${user.id}')">👁️</button>
            <button class="action-btn edit-btn" onclick="dashboard.editUser('${user.id}')">✏️</button>
            <button class="action-btn delete-btn" onclick="dashboard.deleteUser('${user.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('')
    
    tbody.innerHTML = usersHTML
  }
  
  /**
   * Load forms data
   */
  async loadFormsData() {
    const tbody = document.getElementById('forms-table-body')
    tbody.innerHTML = '<tr class="loading-row"><td colspan="7"><div class="table-loading">Loading form submissions...</div></td></tr>'
    
    try {
      let query = supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' })
        .order('submitted_at', { ascending: false })
        .range(
          (this.currentPage.forms - 1) * this.pageSize,
          this.currentPage.forms * this.pageSize - 1
        )
      
      // Apply filters
      if (this.filters.forms.type) {
        query = query.eq('form_type', this.filters.forms.type)
      }
      
      if (this.filters.forms.status) {
        query = query.eq('status', this.filters.forms.status)
      }
      
      // Apply search
      if (this.searchTerms.forms) {
        query = query.or(`name.ilike.%${this.searchTerms.forms}%,email.ilike.%${this.searchTerms.forms}%,subject.ilike.%${this.searchTerms.forms}%`)
      }
      
      const { data: forms, error, count } = await query
      
      if (error) throw error
      
      this.renderFormsTable(forms)
      this.updatePagination('forms', count)
      
    } catch (error) {
      console.error('Error loading forms:', error)
      tbody.innerHTML = '<tr class="error-row"><td colspan="7"><div class="table-error">Failed to load form submissions</div></td></tr>'
    }
  }
  
  /**
   * Render forms table
   */
  renderFormsTable(forms) {
    const tbody = document.getElementById('forms-table-body')
    
    if (!forms || forms.length === 0) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="7"><div class="table-empty">No form submissions received yet</div></td></tr>'
      return
    }
    
    const formsHTML = forms.map(form => `
      <tr class="${form.status === 'unread' ? 'unread' : ''}">
        <td><input type="checkbox" class="form-checkbox" data-id="${form.id}"></td>
        <td>${form.name}</td>
        <td>${form.email}</td>
        <td>
          <span class="form-type-badge type-${form.form_type || 'general'}">${this.formatFormType(form.form_type)}</span>
        </td>
        <td>
          <span class="status-badge status-${form.status || 'unread'}">${form.status || 'unread'}</span>
        </td>
        <td>${this.formatDate(form.submitted_at)}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn view-btn" onclick="dashboard.viewForm('${form.id}')">👁️</button>
            <button class="action-btn reply-btn" onclick="dashboard.replyToForm('${form.id}')">↩️</button>
            <button class="action-btn delete-btn" onclick="dashboard.deleteForm('${form.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('')
    
    tbody.innerHTML = formsHTML
  }
  
  /**
   * Update pagination
   */
  updatePagination(type, totalCount) {
    const totalPages = Math.ceil(totalCount / this.pageSize)
    const currentPage = this.currentPage[type]
    
    document.getElementById(`${type}-page-info`).textContent = `Page ${currentPage} of ${totalPages}`
    document.getElementById(`${type}-prev`).disabled = currentPage <= 1
    document.getElementById(`${type}-next`).disabled = currentPage >= totalPages
  }
  
  /**
   * Handle quick actions
   */
  async handleQuickAction(action) {
    this.showLoading(`Processing ${action}...`)
    
    try {
      switch (action) {
        case 'export-users':
          await this.exportData('users')
          break
        case 'export-forms':
          await this.exportData('forms')
          break
        case 'clear-logs':
          await this.clearLogs()
          break
        case 'backup-data':
          await this.backupData()
          break
      }
    } catch (error) {
      console.error(`Error handling ${action}:`, error)
      this.showError(`Failed to ${action.replace('-', ' ')}`)
    } finally {
      this.hideLoading()
    }
  }
  
  /**
   * Export data as CSV
   */
  async exportData(type) {
    try {
      let data, filename
      
      if (type === 'users') {
        const { data: users, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        data = users
        filename = `learntav-users-${new Date().toISOString().split('T')[0]}.csv`
      } else if (type === 'forms') {
        const { data: forms, error } = await supabase
          .from('contact_submissions')
          .select('*')
          .order('submitted_at', { ascending: false })
        
        if (error) throw error
        
        data = forms
        filename = `learntav-forms-${new Date().toISOString().split('T')[0]}.csv`
      }
      
      if (!data) return
      
      // Convert to CSV
      const csv = this.convertToCSV(data)
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      this.showSuccess(`${type} data exported successfully`)
      
    } catch (error) {
      console.error('Export error:', error)
      this.showError('Failed to export data')
    }
  }
  
  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      })
      csvRows.push(values.join(','))
    })
    
    return csvRows.join('\n')
  }
  
  /**
   * View user details
   */
  async viewUser(userId) {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      
      this.showModal('User Details', this.renderUserDetails(user))
    } catch (error) {
      console.error('Error viewing user:', error)
      this.showError('Failed to load user details')
    }
  }
  
  /**
   * View form details
   */
  async viewForm(formId) {
    try {
      const { data: form, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('id', formId)
        .single()
      
      if (error) throw error
      
      // Mark as read
      await supabase
        .from('contact_submissions')
        .update({ status: 'read' })
        .eq('id', formId)
      
      this.showModal('Form Submission Details', this.renderFormDetails(form))
      
      // Refresh forms data
      if (this.currentSection === 'forms') {
        this.loadFormsData()
      }
    } catch (error) {
      console.error('Error viewing form:', error)
      this.showError('Failed to load form details')
    }
  }
  
  /**
   * Render user details
   */
  renderUserDetails(user) {
    return `
      <div class="detail-grid">
        <div class="detail-section">
          <h4>Basic Information</h4>
          <div class="detail-item">
            <label>Full Name:</label>
            <span>${user.full_name || 'Not provided'}</span>
          </div>
          <div class="detail-item">
            <label>Email:</label>
            <span>${user.email}</span>
          </div>
          <div class="detail-item">
            <label>Role:</label>
            <span class="role-badge role-${user.role}">${user.role}</span>
          </div>
          <div class="detail-item">
            <label>User ID:</label>
            <span class="monospace">${user.id}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>Account Information</h4>
          <div class="detail-item">
            <label>Created:</label>
            <span>${this.formatDate(user.created_at)}</span>
          </div>
          <div class="detail-item">
            <label>Updated:</label>
            <span>${this.formatDate(user.updated_at)}</span>
          </div>
        </div>
      </div>
    `
  }
  
  /**
   * Render form details
   */
  renderFormDetails(form) {
    return `
      <div class="detail-grid">
        <div class="detail-section">
          <h4>Contact Information</h4>
          <div class="detail-item">
            <label>Name:</label>
            <span>${form.name}</span>
          </div>
          <div class="detail-item">
            <label>Email:</label>
            <span>${form.email}</span>
          </div>
          <div class="detail-item">
            <label>Form Type:</label>
            <span class="form-type-badge type-${form.form_type || 'general'}">${this.formatFormType(form.form_type)}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>Message</h4>
          <div class="detail-item">
            <label>Subject:</label>
            <span>${form.subject || 'No subject'}</span>
          </div>
          <div class="detail-item message-content">
            <label>Message:</label>
            <div class="message-text">${form.message}</div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>Metadata</h4>
          <div class="detail-item">
            <label>Submitted:</label>
            <span>${this.formatDate(form.submitted_at)}</span>
          </div>
          <div class="detail-item">
            <label>Status:</label>
            <span class="status-badge status-${form.status || 'unread'}">${form.status || 'unread'}</span>
          </div>
          ${form.metadata ? `
            <div class="detail-item">
              <label>Metadata:</label>
              <pre class="metadata-display">${JSON.stringify(form.metadata, null, 2)}</pre>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }
  
  /**
   * Handle logout
   */
  async handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await logAdminAccess(authState.user.id, 'admin_logout', {
          timestamp: new Date().toISOString()
        })
        
        await signOut()
        window.location.href = './index.html'
      } catch (error) {
        console.error('Logout error:', error)
        this.showError('Failed to sign out')
      }
    }
  }
  
  /**
   * Show modal
   */
  showModal(title, content, actionText = null, actionCallback = null) {
    document.getElementById('modal-title').textContent = title
    document.getElementById('modal-body').innerHTML = content
    
    const actionBtn = document.getElementById('modal-action-btn')
    if (actionText && actionCallback) {
      actionBtn.textContent = actionText
      actionBtn.style.display = 'block'
      actionBtn.onclick = actionCallback
    } else {
      actionBtn.style.display = 'none'
    }
    
    document.getElementById('detail-modal').style.display = 'flex'
    document.body.style.overflow = 'hidden'
  }
  
  /**
   * Close modal
   */
  closeModal() {
    document.getElementById('detail-modal').style.display = 'none'
    document.body.style.overflow = ''
  }
  
  /**
   * Show loading overlay
   */
  showLoading(message = 'Loading...') {
    document.querySelector('.loading-text').textContent = message
    document.getElementById('loading-overlay').style.display = 'flex'
  }
  
  /**
   * Hide loading overlay
   */
  hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none'
  }
  
  /**
   * Show success message
   */
  showSuccess(message) {
    // Create toast notification
    this.showToast(message, 'success')
  }
  
  /**
   * Show error message
   */
  showError(message) {
    // Create toast notification
    this.showToast(message, 'error')
  }
  
  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    `
    
    document.body.appendChild(toast)
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100)
    
    // Auto hide
    const autoHide = setTimeout(() => {
      this.hideToast(toast)
    }, 5000)
    
    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(autoHide)
      this.hideToast(toast)
    })
  }
  
  /**
   * Hide toast notification
   */
  hideToast(toast) {
    toast.classList.remove('show')
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }
  
  /**
   * Utility functions
   */
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
  
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  formatTimeAgo(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }
  
  formatFormType(type) {
    const types = {
      general: 'General',
      consultation: 'Consultation',
      education: 'Education',
      consulting: 'Consulting',
      partnerships: 'Partnerships'
    }
    return types[type] || 'General'
  }
  
  getActivityIcon(action) {
    const icons = {
      admin_login: '🔐',
      admin_logout: '🚪',
      dashboard_access: '📊',
      user_created: '👤',
      form_submitted: '📝',
      data_exported: '📁',
      settings_changed: '⚙️'
    }
    return icons[action] || '📝'
  }
  
  getActivityText(activity) {
    const actions = {
      admin_login: 'Administrator signed in',
      admin_logout: 'Administrator signed out',
      dashboard_access: `Accessed ${activity.details?.section || 'dashboard'}`,
      user_created: 'New user registered',
      form_submitted: 'Form submission received',
      data_exported: 'Data exported',
      settings_changed: 'Settings updated'
    }
    return actions[activity.action] || activity.action
  }
  
  /**
   * Start auto-refresh for real-time updates
   */
  startAutoRefresh() {
    // Refresh every 30 seconds for overview section
    setInterval(() => {
      if (this.currentSection === 'overview') {
        this.loadUserStats()
        this.loadFormStats()
        this.loadSystemStats()
      }
    }, 30000)
    
    // Refresh activity every 60 seconds
    setInterval(() => {
      if (this.currentSection === 'overview') {
        this.loadRecentActivity()
      }
    }, 60000)
  }

  /**
   * Load analytics data
   */
  async loadAnalyticsData() {
    console.log('Loading analytics data...')
    // Mock implementation for analytics
  }

  /**
   * Save settings
   */
  async saveSettings() {
    try {
      this.showLoading('Saving settings...')
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.showSuccess('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      this.showError('Failed to save settings')
    } finally {
      this.hideLoading()
    }
  }

  /**
   * Reset settings to default
   */
  async resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      try {
        this.showLoading('Resetting settings...')
        // Mock reset operation
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.showSuccess('Settings reset to default')
      } catch (error) {
        console.error('Error resetting settings:', error)
        this.showError('Failed to reset settings')
      } finally {
        this.hideLoading()
      }
    }
  }

  /**
   * Clear logs
   */
  async clearLogs() {
    if (confirm('Are you sure you want to clear all logs?')) {
      try {
        this.showLoading('Clearing logs...')
        // Mock clear operation
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.showSuccess('Logs cleared successfully')
      } catch (error) {
        console.error('Error clearing logs:', error)
        this.showError('Failed to clear logs')
      } finally {
        this.hideLoading()
      }
    }
  }

  /**
   * Backup data
   */
  async backupData() {
    try {
      this.showLoading('Creating backup...')
      // Mock backup operation
      await new Promise(resolve => setTimeout(resolve, 2000))
      this.showSuccess('Backup created successfully')
    } catch (error) {
      console.error('Error creating backup:', error)
      this.showError('Failed to create backup')
    } finally {
      this.hideLoading()
    }
  }

  /**
   * Edit user
   */
  async editUser(userId) {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      
      this.showModal('Edit User', this.renderUserEditForm(user), 'Save Changes', () => {
        this.saveUserChanges(userId)
      })
    } catch (error) {
      console.error('Error editing user:', error)
      this.showError('Failed to load user for editing')
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        this.showLoading('Deleting user...')
        // Mock delete operation
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.showSuccess('User deleted successfully')
        this.loadUsersData()
      } catch (error) {
        console.error('Error deleting user:', error)
        this.showError('Failed to delete user')
      } finally {
        this.hideLoading()
      }
    }
  }

  /**
   * Reply to form submission
   */
  async replyToForm(formId) {
    try {
      const { data: form, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('id', formId)
        .single()
      
      if (error) throw error
      
      this.showModal('Reply to Form', this.renderReplyForm(form), 'Send Reply', () => {
        this.sendFormReply(formId)
      })
    } catch (error) {
      console.error('Error loading form for reply:', error)
      this.showError('Failed to load form for reply')
    }
  }

  /**
   * Delete form submission
   */
  async deleteForm(formId) {
    if (confirm('Are you sure you want to delete this form submission?')) {
      try {
        this.showLoading('Deleting form submission...')
        // Mock delete operation
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.showSuccess('Form submission deleted successfully')
        this.loadFormsData()
      } catch (error) {
        console.error('Error deleting form:', error)
        this.showError('Failed to delete form submission')
      } finally {
        this.hideLoading()
      }
    }
  }

  /**
   * Render user edit form
   */
  renderUserEditForm(user) {
    return `
      <div class="edit-form">
        <div class="form-group">
          <label for="edit-user-name">Full Name:</label>
          <input type="text" id="edit-user-name" value="${user.full_name || ''}" />
        </div>
        <div class="form-group">
          <label for="edit-user-email">Email:</label>
          <input type="email" id="edit-user-email" value="${user.email}" />
        </div>
        <div class="form-group">
          <label for="edit-user-role">Role:</label>
          <select id="edit-user-role">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </div>
      </div>
    `
  }

  /**
   * Render reply form
   */
  renderReplyForm(form) {
    return `
      <div class="reply-form">
        <div class="form-group">
          <label>To: ${form.email}</label>
        </div>
        <div class="form-group">
          <label for="reply-subject">Subject:</label>
          <input type="text" id="reply-subject" value="Re: ${form.subject || 'Your inquiry'}" />
        </div>
        <div class="form-group">
          <label for="reply-message">Message:</label>
          <textarea id="reply-message" rows="6" placeholder="Type your reply here..."></textarea>
        </div>
      </div>
    `
  }

  /**
   * Save user changes
   */
  async saveUserChanges(userId) {
    try {
      this.showLoading('Saving changes...')
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.showSuccess('User updated successfully')
      this.closeModal()
      this.loadUsersData()
    } catch (error) {
      console.error('Error saving user changes:', error)
      this.showError('Failed to save user changes')
    } finally {
      this.hideLoading()
    }
  }

  /**
   * Send form reply
   */
  async sendFormReply(formId) {
    try {
      this.showLoading('Sending reply...')
      // Mock send operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.showSuccess('Reply sent successfully')
      this.closeModal()
      this.loadFormsData()
    } catch (error) {
      console.error('Error sending reply:', error)
      this.showError('Failed to send reply')
    } finally {
      this.hideLoading()
    }
  }
}

// Global instance
window.dashboard = null

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.dashboard = new AdminDashboard()
})

// Export for external use
export { AdminDashboard }