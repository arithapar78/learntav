/**
 * Enhanced Query Estimation System
 * Uses model characteristics, user behavior patterns, and statistical modeling
 * to provide accurate query count estimations for AI energy tracking
 */

/**
 * Advanced Query Estimation Engine
 * Provides sophisticated query count predictions based on multiple factors
 */
class EnhancedQueryEstimationEngine {
  constructor(aiModelDatabase) {
    this.modelDatabase = aiModelDatabase;
    this.userBehaviorCache = new Map();
    this.temporalPatterns = new Map();
    this.queryComplexityModel = new QueryComplexityAnalyzer();
    this.statisticalModels = new StatisticalQueryModels();
    this.confidenceThreshold = 0.7;
    
    // Initialize pattern learning
    this.initializePatternLearning();
  }

  initializePatternLearning() {
    try {
      // Load historical patterns from storage
      this.loadHistoricalPatterns();
      
      // Initialize behavior tracking
      this.setupBehaviorTracking();
      
      console.log('[EnhancedQueryEstimation] Pattern learning initialized');
    } catch (error) {
      console.warn('[EnhancedQueryEstimation] Pattern learning initialization failed:', error);
    }
  }

  /**
   * Main query estimation method with enhanced accuracy
   */
  estimateQueries(tabData, detectedModel, context = {}) {
    try {
      if (!detectedModel || !tabData) {
        return this.getDefaultEstimate(tabData, context);
      }

      const { model, confidence: detectionConfidence } = detectedModel;
      
      // Multi-layered estimation approach
      const estimations = {
        baseline: this.calculateBaselineQueries(tabData, model, context),
        behavioral: this.calculateBehavioralQueries(tabData, model, context),
        temporal: this.calculateTemporalQueries(tabData, model, context),
        complexity: this.calculateComplexityBasedQueries(tabData, model, context),
        statistical: this.calculateStatisticalQueries(tabData, model, context)
      };

      // Weight and combine estimations
      const finalEstimate = this.combineEstimations(estimations, model, detectionConfidence);
      
      // Add uncertainty quantification
      const uncertainty = this.calculateUncertainty(estimations, finalEstimate);
      
      // Store for learning
      this.recordEstimation(tabData, model, finalEstimate, context);
      
      return {
        queries: Math.max(1, Math.round(finalEstimate)),
        confidence: this.calculateEstimationConfidence(estimations, uncertainty),
        uncertainty: uncertainty,
        breakdown: estimations,
        method: 'enhanced-multi-layer'
      };
      
    } catch (error) {
      console.error('[EnhancedQueryEstimation] Estimation failed:', error);
      return this.getDefaultEstimate(tabData, context);
    }
  }

  /**
   * Calculate baseline queries based on time and basic interaction patterns
   */
  calculateBaselineQueries(tabData, model, context) {
    const duration = tabData.duration || 0;
    const minutes = duration / 60000;
    
    // Model-specific base rate adjustments
    let baseRate = this.getModelBaseRate(model);
    
    // Duration-based scaling with diminishing returns
    const timeBasedQueries = this.calculateTimeBasedQueries(minutes, baseRate);
    
    // Basic interaction multiplier
    const interactionMultiplier = this.calculateInteractionMultiplier(tabData, context);
    
    return timeBasedQueries * interactionMultiplier;
  }

  /**
   * Calculate queries based on learned user behavior patterns
   */
  calculateBehavioralQueries(tabData, model, context) {
    const userSignature = this.getUserSignature(context);
    const behaviorPattern = this.userBehaviorCache.get(userSignature);
    
    if (!behaviorPattern) {
      return this.calculateBaselineQueries(tabData, model, context);
    }
    
    // Apply learned behavior patterns
    const patternMultiplier = this.calculatePatternMultiplier(behaviorPattern, model, context);
    const baseQueries = this.calculateBaselineQueries(tabData, model, context);
    
    return baseQueries * patternMultiplier;
  }

