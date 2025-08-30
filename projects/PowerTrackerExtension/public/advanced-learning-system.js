/**
 * Advanced Learning System - Reinforcement learning concepts without external AI
 * Implements sophisticated user behavior adaptation and optimization learning
 */
class AdvancedLearningSystem {
  constructor() {
    this.userBehaviorModel = new UserBehaviorModel();
    this.reinfocementLearner = new ReinforcementLearner();
    this.adaptationEngine = new AdaptationEngine();
    this.experienceReplay = new ExperienceReplay();
    this.contextualBandits = new ContextualBandits();
    this.learningHistory = [];
    this.isLearning = true;
  }

  async learn(state, action, reward, nextState, context) {
    console.log('[AdvancedLearningSystem] Learning from experience');

    try {
      // Create experience tuple
      const experience = {
        state: this.encodeState(state),
        action: action,
        reward: reward,
        nextState: this.encodeState(nextState),
        context: context,
        timestamp: Date.now()
      };

      // Store experience for replay learning
      this.experienceReplay.store(experience);

      // Update user behavior model
      await this.userBehaviorModel.update(experience);

      // Update reinforcement learning model
      await this.reinfocementLearner.update(experience);

      // Update contextual bandits
      this.contextualBandits.updateReward(context, action, reward);

      // Adapt based on learning
      const adaptations = await this.adaptationEngine.adapt(experience, this.getGlobalInsights());

      // Record learning event
      this.recordLearningEvent(experience, adaptations);

      return {
        success: true,
        adaptations: adaptations,
        insights: this.getRecentInsights(),
        modelConfidence: this.calculateModelConfidence()
      };

    } catch (error) {
      console.error('[AdvancedLearningSystem] Learning failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async predictOptimalAction(state, context, availableActions) {
    console.log('[AdvancedLearningSystem] Predicting optimal action');

    try {
      const encodedState = this.encodeState(state);

      // Get predictions from different learning approaches
      const rlPrediction = await this.reinfocementLearner.predictAction(encodedState, availableActions);
      const banditPrediction = this.contextualBandits.selectAction(context, availableActions);
      const behaviorPrediction = this.userBehaviorModel.predictPreferredAction(encodedState, availableActions);

      // Ensemble the predictions using weighted voting
      const ensemblePrediction = this.ensemblePredictions([
        { prediction: rlPrediction, weight: 0.4, source: 'reinforcement_learning' },
        { prediction: banditPrediction, weight: 0.35, source: 'contextual_bandits' },
        { prediction: behaviorPrediction, weight: 0.25, source: 'behavior_model' }
      ]);

      return {
        action: ensemblePrediction.action,
        confidence: ensemblePrediction.confidence,
        reasoning: ensemblePrediction.reasoning,
        alternatives: ensemblePrediction.alternatives
      };

    } catch (error) {
      console.error('[AdvancedLearningSystem] Prediction failed:', error);
      return {
        action: availableActions[0] || null,
        confidence: 0.1,
        reasoning: 'Fallback to default action due to prediction error',
        error: error.message
      };
    }
  }

  encodeState(state) {
    // Encode complex state into feature vector for learning algorithms
    const features = {
      // Energy features (normalized 0-1)
      energyLevel: Math.min(state.energyConsumption?.total || 10, 50) / 50,
      energyTrend: this.encodeEnergyTrend(state.energyConsumption?.trending || 'stable'),
      energyEfficiency: state.energyConsumption?.efficiency || 0.5,

      // Battery features
      batteryLevel: state.batteryLevel?.level || 0.5,
      batteryStatus: this.encodeBatteryStatus(state.batteryLevel?.status || 'medium'),
      chargingStatus: state.batteryLevel?.charging ? 1 : 0,

      // User activity features
      userActivity: this.encodeUserActivity(state.userActivity?.level || 'medium'),
      idleTime: Math.min((state.userActivity?.idleTime || 0) / 3600000, 1), // Normalize to hours
      activityPattern: this.encodeActivityPattern(state.userActivity?.patterns),

      // System features
      cpuUsage: (state.systemLoad?.cpu || 50) / 100,
      memoryUsage: (state.systemLoad?.memory || 50) / 100,
      tabCount: Math.min((state.systemLoad?.tabCount || 5) / 20, 1),

      // Temporal features
      timeOfDay: new Date().getHours() / 24,
      dayOfWeek: new Date().getDay() / 7,
      isWeekend: [0, 6].includes(new Date().getDay()) ? 1 : 0,

      // Context features
      urgencyLevel: this.encodeUrgency(state.urgencyLevel || 'low'),
      optimizationPotential: state.optimizationPotential || 0.5
    };

    return features;
  }

  encodeEnergyTrend(trend) {
    const encoding = { 'decreasing': 0, 'stable': 0.5, 'increasing': 1 };
    return encoding[trend] || 0.5;
  }

  encodeBatteryStatus(status) {
    const encoding = { 'critical': 0, 'low': 0.25, 'medium': 0.5, 'high': 1 };
    return encoding[status] || 0.5;
  }

  encodeUserActivity(activity) {
    const encoding = { 'idle': 0, 'low': 0.33, 'medium': 0.67, 'high': 1 };
    return encoding[activity] || 0.5;
  }

  encodeActivityPattern(patterns) {
    if (!patterns) return 0.5;
    
    let score = 0;
    score += patterns.clicks ? 0.25 : 0;
    score += patterns.keystrokes ? 0.25 : 0;
    score += patterns.tabSwitches ? 0.25 : 0;
    score += patterns.scrolling ? 0.25 : 0;
    
    return score;
  }

  encodeUrgency(urgency) {
    const encoding = { 'low': 0.2, 'medium': 0.5, 'high': 0.8, 'critical': 1 };
    return encoding[urgency] || 0.5;
  }

  ensemblePredictions(predictions) {
    const actionScores = new Map();
    let totalWeight = 0;
    const reasoning = [];

    // Aggregate weighted predictions
    for (const { prediction, weight, source } of predictions) {
      if (!prediction || !prediction.action) continue;

      const action = prediction.action;
      const score = (prediction.confidence || 0.5) * weight;
      
      actionScores.set(action, (actionScores.get(action) || 0) + score);
      totalWeight += weight;
      
      reasoning.push({
        source,
        action,
        confidence: prediction.confidence || 0.5,
        weight
      });
    }

    if (actionScores.size === 0) {
      return {
        action: null,
        confidence: 0,
        reasoning: 'No valid predictions available',
        alternatives: []
      };
    }

    // Find best action
    const sortedActions = Array.from(actionScores.entries())
      .sort(([, a], [, b]) => b - a);

    const bestAction = sortedActions[0][0];
    const bestScore = sortedActions[0][1];
    const confidence = totalWeight > 0 ? bestScore / totalWeight : 0;

    return {
      action: bestAction,
      confidence,
      reasoning: `Ensemble prediction: ${reasoning.map(r => `${r.source}(${r.confidence.toFixed(2)})`).join(', ')}`,
      alternatives: sortedActions.slice(1, 3).map(([action, score]) => ({
        action,
        confidence: totalWeight > 0 ? score / totalWeight : 0
      }))
    };
  }

  recordLearningEvent(experience, adaptations) {
    this.learningHistory.push({
      experience,
      adaptations,
      timestamp: Date.now(),
      modelVersion: this.getModelVersion()
    });

    // Keep history manageable
    if (this.learningHistory.length > 500) {
      this.learningHistory = this.learningHistory.slice(-250);
    }
  }

  getRecentInsights() {
    const recent = this.learningHistory.slice(-10);
    if (recent.length < 3) return {};

    return {
      averageReward: this.calculateAverageReward(recent),
      learningTrend: this.calculateLearningTrend(recent),
      adaptationFrequency: recent.filter(h => h.adaptations.length > 0).length / recent.length,
      dominantPatterns: this.identifyDominantPatterns(recent)
    };
  }

  calculateAverageReward(history) {
    const rewards = history.map(h => h.experience.reward).filter(r => r !== undefined);
    return rewards.length > 0 ? rewards.reduce((a, b) => a + b, 0) / rewards.length : 0;
  }

  calculateLearningTrend(history) {
    if (history.length < 3) return 'stable';

    const rewards = history.map(h => h.experience.reward).filter(r => r !== undefined);
    if (rewards.length < 3) return 'stable';

    const firstHalf = rewards.slice(0, Math.floor(rewards.length / 2));
    const secondHalf = rewards.slice(Math.floor(rewards.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const improvement = (secondAvg - firstAvg) / Math.abs(firstAvg);

    if (improvement > 0.15) return 'improving';
    if (improvement < -0.15) return 'declining';
    return 'stable';
  }

  identifyDominantPatterns(history) {
    const actionCounts = new Map();
    
    history.forEach(h => {
      const action = h.experience.action;
      actionCounts.set(action, (actionCounts.get(action) || 0) + 1);
    });

    return Array.from(actionCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([action, count]) => ({
        action,
        frequency: count / history.length
      }));
  }

  getGlobalInsights() {
    return {
      totalExperiences: this.learningHistory.length,
      modelConfidence: this.calculateModelConfidence(),
      learningVelocity: this.calculateLearningVelocity(),
      explorationRate: this.contextualBandits.getExplorationRate(),
      adaptationSuccess: this.calculateAdaptationSuccessRate()
    };
  }

  calculateModelConfidence() {
    const recent = this.learningHistory.slice(-20);
    if (recent.length < 5) return 0.3;

    const rewardVariance = this.calculateRewardVariance(recent);
    const consistencyScore = this.calculatePredictionConsistency(recent);
    
    // Higher consistency and lower variance = higher confidence
    return Math.max(0.1, Math.min(0.95, consistencyScore - (rewardVariance * 0.5)));
  }

  calculateRewardVariance(history) {
    const rewards = history.map(h => h.experience.reward).filter(r => r !== undefined);
    if (rewards.length < 2) return 1;

    const mean = rewards.reduce((a, b) => a + b, 0) / rewards.length;
    const variance = rewards.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rewards.length;
    
    return Math.min(variance / 10, 1); // Normalize variance
  }

  calculatePredictionConsistency(history) {
    if (history.length < 3) return 0.5;

    let consistentPredictions = 0;
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1].experience;
      const curr = history[i].experience;
      
      // Check if similar states led to similar actions
      const stateSimilarity = this.calculateStateSimilarity(prev.state, curr.state);
      const actionSimilarity = prev.action === curr.action ? 1 : 0;
      
      if (stateSimilarity > 0.7 && actionSimilarity > 0.5) {
        consistentPredictions++;
      }
    }

    return consistentPredictions / (history.length - 1);
  }

  calculateStateSimilarity(state1, state2) {
    const features1 = Object.values(state1);
    const features2 = Object.values(state2);
    
    if (features1.length !== features2.length) return 0;

    let similarity = 0;
    for (let i = 0; i < features1.length; i++) {
      const diff = Math.abs(features1[i] - features2[i]);
      similarity += 1 - diff; // Assuming normalized features [0,1]
    }

    return similarity / features1.length;
  }

  calculateLearningVelocity() {
    const recent = this.learningHistory.slice(-10);
    if (recent.length < 3) return 0.5;

    let adaptationCount = 0;
    recent.forEach(h => {
      if (h.adaptations.length > 0) {
        adaptationCount++;
      }
    });

    return adaptationCount / recent.length;
  }

  calculateAdaptationSuccessRate() {
    const recentAdaptations = this.learningHistory
      .slice(-20)
      .filter(h => h.adaptations.length > 0);

    if (recentAdaptations.length === 0) return 0.5;

    let successfulAdaptations = 0;
    recentAdaptations.forEach(h => {
      // Consider adaptation successful if reward improved
      if (h.experience.reward > 0) {
        successfulAdaptations++;
      }
    });

    return successfulAdaptations / recentAdaptations.length;
  }

  getModelVersion() {
    return `v${Math.floor(Date.now() / 86400000)}`; // Daily version
  }

  exportLearningData() {
    return {
      userBehaviorModel: this.userBehaviorModel.export(),
      reinforcementLearner: this.reinfocementLearner.export(),
      contextualBandits: this.contextualBandits.export(),
      insights: this.getGlobalInsights(),
      modelVersion: this.getModelVersion()
    };
  }

  importLearningData(data) {
    try {
      if (data.userBehaviorModel) {
        this.userBehaviorModel.import(data.userBehaviorModel);
      }
      if (data.reinforcementLearner) {
        this.reinfocementLearner.import(data.reinforcementLearner);
      }
      if (data.contextualBandits) {
        this.contextualBandits.import(data.contextualBandits);
      }
      return true;
    } catch (error) {
      console.error('[AdvancedLearningSystem] Import failed:', error);
      return false;
    }
  }
}

/**
 * User Behavior Model - Models and predicts user preferences and patterns
 */
class UserBehaviorModel {
  constructor() {
    this.preferences = new Map();
    this.patterns = new Map();
    this.contextualPreferences = new Map();
    this.behaviorClusters = [];
    this.preferenceWeights = new Map();
  }

  async update(experience) {
    const { state, action, reward, context } = experience;
    
    // Update action preferences based on reward
    this.updateActionPreferences(action, reward, context);
    
    // Update contextual preferences
    this.updateContextualPreferences(state, action, reward, context);
    
    // Update behavioral patterns
    this.updateBehavioralPatterns(state, action, context);
    
    // Cluster similar behaviors
    this.updateBehaviorClusters(experience);
  }

  updateActionPreferences(action, reward, context) {
    if (!this.preferences.has(action)) {
      this.preferences.set(action, {
        totalReward: 0,
        count: 0,
        averageReward: 0,
        lastUpdated: Date.now()
      });
    }

    const pref = this.preferences.get(action);
    pref.totalReward += reward;
    pref.count++;
    pref.averageReward = pref.totalReward / pref.count;
    pref.lastUpdated = Date.now();

    // Apply temporal decay to older preferences
    this.applyTemporalDecay();
  }

  updateContextualPreferences(state, action, reward, context) {
    const contextKey = this.generateContextKey(state, context);
    
    if (!this.contextualPreferences.has(contextKey)) {
      this.contextualPreferences.set(contextKey, new Map());
    }

    const contextPrefs = this.contextualPreferences.get(contextKey);
    if (!contextPrefs.has(action)) {
      contextPrefs.set(action, {
        totalReward: 0,
        count: 0,
        averageReward: 0
      });
    }

    const pref = contextPrefs.get(action);
    pref.totalReward += reward;
    pref.count++;
    pref.averageReward = pref.totalReward / pref.count;
  }

  generateContextKey(state, context) {
    // Create a simplified context key for preference grouping
    return [
      Math.floor(state.batteryLevel * 4), // 0-3 battery levels
      Math.floor(state.userActivity * 3), // 0-2 activity levels
      Math.floor(state.timeOfDay * 4), // 0-3 time periods
      context.urgency || 'normal'
    ].join('_');
  }

  updateBehavioralPatterns(state, action, context) {
    const patternKey = `${action}_${this.simplifyState(state)}`;
    
    if (!this.patterns.has(patternKey)) {
      this.patterns.set(patternKey, {
        frequency: 0,
        contexts: [],
        outcomes: []
      });
    }

    const pattern = this.patterns.get(patternKey);
    pattern.frequency++;
    pattern.contexts.push(context);
    
    // Keep only recent contexts
    if (pattern.contexts.length > 10) {
      pattern.contexts = pattern.contexts.slice(-5);
    }
  }

  simplifyState(state) {
    return {
      battery: state.batteryLevel > 0.7 ? 'high' : state.batteryLevel > 0.3 ? 'medium' : 'low',
      activity: state.userActivity > 0.6 ? 'high' : state.userActivity > 0.3 ? 'medium' : 'low',
      time: state.timeOfDay > 0.75 ? 'evening' : state.timeOfDay > 0.5 ? 'afternoon' : state.timeOfDay > 0.25 ? 'morning' : 'night'
    };
  }

  updateBehaviorClusters(experience) {
    // Simple clustering based on state-action pairs
    const cluster = this.findSimilarCluster(experience) || this.createNewCluster(experience);
    cluster.experiences.push(experience);
    
    // Limit cluster size
    if (cluster.experiences.length > 20) {
      cluster.experiences = cluster.experiences.slice(-10);
    }

    // Update cluster statistics
    this.updateClusterStatistics(cluster);
  }

  findSimilarCluster(experience) {
    const threshold = 0.7;
    
    for (const cluster of this.behaviorClusters) {
      const similarity = this.calculateExperienceSimilarity(
        experience,
        cluster.representative
      );
      
      if (similarity > threshold) {
        return cluster;
      }
    }
    
    return null;
  }

  createNewCluster(experience) {
    const cluster = {
      id: this.behaviorClusters.length,
      representative: experience,
      experiences: [],
      statistics: {
        averageReward: 0,
        dominantAction: null,
        contextFrequency: new Map()
      },
      createdAt: Date.now()
    };
    
    this.behaviorClusters.push(cluster);
    return cluster;
  }

  calculateExperienceSimilarity(exp1, exp2) {
    // Calculate similarity between two experiences
    const stateSimilarity = this.calculateStateSimilarity(exp1.state, exp2.state);
    const actionSimilarity = exp1.action === exp2.action ? 1 : 0;
    const contextSimilarity = this.calculateContextSimilarity(exp1.context, exp2.context);
    
    return (stateSimilarity * 0.5) + (actionSimilarity * 0.3) + (contextSimilarity * 0.2);
  }

  calculateStateSimilarity(state1, state2) {
    const features1 = Object.values(state1);
    const features2 = Object.values(state2);
    
    if (features1.length !== features2.length) return 0;

    let similarity = 0;
    for (let i = 0; i < features1.length; i++) {
      const diff = Math.abs(features1[i] - features2[i]);
      similarity += Math.max(0, 1 - diff);
    }

    return similarity / features1.length;
  }

  calculateContextSimilarity(context1, context2) {
    // Simple context similarity based on common properties
    let commonProperties = 0;
    let totalProperties = 0;

    const allKeys = new Set([...Object.keys(context1), ...Object.keys(context2)]);
    
    allKeys.forEach(key => {
      totalProperties++;
      if (context1[key] === context2[key]) {
        commonProperties++;
      }
    });

    return totalProperties > 0 ? commonProperties / totalProperties : 0;
  }

  updateClusterStatistics(cluster) {
    const experiences = cluster.experiences;
    if (experiences.length === 0) return;

    // Update average reward
    const rewards = experiences.map(exp => exp.reward).filter(r => r !== undefined);
    cluster.statistics.averageReward = rewards.length > 0 ? 
      rewards.reduce((a, b) => a + b, 0) / rewards.length : 0;

    // Update dominant action
    const actionCounts = new Map();
    experiences.forEach(exp => {
      actionCounts.set(exp.action, (actionCounts.get(exp.action) || 0) + 1);
    });
    
    let maxCount = 0;
    let dominantAction = null;
    actionCounts.forEach((count, action) => {
      if (count > maxCount) {
        maxCount = count;
        dominantAction = action;
      }
    });
    
    cluster.statistics.dominantAction = dominantAction;
  }

  predictPreferredAction(state, availableActions) {
    // Predict user's preferred action based on historical preferences
    const contextKey = this.generateContextKey(state, {});
    const contextPrefs = this.contextualPreferences.get(contextKey) || new Map();
    
    let bestAction = null;
    let bestScore = -Infinity;
    let confidence = 0.3;

    // Check contextual preferences first
    availableActions.forEach(action => {
      let score = 0;
      
      // Contextual preference score (60% weight)
      if (contextPrefs.has(action)) {
        score += contextPrefs.get(action).averageReward * 0.6;
        confidence = Math.max(confidence, 0.7);
      }
      
      // Global preference score (40% weight)
      if (this.preferences.has(action)) {
        score += this.preferences.get(action).averageReward * 0.4;
      }

      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    });

    // Fallback to cluster-based prediction
    if (!bestAction) {
      const similarCluster = this.findSimilarStateCluster(state);
      if (similarCluster && similarCluster.statistics.dominantAction) {
        bestAction = similarCluster.statistics.dominantAction;
        confidence = 0.5;
      }
    }

    return {
      action: bestAction || availableActions[0],
      confidence: confidence,
      reasoning: bestAction ? 'Based on user preference history' : 'Default fallback'
    };
  }

  findSimilarStateCluster(state) {
    let bestCluster = null;
    let bestSimilarity = 0;

    for (const cluster of this.behaviorClusters) {
      const similarity = this.calculateStateSimilarity(state, cluster.representative.state);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestCluster = cluster;
      }
    }

    return bestSimilarity > 0.6 ? bestCluster : null;
  }

  applyTemporalDecay() {
    const now = Date.now();
    const decayPeriod = 86400000 * 7; // 7 days
    
    for (const [action, pref] of this.preferences.entries()) {
      const age = now - pref.lastUpdated;
      if (age > decayPeriod) {
        const decayFactor = Math.exp(-(age - decayPeriod) / decayPeriod);
        pref.averageReward *= decayFactor;
        pref.totalReward *= decayFactor;
        pref.count = Math.max(1, Math.floor(pref.count * decayFactor));
      }
    }
  }

  export() {
    return {
      preferences: Array.from(this.preferences.entries()),
      patterns: Array.from(this.patterns.entries()),
      contextualPreferences: Array.from(this.contextualPreferences.entries()).map(([key, value]) => [
        key,
        Array.from(value.entries())
      ]),
      behaviorClusters: this.behaviorClusters.map(cluster => ({
        ...cluster,
        experiences: cluster.experiences.slice(-5) // Export only recent experiences
      }))
    };
  }

  import(data) {
    this.preferences = new Map(data.preferences || []);
    this.patterns = new Map(data.patterns || []);
    
    this.contextualPreferences = new Map(
      (data.contextualPreferences || []).map(([key, entries]) => [
        key,
        new Map(entries)
      ])
    );
    
    this.behaviorClusters = data.behaviorClusters || [];
  }
}

/**
 * Reinforcement Learner - Q-learning implementation without external AI
 */
class ReinforcementLearner {
  constructor() {
    this.qTable = new Map();
    this.learningRate = 0.1;
    this.discountFactor = 0.95;
    this.explorationRate = 0.1;
    this.decayRate = 0.995;
    this.episodeCount = 0;
  }

