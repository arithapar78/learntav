/**
 * Deterministic Predictor - Statistical prediction without AI APIs
 * Uses time series analysis, pattern matching, and mathematical models
 */
class DeterministicPredictor {
  constructor() {
    this.historicalData = [];
    this.patterns = new Map();
    this.seasonality = new SeasonalityAnalyzer();
    this.trends = new TrendAnalyzer();
    this.models = new Map();
    this.predictionAccuracy = 0.7; // Track accuracy over time
    this.initializeModels();
  }

  initializeModels() {
    // Initialize statistical models
    this.models.set('linearRegression', new LinearRegressionModel());
    this.models.set('movingAverage', new MovingAverageModel());
    this.models.set('exponentialSmoothing', new ExponentialSmoothingModel());
    this.models.set('seasonalDecomposition', new SeasonalDecompositionModel());
  }

  async predictNext30Minutes(recentData) {
    if (!recentData || recentData.length < 3) {
      return this.getDefaultPrediction();
    }

    const predictions = {
      energyConsumption: await this.predictEnergyConsumption(recentData),
      userBehavior: await this.predictUserBehavior(recentData),
      systemLoad: await this.predictSystemLoad(recentData),
      optimizationOpportunities: await this.predictOptimizationOpportunities(recentData)
    };

    return {
      predictions,
      confidence: this.calculatePredictionConfidence(predictions),
      timeHorizon: 30, // minutes
      methodology: 'statistical_analysis',
      generatedAt: Date.now()
    };
  }

  async predictEnergyConsumption(data) {
    // Time series analysis of energy consumption
    const timeSeries = this.extractEnergyTimeSeries(data);
    
    if (timeSeries.length < 5) {
      return this.getSimpleEnergyPrediction(data);
    }

    // Apply multiple models and ensemble
    const linearPrediction = await this.models.get('linearRegression').predict(timeSeries);
    const movingAvgPrediction = await this.models.get('movingAverage').predict(timeSeries);
    const exponentialPrediction = await this.models.get('exponentialSmoothing').predict(timeSeries);
    
    // Ensemble prediction with weights based on recent performance
    const ensemblePrediction = this.ensemblePredictions([
      { prediction: linearPrediction, weight: 0.3 },
      { prediction: movingAvgPrediction, weight: 0.4 },
      { prediction: exponentialPrediction, weight: 0.3 }
    ]);

    // Apply seasonality adjustments
    const seasonalAdjustment = await this.seasonality.getAdjustment(new Date());
    const adjustedPrediction = ensemblePrediction * seasonalAdjustment;

    return {
      predicted30MinConsumption: Math.max(5, Math.min(adjustedPrediction, 100)), // Clamp to reasonable range
      trendDirection: this.trends.getTrendDirection(timeSeries),
      volatility: this.trends.calculateVolatility(timeSeries),
      confidence: this.calculateEnergyPredictionConfidence(timeSeries),
      factors: this.identifyInfluencingFactors(data)
    };
  }

  async predictUserBehavior(data) {
    const behaviorHistory = this.extractBehaviorHistory(data);
    
    // Pattern matching based on historical behavior
    const currentPattern = this.identifyCurrentPattern(data);
    const similarHistoricalPatterns = this.findSimilarPatterns(currentPattern, behaviorHistory);
    
    // Statistical analysis of likely next actions
    const actionProbabilities = this.calculateActionProbabilities(similarHistoricalPatterns);
    
    return {
      likelyNextActions: this.rankActionsByProbability(actionProbabilities),
      patternSimilarity: this.calculatePatternSimilarity(currentPattern, similarHistoricalPatterns),
      behaviorStability: this.calculateBehaviorStability(behaviorHistory),
      anomalyDetection: this.detectBehaviorAnomalies(data, behaviorHistory),
      timeToNextAction: this.predictTimeToNextAction(behaviorHistory)
    };
  }