  /**
   * Calculate queries based on temporal patterns (time of day, day of week, etc.)
   */
  calculateTemporalQueries(tabData, model, context) {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Time-based activity multipliers
    let temporalMultiplier = 1.0;
    
    // Business hours vs off-hours
    if (hour >= 9 && hour <= 17 && !isWeekend) {
      temporalMultiplier *= 1.3; // Higher activity during business hours
    } else if (hour >= 20 || hour <= 6) {
      temporalMultiplier *= 0.7; // Lower activity during night hours
    }
    
    // Weekend patterns
    if (isWeekend) {
      temporalMultiplier *= 0.8; // Generally lower AI usage on weekends
    }
    
    // Load historical temporal patterns
    const historicalPattern = this.getHistoricalTemporalPattern(hour, dayOfWeek);
    if (historicalPattern) {
      temporalMultiplier *= historicalPattern.multiplier;
    }
    
    const baseQueries = this.calculateBaselineQueries(tabData, model, context);
    return baseQueries * temporalMultiplier;
  }

  /**
   * Calculate queries based on estimated interaction complexity
   */
  calculateComplexityBasedQueries(tabData, model, context) {
    // Analyze complexity indicators
    const complexityFactors = {
      domComplexity: this.analyzeDOMComplexity(tabData),
      userInteractionComplexity: this.analyzeInteractionComplexity(tabData, context),
      modelCapabilityMatch: this.analyzeModelCapabilityMatch(model, context),
      taskTypeComplexity: this.analyzeTaskComplexity(context)
    };
    
    // Calculate complexity score
    const complexityScore = this.calculateComplexityScore(complexityFactors);
    
    // Model-specific complexity handling
    const complexityMultiplier = this.getComplexityMultiplier(model, complexityScore);
    
    const baseQueries = this.calculateBaselineQueries(tabData, model, context);
    return baseQueries * complexityMultiplier;
  }

  /**
   * Calculate queries using statistical models and confidence intervals
   */
  calculateStatisticalQueries(tabData, model, context) {
    // Use statistical models for prediction
    const features = this.extractFeatures(tabData, model, context);
    const prediction = this.statisticalModels.predict(features);
    
    if (prediction.confidence < this.confidenceThreshold) {
      return this.calculateBaselineQueries(tabData, model, context);
    }
    
    return prediction.value;
  }

  /**
   * Get model-specific base query rate per minute
   */
  getModelBaseRate(model) {
    const baseRates = {
      'frontier-large': 0.3,        // High-end models, fewer but complex queries
      'reasoning-specialized': 0.2,  // Specialized reasoning models
      'reasoning-focused': 0.25,
      'reasoning-optimized': 0.2,
      'efficient-reasoning': 0.4,   // Efficient models, more frequent queries
      'large-multimodal': 0.15,     // Complex multimodal, fewer queries
      'large-language': 0.3,
      'medium-language': 0.45,
      'small-language': 0.6,        // Small models, frequent queries
      'efficient-medium': 0.5,
      'efficient-large': 0.4,
      'ultra-efficient': 0.8,       // Very efficient, very frequent
      'balanced-performance': 0.35,
      'high-capability': 0.25,
      'image-generation': 0.1       // Image generation, very infrequent
    };
    
    const category = model.category || 'medium-language';
    let baseRate = baseRates[category] || 0.35;
    
    // Adjust based on intelligence index
    const intelligence = model.aiIntelligenceIndex || 50;
    const intelligenceMultiplier = Math.max(0.5, Math.min(1.5, 100 / intelligence));
    
    // Adjust based on performance metrics
    const performance = model.performance;
    if (performance && performance.medianTokensPerSecond) {
      const speedMultiplier = Math.max(0.7, Math.min(1.3, performance.medianTokensPerSecond / 100));
      baseRate *= speedMultiplier;
    }
    
    return baseRate * intelligenceMultiplier;
  }

  /**
   * Calculate time-based queries with diminishing returns
   */
  calculateTimeBasedQueries(minutes, baseRate) {
    if (minutes <= 0) return 1;
    
    // Logarithmic scaling for diminishing returns over time
    // More active in first few minutes, then tapers off
    const saturationPoint = 30; // minutes
    const scalingFactor = Math.log(minutes / saturationPoint + 1) / Math.log(2);
    
    return Math.max(1, minutes * baseRate * scalingFactor);
  }

