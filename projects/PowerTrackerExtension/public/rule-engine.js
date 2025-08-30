/**
 * Rule Engine - Deterministic intelligence without external AI calls
 * Uses expert system rules and heuristics for decision making
 */
class RuleEngine {
  constructor() {
    this.rules = new Map();
    this.ruleEffectiveness = new Map();
    this.decisionTree = null;
    this.heuristics = new HeuristicEngine();
    this.initializeRules();
  }

  initializeRules() {
    // Energy optimization rules
    this.addRule('high_energy_tabs', {
      condition: (data) => this.hasHighEnergyTabs(data),
      action: 'closeOrSuspendHighEnergyTabs',
      priority: 9,
      energySaving: 30,
      userImpact: 'low',
      description: 'Close or suspend tabs consuming excessive energy'
    });

    this.addRule('video_optimization', {
      condition: (data) => this.hasActiveVideo(data) && this.isBatteryLow(data),
      action: 'optimizeVideoQuality',
      priority: 8,
      energySaving: 25,
      userImpact: 'medium',
      description: 'Reduce video quality when battery is low'
    });

    this.addRule('background_tab_suspension', {
      condition: (data) => this.hasInactiveBackgroundTabs(data),
      action: 'suspendBackgroundTabs',
      priority: 7,
      energySaving: 20,
      userImpact: 'minimal',
      description: 'Suspend inactive background tabs'
    });

    this.addRule('dark_mode_optimization', {
      condition: (data) => this.shouldEnableDarkMode(data),
      action: 'enableContextualDarkMode',
      priority: 6,
      energySaving: 15,
      userImpact: 'minimal',
      description: 'Enable dark mode based on context'
    });

    this.addRule('animation_reduction', {
      condition: (data) => this.hasHeavyAnimations(data) && this.isBatteryLow(data),
      action: 'reduceAnimations',
      priority: 5,
      energySaving: 10,
      userImpact: 'low',
      description: 'Reduce animations when battery is low'
    });

    this.addRule('resource_blocking', {
      condition: (data) => this.hasUnnecessaryResources(data),
      action: 'blockUnnecessaryResources',
      priority: 4,
      energySaving: 18,
      userImpact: 'minimal',
      description: 'Block unnecessary resource loading'
    });

    // Behavioral rules
    this.addRule('lunch_time_optimization', {
      condition: (data) => this.isLunchTime(data) && this.hasMultipleTabs(data),
      action: 'prepareLunchTimeSuspension',
      priority: 3,
      energySaving: 35,
      userImpact: 'minimal',
      description: 'Optimize for typical lunch break patterns'
    });

    this.addRule('meeting_preparation', {
      condition: (data) => this.isPreMeetingTime(data),
      action: 'optimizeForMeeting',
      priority: 8,
      energySaving: 22,
      userImpact: 'minimal',
      description: 'Optimize system before scheduled meetings'
    });

    this.addRule('work_hours_efficiency', {
      condition: (data) => this.isWorkHours(data) && this.hasHighCPUUsage(data),
      action: 'optimizeWorkflowEfficiency',
      priority: 7,
      energySaving: 20,
      userImpact: 'low',
      description: 'Optimize system during work hours'
    });

    this.addRule('evening_wind_down', {
      condition: (data) => this.isEveningTime(data) && this.hasLowActivity(data),
      action: 'prepareEveningOptimization',
      priority: 4,
      energySaving: 25,
      userImpact: 'minimal',
      description: 'Prepare system for evening wind down'
    });
  }

  addRule(id, rule) {
    this.rules.set(id, rule);
    this.ruleEffectiveness.set(id, 0.8); // Default effectiveness
  }

