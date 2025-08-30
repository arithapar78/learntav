// AI Model Energy Database
// Contains energy consumption data for various AI models and site detection logic

/**
 * AI Model Energy Database
 * Energy consumption data in Wh (Watt-hours) per query
 */
const AI_MODEL_DATABASE = {
  'gpt-4o': {
    name: 'GPT-4o',
    energyPerQuery: 0.0042, // 4.2 Wh/query
    pricing: '$0.015/1k tokens',
    ledTimeEquivalent: '30 minutes', // Time to power an LED bulb
    sites: ['chat.openai.com', 'chatgpt.com', 'openai.com'],
    detectionPatterns: [
      /gpt-?4o/i,
      /chatgpt/i,
      /openai\.com/i
    ],
    category: 'large-multimodal'
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    energyPerQuery: 0.0051, // 5.1 Wh/query
    pricing: '$0.003/1k tokens',
    ledTimeEquivalent: '36 minutes',
    sites: ['claude.ai', 'anthropic.com'],
    detectionPatterns: [
      /claude/i,
      /anthropic/i,
      /claude\.ai/i
    ],
    category: 'large-language'
  },
  'gemini-pro': {
    name: 'Gemini Pro',
    energyPerQuery: 0.0033, // 3.3 Wh/query
    pricing: '$0.001/1k tokens',
    ledTimeEquivalent: '24 minutes',
    sites: ['gemini.google.com', 'bard.google.com', 'ai.google.dev'],
    detectionPatterns: [
      /gemini/i,
      /bard/i,
      /ai\.google/i
    ],
    category: 'large-multimodal'
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    energyPerQuery: 0.0021, // 2.1 Wh/query
    pricing: '$0.001/1k tokens',
    ledTimeEquivalent: '15 minutes',
    sites: ['chat.openai.com', 'chatgpt.com'],
    detectionPatterns: [
      /gpt-?3\.?5/i,
      /turbo/i
    ],
    category: 'medium-language'
  },
  'claude-3-haiku': {
    name: 'Claude 3 Haiku',
    energyPerQuery: 0.0015, // 1.5 Wh/query
    pricing: '$0.00025/1k tokens',
    ledTimeEquivalent: '11 minutes',
    sites: ['claude.ai'],
    detectionPatterns: [
      /haiku/i,
      /claude.*3.*haiku/i
    ],
    category: 'small-language'
  },
  'llama-2-70b': {
    name: 'Llama 2 70B',
    energyPerQuery: 0.0048, // 4.8 Wh/query
    pricing: '$0.0007/1k tokens',
    ledTimeEquivalent: '34 minutes',
    sites: ['huggingface.co', 'together.ai', 'replicate.com'],
    detectionPatterns: [
      /llama.*2.*70b/i,
      /meta.*llama/i
    ],
    category: 'large-language'
  },
  'mistral-7b': {
    name: 'Mistral 7B',
    energyPerQuery: 0.0018, // 1.8 Wh/query
    pricing: '$0.0002/1k tokens',
    ledTimeEquivalent: '13 minutes',
    sites: ['mistral.ai', 'huggingface.co'],
    detectionPatterns: [
      /mistral.*7b/i,
      /mistral\.ai/i
    ],
    category: 'small-language'
  },
  'palm-2': {
    name: 'PaLM 2',
    energyPerQuery: 0.0039, // 3.9 Wh/query
    pricing: '$0.001/1k tokens',
    ledTimeEquivalent: '28 minutes',
    sites: ['makersuite.google.com', 'ai.google.dev'],
    detectionPatterns: [
      /palm.*2/i,
      /makersuite/i
    ],
    category: 'large-language'
  },
  'cohere-command': {
    name: 'Cohere Command',
    energyPerQuery: 0.0024, // 2.4 Wh/query
    pricing: '$0.0015/1k tokens',
    ledTimeEquivalent: '17 minutes',
    sites: ['cohere.com', 'cohere.ai'],
    detectionPatterns: [
      /cohere/i,
      /command/i
    ],
    category: 'medium-language'
  },
  'stability-ai': {
    name: 'Stable Diffusion',
    energyPerQuery: 0.0067, // 6.7 Wh/query (image generation is more intensive)
    pricing: '$0.002/image',
    ledTimeEquivalent: '48 minutes',
    sites: ['stability.ai', 'dreamstudio.ai', 'huggingface.co'],
    detectionPatterns: [
      /stable.*diffusion/i,
      /stability.*ai/i,
      /dreamstudio/i
    ],
    category: 'image-generation'
  }
};

/**
 * Site detection patterns for AI platforms
 */