  /**
   * Calculate interaction-based multiplier
   */
  calculateInteractionMultiplier(tabData, context) {
    let multiplier = 1.0;
    
    // DOM interaction indicators
    const domNodes = tabData.domNodes || 0;
    if (domNodes > 0) {
      // More complex pages may indicate more sophisticated usage
      multiplier += Math.min(0.3, domNodes / 10000);
    }
    
    // Active tab bonus
    if (context.isActiveTab) {
      multiplier *= 1.4;
    }
    
    // User engagement level
    const engagement = context.userEngagement || 'medium';
    const engagementMultipliers = {
      'low': 0.6,
      'medium': 1.0,
      'high': 1.6,
      'very-high': 2.2
    };
    multiplier *= engagementMultipliers[engagement];
    
    // Battery level considerations (users may be more conservative on low battery)
    if (context.batteryLevel !== undefined) {
      if (context.batteryLevel < 0.2) {
        multiplier *= 0.7;
      } else if (context.batteryLevel < 0.5) {
        multiplier *= 0.85;
      }
    }
    
    return multiplier;
  }

  /**
   * Combine multiple estimation methods with intelligent weighting
   */
  combineEstimations(estimations, model, detectionConfidence) {
    // Dynamic weights based on confidence and model characteristics
    const weights = this.calculateEstimationWeights(model, detectionConfidence);
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(estimations).forEach(([method, estimate]) => {
      const weight = weights[method] || 1.0;
      weightedSum += estimate * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : estimations.baseline;
  }

  /**
   * Calculate estimation weights based on model and context
   */
  calculateEstimationWeights(model, detectionConfidence) {
    const baseWeights = {
      baseline: 1.0,
      behavioral: 0.8,
      temporal: 0.6,
      complexity: 0.9,
      statistical: 1.2
    };
    
    // Adjust weights based on detection confidence
    if (detectionConfidence < 0.6) {
      baseWeights.baseline *= 1.5; // Rely more on baseline when uncertain
      baseWeights.statistical *= 0.5;
    }
    
    // Adjust weights based on model maturity/data availability
    const intelligence = model.aiIntelligenceIndex || 50;
    if (intelligence > 60) {
      baseWeights.complexity *= 1.3; // More complex models benefit from complexity analysis
    }
    
    return baseWeights;
  }

  /**
   * Calculate estimation confidence
   */
  calculateEstimationConfidence(estimations, uncertainty) {
    // Calculate variance across estimations
    const values = Object.values(estimations);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    // Lower variance = higher confidence
    const varianceConfidence = Math.max(0.3, 1 - Math.min(1.0, variance / mean));
    
    // Factor in uncertainty
    const uncertaintyConfidence = Math.max(0.3, 1 - uncertainty);
    
    return (varianceConfidence + uncertaintyConfidence) / 2;
  }

  /**
   * Calculate uncertainty in the estimation
   */
  calculateUncertainty(estimations, finalEstimate) {
    const values = Object.values(estimations);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate coefficient of variation
    if (mean === 0) return 1.0;
    
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    return Math.min(1.0, stdDev / mean);
  }

  /**
   * Analyze DOM complexity for query estimation
   */
  analyzeDOMComplexity(tabData) {
    const domNodes = tabData.domNodes || 0;
    
    if (domNodes < 500) return 'simple';
    if (domNodes < 2000) return 'moderate';
    if (domNodes < 5000) return 'complex';
    return 'very-complex';
  }

  /**
   * Analyze interaction complexity patterns
   */
  analyzeInteractionComplexity(tabData, context) {
    let complexityScore = 1.0;
    
    // Duration-based complexity
    const duration = tabData.duration || 0;
    const minutes = duration / 60000;
    
    if (minutes > 20) complexityScore += 0.5;
    if (minutes > 60) complexityScore += 0.3;
    
    // Engagement-based complexity
    const engagement = context.userEngagement || 'medium';
    const engagementScores = {
      'low': 0.3,
      'medium': 1.0,
      'high': 1.5,
      'very-high': 2.0
    };
    
    complexityScore *= engagementScores[engagement];
    
    return Math.min(3.0, complexityScore);
  }

  /**
   * Analyze how well the model matches the task complexity
   */
  analyzeModelCapabilityMatch(model, context) {
    const intelligence = model.aiIntelligenceIndex || 50;
    const taskComplexity = context.taskComplexity || 'medium';
    
    const complexityRequirements = {
      'simple': 30,
      'medium': 50,
      'complex': 70,
      'very-complex': 85
    };
    
    const required = complexityRequirements[taskComplexity];
    const capability = intelligence;
    
    // Return match score (1.0 = perfect match)
    if (capability >= required) {
      return Math.max(0.8, 1 - (capability - required) / 100);
    } else {
      return Math.max(0.3, capability / required);
    }
  }

  /**
   * Analyze task complexity from context clues
   */
  analyzeTaskComplexity(context) {
    // This would ideally analyze the actual content/context
    // For now, use heuristics based on available context
    
    let complexityScore = 1.0;
    
    // User activity indicators
    if (context.userActivity > 0.8) complexityScore += 0.5;
    if (context.performanceMode === 'performance') complexityScore += 0.3;
    if (context.batteryLevel && context.batteryLevel > 0.8) complexityScore += 0.2;
    
    return Math.min(2.0, complexityScore);
  }

  /**
   * Calculate overall complexity score from factors
   */
  calculateComplexityScore(factors) {
    const weights = {
      domComplexity: 0.2,
      userInteractionComplexity: 0.3,
      modelCapabilityMatch: 0.3,
      taskTypeComplexity: 0.2
    };
    
    let weightedScore = 0;
    let totalWeight = 0;
    
    Object.entries(factors).forEach(([factor, value]) => {
      const weight = weights[factor] || 1.0;
      const numericValue = typeof value === 'number' ? value : this.convertToNumeric(value);
      
      weightedScore += numericValue * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? weightedScore / totalWeight : 1.0;
  }

  /**
   * Convert qualitative values to numeric scores
   */
  convertToNumeric(value) {
    if (typeof value === 'number') return value;
    
    const conversions = {
      'simple': 0.5, 'low': 0.3,
      'moderate': 1.0, 'medium': 1.0,
      'complex': 1.5, 'high': 1.5,
      'very-complex': 2.0, 'very-high': 2.0
    };
    
    return conversions[value] || 1.0;
  }

  /**
   * Get complexity multiplier for specific model
   */
  getComplexityMultiplier(model, complexityScore) {
    // Different model types handle complexity differently
    const category = model.category || 'medium-language';
    
    const categoryMultipliers = {
      'ultra-efficient': Math.min(1.5, 0.8 + complexityScore * 0.3),
      'efficient-reasoning': Math.min(2.0, 0.7 + complexityScore * 0.4),
      'reasoning-specialized': Math.min(2.5, 0.6 + complexityScore * 0.6),
      'frontier-large': Math.min(3.0, 0.5 + complexityScore * 0.8)
    };
    
    return categoryMultipliers[category] || (0.8 + complexityScore * 0.4);
  }

  /**
   * Extract features for statistical modeling
   */
  extractFeatures(tabData, model, context) {
    return {
      duration: tabData.duration || 0,
      domNodes: tabData.domNodes || 0,
      modelIntelligence: model.aiIntelligenceIndex || 50,
      modelCategory: this.encodeCategoryAsNumber(model.category),
      userEngagement: this.encodeEngagementAsNumber(context.userEngagement),
      batteryLevel: context.batteryLevel || 0.5,
      isActiveTab: context.isActiveTab ? 1 : 0,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      performanceMode: this.encodePerformanceModeAsNumber(context.performanceMode)
    };
  }

  encodeCategoryAsNumber(category) {
    const categoryMap = {
      'ultra-efficient': 1, 'efficient-small': 2, 'efficient-medium': 3,
      'efficient-large': 4, 'medium-language': 5, 'large-language': 6,
      'frontier-large': 7, 'reasoning-optimized': 8, 'reasoning-specialized': 9
    };
    return categoryMap[category] || 5;
  }

  encodeEngagementAsNumber(engagement) {
    const engagementMap = {
      'low': 1, 'medium': 2, 'high': 3, 'very-high': 4
    };
    return engagementMap[engagement] || 2;
  }

  encodePerformanceModeAsNumber(mode) {
    const modeMap = {
      'efficient': 1, 'balanced': 2, 'performance': 3
    };
    return modeMap[mode] || 2;
  }

  /**
   * Get user signature for behavior tracking
   */
  getUserSignature(context) {
    // Create a signature based on available context
    // This would ideally use more sophisticated user identification
    const batteryRange = context.batteryLevel ? Math.floor(context.batteryLevel * 4) : 2;
    const timeRange = Math.floor(new Date().getHours() / 6);
    
    return `user_${batteryRange}_${timeRange}_${context.performanceMode || 'balanced'}`;
  }

  /**
   * Load historical patterns from storage
   */
  loadHistoricalPatterns() {
    try {
      // This would load from chrome.storage or localStorage
      const patterns = localStorage.getItem('query_estimation_patterns');
      if (patterns) {
        const parsed = JSON.parse(patterns);
        Object.entries(parsed).forEach(([key, value]) => {
          this.temporalPatterns.set(key, value);
        });
      }
    } catch (error) {
      console.warn('[EnhancedQueryEstimation] Failed to load historical patterns:', error);
    }
  }

  /**
   * Setup behavior tracking for pattern learning
   */
  setupBehaviorTracking() {
    // Initialize behavior tracking structures
    this.behaviorTrackingEnabled = true;
    this.recentEstimations = [];
    this.maxRecentEstimations = 100;
  }

  /**
   * Record estimation for learning and improvement
   */
  recordEstimation(tabData, model, estimate, context) {
    if (!this.behaviorTrackingEnabled) return;
    
    const record = {
      timestamp: Date.now(),
      modelName: model.name,
      modelCategory: model.category,
      estimate: estimate,
      duration: tabData.duration,
      context: {
        batteryLevel: context.batteryLevel,
        userEngagement: context.userEngagement,
        timeOfDay: new Date().getHours(),
        isActiveTab: context.isActiveTab
      }
    };
    
    this.recentEstimations.push(record);
    
    // Maintain size limit
    if (this.recentEstimations.length > this.maxRecentEstimations) {
      this.recentEstimations = this.recentEstimations.slice(-this.maxRecentEstimations);
    }
    
    // Periodically save to storage
    if (this.recentEstimations.length % 10 === 0) {
      this.saveEstimationPatterns();
    }
  }

  /**
   * Save estimation patterns for future use
   */
  saveEstimationPatterns() {
    try {
      // Analyze recent estimations for patterns
      const patterns = this.analyzeEstimationPatterns();
      
      // Save to storage
      localStorage.setItem('query_estimation_patterns', JSON.stringify(patterns));
    } catch (error) {
      console.warn('[EnhancedQueryEstimation] Failed to save estimation patterns:', error);
    }
  }

  /**
   * Analyze recent estimations to learn patterns
   */
  analyzeEstimationPatterns() {
    // This would implement pattern analysis algorithms
    // For now, return basic statistics
    
    const patterns = {};
    
    // Group by time of day
    const hourlyGroups = {};
    this.recentEstimations.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      if (!hourlyGroups[hour]) hourlyGroups[hour] = [];
      hourlyGroups[hour].push(record);
    });
    
    // Calculate hourly averages
    Object.entries(hourlyGroups).forEach(([hour, records]) => {
      const avgEstimate = records.reduce((sum, r) => sum + r.estimate, 0) / records.length;
      patterns[`hour_${hour}`] = {
        averageQueries: avgEstimate,
        sampleSize: records.length,
        multiplier: avgEstimate / 1.0 // Base multiplier
      };
    });
    
    return patterns;
  }

  /**
   * Get historical temporal pattern for specific time
   */
  getHistoricalTemporalPattern(hour, dayOfWeek) {
    const key = `hour_${hour}`;
    return this.temporalPatterns.get(key) || null;
  }

  /**
   * Get default estimate when enhanced estimation fails
   */
  getDefaultEstimate(tabData, context) {
    const duration = tabData?.duration || 0;
    const minutes = duration / 60000;
    const baseQueries = Math.max(1, Math.floor(minutes * 0.4)); // Conservative default
    
    return {
      queries: baseQueries,
      confidence: 0.5,
      uncertainty: 0.8,
      method: 'fallback-default'
    };
  }
}

/**
 * Query Complexity Analyzer
 * Analyzes interaction patterns to determine query complexity
 */
class QueryComplexityAnalyzer {
  constructor() {
    this.complexityPatterns = new Map();
    this.initializePatterns();
  }

  initializePatterns() {
    // Initialize known complexity patterns
    this.complexityPatterns.set('code_generation', {
      indicators: ['github.com', 'stackoverflow.com', 'editor', 'code'],
      multiplier: 1.5,
      baseComplexity: 'high'
    });
    
    this.complexityPatterns.set('research', {
      indicators: ['scholar.google', 'arxiv', 'research', 'paper'],
      multiplier: 1.3,
      baseComplexity: 'medium-high'
    });
    
    this.complexityPatterns.set('creative_writing', {
      indicators: ['docs.google', 'write', 'document', 'essay'],
      multiplier: 1.2,
      baseComplexity: 'medium'
    });
  }

  analyzeComplexity(tabData, context) {
    // Analyze URL, title, and context for complexity indicators
    const url = tabData.url || '';
    const title = tabData.title || '';
    
    let maxComplexity = 'simple';
    let maxMultiplier = 1.0;
    
    for (const [patternName, pattern] of this.complexityPatterns) {
      if (pattern.indicators.some(indicator => 
        url.toLowerCase().includes(indicator) || 
        title.toLowerCase().includes(indicator))) {
        
        if (this.compareComplexity(pattern.baseComplexity, maxComplexity) > 0) {
          maxComplexity = pattern.baseComplexity;
          maxMultiplier = pattern.multiplier;
        }
      }
    }
    
    return {
      complexity: maxComplexity,
      multiplier: maxMultiplier,
      confidence: 0.7
    };
  }

  compareComplexity(complexity1, complexity2) {
    const complexityOrder = ['simple', 'medium', 'medium-high', 'high', 'very-high'];
    const index1 = complexityOrder.indexOf(complexity1);
    const index2 = complexityOrder.indexOf(complexity2);
    return index1 - index2;
  }
}

/**
 * Statistical Query Models
 * Implements statistical models for query prediction
 */
class StatisticalQueryModels {
  constructor() {
    this.models = new Map();
    this.initializeModels();
  }

  initializeModels() {
    // Initialize simple regression models
    // In a real implementation, these would be trained models
    this.models.set('linear_regression', {
      coefficients: {
        duration: 0.0003, // queries per millisecond
        domNodes: 0.00005, // queries per DOM node
        modelIntelligence: -0.01, // higher intelligence = fewer queries needed
        userEngagement: 0.3 // engagement multiplier
      },
      intercept: 0.5
    });
  }

  predict(features) {
    const model = this.models.get('linear_regression');
    if (!model) {
      return { value: 1, confidence: 0.3 };
    }
    
    let prediction = model.intercept;
    
    Object.entries(model.coefficients).forEach(([feature, coefficient]) => {
      if (features.hasOwnProperty(feature)) {
        prediction += features[feature] * coefficient;
      }
    });
    
    // Ensure positive prediction
    prediction = Math.max(0.1, prediction);
    
    // Calculate confidence based on feature completeness
    const availableFeatures = Object.keys(features).length;
    const expectedFeatures = Object.keys(model.coefficients).length;
    const confidence = Math.min(0.9, availableFeatures / expectedFeatures);
    
    return {
      value: prediction,
      confidence: confidence
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EnhancedQueryEstimationEngine,
    QueryComplexityAnalyzer,
    StatisticalQueryModels
  };
} else if (typeof window !== 'undefined') {
  window.EnhancedQueryEstimationEngine = EnhancedQueryEstimationEngine;
  window.QueryComplexityAnalyzer = QueryComplexityAnalyzer;
  window.StatisticalQueryModels = StatisticalQueryModels;
}