  async predictSystemLoad(data) {
    const systemMetrics = this.extractSystemMetrics(data);
    
    // CPU usage prediction
    const cpuPrediction = await this.predictCPUUsage(systemMetrics.cpu);
    
    // Memory usage prediction
    const memoryPrediction = await this.predictMemoryUsage(systemMetrics.memory);
    
    // Network activity prediction
    const networkPrediction = await this.predictNetworkActivity(systemMetrics.network);
    
    return {
      cpu: cpuPrediction,
      memory: memoryPrediction,
      network: networkPrediction,
      overallLoad: this.calculateOverallLoadPrediction({
        cpu: cpuPrediction,
        memory: memoryPrediction,
        network: networkPrediction
      }),
      bottleneckRisk: this.assessBottleneckRisk(cpuPrediction, memoryPrediction)
    };
  }

  async predictOptimizationOpportunities(data) {
    const opportunities = [];
    
    // Analyze historical optimization effectiveness
    const optimizationHistory = this.extractOptimizationHistory(data);
    
    // Predict when optimizations will be most effective
    const optimizationTypes = [
      'tab_suspension', 'video_optimization', 'resource_blocking', 
      'dark_mode', 'animation_reduction', 'background_cleanup'
    ];

    for (const optimization of optimizationTypes) {
      const effectiveness = this.predictOptimizationEffectiveness(optimization, data, optimizationHistory);
      
      if (effectiveness.probability > 0.6) {
        opportunities.push({
          optimization,
          effectiveness: effectiveness.probability,
          estimatedSaving: effectiveness.estimatedSaving,
          optimalTiming: effectiveness.optimalTiming,
          riskLevel: effectiveness.riskLevel,
          confidence: effectiveness.confidence
        });
      }
    }
    
    return opportunities.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  // Utility methods for statistical analysis
  extractEnergyTimeSeries(data) {
    return data.map(d => ({
      timestamp: d.timestamp,
      value: d.energyData?.totalPower || 0
    })).sort((a, b) => a.timestamp - b.timestamp);
  }

  getSimpleEnergyPrediction(data) {
    const recent = data.slice(-3);
    const avgPower = recent.reduce((sum, d) => sum + (d.energyData?.totalPower || 0), 0) / recent.length;
    
    return {
      predicted30MinConsumption: avgPower * (1 + (Math.random() - 0.5) * 0.1), // Small random variation
      trendDirection: 'stable',
      volatility: 0.1,
      confidence: 0.6,
      factors: ['insufficient_data']
    };
  }

  ensemblePredictions(predictions) {
    const weightSum = predictions.reduce((sum, p) => sum + p.weight, 0);
    return predictions.reduce((sum, p) => sum + (p.prediction * p.weight), 0) / weightSum;
  }

  calculatePredictionConfidence(predictions) {
    // Calculate confidence based on model agreement and historical accuracy
    const modelAgreement = this.calculateModelAgreement(predictions);
    const historicalAccuracy = this.predictionAccuracy;
    
    return Math.min(modelAgreement * historicalAccuracy, 0.95);
  }

  calculateModelAgreement(predictions) {
    // Simplified model agreement calculation
    const energyPrediction = predictions.energyConsumption;
    if (energyPrediction.confidence && energyPrediction.volatility !== undefined) {
      // High confidence and low volatility suggest good agreement
      return energyPrediction.confidence * (1 - Math.min(energyPrediction.volatility, 0.5));
    }
    return 0.7; // Default moderate agreement
  }

  extractBehaviorHistory(data) {
    return data.map(d => ({
      timestamp: d.timestamp,
      tabCount: d.userContext?.tabCount || 0,
      hasVideo: d.userContext?.hasActiveVideo || false,
      energyLevel: d.energyData?.totalPower || 0,
      patterns: d.patterns || {}
    }));
  }

  identifyCurrentPattern(data) {
    if (data.length === 0) return {};
    
    const latest = data[data.length - 1];
    const hour = new Date(latest.timestamp).getHours();
    const dayOfWeek = new Date(latest.timestamp).getDay();
    
    return {
      hour,
      dayOfWeek,
      tabCount: latest.userContext?.tabCount || 0,
      hasVideo: latest.userContext?.hasActiveVideo || false,
      energyLevel: this.categorizeEnergyLevel(latest.energyData?.totalPower || 0),
      timeSlot: this.getTimeSlot(hour)
    };
  }

  getTimeSlot(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  categorizeEnergyLevel(power) {
    if (power < 15) return 'low';
    if (power < 30) return 'medium';
    if (power < 50) return 'high';
    return 'very_high';
  }

  findSimilarPatterns(currentPattern, behaviorHistory) {
    const similarPatterns = [];
    const threshold = 0.7;
    
    behaviorHistory.forEach(historical => {
      const similarity = this.calculatePatternSimilarity(currentPattern, historical);
      if (similarity > threshold) {
        similarPatterns.push({ ...historical, similarity });
      }
    });
    
    return similarPatterns.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
  }

  calculatePatternSimilarity(pattern1, pattern2) {
    let similarity = 0;
    let factors = 0;
    
    // Time similarity (hour and day)
    if (Math.abs(pattern1.hour - pattern2.hour) <= 2) {
      similarity += 0.3;
    }
    factors += 0.3;
    
    if (pattern1.dayOfWeek === pattern2.dayOfWeek) {
      similarity += 0.2;
    }
    factors += 0.2;
    
    // Tab count similarity
    const tabDiff = Math.abs(pattern1.tabCount - pattern2.tabCount);
    if (tabDiff <= 2) {
      similarity += 0.2;
    }
    factors += 0.2;
    
    // Video usage similarity
    if (pattern1.hasVideo === pattern2.hasVideo) {
      similarity += 0.15;
    }
    factors += 0.15;
    
    // Energy level similarity
    if (pattern1.energyLevel === pattern2.energyLevel) {
      similarity += 0.15;
    }
    factors += 0.15;
    
    return similarity / factors;
  }

  calculateActionProbabilities(similarPatterns) {
    const actions = {
      'open_new_tab': 0,
      'close_tabs': 0,
      'start_video': 0,
      'stop_video': 0,
      'increase_activity': 0,
      'decrease_activity': 0
    };
    
    similarPatterns.forEach(pattern => {
      // Analyze what typically happens after similar patterns
      if (pattern.tabCount > 10) {
        actions.close_tabs += pattern.similarity;
      } else if (pattern.tabCount < 5) {
        actions.open_new_tab += pattern.similarity;
      }
      
      if (pattern.hasVideo) {
        actions.start_video += pattern.similarity;
      }
      
      if (pattern.energyLevel === 'high') {
        actions.decrease_activity += pattern.similarity;
      }
    });
    
    return actions;
  }

  rankActionsByProbability(actionProbabilities) {
    return Object.entries(actionProbabilities)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([action, probability]) => ({
        action,
        probability: Math.min(probability, 1.0),
        confidence: probability > 0.7 ? 'high' : probability > 0.4 ? 'medium' : 'low'
      }));
  }

  calculateBehaviorStability(behaviorHistory) {
    if (behaviorHistory.length < 5) return 0.5;
    
    const tabCountVariability = this.calculateVariability(behaviorHistory.map(h => h.tabCount));
    const energyVariability = this.calculateVariability(behaviorHistory.map(h => h.energyLevel));
    
    // Lower variability = higher stability
    return Math.max(0.1, 1 - (tabCountVariability + energyVariability) / 2);
  }

  calculateVariability(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / (mean || 1);
  }

  detectBehaviorAnomalies(currentData, behaviorHistory) {
    const anomalies = [];
    
    if (currentData.length === 0) return anomalies;
    
    const current = currentData[currentData.length - 1];
    const avgTabCount = behaviorHistory.reduce((sum, h) => sum + h.tabCount, 0) / behaviorHistory.length;
    const avgEnergy = behaviorHistory.reduce((sum, h) => sum + h.energyLevel, 0) / behaviorHistory.length;
    
    // Check for unusual tab count
    if (Math.abs(current.userContext?.tabCount - avgTabCount) > avgTabCount * 0.5) {
      anomalies.push({
        type: 'unusual_tab_count',
        severity: 'medium',
        description: `Current tab count (${current.userContext?.tabCount}) significantly differs from average (${avgTabCount.toFixed(1)})`
      });
    }
    
    // Check for unusual energy consumption
    const currentEnergy = current.energyData?.totalPower || 0;
    if (Math.abs(currentEnergy - avgEnergy) > avgEnergy * 0.3) {
      anomalies.push({
        type: 'unusual_energy_consumption',
        severity: currentEnergy > avgEnergy ? 'high' : 'low',
        description: `Current energy consumption (${currentEnergy}W) significantly differs from average (${avgEnergy.toFixed(1)}W)`
      });
    }
    
    return anomalies;
  }

  predictTimeToNextAction(behaviorHistory) {
    if (behaviorHistory.length < 3) return { estimate: 300000, confidence: 'low' }; // 5 minutes default
    
    // Calculate average time between significant changes
    const changes = [];
    for (let i = 1; i < behaviorHistory.length; i++) {
      const prev = behaviorHistory[i - 1];
      const curr = behaviorHistory[i];
      
      if (Math.abs(curr.tabCount - prev.tabCount) > 2 || curr.hasVideo !== prev.hasVideo) {
        changes.push(curr.timestamp - prev.timestamp);
      }
    }
    
    if (changes.length === 0) {
      return { estimate: 600000, confidence: 'low' }; // 10 minutes default
    }
    
    const avgInterval = changes.reduce((a, b) => a + b, 0) / changes.length;
    const confidence = changes.length > 5 ? 'high' : changes.length > 2 ? 'medium' : 'low';
    
    return {
      estimate: Math.max(60000, Math.min(avgInterval, 1800000)), // Between 1 minute and 30 minutes
      confidence
    };
  }

  extractSystemMetrics(data) {
    const metrics = {
      cpu: [],
      memory: [],
      network: []
    };
    
    data.forEach(d => {
      if (d.energyData) {
        metrics.cpu.push(d.energyData.cpuUsage || 0);
        metrics.memory.push(d.energyData.memoryUsage || 0);
        metrics.network.push(d.energyData.networkUsage || 0);
      }
    });
    
    return metrics;
  }

  async predictCPUUsage(cpuHistory) {
    if (cpuHistory.length < 3) {
      return { predicted: 25, trend: 'stable', confidence: 0.5 };
    }
    
    const trend = this.trends.getTrendDirection(cpuHistory.map((cpu, i) => ({ timestamp: i, value: cpu })));
    const predicted = await this.models.get('movingAverage').predict(
      cpuHistory.map((cpu, i) => ({ timestamp: i, value: cpu }))
    );
    
    return {
      predicted: Math.max(0, Math.min(predicted, 100)),
      trend,
      confidence: 0.8,
      volatility: this.calculateVariability(cpuHistory)
    };
  }

  async predictMemoryUsage(memoryHistory) {
    if (memoryHistory.length < 3) {
      return { predicted: 60, trend: 'stable', confidence: 0.5 };
    }
    
    const trend = this.trends.getTrendDirection(memoryHistory.map((mem, i) => ({ timestamp: i, value: mem })));
    const predicted = await this.models.get('linearRegression').predict(
      memoryHistory.map((mem, i) => ({ timestamp: i, value: mem }))
    );
    
    return {
      predicted: Math.max(0, Math.min(predicted, 100)),
      trend,
      confidence: 0.8,
      volatility: this.calculateVariability(memoryHistory)
    };
  }

  async predictNetworkActivity(networkHistory) {
    if (networkHistory.length < 3) {
      return { predicted: 10, trend: 'stable', confidence: 0.5 };
    }
    
    const trend = this.trends.getTrendDirection(networkHistory.map((net, i) => ({ timestamp: i, value: net })));
    const predicted = await this.models.get('exponentialSmoothing').predict(
      networkHistory.map((net, i) => ({ timestamp: i, value: net }))
    );
    
    return {
      predicted: Math.max(0, predicted),
      trend,
      confidence: 0.7,
      volatility: this.calculateVariability(networkHistory)
    };
  }

  calculateOverallLoadPrediction(predictions) {
    const cpuWeight = 0.4;
    const memoryWeight = 0.4;
    const networkWeight = 0.2;
    
    const overallLoad = 
      predictions.cpu.predicted * cpuWeight +
      predictions.memory.predicted * memoryWeight +
      predictions.network.predicted * networkWeight;
    
    return {
      predicted: overallLoad,
      level: overallLoad > 70 ? 'high' : overallLoad > 40 ? 'medium' : 'low',
      confidence: Math.min(predictions.cpu.confidence, predictions.memory.confidence)
    };
  }

  assessBottleneckRisk(cpuPrediction, memoryPrediction) {
    const risks = [];
    
    if (cpuPrediction.predicted > 80) {
      risks.push({
        type: 'cpu_bottleneck',
        probability: (cpuPrediction.predicted - 80) / 20,
        impact: 'high'
      });
    }
    
    if (memoryPrediction.predicted > 85) {
      risks.push({
        type: 'memory_bottleneck',
        probability: (memoryPrediction.predicted - 85) / 15,
        impact: 'critical'
      });
    }
    
    return risks;
  }

  extractOptimizationHistory(data) {
    // Extract patterns of when optimizations have been successful
    const history = new Map();
    
    data.forEach((d, i) => {
      if (i > 0) {
        const prev = data[i - 1];
        const energyReduction = prev.energyData?.totalPower - d.energyData?.totalPower;
        
        if (energyReduction > 5) {
          // Significant energy reduction detected
          const context = {
            timeOfDay: new Date(d.timestamp).getHours(),
            tabCount: prev.userContext?.tabCount || 0,
            hadVideo: prev.userContext?.hasActiveVideo || false,
            reduction: energyReduction
          };
          
          history.set(d.timestamp, context);
        }
      }
    });
    
    return history;
  }

  predictOptimizationEffectiveness(optimization, data, optimizationHistory) {
    const currentContext = this.identifyCurrentPattern(data);
    let effectiveness = 0.5; // Base effectiveness
    let confidence = 0.6;
    
    // Analyze historical effectiveness for similar contexts
    let contextMatches = 0;
    let totalReduction = 0;
    
    for (const [timestamp, context] of optimizationHistory.entries()) {
      if (this.isContextSimilar(currentContext, context)) {
        contextMatches++;
        totalReduction += context.reduction;
      }
    }
    
    if (contextMatches > 0) {
      effectiveness = Math.min(0.95, 0.3 + (totalReduction / contextMatches) / 50); // Scale based on average reduction
      confidence = Math.min(0.9, 0.5 + contextMatches * 0.1);
    }
    
    // Optimization-specific adjustments
    const adjustments = this.getOptimizationAdjustments(optimization, currentContext);
    effectiveness *= adjustments.effectiveness;
    
    return {
      probability: effectiveness,
      estimatedSaving: effectiveness * adjustments.maxSaving,
      optimalTiming: this.calculateOptimalTiming(optimization, currentContext),
      riskLevel: adjustments.riskLevel,
      confidence: confidence
    };
  }

  isContextSimilar(context1, context2) {
    const hourDiff = Math.abs(context1.hour - context2.timeOfDay);
    const tabDiff = Math.abs(context1.tabCount - context2.tabCount);
    
    return hourDiff <= 2 && tabDiff <= 5 && context1.hasVideo === context2.hadVideo;
  }

  getOptimizationAdjustments(optimization, context) {
    const adjustments = {
      tab_suspension: {
        effectiveness: context.tabCount > 10 ? 1.2 : context.tabCount < 5 ? 0.7 : 1.0,
        maxSaving: 25,
        riskLevel: 'low'
      },
      video_optimization: {
        effectiveness: context.hasVideo ? 1.5 : 0.3,
        maxSaving: 30,
        riskLevel: 'medium'
      },
      resource_blocking: {
        effectiveness: context.tabCount > 5 ? 1.1 : 0.8,
        maxSaving: 15,
        riskLevel: 'low'
      },
      dark_mode: {
        effectiveness: context.timeSlot === 'evening' || context.timeSlot === 'night' ? 1.3 : 0.8,
        maxSaving: 12,
        riskLevel: 'minimal'
      }
    };
    
    return adjustments[optimization] || { effectiveness: 1.0, maxSaving: 10, riskLevel: 'medium' };
  }

  calculateOptimalTiming(optimization, context) {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Different optimizations are more effective at different times
    const optimalHours = {
      tab_suspension: [12, 13, 18, 19], // Lunch and evening
      video_optimization: [10, 14, 20], // Mid-morning, afternoon, evening
      resource_blocking: [9, 13, 17], // Start of work blocks
      dark_mode: [19, 20, 21, 22] // Evening hours
    };
    
    const optimal = optimalHours[optimization] || [currentHour];
    const nextOptimal = optimal.find(hour => hour > currentHour) || optimal[0] + 24;
    
    const minutesUntilOptimal = (nextOptimal - currentHour) * 60;
    
    return {
      minutesFromNow: minutesUntilOptimal,
      optimalHour: nextOptimal % 24,
      immediateEffectiveness: optimal.includes(currentHour) ? 1.0 : 0.7
    };
  }

  getDefaultPrediction() {
    return {
      predictions: {
        energyConsumption: {
          predicted30MinConsumption: 20,
          trendDirection: 'stable',
          volatility: 0.2,
          confidence: 0.5,
          factors: ['insufficient_data']
        },
        userBehavior: {
          likelyNextActions: [
            { action: 'maintain_current_activity', probability: 0.7, confidence: 'medium' }
          ],
          patternSimilarity: 0.5,
          behaviorStability: 0.6,
          anomalyDetection: [],
          timeToNextAction: { estimate: 300000, confidence: 'low' }
        },
        systemLoad: {
          cpu: { predicted: 25, trend: 'stable', confidence: 0.5 },
          memory: { predicted: 60, trend: 'stable', confidence: 0.5 },
          network: { predicted: 10, trend: 'stable', confidence: 0.5 },
          overallLoad: { predicted: 35, level: 'low', confidence: 0.5 }
        },
        optimizationOpportunities: []
      },
      confidence: 0.5,
      timeHorizon: 30,
      methodology: 'default_fallback'
    };
  }

  async updateAccuracy(actionResults) {
    // Update prediction accuracy based on actual outcomes
    const accurateResults = actionResults.filter(result => 
      result.success && Math.abs(result.energySaved - result.predictedSaving) / result.predictedSaving < 0.3
    );
    
    const newAccuracy = accurateResults.length / actionResults.length;
    this.predictionAccuracy = (this.predictionAccuracy * 0.8) + (newAccuracy * 0.2);
    
    // Update model weights based on performance
    await this.updateModelWeights(actionResults);
  }

  async updateModelWeights(actionResults) {
    // Adjust model weights based on which predictions were most accurate
    const modelPerformance = {
      linearRegression: 0,
      movingAverage: 0,
      exponentialSmoothing: 0
    };
    
    actionResults.forEach(result => {
      if (result.success) {
        // Simplified performance tracking - in practice, this would be more sophisticated
        modelPerformance.movingAverage += 1; // Moving average often performs well for energy data
      }
    });
    
    // Store updated model weights
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          predictorAccuracy: this.predictionAccuracy,
          modelWeights: modelPerformance
        });
      }
    } catch (error) {
      console.warn('[DeterministicPredictor] Could not save model weights:', error);
    }
  }

  identifyInfluencingFactors(data) {
    const factors = [];
    
    if (data.some(d => d.userContext?.hasActiveVideo)) {
      factors.push('video_playback');
    }
    
    const avgTabCount = data.reduce((sum, d) => sum + (d.userContext?.tabCount || 0), 0) / data.length;
    if (avgTabCount > 10) {
      factors.push('high_tab_count');
    }
    
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      factors.push('work_hours');
    }
    
    return factors;
  }

  getAccuracyMetrics() {
    return {
      overallAccuracy: this.predictionAccuracy,
      modelsInitialized: this.models.size,
      patternsTracked: this.patterns.size,
      historicalDataPoints: this.historicalData.length
    };
  }
}