  async update(experience) {
    const { state, action, reward, nextState } = experience;
    
    // Convert states to string keys for Q-table
    const stateKey = this.stateToKey(state);
    const nextStateKey = this.stateToKey(nextState);
    
    // Initialize Q-values if not exists
    if (!this.qTable.has(stateKey)) {
      this.qTable.set(stateKey, new Map());
    }
    
    const stateActions = this.qTable.get(stateKey);
    if (!stateActions.has(action)) {
      stateActions.set(action, 0);
    }

    // Calculate max Q-value for next state
    let maxNextQValue = 0;
    if (this.qTable.has(nextStateKey)) {
      const nextStateActions = this.qTable.get(nextStateKey);
      maxNextQValue = Math.max(...Array.from(nextStateActions.values()), 0);
    }

    // Q-learning update rule
    const currentQValue = stateActions.get(action);
    const newQValue = currentQValue + this.learningRate * (
      reward + this.discountFactor * maxNextQValue - currentQValue
    );

    stateActions.set(action, newQValue);

    // Update exploration rate
    this.explorationRate *= this.decayRate;
    this.explorationRate = Math.max(this.explorationRate, 0.01);

    this.episodeCount++;
  }

  async predictAction(state, availableActions) {
    const stateKey = this.stateToKey(state);
    
    // Epsilon-greedy action selection
    if (Math.random() < this.explorationRate) {
      // Explore: random action
      const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];
      return {
        action: randomAction,
        confidence: 0.2,
        reasoning: 'Exploration (random selection)'
      };
    }

