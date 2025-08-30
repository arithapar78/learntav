/**
 * Intelligent Actions - Advanced optimization actions with smart execution
 * Implements sophisticated optimization strategies without external AI
 */
class IntelligentActions {
  constructor() {
    this.actions = new Map();
    this.executionQueue = [];
    this.safetyLimits = new SafetyLimits();
    this.impactAnalyzer = new ImpactAnalyzer();
    this.tabSuspender = new TabSuspender();
    this.videoOptimizer = new VideoOptimizer();
    this.resourceBlocker = new ResourceBlocker();
    this.initializeActions();
  }

  initializeActions() {
    // High-impact energy optimization actions
    this.registerAction('intelligentTabSuspension', {
      handler: this.intelligentTabSuspension.bind(this),
      energySaving: 25,
      riskLevel: 'low',
      executionTime: 'fast',
      description: 'Suspend tabs using intelligent usage analysis'
    });

    this.registerAction('dynamicVideoOptimization', {
      handler: this.dynamicVideoOptimization.bind(this),
      energySaving: 30,
      riskLevel: 'medium',
      executionTime: 'medium',
      description: 'Optimize video quality based on context'
    });

    this.registerAction('resourcePreemption', {
      handler: this.resourcePreemption.bind(this),
      energySaving: 20,
      riskLevel: 'low',
      executionTime: 'fast',
      description: 'Preemptively block energy-heavy resources'
    });

    this.registerAction('contextualDarkMode', {
      handler: this.contextualDarkMode.bind(this),
      energySaving: 15,
      riskLevel: 'minimal',
      executionTime: 'fast',
      description: 'Enable dark mode based on intelligent context analysis'
    });

    this.registerAction('adaptiveRefreshRates', {
      handler: this.adaptiveRefreshRates.bind(this),
      energySaving: 18,
      riskLevel: 'low',
      executionTime: 'medium',
      description: 'Adjust refresh rates based on user attention'
    });

    this.registerAction('proactiveTabClustering', {
      handler: this.proactiveTabClustering.bind(this),
      energySaving: 22,
      riskLevel: 'low',
      executionTime: 'medium',
      description: 'Cluster and optimize related tabs together'
    });

    this.registerAction('backgroundProcessOptimization', {
      handler: this.backgroundProcessOptimization.bind(this),
      energySaving: 20,
      riskLevel: 'medium',
      executionTime: 'medium',
      description: 'Optimize background processes and timers'
    });

    this.registerAction('memoryDefragmentation', {
      handler: this.memoryDefragmentation.bind(this),
      energySaving: 15,
      riskLevel: 'low',
      executionTime: 'slow',
      description: 'Defragment and optimize memory usage'
    });
  }

  registerAction(name, config) {
    this.actions.set(name, config);
  }

