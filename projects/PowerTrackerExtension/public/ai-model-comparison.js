/**
 * AI Model Comparison and Benchmarking System
 * Provides comprehensive model comparison, benchmarking, and analytics
 * Integrates with the Enhanced AI Energy Database
 */

/**
 * AI Model Comparison Engine
 * Handles model comparisons, benchmarking, and analytics
 */
class AIModelComparisonEngine {
  constructor(enhancedManager) {
    this.enhancedManager = enhancedManager;
    this.modelDatabase = window.ENHANCED_AI_MODEL_DATABASE || {};
    this.usageHistory = [];
    this.benchmarkWeights = {
      energy: 0.3,
      intelligence: 0.25,
      performance: 0.2,
      cost: 0.15,
      carbon: 0.1
    };
    this.init();
  }

  init() {
    console.log('[AIModelComparisonEngine] Initializing comparison engine...');
    this.loadUsageHistory();
    this.calculateGlobalBenchmarks();
  }

  /**
   * Load historical usage data for analysis
   */
  loadUsageHistory() {
    try {
      const stored = localStorage.getItem('ai_usage_history');
      this.usageHistory = stored ? JSON.parse(stored) : [];
      console.log('[AIModelComparisonEngine] Loaded usage history:', this.usageHistory.length, 'entries');
    } catch (error) {
      console.warn('[AIModelComparisonEngine] Failed to load usage history:', error);
      this.usageHistory = [];
    }
  }

  /**
   * Save usage data to history
   */
  saveUsageToHistory(usage) {
    if (!usage || !usage.model) return;

    const historyEntry = {
      timestamp: Date.now(),
      model: usage.model,
      usage: {
        queries: usage.queries || 0,
        energy: usage.energy?.mean || 0,
        carbon: usage.carbon?.mean || 0,
        water: usage.water?.mean || 0
      },
      context: {
        batteryLevel: usage.context?.batteryLevel,
        performanceMode: usage.context?.performanceMode
      }
    };

    this.usageHistory.push(historyEntry);
    
    // Keep only last 1000 entries
    if (this.usageHistory.length > 1000) {
      this.usageHistory = this.usageHistory.slice(-1000);
    }

    // Save to localStorage
    try {
      localStorage.setItem('ai_usage_history', JSON.stringify(this.usageHistory));
    } catch (error) {
      console.warn('[AIModelComparisonEngine] Failed to save usage history:', error);
    }
  }

  /**
   * Calculate global benchmarks for comparison baseline
   */
  calculateGlobalBenchmarks() {
    const models = Object.values(this.modelDatabase);
    if (models.length === 0) return;

    this.benchmarks = {
      energy: {
        min: Math.min(...models.map(m => m.energy?.meanCombined || Infinity)),
        max: Math.max(...models.map(m => m.energy?.meanCombined || 0)),
        average: models.reduce((sum, m) => sum + (m.energy?.meanCombined || 0), 0) / models.length
      },
      carbon: {
        min: Math.min(...models.map(m => m.carbon?.meanCombined || Infinity)),
        max: Math.max(...models.map(m => m.carbon?.meanCombined || 0)),
        average: models.reduce((sum, m) => sum + (m.carbon?.meanCombined || 0), 0) / models.length
      },
      water: {
        min: Math.min(...models.map(m => m.water?.meanCombined || Infinity)),
        max: Math.max(...models.map(m => m.water?.meanCombined || 0)),
        average: models.reduce((sum, m) => sum + (m.water?.meanCombined || 0), 0) / models.length
      },
      intelligence: {
        min: Math.min(...models.map(m => m.aiIntelligenceIndex || Infinity)),
        max: Math.max(...models.map(m => m.aiIntelligenceIndex || 0)),
        average: models.reduce((sum, m) => sum + (m.aiIntelligenceIndex || 0), 0) / models.length
      }
    };

    console.log('[AIModelComparisonEngine] Global benchmarks calculated:', this.benchmarks);
  }