    // Exploit: best known action
    if (!this.qTable.has(stateKey)) {
      const fallbackAction = availableActions[0];
      return {
        action: fallbackAction,
        confidence: 0.1,
        reasoning: 'No learned experience for this state'
      };
    }

    const stateActions = this.qTable.get(stateKey);
    let bestAction = null;
    let bestQValue = -Infinity;
    let confidence = 0.3;

    // Find action with highest Q-value
    availableActions.forEach(action => {
      const qValue = stateActions.get(action) || 0;
      if (qValue > bestQValue) {
        bestQValue = qValue;
        bestAction = action;
        confidence = Math.min(0.9, 0.3 + Math.abs(qValue) * 0.1);
      }
    });

    return {
      action: bestAction || availableActions[0],
      confidence: confidence,
      reasoning: `Q-learning exploitation (Q-value: ${bestQValue.toFixed(3)})`
    };
  }

  stateToKey(state) {
    // Convert state object to string key with reduced precision
    const simplified = {
      energy: Math.round(state.energyLevel * 10) / 10,
      battery: Math.round(state.batteryLevel * 10) / 10,
      activity: Math.round(state.userActivity * 10) / 10,
      cpu: Math.round(state.cpuUsage * 10) / 10,
      timeOfDay: Math.round(state.timeOfDay * 4) / 4 // Quarter-day precision
    };
    
    return JSON.stringify(simplified);
  }

