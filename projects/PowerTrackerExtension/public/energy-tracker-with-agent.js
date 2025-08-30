/**
 * EnergyTrackerWithAgent - Enhanced Power Tracker with integrated AI Agent
 * Extends the base EnergyTracker to include intelligent energy optimization
 */
class EnergyTrackerWithAgent extends EnergyTracker {
  constructor() {
    super();
    
    // Initialize Energy Agent System components
    this.energyAgent = null;
    this.optimizationController = null;
    this.advancedLearningSystem = null;
    this.patternRecognitionSystem = null;
    this.agentDashboard = null;
    this.intelligentActions = null;
    
    // Agent state management
    this.agentEnabled = true;
    this.agentInitialized = false;
    this.optimizationQueue = [];
    this.lastOptimization = 0;
    this.agentMetrics = {
      totalOptimizations: 0,
      energySaved: 0,
      patternDetections: 0,
      userInteractions: 0,
      confidenceScore: 0.5
    };
    
    // Initialize agent system after base initialization
    this.initAgent();
  }

  async initAgent() {
    try {
      console.log('[EnergyTrackerWithAgent] Initializing Energy Agent system...');
      
      // Wait for base tracker to be ready
      await this.initPromise;
      
      // Load agent dependencies
      await this.loadAgentDependencies();
      
      // Initialize core agent components
      this.initializeAgentComponents();
      
      // Setup agent-specific listeners
      this.setupAgentListeners();
      
      // Start agent optimization cycle
      this.startOptimizationCycle();
      
      this.agentInitialized = true;
      console.log('[EnergyTrackerWithAgent] Energy Agent system initialized successfully');
      
      // Show welcome notification
      this.showAgentWelcomeNotification();
      
    } catch (error) {
      console.error('[EnergyTrackerWithAgent] Agent initialization failed:', error);
      this.agentEnabled = false;
    }
  }

  async loadAgentDependencies() {
    const dependencies = [
      'energy-agent-core.js',
      'rule-engine.js',
      'deterministic-predictor.js',
      'intelligent-actions.js',
      'optimization-controller.js',
      'advanced-learning-system.js',
      'pattern-recognition-system.js',
      'agent-dashboard.js'
    ];

    for (const dep of dependencies) {
      try {
        await this.importScript(dep);
        console.log(`[EnergyTrackerWithAgent] Loaded: ${dep}`);
      } catch (error) {
        console.warn(`[EnergyTrackerWithAgent] Failed to load ${dep}:`, error);
      }
    }
  }