  /**
   * Compare multiple models side-by-side
   */
  compareModels(modelKeys, criteria = 'all') {
    const comparisons = [];
    
    for (const key of modelKeys) {
      const model = this.modelDatabase[key];
      if (!model) continue;

      const comparison = {
        key,
        name: model.name,
        company: model.company,
        category: model.category,
        size: model.size,
        contextWindow: model.contextWindow,
        intelligence: model.aiIntelligenceIndex,
        
        // Energy metrics
        energy: {
          mean: model.energy.meanCombined,
          min: model.energy.meanMin,
          max: model.energy.meanMax,
          std: model.energy.stdCombined,
          percentile: this.calculatePercentile('energy', model.energy.meanCombined)
        },
        
        // Carbon metrics
        carbon: {
          mean: model.carbon.meanCombined,
          min: model.carbon.meanMin,
          max: model.carbon.meanMax,
          std: model.carbon.stdCombined,
          percentile: this.calculatePercentile('carbon', model.carbon.meanCombined)
        },
        
        // Water metrics
        water: {
          mean: model.water.meanCombined,
          min: model.water.meanMin,
          max: model.water.meanMax,
          std: model.water.stdCombined,
          percentile: this.calculatePercentile('water', model.water.meanCombined)
        },
        
        // Performance metrics
        performance: {
          tokensPerSecond: model.performance?.medianTokensPerSecond || 0,
          firstChunk: model.performance?.medianFirstChunk || 0,
          queryLength: model.performance?.queryLength || 'Unknown'
        },
        
        // Benchmarks
        benchmarks: model.benchmarks || {},
        
        // Calculated scores
        scores: {
          efficiency: this.calculateEfficiencyScore(model),
          sustainability: this.calculateSustainabilityScore(model),
          performance: this.calculatePerformanceScore(model),
          overall: this.calculateOverallScore(model)
        },
        
        // Economic metrics
        pricing: model.pricing,
        costEfficiency: this.calculateCostEfficiency(model),
        
        // Usage statistics from history
        usage: this.getModelUsageStats(key)
      };

      comparisons.push(comparison);
    }

    // Sort by overall score by default
    comparisons.sort((a, b) => b.scores.overall - a.scores.overall);
    
    return {
      models: comparisons,
      summary: this.generateComparisonSummary(comparisons),
      recommendations: this.generateRecommendations(comparisons)
    };
  }

  /**
   * Calculate percentile ranking for a metric
   */
  calculatePercentile(metric, value) {
    if (!this.benchmarks || !this.benchmarks[metric]) return 50;
    
    const { min, max } = this.benchmarks[metric];
    if (max === min) return 50;
    
    // For energy, carbon, water - lower is better (reverse percentile)
    if (['energy', 'carbon', 'water'].includes(metric)) {
      return Math.round((1 - (value - min) / (max - min)) * 100);
    }
    
    // For intelligence - higher is better (normal percentile)
    return Math.round(((value - min) / (max - min)) * 100);
  }

  /**
   * Calculate efficiency score (intelligence per unit energy)
   */
  calculateEfficiencyScore(model) {
    const intelligence = model.aiIntelligenceIndex || 1;
    const energy = model.energy.meanCombined || 1;
    return Math.round((intelligence / energy) * 100) / 100;
  }