  export() {
    return {
      qTable: Array.from(this.qTable.entries()).map(([state, actions]) => [
        state,
        Array.from(actions.entries())
      ]),
      learningRate: this.learningRate,
      discountFactor: this.discountFactor,
      explorationRate: this.explorationRate,
      episodeCount: this.episodeCount
    };
  }

  import(data) {
    this.qTable = new Map(
      data.qTable.map(([state, actions]) => [
        state,
        new Map(actions)
      ])
    );
    this.learningRate = data.learningRate || 0.1;
    this.discountFactor = data.discountFactor || 0.95;
    this.explorationRate = data.explorationRate || 0.1;
    this.episodeCount = data.episodeCount || 0;
  }
}

/**
 * Contextual Bandits - Multi-armed bandit problem solver for action selection
 */
class ContextualBandits {
  constructor() {
    this.arms = new Map(); // action -> arm data
    this.contextualArms = new Map(); // context -> arms
    this.totalRewards = 0;
    this.totalPulls = 0;
    this.explorationBonus = 2.0; // UCB1 exploration parameter
  }

  updateReward(context, action, reward) {
    // Update global arm statistics
    if (!this.arms.has(action)) {
      this.arms.set(action, {
        totalReward: 0,
        pullCount: 0,
        averageReward: 0,
        lastUpdated: Date.now()
      });
    }

    const arm = this.arms.get(action);
    arm.totalReward += reward;
    arm.pullCount++;
    arm.averageReward = arm.totalReward / arm.pullCount;
    arm.lastUpdated = Date.now();

    // Update contextual arm statistics
    const contextKey = this.contextToKey(context);
    if (!this.contextualArms.has(contextKey)) {
      this.contextualArms.set(contextKey, new Map());
    }

    const contextArms = this.contextualArms.get(contextKey);
    if (!contextArms.has(action)) {
      contextArms.set(action, {
        totalReward: 0,
        pullCount: 0,
        averageReward: 0
      });
    }

    const contextArm = contextArms.get(action);
    contextArm.totalReward += reward;
    contextArm.pullCount++;
    contextArm.averageReward = contextArm.totalReward / contextArm.pullCount;

    this.totalRewards += reward;
    this.totalPulls++;
  }

