/**
 * Backend Power Calculator for AI Models
 * Calculates real-time backend power consumption based on enhanced AI energy database
 */

class BackendPowerCalculator {
  constructor(aiEnergyDatabase) {
    this.modelDatabase = aiEnergyDatabase || window.ENHANCED_AI_MODEL_DATABASE;
    this.queryEstimationCache = new Map();
    this.lastCalculationTime = 0;
    
    // User activity patterns for query rate estimation
    this.userActivityPatterns = {
      burstQueryRate: 1/3,        // 1 query per 3 seconds during intensive use
      activeSessionQueryRate: 1/30, // 1 query per 30 seconds when active
      backgroundQueryRate: 1/300,   // 1 query per 5 minutes in background  
      idleQueryRate: 0              // No queries when idle
    };
    
    // Model-specific processing characteristics
    this.processingPatterns = {
      'reasoning-specialized': { multiplier: 1.5, burstDuration: 120 }, // DeepSeek R1
      'frontier-large': { multiplier: 1.3, burstDuration: 90 },        // GPT-5, Grok-4
      'reasoning-focused': { multiplier: 1.2, burstDuration: 60 },     // Claude-4 Sonnet
      'efficient-medium': { multiplier: 0.8, burstDuration: 30 },     // GPT-5 Mini
      'ultra-efficient': { multiplier: 0.5, burstDuration: 15 }       // Llama-4 Maverick
    };
    
    console.log('[BackendPowerCalculator] Initialized with', Object.keys(this.modelDatabase || {}).length, 'AI models');
  }

  /**
   * Calculate real-time backend power consumption for detected AI model
   * @param {Object} detectedModel - Detected AI model with confidence
   * @param {Object} tabData - Current tab data
   * @param {Object} context - User activity context
   * @returns {number} Backend power consumption in watts
   */
  calculateBackendPower(detectedModel, tabData, context = {}) {
    if (!detectedModel || !detectedModel.model || !this.modelDatabase) {
      return 0;
    }
    
    const model = detectedModel.model;
    const energyPerQuery = model.energy.meanCombined; // Wh per query
    
    // Estimate current query rate based on user activity
    const queryRate = this.estimateCurrentQueryRate(detectedModel, tabData, context);
    
    // Calculate instantaneous backend power consumption
    // Power (W) = Energy per Query (Wh) × Query Rate (queries/hour)
    const backendPowerW = energyPerQuery * queryRate;
    
    // Apply confidence scaling and model-specific adjustments
    const confidence = detectedModel.confidence || 0.7;
    const modelAdjustment = this.getModelPowerAdjustment(model, context);
    const adjustedPower = backendPowerW * confidence * modelAdjustment;
    
    // Log calculation for debugging
    if (adjustedPower > 0.1) {
      console.log('[BackendPowerCalculator] Power calculation:', {
        model: model.name,
        energyPerQuery: energyPerQuery.toFixed(3) + ' Wh',
        queryRate: queryRate.toFixed(4) + ' queries/hour',
        rawPower: backendPowerW.toFixed(2) + 'W',
        confidence: confidence,
        adjustment: modelAdjustment,
        finalPower: adjustedPower.toFixed(2) + 'W'
      });
    }
    
    return Math.max(0, adjustedPower);
  }

  /**
   * Estimate current query rate based on user activity and model characteristics
   * @param {Object} detectedModel - Detected AI model
   * @param {Object} tabData - Current tab data
   * @param {Object} context - User activity context
   * @returns {number} Estimated queries per hour
   */
  estimateCurrentQueryRate(detectedModel, tabData, context) {
    const model = detectedModel.model;
    const userActivity = this.calculateUserActivityLevel(tabData, context);
    const modelCategory = model.category || 'balanced-performance';
    
    // Base query rate based on user activity level
    let baseQueryRate = 0;
    
    if (userActivity > 0.8) {
      // High activity - user is actively using AI
      baseQueryRate = this.userActivityPatterns.burstQueryRate * 3600; // Convert to per-hour
    } else if (userActivity > 0.5) {
      // Medium activity - regular AI usage
      baseQueryRate = this.userActivityPatterns.activeSessionQueryRate * 3600;
    } else if (userActivity > 0.2) {
      // Low activity - background processing
      baseQueryRate = this.userActivityPatterns.backgroundQueryRate * 3600;
    } else {
      // Idle - minimal or no queries
      baseQueryRate = this.userActivityPatterns.idleQueryRate;
    }
    
    // Apply model-specific processing patterns
    const processingPattern = this.processingPatterns[modelCategory] || { multiplier: 1.0 };
    const modelAdjustedRate = baseQueryRate * processingPattern.multiplier;
    
    // Apply time-based burst detection
    const burstMultiplier = this.calculateBurstMultiplier(context, processingPattern);
    const finalQueryRate = modelAdjustedRate * burstMultiplier;
    
    return Math.max(0, finalQueryRate);
  }

