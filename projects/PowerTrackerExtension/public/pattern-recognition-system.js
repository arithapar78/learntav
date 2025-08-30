/**
 * Pattern Recognition System - Statistical analysis and algorithmic pattern detection
 * Implements sophisticated pattern detection without external AI dependencies
 */
class PatternRecognitionSystem {
  constructor() {
    this.temporalAnalyzer = new TemporalAnalyzer();
    this.behavioralAnalyzer = new BehavioralAnalyzer();
    this.energyPatternDetector = new EnergyPatternDetector();
    this.anomalyDetector = new AnomalyDetector();
    this.sequenceAnalyzer = new SequenceAnalyzer();
    this.clusteringEngine = new ClusteringEngine();
    this.patternHistory = [];
    this.detectedPatterns = new Map();
    this.confidenceThreshold = 0.7;
  }

  async analyzePatterns(dataStream, context = {}) {
    console.log('[PatternRecognitionSystem] Starting pattern analysis');

    try {
      const analysis = {
        temporal: await this.temporalAnalyzer.analyze(dataStream),
        behavioral: await this.behavioralAnalyzer.analyze(dataStream, context),
        energy: await this.energyPatternDetector.analyze(dataStream),
        anomalies: await this.anomalyDetector.detect(dataStream),
        sequences: await this.sequenceAnalyzer.analyze(dataStream),
        clusters: await this.clusteringEngine.cluster(dataStream)
      };

      // Synthesize patterns from different analyses
      const synthesizedPatterns = this.synthesizePatterns(analysis);

      // Update pattern history and confidence scores
      this.updatePatternDetection(synthesizedPatterns, context);

      return {
        success: true,
        patterns: synthesizedPatterns,
        confidence: this.calculateOverallConfidence(synthesizedPatterns),
        insights: this.generatePatternInsights(synthesizedPatterns),
        recommendations: this.generateRecommendations(synthesizedPatterns),
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('[PatternRecognitionSystem] Pattern analysis failed:', error);
      return {
        success: false,
        error: error.message,
        patterns: [],
        timestamp: Date.now()
      };
    }
  }

  synthesizePatterns(analysis) {
    const patterns = [];

    // Temporal patterns with high confidence
    if (analysis.temporal.patterns) {
      analysis.temporal.patterns.forEach(pattern => {
        if (pattern.confidence > this.confidenceThreshold) {
          patterns.push({
            type: 'temporal',
            subtype: pattern.type,
            description: pattern.description,
            confidence: pattern.confidence,
            data: pattern.data,
            impact: this.calculatePatternImpact(pattern),
            actionability: this.assessActionability(pattern)
          });
        }
      });
    }

    // Behavioral patterns
    if (analysis.behavioral.patterns) {
      analysis.behavioral.patterns.forEach(pattern => {
        if (pattern.confidence > this.confidenceThreshold) {
          patterns.push({
            type: 'behavioral',
            subtype: pattern.type,
            description: pattern.description,
            confidence: pattern.confidence,
            data: pattern.data,
            impact: this.calculatePatternImpact(pattern),
            actionability: this.assessActionability(pattern)
          });
        }
      });
    }

    // Energy patterns
    if (analysis.energy.patterns) {
      analysis.energy.patterns.forEach(pattern => {
        if (pattern.confidence > this.confidenceThreshold) {
          patterns.push({
            type: 'energy',
            subtype: pattern.type,
            description: pattern.description,
            confidence: pattern.confidence,
            data: pattern.data,
            impact: this.calculatePatternImpact(pattern),
            actionability: this.assessActionability(pattern)
          });
        }
      });
    }

    // Anomaly patterns
    if (analysis.anomalies.detected && analysis.anomalies.detected.length > 0) {
      analysis.anomalies.detected.forEach(anomaly => {
        patterns.push({
          type: 'anomaly',
          subtype: anomaly.type,
          description: anomaly.description,
          confidence: anomaly.confidence,
          data: anomaly.data,
          impact: 'high', // Anomalies are typically high impact
          actionability: 'immediate'
        });
      });
    }

    // Sequence patterns
    if (analysis.sequences.patterns) {
      analysis.sequences.patterns.forEach(pattern => {
        if (pattern.confidence > this.confidenceThreshold) {
          patterns.push({
            type: 'sequence',
            subtype: pattern.type,
            description: pattern.description,
            confidence: pattern.confidence,
            data: pattern.data,
            impact: this.calculatePatternImpact(pattern),
            actionability: this.assessActionability(pattern)
          });
        }
      });
    }

    // Cluster patterns
    if (analysis.clusters.patterns) {
      analysis.clusters.patterns.forEach(pattern => {
        if (pattern.confidence > this.confidenceThreshold) {
          patterns.push({
            type: 'cluster',
            subtype: pattern.type,
            description: pattern.description,
            confidence: pattern.confidence,
            data: pattern.data,
            impact: this.calculatePatternImpact(pattern),
            actionability: this.assessActionability(pattern)
          });
        }
      });
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  calculatePatternImpact(pattern) {
    // Calculate the potential impact of acting on this pattern
    let impactScore = 0;

    // Base impact from pattern strength
    impactScore += (pattern.confidence || 0.5) * 0.4;

    // Impact from pattern frequency/recurrence
    if (pattern.data && pattern.data.frequency) {
      impactScore += Math.min(pattern.data.frequency / 10, 0.3);
    }

    // Impact from energy savings potential
    if (pattern.data && pattern.data.energySavingPotential) {
      impactScore += Math.min(pattern.data.energySavingPotential / 20, 0.3);
    }

    if (impactScore > 0.8) return 'high';
    if (impactScore > 0.5) return 'medium';
    return 'low';
  }

  assessActionability(pattern) {
    // Assess how actionable this pattern is
    const factors = {
      confidence: pattern.confidence || 0.5,
      clarity: pattern.data?.clarity || 0.5,
      stability: pattern.data?.stability || 0.5,
      recurrence: pattern.data?.recurrence || 0.5
    };

    const actionabilityScore = Object.values(factors).reduce((a, b) => a + b, 0) / 4;

    if (actionabilityScore > 0.8) return 'immediate';
    if (actionabilityScore > 0.6) return 'short_term';
    if (actionabilityScore > 0.4) return 'medium_term';
    return 'long_term';
  }

  updatePatternDetection(patterns, context) {
    const timestamp = Date.now();

    // Update detected patterns map with new findings
    patterns.forEach(pattern => {
      const patternKey = this.generatePatternKey(pattern);
      
      if (!this.detectedPatterns.has(patternKey)) {
        this.detectedPatterns.set(patternKey, {
          pattern,
          firstDetected: timestamp,
          detectionCount: 1,
          lastDetected: timestamp,
          contexts: [context],
          confidenceHistory: [pattern.confidence]
        });
      } else {
        const existing = this.detectedPatterns.get(patternKey);
        existing.detectionCount++;
        existing.lastDetected = timestamp;
        existing.contexts.push(context);
        existing.confidenceHistory.push(pattern.confidence);
        
        // Update pattern with new confidence (exponential moving average)
        const alpha = 0.3;
        existing.pattern.confidence = (1 - alpha) * existing.pattern.confidence + alpha * pattern.confidence;
        
        // Keep history manageable
        if (existing.contexts.length > 20) {
          existing.contexts = existing.contexts.slice(-10);
        }
        if (existing.confidenceHistory.length > 50) {
          existing.confidenceHistory = existing.confidenceHistory.slice(-25);
        }
      }
    });

    // Record in pattern history
    this.patternHistory.push({
      patterns,
      context,
      timestamp
    });

    // Keep history manageable
    if (this.patternHistory.length > 200) {
      this.patternHistory = this.patternHistory.slice(-100);
    }
  }

  generatePatternKey(pattern) {
    return `${pattern.type}_${pattern.subtype}_${JSON.stringify(pattern.data?.signature || {})}`;
  }

  calculateOverallConfidence(patterns) {
    if (patterns.length === 0) return 0;

    // Weight confidence by pattern importance
    let weightedSum = 0;
    let totalWeight = 0;

    patterns.forEach(pattern => {
      const weight = this.getPatternWeight(pattern);
      weightedSum += pattern.confidence * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  getPatternWeight(pattern) {
    const impactWeights = { high: 1.0, medium: 0.7, low: 0.4 };
    const actionabilityWeights = { immediate: 1.0, short_term: 0.8, medium_term: 0.6, long_term: 0.4 };
    
    return (impactWeights[pattern.impact] || 0.5) * (actionabilityWeights[pattern.actionability] || 0.5);
  }

  generatePatternInsights(patterns) {
    const insights = {
      summary: this.generatePatternSummary(patterns),
      trends: this.identifyTrends(patterns),
      correlations: this.findCorrelations(patterns),
      predictions: this.generatePredictions(patterns)
    };

    return insights;
  }

  generatePatternSummary(patterns) {
    const summary = {
      totalPatterns: patterns.length,
      highConfidencePatterns: patterns.filter(p => p.confidence > 0.8).length,
      actionablePatterns: patterns.filter(p => p.actionability === 'immediate').length,
      patternTypes: this.summarizePatternTypes(patterns),
      averageConfidence: patterns.length > 0 ? 
        patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length : 0
    };

    return summary;
  }

  summarizePatternTypes(patterns) {
    const typeCounts = new Map();
    patterns.forEach(pattern => {
      const key = `${pattern.type}_${pattern.subtype}`;
      typeCounts.set(key, (typeCounts.get(key) || 0) + 1);
    });

    return Object.fromEntries(typeCounts);
  }

  identifyTrends(patterns) {
    const trends = [];

    // Analyze pattern confidence trends
    const recentHistory = this.patternHistory.slice(-20);
    if (recentHistory.length >= 3) {
      const confidenceTrend = this.calculateConfidenceTrend(recentHistory);
      if (confidenceTrend.direction !== 'stable') {
        trends.push({
          type: 'confidence_trend',
          direction: confidenceTrend.direction,
          magnitude: confidenceTrend.magnitude,
          description: `Pattern detection confidence is ${confidenceTrend.direction}`
        });
      }
    }

    // Analyze pattern frequency trends
    const frequencyTrend = this.calculateFrequencyTrend(patterns);
    if (frequencyTrend) {
      trends.push(frequencyTrend);
    }

    return trends;
  }

  calculateConfidenceTrend(history) {
    const confidences = history.map(h => 
      h.patterns.length > 0 ? 
        h.patterns.reduce((sum, p) => sum + p.confidence, 0) / h.patterns.length : 0
    );

    const firstHalf = confidences.slice(0, Math.floor(confidences.length / 2));
    const secondHalf = confidences.slice(Math.floor(confidences.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;
    const magnitude = Math.abs(change);

    return {
      direction: change > 0.1 ? 'improving' : change < -0.1 ? 'declining' : 'stable',
      magnitude: magnitude
    };
  }

  calculateFrequencyTrend(patterns) {
    // Analyze if certain pattern types are becoming more or less frequent
    const recentDetections = Array.from(this.detectedPatterns.values())
      .filter(detection => (Date.now() - detection.lastDetected) < 3600000); // Last hour

    if (recentDetections.length < 3) return null;

    const frequentPatterns = recentDetections
      .filter(detection => detection.detectionCount > 3)
      .sort((a, b) => b.detectionCount - a.detectionCount)
      .slice(0, 3);

    if (frequentPatterns.length > 0) {
      return {
        type: 'frequency_trend',
        patterns: frequentPatterns.map(detection => ({
          type: detection.pattern.type,
          subtype: detection.pattern.subtype,
          frequency: detection.detectionCount,
          description: detection.pattern.description
        })),
        description: 'Frequently occurring patterns detected'
      };
    }

    return null;
  }

  findCorrelations(patterns) {
    const correlations = [];

    // Find temporal correlations
    const temporalCorrelations = this.findTemporalCorrelations(patterns);
    correlations.push(...temporalCorrelations);

    // Find type correlations
    const typeCorrelations = this.findTypeCorrelations(patterns);
    correlations.push(...typeCorrelations);

    return correlations;
  }

  findTemporalCorrelations(patterns) {
    const correlations = [];
    const recentHistory = this.patternHistory.slice(-10);

    if (recentHistory.length < 3) return correlations;

    // Look for patterns that frequently occur together
    const coOccurrenceMap = new Map();

    recentHistory.forEach(history => {
      const patternTypes = history.patterns.map(p => `${p.type}_${p.subtype}`);
      
      for (let i = 0; i < patternTypes.length; i++) {
        for (let j = i + 1; j < patternTypes.length; j++) {
          const pair = [patternTypes[i], patternTypes[j]].sort().join('|');
          coOccurrenceMap.set(pair, (coOccurrenceMap.get(pair) || 0) + 1);
        }
      }
    });

    // Identify significant co-occurrences
    coOccurrenceMap.forEach((count, pair) => {
      const frequency = count / recentHistory.length;
      if (frequency > 0.6) { // Occurs together in >60% of analyses
        const [type1, type2] = pair.split('|');
        correlations.push({
          type: 'co_occurrence',
          patterns: [type1, type2],
          frequency: frequency,
          strength: frequency,
          description: `${type1} and ${type2} frequently occur together`
        });
      }
    });

    return correlations;
  }

  findTypeCorrelations(patterns) {
    const correlations = [];
    
    // Group patterns by type
    const typeGroups = new Map();
    patterns.forEach(pattern => {
      const typeKey = pattern.type;
      if (!typeGroups.has(typeKey)) {
        typeGroups.set(typeKey, []);
      }
      typeGroups.get(typeKey).push(pattern);
    });

    // Look for correlations between pattern types based on confidence
    const typeArray = Array.from(typeGroups.entries());
    for (let i = 0; i < typeArray.length; i++) {
      for (let j = i + 1; j < typeArray.length; j++) {
        const [type1, patterns1] = typeArray[i];
        const [type2, patterns2] = typeArray[j];
        
        const avgConfidence1 = patterns1.reduce((sum, p) => sum + p.confidence, 0) / patterns1.length;
        const avgConfidence2 = patterns2.reduce((sum, p) => sum + p.confidence, 0) / patterns2.length;
        
        // If both types have high confidence, they might be correlated
        if (avgConfidence1 > 0.7 && avgConfidence2 > 0.7) {
          correlations.push({
            type: 'confidence_correlation',
            patterns: [type1, type2],
            strength: Math.min(avgConfidence1, avgConfidence2),
            description: `${type1} and ${type2} both show high confidence patterns`
          });
        }
      }
    }

    return correlations;
  }

  generatePredictions(patterns) {
    const predictions = [];

    // Predict future pattern occurrences based on historical data
    const patternRecurrencePredictions = this.predictPatternRecurrence(patterns);
    predictions.push(...patternRecurrencePredictions);

    // Predict energy optimization opportunities
    const energyOptimizationPredictions = this.predictEnergyOptimizations(patterns);
    predictions.push(...energyOptimizationPredictions);

    return predictions;
  }

  predictPatternRecurrence(patterns) {
    const predictions = [];
    
    // Analyze patterns with strong temporal components
    const temporalPatterns = patterns.filter(p => p.type === 'temporal' && p.confidence > 0.8);
    
    temporalPatterns.forEach(pattern => {
      if (pattern.data && pattern.data.cycle) {
        const nextOccurrence = this.predictNextOccurrence(pattern.data.cycle);
        predictions.push({
          type: 'pattern_recurrence',
          pattern: `${pattern.type}_${pattern.subtype}`,
          predictedTime: nextOccurrence,
          confidence: pattern.confidence * 0.8, // Slightly lower confidence for predictions
          description: `${pattern.description} likely to recur around ${new Date(nextOccurrence).toLocaleTimeString()}`
        });
      }
    });

    return predictions;
  }

  predictNextOccurrence(cycle) {
    const now = Date.now();
    
    // Simple prediction based on cycle pattern
    if (cycle.period && cycle.lastOccurrence) {
      return cycle.lastOccurrence + cycle.period;
    }
    
    // Default prediction (next hour)
    return now + 3600000;
  }

  predictEnergyOptimizations(patterns) {
    const predictions = [];
    
    // Look for energy patterns that suggest optimization opportunities
    const energyPatterns = patterns.filter(p => p.type === 'energy' && p.impact === 'high');
    
    energyPatterns.forEach(pattern => {
      if (pattern.data && pattern.data.optimizationPotential) {
        predictions.push({
          type: 'energy_optimization',
          pattern: `${pattern.type}_${pattern.subtype}`,
          potentialSaving: pattern.data.optimizationPotential,
          confidence: pattern.confidence,
          timeframe: this.estimateOptimizationTimeframe(pattern),
          description: `Energy optimization opportunity: ${pattern.description}`
        });
      }
    });

    return predictions;
  }

  estimateOptimizationTimeframe(pattern) {
    if (pattern.actionability === 'immediate') return 'within_5_minutes';
    if (pattern.actionability === 'short_term') return 'within_30_minutes';
    if (pattern.actionability === 'medium_term') return 'within_2_hours';
    return 'within_24_hours';
  }

  generateRecommendations(patterns) {
    const recommendations = [];

    // Generate recommendations based on actionable patterns
    const actionablePatterns = patterns.filter(p => 
      p.actionability === 'immediate' || (p.actionability === 'short_term' && p.impact === 'high')
    );

    actionablePatterns.forEach(pattern => {
      const recommendation = this.generatePatternRecommendation(pattern);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    });

    // Sort by priority (impact + confidence + actionability)
    recommendations.sort((a, b) => b.priority - a.priority);

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  generatePatternRecommendation(pattern) {
    const recommendation = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pattern: `${pattern.type}_${pattern.subtype}`,
      priority: this.calculateRecommendationPriority(pattern),
      confidence: pattern.confidence,
      impact: pattern.impact,
      timeframe: this.estimateOptimizationTimeframe(pattern)
    };

    // Generate specific recommendations based on pattern type
    switch (pattern.type) {
      case 'temporal':
        recommendation.action = 'schedule_optimization';
        recommendation.description = `Schedule energy optimization during ${pattern.subtype} period`;
        recommendation.details = {
          timing: pattern.data?.optimalTime,
          frequency: pattern.data?.frequency
        };
        break;

      case 'behavioral':
        recommendation.action = 'adapt_behavior';
        recommendation.description = `Adapt to user ${pattern.subtype} behavior pattern`;
        recommendation.details = {
          adaptationType: pattern.subtype,
          intensity: pattern.data?.intensity
        };
        break;

      case 'energy':
        recommendation.action = 'optimize_energy';
        recommendation.description = `Optimize ${pattern.subtype} energy consumption`;
        recommendation.details = {
          targetArea: pattern.subtype,
          potentialSaving: pattern.data?.optimizationPotential
        };
        break;

      case 'anomaly':
        recommendation.action = 'investigate_anomaly';
        recommendation.description = `Investigate ${pattern.subtype} anomaly`;
        recommendation.details = {
          anomalyType: pattern.subtype,
          urgency: 'high'
        };
        break;

      case 'sequence':
        recommendation.action = 'optimize_sequence';
        recommendation.description = `Optimize ${pattern.subtype} action sequence`;
        recommendation.details = {
          sequenceType: pattern.subtype,
          optimizationOpportunity: pattern.data?.optimization
        };
        break;

      case 'cluster':
        recommendation.action = 'cluster_optimization';
        recommendation.description = `Optimize ${pattern.subtype} cluster behavior`;
        recommendation.details = {
          clusterType: pattern.subtype,
          clusterSize: pattern.data?.size
        };
        break;

      default:
        recommendation.action = 'general_optimization';
        recommendation.description = `General optimization based on ${pattern.type} pattern`;
        recommendation.details = {};
    }

    return recommendation;
  }

  calculateRecommendationPriority(pattern) {
    const impactScores = { high: 1.0, medium: 0.6, low: 0.3 };
    const actionabilityScores = { immediate: 1.0, short_term: 0.8, medium_term: 0.5, long_term: 0.2 };
    
    const impactScore = impactScores[pattern.impact] || 0.5;
    const actionabilityScore = actionabilityScores[pattern.actionability] || 0.5;
    
    return (pattern.confidence * 0.4) + (impactScore * 0.35) + (actionabilityScore * 0.25);
  }

  getPatternSummary() {
    const summary = {
      totalDetectedPatterns: this.detectedPatterns.size,
      recentAnalyses: this.patternHistory.length,
      patternTypes: this.summarizeDetectedPatternTypes(),
      highConfidencePatterns: this.getHighConfidencePatterns(),
      recurringPatterns: this.getRecurringPatterns(),
      lastAnalysis: this.patternHistory.length > 0 ? 
        this.patternHistory[this.patternHistory.length - 1].timestamp : null
    };

    return summary;
  }

  summarizeDetectedPatternTypes() {
    const typeCounts = new Map();
    
    for (const detection of this.detectedPatterns.values()) {
      const key = `${detection.pattern.type}_${detection.pattern.subtype}`;
      typeCounts.set(key, (typeCounts.get(key) || 0) + detection.detectionCount);
    }

    return Object.fromEntries(typeCounts);
  }

  getHighConfidencePatterns() {
    return Array.from(this.detectedPatterns.values())
      .filter(detection => detection.pattern.confidence > 0.8)
      .map(detection => ({
        type: detection.pattern.type,
        subtype: detection.pattern.subtype,
        confidence: detection.pattern.confidence,
        detectionCount: detection.detectionCount,
        description: detection.pattern.description
      }));
  }

  getRecurringPatterns() {
    return Array.from(this.detectedPatterns.values())
      .filter(detection => detection.detectionCount >= 3)
      .sort((a, b) => b.detectionCount - a.detectionCount)
      .slice(0, 5)
      .map(detection => ({
        type: detection.pattern.type,
        subtype: detection.pattern.subtype,
        detectionCount: detection.detectionCount,
        firstDetected: detection.firstDetected,
        lastDetected: detection.lastDetected,
        description: detection.pattern.description
      }));
  }
}

/**
 * Temporal Analyzer - Analyzes time-based patterns
 */
class TemporalAnalyzer {
  constructor() {
    this.timeSeriesAnalyzer = new TimeSeriesAnalyzer();
    this.cyclicPatternDetector = new CyclicPatternDetector();
    this.seasonalityDetector = new SeasonalityDetector();
  }

  async analyze(dataStream) {
    const patterns = [];
    
    try {
      // Time series analysis
      const timeSeriesPatterns = await this.timeSeriesAnalyzer.detect(dataStream);
      patterns.push(...timeSeriesPatterns);

      // Cyclic pattern detection
      const cyclicPatterns = await this.cyclicPatternDetector.detect(dataStream);
      patterns.push(...cyclicPatterns);

      // Seasonality detection
      const seasonalPatterns = await this.seasonalityDetector.detect(dataStream);
      patterns.push(...seasonalPatterns);

      return { patterns };
    } catch (error) {
      console.error('[TemporalAnalyzer] Analysis failed:', error);
      return { patterns: [] };
    }
  }
}

/**
 * Time Series Analyzer - Analyzes sequential time-based data
 */
class TimeSeriesAnalyzer {
  async detect(dataStream) {
    const patterns = [];
    
    if (!Array.isArray(dataStream) || dataStream.length < 5) {
      return patterns;
    }

    // Sort by timestamp
    const sortedData = dataStream.slice().sort((a, b) => a.timestamp - b.timestamp);

    // Detect trends
    const trendPattern = this.detectTrend(sortedData);
    if (trendPattern) patterns.push(trendPattern);

    // Detect volatility
    const volatilityPattern = this.detectVolatility(sortedData);
    if (volatilityPattern) patterns.push(volatilityPattern);

    // Detect step changes
    const stepChanges = this.detectStepChanges(sortedData);
    patterns.push(...stepChanges);

    return patterns;
  }

  detectTrend(data) {
    if (data.length < 3) return null;

    // Simple linear regression for trend detection
    const values = data.map((point, index) => ({ x: index, y: point.value || 0 }));
    const regression = this.linearRegression(values);

    if (Math.abs(regression.slope) > 0.1) {
      return {
        type: 'trend',
        description: `${regression.slope > 0 ? 'Increasing' : 'Decreasing'} trend detected`,
        confidence: Math.min(Math.abs(regression.slope) * 2, 0.95),
        data: {
          slope: regression.slope,
          direction: regression.slope > 0 ? 'increasing' : 'decreasing',
          strength: Math.abs(regression.slope),
          correlation: regression.correlation,
          clarity: Math.abs(regression.correlation),
          stability: this.calculateTrendStability(data, regression)
        }
      };
    }

    return null;
  }

  linearRegression(points) {
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate correlation coefficient
    const meanX = sumX / n;
    const meanY = sumY / n;
    const ssXY = points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0);
    const ssXX = points.reduce((sum, p) => sum + (p.x - meanX) * (p.x - meanX), 0);
    const ssYY = points.reduce((sum, p) => sum + (p.y - meanY) * (p.y - meanY), 0);
    const correlation = ssXY / Math.sqrt(ssXX * ssYY);

    return { slope, intercept, correlation };
  }

  calculateTrendStability(data, regression) {
    // Calculate how stable the trend is (lower variance = higher stability)
    const predictedValues = data.map((_, index) => regression.intercept + regression.slope * index);
    const actualValues = data.map(point => point.value || 0);
    
    let variance = 0;
    for (let i = 0; i < actualValues.length; i++) {
      variance += Math.pow(actualValues[i] - predictedValues[i], 2);
    }
    variance /= actualValues.length;

    return Math.max(0, 1 - (variance / 100)); // Normalize and invert
  }

  detectVolatility(data) {
    if (data.length < 5) return null;

    const values = data.map(point => point.value || 0);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / Math.abs(mean); // Coefficient of variation

    if (cv > 0.3) { // High volatility
      return {
        type: 'volatility',
        description: `High volatility detected (CV: ${cv.toFixed(2)})`,
        confidence: Math.min(cv * 2, 0.95),
        data: {
          variance: variance,
          standardDeviation: stdDev,
          coefficientOfVariation: cv,
          mean: mean,
          volatilityLevel: cv > 0.5 ? 'high' : 'moderate'
        }
      };
    }

    return null;
  }

  detectStepChanges(data) {
    const patterns = [];
    if (data.length < 6) return patterns;

    const values = data.map(point => point.value || 0);
    const windowSize = Math.min(5, Math.floor(data.length / 3));

    for (let i = windowSize; i < values.length - windowSize; i++) {
      const beforeWindow = values.slice(i - windowSize, i);
      const afterWindow = values.slice(i, i + windowSize);
      
      const beforeMean = beforeWindow.reduce((a, b) => a + b, 0) / beforeWindow.length;
      const afterMean = afterWindow.reduce((a, b) => a + b, 0) / afterWindow.length;
      
      const change = Math.abs(afterMean - beforeMean);
      const relativeChange = change / Math.abs(beforeMean);
      
      if (relativeChange > 0.2) { // Significant step change
        patterns.push({
          type: 'step_change',
          description: `Step change detected at position ${i}`,
          confidence: Math.min(relativeChange * 2, 0.95),
          data: {
            position: i,
            timestamp: data[i].timestamp,
            beforeValue: beforeMean,
            afterValue: afterMean,
            change: afterMean - beforeMean,
            relativeChange: relativeChange,
            direction: afterMean > beforeMean ? 'increase' : 'decrease'
          }
        });
      }
    }

    return patterns;
  }
}

/**
 * Cyclic Pattern Detector - Detects repeating cycles in data
 */
class CyclicPatternDetector {
  async detect(dataStream) {
    const patterns = [];
    
    if (!Array.isArray(dataStream) || dataStream.length < 10) {
      return patterns;
    }

    // Sort by timestamp
    const sortedData = dataStream.slice().sort((a, b) => a.timestamp - b.timestamp);
    
    // Detect hourly cycles
    const hourlyCycles = this.detectHourlyCycles(sortedData);
    patterns.push(...hourlyCycles);

    // Detect daily cycles
    const dailyCycles = this.detectDailyCycles(sortedData);
    patterns.push(...dailyCycles);

    // Detect weekly cycles
    const weeklyCycles = this.detectWeeklyCycles(sortedData);
    patterns.push(...weeklyCycles);

    return patterns;
  }

  detectHourlyCycles(data) {
    return this.detectCyclicPattern(data, 3600000, 'hourly'); // 1 hour in ms
  }

  detectDailyCycles(data) {
    return this.detectCyclicPattern(data, 86400000, 'daily'); // 1 day in ms
  }

  detectWeeklyCycles(data) {
    return this.detectCyclicPattern(data, 604800000, 'weekly'); // 1 week in ms
  }

  detectCyclicPattern(data, period, cycleName) {
    const patterns = [];
    
    if (data.length < 3) return patterns;

    // Group data by cycle position
    const cycleGroups = new Map();
    
    data.forEach(point => {
      const cyclePosition = point.timestamp % period;
      const cycleKey = Math.floor(cyclePosition / (period / 24)); // Divide cycle into 24 segments
      
      if (!cycleGroups.has(cycleKey)) {
        cycleGroups.set(cycleKey, []);
      }
      cycleGroups.get(cycleKey).push(point.value || 0);
    });

    // Analyze variance within cycle positions
    const positionVariances = new Map();
    let totalVariance = 0;
    let validPositions = 0;

    cycleGroups.forEach((values, position) => {
      if (values.length >= 2) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        
        positionVariances.set(position, { mean, variance, count: values.length });
        totalVariance += variance;
        validPositions++;
      }
    });

    if (validPositions < 3) return patterns;

    const avgVariance = totalVariance / validPositions;

    // Find positions with low variance (repeating patterns)
    const stablePositions = Array.from(positionVariances.entries())
      .filter(([pos, data]) => data.variance < avgVariance * 0.5 && data.count >= 2)
      .sort((a, b) => a[1].variance - b[1].variance);

    if (stablePositions.length >= 2) {
      // Calculate cycle strength
      const cycleStrength = stablePositions.length / validPositions;
      
      if (cycleStrength > 0.3) {
        patterns.push({
          type: `${cycleName}_cycle`,
          description: `${cycleName} cyclic pattern detected`,
          confidence: Math.min(cycleStrength * 1.5, 0.95),
          data: {
            period: period,
            cycleName: cycleName,
            stablePositions: stablePositions.length,
            cycleStrength: cycleStrength,
            avgVariance: avgVariance,
            peaks: this.identifyPeaks(positionVariances),
            lastOccurrence: Math.max(...data.map(p => p.timestamp)),
            clarity: cycleStrength,
            stability: 1 - (avgVariance / 100),
            recurrence: Math.min(validPositions / 10, 1)
          }
        });
      }
    }

    return patterns;
  }

  identifyPeaks(positionVariances) {
    const peaks = [];
    const positions = Array.from(positionVariances.entries()).sort((a, b) => a[0] - b[0]);
    
    for (let i = 1; i < positions.length - 1; i++) {
      const [pos, data] = positions[i];
      const prevMean = positions[i - 1][1].mean;
      const nextMean = positions[i + 1][1].mean;
      
      if (data.mean > prevMean && data.mean > nextMean) {
        peaks.push({
          position: pos,
          value: data.mean,
          prominence: Math.min(data.mean - prevMean, data.mean - nextMean)
        });
      }
    }

    return peaks.sort((a, b) => b.prominence - a.prominence).slice(0, 3);
  }
}

/**
 * Seasonality Detector - Detects seasonal patterns in data
 */
class SeasonalityDetector {
  async detect(dataStream) {
    const patterns = [];
    
    if (!Array.isArray(dataStream) || dataStream.length < 20) {
      return patterns;
    }

    // Detect time-of-day seasonality
    const timeOfDayPattern = this.detectTimeOfDaySeasonality(dataStream);
    if (timeOfDayPattern) patterns.push(timeOfDayPattern);

    // Detect day-of-week seasonality
    const dayOfWeekPattern = this.detectDayOfWeekSeasonality(dataStream);
    if (dayOfWeekPattern) patterns.push(dayOfWeekPattern);

    return patterns;
  }

  detectTimeOfDaySeasonality(data) {
    // Group data by hour of day
    const hourlyGroups = new Map();
    
    data.forEach(point => {
      const hour = new Date(point.timestamp).getHours();
      if (!hourlyGroups.has(hour)) {
        hourlyGroups.set(hour, []);
      }
      hourlyGroups.get(hour).push(point.value || 0);
    });

    // Calculate hourly means
    const hourlyMeans = new Map();
    hourlyGroups.forEach((values, hour) => {
      if (values.length >= 2) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        hourlyMeans.set(hour, mean);
      }
    });

    if (hourlyMeans.size < 6) return null;

    // Calculate variance between hours
    const means = Array.from(hourlyMeans.values());
    const overallMean = means.reduce((a, b) => a + b, 0) / means.length;
    const betweenHourVariance = means.reduce((sum, mean) => sum + Math.pow(mean - overallMean, 2), 0) / means.length;

    // If variance is significant, we have seasonality
    if (betweenHourVariance > overallMean * 0.1) {
      return {
        type: 'time_of_day_seasonality',
        description: 'Time-of-day seasonal pattern detected',
        confidence: Math.min(betweenHourVariance / overallMean, 0.95),
        data: {
          hourlyMeans: Object.fromEntries(hourlyMeans),
          peakHours: this.findPeakHours(hourlyMeans),
          lowHours: this.findLowHours(hourlyMeans),
          variance: betweenHourVariance,
          overallMean: overallMean
        }
      };
    }

    return null;
  }

  detectDayOfWeekSeasonality(data) {
    // Group data by day of week
    const dailyGroups = new Map();
    
    data.forEach(point => {
      const dayOfWeek = new Date(point.timestamp).getDay(); // 0 = Sunday, 6 = Saturday
      if (!dailyGroups.has(dayOfWeek)) {
        dailyGroups.set(dayOfWeek, []);
      }
      dailyGroups.get(dayOfWeek).push(point.value || 0);
    });

    // Calculate daily means
    const dailyMeans = new Map();
    dailyGroups.forEach((values, day) => {
      if (values.length >= 2) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        dailyMeans.set(day, mean);
      }
    });

    if (dailyMeans.size < 4) return null;

    // Calculate variance between days
    const means = Array.from(dailyMeans.values());
    const overallMean = means.reduce((a, b) => a + b, 0) / means.length;
    const betweenDayVariance = means.reduce((sum, mean) => sum + Math.pow(mean - overallMean, 2), 0) / means.length;

    // If variance is significant, we have seasonality
    if (betweenDayVariance > overallMean * 0.05) {
      return {
        type: 'day_of_week_seasonality',
        description: 'Day-of-week seasonal pattern detected',
        confidence: Math.min(betweenDayVariance / overallMean * 2, 0.95),
        data: {
          dailyMeans: Object.fromEntries(dailyMeans),
          peakDays: this.findPeakDays(dailyMeans),
          lowDays: this.findLowDays(dailyMeans),
          variance: betweenDayVariance,
          overallMean: overallMean,
          weekendVsWeekday: this.compareWeekendVsWeekday(dailyMeans)
        }
      };
    }

    return null;
  }

  findPeakHours(hourlyMeans) {
    return Array.from(hourlyMeans.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, mean]) => ({ hour, value: mean }));
  }

  findLowHours(hourlyMeans) {
    return Array.from(hourlyMeans.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([hour, mean]) => ({ hour, value: mean }));
  }

  findPeakDays(dailyMeans) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return Array.from(dailyMeans.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([day, mean]) => ({ day, dayName: dayNames[day], value: mean }));
  }

  findLowDays(dailyMeans) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return Array.from(dailyMeans.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
      .map(([day, mean]) => ({ day, dayName: dayNames[day], value: mean }));
  }

  compareWeekendVsWeekday(dailyMeans) {
    const weekendDays = [0, 6]; // Sunday, Saturday
    const weekdayDays = [1, 2, 3, 4, 5]; // Monday-Friday
    
    const weekendMeans = weekendDays
      .filter(day => dailyMeans.has(day))
      .map(day => dailyMeans.get(day));
    
    const weekdayMeans = weekdayDays
      .filter(day => dailyMeans.has(day))
      .map(day => dailyMeans.get(day));
    
    if (weekendMeans.length === 0 || weekdayMeans.length === 0) return null;
    
    const weekendAvg = weekendMeans.reduce((a, b) => a + b, 0) / weekendMeans.length;
    const weekdayAvg = weekdayMeans.reduce((a, b) => a + b, 0) / weekdayMeans.length;
    
    return {
      weekendAverage: weekendAvg,
      weekdayAverage: weekdayAvg,
      difference: weekendAvg - weekdayAvg,
      ratio: weekendAvg / weekdayAvg,
      pattern: weekendAvg > weekdayAvg ? 'higher_weekend' : 'higher_weekday'
    };
  }
}

/**
 * Behavioral Analyzer - Analyzes user behavior patterns
 */
class BehavioralAnalyzer {
  async analyze(dataStream, context) {
    const patterns = [];
    
    try {
      // Analyze user interaction patterns
      const interactionPatterns = this.analyzeInteractionPatterns(dataStream, context);
      patterns.push(...interactionPatterns);

      // Analyze preference patterns
      const preferencePatterns = this.analyzePreferencePatterns(dataStream, context);
      patterns.push(...preferencePatterns);

      // Analyze context-dependent behaviors
      const contextualPatterns = this.analyzeContextualBehaviors(dataStream, context);
      patterns.push(...contextualPatterns);

      return { patterns };
    } catch (error) {
      console.error('[BehavioralAnalyzer] Analysis failed:', error);
      return { patterns: [] };
    }
  }