  async loadOptimizationRules() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['ruleEffectiveness']);
        if (result.ruleEffectiveness) {
          this.ruleEffectiveness = new Map(result.ruleEffectiveness);
        }
      }
    } catch (error) {
      console.warn('[RuleEngine] Could not load rule effectiveness:', error);
    }
  }

  async makeDecision(context) {
    const { analysis, urgencyLevel, userPreferences } = context;
    
    // Evaluate all applicable rules
    const applicableRules = [];
    
    for (const [ruleId, rule] of this.rules) {
      try {
        if (await rule.condition(analysis)) {
          const effectiveness = this.ruleEffectiveness.get(ruleId) || 0.8;
          applicableRules.push({
            ...rule,
            id: ruleId,
            effectiveness,
            score: this.calculateRuleScore(rule, effectiveness, urgencyLevel)
          });
        }
      } catch (error) {
        console.warn(`[RuleEngine] Rule evaluation failed for ${ruleId}:`, error);
      }
    }
    
    // Sort by score and select top actions
    applicableRules.sort((a, b) => b.score - a.score);
    
    const selectedActions = this.selectOptimalActions(
      applicableRules, 
      userPreferences,
      urgencyLevel
    );
    
    return {
      actions: selectedActions,
      reasoning: this.generateReasoning(selectedActions),
      confidence: this.calculateConfidence(selectedActions),
      expectedEnergySaving: selectedActions.reduce((sum, a) => sum + a.energySaving, 0)
    };
  }

  calculateRuleScore(rule, effectiveness, urgencyLevel) {
    let score = rule.priority * effectiveness;
    
    // Adjust for urgency
    if (urgencyLevel === 'high') {
      score *= 1.5;
    } else if (urgencyLevel === 'low') {
      score *= 0.8;
    }
    
    // Adjust for energy saving potential
    score += rule.energySaving * 0.1;
    
    // Penalize high user impact
    if (rule.userImpact === 'high') {
      score *= 0.6;
    } else if (rule.userImpact === 'medium') {
      score *= 0.8;
    }
    
    return score;
  }

  selectOptimalActions(applicableRules, userPreferences, urgencyLevel) {
    const selectedActions = [];
    const maxActions = urgencyLevel === 'high' ? 3 : urgencyLevel === 'medium' ? 2 : 1;
    
    // Apply user preference filters
    const filteredRules = applicableRules.filter(rule => {
      if (userPreferences.aggressiveness === 'conservative') {
        return rule.userImpact === 'minimal' || rule.userImpact === 'low';
      } else if (userPreferences.aggressiveness === 'aggressive') {
        return true; // Allow all actions
      } else {
        return rule.userImpact !== 'high'; // Moderate: exclude high impact
      }
    });
    
    // Select top actions within limits
    for (let i = 0; i < Math.min(maxActions, filteredRules.length); i++) {
      const rule = filteredRules[i];
      
      // Check if action conflicts with user tolerance
      if (this.isActionAcceptable(rule, userPreferences)) {
        selectedActions.push({
          type: rule.action,
          priority: rule.priority,
          energySaving: rule.energySaving,
          userImpact: rule.userImpact,
          description: rule.description,
          confidence: rule.effectiveness,
          estimatedSaving: rule.energySaving
        });
      }
    }
    
    return selectedActions;
  }

  isActionAcceptable(rule, userPreferences) {
    // Check user interruption tolerance
    if (userPreferences.userInterruptionTolerance === 'low' && rule.userImpact !== 'minimal') {
      return false;
    }
    
    // Check if auto actions are enabled
    if (!userPreferences.autoActionsEnabled && rule.userImpact !== 'minimal') {
      return false;
    }
    
    return true;
  }

  generateReasoning(selectedActions) {
    if (selectedActions.length === 0) {
      return 'No optimization actions recommended at this time.';
    }
    
    const reasons = selectedActions.map(action => 
      `${action.description} (${action.energySaving}% saving)`
    );
    
    return `Recommended optimizations: ${reasons.join(', ')}. These actions were selected based on current energy patterns and user preferences.`;
  }

  calculateConfidence(selectedActions) {
    if (selectedActions.length === 0) return 0;
    
    const avgConfidence = selectedActions.reduce((sum, action) => 
      sum + action.confidence, 0) / selectedActions.length;
    
    // Adjust confidence based on action count and consistency
    let confidence = avgConfidence;
    
    if (selectedActions.length > 1) {
      // Higher confidence with multiple consistent actions
      confidence *= 1.1;
    }
    
    return Math.min(confidence, 0.95);
  }

  async generateInsights(analysis) {
    const insights = [];
    
    // Energy trend insights
    if (analysis.energyTrends.direction === 'increasing') {
      insights.push({
        type: 'trend',
        title: 'Rising Energy Consumption',
        description: `Energy usage has increased by ${((analysis.energyTrends.recentAvg / analysis.energyTrends.earlierAvg - 1) * 100).toFixed(1)}% recently`,
        actionable: true,
        priority: 'high'
      });
    }
    
    // Pattern-based insights
    if (analysis.behaviorPatterns.tabUsage.multitaskingIntensity === 'high') {
      insights.push({
        type: 'behavior',
        title: 'High Multitasking Detected',
        description: `Average of ${analysis.behaviorPatterns.tabUsage.averageTabs.toFixed(1)} tabs open. Consider tab management.`,
        actionable: true,
        priority: 'medium'
      });
    }
    
    // Video usage insights
    if (analysis.behaviorPatterns.mediaConsumption.isVideoHeavyUser) {
      insights.push({
        type: 'media',
        title: 'High Video Consumption',
        description: `${(analysis.behaviorPatterns.mediaConsumption.videoUsagePercentage * 100).toFixed(1)}% of time spent on video content`,
        actionable: true,
        priority: 'medium'
      });
    }
    
    // Time-based insights
    if (analysis.behaviorPatterns.timePatterns.peakHours.length > 0) {
      insights.push({
        type: 'temporal',
        title: 'Peak Usage Hours Identified',
        description: `Highest energy usage at ${analysis.behaviorPatterns.timePatterns.peakHours.join(', ')}:00`,
        actionable: false,
        priority: 'low'
      });
    }
    
    return insights;
  }

  async generateRecommendations(analysis) {
    const recommendations = [];
    
    // Based on optimization opportunities
    analysis.optimizationOpportunities.forEach(opportunity => {
      recommendations.push({
        id: opportunity.type,
        title: this.getRecommendationTitle(opportunity.type),
        description: opportunity.description,
        energySaving: opportunity.estimatedSaving,
        difficulty: this.getImplementationDifficulty(opportunity.type),
        timeToImplement: this.getImplementationTime(opportunity.type)
      });
    });
    
    // Add behavioral recommendations
    if (analysis.behaviorPatterns.energySpikes.spikeFrequency > 0.2) {
      recommendations.push({
        id: 'manage_energy_spikes',
        title: 'Manage Energy Spikes',
        description: 'Identify and reduce activities causing energy spikes',
        energySaving: 15,
        difficulty: 'medium',
        timeToImplement: 'ongoing'
      });
    }
    
    return recommendations.sort((a, b) => b.energySaving - a.energySaving);
  }

  getRecommendationTitle(type) {
    const titles = {
      'tab_suspension': 'Optimize Tab Management',
      'video_optimization': 'Optimize Video Playback',
      'resource_blocking': 'Block Unnecessary Resources',
      'dark_mode': 'Enable Dark Mode',
      'animation_reduction': 'Reduce Animations'
    };
    return titles[type] || 'Energy Optimization';
  }

  getImplementationDifficulty(type) {
    const difficulty = {
      'tab_suspension': 'easy',
      'video_optimization': 'medium',
      'resource_blocking': 'easy',
      'dark_mode': 'easy',
      'animation_reduction': 'medium'
    };
    return difficulty[type] || 'medium';
  }

  getImplementationTime(type) {
    const timeMap = {
      'tab_suspension': 'immediate',
      'video_optimization': '5 minutes',
      'resource_blocking': 'immediate',
      'dark_mode': 'immediate',
      'animation_reduction': '2 minutes'
    };
    return timeMap[type] || '5 minutes';
  }

  async validateDecision(decision) {
    // Safety checks for decision validation
    const validatedDecision = { ...decision };
    
    // Ensure actions don't exceed user limits
    if (validatedDecision.actions.length > 3) {
      validatedDecision.actions = validatedDecision.actions.slice(0, 3);
      validatedDecision.reasoning += ' (Limited to 3 actions for user experience)';
    }
    
    // Remove conflicting actions
    validatedDecision.actions = this.removeConflictingActions(validatedDecision.actions);
    
    // Ensure minimum confidence threshold
    if (validatedDecision.confidence < 0.6) {
      validatedDecision.actions = validatedDecision.actions.filter(action => 
        action.confidence > 0.7
      );
    }
    
    return validatedDecision;
  }

  removeConflictingActions(actions) {
    const conflicts = {
      'closeOrSuspendHighEnergyTabs': ['suspendBackgroundTabs'],
      'optimizeVideoQuality': ['reduceAnimations'],
    };
    
    const validActions = [];
    const usedTypes = new Set();
    
    for (const action of actions) {
      if (!usedTypes.has(action.type)) {
        validActions.push(action);
        usedTypes.add(action.type);
        
        // Mark conflicting actions as used
        const conflictingTypes = conflicts[action.type] || [];
        conflictingTypes.forEach(conflictType => usedTypes.add(conflictType));
      }
    }
    
    return validActions;
  }

  async updateRuleEffectiveness(actionResults) {
    actionResults.forEach(result => {
      const ruleId = this.findRuleForAction(result.action);
      if (ruleId) {
        const currentEffectiveness = this.ruleEffectiveness.get(ruleId) || 0.8;
        
        if (result.success && result.energySaved > 0) {
          // Increase effectiveness for successful actions
          const improvement = Math.min(0.1, result.energySaved / 100);
          this.ruleEffectiveness.set(ruleId, Math.min(0.95, currentEffectiveness + improvement));
        } else {
          // Decrease effectiveness for failed actions
          this.ruleEffectiveness.set(ruleId, Math.max(0.3, currentEffectiveness - 0.05));
        }
      }
    });
    
    // Save updated effectiveness
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          ruleEffectiveness: Array.from(this.ruleEffectiveness.entries())
        });
      }
    } catch (error) {
      console.warn('[RuleEngine] Could not save rule effectiveness:', error);
    }
  }

  findRuleForAction(actionType) {
    for (const [ruleId, rule] of this.rules) {
      if (rule.action === actionType) {
        return ruleId;
      }
    }
    return null;
  }

  // Rule condition methods
  hasHighEnergyTabs(data) {
    return data.energyTrends.recentAvg > 25; // watts
  }

  hasActiveVideo(data) {
    return data.behaviorPatterns.mediaConsumption.videoUsagePercentage > 0.1;
  }

  isBatteryLow(data) {
    // Simulate battery level check - in real implementation, this would check actual battery
    return data.energyTrends.recentAvg > 30; // High power consumption suggests battery concern
  }

  hasInactiveBackgroundTabs(data) {
    return data.behaviorPatterns.tabUsage.averageTabs > 5 &&
           data.behaviorPatterns.tabUsage.multitaskingIntensity === 'high';
  }

  shouldEnableDarkMode(data) {
    const hour = new Date().getHours();
    return (hour > 18 || hour < 6) && data.energyTrends.recentAvg > 20;
  }

  hasHeavyAnimations(data) {
    return data.energyTrends.volatility > 0.3 && 
           data.energyTrends.recentAvg > 25;
  }

  hasUnnecessaryResources(data) {
    return data.energyTrends.recentAvg > 20 &&
           data.behaviorPatterns.tabUsage.averageTabs > 3;
  }

  isLunchTime(data) {
    const hour = new Date().getHours();
    return hour >= 11 && hour <= 14; // 11 AM to 2 PM
  }

  hasMultipleTabs(data) {
    return data.behaviorPatterns.tabUsage.averageTabs > 5;
  }

  isPreMeetingTime(data) {
    // This would integrate with calendar data if available
    // For now, detect patterns that suggest meeting preparation
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    
    // Check for typical meeting times (on the hour or half hour)
    return (minute >= 55 || minute <= 5) && hour >= 9 && hour <= 17;
  }

  isWorkHours(data) {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Monday to Friday, 9 AM to 5 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
  }

  hasHighCPUUsage(data) {
    return data.energyTrends.recentAvg > 35 || data.energyTrends.volatility > 0.4;
  }

  isEveningTime(data) {
    const hour = new Date().getHours();
    return hour >= 19 && hour <= 22; // 7 PM to 10 PM
  }

  hasLowActivity(data) {
    return data.behaviorPatterns.tabUsage.averageTabs < 5 &&
           data.energyTrends.recentAvg < 20;
  }

  // Status and utility methods
  getRuleStats() {
    const stats = {
      totalRules: this.rules.size,
      avgEffectiveness: 0,
      topRules: [],
      bottomRules: []
    };
    
    const effectivenessArray = Array.from(this.ruleEffectiveness.values());
    stats.avgEffectiveness = effectivenessArray.reduce((a, b) => a + b, 0) / effectivenessArray.length || 0;
    
    const ruleStats = Array.from(this.ruleEffectiveness.entries())
      .map(([id, effectiveness]) => ({ id, effectiveness, rule: this.rules.get(id) }))
      .sort((a, b) => b.effectiveness - a.effectiveness);
    
    stats.topRules = ruleStats.slice(0, 3);
    stats.bottomRules = ruleStats.slice(-3);
    
    return stats;
  }
}

