// Data Migration Utility for Energy Score to Watts Conversion
// This utility handles the migration of legacy energy score data to power consumption data

class DataMigrationUtility {
  constructor() {
    this.powerCalculator = null;
    this.migrationVersion = '2.0.0';
    this.initPromise = null;
    this.init();
  }

  init() {
    try {
      // Initialize PowerCalculator for energy score conversion synchronously
      if (typeof PowerCalculator !== 'undefined') {
        this.powerCalculator = new PowerCalculator();
        console.log('[DataMigration] PowerCalculator initialized successfully');
      } else {
        console.error('[DataMigration] PowerCalculator not available');
        // Don't throw error to prevent service worker from failing
        console.warn('[DataMigration] Continuing without PowerCalculator - migration features will be limited');
      }
    } catch (error) {
      console.error('[DataMigration] Failed to initialize PowerCalculator:', error);
      // Don't throw error to prevent service worker from failing
    }
  }

  /**
   * Main migration method - migrates all legacy energy data to power-based format
   */
  async migrateLegacyData() {
    console.log('[DataMigration] Starting legacy energy data migration...');
    
    try {
      // Check if migration has already been completed
      const migrationStatus = await this.checkMigrationStatus();
      if (migrationStatus.completed) {
        console.log('[DataMigration] Migration already completed at version:', migrationStatus.version);
        return {
          success: true,
          message: 'Migration already completed',
          stats: migrationStatus.stats
        };
      }

      // Get all stored data
      const allData = await this.getAllStoredData();
      
      // Separate different types of data
      const energyHistory = this.extractEnergyHistory(allData);
      const settings = this.extractSettings(allData);
      
      console.log('[DataMigration] Found', energyHistory.length, 'energy history entries to migrate');

      // Migrate energy history data
      const migratedHistory = await this.migrateEnergyHistoryData(energyHistory);
      
      // Migrate settings
      const migratedSettings = await this.migrateSettings(settings);
      
      // Create backup of original data
      const backupKey = `backup_pre_migration_${Date.now()}`;
      await this.createBackup(backupKey, { history: energyHistory, settings });
      
      // Store migrated data
      await this.storeMigratedData(migratedHistory, migratedSettings);
      
      // Mark migration as complete
      const migrationStats = {
        entriesMigrated: migratedHistory.length,
        settingsMigrated: Object.keys(migratedSettings).length,
        backupKey: backupKey,
        migrationDate: new Date().toISOString(),
        version: this.migrationVersion
      };
      
      await this.markMigrationComplete(migrationStats);
      
      console.log('[DataMigration] Migration completed successfully:', migrationStats);
      
      return {
        success: true,
        message: 'Migration completed successfully',
        stats: migrationStats
      };
      
    } catch (error) {
      console.error('[DataMigration] Migration failed:', error);
      return {
        success: false,
        message: 'Migration failed: ' + error.message,
        error: error
      };
    }
  }

  /**
   * Check if migration has already been completed
   */
  async checkMigrationStatus() {
    try {
      const result = await chrome.storage.local.get(['migration_status']);
      return result.migration_status || { completed: false };
    } catch (error) {
      console.error('[DataMigration] Failed to check migration status:', error);
      return { completed: false };
    }
  }

  /**
   * Get all data from chrome.storage.local
   */
  async getAllStoredData() {
    try {
      return await chrome.storage.local.get(null);
    } catch (error) {
      console.error('[DataMigration] Failed to get stored data:', error);
      throw error;
    }
  }

  /**
   * Extract energy history entries from stored data
   */
  extractEnergyHistory(allData) {
    const historyEntries = [];
    
    // Look for energy history keys (pattern: energy_YYYYMMDD or similar)
    Object.keys(allData).forEach(key => {
      if (key.startsWith('energy_') || key.startsWith('history_') || key === 'energyHistory') {
        const data = allData[key];
        if (Array.isArray(data)) {
          historyEntries.push(...data);
        } else if (data && typeof data === 'object' && data.energyScore !== undefined) {
          historyEntries.push(data);
        }
      }
    });

    return historyEntries;
  }

  /**
   * Extract settings from stored data
   */
  extractSettings(allData) {
    return allData.settings || {};
  }