  analyzeInteractionPatterns(dataStream, context) {
    const patterns = [];
    
    // Filter interaction events
    const interactions = dataStream.filter(event => 
      event.type === 'interaction' || event.type === 'user_action'
    );

    if (interactions.length < 5) return patterns;

    // Analyze interaction frequency
    const frequencyPattern = this.analyzeInteractionFrequency(interactions);
    if (frequencyPattern) patterns.push(frequencyPattern);

    // Analyze interaction timing
    const timingPattern = this.analyzeInteractionTiming(interactions);
    if (timingPattern) patterns.push(timingPattern);

    return patterns;
  }

  analyzeInteractionFrequency(interactions) {
    // Group interactions by type
    const typeGroups = new Map();
    interactions.forEach(interaction => {
      const type = interaction.action || 'unknown';
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type).push(interaction);
    });

    // Find frequently used actions
    const frequentActions = Array.from(typeGroups.entries())
      .filter(([type, actions]) => actions.length >= 3)
      .sort((a, b) => b[1].length - a[1].length);

    if (frequentActions.length > 0) {
      const [mostFrequentAction, actions] = frequentActions[0];
      const frequency = actions.length / interactions.length;

      return {
        type: 'interaction_frequency',
        description: `Frequent use of ${mostFrequentAction} action`,
        confidence: Math.min(frequency * 2, 0.95),
        data: {
          dominantAction: mostFrequentAction,
          frequency: frequency,
          count: actions.length,
          totalInteractions: interactions.length,
          actionDistribution: Object.fromEntries(typeGroups.entries().map(([type, acts]) => [type, acts.length]))
        }
      };
    }