  /**
   * Calculate sustainability score
   */
  calculateSustainabilityScore(model) {
    const energyScore = this.calculatePercentile('energy', model.energy.meanCombined);
    const carbonScore = this.calculatePercentile('carbon', model.carbon.meanCombined);
    const waterScore = this.calculatePercentile('water', model.water.meanCombined);
    
    return Math.round((energyScore * 0.4 + carbonScore * 0.35 + waterScore * 0.25));
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(model) {
    const intelligence = model.aiIntelligenceIndex || 0;
    const tokensPerSecond = model.performance?.medianTokensPerSecond || 0;
    const benchmarkAvg = Object.values(model.benchmarks || {})
      .filter(v => v !== null && !isNaN(v))
      .reduce((sum, v) => sum + v, 0) / Math.max(1, Object.keys(model.benchmarks || {}).length);
    
    // Normalize and combine scores
    const intelligenceScore = Math.min(100, (intelligence / 70) * 100); // Normalize to 70 as max
    const speedScore = Math.min(100, (tokensPerSecond / 300) * 100); // Normalize to 300 as max
    const benchmarkScore = Math.min(100, benchmarkAvg); // Already a percentage
    
    return Math.round(intelligenceScore * 0.5 + speedScore * 0.3 + benchmarkScore * 0.2);
  }

  /**
   * Calculate overall weighted score
   */
  calculateOverallScore(model) {
    const efficiency = this.calculateEfficiencyScore(model);
    const sustainability = this.calculateSustainabilityScore(model);
    const performance = this.calculatePerformanceScore(model);
    const intelligence = Math.min(100, (model.aiIntelligenceIndex / 70) * 100);
    
    return Math.round(
      efficiency * 0.3 +
      sustainability * 0.25 +
      performance * 0.25 +
      intelligence * 0.2
    );
  }

  /**
   * Calculate cost efficiency (intelligence per dollar)
   */
  calculateCostEfficiency(model) {
    if (!model.pricing) return 0;
    
    // Extract numeric cost from pricing string
    const costMatch = model.pricing.match(/\$([0-9.]+)/);
    if (!costMatch) return 0;
    
    const cost = parseFloat(costMatch[1]);
    const intelligence = model.aiIntelligenceIndex || 1;
    
    return Math.round((intelligence / cost) * 100) / 100;
  }

  /**
   * Get usage statistics for a specific model
   */
  getModelUsageStats(modelKey) {
    const modelUsage = this.usageHistory.filter(entry => 
      entry.model?.name === this.modelDatabase[modelKey]?.name
    );

    if (modelUsage.length === 0) {
      return {
        totalQueries: 0,
        totalEnergy: 0,
        totalCarbon: 0,
        averageQueriesPerSession: 0,
        lastUsed: null,
        usageFrequency: 'Never used'
      };
    }

    const totalQueries = modelUsage.reduce((sum, entry) => sum + entry.usage.queries, 0);
    const totalEnergy = modelUsage.reduce((sum, entry) => sum + entry.usage.energy, 0);
    const totalCarbon = modelUsage.reduce((sum, entry) => sum + entry.usage.carbon, 0);
    const lastUsed = Math.max(...modelUsage.map(entry => entry.timestamp));

    return {
      totalQueries,
      totalEnergy: Math.round(totalEnergy * 1000) / 1000,
      totalCarbon: Math.round(totalCarbon * 1000) / 1000,
      averageQueriesPerSession: Math.round(totalQueries / modelUsage.length * 10) / 10,
      lastUsed,
      usageFrequency: this.getUsageFrequency(modelUsage.length)
    };
  }

  /**
   * Determine usage frequency category
   */
  getUsageFrequency(usageCount) {
    if (usageCount === 0) return 'Never used';
    if (usageCount < 5) return 'Rarely used';
    if (usageCount < 20) return 'Occasionally used';
    if (usageCount < 50) return 'Frequently used';
    return 'Heavily used';
  }

  /**
   * Generate comparison summary
   */
  generateComparisonSummary(comparisons) {
    if (comparisons.length === 0) return {};

    const mostEfficient = comparisons.reduce((best, current) => 
      current.scores.efficiency > best.scores.efficiency ? current : best
    );

    const mostSustainable = comparisons.reduce((best, current) => 
      current.scores.sustainability > best.scores.sustainability ? current : best
    );

    const highestPerformance = comparisons.reduce((best, current) => 
      current.scores.performance > best.scores.performance ? current : best
    );

    const lowestEnergy = comparisons.reduce((best, current) => 
      current.energy.mean < best.energy.mean ? current : best
    );

    const lowestCarbon = comparisons.reduce((best, current) => 
      current.carbon.mean < best.carbon.mean ? current : best
    );

    return {
      totalModels: comparisons.length,
      mostEfficient: {
        name: mostEfficient.name,
        score: mostEfficient.scores.efficiency
      },
      mostSustainable: {
        name: mostSustainable.name,
        score: mostSustainable.scores.sustainability
      },
      highestPerformance: {
        name: highestPerformance.name,
        score: highestPerformance.scores.performance
      },
      lowestEnergy: {
        name: lowestEnergy.name,
        value: lowestEnergy.energy.mean
      },
      lowestCarbon: {
        name: lowestCarbon.name,
        value: lowestCarbon.carbon.mean
      },
      averages: {
        efficiency: Math.round(comparisons.reduce((sum, m) => sum + m.scores.efficiency, 0) / comparisons.length * 100) / 100,
        sustainability: Math.round(comparisons.reduce((sum, m) => sum + m.scores.sustainability, 0) / comparisons.length),
        performance: Math.round(comparisons.reduce((sum, m) => sum + m.scores.performance, 0) / comparisons.length),
        energy: Math.round(comparisons.reduce((sum, m) => sum + m.energy.mean, 0) / comparisons.length * 1000) / 1000,
        carbon: Math.round(comparisons.reduce((sum, m) => sum + m.carbon.mean, 0) / comparisons.length * 1000) / 1000
      }
    };
  }

  /**
   * Generate contextual recommendations
   */
  generateRecommendations(comparisons) {
    if (comparisons.length === 0) return [];

    const recommendations = [];

    // Best overall choice
    const bestOverall = comparisons[0]; // Already sorted by overall score
    recommendations.push({
      type: 'best-overall',
      title: 'Best Overall Choice',
      model: bestOverall.name,
      reason: `Highest overall score (${bestOverall.scores.overall}/100) with balanced performance and efficiency`,
      metrics: {
        efficiency: bestOverall.scores.efficiency,
        sustainability: bestOverall.scores.sustainability,
        performance: bestOverall.scores.performance
      }
    });

    // Most efficient choice
    const mostEfficient = comparisons.reduce((best, current) => 
      current.scores.efficiency > best.scores.efficiency ? current : best
    );
    if (mostEfficient !== bestOverall) {
      recommendations.push({
        type: 'most-efficient',
        title: 'Most Efficient Choice',
        model: mostEfficient.name,
        reason: `Best intelligence-to-energy ratio (${mostEfficient.scores.efficiency}) for maximum productivity per watt`,
        metrics: {
          efficiency: mostEfficient.scores.efficiency,
          energy: mostEfficient.energy.mean,
          intelligence: mostEfficient.intelligence
        }
      });
    }

    // Most sustainable choice
    const mostSustainable = comparisons.reduce((best, current) => 
      current.scores.sustainability > best.scores.sustainability ? current : best
    );
    if (mostSustainable !== bestOverall && mostSustainable !== mostEfficient) {
      recommendations.push({
        type: 'most-sustainable',
        title: 'Most Sustainable Choice',
        model: mostSustainable.name,
        reason: `Lowest environmental impact (${mostSustainable.scores.sustainability}/100 sustainability score)`,
        metrics: {
          sustainability: mostSustainable.scores.sustainability,
          energy: mostSustainable.energy.mean,
          carbon: mostSustainable.carbon.mean,
          water: mostSustainable.water.mean
        }
      });
    }

    // Budget-friendly choice
    const budgetFriendly = comparisons
      .filter(m => m.costEfficiency > 0)
      .reduce((best, current) => 
        current.costEfficiency > best.costEfficiency ? current : best, 
        { costEfficiency: 0 }
      );
    if (budgetFriendly.costEfficiency > 0) {
      recommendations.push({
        type: 'budget-friendly',
        title: 'Best Value for Money',
        model: budgetFriendly.name,
        reason: `Highest intelligence per dollar (${budgetFriendly.costEfficiency} points per $)`,
        metrics: {
          costEfficiency: budgetFriendly.costEfficiency,
          pricing: budgetFriendly.pricing,
          intelligence: budgetFriendly.intelligence
        }
      });
    }

    return recommendations;
  }

  /**
   * Get trending models based on usage patterns
   */
  getTrendingModels(timeframe = '7d') {
    const cutoffTime = Date.now() - this.getTimeframeMs(timeframe);
    const recentUsage = this.usageHistory.filter(entry => entry.timestamp > cutoffTime);

    // Group by model name
    const modelUsage = {};
    recentUsage.forEach(entry => {
      const modelName = entry.model?.name || 'Unknown';
      if (!modelUsage[modelName]) {
        modelUsage[modelName] = {
          count: 0,
          totalEnergy: 0,
          totalQueries: 0,
          modelKey: this.findModelKeyByName(modelName)
        };
      }
      modelUsage[modelName].count++;
      modelUsage[modelName].totalEnergy += entry.usage.energy || 0;
      modelUsage[modelName].totalQueries += entry.usage.queries || 0;
    });

    // Sort by usage count
    const trending = Object.entries(modelUsage)
      .map(([name, stats]) => ({
        name,
        ...stats,
        averageQueriesPerUse: stats.totalQueries / Math.max(1, stats.count),
        averageEnergyPerUse: stats.totalEnergy / Math.max(1, stats.count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return trending;
  }

  /**
   * Get benchmark comparison for specific metrics
   */
  getBenchmarkComparison(metric = 'intelligence') {
    const models = Object.entries(this.modelDatabase)
      .map(([key, model]) => ({
        key,
        name: model.name,
        company: model.company,
        category: model.category,
        value: this.getMetricValue(model, metric),
        percentile: this.calculatePercentile(metric, this.getMetricValue(model, metric))
      }))
      .filter(m => m.value !== null && !isNaN(m.value))
      .sort((a, b) => {
        // For energy/carbon/water, lower is better
        if (['energy', 'carbon', 'water'].includes(metric)) {
          return a.value - b.value;
        }
        return b.value - a.value; // For intelligence/performance, higher is better
      });

    return {
      metric,
      models,
      distribution: this.calculateDistribution(models.map(m => m.value)),
      insights: this.generateBenchmarkInsights(models, metric)
    };
  }

  /**
   * Get metric value from model
   */
  getMetricValue(model, metric) {
    switch (metric) {
      case 'energy':
        return model.energy?.meanCombined || 0;
      case 'carbon':
        return model.carbon?.meanCombined || 0;
      case 'water':
        return model.water?.meanCombined || 0;
      case 'intelligence':
        return model.aiIntelligenceIndex || 0;
      case 'performance':
        return model.performance?.medianTokensPerSecond || 0;
      default:
        return 0;
    }
  }

  /**
   * Calculate value distribution statistics
   */
  calculateDistribution(values) {
    if (values.length === 0) return {};

    const sorted = values.sort((a, b) => a - b);
    const n = sorted.length;
    
    return {
      min: sorted[0],
      max: sorted[n - 1],
      mean: values.reduce((sum, v) => sum + v, 0) / n,
      median: n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)],
      q1: sorted[Math.floor(n * 0.25)],
      q3: sorted[Math.floor(n * 0.75)],
      std: Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - this.mean, 2), 0) / n)
    };
  }