  selectAction(context, availableActions) {
    const contextKey = this.contextToKey(context);
    const contextArms = this.contextualArms.get(contextKey);

    let bestAction = null;
    let bestUCBValue = -Infinity;
    let confidence = 0.5;

    // UCB1 (Upper Confidence Bound) action selection
    availableActions.forEach(action => {
      let ucbValue = 0;
      
      // Use contextual data if available, otherwise fall back to global
      const armData = contextArms?.get(action) || this.arms.get(action);
      
      if (armData && armData.pullCount > 0) {
        const averageReward = armData.averageReward;
        const totalPulls = contextArms ? 
          Array.from(contextArms.values()).reduce((sum, arm) => sum + arm.pullCount, 0) :
          this.totalPulls;
        
        // UCB1 formula: average reward + exploration bonus
        const explorationBonus = this.explorationBonus * Math.sqrt(
          Math.log(totalPulls) / armData.pullCount
        );
        
        ucbValue = averageReward + explorationBonus;
        confidence = Math.min(0.9, 0.5 + (armData.pullCount / 50)); // More pulls = more confidence
      } else {
        // No data for this action, give it high exploration value
        ucbValue = this.explorationBonus * 10;
        confidence = 0.1;
      }

      if (ucbValue > bestUCBValue) {
        bestUCBValue = ucbValue;
        bestAction = action;
      }
    });

    return {
      action: bestAction || availableActions[0],
      confidence: confidence,
      reasoning: `UCB1 bandit selection (UCB: ${bestUCBValue.toFixed(3)})`
    };
  }