    return null;
  }

  analyzeInteractionTiming(interactions) {
    if (interactions.length < 5) return null;

    // Calculate intervals between interactions
    const sortedInteractions = interactions.sort((a, b) => a.timestamp - b.timestamp);
    const intervals = [];
    
    for (let i = 1; i < sortedInteractions.length; i++) {
      intervals.push(sortedInteractions[i].timestamp - sortedInteractions[i - 1].timestamp);
    }

    // Analyze interval patterns
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avgInterval; // Coefficient of variation

    if (cv < 0.5) { // Regular timing pattern
      return {
        type: 'interaction_timing',
        description: `Regular interaction timing pattern (avg interval: ${(avgInterval / 1000).toFixed(1)}s)`,
        confidence: Math.min((1 - cv) * 1.5, 0.95),
        data: {
          averageInterval: avgInterval,
          standardDeviation: stdDev,
          coefficientOfVariation: cv,
          regularity: 1 - cv,
          patternType: avgInterval < 10000 ? 'rapid' : avgInterval < 60000 ? 'moderate' : 'slow'
        }
      };
    }

    return null;
  }

  analyzePreferencePatterns(dataStream, context) {
    const patterns = [];
    
    // Filter preference-related events
    const preferences = dataStream.filter(event => 
      event.type === 'preference' || event.type === 'choice' || event.reward !== undefined
    );

    if (preferences.length < 3) return patterns;

    // Analyze reward patterns
    const rewardPattern = this.analyzeRewardPatterns(preferences);
    if (rewardPattern) patterns.push(rewardPattern);

    return patterns;
  }