/**
 * Seasonality Analyzer - Identifies seasonal patterns in energy usage
 */
class SeasonalityAnalyzer {
  constructor() {
    this.seasonalPatterns = new Map();
  }

  async getAdjustment(date) {
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    
    let adjustment = 1.0;
    
    // Hourly adjustments
    if (hour >= 9 && hour <= 17) {
      adjustment *= 1.1; // Work hours typically higher
    } else if (hour >= 19 && hour <= 22) {
      adjustment *= 1.05; // Evening usage
    } else {
      adjustment *= 0.9; // Off hours typically lower
    }
    
    // Weekly adjustments
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      adjustment *= 0.8; // Weekends typically lower
    }
    
    // Seasonal adjustments (simplified)
    if (month >= 5 && month <= 8) {
      adjustment *= 1.05; // Summer months (more AC, different usage)
    }
    
    return Math.max(0.5, Math.min(adjustment, 1.5));
  }
}

/**
 * Trend Analyzer - Analyzes trends in time series data
 */
class TrendAnalyzer {
  getTrendDirection(timeSeries) {
    if (timeSeries.length < 3) return 'stable';
    
    const values = timeSeries.map(t => t.value);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  calculateVolatility(timeSeries) {
    if (timeSeries.length < 2) return 0;
    
    const values = timeSeries.map(t => t.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / (mean || 1);
  }
}

/**
 * Linear Regression Model - Simple linear regression for trend analysis
 */
class LinearRegressionModel {
  async predict(timeSeries) {
    if (timeSeries.length < 2) return 0;
    
    const n = timeSeries.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    timeSeries.forEach((point, i) => {
      sumX += i;
      sumY += point.value;
      sumXY += i * point.value;
      sumXX += i * i;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict next point
    return slope * n + intercept;
  }
}

/**
 * Moving Average Model - Simple moving average prediction
 */
class MovingAverageModel {
  async predict(timeSeries) {
    if (timeSeries.length === 0) return 0;
    
    const window = Math.min(5, timeSeries.length);
    const recent = timeSeries.slice(-window);
    
    return recent.reduce((sum, point) => sum + point.value, 0) / recent.length;
  }
}

/**
 * Exponential Smoothing Model - Weighted moving average with exponential decay
 */
class ExponentialSmoothingModel {
  constructor() {
    this.alpha = 0.3; // Smoothing parameter
  }

  async predict(timeSeries) {
    if (timeSeries.length === 0) return 0;
    if (timeSeries.length === 1) return timeSeries[0].value;
    
    let smoothed = timeSeries[0].value;
    
    for (let i = 1; i < timeSeries.length; i++) {
      smoothed = this.alpha * timeSeries[i].value + (1 - this.alpha) * smoothed;
    }
    
    return smoothed;
  }
}

/**
 * Seasonal Decomposition Model - Decompose seasonal patterns
 */
class SeasonalDecompositionModel {
  async predict(timeSeries) {
    // Simplified seasonal decomposition - returns trend component
    if (timeSeries.length < 7) {
      return new MovingAverageModel().predict(timeSeries);
    }
    
    // Calculate weekly trend (simplified)
    const weeklyAverage = timeSeries
      .slice(-7)
      .reduce((sum, point) => sum + point.value, 0) / 7;
    
    return weeklyAverage;
  }
}