  contextToKey(context) {
    // Simplified context key for grouping similar contexts
    const simplified = {
      battery: context.batteryLevel > 0.7 ? 'high' : context.batteryLevel > 0.3 ? 'medium' : 'low',
      urgency: context.urgency || 'normal',
      activity: context.userActivity > 0.6 ? 'high' : context.userActivity > 0.3 ? 'medium' : 'low'
    };
    
    return JSON.stringify(simplified);
  }

  getExplorationRate() {
    // Calculate current exploration vs exploitation ratio
    if (this.totalPulls === 0) return 1.0;
    
    let explorationPulls = 0;
    for (const arm of this.arms.values()) {
      if (arm.pullCount < 5) { // Consider arms with few pulls as exploration
        explorationPulls += arm.pullCount;
      }
    }
    
    return explorationPulls / this.totalPulls;
  }

  export() {
    return {
      arms: Array.from(this.arms.entries()),
      contextualArms: Array.from(this.contextualArms.entries()).map(([context, arms]) => [
        context,
        Array.from(arms.entries())
      ]),
      totalRewards: this.totalRewards,
      totalPulls: this.totalPulls,
      explorationBonus: this.explorationBonus
    };
  }

  import(data) {
    this.arms = new Map(data.arms || []);
    this.contextualArms = new Map(
      (data.contextualArms || []).map(([context, arms]) => [
        context,
        new Map(arms)
      ])
    );
    this.totalRewards = data.totalRewards || 0;
    this.totalPulls = data.totalPulls || 0;
    this.explorationBonus = data.explorationBonus || 2.0;
  }
}