  /**
   * Migrate energy history data to power-based format
   */
  async migrateEnergyHistoryData(historyEntries) {
    const migratedEntries = [];
    
    for (const entry of historyEntries) {
      try {
        const migratedEntry = await this.migrateHistoryEntry(entry);
        migratedEntries.push(migratedEntry);
      } catch (error) {
        console.warn('[DataMigration] Failed to migrate entry:', entry, error);
        // Keep original entry if migration fails
        migratedEntries.push(entry);
      }
    }

    return migratedEntries;
  }

  /**
   * Migrate a single history entry
   */
  async migrateHistoryEntry(entry) {
    // If entry already has power data, return as-is
    if (entry.powerWatts !== undefined) {
      return entry;
    }

    // If no energy score, return as-is
    if (entry.energyScore === undefined) {
      return entry;
    }

    try {
      // Check if PowerCalculator is available
      if (!this.powerCalculator) {
        console.warn('[DataMigration] PowerCalculator not available, using fallback conversion');
        // Fallback conversion logic
        const estimatedWatts = this.fallbackEnergyScoreToWatts(entry.energyScore);
        const durationHours = (entry.duration || 0) / (1000 * 60 * 60);
        const energyKWh = (estimatedWatts * durationHours) / 1000;
        
        return {
          ...entry,
          powerWatts: estimatedWatts,
          energyKWh: energyKWh,
          migrated: true,
          migrationVersion: this.migrationVersion,
          migrationDate: new Date().toISOString(),
          legacyEnergyScore: entry.energyScore,
          migrationMethod: 'fallback'
        };
      }

      // Convert energy score to power consumption using PowerCalculator
      const estimatedWatts = this.powerCalculator.migrateEnergyScoreToWatts(entry.energyScore, {
        url: entry.url,
        title: entry.title
      });
      
      // Calculate energy consumption in kWh based on duration
      const durationHours = (entry.duration || 0) / (1000 * 60 * 60);
      const energyKWh = (estimatedWatts * durationHours) / 1000;

      // Create migrated entry with both legacy and new data
      const migratedEntry = {
        ...entry,
        // New power-based fields
        powerWatts: estimatedWatts,
        energyKWh: energyKWh,
        // Migration metadata
        migrated: true,
        migrationVersion: this.migrationVersion,
        migrationDate: new Date().toISOString(),
        // Keep original energy score for backward compatibility
        legacyEnergyScore: entry.energyScore,
        migrationMethod: 'powerCalculator'
      };

      return migratedEntry;
      
    } catch (error) {
      console.error('[DataMigration] Failed to migrate entry:', entry, error);
      throw error;
    }
  }

  /**
   * Migrate settings to power-based format
   */
  async migrateSettings(settings) {
    const migratedSettings = { ...settings };

    // Convert energyThreshold to powerThreshold
    if (settings.energyThreshold !== undefined && settings.powerThreshold === undefined) {
      // Convert energy threshold (0-100 scale) to power threshold (watts)
      // Assuming energyThreshold of 75 corresponds to about 40W
      migratedSettings.powerThreshold = Math.round((settings.energyThreshold / 100) * 50 + 15);
      migratedSettings.legacyEnergyThreshold = settings.energyThreshold;
    }

    // Mark settings as migrated
    migratedSettings.migrated = true;
    migratedSettings.migrationVersion = this.migrationVersion;
    migratedSettings.migrationDate = new Date().toISOString();

    return migratedSettings;
  }