const AI_SITE_PATTERNS = {
  // OpenAI/ChatGPT
  openai: {
    domains: ['chat.openai.com', 'chatgpt.com', 'openai.com', 'platform.openai.com'],
    defaultModel: 'gpt-4o',
    pathPatterns: [
      { pattern: /\/chat/i, model: 'gpt-4o' },
      { pattern: /gpt-3\.5/i, model: 'gpt-3.5-turbo' },
      { pattern: /gpt-4/i, model: 'gpt-4o' }
    ]
  },
  
  // Anthropic/Claude
  anthropic: {
    domains: ['claude.ai', 'anthropic.com'],
    defaultModel: 'claude-3-sonnet',
    pathPatterns: [
      { pattern: /sonnet/i, model: 'claude-3-sonnet' },
      { pattern: /haiku/i, model: 'claude-3-haiku' }
    ]
  },
  
  // Google/Gemini
  google: {
    domains: ['gemini.google.com', 'bard.google.com', 'ai.google.dev', 'makersuite.google.com'],
    defaultModel: 'gemini-pro',
    pathPatterns: [
      { pattern: /gemini/i, model: 'gemini-pro' },
      { pattern: /bard/i, model: 'gemini-pro' },
      { pattern: /palm/i, model: 'palm-2' }
    ]
  },
  
  // Stability AI
  stability: {
    domains: ['stability.ai', 'dreamstudio.ai'],
    defaultModel: 'stability-ai',
    pathPatterns: [
      { pattern: /stable.*diffusion/i, model: 'stability-ai' },
      { pattern: /dream/i, model: 'stability-ai' }
    ]
  },
  
  // Mistral AI
  mistral: {
    domains: ['mistral.ai'],
    defaultModel: 'mistral-7b',
    pathPatterns: [
      { pattern: /7b/i, model: 'mistral-7b' }
    ]
  },
  
  // Cohere
  cohere: {
    domains: ['cohere.com', 'cohere.ai'],
    defaultModel: 'cohere-command',
    pathPatterns: [
      { pattern: /command/i, model: 'cohere-command' }
    ]
  },
  
  // HuggingFace (multiple models)
  huggingface: {
    domains: ['huggingface.co'],
    defaultModel: 'llama-2-70b',
    pathPatterns: [
      { pattern: /llama.*2.*70b/i, model: 'llama-2-70b' },
      { pattern: /mistral.*7b/i, model: 'mistral-7b' },
      { pattern: /stable.*diffusion/i, model: 'stability-ai' }
    ]
  }
};

/**
 * AI Energy Manager Class
 * Handles AI model detection, energy calculation, and integration
 */
class AIEnergyManager {
  constructor() {
    this.detectedModels = new Map();
    this.sessionUsage = new Map();
    this.totalSessionEnergy = 0;
    this.lastDetectionTime = 0;
  }
  