/**
 * Adaptation Engine - Adapts system behavior based on learning insights
 */
class AdaptationEngine {
  constructor() {
    this.adaptationHistory = [];
    this.adaptationRules = new Map();
    this.initializeAdaptationRules();
  }

  initializeAdaptationRules() {
    // Rule: Increase aggressiveness for users with high reward tolerance
    this.adaptationRules.set('aggressiveness_adaptation', {
      condition: (insights) => insights.averageReward > 7 && insights.userImpactTolerance > 0.6,
      adaptation: { type: 'increase_aggressiveness', amount: 0.1 },
      description: 'Increase optimization aggressiveness for tolerant users'
    });

    // Rule: Reduce frequency for users with low satisfaction
    this.adaptationRules.set('frequency_reduction', {
      condition: (insights) => insights.averageReward < 3 && insights.adaptationSuccess < 0.3,
      adaptation: { type: 'reduce_frequency', amount: 0.2 },
      description: 'Reduce optimization frequency for unsatisfied users'
    });

    // Rule: Adapt to user activity patterns
    this.adaptationRules.set('activity_pattern_adaptation', {
      condition: (insights) => insights.dominantActivityPeriod && insights.modelConfidence > 0.7,
      adaptation: { type: 'adjust_timing', pattern: 'activity_based' },
      description: 'Adjust optimization timing based on user activity patterns'
    });

    // Rule: Personalize based on energy sensitivity
    this.adaptationRules.set('energy_sensitivity_adaptation', {
      condition: (insights) => insights.energySensitivity && insights.totalExperiences > 20,
      adaptation: { type: 'personalize_energy_targets', level: 'energy_sensitive' },
      description: 'Personalize energy targets for energy-sensitive users'
    });
  }

  async adapt(experience, globalInsights) {
    const adaptations = [];
    
    // Generate insights from experience and global state
    const adaptationInsights = this.generateAdaptationInsights(experience, globalInsights);
    
    // Evaluate adaptation rules
    for (const [ruleId, rule] of this.adaptationRules.entries()) {
      if (rule.condition(adaptationInsights)) {
        const adaptation = await this.executeAdaptation(rule.adaptation, adaptationInsights);
        if (adaptation) {
          adaptations.push({
            ruleId,
            description: rule.description,
            adaptation,
            timestamp: Date.now()
          });
        }
      }
    }

    // Record adaptations
    this.recordAdaptations(adaptations, experience);

    return adaptations;
  }

  generateAdaptationInsights(experience, globalInsights) {
    return {
      ...globalInsights,
      recentReward: experience.reward,
      recentAction: experience.action,
      stateComplexity: this.calculateStateComplexity(experience.state),
      userImpactTolerance: this.estimateUserImpactTolerance(globalInsights),
      energySensitivity: this.detectEnergySensitivity(globalInsights),
      dominantActivityPeriod: this.identifyDominantActivityPeriod(globalInsights)
    };
  }

  calculateStateComplexity(state) {
    // Measure how complex/varied the current state is
    const stateValues = Object.values(state);
    const variance = this.calculateVariance(stateValues);
    return Math.min(variance * 2, 1); // Normalize to 0-1
  }