/**
 * Heuristic Engine - Additional intelligence for complex scenarios
 */
class HeuristicEngine {
  constructor() {
    this.heuristics = new Map();
    this.initializeHeuristics();
  }

  initializeHeuristics() {
    // Time-based heuristics
    this.heuristics.set('time_of_day', {
      evaluate: (context) => this.evaluateTimeOfDay(context),
      weight: 0.3
    });
    
    // Usage pattern heuristics
    this.heuristics.set('usage_pattern', {
      evaluate: (context) => this.evaluateUsagePattern(context),
      weight: 0.4
    });
    
    // Energy efficiency heuristics
    this.heuristics.set('efficiency_trend', {
      evaluate: (context) => this.evaluateEfficiencyTrend(context),
      weight: 0.3
    });
  }

  evaluateTimeOfDay(context) {
    const hour = new Date().getHours();
    
    if (hour >= 9 && hour <= 17) {
      return { score: 0.8, reason: 'Work hours - moderate optimization' };
    } else if (hour >= 18 && hour <= 22) {
      return { score: 0.9, reason: 'Evening - high optimization potential' };
    } else {
      return { score: 0.6, reason: 'Off hours - conservative optimization' };
    }
  }

  evaluateUsagePattern(context) {
    const patterns = context.behaviorPatterns;
    let score = 0.5;
    let reason = 'Standard usage pattern';
    
    if (patterns.tabUsage.multitaskingIntensity === 'high') {
      score += 0.3;
      reason = 'High multitasking - optimization beneficial';
    }
    
    if (patterns.mediaConsumption.isVideoHeavyUser) {
      score += 0.2;
      reason += ', video-heavy usage detected';
    }
    
    return { score: Math.min(score, 1.0), reason };
  }

  evaluateEfficiencyTrend(context) {
    const trends = context.energyTrends;
    let score = 0.5;
    let reason = 'Stable efficiency trend';
    
    if (trends.direction === 'increasing') {
      score += 0.4;
      reason = 'Rising energy consumption - optimization needed';
    } else if (trends.direction === 'decreasing') {
      score -= 0.2;
      reason = 'Improving efficiency - gentle optimization';
    }
    
    if (trends.volatility > 0.3) {
      score += 0.2;
      reason += ', high volatility detected';
    }
    
    return { score: Math.max(0.1, Math.min(score, 1.0)), reason };
  }

  evaluateContext(context) {
    let totalScore = 0;
    let totalWeight = 0;
    const reasons = [];
    
    for (const [name, heuristic] of this.heuristics) {
      const evaluation = heuristic.evaluate(context);
      totalScore += evaluation.score * heuristic.weight;
      totalWeight += heuristic.weight;
      reasons.push(`${name}: ${evaluation.reason}`);
    }
    
    return {
      overallScore: totalScore / totalWeight,
      confidence: Math.min(totalWeight, 1.0),
      reasoning: reasons.join('; ')
    };
  }
}