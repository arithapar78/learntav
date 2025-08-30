/**
 * Enhanced Energy Tracker Integration
 * Integrates the comprehensive AI energy database with the existing agent system
 */

// Import enhanced components
if (typeof importScripts !== 'undefined') {
  try {
    importScripts('enhanced-ai-energy-database.js');
    importScripts('enhanced-query-estimation.js');
    importScripts('ai-model-comparison.js');
  } catch (error) {
    console.warn('[EnhancedIntegration] Could not load enhanced components:', error);
  }
}

class EnergyTrackerEnhancedIntegration extends EnergyTrackerWithAgent {
  constructor() {
    super();
    
    // Initialize enhanced AI energy manager
    this.enhancedAIManager = null;
    this.aiEnergyTracker = null;
    this.environmentalTracker = null;
    
    // Enhanced tracking state
    this.enhancedTrackingEnabled = true;
    this.realTimeAIDetection = true;
    this.environmentalImpactTracking = true;
    
    // Enhanced metrics
    this.sessionEnvironmentalImpact = {
      totalEnergyWh: 0,
      totalCarbongCO2e: 0,
      totalWaterML: 0,
      modelUsageBreakdown: new Map(),
      environmentalComparisons: {
        householdEnergyDays: 0,
        universitiesEquiv: 0,
        olympicPoolsWater: 0,
        gasolineCarMiles: 0,
        atlanticFlights: 0
      }
    };
    
    // Initialize enhanced components
    this.initEnhancedComponents();
  }

  async initEnhancedComponents() {
    try {
      console.log('[EnhancedIntegration] Initializing enhanced AI energy tracking...');
      
      // Wait for base initialization
      await this.initPromise;
      
      // Initialize enhanced AI manager if available
      if (typeof EnhancedAIEnergyManager !== 'undefined') {
        this.enhancedAIManager = new EnhancedAIEnergyManager();
        console.log('[EnhancedIntegration] Enhanced AI Energy Manager initialized');
        
        // Initialize comparison engine
        if (typeof AIModelComparisonEngine !== 'undefined') {
          this.comparisonEngine = new AIModelComparisonEngine(this.enhancedAIManager);
          console.log('[EnhancedIntegration] AI Model Comparison Engine initialized');
        }
      } else {
        console.warn('[EnhancedIntegration] Enhanced database not available, using fallback');
        // Fallback to original AIEnergyManager
        if (typeof AIEnergyManager !== 'undefined') {
          this.aiEnergyTracker = new AIEnergyManager();
        }
      }
      
      // Setup enhanced listeners
      this.setupEnhancedListeners();
      
      // Start environmental tracking
      this.startEnvironmentalTracking();
      
      console.log('[EnhancedIntegration] Enhanced integration initialized successfully');
      
    } catch (error) {
      console.error('[EnhancedIntegration] Enhanced initialization failed:', error);
      this.enhancedTrackingEnabled = false;
    }
  }

  setupEnhancedListeners() {
    // Extend agent listeners with enhanced functionality
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!this.enhancedTrackingEnabled) {
        return false;
      }

      const handleEnhancedRequest = async () => {
        try {
          switch (message.type) {
            case 'GET_ENHANCED_AI_ANALYSIS': {
              const analysis = await this.getEnhancedAIAnalysis(message.context);
              return { success: true, analysis };
            }

            case 'GET_ENVIRONMENTAL_IMPACT': {
              const impact = await this.getEnvironmentalImpact(message.timeRange);
              return { success: true, impact };
            }

            case 'GET_MODEL_COMPARISON': {
              const comparison = await this.getModelComparison(message.models, message.criteria);
              return { success: true, comparison };
            }

            case 'GET_MODEL_BENCHMARKS': {
              const benchmarks = await this.getModelBenchmarks(message.metric);
              return { success: true, benchmarks };
            }

            case 'GET_TRENDING_MODELS': {
              const trending = await this.getTrendingModels(message.timeframe);
              return { success: true, trending };
            }

            case 'EXPORT_COMPARISON_DATA': {
              const exportData = await this.exportComparisonData(message.models, message.format);
              return { success: true, exportData };
            }

            case 'SAVE_MODEL_USAGE': {
              const saved = await this.saveModelUsage(message.usage);
              return { success: true, saved };
            }

            case 'GET_SUSTAINABILITY_INSIGHTS': {
              const insights = await this.getSustainabilityInsights();
              return { success: true, insights };
            }

            case 'GET_CARBON_FOOTPRINT': {
              const footprint = await this.getCarbonFootprint(message.timeRange);
              return { success: true, footprint };
            }

            case 'GET_AI_MODEL_RECOMMENDATIONS': {
              const recommendations = await this.getAIModelRecommendations(message.context);
              return { success: true, recommendations };
            }

            case 'OPTIMIZE_FOR_SUSTAINABILITY': {
              const result = await this.optimizeForSustainability(message.strategy);
              return { success: true, result };
            }

            case 'GET_REAL_TIME_AI_DETECTION': {
              const detection = await this.getRealTimeAIDetection(message.tabId);
              return { success: true, detection };
            }

            case 'GET_ENHANCED_DASHBOARD_DATA': {
              const data = await this.getEnhancedDashboardData();
              return { success: true, data };
            }

            default:
              return null;
          }
        } catch (error) {
          console.error('[EnhancedIntegration] Enhanced message handling error:', error);
          return { success: false, error: error.message };
        }
      };