  /**
   * Calculate user activity level from available context
   * @param {Object} tabData - Current tab data
   * @param {Object} context - User activity context
   * @returns {number} Activity level from 0.0 to 1.0
   */
  calculateUserActivityLevel(tabData, context) {
    let activityLevel = 0.5; // Default moderate activity
    
    // Duration-based activity assessment
    const duration = tabData?.duration || 0;
    const minutes = duration / 60000;
    if (minutes > 30) activityLevel += 0.1;
    if (minutes > 60) activityLevel += 0.1;
    if (minutes > 120) activityLevel += 0.1;
    
    // Context-based adjustments
    if (context.userEngagement === 'high') activityLevel += 0.3;
    else if (context.userEngagement === 'low') activityLevel -= 0.2;
    
    if (context.isActiveTab) activityLevel += 0.2;
    
    // Recent activity indicators
    const now = Date.now();
    const lastActivity = tabData?.timestamp || now;
    const timeSinceActivity = now - lastActivity;
    
    if (timeSinceActivity < 10000) activityLevel += 0.2;      // Very recent activity
    else if (timeSinceActivity < 60000) activityLevel += 0.1; // Recent activity
    else if (timeSinceActivity > 300000) activityLevel -= 0.3; // Old activity
    
    // Battery level influence (users are less active on low battery)
    if (context.batteryLevel !== undefined) {
      if (context.batteryLevel < 0.2) activityLevel *= 0.6;  // Very low battery
      else if (context.batteryLevel < 0.3) activityLevel *= 0.8; // Low battery
      else if (context.batteryLevel > 0.8) activityLevel *= 1.1; // High battery
    }
    
    return Math.max(0.0, Math.min(1.0, activityLevel));
  }

  /**
   * Calculate burst multiplier for intensive AI usage periods
   * @param {Object} context - User activity context
   * @param {Object} processingPattern - Model processing pattern
   * @returns {number} Burst multiplier
   */
  calculateBurstMultiplier(context, processingPattern) {
    const now = Date.now();
    const timeSinceLastCalc = now - this.lastCalculationTime;
    this.lastCalculationTime = now;
    
    // Detect rapid successive calculations (indicates burst usage)
    if (timeSinceLastCalc < 5000 && context.userEngagement === 'high') {
      return 2.0; // Burst multiplier
    }
    
    // Check for AI-specific burst indicators
    if (context.isActiveTab && context.userActivity > 0.7) {
      return 1.5; // Moderate burst
    }
    
    return 1.0; // Normal usage
  }

  /**
   * Get model-specific power adjustment factors
   * @param {Object} model - AI model data
   * @param {Object} context - User context
   * @returns {number} Power adjustment multiplier
   */
  getModelPowerAdjustment(model, context) {
    let adjustment = 1.0;
    
    // Model size adjustments
    if (model.size === 'Large') adjustment *= 1.2;
    else if (model.size === 'Medium') adjustment *= 1.0;
    else if (model.size === 'Micro') adjustment *= 0.7;
    
    // Performance mode adjustments
    if (context.performanceMode === 'performance') adjustment *= 1.3;
    else if (context.performanceMode === 'efficient') adjustment *= 0.8;
    
    // Context window utilization (larger contexts use more power)
    const contextWindow = model.contextWindow || 100000;
    if (contextWindow > 500000) adjustment *= 1.1;      // Very large context
    else if (contextWindow > 200000) adjustment *= 1.05; // Large context
    
    // Hardware efficiency factors
    const hardware = model.hardware;
    if (hardware) {
      const pue = hardware.pue || 1.2;
      const gpuPower = hardware.gpuPowerDraw || 5.6;
      
      // Higher PUE = less efficient datacenter
      adjustment *= pue / 1.2; // Normalize around 1.2
      
      // Higher GPU power draw = more power consumption
      adjustment *= gpuPower / 5.6; // Normalize around 5.6W
    }
    
    return Math.max(0.5, Math.min(2.0, adjustment));
  }

  /**
   * Get backend power estimate for a specific model by name
   * @param {string} modelName - Name of the AI model
   * @param {Object} context - Usage context
   * @returns {Object} Power estimate with details
   */
  getModelPowerEstimate(modelName, context = {}) {
    const modelEntry = Object.entries(this.modelDatabase || {})
      .find(([key, model]) => model.name.toLowerCase().includes(modelName.toLowerCase()));
    
    if (!modelEntry) {
      return { power: 0, error: 'Model not found' };
    }
    
    const [modelKey, model] = modelEntry;
    const detectedModel = {
      modelKey,
      model,
      confidence: 1.0
    };
    
    const tabData = { duration: 1800000, timestamp: Date.now() }; // 30 min default
    const defaultContext = { userEngagement: 'medium', isActiveTab: true, ...context };
    
    const power = this.calculateBackendPower(detectedModel, tabData, defaultContext);
    
    return {
      power,
      model: model.name,
      category: model.category,
      energyPerQuery: model.energy.meanCombined,
      details: {
        company: model.company,
        size: model.size,
        intelligence: model.aiIntelligenceIndex
      }
    };
  }

  /**
   * Get comparison of backend power consumption across all models
   * @param {Object} context - Usage context
   * @returns {Array} Sorted array of models with power estimates
   */
  getAllModelPowerEstimates(context = {}) {
    const estimates = [];
    
    for (const [modelKey, model] of Object.entries(this.modelDatabase || {})) {
      const detectedModel = { modelKey, model, confidence: 1.0 };
      const tabData = { duration: 1800000, timestamp: Date.now() };
      const defaultContext = { userEngagement: 'medium', isActiveTab: true, ...context };
      
      const power = this.calculateBackendPower(detectedModel, tabData, defaultContext);
      
      estimates.push({
        name: model.name,
        company: model.company,
        category: model.category,
        power: power,
        energyPerQuery: model.energy.meanCombined,
        intelligence: model.aiIntelligenceIndex,
        efficiency: power > 0 ? model.aiIntelligenceIndex / power : 0
      });
    }
    
    // Sort by power consumption (ascending)
    return estimates.sort((a, b) => a.power - b.power);
  }

  /**
   * Clean up cache and temporary data
   */
  cleanup() {
    this.queryEstimationCache.clear();
    this.lastCalculationTime = 0;
    console.log('[BackendPowerCalculator] Cache cleaned up');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackendPowerCalculator;
} else if (typeof window !== 'undefined') {
  window.BackendPowerCalculator = BackendPowerCalculator;
}