  async importScript(filename) {
    return new Promise((resolve, reject) => {
      try {
        importScripts(filename);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  initializeAgentComponents() {
    try {
      // Initialize core components if classes are available
      if (typeof EnergyAgent !== 'undefined') {
        this.energyAgent = new EnergyAgent();
        console.log('[EnergyTrackerWithAgent] EnergyAgent initialized');
      }

      if (typeof OptimizationController !== 'undefined') {
        this.optimizationController = new OptimizationController();
        console.log('[EnergyTrackerWithAgent] OptimizationController initialized');
      }

      if (typeof AdvancedLearningSystem !== 'undefined') {
        this.advancedLearningSystem = new AdvancedLearningSystem();
        console.log('[EnergyTrackerWithAgent] AdvancedLearningSystem initialized');
      }

      if (typeof PatternRecognitionSystem !== 'undefined') {
        this.patternRecognitionSystem = new PatternRecognitionSystem();
        console.log('[EnergyTrackerWithAgent] PatternRecognitionSystem initialized');
      }

      if (typeof IntelligentActions !== 'undefined') {
        this.intelligentActions = new IntelligentActions();
        console.log('[EnergyTrackerWithAgent] IntelligentActions initialized');
      }

    } catch (error) {
      console.error('[EnergyTrackerWithAgent] Component initialization failed:', error);
    }
  }

  setupAgentListeners() {
    // Extend base listeners with agent-specific ones
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!this.agentEnabled || !this.agentInitialized) {
        return false; // Let base class handle non-agent messages
      }

      const handleAgentRequest = async () => {
        try {
          switch (message.type) {
            case 'GET_AGENT_STATUS': {
              return {
                success: true,
                status: {
                  enabled: this.agentEnabled,
                  initialized: this.agentInitialized,
                  metrics: this.agentMetrics,
                  lastOptimization: this.lastOptimization,
                  queueSize: this.optimizationQueue.length
                }
              };
            }

            case 'ENABLE_AGENT': {
              this.agentEnabled = true;
              await this.startOptimizationCycle();
              return { success: true, message: 'Agent enabled' };
            }

            case 'DISABLE_AGENT': {
              this.agentEnabled = false;
              this.stopOptimizationCycle();
              return { success: true, message: 'Agent disabled' };
            }

            case 'GET_OPTIMIZATION_RECOMMENDATIONS': {
              const recommendations = await this.getOptimizationRecommendations();
              return { success: true, recommendations };
            }

            case 'EXECUTE_AGENT_ACTION': {
              const result = await this.executeAgentAction(message.action, message.context);
              return { success: true, result };
            }

            case 'GET_PATTERN_ANALYSIS': {
              const patterns = await this.getPatternAnalysis(message.timeRange);
              return { success: true, patterns };
            }

            case 'GET_LEARNING_INSIGHTS': {
              const insights = await this.getLearningInsights();
              return { success: true, insights };
            }

            case 'TRIGGER_OPTIMIZATION': {
              const result = await this.triggerOptimization(message.strategy, message.context);
              return { success: true, result };
            }

            case 'GET_AGENT_DASHBOARD_DATA': {
              const data = await this.getAgentDashboardData();
              return { success: true, data };
            }

            case 'UPDATE_AGENT_SETTINGS': {
              await this.updateAgentSettings(message.settings);
              return { success: true };
            }

            default:
              return null; // Let base class handle
          }
        } catch (error) {
          console.error('[EnergyTrackerWithAgent] Agent message handling error:', error);
          return { success: false, error: error.message };
        }
      };

      const result = handleAgentRequest();
      if (result !== null) {
        result.then(response => {
          try {
            if (sendResponse) {
              sendResponse(response);
            }
          } catch (responseError) {
            console.error('[EnergyTrackerWithAgent] Send response error:', responseError);
          }
        }).catch(error => {
          console.error('[EnergyTrackerWithAgent] Agent request error:', error);
          try {
            if (sendResponse) {
              sendResponse({ success: false, error: error.message });
            }
          } catch (responseError) {
            console.error('[EnergyTrackerWithAgent] Error response failed:', responseError);
          }
        });
        return true; // Indicate async response
      }

      return false; // Let base class handle
    });
  }

  startOptimizationCycle() {
    if (!this.agentEnabled || !this.optimizationController) return;

    // Start periodic optimization cycle
    this.optimizationInterval = setInterval(async () => {
      await this.runOptimizationCycle();
    }, 30000); // Run every 30 seconds

    console.log('[EnergyTrackerWithAgent] Optimization cycle started');
  }

  stopOptimizationCycle() {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
    console.log('[EnergyTrackerWithAgent] Optimization cycle stopped');
  }

  async runOptimizationCycle() {
    if (!this.agentEnabled || !this.optimizationController) return;

    try {
      // Get current system state
      const currentState = await this.getCurrentSystemState();
      
      // Run optimization analysis
      const optimizationResult = await this.optimizationController.optimize(currentState);
      
      if (optimizationResult.success && optimizationResult.strategy !== 'none') {
        this.lastOptimization = Date.now();
        this.agentMetrics.totalOptimizations++;
        this.agentMetrics.energySaved += optimizationResult.executionResult?.totalEnergySaved || 0;
        
        // Learn from the optimization
        if (this.advancedLearningSystem && optimizationResult.executionResult) {
          await this.learnFromOptimization(currentState, optimizationResult);
        }
        
        console.log('[EnergyTrackerWithAgent] Optimization completed:', optimizationResult.strategy);
      }
      
    } catch (error) {
      console.error('[EnergyTrackerWithAgent] Optimization cycle error:', error);
    }
  }

  async getCurrentSystemState() {
    // Get comprehensive system state for agent analysis
    const energyData = await this.getCurrentEnergySnapshot();
    const settings = await this.getSettings();
    
    // Calculate system metrics
    const tabPowerUsage = Object.values(energyData).reduce((sum, tab) => sum + (tab.powerWatts || 8), 0);
    const tabCount = Object.keys(energyData).length;
    const averagePowerPerTab = tabCount > 0 ? tabPowerUsage / tabCount : 8;
    
    // Get battery info if available
    let batteryInfo = { level: 0.5, charging: false, status: 'unknown' };
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        batteryInfo = {
          level: battery.level,
          charging: battery.charging,
          status: battery.level < 0.2 ? 'critical' : battery.level < 0.5 ? 'low' : 'good'
        };
      }
    } catch (error) {
      // Battery API not available
    }

