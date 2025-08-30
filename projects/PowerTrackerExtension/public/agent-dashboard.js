/**
 * Agent Dashboard Component - Interactive interface for the Energy Agent
 * Provides real-time insights, controls, and performance metrics
 */
class AgentDashboard {
  constructor(containerId, energyAgent) {
    this.containerId = containerId;
    this.energyAgent = energyAgent;
    this.container = null;
    this.updateInterval = null;
    this.charts = new Map();
    this.isVisible = false;
    this.refreshRate = 5000; // 5 seconds
    this.initializeComponent();
  }

  initializeComponent() {
    this.createDashboardStructure();
    this.setupEventListeners();
    this.startRealTimeUpdates();
  }

  createDashboardStructure() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`[AgentDashboard] Container ${this.containerId} not found`);
      return;
    }

    this.container = container;
    this.container.innerHTML = this.generateDashboardHTML();
    this.initializeCharts();
    this.applyStyles();
  }

  generateDashboardHTML() {
    return `
      <div class="energy-agent-dashboard">
        <!-- Header Section -->
        <div class="dashboard-header">
          <div class="agent-status">
            <div class="status-indicator" id="agentStatusIndicator">
              <div class="status-dot"></div>
              <span id="agentStatusText">Initializing...</span>
            </div>
            <div class="agent-actions">
              <button id="pauseAgentBtn" class="action-btn">
                <span class="btn-icon">⏸️</span> Pause Agent
              </button>
              <button id="settingsBtn" class="action-btn">
                <span class="btn-icon">⚙️</span> Settings
              </button>
            </div>
          </div>
          <div class="dashboard-controls">
            <select id="dashboardView" class="view-selector">
              <option value="overview">Overview</option>
              <option value="patterns">Pattern Analysis</option>
              <option value="optimizations">Optimizations</option>
              <option value="learning">Learning Insights</option>
            </select>
            <button id="refreshBtn" class="refresh-btn">
              <span class="btn-icon">🔄</span>
            </button>
          </div>
        </div>

        <!-- Main Dashboard Content -->
        <div class="dashboard-content">
          <!-- Overview Tab -->
          <div id="overviewTab" class="dashboard-tab active">
            <div class="dashboard-grid">
              <!-- Real-time Metrics -->
              <div class="metric-cards">
                <div class="metric-card energy-card">
                  <div class="metric-header">
                    <h3>Energy Status</h3>
                    <span class="metric-icon">⚡</span>
                  </div>
                  <div class="metric-value">
                    <span id="currentEnergyUsage">--</span>
                    <span class="metric-unit">W</span>
                  </div>
                  <div class="metric-trend">
                    <span id="energyTrend" class="trend-indicator">--</span>
                    <span id="energyChange">--</span>
                  </div>
                </div>

                <div class="metric-card savings-card">
                  <div class="metric-header">
                    <h3>Energy Saved</h3>
                    <span class="metric-icon">💾</span>
                  </div>
                  <div class="metric-value">
                    <span id="totalEnergySaved">--</span>
                    <span class="metric-unit">W</span>
                  </div>
                  <div class="metric-trend">
                    <span id="savingsTrend" class="trend-indicator">--</span>
                    <span id="todaySavings">Today: --W</span>
                  </div>
                </div>

                <div class="metric-card efficiency-card">
                  <div class="metric-header">
                    <h3>Efficiency</h3>
                    <span class="metric-icon">📈</span>
                  </div>
                  <div class="metric-value">
                    <span id="currentEfficiency">--</span>
                    <span class="metric-unit">%</span>
                  </div>
                  <div class="metric-trend">
                    <span id="efficiencyTrend" class="trend-indicator">--</span>
                    <span id="efficiencyChange">--</span>
                  </div>
                </div>

                <div class="metric-card agent-card">
                  <div class="metric-header">
                    <h3>Agent Activity</h3>
                    <span class="metric-icon">🤖</span>
                  </div>
                  <div class="metric-value">
                    <span id="agentConfidence">--</span>
                    <span class="metric-unit">%</span>
                  </div>
                  <div class="metric-trend">
                    <span id="confidenceTrend" class="trend-indicator">--</span>
                    <span id="lastAction">--</span>
                  </div>
                </div>
              </div>

              <!-- Charts Section -->
              <div class="charts-section">
                <div class="chart-container">
                  <h4>Energy Consumption (24h)</h4>
                  <canvas id="energyChart" width="400" height="200"></canvas>
                </div>
                <div class="chart-container">
                  <h4>Optimization Impact</h4>
                  <canvas id="optimizationChart" width="400" height="200"></canvas>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="quick-actions">
                <h4>Quick Actions</h4>
                <div class="action-buttons">
                  <button id="suspendTabsBtn" class="quick-action-btn">
                    <span class="btn-icon">💤</span>
                    Suspend Unused Tabs
                  </button>
                  <button id="optimizeVideoBtn" class="quick-action-btn">
                    <span class="btn-icon">🎥</span>
                    Optimize Videos
                  </button>
                  <button id="enableDarkModeBtn" class="quick-action-btn">
                    <span class="btn-icon">🌙</span>
                    Enable Dark Mode
                  </button>
                  <button id="blockResourcesBtn" class="quick-action-btn">
                    <span class="btn-icon">🛡️</span>
                    Block Heavy Resources
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Patterns Tab -->
          <div id="patternsTab" class="dashboard-tab">
            <div class="patterns-content">
              <h3>Pattern Analysis</h3>
              <div class="pattern-summary" id="patternSummary">
                <!-- Pattern analysis content will be populated here -->
              </div>
              <div class="detected-patterns" id="detectedPatterns">
                <!-- Detected patterns will be listed here -->
              </div>
            </div>
          </div>

          <!-- Optimizations Tab -->
          <div id="optimizationsTab" class="dashboard-tab">
            <div class="optimizations-content">
              <h3>Active Optimizations</h3>
              <div class="optimization-list" id="optimizationList">
                <!-- Active optimizations will be listed here -->
              </div>
              <div class="optimization-history">
                <h4>Recent Optimizations</h4>
                <div class="history-list" id="optimizationHistory">
                  <!-- Recent optimization history -->
                </div>
              </div>
            </div>
          </div>

          <!-- Learning Tab -->
          <div id="learningTab" class="dashboard-tab">
            <div class="learning-content">
              <h3>Learning Insights</h3>
              <div class="learning-metrics" id="learningMetrics">
                <!-- Learning system metrics -->
              </div>
              <div class="user-behavior-model" id="userBehaviorModel">
                <!-- User behavior insights -->
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations Panel -->
        <div class="recommendations-panel" id="recommendationsPanel">
          <h4>AI Recommendations</h4>
          <div class="recommendations-list" id="recommendationsList">
            <!-- Dynamic recommendations will be populated here -->
          </div>
        </div>

        <!-- Agent Settings Modal -->
        <div id="agentSettingsModal" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Energy Agent Settings</h3>
              <button class="close-btn" id="closeSettingsBtn">&times;</button>
            </div>
            <div class="modal-body">
              <div class="setting-group">
                <label>Optimization Aggressiveness</label>
                <input type="range" id="aggressivenessSlider" min="0" max="100" value="50">
                <span class="slider-value" id="aggressivenessValue">50%</span>
              </div>
              <div class="setting-group">
                <label>Update Frequency</label>
                <select id="updateFrequency">
                  <option value="1000">Very Fast (1s)</option>
                  <option value="5000" selected>Fast (5s)</option>
                  <option value="10000">Normal (10s)</option>
                  <option value="30000">Slow (30s)</option>
                </select>
              </div>
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="enableLearning" checked>
                  Enable Adaptive Learning
                </label>
              </div>
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="enableNotifications" checked>
                  Show Optimization Notifications
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button id="saveSettingsBtn" class="save-btn">Save Changes</button>
              <button id="cancelSettingsBtn" class="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  applyStyles() {
    const styles = `
      .energy-agent-dashboard {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--bg-color, #ffffff);
        color: var(--text-color, #333333);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .agent-status {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        backdrop-filter: blur(10px);
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #4ade80;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .agent-actions {
        display: flex;
        gap: 12px;
      }

      .action-btn, .refresh-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
      }

      .action-btn:hover, .refresh-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }

      .dashboard-controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .view-selector {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
      }

      .dashboard-content {
        padding: 24px;
      }

      .dashboard-tab {
        display: none;
      }

      .dashboard-tab.active {
        display: block;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 24px;
      }

      .metric-cards {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .metric-card {
        padding: 20px;
        background: var(--card-bg, #f8fafc);
        border-radius: 12px;
        border: 1px solid var(--border-color, #e2e8f0);
        transition: all 0.2s;
      }

      .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .metric-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
      }

      .metric-icon {
        font-size: 20px;
      }

      .metric-value {
        font-size: 32px;
        font-weight: 700;
        color: var(--text-primary, #1e293b);
        margin-bottom: 8px;
      }

      .metric-unit {
        font-size: 18px;
        color: var(--text-secondary, #64748b);
        margin-left: 4px;
      }

      .metric-trend {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--text-secondary, #64748b);
      }

      .trend-indicator {
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
      }

      .trend-up {
        background: #dcfce7;
        color: #166534;
      }

      .trend-down {
        background: #fee2e2;
        color: #991b1b;
      }

      .trend-stable {
        background: #fef3c7;
        color: #92400e;
      }

      .charts-section {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .chart-container {
        background: var(--card-bg, #f8fafc);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid var(--border-color, #e2e8f0);
      }

      .chart-container h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary, #1e293b);
      }

      .quick-actions {
        grid-column: 1 / -1;
        background: var(--card-bg, #f8fafc);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid var(--border-color, #e2e8f0);
      }

      .quick-actions h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary, #1e293b);
      }

      .action-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }

      .quick-action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: var(--primary-color, #3b82f6);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
      }

      .quick-action-btn:hover {
        background: var(--primary-hover, #2563eb);
        transform: translateY(-1px);
      }

      .recommendations-panel {
        background: var(--accent-bg, #f1f5f9);
        border-top: 1px solid var(--border-color, #e2e8f0);
        padding: 20px 24px;
      }

      .recommendations-panel h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary, #1e293b);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .recommendation-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: white;
        border-radius: 8px;
        margin-bottom: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .recommendation-text {
        flex: 1;
        margin-right: 12px;
      }

      .recommendation-title {
        font-weight: 600;
        color: var(--text-primary, #1e293b);
        margin-bottom: 4px;
      }

      .recommendation-description {
        font-size: 12px;
        color: var(--text-secondary, #64748b);
      }

      .recommendation-action {
        padding: 6px 12px;
        background: var(--primary-color, #3b82f6);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }

      .recommendation-action:hover {
        background: var(--primary-hover, #2563eb);
      }

      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
      }

      .modal-content {
        background-color: var(--bg-color, #ffffff);
        margin: 5% auto;
        padding: 0;
        border-radius: 12px;
        width: 500px;
        max-width: 90vw;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
      }

      .modal-header h3 {
        margin: 0;
        color: var(--text-primary, #1e293b);
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--text-secondary, #64748b);
      }

      .modal-body {
        padding: 24px;
      }

      .setting-group {
        margin-bottom: 20px;
      }

      .setting-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: var(--text-primary, #1e293b);
      }

      .setting-group input[type="range"] {
        width: 100%;
        margin-bottom: 8px;
      }

      .setting-group select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        background: var(--bg-color, #ffffff);
        color: var(--text-primary, #1e293b);
      }

      .slider-value {
        font-size: 12px;
        color: var(--text-secondary, #64748b);
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 24px;
        border-top: 1px solid var(--border-color, #e2e8f0);
      }

      .save-btn, .cancel-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }

      .save-btn {
        background: var(--primary-color, #3b82f6);
        color: white;
      }

      .save-btn:hover {
        background: var(--primary-hover, #2563eb);
      }

      .cancel-btn {
        background: var(--secondary-bg, #f1f5f9);
        color: var(--text-primary, #1e293b);
      }

      .cancel-btn:hover {
        background: var(--secondary-hover, #e2e8f0);
      }

      /* Dark mode styles */
      [data-theme="dark"] .energy-agent-dashboard {
        --bg-color: #1e293b;
        --text-color: #f1f5f9;
        --text-primary: #f8fafc;
        --text-secondary: #94a3b8;
        --card-bg: #334155;
        --border-color: #475569;
        --accent-bg: #0f172a;
        --primary-color: #3b82f6;
        --primary-hover: #2563eb;
        --secondary-bg: #475569;
        --secondary-hover: #64748b;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }

        .metric-cards {
          grid-template-columns: 1fr;
        }

        .charts-section {
          grid-template-columns: 1fr;
        }

        .action-buttons {
          grid-template-columns: 1fr;
        }

        .dashboard-header {
          flex-direction: column;
          gap: 16px;
          text-align: center;
        }

        .agent-status {
          flex-direction: column;
          gap: 12px;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  setupEventListeners() {
    // Tab switching
    const viewSelector = document.getElementById('dashboardView');
    if (viewSelector) {
      viewSelector.addEventListener('change', (e) => {
        this.switchTab(e.target.value);
      });
    }

    // Agent control buttons
    const pauseBtn = document.getElementById('pauseAgentBtn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.toggleAgent());
    }

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.forceRefresh());
    }

    // Quick action buttons
    document.getElementById('suspendTabsBtn')?.addEventListener('click', () => 
      this.executeQuickAction('intelligentTabSuspension'));
    document.getElementById('optimizeVideoBtn')?.addEventListener('click', () => 
      this.executeQuickAction('dynamicVideoOptimization'));
    document.getElementById('enableDarkModeBtn')?.addEventListener('click', () => 
      this.executeQuickAction('contextualDarkMode'));
    document.getElementById('blockResourcesBtn')?.addEventListener('click', () => 
      this.executeQuickAction('resourcePreemption'));

    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('agentSettingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');

    settingsBtn?.addEventListener('click', () => {
      settingsModal.style.display = 'block';
      this.loadSettings();
    });

    closeSettingsBtn?.addEventListener('click', () => {
      settingsModal.style.display = 'none';
    });

    cancelSettingsBtn?.addEventListener('click', () => {
      settingsModal.style.display = 'none';
    });

    saveSettingsBtn?.addEventListener('click', () => {
      this.saveSettings();
      settingsModal.style.display = 'none';
    });

    // Settings controls
    const aggressivenessSlider = document.getElementById('aggressivenessSlider');
    const aggressivenessValue = document.getElementById('aggressivenessValue');
    
    aggressivenessSlider?.addEventListener('input', (e) => {
      aggressivenessValue.textContent = `${e.target.value}%`;
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
      }
    });
  }

  switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.dashboard-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}Tab`);
    if (selectedTab) {
      selectedTab.classList.add('active');
      this.loadTabContent(tabName);
    }
  }

  async loadTabContent(tabName) {
    switch (tabName) {
      case 'overview':
        await this.updateOverviewMetrics();
        break;
      case 'patterns':
        await this.updatePatternAnalysis();
        break;
      case 'optimizations':
        await this.updateOptimizationStatus();
        break;
      case 'learning':
        await this.updateLearningInsights();
        break;
    }
  }

  async updateOverviewMetrics() {
    try {
      const metrics = await this.energyAgent?.getMetrics() || this.getMockMetrics();
      
      // Update energy metrics
      document.getElementById('currentEnergyUsage').textContent = metrics.currentUsage.toFixed(1);
      document.getElementById('energyTrend').textContent = metrics.energyTrend.direction;
      document.getElementById('energyTrend').className = `trend-indicator trend-${metrics.energyTrend.direction}`;
      document.getElementById('energyChange').textContent = `${metrics.energyTrend.change}% from last hour`;

      // Update savings metrics
      document.getElementById('totalEnergySaved').textContent = metrics.totalSaved.toFixed(1);
      document.getElementById('savingsTrend').textContent = metrics.savingsTrend.direction;
      document.getElementById('savingsTrend').className = `trend-indicator trend-${metrics.savingsTrend.direction}`;
      document.getElementById('todaySavings').textContent = `Today: ${metrics.todaySavings.toFixed(1)}W`;

      // Update efficiency metrics
      document.getElementById('currentEfficiency').textContent = (metrics.efficiency * 100).toFixed(0);
      document.getElementById('efficiencyTrend').textContent = metrics.efficiencyTrend.direction;
      document.getElementById('efficiencyTrend').className = `trend-indicator trend-${metrics.efficiencyTrend.direction}`;
      document.getElementById('efficiencyChange').textContent = `${metrics.efficiencyTrend.change}% improvement`;

      // Update agent metrics
      document.getElementById('agentConfidence').textContent = (metrics.confidence * 100).toFixed(0);
      document.getElementById('confidenceTrend').textContent = metrics.confidenceTrend.direction;
      document.getElementById('confidenceTrend').className = `trend-indicator trend-${metrics.confidenceTrend.direction}`;
      document.getElementById('lastAction').textContent = metrics.lastAction || 'No recent actions';

      // Update agent status
      this.updateAgentStatus(metrics.agentStatus);

    } catch (error) {
      console.error('[AgentDashboard] Failed to update overview metrics:', error);
    }
  }

  getMockMetrics() {
    return {
      currentUsage: 15.4 + Math.random() * 5,
      energyTrend: {
        direction: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
        change: (Math.random() * 20 - 10).toFixed(1)
      },
      totalSaved: 127.8 + Math.random() * 20,
      savingsTrend: {
        direction: 'up',
        change: (Math.random() * 10 + 5).toFixed(1)
      },
      todaySavings: 23.4 + Math.random() * 10,
      efficiency: 0.78 + Math.random() * 0.15,
      efficiencyTrend: {
        direction: 'up',
        change: (Math.random() * 5 + 2).toFixed(1)
      },
      confidence: 0.85 + Math.random() * 0.1,
      confidenceTrend: {
        direction: 'stable',
        change: '0.2'
      },
      lastAction: 'Tab suspension',
      agentStatus: 'active'
    };
  }

  updateAgentStatus(status) {
    const statusText = document.getElementById('agentStatusText');
    const statusDot = document.querySelector('.status-dot');
    
    switch (status) {
      case 'active':
        statusText.textContent = 'Active & Learning';
        statusDot.style.background = '#4ade80';
        break;
      case 'paused':
        statusText.textContent = 'Paused';
        statusDot.style.background = '#fbbf24';
        break;
      case 'error':
        statusText.textContent = 'Error';
        statusDot.style.background = '#ef4444';
        break;
      default:
        statusText.textContent = 'Initializing...';
        statusDot.style.background = '#94a3b8';
    }
  }

  async updatePatternAnalysis() {
    try {
      const patterns = await this.energyAgent?.getPatternAnalysis() || this.getMockPatterns();
      
      const summaryContainer = document.getElementById('patternSummary');
      const patternsContainer = document.getElementById('detectedPatterns');
      
      // Update summary
      summaryContainer.innerHTML = `
        <div class="pattern-summary-stats">
          <div class="pattern-stat">
            <span class="stat-value">${patterns.totalPatterns}</span>
            <span class="stat-label">Detected Patterns</span>
          </div>
          <div class="pattern-stat">
            <span class="stat-value">${patterns.highConfidencePatterns}</span>
            <span class="stat-label">High Confidence</span>
          </div>
          <div class="pattern-stat">
            <span class="stat-value">${patterns.actionablePatterns}</span>
            <span class="stat-label">Actionable</span>
          </div>
        </div>
      `;

      // Update patterns list
      patternsContainer.innerHTML = patterns.patterns.map(pattern => `
        <div class="pattern-item">
          <div class="pattern-header">
            <span class="pattern-type">${pattern.type}</span>
            <span class="pattern-confidence">${(pattern.confidence * 100).toFixed(0)}%</span>
          </div>
          <div class="pattern-description">${pattern.description}</div>
          <div class="pattern-details">
            <span class="pattern-impact">Impact: ${pattern.impact}</span>
            <span class="pattern-actionability">Actionability: ${pattern.actionability}</span>
          </div>
        </div>
      `).join('');

    } catch (error) {
      console.error('[AgentDashboard] Failed to update pattern analysis:', error);
    }
  }

  getMockPatterns() {
    return {
      totalPatterns: 12,
      highConfidencePatterns: 8,
      actionablePatterns: 5,
      patterns: [
        {
          type: 'Temporal',
          description: 'High energy usage between 2-4 PM daily',
          confidence: 0.92,
          impact: 'high',
          actionability: 'immediate'
        },
        {
          type: 'Behavioral',
          description: 'Video streaming during lunch hours',
          confidence: 0.87,
          impact: 'medium',
          actionability: 'short_term'
        },
        {
          type: 'Energy',
          description: 'Tab suspension saves 15W on average',
          confidence: 0.95,
          impact: 'high',
          actionability: 'immediate'
        }
      ]
    };
  }

  async updateOptimizationStatus() {
    try {
      const optimizations = await this.energyAgent?.getOptimizationStatus() || this.getMockOptimizations();
      
      const activeContainer = document.getElementById('optimizationList');
      const historyContainer = document.getElementById('optimizationHistory');
      
      // Update active optimizations
      activeContainer.innerHTML = optimizations.active.map(opt => `
        <div class="optimization-item active">
          <div class="opt-header">
            <span class="opt-name">${opt.name}</span>
            <span class="opt-status active">Active</span>
          </div>
          <div class="opt-description">${opt.description}</div>
          <div class="opt-metrics">
            <span>Energy Saved: ${opt.energySaved}W</span>
            <span>Duration: ${opt.duration}</span>
          </div>
        </div>
      `).join('');

      // Update history
      historyContainer.innerHTML = optimizations.history.map(opt => `
        <div class="optimization-item history">
          <div class="opt-header">
            <span class="opt-name">${opt.name}</span>
            <span class="opt-status ${opt.success ? 'success' : 'failed'}">${opt.success ? 'Success' : 'Failed'}</span>
          </div>
          <div class="opt-description">${opt.description}</div>
          <div class="opt-metrics">
            <span>Energy Saved: ${opt.energySaved || 0}W</span>
            <span>Time: ${new Date(opt.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      `).join('');

    } catch (error) {
      console.error('[AgentDashboard] Failed to update optimization status:', error);
    }
  }

  getMockOptimizations() {
    return {
      active: [
        {
          name: 'Tab Suspension',
          description: 'Suspending 3 inactive tabs',
          energySaved: 12.4,
          duration: '5m 23s'
        },
        {
          name: 'Video Optimization',
          description: 'Reduced video quality to 720p',
          energySaved: 8.7,
          duration: '2m 15s'
        }
      ],
      history: [
        {
          name: 'Dark Mode Activation',
          description: 'Enabled dark mode for energy-heavy sites',
          energySaved: 5.2,
          success: true,
          timestamp: Date.now() - 300000
        },
        {
          name: 'Resource Blocking',
          description: 'Blocked ads and tracking scripts',
          energySaved: 7.8,
          success: true,
          timestamp: Date.now() - 600000
        }
      ]
    };
  }

  async updateLearningInsights() {
    try {
      const insights = await this.energyAgent?.getLearningInsights() || this.getMockLearningInsights();
      
      const metricsContainer = document.getElementById('learningMetrics');
      const behaviorContainer = document.getElementById('userBehaviorModel');
      
      // Update learning metrics
      metricsContainer.innerHTML = `
        <div class="learning-stats">
          <div class="learning-stat">
            <span class="stat-label">Model Confidence</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${insights.modelConfidence * 100}%"></div>
            </div>
            <span class="stat-value">${(insights.modelConfidence * 100).toFixed(0)}%</span>
          </div>
          <div class="learning-stat">
            <span class="stat-label">Learning Velocity</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${insights.learningVelocity * 100}%"></div>
            </div>
            <span class="stat-value">${(insights.learningVelocity * 100).toFixed(0)}%</span>
          </div>
          <div class="learning-stat">
            <span class="stat-label">Adaptation Success</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${insights.adaptationSuccess * 100}%"></div>
            </div>
            <span class="stat-value">${(insights.adaptationSuccess * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div class="learning-details">
          <p><strong>Total Experiences:</strong> ${insights.totalExperiences}</p>
          <p><strong>Learning Trend:</strong> ${insights.learningTrend}</p>
          <p><strong>Exploration Rate:</strong> ${(insights.explorationRate * 100).toFixed(1)}%</p>
        </div>
      `;

      // Update behavior model
      behaviorContainer.innerHTML = `
        <h4>User Behavior Insights</h4>
        <div class="behavior-patterns">
          ${insights.behaviorPatterns.map(pattern => `
            <div class="behavior-pattern">
              <span class="pattern-name">${pattern.name}</span>
              <span class="pattern-frequency">${(pattern.frequency * 100).toFixed(0)}% frequency</span>
            </div>
          `).join('')}
        </div>
      `;

    } catch (error) {
      console.error('[AgentDashboard] Failed to update learning insights:', error);
    }
  }

  getMockLearningInsights() {
    return {
      modelConfidence: 0.78,
      learningVelocity: 0.65,
      adaptationSuccess: 0.82,
      totalExperiences: 247,
      learningTrend: 'improving',
      explorationRate: 0.15,
      behaviorPatterns: [
        { name: 'Morning productivity sessions', frequency: 0.85 },
        { name: 'Afternoon video consumption', frequency: 0.72 },
        { name: 'Evening social media browsing', frequency: 0.68 }
      ]
    };
  }

  async updateRecommendations() {
    try {
      const recommendations = await this.energyAgent?.getRecommendations() || this.getMockRecommendations();
      
      const container = document.getElementById('recommendationsList');
      if (!container) return;

      container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
          <div class="recommendation-text">
            <div class="recommendation-title">${rec.title}</div>
            <div class="recommendation-description">${rec.description}</div>
          </div>
          <button class="recommendation-action" data-action="${rec.action}">
            ${rec.actionText}
          </button>
        </div>
      `).join('');

      // Add click listeners to recommendation actions
      container.querySelectorAll('.recommendation-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.target.dataset.action;
          this.executeRecommendation(action);
        });
      });

    } catch (error) {
      console.error('[AgentDashboard] Failed to update recommendations:', error);
    }
  }

  getMockRecommendations() {
    return [
      {
        title: 'Optimize Video Quality',
        description: 'Reduce video quality during battery saving mode',
        action: 'optimizeVideo',
        actionText: 'Apply'
      },
      {
        title: 'Schedule Tab Suspension',
        description: 'Automatically suspend tabs after 10 minutes of inactivity',
        action: 'scheduleTabSuspension',
        actionText: 'Enable'
      },
      {
        title: 'Enable Smart Dark Mode',
        description: 'Automatically enable dark mode on energy-heavy websites',
        action: 'enableSmartDarkMode',
        actionText: 'Activate'
      }
    ];
  }

  async executeQuickAction(actionType) {
    try {
      console.log(`[AgentDashboard] Executing quick action: ${actionType}`);
      
      if (this.energyAgent && this.energyAgent.executeAction) {
        const result = await this.energyAgent.executeAction(actionType);
        this.showNotification(`Action executed: ${actionType}`, result.success ? 'success' : 'error');
      } else {
        // Mock execution
        this.showNotification(`Mock execution: ${actionType}`, 'success');
      }
      
      // Refresh metrics after action
      setTimeout(() => this.updateOverviewMetrics(), 1000);
      
    } catch (error) {
      console.error('[AgentDashboard] Quick action failed:', error);
      this.showNotification(`Failed to execute: ${actionType}`, 'error');
    }
  }

  async executeRecommendation(action) {
    try {
      console.log(`[AgentDashboard] Executing recommendation: ${action}`);
      
      // Mock recommendation execution
      this.showNotification(`Applied recommendation: ${action}`, 'success');
      
      // Refresh recommendations
      setTimeout(() => this.updateRecommendations(), 1000);
      
    } catch (error) {
      console.error('[AgentDashboard] Recommendation execution failed:', error);
      this.showNotification(`Failed to apply recommendation: ${action}`, 'error');
    }
  }

  toggleAgent() {
    const pauseBtn = document.getElementById('pauseAgentBtn');
    const icon = pauseBtn.querySelector('.btn-icon');
    
    if (pauseBtn.textContent.includes('Pause')) {
      pauseBtn.innerHTML = '<span class="btn-icon">▶️</span> Resume Agent';
      this.updateAgentStatus('paused');
      this.showNotification('Energy Agent paused', 'info');
    } else {
      pauseBtn.innerHTML = '<span class="btn-icon">⏸️</span> Pause Agent';
      this.updateAgentStatus('active');
      this.showNotification('Energy Agent resumed', 'success');
    }
  }

  forceRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    const icon = refreshBtn.querySelector('.btn-icon');
    
    // Add spinning animation
    icon.style.animation = 'spin 1s linear infinite';
    
    // Update all tabs
    this.updateOverviewMetrics();
    this.updateRecommendations();
    
    // Remove animation after refresh
    setTimeout(() => {
      icon.style.animation = '';
      this.showNotification('Dashboard refreshed', 'success');
    }, 1000);
  }

  loadSettings() {
    // Load current settings from storage or defaults
    const settings = this.getStoredSettings();
    
    document.getElementById('aggressivenessSlider').value = settings.aggressiveness;
    document.getElementById('aggressivenessValue').textContent = `${settings.aggressiveness}%`;
    document.getElementById('updateFrequency').value = settings.updateFrequency;
    document.getElementById('enableLearning').checked = settings.enableLearning;
    document.getElementById('enableNotifications').checked = settings.enableNotifications;
  }

  saveSettings() {
    const settings = {
      aggressiveness: document.getElementById('aggressivenessSlider').value,
      updateFrequency: document.getElementById('updateFrequency').value,
      enableLearning: document.getElementById('enableLearning').checked,
      enableNotifications: document.getElementById('enableNotifications').checked
    };
    
    // Save to storage
    this.storeSettings(settings);
    
    // Apply settings
    this.applySettings(settings);
    
    this.showNotification('Settings saved', 'success');
  }

  getStoredSettings() {
    return {
      aggressiveness: 50,
      updateFrequency: 5000,
      enableLearning: true,
      enableNotifications: true
    };
  }

  storeSettings(settings) {
    try {
      localStorage.setItem('energyAgentSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('[AgentDashboard] Failed to store settings:', error);
    }
  }

  applySettings(settings) {
    // Update refresh rate
    this.refreshRate = parseInt(settings.updateFrequency);
    this.restartRealTimeUpdates();
    
    // Pass settings to energy agent
    if (this.energyAgent && this.energyAgent.updateSettings) {
      this.energyAgent.updateSettings(settings);
    }
  }

  startRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(() => {
      if (this.isVisible) {
        this.updateOverviewMetrics();
        this.updateRecommendations();
      }
    }, this.refreshRate);
  }

  restartRealTimeUpdates() {
    this.startRealTimeUpdates();
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  }

  initializeCharts() {
    // Initialize energy consumption chart
    this.initializeEnergyChart();
    
    // Initialize optimization impact chart
    this.initializeOptimizationChart();
  }

  initializeEnergyChart() {
    const canvas = document.getElementById('energyChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chart = new SimpleLineChart(ctx, {
      data: this.generateMockEnergyData(),
      color: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    });

    this.charts.set('energy', chart);
  }

  initializeOptimizationChart() {
    const canvas = document.getElementById('optimizationChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chart = new SimpleBarChart(ctx, {
      data: this.generateMockOptimizationData(),
      color: '#10b981'
    });

    this.charts.set('optimization', chart);
  }

  generateMockEnergyData() {
    const data = [];
    const now = Date.now();
    
    for (let i = 23; i >= 0; i--) {
      data.push({
        timestamp: now - (i * 3600000),
        value: 10 + Math.random() * 15 + Math.sin(i / 4) * 5
      });
    }
    
    return data;
  }

  generateMockOptimizationData() {
    return [
      { label: 'Tab Suspension', value: 45 },
      { label: 'Video Optimization', value: 32 },
      { label: 'Dark Mode', value: 18 },
      { label: 'Resource Blocking', value: 28 },
      { label: 'Memory Cleanup', value: 15 }
    ];
  }

  show() {
    this.isVisible = true;
    if (this.container) {
      this.container.style.display = 'block';
      this.updateOverviewMetrics();
      this.updateRecommendations();
    }
  }

  hide() {
    this.isVisible = false;
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.charts.clear();
  }
}

/**
 * Simple Line Chart for energy consumption visualization
 */
class SimpleLineChart {
  constructor(ctx, options) {
    this.ctx = ctx;
    this.options = options;
    this.draw();
  }

  draw() {
    const { data, color, backgroundColor } = this.options;
    const canvas = this.ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    if (!data || data.length === 0) return;
    
    // Calculate bounds
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    
    // Draw background area
    this.ctx.fillStyle = backgroundColor || 'rgba(59, 130, 246, 0.1)';
    this.ctx.beginPath();
    this.ctx.moveTo(0, height);
    
    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.value - minValue) / range) * height;
      
      if (index === 0) {
        this.ctx.lineTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    
    this.ctx.lineTo(width, height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw line
    this.ctx.strokeStyle = color || '#3b82f6';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.value - minValue) / range) * height;
      
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    
    this.ctx.stroke();
    
    // Draw points
    this.ctx.fillStyle = color || '#3b82f6';
    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.value - minValue) / range) * height;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
      this.ctx.fill();
    });
  }
}

/**
 * Simple Bar Chart for optimization impact visualization
 */
class SimpleBarChart {
  constructor(ctx, options) {
    this.ctx = ctx;
    this.options = options;
    this.draw();
  }

  draw() {
    const { data, color } = this.options;
    const canvas = this.ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    if (!data || data.length === 0) return;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = width / data.length * 0.8;
    const barSpacing = width / data.length * 0.2;
    
    this.ctx.fillStyle = color || '#10b981';
    
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * height * 0.8;
      const x = index * (barWidth + barSpacing) + barSpacing / 2;
      const y = height - barHeight;
      
      this.ctx.fillRect(x, y, barWidth, barHeight);
    });
  }
}

// Add notification styles
const notificationStyles = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideInRight 0.3s ease;
    max-width: 400px;
  }

  .notification-success {
    background: #10b981;
  }

  .notification-error {
    background: #ef4444;
  }

  .notification-info {
    background: #3b82f6;
  }

  .notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    margin-left: auto;
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .pattern-summary-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .pattern-stat {
    text-align: center;
    padding: 16px;
    background: var(--card-bg, #f8fafc);
    border-radius: 8px;
    border: 1px solid var(--border-color, #e2e8f0);
  }

  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-color, #3b82f6);
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary, #64748b);
    font-weight: 500;
  }

  .pattern-item, .optimization-item {
    padding: 16px;
    background: var(--card-bg, #f8fafc);
    border-radius: 8px;
    border: 1px solid var(--border-color, #e2e8f0);
    margin-bottom: 12px;
  }

  .pattern-header, .opt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .pattern-type, .opt-name {
    font-weight: 600;
    color: var(--text-primary, #1e293b);
  }

  .pattern-confidence, .opt-status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }

  .pattern-confidence {
    background: var(--primary-color, #3b82f6);
    color: white;
  }

  .opt-status.active {
    background: #10b981;
    color: white;
  }

  .opt-status.success {
    background: #10b981;
    color: white;
  }

  .opt-status.failed {
    background: #ef4444;
    color: white;
  }

  .pattern-description, .opt-description {
    color: var(--text-primary, #1e293b);
    margin-bottom: 8px;
  }

  .pattern-details, .opt-metrics {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: var(--text-secondary, #64748b);
  }

  .learning-stats {
    margin-bottom: 20px;
  }

  .learning-stat {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .stat-label {
    flex: 0 0 120px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary, #1e293b);
  }

  .stat-bar {
    flex: 1;
    height: 6px;
    background: var(--border-color, #e2e8f0);
    border-radius: 3px;
    overflow: hidden;
  }

  .stat-fill {
    height: 100%;
    background: var(--primary-color, #3b82f6);
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  .stat-value {
    flex: 0 0 40px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary, #1e293b);
    text-align: right;
  }

  .learning-details p {
    margin: 8px 0;
    font-size: 14px;
    color: var(--text-primary, #1e293b);
  }

  .behavior-patterns {
    margin-top: 16px;
  }

  .behavior-pattern {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--accent-bg, #f1f5f9);
    border-radius: 6px;
    margin-bottom: 8px;
  }

  .pattern-name {
    font-weight: 500;
    color: var(--text-primary, #1e293b);
  }

  .pattern-frequency {
    font-size: 12px;
    color: var(--text-secondary, #64748b);
  }
`;

// Append notification styles to head
const notificationStyleSheet = document.createElement('style');
notificationStyleSheet.textContent = notificationStyles;
document.head.appendChild(notificationStyleSheet);