  /**
   * Detect AI model being used on current page
   * @param {string} url - Current page URL
   * @param {string} title - Page title
   * @param {string} content - Page content (optional)
   * @returns {Object|null} Detected model info
   */
  detectAIModel(url, title = '', content = '') {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      const path = urlObj.pathname.toLowerCase();
      const fullUrl = url.toLowerCase();
      
      // Check against site patterns
      for (const [platform, config] of Object.entries(AI_SITE_PATTERNS)) {
        if (config.domains.some(d => domain.includes(d) || d.includes(domain))) {
          
          // Try to detect specific model from path or content
          for (const pathPattern of config.pathPatterns || []) {
            if (pathPattern.pattern.test(path) || pathPattern.pattern.test(fullUrl) || pathPattern.pattern.test(title)) {
              const modelKey = pathPattern.model;
              if (AI_MODEL_DATABASE[modelKey]) {
                return {
                  platform,
                  modelKey,
                  model: AI_MODEL_DATABASE[modelKey],
                  confidence: 0.9
                };
              }
            }
          }
          
          // Fall back to default model for platform
          const defaultModelKey = config.defaultModel;
          if (AI_MODEL_DATABASE[defaultModelKey]) {
            return {
              platform,
              modelKey: defaultModelKey,
              model: AI_MODEL_DATABASE[defaultModelKey],
              confidence: 0.7
            };
          }
        }
      }
      
      // Check against individual model patterns
      for (const [modelKey, modelData] of Object.entries(AI_MODEL_DATABASE)) {
        // Check domain matches
        if (modelData.sites.some(site => domain.includes(site) || site.includes(domain))) {
          return {
            platform: 'detected',
            modelKey,
            model: modelData,
            confidence: 0.8
          };
        }
        
        // Check pattern matches in URL or title
        if (modelData.detectionPatterns.some(pattern => pattern.test(fullUrl) || pattern.test(title))) {
          return {
            platform: 'pattern',
            modelKey,
            model: modelData,
            confidence: 0.6
          };
        }
      }
      
      return null;
      
    } catch (error) {
      console.warn('[AIEnergyManager] Error detecting AI model:', error);
      return null;
    }
  }
  
  /**
   * Estimate AI usage based on page activity
   * @param {Object} tabData - Current tab data
   * @param {Object} detectedModel - Detected AI model
   * @returns {Object} Usage estimation
   */
  estimateAIUsage(tabData, detectedModel) {
    if (!detectedModel || !tabData) {
      return { queries: 0, energy: 0 };
    }
    
    const { model } = detectedModel;
    const duration = tabData.duration || 0;
    const domNodes = tabData.domNodes || 0;
    
    // Estimate queries based on various factors
    let estimatedQueries = 0;
    
    // Base estimation: assume some interaction every few minutes
    const timeBasedQueries = Math.floor(duration / (3 * 60 * 1000)); // Every 3 minutes
    
    // DOM complexity factor (more complex pages might indicate more AI interactions)
    const complexityFactor = Math.min(2, domNodes / 2000);
    const complexityBasedQueries = Math.floor(timeBasedQueries * complexityFactor);
    
    // Use the higher of the two estimates
    estimatedQueries = Math.max(timeBasedQueries, complexityBasedQueries);
    
    // Cap the estimation at reasonable limits
    estimatedQueries = Math.min(estimatedQueries, 20); // Max 20 queries per session
    
    // Calculate energy consumption
    const totalEnergy = estimatedQueries * model.energyPerQuery;
    
    return {
      queries: estimatedQueries,
      energy: totalEnergy,
      energyPerQuery: model.energyPerQuery,
      modelName: model.name
    };
  }
  
  /**
   * Convert AI energy consumption to watts (for consistency with browser power calculation)
   * @param {number} energyWh - Energy in watt-hours
   * @param {number} duration - Duration in milliseconds
   * @returns {number} Power in watts
   */
  convertEnergyToWatts(energyWh, duration = 3600000) {
    // Convert duration to hours
    const durationHours = duration / (1000 * 60 * 60);
    
    // Power = Energy / Time
    const watts = durationHours > 0 ? energyWh / durationHours : 0;
    
    return Math.max(0, watts);
  }
  
  /**
   * Get AI energy data for current session
   * @returns {Object} Session energy data
   */
  getSessionEnergyData() {
    const now = Date.now();
    const sessionStart = now - (24 * 60 * 60 * 1000); // Last 24 hours
    
    let totalEnergy = 0;
    let totalQueries = 0;
    const modelBreakdown = {};
    
    for (const [tabId, usage] of this.sessionUsage.entries()) {
      if (usage.timestamp >= sessionStart) {
        totalEnergy += usage.energy || 0;
        totalQueries += usage.queries || 0;
        
        const modelName = usage.modelName || 'Unknown';
        if (!modelBreakdown[modelName]) {
          modelBreakdown[modelName] = { energy: 0, queries: 0 };
        }
        modelBreakdown[modelName].energy += usage.energy || 0;
        modelBreakdown[modelName].queries += usage.queries || 0;
      }
    }
    
    return {
      totalEnergy,
      totalQueries,
      modelBreakdown,
      timestamp: now
    };
  }
  
  /**
   * Update usage tracking for a tab
   * @param {number} tabId - Tab ID
   * @param {Object} usage - Usage data
   */
  updateTabUsage(tabId, usage) {
    this.sessionUsage.set(tabId, {
      ...usage,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get all supported AI models
   * @returns {Object} AI model database
   */
  getAllModels() {
    return AI_MODEL_DATABASE;
  }
  
  /**
   * Get model by key
   * @param {string} modelKey - Model key
   * @returns {Object|null} Model data
   */
  getModel(modelKey) {
    return AI_MODEL_DATABASE[modelKey] || null;
  }
  
  /**
   * Clear old usage data (cleanup)
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const [tabId, usage] of this.sessionUsage.entries()) {
      if (now - usage.timestamp > maxAge) {
        this.sessionUsage.delete(tabId);
      }
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIEnergyManager, AI_MODEL_DATABASE, AI_SITE_PATTERNS };
} else if (typeof window !== 'undefined') {
  window.AIEnergyManager = AIEnergyManager;
  window.AI_MODEL_DATABASE = AI_MODEL_DATABASE;
  window.AI_SITE_PATTERNS = AI_SITE_PATTERNS;
}