  /**
   * Generate benchmark insights
   */
  generateBenchmarkInsights(models, metric) {
    const insights = [];

    if (models.length === 0) return insights;

    const top = models[0];
    const bottom = models[models.length - 1];

    // Performance gap insight
    const gap = Math.abs(top.value - bottom.value);
    const relativeDifference = (gap / Math.max(top.value, bottom.value)) * 100;

    insights.push({
      type: 'performance-gap',
      title: `${relativeDifference.toFixed(0)}% difference between best and worst`,
      description: `${top.name} vs ${bottom.name}`,
      impact: relativeDifference > 50 ? 'high' : relativeDifference > 20 ? 'medium' : 'low'
    });

    // Category leader insight
    const categories = {};
    models.forEach(model => {
      if (!categories[model.category]) {
        categories[model.category] = [];
      }
      categories[model.category].push(model);
    });

    const categoryLeaders = Object.entries(categories).map(([category, categoryModels]) => ({
      category,
      leader: categoryModels[0] // First in sorted list
    }));

    if (categoryLeaders.length > 1) {
      insights.push({
        type: 'category-leaders',
        title: 'Category performance leaders',
        leaders: categoryLeaders,
        description: `Leading models in each category for ${metric}`
      });
    }

    return insights;
  }

  /**
   * Convert timeframe string to milliseconds
   */
  getTimeframeMs(timeframe) {
    const timeframes = {
      '1d': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return timeframes[timeframe] || timeframes['7d'];
  }

  /**
   * Find model key by name
   */
  findModelKeyByName(name) {
    for (const [key, model] of Object.entries(this.modelDatabase)) {
      if (model.name === name) return key;
    }
    return null;
  }

  /**
   * Export comparison data for external use
   */
  exportComparisonData(comparisons, format = 'json') {
    const data = {
      timestamp: Date.now(),
      models: comparisons.models,
      summary: comparisons.summary,
      recommendations: comparisons.recommendations,
      metadata: {
        benchmarks: this.benchmarks,
        weights: this.benchmarkWeights
      }
    };

    switch (format) {
      case 'csv':
        return this.convertToCSV(data);
      case 'json':
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Convert comparison data to CSV format
   */
  convertToCSV(data) {
    const headers = [
      'Model Name', 'Company', 'Category', 'Intelligence', 'Energy (Wh)', 'Carbon (gCO2e)', 
      'Water (mL)', 'Efficiency Score', 'Sustainability Score', 'Performance Score', 
      'Overall Score', 'Pricing', 'Cost Efficiency'
    ];

    const rows = data.models.map(model => [
      model.name,
      model.company,
      model.category,
      model.intelligence,
      model.energy.mean,
      model.carbon.mean,
      model.water.mean,
      model.scores.efficiency,
      model.scores.sustainability,
      model.scores.performance,
      model.scores.overall,
      model.pricing,
      model.costEfficiency
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIModelComparisonEngine };
} else if (typeof window !== 'undefined') {
  window.AIModelComparisonEngine = AIModelComparisonEngine;
}