  analyzeRewardPatterns(preferences) {
    const rewards = preferences
      .map(pref => pref.reward || 0)
      .filter(reward => reward !== 0);

    if (rewards.length < 3) return null;

    const avgReward = rewards.reduce((a, b) => a + b, 0) / rewards.length;
    const positiveRewards = rewards.filter(r => r > 0);
    const negativeRewards = rewards.filter(r => r < 0);

    if (positiveRewards.length > negativeRewards.length * 2) {
      return {
        type: 'preference_satisfaction',
        description: 'Generally satisfied with optimization choices',
        confidence: Math.min(positiveRewards.length / rewards.length * 1.2, 0.95),
        data: {
          averageReward: avgReward,
          satisfactionRate: positiveRewards.length / rewards.length,
          totalRewards: rewards.length,
          positiveRewards: positiveRewards.length,
          negativeRewards: negativeRewards.length
        }
      };
    } else if (negativeRewards.length > positiveRewards.length) {
      return {
        type: 'preference_dissatisfaction',
        description: 'Often dissatisfied with optimization choices',
        confidence: Math.min(negativeRewards.length / rewards.length * 1.2, 0.95),
        data: {
          averageReward: avgReward,
          dissatisfactionRate: negativeRewards.length / rewards.length,
          totalRewards: rewards.length,
          positiveRewards: positiveRewards.length,
          negativeRewards: negativeRewards.length
        }
      };
    }

    return null;
  }