  /**
   * Create backup of original data
   */
  async createBackup(backupKey, originalData) {
    try {
      const backupData = {
        ...originalData,
        backupDate: new Date().toISOString(),
        backupVersion: this.migrationVersion
      };
      
      await chrome.storage.local.set({ [backupKey]: backupData });
      console.log('[DataMigration] Backup created with key:', backupKey);
      
    } catch (error) {
      console.error('[DataMigration] Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * Store migrated data back to chrome.storage
   */
  async storeMigratedData(migratedHistory, migratedSettings) {
    try {
      // Store migrated settings
      await chrome.storage.local.set({ settings: migratedSettings });

      // Store migrated history - organize by date for efficient retrieval
      const historyByDate = this.organizeHistoryByDate(migratedHistory);
      
      for (const [dateKey, entries] of Object.entries(historyByDate)) {
        await chrome.storage.local.set({ [`energy_${dateKey}`]: entries });
      }

      console.log('[DataMigration] Migrated data stored successfully');
      
    } catch (error) {
      console.error('[DataMigration] Failed to store migrated data:', error);
      throw error;
    }
  }

  /**
   * Organize history entries by date for efficient storage
   */
  organizeHistoryByDate(historyEntries) {
    const historyByDate = {};

    historyEntries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toISOString().split('T')[0].replace(/-/g, '');
      
      if (!historyByDate[dateKey]) {
        historyByDate[dateKey] = [];
      }
      
      historyByDate[dateKey].push(entry);
    });

    return historyByDate;
  }

  /**
   * Mark migration as complete
   */
  async markMigrationComplete(migrationStats) {
    try {
      const migrationStatus = {
        completed: true,
        version: this.migrationVersion,
        completedDate: new Date().toISOString(),
        stats: migrationStats
      };
      
      await chrome.storage.local.set({ migration_status: migrationStatus });
      console.log('[DataMigration] Migration marked as complete');
      
    } catch (error) {
      console.error('[DataMigration] Failed to mark migration complete:', error);
      throw error;
    }
  }

  /**
   * Utility method to restore from backup (in case migration needs to be reverted)
   */
  async restoreFromBackup(backupKey) {
    try {
      const result = await chrome.storage.local.get([backupKey]);
      const backupData = result[backupKey];
      
      if (!backupData) {
        throw new Error(`Backup not found: ${backupKey}`);
      }

      // Restore original data
      await chrome.storage.local.set({ settings: backupData.settings });
      
      // Restore history data
      const historyByDate = this.organizeHistoryByDate(backupData.history);
      for (const [dateKey, entries] of Object.entries(historyByDate)) {
        await chrome.storage.local.set({ [`energy_${dateKey}`]: entries });
      }

      // Reset migration status
      await chrome.storage.local.remove(['migration_status']);
      
      console.log('[DataMigration] Successfully restored from backup:', backupKey);
      return { success: true, message: 'Backup restored successfully' };
      
    } catch (error) {
      console.error('[DataMigration] Failed to restore from backup:', error);
      return { success: false, message: 'Backup restore failed: ' + error.message };
    }
  }

  /**
   * Get migration statistics
   */
  async getMigrationStats() {
    try {
      const migrationStatus = await this.checkMigrationStatus();
      return {
        completed: migrationStatus.completed,
        stats: migrationStatus.stats || {},
        version: migrationStatus.version
      };
    } catch (error) {
      console.error('[DataMigration] Failed to get migration stats:', error);
      return { completed: false, stats: {}, error: error.message };
    }
  }
  
  /**
   * Fallback conversion from energy score to watts when PowerCalculator is not available
   */
  fallbackEnergyScoreToWatts(energyScore) {
    // Simple fallback conversion based on research
    if (energyScore < 20) {
      return 8 + (energyScore / 20) * 4; // 8-12W
    } else if (energyScore < 40) {
      return 12 + ((energyScore - 20) / 20) * 6; // 12-18W
    } else if (energyScore < 70) {
      return 18 + ((energyScore - 40) / 30) * 12; // 18-30W
    } else {
      return 30 + ((energyScore - 70) / 30) * 25; // 30-55W
    }
  }

  /**
   * Clean up old backup data (call this after migration is verified successful)
   */
  async cleanupOldBackups(keepRecentCount = 3) {
    try {
      const allData = await chrome.storage.local.get(null);
      const backupKeys = Object.keys(allData).filter(key => key.startsWith('backup_pre_migration_'));
      
      // Sort by timestamp (newest first)
      backupKeys.sort().reverse();
      
      // Remove old backups beyond keepRecentCount
      const keysToRemove = backupKeys.slice(keepRecentCount);
      
      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
        console.log('[DataMigration] Cleaned up', keysToRemove.length, 'old backups');
      }
      
      return { success: true, removedBackups: keysToRemove.length };
      
    } catch (error) {
      console.error('[DataMigration] Failed to cleanup old backups:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataMigrationUtility;
}

// Make available globally for chrome extension context
if (typeof window !== 'undefined') {
  window.DataMigrationUtility = DataMigrationUtility;
}