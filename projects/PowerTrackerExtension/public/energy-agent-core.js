/**
 * Energy Agent Core - Rule-based intelligent energy optimization
 * Uses deterministic algorithms instead of external AI to minimize energy consumption
 */
class EnergyAgent {
  constructor() {
    this.isActive = false;
    this.patterns = new Map();
    this.actionHistory = [];
    this.behaviorData = new Map();
    this.rules = new RuleEngine();
    this.optimizer = new EnergyOptimizer();
    this.predictor = new DeterministicPredictor();
    
    this.config = {
      aggressiveness: 'moderate', // conservative, moderate, aggressive
      autoActionsEnabled: true,
      learningEnabled: true,
      energySavingTarget: 25, // percentage
      userInterruptionTolerance: 'low'
    };
    
    this.metrics = {
      energySaved: 0,
      actionsExecuted: 0,
      userSatisfaction: 0.8,
      predictionAccuracy: 0.0
    };
  }

  async initialize() {
    console.log('[EnergyAgent] Initializing intelligent energy optimization...');
    
    try {
      // Load user behavior patterns
      await this.loadBehaviorPatterns();
      
      // Initialize rule engine with optimization rules
      await this.rules.loadOptimizationRules();
      
      // Setup monitoring intervals
      this.setupMonitoring();
      
      // Load user preferences
      await this.loadUserPreferences();
      
      this.isActive = true;
      console.log('[EnergyAgent] Agent initialized and active');
    } catch (error) {
      console.error('[EnergyAgent] Initialization failed:', error);
      throw error;
    }
  }

  async observe(energyData, userContext) {
    if (!this.isActive) return;
    
    const observation = {
      timestamp: Date.now(),
      energyData,
      userContext,
      patterns: await this.extractPatterns(energyData, userContext)
    };
    
    // Store for pattern analysis
    this.behaviorData.set(observation.timestamp, observation);
    
    // Maintain rolling window of data
    this.maintainDataWindow();
    
    // Update pattern recognition
    await this.updatePatterns(observation);
    
    return observation;
  }

  async analyze(timeWindow = 3600000) { // 1 hour default
    const recentData = this.getRecentData(timeWindow);
    
    const analysis = {
      energyTrends: this.analyzeTrends(recentData),
      behaviorPatterns: this.identifyBehaviorPatterns(recentData),
      optimizationOpportunities: await this.identifyOptimizations(recentData),
      riskAssessment: this.assessOptimizationRisks(recentData),
      predictedBehavior: await this.predictor.predictNext30Minutes(recentData)
    };
    
    // Generate insights using rule-based system
    analysis.insights = await this.rules.generateInsights(analysis);
    analysis.recommendations = await this.rules.generateRecommendations(analysis);
    
    return analysis;
  }

  async decide(context, urgencyLevel = 'normal') {
    const analysis = await this.analyze();
    
    // Use rule-based decision making instead of AI
    const decision = await this.rules.makeDecision({
      context,
      analysis,
      urgencyLevel,
      userPreferences: this.config,
      historicalEffectiveness: this.getActionEffectiveness()
    });
    
    // Validate decision against safety rules
    const validatedDecision = await this.rules.validateDecision(decision);
    
    return validatedDecision;
  }