  calculateVariance(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  estimateUserImpactTolerance(insights) {
    // Estimate how much user impact the user tolerates based on their acceptance of actions
    if (insights.adaptationSuccess > 0.7) return 0.8;
    if (insights.adaptationSuccess > 0.5) return 0.6;
    if (insights.adaptationSuccess > 0.3) return 0.4;
    return 0.2;
  }

  detectEnergySensitivity(insights) {
    // Detect if user is particularly sensitive to energy optimizations
    return insights.averageReward > 5 && insights.totalExperiences > 10;
  }

  identifyDominantActivityPeriod(insights) {
    // Identify when the user is most active (would be based on actual activity data)
    // For now, return a placeholder pattern
    return insights.totalExperiences > 15 ? 'evening' : null;
  }

  async executeAdaptation(adaptationSpec, insights) {
    try {
      switch (adaptationSpec.type) {
        case 'increase_aggressiveness':
          return this.adaptAggressiveness(adaptationSpec.amount);
          
        case 'reduce_frequency':
          return this.adaptFrequency(-adaptationSpec.amount);
          
        case 'adjust_timing':
          return this.adaptTiming(adaptationSpec.pattern);
          
        case 'personalize_energy_targets':
          return this.personalizeEnergyTargets(adaptationSpec.level);
          
        default:
          console.warn(`[AdaptationEngine] Unknown adaptation type: ${adaptationSpec.type}`);
          return null;
      }
    } catch (error) {
      console.error('[AdaptationEngine] Adaptation execution failed:', error);
      return null;
    }
  }

  adaptAggressiveness(amount) {
    return {
      type: 'aggressiveness_change',
      change: amount,
      description: `Increased optimization aggressiveness by ${(amount * 100).toFixed(1)}%`,
      impact: 'system_behavior'
    };
  }

  adaptFrequency(amount) {
    return {
      type: 'frequency_change',
      change: amount,
      description: `${amount > 0 ? 'Increased' : 'Decreased'} optimization frequency by ${(Math.abs(amount) * 100).toFixed(1)}%`,
      impact: 'system_behavior'
    };
  }

  adaptTiming(pattern) {
    return {
      type: 'timing_adjustment',
      pattern: pattern,
      description: `Adjusted optimization timing based on ${pattern} pattern`,
      impact: 'scheduling'
    };
  }

  personalizeEnergyTargets(level) {
    return {
      type: 'energy_personalization',
      level: level,
      description: `Personalized energy targets for ${level} user`,
      impact: 'optimization_targets'
    };
  }

  recordAdaptations(adaptations, experience) {
    const record = {
      adaptations,
      experience: {
        action: experience.action,
        reward: experience.reward,
        timestamp: experience.timestamp
      },
      timestamp: Date.now()
    };

    this.adaptationHistory.push(record);

    // Keep history manageable
    if (this.adaptationHistory.length > 100) {
      this.adaptationHistory = this.adaptationHistory.slice(-50);
    }
  }

  getAdaptationSummary() {
    const recentAdaptations = this.adaptationHistory.slice(-20);
    
    return {
      totalAdaptations: this.adaptationHistory.length,
      recentAdaptations: recentAdaptations.length,
      adaptationTypes: this.summarizeAdaptationTypes(recentAdaptations),
      adaptationFrequency: recentAdaptations.length / 20,
      lastAdaptation: recentAdaptations.length > 0 ? recentAdaptations[recentAdaptations.length - 1] : null
    };
  }

  summarizeAdaptationTypes(adaptations) {
    const typeCounts = new Map();
    
    adaptations.forEach(record => {
      record.adaptations.forEach(adaptation => {
        const type = adaptation.adaptation?.type || 'unknown';
        typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
      });
    });

    return Object.fromEntries(typeCounts);
  }
}

/**
 * Experience Replay - Stores and replays experiences for improved learning
 */
class ExperienceReplay {
  constructor() {
    this.buffer = [];
    this.maxSize = 1000;
    this.batchSize = 32;
    this.priorityWeights = new Map();
  }

  store(experience) {
    // Add priority weight based on reward magnitude
    const priority = Math.abs(experience.reward || 0) + 0.1;
    this.priorityWeights.set(this.buffer.length, priority);

    this.buffer.push(experience);

    // Remove oldest experiences if buffer is full
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
      // Update priority weights indices
      this.updatePriorityWeights();
    }
  }

  updatePriorityWeights() {
    const newWeights = new Map();
    let index = 0;
    
    for (const [oldIndex, weight] of this.priorityWeights.entries()) {
      if (oldIndex > 0) { // Skip the removed first element
        newWeights.set(index, weight);
        index++;
      }
    }
    
    this.priorityWeights = newWeights;
  }

  sample(batchSize = this.batchSize) {
    if (this.buffer.length === 0) return [];

    const sampleSize = Math.min(batchSize, this.buffer.length);
    const samples = [];

    // Priority-based sampling
    for (let i = 0; i < sampleSize; i++) {
      const index = this.selectPriorityIndex();
      samples.push(this.buffer[index]);
    }

    return samples;
  }

  selectPriorityIndex() {
    // Weighted random selection based on priority
    const totalWeight = Array.from(this.priorityWeights.values()).reduce((a, b) => a + b, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const [index, weight] of this.priorityWeights.entries()) {
      randomWeight -= weight;
      if (randomWeight <= 0) {
        return Math.min(index, this.buffer.length - 1);
      }
    }

    // Fallback to random selection
    return Math.floor(Math.random() * this.buffer.length);
  }

  getRecentExperiences(count = 10) {
    return this.buffer.slice(-count);
  }

  size() {
    return this.buffer.length;
  }

  clear() {
    this.buffer = [];
    this.priorityWeights.clear();
  }
}