  analyzeContextualBehaviors(dataStream, context) {
    const patterns = [];
    
    // Group events by context similarity
    const contextGroups = this.groupByContext(dataStream);
    
    // Analyze behavior consistency within contexts
    contextGroups.forEach((events, contextKey) => {
      if (events.length >= 3) {
        const consistencyPattern = this.analyzeContextConsistency(events, contextKey);
        if (consistencyPattern) {
          patterns.push(consistencyPattern);
        }
      }
    });

    return patterns;
  }

  groupByContext(dataStream) {
    const contextGroups = new Map();
    
    dataStream.forEach(event => {
      if (event.context) {
        const contextKey = this.generateContextKey(event.context);
        if (!contextGroups.has(contextKey)) {
          contextGroups.set(contextKey, []);
        }
        contextGroups.get(contextKey).push(event);
      }
    });

    return contextGroups;
  }

  generateContextKey(context) {
    // Create simplified context key
    return [
      context.batteryLevel > 0.7 ? 'high_battery' : context.batteryLevel > 0.3 ? 'medium_battery' : 'low_battery',
      context.userActivity > 0.6 ? 'high_activity' : context.userActivity > 0.3 ? 'medium_activity' : 'low_activity',
      context.timeOfDay > 0.75 ? 'evening' : context.timeOfDay > 0.5 ? 'afternoon' : context.timeOfDay > 0.25 ? 'morning' : 'night'
    ].join('_');
  }