    return {
      timestamp: Date.now(),
      energyConsumption: {
        total: tabPowerUsage,
        average: averagePowerPerTab,
        efficiency: this.calculateEnergyEfficiency(energyData),
        trending: this.calculateEnergyTrend()
      },
      batteryLevel: batteryInfo,
      systemLoad: {
        tabCount: tabCount,
        cpu: this.estimateCPUUsage(energyData),
        memory: this.estimateMemoryUsage(energyData)
      },
      userActivity: {
        level: this.calculateUserActivityLevel(),
        idleTime: this.getEstimatedIdleTime(),
        patterns: this.getUserActivityPatterns()
      },
      networkActivity: {
        activeConnections: tabCount,
        estimatedBandwidth: this.estimateNetworkUsage(energyData)
      },
      timeOfDay: this.getTimeContext(),
      settings: settings,
      agentMetrics: this.agentMetrics
    };
  }

  calculateEnergyEfficiency(energyData) {
    const powerValues = Object.values(energyData).map(tab => tab.powerWatts || 8);
    if (powerValues.length === 0) return 0.5;
    
    const avgPower = powerValues.reduce((a, b) => a + b, 0) / powerValues.length;
    
    // Efficiency based on how close average power is to optimal (15W)
    const optimalPower = 15;
    const efficiency = Math.max(0.1, Math.min(1.0, optimalPower / avgPower));
    
    return efficiency;
  }

  calculateEnergyTrend() {
    const recentHistory = this.getRecentPowerHistory();
    if (recentHistory.length < 3) return 'stable';
    
    const firstHalf = recentHistory.slice(0, Math.floor(recentHistory.length / 2));
    const secondHalf = recentHistory.slice(Math.floor(recentHistory.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  getRecentPowerHistory() {
    // Get recent power usage data
    // For now, simulate with some variation
    const baseHistory = [];
    for (let i = 0; i < 10; i++) {
      baseHistory.push(15 + Math.random() * 10 + Math.sin(i / 2) * 5);
    }
    return baseHistory;
  }

  estimateCPUUsage(energyData) {
    // Estimate CPU usage based on power consumption
    const totalPower = Object.values(energyData).reduce((sum, tab) => sum + (tab.powerWatts || 8), 0);
    
    // Very rough estimation: higher power = higher CPU usage
    if (totalPower < 20) return 20 + Math.random() * 20; // 20-40%
    if (totalPower < 50) return 40 + Math.random() * 30; // 40-70%
    return 60 + Math.random() * 30; // 60-90%
  }

  estimateMemoryUsage(energyData) {
    // Estimate memory usage based on tab count and complexity
    const tabCount = Object.keys(energyData).length;
    const avgDOMNodes = Object.values(energyData).reduce((sum, tab) => sum + (tab.domNodes || 1000), 0) / tabCount;
    
    // Rough estimation
    return Math.min(90, 30 + (tabCount * 5) + (avgDOMNodes / 100));
  }

  calculateUserActivityLevel() {
    // Estimate user activity based on recent interactions
    const now = Date.now();
    const recentThreshold = 300000; // 5 minutes
    
    let activityScore = 0;
    
    // Check if there have been recent tab changes
    for (const tabData of this.currentTabs.values()) {
      if (tabData.lastUpdate && (now - tabData.lastUpdate) < recentThreshold) {
        activityScore += 0.3;
      }
    }
    
    return Math.min(1.0, activityScore);
  }

  getEstimatedIdleTime() {
    // Estimate idle time based on tab update patterns
    const now = Date.now();
    let minLastUpdate = now;
    
    for (const tabData of this.currentTabs.values()) {
      if (tabData.lastUpdate) {
        minLastUpdate = Math.min(minLastUpdate, tabData.lastUpdate);
      }
    }
    
    return now - minLastUpdate;
  }

  getUserActivityPatterns() {
    return {
      clicks: Math.floor(Math.random() * 20),
      keystrokes: Math.floor(Math.random() * 100),
      tabSwitches: Math.floor(Math.random() * 10),
      scrolling: Math.random() < 0.6
    };
  }

  estimateNetworkUsage(energyData) {
    // Estimate network usage based on tab types
    let bandwidth = 0;
    
    for (const tab of Object.values(energyData)) {
      if (tab.url) {
        const url = tab.url.toLowerCase();
        if (url.includes('youtube') || url.includes('netflix') || url.includes('video')) {
          bandwidth += 5; // Video streaming
        } else if (url.includes('social') || url.includes('twitter') || url.includes('facebook')) {
          bandwidth += 2; // Social media
        } else {
          bandwidth += 0.5; // Regular browsing
        }
      }
    }
    
    return bandwidth;
  }

  getTimeContext() {
    const now = new Date();
    return {
      hour: now.getHours(),
      period: this.getTimePeriod(now.getHours()),
      workingHours: now.getHours() >= 9 && now.getHours() <= 17,
      weekend: now.getDay() === 0 || now.getDay() === 6
    };
  }

  getTimePeriod(hour) {
    if (hour < 6) return 'late_night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  async learnFromOptimization(state, optimizationResult) {
    if (!this.advancedLearningSystem) return;

    // Calculate reward based on optimization success
    let reward = 0;
    
    if (optimizationResult.executionResult) {
      const result = optimizationResult.executionResult;
      reward += (result.totalEnergySaved || 0) * 0.1; // Energy savings
      reward += (result.successfulActions || 0) * 2; // Successful actions
      reward -= this.calculateUserImpactPenalty(result.userImpact); // User impact penalty
    }
    
    // Create next state (simplified)
    const nextState = {
      ...state,
      timestamp: Date.now(),
      agentMetrics: this.agentMetrics
    };
    
    // Learn from the experience
    await this.advancedLearningSystem.learn(
      state,
      optimizationResult.strategy,
      reward,
      nextState,
      { optimizationContext: true }
    );
    
    // Update agent confidence
    this.updateAgentConfidence(reward);
  }

  calculateUserImpactPenalty(userImpact) {
    const penalties = {
      'minimal': 0,
      'low': 1,
      'medium': 3,
      'high': 8
    };
    return penalties[userImpact] || 0;
  }

  updateAgentConfidence(reward) {
    const alpha = 0.1; // Learning rate
    const normalizedReward = Math.max(-1, Math.min(1, reward / 10));
    
    this.agentMetrics.confidenceScore = 
      (1 - alpha) * this.agentMetrics.confidenceScore + 
      alpha * (0.5 + normalizedReward * 0.5);
      
    this.agentMetrics.confidenceScore = Math.max(0.1, Math.min(0.95, this.agentMetrics.confidenceScore));
  }

  async getOptimizationRecommendations() {
    if (!this.patternRecognitionSystem) return [];

    try {
      // Get recent energy data for pattern analysis
      const recentData = await this.getRecentDataForAnalysis();
      
      // Analyze patterns
      const patternResult = await this.patternRecognitionSystem.analyzePatterns(recentData);
      
      if (patternResult.success && patternResult.recommendations) {
        return patternResult.recommendations;
      }
      
      return [];
    } catch (error) {
      console.error('[EnergyTrackerWithAgent] Failed to get recommendations:', error);
      return [];
    }
  }

  async getRecentDataForAnalysis() {
    // Convert recent energy data to format suitable for pattern analysis
    const energyHistory = await this.getEnergyHistory('1h');
    
    return energyHistory.map(entry => ({
      timestamp: entry.timestamp,
      value: entry.powerWatts || entry.energyScore || 8,
      type: 'energy',
      url: entry.url,
      title: entry.title,
      context: {
        tabCount: 1,
        batteryLevel: 0.5, // Default
        userActivity: 0.3 // Default
      }
    }));
  }

  async executeAgentAction(action, context) {
    if (!this.intelligentActions) {
      return { success: false, error: 'IntelligentActions not available' };
    }

    try {
      const result = await this.intelligentActions.executeAction(action, context);
      
      // Update metrics
      this.agentMetrics.userInteractions++;
      if (result.success) {
        this.agentMetrics.energySaved += result.energySaved || 0;
      }
      
      return result;
    } catch (error) {
      console.error('[EnergyTrackerWithAgent] Agent action execution failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getPatternAnalysis(timeRange = '24h') {
    if (!this.patternRecognitionSystem) {
      return { patterns: [], insights: {} };
    }

    try {
      const analysisData = await this.getRecentDataForAnalysis();
      const result = await this.patternRecognitionSystem.analyzePatterns(analysisData);
      
      if (result.success) {
        this.agentMetrics.patternDetections += result.patterns?.length || 0;
        return {
          patterns: result.patterns || [],
          insights: result.insights || {},
          confidence: result.confidence || 0.5
        };
      }
      
      return { patterns: [], insights: {} };
    } catch (error) {
      console.error('[EnergyTrackerWithAgent] Pattern analysis failed:', error);
      return { patterns: [], insights: {} };
    }
  }

  async getLearningInsights() {
    if (!this.advancedLearningSystem) {
      return { insights: {}, modelStatus: 'unavailable' };
    }

    try {
      const insights = this.advancedLearningSystem.getGlobalInsights();
      
      return {
        insights: insights || {},
        modelStatus: 'active',
        confidence: this.agentMetrics.confidenceScore,
        totalExperiences: insights.totalExperiences || 0,
        learningVelocity: insights.learningVelocity || 0.5
      };
    } catch (error) {
      console.error('[EnergyTrackerWithAgent] Learning insights failed:', error);
      return { insights: {}, modelStatus: 'error' };
    }
  }

  async triggerOptimization(strategy, context) {
    if (!this.optimizationController) {
      return { success: false, error: 'OptimizationController not available' };
    }

    try {
      const systemState = await this.getCurrentSystemState();
      const optimizationContext = { ...systemState, ...context, manualTrigger: true };
      
      const result = await this.optimizationController.optimize(optimizationContext);
      
      if (result.success) {
        this.lastOptimization = Date.now();
        this.agentMetrics.totalOptimizations++;
        this.agentMetrics.energySaved += result.executionResult?.totalEnergySaved || 0;
      }
      
      return result;
    } catch (error) {
      console.error('[EnergyTrackerWithAgent] Manual optimization failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getAgentDashboardData() {
    try {
      const currentState = await this.getCurrentSystemState();
      
      return {
        agentStatus: {
          enabled: this.agentEnabled,
          initialized: this.agentInitialized,
          confidence: this.agentMetrics.confidenceScore,
          lastOptimization: this.lastOptimization
        },
        metrics: this.agentMetrics,
        currentState: currentState,
        recentOptimizations: await this.getRecentOptimizations(),
        recommendations: await this.getOptimizationRecommendations(),
        patterns: await this.getPatternAnalysis('1h'),
        learningInsights: await this.getLearningInsights()
      };
    } catch (error) {
      console.error('[EnergyTrackerWithAgent] Dashboard data failed:', error);
      return { error: error.message };
    }
  }

  async getRecentOptimizations() {
    // Get recent optimization history
    // This would be stored separately in a real implementation
    return [
      {
        timestamp: Date.now() - 300000,
        strategy: 'intelligentTabSuspension',
        energySaved: 12.4,
        success: true
      },
      {
        timestamp: Date.now() - 600000,
        strategy: 'contextualDarkMode',
        energySaved: 5.2,
        success: true
      }
    ];
  }

  async updateAgentSettings(settings) {
    try {
      if (settings.enabled !== undefined) {
        this.agentEnabled = settings.enabled;
        if (this.agentEnabled) {
          await this.startOptimizationCycle();
        } else {
          this.stopOptimizationCycle();
        }
      }

      // Update component settings
      if (this.optimizationController && settings.optimization) {
        // Update optimization controller settings
      }

      if (this.advancedLearningSystem && settings.learning) {
        // Update learning system settings
      }

      console.log('[EnergyTrackerWithAgent] Agent settings updated:', settings);
    } catch (error) {
      console.error('[EnergyTrackerWithAgent] Settings update failed:', error);
      throw error;
    }
  }

  async showAgentWelcomeNotification() {
    try {
      if (chrome.notifications) {
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon-48.png',
          title: 'Power AI Agent Activated',
          message: 'Your intelligent energy optimization assistant is now active and learning your browsing patterns.'
        });
      }
    } catch (error) {
      console.log('[EnergyTrackerWithAgent] Welcome notification failed:', error);
    }
  }

  // Override processEnergyData to include agent analysis
  async processEnergyData(tabId, metrics) {
    // Call parent method first
    await super.processEnergyData(tabId, metrics);

    // Add agent analysis if enabled
    if (this.agentEnabled && this.agentInitialized && this.energyAgent) {
      try {
        const tabData = this.currentTabs.get(tabId);
        if (tabData) {
          // Feed data to energy agent for analysis
          await this.energyAgent.observe(tabId, {
            powerWatts: tabData.powerWatts,
            metrics: metrics,
            url: tabData.url,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.warn('[EnergyTrackerWithAgent] Agent data processing failed:', error);
      }
    }
  }

  // Override getCurrentEnergySnapshot to include agent insights
  async getCurrentEnergySnapshot() {
    const baseSnapshot = await super.getCurrentEnergySnapshot();
    
    if (this.agentEnabled && this.agentInitialized) {
      // Add agent-specific data to snapshot
      for (const [tabId, data] of Object.entries(baseSnapshot)) {
        if (this.energyAgent) {
          try {
            const agentInsights = await this.energyAgent.getTabInsights(tabId);
            baseSnapshot[tabId] = {
              ...data,
              agentInsights: agentInsights,
              optimizationRecommendations: await this.getTabOptimizationRecommendations(tabId)
            };
          } catch (error) {
            console.warn('[EnergyTrackerWithAgent] Failed to get agent insights for tab:', tabId, error);
          }
        }
      }
      
      // Add global agent status
      baseSnapshot._agentStatus = {
        enabled: this.agentEnabled,
        initialized: this.agentInitialized,
        metrics: this.agentMetrics,
        lastOptimization: this.lastOptimization
      };
    }
    
    return baseSnapshot;
  }

  async getTabOptimizationRecommendations(tabId) {
    // Get specific optimization recommendations for a tab
    const tabData = this.currentTabs.get(parseInt(tabId));
    if (!tabData || !this.intelligentActions) return [];

    const recommendations = [];
    const powerWatts = tabData.powerWatts || 8;

    if (powerWatts > 40) {
      recommendations.push({
        type: 'high_power_alert',
        action: 'intelligentTabSuspension',
        description: 'Consider suspending this high-power tab',
        urgency: 'high',
        estimatedSavings: powerWatts - 5
      });
    }

    if (powerWatts > 25 && tabData.url && (tabData.url.includes('youtube') || tabData.url.includes('video'))) {
      recommendations.push({
        type: 'video_optimization',
        action: 'dynamicVideoOptimization',
        description: 'Optimize video quality to save power',
        urgency: 'medium',
        estimatedSavings: powerWatts * 0.3
      });
    }

    return recommendations;
  }

  // Enhanced cleanup
  async periodicCleanup() {
    await super.periodicCleanup();
    
    // Additional agent-specific cleanup
    if (this.agentInitialized) {
      try {
        // Clean up optimization queue
        this.optimizationQueue = this.optimizationQueue.filter(item => 
          (Date.now() - item.timestamp) < 3600000 // Keep last hour
        );
        
        // Reset metrics if they get too large
        if (this.agentMetrics.totalOptimizations > 10000) {
          this.agentMetrics = {
            ...this.agentMetrics,
            totalOptimizations: Math.floor(this.agentMetrics.totalOptimizations / 2),
            energySaved: Math.floor(this.agentMetrics.energySaved / 2),
            patternDetections: Math.floor(this.agentMetrics.patternDetections / 2),
            userInteractions: Math.floor(this.agentMetrics.userInteractions / 2)
          };
        }
      } catch (error) {
        console.warn('[EnergyTrackerWithAgent] Agent cleanup failed:', error);
      }
    }
  }

  // Graceful shutdown
  destroy() {
    this.stopOptimizationCycle();
    
    if (this.agentDashboard) {
      try {
        this.agentDashboard.destroy();
      } catch (error) {
        console.warn('[EnergyTrackerWithAgent] Dashboard cleanup failed:', error);
      }
    }
    
    this.agentEnabled = false;
    this.agentInitialized = false;
    
    console.log('[EnergyTrackerWithAgent] Agent system shut down');
  }
}

// Export the enhanced tracker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnergyTrackerWithAgent;
}