      const result = handleEnhancedRequest();
      if (result !== null) {
        result.then(response => {
          try {
            if (sendResponse) {
              sendResponse(response);
            }
          } catch (responseError) {
            console.error('[EnhancedIntegration] Send response error:', responseError);
          }
        }).catch(error => {
          console.error('[EnhancedIntegration] Enhanced request error:', error);
          try {
            if (sendResponse) {
              sendResponse({ success: false, error: error.message });
            }
          } catch (responseError) {
            console.error('[EnhancedIntegration] Error response failed:', responseError);
          }
        });
        return true;
      }

      return false;
    });
  }

  startEnvironmentalTracking() {
    if (!this.environmentalImpactTracking) return;

    // Start periodic environmental impact calculation
    this.environmentalInterval = setInterval(async () => {
      await this.calculateEnvironmentalImpact();
    }, 60000); // Calculate every minute

    console.log('[EnhancedIntegration] Environmental tracking started');
  }

  async calculateEnvironmentalImpact() {
    if (!this.enhancedAIManager) return;

    try {
      // Get current energy snapshot
      const energySnapshot = await this.getCurrentEnergySnapshot();
      
      // Process each tab with AI detection
      for (const [tabId, tabData] of Object.entries(energySnapshot)) {
        if (tabId.startsWith('_')) continue; // Skip metadata
        
        const detectedModel = this.enhancedAIManager.detectAIModel(
          tabData.url, 
          tabData.title, 
          '', 
          {
            batteryLevel: await this.getBatteryLevel(),
            performanceMode: await this.getPerformanceMode(),
            userActivity: this.calculateUserActivityLevel()
          }
        );

        if (detectedModel) {
          const usage = this.enhancedAIManager.estimateAIUsage(tabData, detectedModel);
          
          // Update session environmental impact
          this.updateSessionEnvironmentalImpact(usage, detectedModel);
          
          // Update enhanced AI manager session totals
          this.enhancedAIManager.updateSessionTotals(usage);
        }
      }
    } catch (error) {
      console.error('[EnhancedIntegration] Environmental calculation failed:', error);
    }
  }

  updateSessionEnvironmentalImpact(usage, detectedModel) {
    const impact = this.sessionEnvironmentalImpact;
    
    // Update totals
    impact.totalEnergyWh += usage.energy?.mean || 0;
    impact.totalCarbongCO2e += usage.carbon?.mean || 0;
    impact.totalWaterML += usage.water?.mean || 0;
    
    // Update model breakdown
    const modelKey = detectedModel.modelKey;
    if (!impact.modelUsageBreakdown.has(modelKey)) {
      impact.modelUsageBreakdown.set(modelKey, {
        name: detectedModel.model.name,
        company: detectedModel.model.company,
        queries: 0,
        energy: 0,
        carbon: 0,
        water: 0
      });
    }
    
    const breakdown = impact.modelUsageBreakdown.get(modelKey);
    breakdown.queries += usage.queries || 0;
    breakdown.energy += usage.energy?.mean || 0;
    breakdown.carbon += usage.carbon?.mean || 0;
    breakdown.water += usage.water?.mean || 0;
    
    // Update environmental equivalents
    if (usage.environmental?.equivalents) {
      const eq = impact.environmentalComparisons;
      const newEq = usage.environmental.equivalents;
      eq.householdEnergyDays += newEq.householdEnergyDays || 0;
      eq.universitiesEquiv += newEq.universitiesEnergy || 0;
      eq.olympicPoolsWater += newEq.olympicPoolsWater || 0;
      eq.gasolineCarMiles += newEq.gasolineCarMiles || 0;
      eq.atlanticFlights += newEq.atlanticFlights || 0;
    }
  }

  async getBatteryLevel() {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        return battery.level;
      }
    } catch (error) {
      // Battery API not available
    }
    return 0.5; // Default
  }

  async getPerformanceMode() {
    // Could be based on system performance, battery level, user preferences
    const batteryLevel = await this.getBatteryLevel();
    if (batteryLevel < 0.3) return 'efficient';
    if (batteryLevel > 0.8) return 'performance';
    return 'balanced';
  }

  async getEnhancedAIAnalysis(context = {}) {
    if (!this.enhancedAIManager) {
      return { error: 'Enhanced AI manager not available' };
    }

    try {
      const currentSnapshot = await this.getCurrentEnergySnapshot();
      const analysis = {
        detectedModels: [],
        totalAIEnergyConsumption: 0,
        totalCarbonFootprint: 0,
        totalWaterUsage: 0,
        sustainabilityScore: 0,
        recommendations: []
      };

      // Analyze each active tab
      for (const [tabId, tabData] of Object.entries(currentSnapshot)) {
        if (tabId.startsWith('_')) continue;
        
        const detection = this.enhancedAIManager.detectAIModel(
          tabData.url, 
          tabData.title, 
          '', 
          context
        );

        if (detection) {
          const usage = this.enhancedAIManager.estimateAIUsage(tabData, detection, context);
          
          analysis.detectedModels.push({
            tabId,
            detection,
            usage,
            tabData: {
              url: tabData.url,
              title: tabData.title,
              powerWatts: tabData.powerWatts
            }
          });

          analysis.totalAIEnergyConsumption += usage.energy?.mean || 0;
          analysis.totalCarbonFootprint += usage.carbon?.mean || 0;
          analysis.totalWaterUsage += usage.water?.mean || 0;
        }
      }

      // Calculate sustainability score
      analysis.sustainabilityScore = this.calculateSustainabilityScore(analysis);
      
      // Get recommendations
      analysis.recommendations = this.enhancedAIManager.getModelRecommendations(context);

      return analysis;
    } catch (error) {
      console.error('[EnhancedIntegration] Enhanced AI analysis failed:', error);
      return { error: error.message };
    }
  }

  calculateSustainabilityScore(analysis) {
    let score = 100;
    
    // Penalize high energy consumption
    const energyPenalty = Math.min(50, analysis.totalAIEnergyConsumption * 2);
    score -= energyPenalty;
    
    // Penalize high carbon footprint
    const carbonPenalty = Math.min(30, analysis.totalCarbonFootprint * 5);
    score -= carbonPenalty;
    
    // Bonus for using efficient models
    const efficientModels = analysis.detectedModels.filter(m => 
      m.detection.model.category?.includes('efficient') || 
      m.detection.model.energy?.meanCombined < 1.0
    );
    const efficiencyBonus = Math.min(20, efficientModels.length * 5);
    score += efficiencyBonus;
    
    return Math.max(0, Math.min(100, score));
  }

  async getEnvironmentalImpact(timeRange = '24h') {
    return {
      session: this.sessionEnvironmentalImpact,
      sessionStats: this.enhancedAIManager?.getSessionStats() || {},
      carbonEquivalents: this.calculateCarbonEquivalents(),
      waterEquivalents: this.calculateWaterEquivalents(),
      energyEquivalents: this.calculateEnergyEquivalents()
    };
  }

  calculateCarbonEquivalents() {
    const totalCarbon = this.sessionEnvironmentalImpact.totalCarbongCO2e;
    
    return {
      driveDistance: totalCarbon * 0.217, // km driven in average car
      treesNeeded: totalCarbon / 21.77, // trees needed to offset per year
      coalBurned: totalCarbon * 0.000454, // kg of coal
      gasolineConsumed: totalCarbon * 0.000428 // liters of gasoline
    };
  }

  calculateWaterEquivalents() {
    const totalWater = this.sessionEnvironmentalImpact.totalWaterML;
    
    return {
      drinkingWater: totalWater / 2000, // days of drinking water
      showerTime: totalWater / (10 * 60), // minutes of shower
      toiletFlushes: totalWater / 6000, // toilet flushes
      washingMachine: totalWater / 50000 // washing machine loads
    };
  }

  calculateEnergyEquivalents() {
    const totalEnergy = this.sessionEnvironmentalImpact.totalEnergyWh;
    
    return {
      phoneCharges: totalEnergy / 0.0186, // smartphone charges
      ledBulbHours: totalEnergy / 0.01, // LED bulb hours
      laptopHours: totalEnergy / 45, // laptop usage hours
      tvHours: totalEnergy / 150 // TV viewing hours
    };
  }

  async getModelComparison(models, criteria = 'all') {
    if (!this.comparisonEngine) {
      return { error: 'Comparison engine not available' };
    }

    try {
      const comparison = this.comparisonEngine.compareModels(models, criteria);
      
      // Save comparison activity
      this.trackComparisonActivity(models, criteria);
      
      return comparison;
    } catch (error) {
      console.error('[EnhancedIntegration] Model comparison failed:', error);
      return { error: error.message };
    }
  }

  async getModelBenchmarks(metric = 'intelligence') {
    if (!this.comparisonEngine) {
      return { error: 'Comparison engine not available' };
    }

    try {
      return this.comparisonEngine.getBenchmarkComparison(metric);
    } catch (error) {
      console.error('[EnhancedIntegration] Benchmark comparison failed:', error);
      return { error: error.message };
    }
  }

  async getTrendingModels(timeframe = '7d') {
    if (!this.comparisonEngine) {
      return { error: 'Comparison engine not available' };
    }

    try {
      return this.comparisonEngine.getTrendingModels(timeframe);
    } catch (error) {
      console.error('[EnhancedIntegration] Trending models failed:', error);
      return { error: error.message };
    }
  }

  async exportComparisonData(models, format = 'json') {
    if (!this.comparisonEngine) {
      return { error: 'Comparison engine not available' };
    }

    try {
      const comparison = this.comparisonEngine.compareModels(models);
      return this.comparisonEngine.exportComparisonData(comparison, format);
    } catch (error) {
      console.error('[EnhancedIntegration] Export comparison failed:', error);
      return { error: error.message };
    }
  }

  async saveModelUsage(usage) {
    if (!this.comparisonEngine) {
      return { error: 'Comparison engine not available' };
    }

    try {
      this.comparisonEngine.saveUsageToHistory(usage);
      return { saved: true, timestamp: Date.now() };
    } catch (error) {
      console.error('[EnhancedIntegration] Save usage failed:', error);
      return { error: error.message };
    }
  }

  trackComparisonActivity(models, criteria) {
    try {
      // Track comparison activity for analytics
      const activity = {
        timestamp: Date.now(),
        type: 'model_comparison',
        models: models,
        criteria: criteria,
        userAgent: navigator.userAgent || 'unknown'
      };
      
      // Could store this for user behavior analysis
      console.log('[EnhancedIntegration] Comparison activity tracked:', activity);
    } catch (error) {
      console.warn('[EnhancedIntegration] Failed to track comparison activity:', error);
    }
  }

  async getSustainabilityInsights() {
    const impact = this.sessionEnvironmentalImpact;
    const insights = [];

    // Energy insights
    if (impact.totalEnergyWh > 10) {
      insights.push({
        type: 'high_energy',
        severity: 'warning',
        title: 'High AI Energy Consumption',
        description: `You've consumed ${impact.totalEnergyWh.toFixed(2)} Wh from AI services today.`,
        recommendation: 'Consider using more energy-efficient AI models for routine tasks.',
        action: 'switch_to_efficient_model'
      });
    }

    // Carbon insights
    if (impact.totalCarbongCO2e > 5) {
      insights.push({
        type: 'carbon_footprint',
        severity: 'info',
        title: 'Carbon Footprint Alert',
        description: `Your AI usage has generated ${impact.totalCarbongCO2e.toFixed(2)} gCO2e today.`,
        recommendation: 'This is equivalent to driving ' + (impact.totalCarbongCO2e * 0.217).toFixed(1) + ' km in a car.',
        action: 'optimize_for_carbon'
      });
    }

    // Water usage insights
    if (impact.totalWaterML > 50) {
      insights.push({
        type: 'water_usage',
        severity: 'info',
        title: 'Water Footprint',
        description: `AI services consumed ${impact.totalWaterML.toFixed(1)} mL of water for cooling.`,
        recommendation: 'Consider data centers with better water efficiency.',
        action: 'choose_green_providers'
      });
    }

    // Model efficiency insights
    const inefficientModels = Array.from(impact.modelUsageBreakdown.values())
      .filter(model => model.energy / model.queries > 5)
      .sort((a, b) => (b.energy / b.queries) - (a.energy / a.queries));

    if (inefficientModels.length > 0) {
      insights.push({
        type: 'model_efficiency',
        severity: 'suggestion',
        title: 'Model Efficiency Opportunity',
        description: `${inefficientModels[0].name} is consuming high energy per query.`,
        recommendation: 'Switch to a more efficient alternative for similar tasks.',
        action: 'suggest_alternatives',
        data: { currentModel: inefficientModels[0] }
      });
    }

    return insights;
  }

  async getCarbonFootprint(timeRange = '24h') {
    return {
      total: this.sessionEnvironmentalImpact.totalCarbongCO2e,
      breakdown: Array.from(this.sessionEnvironmentalImpact.modelUsageBreakdown.entries())
        .map(([key, data]) => ({
          model: data.name,
          company: data.company,
          carbon: data.carbon,
          percentage: (data.carbon / this.sessionEnvironmentalImpact.totalCarbongCO2e) * 100
        }))
        .sort((a, b) => b.carbon - a.carbon),
      equivalents: this.calculateCarbonEquivalents(),
      trend: 'stable' // Could calculate trend from historical data
    };
  }

  async getAIModelRecommendations(context = {}) {
    if (!this.enhancedAIManager) {
      return [];
    }

    // Enhance context with current system state
    const systemState = await this.getCurrentSystemState();
    const enhancedContext = {
      ...context,
      batteryLevel: systemState.batteryLevel.level,
      performancePreference: systemState.batteryLevel.level < 0.3 ? 'efficiency' : 'performance',
      useCase: context.useCase || 'general'
    };

    return this.enhancedAIManager.getModelRecommendations(enhancedContext);
  }

  async optimizeForSustainability(strategy = 'auto') {
    const results = {
      strategy,
      optimizations: [],
      estimatedSavings: {
        energy: 0,
        carbon: 0,
        water: 0
      },
      success: false
    };

    try {
      const currentAnalysis = await this.getEnhancedAIAnalysis();
      
      for (const modelData of currentAnalysis.detectedModels) {
        // Find more efficient alternative
        const alternatives = this.enhancedAIManager.getModelRecommendations({
          useCase: 'general',
          performancePreference: 'efficiency',
          batteryLevel: await this.getBatteryLevel()
        });

        if (alternatives.length > 0) {
          const currentModel = modelData.detection.model;
          const betterModel = alternatives[0];
          
          if (betterModel.key !== modelData.detection.modelKey) {
            const savings = {
              energy: currentModel.energy.meanCombined - (ENHANCED_AI_MODEL_DATABASE[betterModel.key]?.energy.meanCombined || 0),
              carbon: currentModel.carbon.meanCombined - (ENHANCED_AI_MODEL_DATABASE[betterModel.key]?.carbon.meanCombined || 0),
              water: currentModel.water.meanCombined - (ENHANCED_AI_MODEL_DATABASE[betterModel.key]?.water.meanCombined || 0)
            };

            if (savings.energy > 0) {
              results.optimizations.push({
                tabId: modelData.tabId,
                currentModel: currentModel.name,
                recommendedModel: betterModel.name,
                reason: betterModel.reason,
                savings
              });

              results.estimatedSavings.energy += savings.energy;
              results.estimatedSavings.carbon += savings.carbon;
              results.estimatedSavings.water += savings.water;
            }
          }
        }
      }

      results.success = results.optimizations.length > 0;
      
      if (results.success) {
        // Could send notifications to user about recommendations
        await this.showSustainabilityRecommendations(results);
      }

    } catch (error) {
      console.error('[EnhancedIntegration] Sustainability optimization failed:', error);
      results.error = error.message;
    }

    return results;
  }

  async showSustainabilityRecommendations(results) {
    try {
      if (chrome.notifications && results.optimizations.length > 0) {
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon-48.png',
          title: 'AI Sustainability Recommendations',
          message: `Found ${results.optimizations.length} opportunities to reduce your AI carbon footprint by ${results.estimatedSavings.carbon.toFixed(2)} gCO2e.`
        });
      }
    } catch (error) {
      console.log('[EnhancedIntegration] Sustainability notification failed:', error);
    }
  }

  async getRealTimeAIDetection(tabId) {
    if (!this.realTimeAIDetection || !this.enhancedAIManager) {
      return null;
    }

    try {
      const tabData = this.currentTabs.get(parseInt(tabId));
      if (!tabData) return null;

      const detection = this.enhancedAIManager.detectAIModel(
        tabData.url,
        tabData.title,
        '',
        {
          batteryLevel: await this.getBatteryLevel(),
          userActivity: this.calculateUserActivityLevel(),
          timestamp: Date.now()
        }
      );

      if (detection) {
        const usage = this.enhancedAIManager.estimateAIUsage(tabData, detection);
        return {
          ...detection,
          usage,
          realTime: true,
          timestamp: Date.now()
        };
      }

      return null;
    } catch (error) {
      console.error('[EnhancedIntegration] Real-time AI detection failed:', error);
      return null;
    }
  }

  async getEnhancedDashboardData() {
    try {
      const baseData = await this.getAgentDashboardData();
      const enhancedData = {
        ...baseData,
        enhanced: {
          enabled: this.enhancedTrackingEnabled,
          aiAnalysis: await this.getEnhancedAIAnalysis(),
          environmentalImpact: await this.getEnvironmentalImpact(),
          sustainabilityInsights: await this.getSustainabilityInsights(),
          carbonFootprint: await this.getCarbonFootprint(),
          sustainabilityScore: 0
        }
      };

      // Calculate overall sustainability score
      enhancedData.enhanced.sustainabilityScore = this.calculateSustainabilityScore(
        enhancedData.enhanced.aiAnalysis
      );

      return enhancedData;
    } catch (error) {
      console.error('[EnhancedIntegration] Enhanced dashboard data failed:', error);
      return { error: error.message };
    }
  }

  // Override processEnergyData to include enhanced AI analysis
  async processEnergyData(tabId, metrics) {
    // Call parent method first
    await super.processEnergyData(tabId, metrics);

    // Add enhanced AI analysis if enabled
    if (this.enhancedTrackingEnabled && this.enhancedAIManager) {
      try {
        const tabData = this.currentTabs.get(tabId);
        if (tabData) {
          const detection = await this.getRealTimeAIDetection(tabId);
          if (detection) {
            // Update environmental tracking
            this.updateSessionEnvironmentalImpact(detection.usage, detection);
          }
        }
      } catch (error) {
        console.warn('[EnhancedIntegration] Enhanced processing failed:', error);
      }
    }
  }

  // Enhanced cleanup
  async periodicCleanup() {
    await super.periodicCleanup();
    
    // Enhanced cleanup
    if (this.enhancedTrackingEnabled) {
      try {
        // Clean old model usage data
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        for (const [key, data] of this.sessionEnvironmentalImpact.modelUsageBreakdown.entries()) {
          if (data.lastUpdate && (now - data.lastUpdate) > maxAge) {
            this.sessionEnvironmentalImpact.modelUsageBreakdown.delete(key);
          }
        }
        
        // Enhanced AI manager cleanup
        if (this.enhancedAIManager && typeof this.enhancedAIManager.cleanup === 'function') {
          this.enhancedAIManager.cleanup();
        }
      } catch (error) {
        console.warn('[EnhancedIntegration] Enhanced cleanup failed:', error);
      }
    }
  }

  // Graceful shutdown
  destroy() {
    // Stop environmental tracking
    if (this.environmentalInterval) {
      clearInterval(this.environmentalInterval);
      this.environmentalInterval = null;
    }

    this.enhancedTrackingEnabled = false;
    console.log('[EnhancedIntegration] Enhanced tracking disabled');

    // Call parent destroy
    super.destroy();
  }
}

// Export the enhanced tracker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnergyTrackerEnhancedIntegration;
} else if (typeof window !== 'undefined') {
  window.EnergyTrackerEnhancedIntegration = EnergyTrackerEnhancedIntegration;
}