  async act(decision) {
    if (!decision || !decision.actions) return null;
    
    const executionResults = [];
    
    for (const action of decision.actions) {
      try {
        const startTime = performance.now();
        const result = await this.executeAction(action);
        const executionTime = performance.now() - startTime;
        
        const actionResult = {
          action: action.type,
          success: result.success,
          energySaved: result.energySaved || 0,
          userImpact: result.userImpact || 'minimal',
          executionTime,
          timestamp: Date.now()
        };
        
        executionResults.push(actionResult);
        this.actionHistory.push(actionResult);
        
        // Update metrics
        if (result.success && result.energySaved) {
          this.metrics.energySaved += result.energySaved;
          this.metrics.actionsExecuted++;
        }
        
      } catch (error) {
        console.error('[EnergyAgent] Action execution failed:', error);
        executionResults.push({
          action: action.type,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
      }
    }
    
    return {
      decision,
      results: executionResults,
      totalEnergySaved: executionResults.reduce((sum, r) => sum + (r.energySaved || 0), 0)
    };
  }

  async learn(actionResults) {
    if (!this.config.learningEnabled) return;
    
    // Update pattern weights based on action effectiveness
    await this.updatePatternWeights(actionResults);
    
    // Adjust rule effectiveness scores
    await this.rules.updateRuleEffectiveness(actionResults);
    
    // Update prediction accuracy
    await this.predictor.updateAccuracy(actionResults);
    
    // Evolve optimization strategies
    await this.optimizer.evolveStrategies(actionResults);
    
    // Update user preference model
    await this.updateUserModel(actionResults);
  }

  // Helper methods
  async loadBehaviorPatterns() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['behaviorPatterns']);
        this.patterns = new Map(result.behaviorPatterns || []);
      }
    } catch (error) {
      console.warn('[EnergyAgent] Could not load behavior patterns:', error);
    }
  }

  async loadUserPreferences() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['agentConfig']);
        if (result.agentConfig) {
          this.config = { ...this.config, ...result.agentConfig };
        }
      }
    } catch (error) {
      console.warn('[EnergyAgent] Could not load user preferences:', error);
    }
  }

  setupMonitoring() {
    // Monitor every 30 seconds
    setInterval(() => {
      if (this.isActive) {
        this.performRoutineAnalysis();
      }
    }, 30000);
  }

  async performRoutineAnalysis() {
    try {
      const analysis = await this.analyze();
      
      // Check for immediate action opportunities
      if (analysis.riskAssessment.urgency === 'high') {
        const decision = await this.decide(analysis, 'high');
        if (decision.actions.length > 0) {
          await this.act(decision);
        }
      }
    } catch (error) {
      console.error('[EnergyAgent] Routine analysis failed:', error);
    }
  }

  getRecentData(timeWindow) {
    const cutoff = Date.now() - timeWindow;
    const recentData = [];
    
    for (const [timestamp, data] of this.behaviorData.entries()) {
      if (timestamp >= cutoff) {
        recentData.push(data);
      }
    }
    
    return recentData.sort((a, b) => a.timestamp - b.timestamp);
  }

  maintainDataWindow() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = Date.now() - maxAge;
    
    for (const [timestamp] of this.behaviorData.entries()) {
      if (timestamp < cutoff) {
        this.behaviorData.delete(timestamp);
      }
    }
  }

  async extractPatterns(energyData, userContext) {
    return {
      energyLevel: this.categorizeEnergyLevel(energyData.totalPower),
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      tabCount: userContext.tabCount || 0,
      activeVideo: userContext.hasActiveVideo || false,
      cpuUsage: energyData.cpuUsage || 0,
      memoryUsage: energyData.memoryUsage || 0
    };
  }

  categorizeEnergyLevel(powerWatts) {
    if (powerWatts < 15) return 'low';
    if (powerWatts < 30) return 'medium';
    if (powerWatts < 50) return 'high';
    return 'very_high';
  }

  analyzeTrends(data) {
    if (data.length < 2) return { direction: 'stable', volatility: 0 };
    
    const powers = data.map(d => d.energyData.totalPower);
    const recent = powers.slice(-5);
    const earlier = powers.slice(-10, -5);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    let direction = 'stable';
    if (recentAvg > earlierAvg * 1.1) direction = 'increasing';
    else if (recentAvg < earlierAvg * 0.9) direction = 'decreasing';
    
    const volatility = this.calculateVolatility(powers);
    
    return { direction, volatility, recentAvg, earlierAvg };
  }

  identifyBehaviorPatterns(data) {
    const patterns = {
      tabUsage: this.analyzeTabUsage(data),
      mediaConsumption: this.analyzeMediaConsumption(data),
      timePatterns: this.analyzeTimePatterns(data),
      energySpikes: this.identifyEnergySpikes(data)
    };
    
    return patterns;
  }

  analyzeTabUsage(data) {
    const tabCounts = data.map(d => d.userContext.tabCount || 0);
    const avgTabs = tabCounts.reduce((a, b) => a + b, 0) / tabCounts.length;
    const maxTabs = Math.max(...tabCounts);
    
    return {
      averageTabs: avgTabs,
      maxTabs: maxTabs,
      tabGrowthRate: this.calculateGrowthRate(tabCounts),
      multitaskingIntensity: avgTabs > 10 ? 'high' : avgTabs > 5 ? 'medium' : 'low'
    };
  }

  analyzeMediaConsumption(data) {
    const videoSessions = data.filter(d => d.userContext.hasActiveVideo);
    const videoPercentage = videoSessions.length / data.length;
    
    return {
      videoUsagePercentage: videoPercentage,
      averageVideoSessions: videoSessions.length,
      isVideoHeavyUser: videoPercentage > 0.3
    };
  }

  analyzeTimePatterns(data) {
    const hourlyUsage = {};
    
    data.forEach(d => {
      const hour = new Date(d.timestamp).getHours();
      if (!hourlyUsage[hour]) hourlyUsage[hour] = [];
      hourlyUsage[hour].push(d.energyData.totalPower);
    });
    
    const peakHours = Object.entries(hourlyUsage)
      .sort(([,a], [,b]) => (b.reduce((x,y) => x+y, 0) / b.length) - (a.reduce((x,y) => x+y, 0) / a.length))
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
    
    return {
      peakHours,
      hourlyDistribution: hourlyUsage,
      workingHours: this.identifyWorkingHours(hourlyUsage)
    };
  }

  identifyEnergySpikes(data) {
    const powers = data.map(d => d.energyData.totalPower);
    const avg = powers.reduce((a, b) => a + b, 0) / powers.length;
    const stdDev = Math.sqrt(powers.reduce((sum, x) => sum + Math.pow(x - avg, 2), 0) / powers.length);
    
    const spikes = data.filter(d => d.energyData.totalPower > avg + (2 * stdDev));
    
    return {
      spikeCount: spikes.length,
      spikeFrequency: spikes.length / data.length,
      averageSpikeIntensity: spikes.reduce((sum, s) => sum + s.energyData.totalPower, 0) / spikes.length || 0,
      spikeTriggers: this.identifySpikeTriggers(spikes)
    };
  }

  identifySpikeTriggers(spikes) {
    const triggers = {
      video: spikes.filter(s => s.userContext.hasActiveVideo).length,
      highTabCount: spikes.filter(s => s.userContext.tabCount > 10).length,
      timeOfDay: {}
    };
    
    spikes.forEach(spike => {
      const hour = new Date(spike.timestamp).getHours();
      triggers.timeOfDay[hour] = (triggers.timeOfDay[hour] || 0) + 1;
    });
    
    return triggers;
  }

  async identifyOptimizations(data) {
    const opportunities = [];
    
    // High energy tab opportunity
    const avgPower = data.reduce((sum, d) => sum + d.energyData.totalPower, 0) / data.length;
    if (avgPower > 25) {
      opportunities.push({
        type: 'tab_suspension',
        priority: 'high',
        estimatedSaving: Math.min(avgPower * 0.3, 15),
        description: 'Suspend background tabs to reduce energy consumption'
      });
    }
    
    // Video optimization opportunity
    const videoUsage = data.filter(d => d.userContext.hasActiveVideo).length / data.length;
    if (videoUsage > 0.2 && avgPower > 30) {
      opportunities.push({
        type: 'video_optimization',
        priority: 'medium',
        estimatedSaving: Math.min(avgPower * 0.25, 12),
        description: 'Optimize video quality based on context'
      });
    }
    
    // Resource blocking opportunity
    if (avgPower > 20) {
      opportunities.push({
        type: 'resource_blocking',
        priority: 'medium',
        estimatedSaving: Math.min(avgPower * 0.15, 8),
        description: 'Block unnecessary resources and trackers'
      });
    }
    
    return opportunities.sort((a, b) => b.estimatedSaving - a.estimatedSaving);
  }

  assessOptimizationRisks(data) {
    const risks = [];
    const avgPower = data.reduce((sum, d) => sum + d.energyData.totalPower, 0) / data.length;
    const tabCount = data[data.length - 1]?.userContext.tabCount || 0;
    
    let urgency = 'low';
    if (avgPower > 40) urgency = 'high';
    else if (avgPower > 25) urgency = 'medium';
    
    if (tabCount > 15) {
      risks.push({
        type: 'tab_overload',
        level: 'high',
        description: 'High tab count may impact performance'
      });
    }
    
    if (avgPower > 35) {
      risks.push({
        type: 'battery_drain',
        level: 'high',
        description: 'High power consumption will drain battery quickly'
      });
    }
    
    return { urgency, risks, overallRisk: risks.length > 0 ? 'high' : 'low' };
  }

  async executeAction(action) {
    // This will be implemented by the IntelligentActions class
    console.log('[EnergyAgent] Executing action:', action.type);
    
    // Placeholder implementation
    return {
      success: true,
      energySaved: action.estimatedSaving || 5,
      userImpact: 'minimal',
      method: 'simulated'
    };
  }

  getActionEffectiveness() {
    const recentActions = this.actionHistory.slice(-20);
    const successRate = recentActions.filter(a => a.success).length / recentActions.length || 0;
    const avgEnergySaved = recentActions.reduce((sum, a) => sum + (a.energySaved || 0), 0) / recentActions.length || 0;
    
    return { successRate, avgEnergySaved, totalActions: this.actionHistory.length };
  }

  async updatePatterns(observation) {
    const patternKey = `${observation.patterns.energyLevel}_${observation.patterns.timeOfDay}`;
    
    if (!this.patterns.has(patternKey)) {
      this.patterns.set(patternKey, { count: 0, avgPower: 0, contexts: [] });
    }
    
    const pattern = this.patterns.get(patternKey);
    pattern.count++;
    pattern.avgPower = (pattern.avgPower * (pattern.count - 1) + observation.energyData.totalPower) / pattern.count;
    pattern.contexts.push({
      tabCount: observation.userContext.tabCount,
      hasVideo: observation.userContext.hasActiveVideo,
      timestamp: observation.timestamp
    });
    
    // Keep only recent contexts
    if (pattern.contexts.length > 100) {
      pattern.contexts = pattern.contexts.slice(-50);
    }
  }

  async updatePatternWeights(actionResults) {
    // Adjust pattern importance based on action effectiveness
    actionResults.forEach(result => {
      if (result.success && result.energySaved > 0) {
        // Increase weight for successful patterns
        const relatedPatterns = this.findRelatedPatterns(result.timestamp);
        relatedPatterns.forEach(pattern => {
          pattern.weight = (pattern.weight || 1) * 1.1;
        });
      }
    });
  }

  async updateUserModel(actionResults) {
    // Update user satisfaction based on action results
    const recentResults = actionResults.slice(-10);
    const userImpactScores = recentResults.map(r => {
      switch (r.userImpact) {
        case 'minimal': return 0.9;
        case 'low': return 0.7;
        case 'medium': return 0.5;
        case 'high': return 0.2;
        default: return 0.8;
      }
    });
    
    const avgSatisfaction = userImpactScores.reduce((a, b) => a + b, 0) / userImpactScores.length;
    this.metrics.userSatisfaction = (this.metrics.userSatisfaction * 0.8) + (avgSatisfaction * 0.2);
  }

  // Utility methods
  calculateVolatility(values) {
    if (values.length < 2) return 0;
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    return Math.sqrt(variance) / avg;
  }

  calculateGrowthRate(values) {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    return last === 0 ? 0 : (last - first) / first;
  }

  identifyWorkingHours(hourlyUsage) {
    const workingHours = [];
    
    Object.entries(hourlyUsage).forEach(([hour, usage]) => {
      const avgUsage = usage.reduce((a, b) => a + b, 0) / usage.length;
      const hourNum = parseInt(hour);
      
      if (hourNum >= 9 && hourNum <= 17 && avgUsage > 20) {
        workingHours.push(hourNum);
      }
    });
    
    return workingHours;
  }

  findRelatedPatterns(timestamp) {
    const timeWindow = 1800000; // 30 minutes
    const relatedPatterns = [];
    
    for (const [key, pattern] of this.patterns.entries()) {
      const hasRecentContext = pattern.contexts.some(c => 
        Math.abs(c.timestamp - timestamp) < timeWindow
      );
      
      if (hasRecentContext) {
        relatedPatterns.push(pattern);
      }
    }
    
    return relatedPatterns;
  }

  // Status and metrics methods
  getStatus() {
    return {
      isActive: this.isActive,
      config: this.config,
      metrics: this.metrics,
      patternsCount: this.patterns.size,
      actionHistoryCount: this.actionHistory.length,
      behaviorDataPoints: this.behaviorData.size
    };
  }

  async saveState() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          agentConfig: this.config,
          agentMetrics: this.metrics,
          behaviorPatterns: Array.from(this.patterns.entries()),
          actionHistory: this.actionHistory.slice(-100) // Keep only recent history
        });
      }
    } catch (error) {
      console.error('[EnergyAgent] Failed to save state:', error);
    }
  }
}