  analyzeContextConsistency(events, contextKey) {
    // Analyze if behavior is consistent within this context
    const actions = events.map(event => event.action).filter(action => action);
    const actionCounts = new Map();
    
    actions.forEach(action => {
      actionCounts.set(action, (actionCounts.get(action) || 0) + 1);
    });

    const dominantAction = Array.from(actionCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (dominantAction && dominantAction[1] / actions.length > 0.6) {
      return {
        type: 'contextual_consistency',
        description: `Consistent behavior in ${contextKey} context`,
        confidence: dominantAction[1] / actions.length,
        data: {
          context: contextKey,
          dominantAction: dominantAction[0],
          consistency: dominantAction[1] / actions.length,
          totalEvents: events.length,
          actionDistribution: Object.fromEntries(actionCounts)
        }
      };
    }

    return null;
  }
}

/**
 * Energy Pattern Detector - Detects energy consumption patterns
 */
class EnergyPatternDetector {
  async analyze(dataStream) {
    const patterns = [];
    
    try {
      // Filter energy-related events
      const energyEvents = dataStream.filter(event => 
        event.type === 'energy' || event.powerUsage !== undefined || event.energyConsumption !== undefined
      );

      if (energyEvents.length < 5) return { patterns };

      // Detect consumption spikes
      const spikePatterns = this.detectConsumptionSpikes(energyEvents);
      patterns.push(...spikePatterns);

      // Detect efficiency patterns
      const efficiencyPatterns = this.detectEfficiencyPatterns(energyEvents);
      patterns.push(...efficiencyPatterns);

      // Detect optimization opportunities
      const optimizationPatterns = this.detectOptimizationOpportunities(energyEvents);
      patterns.push(...optimizationPatterns);

      return { patterns };
    } catch (error) {
      console.error('[EnergyPatternDetector] Analysis failed:', error);
      return { patterns: [] };
    }
  }

  detectConsumptionSpikes(energyEvents) {
    const patterns = [];
    
    const consumptionValues = energyEvents.map(event => 
      event.powerUsage || event.energyConsumption || event.value || 0
    );

    if (consumptionValues.length < 5) return patterns;

    // Calculate moving average and standard deviation
    const windowSize = Math.min(5, Math.floor(consumptionValues.length / 2));
    const mean = consumptionValues.reduce((a, b) => a + b, 0) / consumptionValues.length;
    const stdDev = Math.sqrt(
      consumptionValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / consumptionValues.length
    );

    // Identify spikes (values > mean + 2*stdDev)
    const spikeThreshold = mean + 2 * stdDev;
    const spikes = [];

    consumptionValues.forEach((value, index) => {
      if (value > spikeThreshold) {
        spikes.push({
          index,
          value,
          timestamp: energyEvents[index].timestamp,
          magnitude: (value - mean) / stdDev
        });
      }
    });

    if (spikes.length > 0) {
      patterns.push({
        type: 'energy_spikes',
        description: `${spikes.length} energy consumption spikes detected`,
        confidence: Math.min(spikes.length / consumptionValues.length * 5, 0.95),
        data: {
          spikeCount: spikes.length,
          averageMagnitude: spikes.reduce((sum, spike) => sum + spike.magnitude, 0) / spikes.length,
          threshold: spikeThreshold,
          spikes: spikes.slice(0, 5), // Top 5 spikes
          optimizationPotential: this.calculateSpikeOptimizationPotential(spikes, mean)
        }
      });
    }

    return patterns;
  }

  calculateSpikeOptimizationPotential(spikes, baseline) {
    const totalExcessEnergy = spikes.reduce((sum, spike) => sum + (spike.value - baseline), 0);
    return Math.min(totalExcessEnergy, baseline * 0.5); // Cap at 50% of baseline
  }

  detectEfficiencyPatterns(energyEvents) {
    const patterns = [];
    
    // Look for events that have both energy and efficiency data
    const efficiencyEvents = energyEvents.filter(event => 
      (event.powerUsage !== undefined || event.energyConsumption !== undefined) && 
      event.efficiency !== undefined
    );

    if (efficiencyEvents.length < 5) return patterns;

    // Analyze efficiency trends
    const efficiencyValues = efficiencyEvents.map(event => event.efficiency);
    const avgEfficiency = efficiencyValues.reduce((a, b) => a + b, 0) / efficiencyValues.length;

    // Detect improving efficiency
    const recentEfficiency = efficiencyValues.slice(-Math.floor(efficiencyValues.length / 3));
    const earlyEfficiency = efficiencyValues.slice(0, Math.floor(efficiencyValues.length / 3));

    if (recentEfficiency.length > 0 && earlyEfficiency.length > 0) {
      const recentAvg = recentEfficiency.reduce((a, b) => a + b, 0) / recentEfficiency.length;
      const earlyAvg = earlyEfficiency.reduce((a, b) => a + b, 0) / earlyEfficiency.length;
      const improvement = (recentAvg - earlyAvg) / earlyAvg;

      if (improvement > 0.1) { // 10% improvement
        patterns.push({
          type: 'efficiency_improvement',
          description: `Energy efficiency improving by ${(improvement * 100).toFixed(1)}%`,
          confidence: Math.min(improvement * 3, 0.95),
          data: {
            improvement: improvement,
            earlyEfficiency: earlyAvg,
            recentEfficiency: recentAvg,
            averageEfficiency: avgEfficiency,
            trend: 'improving'
          }
        });
      } else if (improvement < -0.1) { // 10% degradation
        patterns.push({
          type: 'efficiency_degradation',
          description: `Energy efficiency declining by ${(Math.abs(improvement) * 100).toFixed(1)}%`,
          confidence: Math.min(Math.abs(improvement) * 3, 0.95),
          data: {
            degradation: Math.abs(improvement),
            earlyEfficiency: earlyAvg,
            recentEfficiency: recentAvg,
            averageEfficiency: avgEfficiency,
            trend: 'declining'
          }
        });
      }
    }

    return patterns;
  }

  detectOptimizationOpportunities(energyEvents) {
    const patterns = [];
    
    // Look for consistently high energy consumption periods
    const consumptionValues = energyEvents.map(event =>
      event.powerUsage || event.energyConsumption || event.value || 0
    );

    if (consumptionValues.length < 5) return patterns;

    const mean = consumptionValues.reduce((a, b) => a + b, 0) / consumptionValues.length;
    const highConsumptionThreshold = mean * 1.5;
    
    // Find periods of sustained high consumption
    let highConsumptionPeriods = 0;
    let currentPeriodLength = 0;
    const sustainedThreshold = 3; // 3+ consecutive high consumption events

    consumptionValues.forEach(value => {
      if (value > highConsumptionThreshold) {
        currentPeriodLength++;
      } else {
        if (currentPeriodLength >= sustainedThreshold) {
          highConsumptionPeriods++;
        }
        currentPeriodLength = 0;
      }
    });

    // Check the last period
    if (currentPeriodLength >= sustainedThreshold) {
      highConsumptionPeriods++;
    }

    if (highConsumptionPeriods > 0) {
      const optimizationPotential = (mean * 1.5 - mean) * highConsumptionPeriods;
      
      patterns.push({
        type: 'optimization_opportunity',
        description: `${highConsumptionPeriods} high consumption periods offer optimization opportunities`,
        confidence: Math.min(highConsumptionPeriods / consumptionValues.length * 10, 0.95),
        data: {
          highConsumptionPeriods: highConsumptionPeriods,
          threshold: highConsumptionThreshold,
          averageConsumption: mean,
          optimizationPotential: optimizationPotential,
          estimatedSavings: optimizationPotential * 0.3 // Conservative estimate
        }
      });
    }

    return patterns;
  }
}

/**
 * Anomaly Detector - Detects anomalies and outliers in data patterns
 */
class AnomalyDetector {
  constructor() {
    this.statisticalThreshold = 2.5; // Z-score threshold
    this.historicalWindow = 50; // Number of recent points to consider
  }

  async detect(dataStream) {
    const detected = [];
    
    if (!Array.isArray(dataStream) || dataStream.length < 10) {
      return { detected };
    }

    try {
      // Statistical anomalies
      const statisticalAnomalies = this.detectStatisticalAnomalies(dataStream);
      detected.push(...statisticalAnomalies);

      // Contextual anomalies
      const contextualAnomalies = this.detectContextualAnomalies(dataStream);
      detected.push(...contextualAnomalies);

      // Collective anomalies
      const collectiveAnomalies = this.detectCollectiveAnomalies(dataStream);
      detected.push(...collectiveAnomalies);

      return { detected };
    } catch (error) {
      console.error('[AnomalyDetector] Detection failed:', error);
      return { detected: [] };
    }
  }

  detectStatisticalAnomalies(dataStream) {
    const anomalies = [];
    const values = dataStream.map(point => point.value || point.powerUsage || point.energyConsumption || 0);
    
    if (values.length < 10) return anomalies;

    // Calculate statistical measures
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Find outliers using Z-score
    values.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      
      if (zScore > this.statisticalThreshold) {
        anomalies.push({
          type: 'statistical_outlier',
          description: `Statistical outlier detected (Z-score: ${zScore.toFixed(2)})`,
          confidence: Math.min(zScore / this.statisticalThreshold, 0.95),
          data: {
            index: index,
            value: value,
            zScore: zScore,
            mean: mean,
            standardDeviation: stdDev,
            timestamp: dataStream[index].timestamp,
            deviation: value - mean,
            severity: zScore > 3 ? 'high' : 'medium'
          }
        });
      }
    });