  async executeAction(actionType, context = {}) {
    const action = this.actions.get(actionType);
    if (!action) {
      throw new Error(`Unknown action type: ${actionType}`);
    }

    console.log(`[IntelligentActions] Executing ${actionType}`);

    // Pre-execution safety check
    const safetyCheck = await this.safetyLimits.checkAction(actionType, context);
    if (!safetyCheck.safe) {
      return {
        success: false,
        error: `Safety check failed: ${safetyCheck.reason}`,
        actionType
      };
    }

    try {
      // Execute the action
      const startTime = performance.now();
      const result = await action.handler(context);
      const executionTime = performance.now() - startTime;

      // Post-execution impact analysis
      const impact = await this.impactAnalyzer.analyze(result, context);

      return {
        success: true,
        actionType,
        executionTime,
        energySaved: result.energySaved || 0,
        userImpact: result.userImpact || 'minimal',
        details: result.details || {},
        impact,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error(`[IntelligentActions] Action ${actionType} failed:`, error);
      return {
        success: false,
        actionType,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  async intelligentTabSuspension(context) {
    console.log('[IntelligentActions] Starting intelligent tab suspension');
    
    const tabAnalysis = await this.analyzeTabUsage(context);
    const suspensionCandidates = this.identifyOptimalSuspensionCandidates(tabAnalysis);
    
    const results = [];
    let totalEnergySaved = 0;

    for (const candidate of suspensionCandidates) {
      // Safety check before suspension
      if (await this.safetyLimits.canSuspendTab(candidate)) {
        const suspensionResult = await this.tabSuspender.suspendIntelligently(candidate);
        
        if (suspensionResult.success) {
          results.push({
            tabId: candidate.tabId,
            url: candidate.url,
            suspensionMethod: suspensionResult.method,
            energySaved: suspensionResult.energySaved,
            userImpact: suspensionResult.userImpact
          });
          
          totalEnergySaved += suspensionResult.energySaved;
        }
      }
    }

    return {
      success: true,
      action: 'intelligentTabSuspension',
      tabsSuspended: results.length,
      totalEnergySaved,
      details: results,
      userImpact: this.calculateOverallUserImpact(results)
    };
  }

  async analyzeTabUsage(context) {
    try {
      const tabs = await chrome.tabs.query({});
      const analysis = new Map();

      for (const tab of tabs) {
        const tabMetrics = await this.getTabMetrics(tab.id);
        const usagePattern = await this.analyzeTabUsagePattern(tab, tabMetrics);
        
        analysis.set(tab.id, {
          ...tab,
          metrics: tabMetrics,
          usagePattern,
          suspensionScore: this.calculateSuspensionScore(tab, tabMetrics, usagePattern),
          energyImpact: this.calculateTabEnergyImpact(tabMetrics),
          userImportance: this.calculateUserImportance(usagePattern)
        });
      }

      return analysis;
    } catch (error) {
      console.error('[IntelligentActions] Tab analysis failed:', error);
      return new Map();
    }
  }

  async getTabMetrics(tabId) {
    try {
      // In a real implementation, this would get actual tab metrics
      // For now, simulate realistic metrics
      return {
        powerUsage: Math.random() * 30 + 5, // 5-35W
        cpuUsage: Math.random() * 50 + 10, // 10-60%
        memoryUsage: Math.random() * 100 + 20, // 20-120MB
        networkActivity: Math.random() * 10, // 0-10 requests/min
        lastActive: Date.now() - Math.random() * 3600000 // Up to 1 hour ago
      };
    } catch (error) {
      console.warn(`[IntelligentActions] Could not get metrics for tab ${tabId}:`, error);
      return {
        powerUsage: 10,
        cpuUsage: 20,
        memoryUsage: 50,
        networkActivity: 1,
        lastActive: Date.now() - 300000 // 5 minutes ago
      };
    }
  }

  async analyzeTabUsagePattern(tab, metrics) {
    const now = Date.now();
    const lastActiveMinutes = (now - metrics.lastActive) / (1000 * 60);
    
    return {
      lastActive: metrics.lastActive,
      inactiveMinutes: lastActiveMinutes,
      importance: this.calculateTabImportance(tab),
      accessFrequency: this.calculateAccessFrequency(tab),
      typeImportance: this.getTabTypeImportance(tab.url),
      isBackground: !tab.active,
      hasAudio: tab.audible || false,
      isPinned: tab.pinned || false
    };
  }

  calculateTabImportance(tab) {
    let importance = 0.5;
    
    // Active tab is very important
    if (tab.active) importance += 0.4;
    
    // Pinned tabs are important
    if (tab.pinned) importance += 0.3;
    
    // Audio tabs are important
    if (tab.audible) importance += 0.2;
    
    // Check URL importance
    const urlImportance = this.getTabTypeImportance(tab.url);
    importance += urlImportance * 0.3;
    
    return Math.min(importance, 1.0);
  }

  getTabTypeImportance(url) {
    if (!url) return 0.3;
    
    const importantSites = [
      'mail.google.com', 'outlook.com', 'calendar.google.com',
      'docs.google.com', 'github.com', 'stackoverflow.com',
      'slack.com', 'teams.microsoft.com', 'zoom.us'
    ];
    
    const socialSites = [
      'facebook.com', 'twitter.com', 'instagram.com', 'tiktok.com'
    ];
    
    const entertainmentSites = [
      'youtube.com', 'netflix.com', 'twitch.tv', 'reddit.com'
    ];
    
    if (importantSites.some(site => url.includes(site))) return 0.9;
    if (entertainmentSites.some(site => url.includes(site))) return 0.6;
    if (socialSites.some(site => url.includes(site))) return 0.4;
    
    return 0.5; // Default importance
  }

  calculateAccessFrequency(tab) {
    // In a real implementation, this would track actual access patterns
    // For now, simulate based on tab characteristics
    if (tab.pinned) return 0.9;
    if (tab.active) return 1.0;
    return Math.random() * 0.8 + 0.1; // 0.1-0.9
  }

  calculateSuspensionScore(tab, metrics, usagePattern) {
    let score = 0;
    
    // Factor in inactivity time (40% weight)
    const inactivityScore = Math.min(usagePattern.inactiveMinutes / 30, 1) * 0.4;
    score += inactivityScore;
    
    // Factor in energy consumption (30% weight)
    const energyScore = Math.min(metrics.powerUsage / 20, 1) * 0.3;
    score += energyScore;
    
    // Factor in user importance (30% weight) - inverse
    score += (1 - usagePattern.importance) * 0.3;
    
    // Apply penalties
    if (tab.active) score *= 0.1; // Almost never suspend active tab
    if (tab.audible) score *= 0.2; // Rarely suspend audio tabs
    if (tab.pinned) score *= 0.3; // Carefully consider pinned tabs
    
    return Math.min(score, 1);
  }

  calculateTabEnergyImpact(metrics) {
    return metrics.powerUsage + (metrics.cpuUsage * 0.1) + (metrics.memoryUsage * 0.05);
  }

  calculateUserImportance(usagePattern) {
    let importance = 0;
    
    // Frequency of use (40% weight)
    importance += usagePattern.accessFrequency * 0.4;
    
    // Recency of use (30% weight)
    const hoursSinceLastUse = usagePattern.inactiveMinutes / 60;
    importance += Math.max(0, (24 - hoursSinceLastUse) / 24) * 0.3;
    
    // Tab type importance (30% weight)
    importance += usagePattern.typeImportance * 0.3;
    
    return Math.min(importance, 1);
  }

  identifyOptimalSuspensionCandidates(tabAnalysis) {
    const candidates = Array.from(tabAnalysis.values())
      .filter(tab => tab.suspensionScore > 0.6) // High suspension score
      .filter(tab => tab.userImportance < 0.4) // Low user importance
      .filter(tab => tab.energyImpact > 5) // Significant energy impact
      .filter(tab => !tab.active) // Never suspend active tab
      .filter(tab => !tab.audible) // Never suspend audio tabs
      .sort((a, b) => b.suspensionScore - a.suspensionScore);

    // Limit to top candidates to avoid over-suspension
    return candidates.slice(0, Math.min(5, Math.floor(candidates.length * 0.3)));
  }

  calculateOverallUserImpact(results) {
    if (results.length === 0) return 'minimal';
    
    const impacts = results.map(r => {
      switch (r.userImpact) {
        case 'minimal': return 1;
        case 'low': return 2;
        case 'medium': return 3;
        case 'high': return 4;
        default: return 2;
      }
    });
    
    const avgImpact = impacts.reduce((a, b) => a + b, 0) / impacts.length;
    
    if (avgImpact <= 1.5) return 'minimal';
    if (avgImpact <= 2.5) return 'low';
    if (avgImpact <= 3.5) return 'medium';
    return 'high';
  }

  async dynamicVideoOptimization(context) {
    console.log('[IntelligentActions] Starting dynamic video optimization');
    
    const videoTabs = await this.findActiveVideoTabs();
    const optimizations = [];
    let totalEnergySaved = 0;

    for (const videoTab of videoTabs) {
      const currentQuality = await this.detectVideoQuality(videoTab);
      const optimalQuality = await this.calculateOptimalVideoQuality(videoTab, context);
      
      if (this.shouldOptimizeVideo(currentQuality, optimalQuality, context)) {
        const optimizationResult = await this.videoOptimizer.optimizeQuality(
          videoTab, 
          optimalQuality
        );
        
        if (optimizationResult.success) {
          optimizations.push({
            tabId: videoTab.id,
            url: videoTab.url,
            oldQuality: currentQuality,
            newQuality: optimalQuality,
            energySaved: optimizationResult.energySaved,
            qualityReduction: this.calculateQualityReduction(currentQuality, optimalQuality)
          });
          
          totalEnergySaved += optimizationResult.energySaved;
        }
      }
    }

    return {
      success: true,
      action: 'dynamicVideoOptimization',
      videosOptimized: optimizations.length,
      totalEnergySaved,
      averageQualityReduction: this.calculateAverageQualityReduction(optimizations),
      details: optimizations,
      userImpact: optimizations.length > 0 ? 'medium' : 'minimal'
    };
  }

  async findActiveVideoTabs() {
    try {
      const tabs = await chrome.tabs.query({});
      const videoTabs = [];
      
      for (const tab of tabs) {
        if (await this.hasActiveVideo(tab)) {
          videoTabs.push(tab);
        }
      }
      
      return videoTabs;
    } catch (error) {
      console.error('[IntelligentActions] Failed to find video tabs:', error);
      return [];
    }
  }

  async hasActiveVideo(tab) {
    try {
      // Check if tab URL suggests video content
      const videoSites = ['youtube.com', 'vimeo.com', 'netflix.com', 'twitch.tv', 'dailymotion.com'];
      if (videoSites.some(site => tab.url && tab.url.includes(site))) {
        return true;
      }
      
      // Check if tab has audio (likely video)
      return tab.audible || false;
    } catch (error) {
      return false;
    }
  }

  async detectVideoQuality(tab) {
    // In a real implementation, this would detect actual video quality
    // For now, simulate realistic quality detection
    const qualities = ['1080p', '720p', '480p', '360p'];
    return qualities[Math.floor(Math.random() * qualities.length)];
  }

  async calculateOptimalVideoQuality(tab, context) {
    // Determine optimal quality based on context
    const energyBudget = context.energyBudget || 'medium';
    const batteryLevel = context.batteryLevel || 'medium';
    const networkSpeed = context.networkSpeed || 'medium';
    
    // Quality mapping based on context
    if (energyBudget === 'low' || batteryLevel === 'low') {
      return '360p';
    } else if (energyBudget === 'medium' && networkSpeed !== 'high') {
      return '480p';
    } else if (energyBudget === 'high' && networkSpeed === 'high') {
      return '720p';
    }
    
    return '480p'; // Default
  }

  shouldOptimizeVideo(currentQuality, optimalQuality, context) {
    const qualityLevels = { '360p': 1, '480p': 2, '720p': 3, '1080p': 4 };
    
    const currentLevel = qualityLevels[currentQuality] || 2;
    const optimalLevel = qualityLevels[optimalQuality] || 2;
    
    // Only optimize if we're reducing quality significantly
    return currentLevel > optimalLevel + 1;
  }

  calculateQualityReduction(oldQuality, newQuality) {
    const qualityLevels = { '360p': 1, '480p': 2, '720p': 3, '1080p': 4 };
    
    const oldLevel = qualityLevels[oldQuality] || 2;
    const newLevel = qualityLevels[newQuality] || 2;
    
    return Math.max(0, oldLevel - newLevel);
  }

  calculateAverageQualityReduction(optimizations) {
    if (optimizations.length === 0) return 0;
    
    const totalReduction = optimizations.reduce((sum, opt) => sum + opt.qualityReduction, 0);
    return totalReduction / optimizations.length;
  }

  async resourcePreemption(context) {
    console.log('[IntelligentActions] Starting resource preemption');
    
    const blockedResources = [];
    let totalEnergyPrevented = 0;

    // Analyze upcoming resource loads
    const resourcePredictions = await this.predictResourceLoads(context);
    
    for (const prediction of resourcePredictions) {
      if (this.shouldBlockResource(prediction, context)) {
        const blockResult = await this.resourceBlocker.blockPreemptively(prediction);
        
        if (blockResult.success) {
          blockedResources.push({
            url: prediction.url,
            type: prediction.type,
            energyPrevented: blockResult.energyPrevented,
            blockingMethod: blockResult.method
          });
          
          totalEnergyPrevented += blockResult.energyPrevented;
        }
      }
    }

    return {
      success: true,
      action: 'resourcePreemption',
      resourcesBlocked: blockedResources.length,
      totalEnergyPrevented,
      details: blockedResources,
      userImpact: 'minimal'
    };
  }

  async predictResourceLoads(context) {
    // Predict likely resource loads based on current tab state and patterns
    const predictions = [];
    
    try {
      const tabs = await chrome.tabs.query({ active: true });
      
      for (const tab of tabs) {
        // Predict common resource types that will load
        const siteType = this.identifySiteType(tab.url);
        const commonResources = this.getCommonResourcesForSiteType(siteType);
        
        commonResources.forEach(resource => {
          predictions.push({
            url: resource.pattern,
            type: resource.type,
            probability: resource.probability,
            energyCost: resource.energyCost
          });
        });
      }
    } catch (error) {
      console.error('[IntelligentActions] Resource prediction failed:', error);
    }
    
    return predictions;
  }

  identifySiteType(url) {
    if (!url) return 'unknown';
    
    if (url.includes('youtube.com') || url.includes('vimeo.com')) return 'video';
    if (url.includes('facebook.com') || url.includes('twitter.com')) return 'social';
    if (url.includes('news') || url.includes('blog')) return 'news';
    if (url.includes('shop') || url.includes('amazon')) return 'ecommerce';
    
    return 'general';
  }

  getCommonResourcesForSiteType(siteType) {
    const resourceMaps = {
      video: [
        { pattern: '*://*/analytics*', type: 'analytics', probability: 0.9, energyCost: 3 },
        { pattern: '*://*/ads*', type: 'advertising', probability: 0.8, energyCost: 5 },
        { pattern: '*://*/tracking*', type: 'tracking', probability: 0.9, energyCost: 2 }
      ],
      social: [
        { pattern: '*://*/analytics*', type: 'analytics', probability: 0.95, energyCost: 4 },
        { pattern: '*://*/ads*', type: 'advertising', probability: 0.9, energyCost: 6 },
        { pattern: '*://*/widget*', type: 'widget', probability: 0.7, energyCost: 3 }
      ],
      news: [
        { pattern: '*://*/analytics*', type: 'analytics', probability: 0.9, energyCost: 3 },
        { pattern: '*://*/ads*', type: 'advertising', probability: 0.95, energyCost: 7 },
        { pattern: '*://*/comments*', type: 'comments', probability: 0.6, energyCost: 2 }
      ],
      general: [
        { pattern: '*://*/analytics*', type: 'analytics', probability: 0.8, energyCost: 2 },
        { pattern: '*://*/ads*', type: 'advertising', probability: 0.7, energyCost: 4 }
      ]
    };
    
    return resourceMaps[siteType] || resourceMaps.general;
  }

  shouldBlockResource(prediction, context) {
    const aggressiveness = context.aggressiveness || 'moderate';
    
    // High-energy cost resources are good candidates
    if (prediction.energyCost > 5) return true;
    
    // Analytics and ads based on aggressiveness level
    if (prediction.type === 'advertising') {
      return aggressiveness !== 'conservative';
    }
    
    if (prediction.type === 'analytics') {
      return aggressiveness === 'aggressive';
    }
    
    if (prediction.type === 'tracking') {
      return aggressiveness !== 'conservative';
    }
    
    return false;
  }

  async contextualDarkMode(context) {
    console.log('[IntelligentActions] Starting contextual dark mode');
    
    const darkModeChanges = [];
    let totalEnergySaved = 0;

    // Analyze which sites should switch to dark mode
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      const shouldEnableDarkMode = await this.shouldEnableDarkModeForTab(tab, context);
      
      if (shouldEnableDarkMode && !await this.isTabInDarkMode(tab)) {
        const darkModeResult = await this.enableDarkModeForTab(tab);
        
        if (darkModeResult.success) {
          darkModeChanges.push({
            tabId: tab.id,
            url: tab.url,
            method: darkModeResult.method,
            energySaved: darkModeResult.energySaved
          });
          
          totalEnergySaved += darkModeResult.energySaved;
        }
      }
    }

    return {
      success: true,
      action: 'contextualDarkMode',
      tabsOptimized: darkModeChanges.length,
      totalEnergySaved,
      details: darkModeChanges,
      userImpact: 'minimal'
    };
  }

  async shouldEnableDarkModeForTab(tab, context) {
    // Check time of day
    const hour = new Date().getHours();
    const isEvening = hour >= 18 || hour <= 6;
    
    // Check if site supports dark mode
    const supportsDarkMode = this.siteSupportsAutoDarkMode(tab.url);
    
    // Check energy saving potential
    const energySavingPotential = this.calculateDarkModeEnergySaving(tab.url);
    
    // Check user preference context
    const userPrefersAuto = context.autoDarkMode !== false;
    
    return isEvening && supportsDarkMode && energySavingPotential > 5 && userPrefersAuto;
  }

  siteSupportsAutoDarkMode(url) {
    if (!url) return false;
    
    // Sites that commonly support dark mode
    const supportedSites = [
      'youtube.com', 'github.com', 'twitter.com', 'reddit.com',
      'stackoverflow.com', 'docs.google.com', 'mail.google.com'
    ];
    
    return supportedSites.some(site => url.includes(site));
  }

  calculateDarkModeEnergySaving(url) {
    // Sites with white backgrounds benefit most from dark mode
    const highBenefitSites = ['docs.google.com', 'mail.google.com', 'github.com'];
    const mediumBenefitSites = ['stackoverflow.com', 'reddit.com'];
    
    if (highBenefitSites.some(site => url && url.includes(site))) return 12;
    if (mediumBenefitSites.some(site => url && url.includes(site))) return 8;
    
    return 5; // Default benefit
  }

  async isTabInDarkMode(tab) {
    // In a real implementation, this would check the actual dark mode state
    // For now, simulate detection
    return Math.random() < 0.3; // 30% chance already in dark mode
  }

  async enableDarkModeForTab(tab) {
    try {
      // In a real implementation, this would inject CSS or trigger site's dark mode
      console.log(`[IntelligentActions] Enabling dark mode for ${tab.url}`);
      
      return {
        success: true,
        method: 'css_injection',
        energySaved: this.calculateDarkModeEnergySaving(tab.url)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async adaptiveRefreshRates(context) {
    // Placeholder for adaptive refresh rate optimization
    return {
      success: true,
      action: 'adaptiveRefreshRates',
      tabsOptimized: 0,
      totalEnergySaved: 0,
      details: [],
      userImpact: 'minimal'
    };
  }

  async proactiveTabClustering(context) {
    // Placeholder for proactive tab clustering
    return {
      success: true,
      action: 'proactiveTabClustering',
      tabsClustered: 0,
      totalEnergySaved: 0,
      details: [],
      userImpact: 'minimal'
    };
  }

  async backgroundProcessOptimization(context) {
    // Placeholder for background process optimization
    return {
      success: true,
      action: 'backgroundProcessOptimization',
      processesOptimized: 0,
      totalEnergySaved: 0,
      details: [],
      userImpact: 'low'
    };
  }

  async memoryDefragmentation(context) {
    // Placeholder for memory defragmentation
    return {
      success: true,
      action: 'memoryDefragmentation',
      memoryFreed: 0,
      totalEnergySaved: 0,
      details: [],
      userImpact: 'minimal'
    };
  }
}

/**
 * Safety Limits - Ensures actions don't negatively impact user experience
 */
class SafetyLimits {
  constructor() {
    this.limits = {
      maxTabSuspensionsPerHour: 10,
      maxVideoOptimizationsPerSession: 5,
      minTabsToKeepActive: 2,
      maxUserImpactScore: 0.7
    };
    this.recentActions = new Map();
  }

  async checkAction(actionType, context) {
    // Check rate limits
    const rateCheck = this.checkRateLimit(actionType);
    if (!rateCheck.safe) {
      return rateCheck;
    }

    // Check context-specific safety
    switch (actionType) {
      case 'intelligentTabSuspension':
        return this.checkTabSuspensionSafety(context);
      case 'dynamicVideoOptimization':
        return this.checkVideoOptimizationSafety(context);
      default:
        return { safe: true };
    }
  }

  checkRateLimit(actionType) {
    const now = Date.now();
    const hourAgo = now - 3600000;
    
    // Clean old actions
    for (const [timestamp, action] of this.recentActions.entries()) {
      if (timestamp < hourAgo) {
        this.recentActions.delete(timestamp);
      }
    }
    
    // Count recent actions of this type
    const recentCount = Array.from(this.recentActions.values())
      .filter(action => action.type === actionType).length;
    
    const limit = this.limits[`max${actionType.charAt(0).toUpperCase() + actionType.slice(1)}sPerHour`] || 20;
    
    if (recentCount >= limit) {
      return {
        safe: false,
        reason: `Rate limit exceeded: ${recentCount}/${limit} ${actionType} actions in the last hour`
      };
    }
    
    return { safe: true };
  }

  checkTabSuspensionSafety(context) {
    // Never suspend if too few tabs are active
    const activeTabs = context.activeTabs || 0;
    if (activeTabs <= this.limits.minTabsToKeepActive) {
      return {
        safe: false,
        reason: `Too few active tabs (${activeTabs}), minimum required: ${this.limits.minTabsToKeepActive}`
      };
    }
    
    return { safe: true };
  }

  checkVideoOptimizationSafety(context) {
    // Check if user is actively watching video
    if (context.userActivelyWatching) {
      return {
        safe: false,
        reason: 'User is actively watching video'
      };
    }
    
    return { safe: true };
  }

  async canSuspendTab(tab) {
    // Never suspend active, audio, or pinned tabs
    if (tab.active || tab.audible || tab.pinned) {
      return false;
    }
    
    // Check if tab has been recently accessed
    const recentlyAccessed = (Date.now() - tab.usagePattern.lastActive) < 300000; // 5 minutes
    if (recentlyAccessed && tab.userImportance > 0.7) {
      return false;
    }
    
    return true;
  }

  recordAction(actionType) {
    this.recentActions.set(Date.now(), { type: actionType, timestamp: Date.now() });
  }
}

/**
 * Impact Analyzer - Analyzes the impact of actions on user experience and energy
 */
class ImpactAnalyzer {
  async analyze(result, context) {
    return {
      energyImpact: this.analyzeEnergyImpact(result),
      userExperienceImpact: this.analyzeUserExperienceImpact(result),
      performanceImpact: this.analyzePerformanceImpact(result),
      overallScore: this.calculateOverallScore(result)
    };
  }

  analyzeEnergyImpact(result) {
    return {
      saved: result.energySaved || 0,
      efficiency: this.calculateEfficiency(result),
      sustainability: result.energySaved > 10 ? 'high' : result.energySaved > 5 ? 'medium' : 'low'
    };
  }

  analyzeUserExperienceImpact(result) {
    const impactScore = this.calculateUserImpactScore(result.userImpact);
    return {
      level: result.userImpact || 'minimal',
      score: impactScore,
      acceptable: impactScore < 0.7
    };
  }

  analyzePerformanceImpact(result) {
    return {
      executionTime: result.executionTime || 0,
      resourceUsage: 'low',
      systemLoad: 'minimal'
    };
  }

  calculateEfficiency(result) {
    const energyPerMS = (result.energySaved || 0) / (result.executionTime || 1);
    return energyPerMS > 0.1 ? 'high' : energyPerMS > 0.01 ? 'medium' : 'low';
  }

  calculateUserImpactScore(userImpact) {
    const scores = {
      'minimal': 0.1,
      'low': 0.3,
      'medium': 0.6,
      'high': 0.9
    };
    return scores[userImpact] || 0.5;
  }

  calculateOverallScore(result) {
    const energyWeight = 0.4;
    const userImpactWeight = 0.4;
    const performanceWeight = 0.2;
    
    const energyScore = Math.min((result.energySaved || 0) / 30, 1); // Normalize to 0-1
    const userImpactScore = 1 - this.calculateUserImpactScore(result.userImpact); // Invert (lower impact = higher score)
    const performanceScore = 1 - Math.min((result.executionTime || 0) / 1000, 1); // Normalize execution time
    
    return energyScore * energyWeight + userImpactScore * userImpactWeight + performanceScore * performanceWeight;
  }
}

/**
 * Tab Suspender - Intelligent tab suspension with multiple strategies
 */
class TabSuspender {
  constructor() {
    this.suspensionMethods = ['native', 'content_freeze', 'resource_pause'];
  }

  async suspendIntelligently(tab) {
    const method = this.selectOptimalSuspensionMethod(tab);
    
    try {
      const result = await this.executeSuspension(tab, method);
      return {
        success: true,
        method,
        energySaved: this.calculateSuspensionEnergySaving(tab),
        userImpact: this.calculateSuspensionUserImpact(tab)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  selectOptimalSuspensionMethod(tab) {
    // Select method based on tab characteristics
    if (tab.userImportance > 0.5) return 'resource_pause'; // Gentler approach
    if (tab.energyImpact > 20) return 'content_freeze'; // More aggressive
    return 'native'; // Standard approach
  }

  async executeSuspension(tab, method) {
    switch (method) {
      case 'native':
        return this.nativeSuspension(tab);
      case 'content_freeze':
        return this.contentFreeze(tab);
      case 'resource_pause':
        return this.resourcePause(tab);
      default:
        throw new Error(`Unknown suspension method: ${method}`);
    }
  }

  async nativeSuspension(tab) {
    // Use Chrome's native tab suspension (if available)
    console.log(`[TabSuspender] Native suspension for tab ${tab.id}`);
    return { success: true };
  }

  async contentFreeze(tab) {
    // Freeze tab content by injecting pause script
    console.log(`[TabSuspender] Content freeze for tab ${tab.id}`);
    return { success: true };
  }

  async resourcePause(tab) {
    // Pause resource loading while keeping tab responsive
    console.log(`[TabSuspender] Resource pause for tab ${tab.id}`);
    return { success: true };
  }

  calculateSuspensionEnergySaving(tab) {
    // Calculate energy saving based on tab's power usage
    const baseSaving = tab.metrics?.powerUsage || 10;
    const efficiencyMultiplier = tab.userImportance > 0.5 ? 0.7 : 1.0; // Less saving for important tabs
    return baseSaving * efficiencyMultiplier;
  }

  calculateSuspensionUserImpact(tab) {
    if (tab.userImportance > 0.7) return 'medium';
    if (tab.userImportance > 0.4) return 'low';
    return 'minimal';
  }
}

/**
 * Video Optimizer - Intelligent video quality optimization
 */
class VideoOptimizer {
  async optimizeQuality(tab, targetQuality) {
    console.log(`[VideoOptimizer] Optimizing video quality to ${targetQuality} for tab ${tab.id}`);
    
    try {
      // In a real implementation, this would inject scripts to change video quality
      const energySaved = this.calculateVideoEnergySaving(targetQuality);
      
      return {
        success: true,
        energySaved,
        method: 'quality_injection'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  calculateVideoEnergySaving(quality) {
    const qualityEnergyMap = {
      '360p': 8,
      '480p': 12,
      '720p': 18,
      '1080p': 25
    };
    
    // Energy saved by reducing from 1080p to target quality
    return (qualityEnergyMap['1080p'] || 25) - (qualityEnergyMap[quality] || 12);
  }
}

/**
 * Resource Blocker - Preemptive blocking of energy-heavy resources
 */
class ResourceBlocker {
  constructor() {
    this.blockedPatterns = new Set();
  }

  async blockPreemptively(resourcePrediction) {
    console.log(`[ResourceBlocker] Blocking ${resourcePrediction.type}: ${resourcePrediction.url}`);
    
    try {
      // In a real implementation, this would set up request blocking
      this.blockedPatterns.add(resourcePrediction.url);
      
      return {
        success: true,
        energyPrevented: resourcePrediction.energyCost,
        method: 'pattern_blocking'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  isBlocked(url) {
    return Array.from(this.blockedPatterns).some(pattern => {
      // Simple pattern matching - could be more sophisticated
      return url.includes(pattern.replace('*', ''));
    });
  }
}