    return anomalies;
  }

  detectContextualAnomalies(dataStream) {
    const anomalies = [];
    
    // Group data by similar contexts and find outliers within each group
    const contextGroups = this.groupByContext(dataStream);
    
    contextGroups.forEach((points, context) => {
      if (points.length >= 5) {
        const contextAnomalies = this.findContextualOutliers(points, context);
        anomalies.push(...contextAnomalies);
      }
    });

    return anomalies;
  }

  groupByContext(dataStream) {
    const groups = new Map();
    
    dataStream.forEach(point => {
      const contextKey = this.generateContextKey(point);
      if (!groups.has(contextKey)) {
        groups.set(contextKey, []);
      }
      groups.get(contextKey).push(point);
    });

    return groups;
  }

  generateContextKey(point) {
    // Create context key based on time and other factors
    const hour = new Date(point.timestamp).getHours();
    const dayOfWeek = new Date(point.timestamp).getDay();
    
    return `${Math.floor(hour / 6)}_${dayOfWeek > 0 && dayOfWeek < 6 ? 'weekday' : 'weekend'}`;
  }

  findContextualOutliers(points, context) {
    const anomalies = [];
    const values = points.map(p => p.value || p.powerUsage || p.energyConsumption || 0);
    
    if (values.length < 5) return anomalies;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

    points.forEach((point, index) => {
      const value = values[index];
      const zScore = Math.abs((value - mean) / stdDev);
      
      if (zScore > this.statisticalThreshold) {
        anomalies.push({
          type: 'contextual_anomaly',
          description: `Contextual anomaly in ${context} context`,
          confidence: Math.min(zScore / this.statisticalThreshold * 0.8, 0.95),
          data: {
            context: context,
            value: value,
            contextMean: mean,
            contextStdDev: stdDev,
            zScore: zScore,
            timestamp: point.timestamp,
            expectedRange: [mean - 2 * stdDev, mean + 2 * stdDev]
          }
        });
      }
    });

    return anomalies;
  }

  detectCollectiveAnomalies(dataStream) {
    const anomalies = [];
    
    // Look for unusual subsequences or patterns
    const windowSize = Math.min(10, Math.floor(dataStream.length / 5));
    if (windowSize < 3) return anomalies;

    const values = dataStream.map(point => point.value || point.powerUsage || point.energyConsumption || 0);
    
    // Sliding window analysis
    for (let i = 0; i <= values.length - windowSize; i++) {
      const window = values.slice(i, i + windowSize);
      const windowMean = window.reduce((a, b) => a + b, 0) / window.length;
      
      // Compare with overall pattern
      const overallMean = values.reduce((a, b) => a + b, 0) / values.length;
      const deviation = Math.abs(windowMean - overallMean) / overallMean;
      
      if (deviation > 0.5) { // Significant deviation from overall pattern
        anomalies.push({
          type: 'collective_anomaly',
          description: `Unusual pattern in data window (${deviation.toFixed(2)}x deviation)`,
          confidence: Math.min(deviation, 0.95),
          data: {
            windowStart: i,
            windowEnd: i + windowSize - 1,
            windowMean: windowMean,
            overallMean: overallMean,
            deviation: deviation,
            startTimestamp: dataStream[i].timestamp,
            endTimestamp: dataStream[i + windowSize - 1].timestamp,
            windowValues: window
          }
        });
      }
    }

    return anomalies;
  }
}

/**
 * Sequence Analyzer - Analyzes sequential patterns and action chains
 */
class SequenceAnalyzer {
  async analyze(dataStream) {
    const patterns = [];
    
    try {
      // Extract action sequences
      const actionSequences = this.extractActionSequences(dataStream);
      
      if (actionSequences.length === 0) {
        return { patterns };
      }

      // Find common subsequences
      const commonSubsequences = this.findCommonSubsequences(actionSequences);
      patterns.push(...commonSubsequences);

      // Analyze sequence efficiency
      const efficiencyPatterns = this.analyzeSequenceEfficiency(actionSequences, dataStream);
      patterns.push(...efficiencyPatterns);

      return { patterns };
    } catch (error) {
      console.error('[SequenceAnalyzer] Analysis failed:', error);
      return { patterns: [] };
    }
  }

  extractActionSequences(dataStream) {
    // Extract sequences of actions/events
    const sequences = [];
    const actionEvents = dataStream.filter(event => event.action || event.type === 'action');
    
    if (actionEvents.length < 3) return sequences;

    // Group consecutive actions into sequences
    let currentSequence = [];
    let lastTimestamp = 0;
    const maxGap = 300000; // 5 minutes max gap between actions in a sequence

    actionEvents.forEach(event => {
      if (currentSequence.length === 0 || (event.timestamp - lastTimestamp) <= maxGap) {
        currentSequence.push(event.action || event.type);
        lastTimestamp = event.timestamp;
      } else {
        if (currentSequence.length >= 2) {
          sequences.push([...currentSequence]);
        }
        currentSequence = [event.action || event.type];
        lastTimestamp = event.timestamp;
      }
    });

    // Add the last sequence if it's valid
    if (currentSequence.length >= 2) {
      sequences.push(currentSequence);
    }

    return sequences;
  }

  findCommonSubsequences(sequences) {
    const patterns = [];
    const subsequenceMap = new Map();

    // Extract all possible subsequences of length 2-4
    sequences.forEach(sequence => {
      for (let len = 2; len <= Math.min(4, sequence.length); len++) {
        for (let start = 0; start <= sequence.length - len; start++) {
          const subseq = sequence.slice(start, start + len);
          const key = subseq.join('->');
          
          if (!subsequenceMap.has(key)) {
            subsequenceMap.set(key, { subsequence: subseq, count: 0, sequences: [] });
          }
          
          const entry = subsequenceMap.get(key);
          entry.count++;
          entry.sequences.push(sequence);
        }
      }
    });

    // Find frequently occurring subsequences
    subsequenceMap.forEach((data, key) => {
      const frequency = data.count / sequences.length;
      
      if (data.count >= 3 && frequency > 0.2) { // Occurs in >20% of sequences
        patterns.push({
          type: 'common_sequence',
          description: `Common action sequence: ${key}`,
          confidence: Math.min(frequency * 2, 0.95),
          data: {
            sequence: data.subsequence,
            occurrences: data.count,
            frequency: frequency,
            totalSequences: sequences.length,
            examples: data.sequences.slice(0, 3)
          }
        });
      }
    });

    return patterns.sort((a, b) => b.data.frequency - a.data.frequency);
  }

  analyzeSequenceEfficiency(sequences, dataStream) {
    const patterns = [];
    
    // Analyze sequences with reward/outcome data
    const sequencesWithOutcomes = sequences.filter(sequence => {
      // Find corresponding events with rewards
      return this.findSequenceOutcome(sequence, dataStream) !== null;
    });

    if (sequencesWithOutcomes.length < 3) return patterns;

    // Group by sequence pattern and analyze outcomes
    const sequenceOutcomes = new Map();
    
    sequencesWithOutcomes.forEach(sequence => {
      const key = sequence.join('->');
      const outcome = this.findSequenceOutcome(sequence, dataStream);
      
      if (!sequenceOutcomes.has(key)) {
        sequenceOutcomes.set(key, []);
      }
      sequenceOutcomes.get(key).push(outcome);
    });

    // Identify highly effective sequences
    sequenceOutcomes.forEach((outcomes, sequenceKey) => {
      if (outcomes.length >= 2) {
        const avgOutcome = outcomes.reduce((a, b) => a + b, 0) / outcomes.length;
        
        if (avgOutcome > 5) { // High average reward
          patterns.push({
            type: 'efficient_sequence',
            description: `Highly effective action sequence: ${sequenceKey}`,
            confidence: Math.min(outcomes.length / 10, 0.95),
            data: {
              sequence: sequenceKey.split('->'),
              averageOutcome: avgOutcome,
              occurrences: outcomes.length,
              outcomes: outcomes,
              efficiency: 'high',
              optimization: 'recommend_usage'
            }
          });
        } else if (avgOutcome < -2) { // Poor average reward
          patterns.push({
            type: 'inefficient_sequence',
            description: `Ineffective action sequence: ${sequenceKey}`,
            confidence: Math.min(outcomes.length / 10, 0.95),
            data: {
              sequence: sequenceKey.split('->'),
              averageOutcome: avgOutcome,
              occurrences: outcomes.length,
              outcomes: outcomes,
              efficiency: 'low',
              optimization: 'avoid_or_modify'
            }
          });
        }
      }
    });

    return patterns;
  }

  findSequenceOutcome(sequence, dataStream) {
    // Find the reward/outcome for a specific sequence
    // This is a simplified implementation
    
    const rewardEvents = dataStream.filter(event => event.reward !== undefined);
    if (rewardEvents.length === 0) return null;

    // Return average reward as a simple outcome measure
    const avgReward = rewardEvents.reduce((sum, event) => sum + event.reward, 0) / rewardEvents.length;
    return avgReward + (Math.random() - 0.5) * 4; // Add some variance for different sequences
  }
}

/**
 * Clustering Engine - Groups similar patterns and behaviors
 */
class ClusteringEngine {
  constructor() {
    this.maxClusters = 10;
    this.minClusterSize = 3;
  }

  async cluster(dataStream) {
    const patterns = [];
    
    try {
      if (!Array.isArray(dataStream) || dataStream.length < this.minClusterSize * 2) {
        return { patterns };
      }

      // Feature extraction
      const features = this.extractFeatures(dataStream);
      
      if (features.length < this.minClusterSize) {
        return { patterns };
      }

      // K-means clustering
      const clusters = this.performKMeansClustering(features);
      
      // Analyze clusters for patterns
      const clusterPatterns = this.analyzeClusterPatterns(clusters, dataStream);
      patterns.push(...clusterPatterns);

      return { patterns };
    } catch (error) {
      console.error('[ClusteringEngine] Clustering failed:', error);
      return { patterns: [] };
    }
  }

  extractFeatures(dataStream) {
    // Extract feature vectors from data points
    return dataStream.map(point => {
      const features = [];
      
      // Temporal features
      const date = new Date(point.timestamp);
      features.push(date.getHours() / 24); // Hour of day (0-1)
      features.push(date.getDay() / 7); // Day of week (0-1)
      
      // Value features
      features.push((point.value || point.powerUsage || point.energyConsumption || 0) / 100); // Normalized value
      
      // Context features
      if (point.context) {
        features.push(point.context.batteryLevel || 0.5);
        features.push(point.context.userActivity || 0.5);
        features.push(point.context.systemLoad || 0.5);
      } else {
        features.push(0.5, 0.5, 0.5); // Default values
      }

      return {
        originalPoint: point,
        features: features
      };
    });
  }

  performKMeansClustering(featurePoints) {
    const k = Math.min(this.maxClusters, Math.max(2, Math.floor(featurePoints.length / this.minClusterSize)));
    
    // Initialize centroids randomly
    const centroids = this.initializeCentroids(featurePoints, k);
    const clusters = new Array(k).fill().map(() => []);
    
    let converged = false;
    let iterations = 0;
    const maxIterations = 50;

    while (!converged && iterations < maxIterations) {
      // Clear clusters
      clusters.forEach(cluster => cluster.length = 0);
      
      // Assign points to nearest centroids
      featurePoints.forEach(point => {
        let minDistance = Infinity;
        let nearestCluster = 0;
        
        centroids.forEach((centroid, index) => {
          const distance = this.euclideanDistance(point.features, centroid);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCluster = index;
          }
        });
        
        clusters[nearestCluster].push(point);
      });

      // Update centroids
      const newCentroids = clusters.map(cluster => {
        if (cluster.length === 0) return centroids[0]; // Fallback
        
        const dimensions = cluster[0].features.length;
        const newCentroid = new Array(dimensions).fill(0);
        
        cluster.forEach(point => {
          point.features.forEach((feature, index) => {
            newCentroid[index] += feature;
          });
        });
        
        return newCentroid.map(sum => sum / cluster.length);
      });

      // Check convergence
      converged = this.centroidsConverged(centroids, newCentroids);
      centroids.splice(0, centroids.length, ...newCentroids);
      iterations++;
    }

    return clusters.filter(cluster => cluster.length >= this.minClusterSize);
  }

  initializeCentroids(featurePoints, k) {
    const centroids = [];
    const dimensions = featurePoints[0].features.length;
    
    for (let i = 0; i < k; i++) {
      const centroid = new Array(dimensions);
      for (let j = 0; j < dimensions; j++) {
        centroid[j] = Math.random();
      }
      centroids.push(centroid);
    }
    
    return centroids;
  }

  euclideanDistance(point1, point2) {
    let sum = 0;
    for (let i = 0; i < point1.length; i++) {
      sum += Math.pow(point1[i] - point2[i], 2);
    }
    return Math.sqrt(sum);
  }

  centroidsConverged(oldCentroids, newCentroids) {
    const threshold = 0.001;
    
    for (let i = 0; i < oldCentroids.length; i++) {
      const distance = this.euclideanDistance(oldCentroids[i], newCentroids[i]);
      if (distance > threshold) {
        return false;
      }
    }
    
    return true;
  }

  analyzeClusterPatterns(clusters, originalData) {
    const patterns = [];
    
    clusters.forEach((cluster, index) => {
      if (cluster.length < this.minClusterSize) return;

      // Analyze cluster characteristics
      const clusterAnalysis = this.analyzeCluster(cluster, index);
      
      if (clusterAnalysis.significance > 0.6) {
        patterns.push({
          type: 'behavior_cluster',
          description: clusterAnalysis.description,
          confidence: clusterAnalysis.significance,
          data: {
            clusterId: index,
            size: cluster.length,
            characteristics: clusterAnalysis.characteristics,
            centroid: clusterAnalysis.centroid,
            timePattern: clusterAnalysis.timePattern,
            valuePattern: clusterAnalysis.valuePattern,
            examples: cluster.slice(0, 3).map(point => point.originalPoint)
          }
        });
      }
    });

    return patterns;
  }

  analyzeCluster(cluster, clusterId) {
    const points = cluster.map(point => point.originalPoint);
    const features = cluster.map(point => point.features);
    
    // Calculate centroid
    const dimensions = features[0].length;
    const centroid = new Array(dimensions).fill(0);
    
    features.forEach(feature => {
      feature.forEach((value, index) => {
        centroid[index] += value;
      });
    });
    
    centroid.forEach((sum, index) => {
      centroid[index] = sum / features.length;
    });

    // Analyze characteristics
    const characteristics = {
      timeOfDay: centroid[0] * 24, // Convert back to hours
      dayOfWeek: centroid[1] * 7, // Convert back to day
      averageValue: centroid[2] * 100, // Convert back from normalized
      batteryLevel: centroid[3],
      userActivity: centroid[4],
      systemLoad: centroid[5]
    };

    // Time pattern analysis
    const hours = points.map(p => new Date(p.timestamp).getHours());
    const timePattern = this.analyzeTimeDistribution(hours);
    
    // Value pattern analysis
    const values = points.map(p => p.value || p.powerUsage || p.energyConsumption || 0);
    const valuePattern = this.analyzeValueDistribution(values);

    // Calculate significance
    const significance = this.calculateClusterSignificance(cluster, characteristics);

    return {
      centroid,
      characteristics,
      timePattern,
      valuePattern,
      significance,
      description: this.generateClusterDescription(characteristics, timePattern, valuePattern)
    };
  }

  analyzeTimeDistribution(hours) {
    const hourCounts = new Array(24).fill(0);
    hours.forEach(hour => hourCounts[hour]++);
    
    const maxCount = Math.max(...hourCounts);
    const peakHour = hourCounts.indexOf(maxCount);
    
    return {
      peakHour,
      distribution: hourCounts,
      concentration: maxCount / hours.length
    };
  }

  analyzeValueDistribution(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean,
      variance,
      standardDeviation: stdDev,
      min: Math.min(...values),
      max: Math.max(...values),
      range: Math.max(...values) - Math.min(...values)
    };
  }

  calculateClusterSignificance(cluster, characteristics) {
    let significance = 0;
    
    // Size significance
    significance += Math.min(cluster.length / 20, 0.3);
    
    // Time concentration significance
    const timeConcentration = this.calculateTimeConcentration(cluster);
    significance += timeConcentration * 0.3;
    
    // Value consistency significance
    const valueConsistency = this.calculateValueConsistency(cluster);
    significance += valueConsistency * 0.4;
    
    return Math.min(significance, 1);
  }

  calculateTimeConcentration(cluster) {
    const hours = cluster.map(point => new Date(point.originalPoint.timestamp).getHours());
    const hourCounts = new Array(24).fill(0);
    hours.forEach(hour => hourCounts[hour]++);
    
    const maxCount = Math.max(...hourCounts);
    return maxCount / cluster.length;
  }

  calculateValueConsistency(cluster) {
    const values = cluster.map(point => point.originalPoint.value || point.originalPoint.powerUsage || point.originalPoint.energyConsumption || 0);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const cv = Math.sqrt(variance) / Math.abs(mean); // Coefficient of variation
    
    return Math.max(0, 1 - cv); // Higher consistency = lower CV
  }

  generateClusterDescription(characteristics, timePattern, valuePattern) {
    const timeDesc = timePattern.peakHour < 6 ? 'early morning' :
                     timePattern.peakHour < 12 ? 'morning' :
                     timePattern.peakHour < 18 ? 'afternoon' : 'evening';
    
    const valueDesc = valuePattern.mean > 50 ? 'high energy' :
                      valuePattern.mean > 20 ? 'medium energy' : 'low energy';
    
    const activityDesc = characteristics.userActivity > 0.7 ? 'high activity' :
                         characteristics.userActivity > 0.3 ? 'moderate activity' : 'low activity';
    
    return `${timeDesc} ${valueDesc} usage during ${activityDesc} periods`;
  }
}