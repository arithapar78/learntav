// Power Tracker Extension - Popup JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializePopup();
    loadPowerData();
    setInterval(updatePowerData, 5000); // Update every 5 seconds
});

let isProEnabled = false;
let powerHistory = [];

function initializePopup() {
    // Check if Pro is enabled
    chrome.storage.local.get(['proEnabled'], function(result) {
        isProEnabled = result.proEnabled || false;
        updateProUI();
    });
    
    // Load saved settings
    loadSettings();
}

function loadPowerData() {
    // Get current tab info
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            calculatePowerUsage(tabs[0]);
        }
    });
    
    // Get total tabs count
    chrome.tabs.query({}, function(tabs) {
        document.getElementById('tabsCount').textContent = tabs.length;
    });
}

function calculatePowerUsage(tab) {
    // Simulate power calculation based on tab activity
    // In a real extension, this would use actual system APIs
    const basePower = 1.5; // Base browser power
    const tabPower = Math.random() * 2 + 0.5; // Random tab power 0.5-2.5W
    const totalPower = basePower + tabPower;
    
    // Update display
    document.getElementById('powerValue').textContent = totalPower.toFixed(1) + 'W';
    
    // Calculate efficiency (higher is better)
    const efficiency = Math.max(50, Math.min(100, 100 - (totalPower * 10)));
    document.getElementById('efficiency').textContent = Math.round(efficiency);
    document.getElementById('efficiencyBar').style.width = efficiency + '%';
    
    // Update efficiency label
    const efficiencyLabel = document.querySelector('.efficiency-label');
    if (efficiency >= 90) {
        efficiencyLabel.textContent = 'Excellent - Keep it up!';
    } else if (efficiency >= 70) {
        efficiencyLabel.textContent = 'Good - Room for improvement';
    } else if (efficiency >= 50) {
        efficiencyLabel.textContent = 'Fair - Consider optimization';
    } else {
        efficiencyLabel.textContent = 'Poor - Needs attention';
    }
    
    // Store power data
    storePowerData(totalPower);
}

function storePowerData(power) {
    const now = Date.now();
    powerHistory.push({timestamp: now, power: power});
    
    // Keep only last 24 hours of data
    const dayAgo = now - 24 * 60 * 60 * 1000;
    powerHistory = powerHistory.filter(entry => entry.timestamp > dayAgo);
    
    // Calculate today's usage
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayData = powerHistory.filter(entry => entry.timestamp > todayStart);
    const todayUsage = todayData.reduce((sum, entry) => sum + entry.power, 0) / 720; // Wh
    document.getElementById('todayUsage').textContent = todayUsage.toFixed(1);
    
    // Calculate average power
    if (powerHistory.length > 0) {
        const avgPower = powerHistory.reduce((sum, entry) => sum + entry.power, 0) / powerHistory.length;
        document.getElementById('avgPower').textContent = avgPower.toFixed(1);
    }
    
    // Save to storage
    chrome.storage.local.set({powerHistory: powerHistory});
}

function updatePowerData() {
    loadPowerData();
}

function loadSettings() {
    chrome.storage.local.get(['powerSettings'], function(result) {
        const settings = result.powerSettings || {
            notifications: true,
            threshold: 5.0,
            updateInterval: 5
        };
        // Apply settings to UI if needed
    });
}

function showProModal() {
    document.getElementById('proModal').classList.remove('hidden');
    document.getElementById('codeInput').focus();
}

function hideProModal() {
    document.getElementById('proModal').classList.add('hidden');
    document.getElementById('codeInput').value = '';
}

function verifyProCode() {
    const code = document.getElementById('codeInput').value.trim();
    const validCodes = ['0410', '7215', 'PRO1', 'BETA'];
    
    if (validCodes.includes(code.toUpperCase())) {
        // Enable Pro features
        isProEnabled = true;
        chrome.storage.local.set({proEnabled: true});
        
        // Show success message
        showNotification('🎉 Pro features unlocked!', 'success');
        hideProModal();
        updateProUI();
        
        // Add Pro features to UI
        setTimeout(() => {
            showProFeatures();
        }, 500);
    } else {
        // Show error
        showNotification('❌ Invalid access code', 'error');
        document.getElementById('codeInput').value = '';
    }
}

function updateProUI() {
    const proSection = document.querySelector('.pro-section');
    if (isProEnabled) {
        proSection.innerHTML = `
            <p class="pro-title">⚡ Pro Features Active</p>
            <p class="pro-description">AI Optimization • Advanced Analytics • Carbon Tracking</p>
            <button class="pro-button" onclick="openProDashboard()" style="background: #22c55e;">Open Pro Dashboard</button>
        `;
    }
}

function showProFeatures() {
    if (!isProEnabled) return;
    
    // Add AI Prompt Optimizer button
    const actions = document.querySelector('.actions');
    const aiButton = document.createElement('button');
    aiButton.className = 'action-btn';
    aiButton.innerHTML = '🤖 AI Optimizer';
    aiButton.onclick = openAIOptimizer;
    actions.appendChild(aiButton);
    
    // Add carbon tracking
    const carbonCard = document.createElement('div');
    carbonCard.className = 'stat-card';
    carbonCard.innerHTML = `
        <div class="stat-value">0.12</div>
        <p class="stat-label">kg CO₂ Saved</p>
    `;
    document.querySelector('.stats-grid').appendChild(carbonCard);
}

function openProDashboard() {
    // In a real extension, this would open a new tab or expanded view
    showNotification('🚀 Pro Dashboard - Coming soon!', 'info');
}

function openAIOptimizer() {
    // Create AI Optimizer interface
    const modal = createModal('AI Prompt Optimizer', `
        <div style="padding: 20px;">
            <textarea placeholder="Enter your AI prompt here..." style="width: 100%; height: 120px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical;" id="promptInput"></textarea>
            <div style="margin: 16px 0;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Optimization Level:</label>
                <select id="optimizationLevel" style="width: 100%; padding: 8px; border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="conservative">Conservative (5-15% reduction)</option>
                    <option value="balanced" selected>Balanced (15-25% reduction)</option>
                    <option value="aggressive">Aggressive (25-45% reduction)</option>
                </select>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 16px;">
                <button onclick="optimizePrompt()" style="flex: 1; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Optimize Prompt</button>
                <button onclick="closeModal()" style="flex: 1; padding: 12px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
            </div>
            <div id="optimizationResult" style="margin-top: 16px; display: none;"></div>
        </div>
    `);
}

function optimizePrompt() {
    const input = document.getElementById('promptInput').value;
    const level = document.getElementById('optimizationLevel').value;
    
    if (!input.trim()) {
        showNotification('⚠️ Please enter a prompt to optimize', 'warning');
        return;
    }
    
    // Simulate AI optimization
    const originalTokens = Math.ceil(input.length / 4);
    let reduction = 0;
    
    switch(level) {
        case 'conservative':
            reduction = Math.random() * 0.1 + 0.05; // 5-15%
            break;
        case 'balanced':
            reduction = Math.random() * 0.1 + 0.15; // 15-25%
            break;
        case 'aggressive':
            reduction = Math.random() * 0.2 + 0.25; // 25-45%
            break;
    }
    
    const optimizedTokens = Math.ceil(originalTokens * (1 - reduction));
    const tokensSaved = originalTokens - optimizedTokens;
    const energySaved = tokensSaved * 0.0001; // Rough estimate
    
    // Show results
    const resultDiv = document.getElementById('optimizationResult');
    resultDiv.innerHTML = `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px;">
            <h4 style="margin: 0 0 12px 0; color: #065f46;">✅ Optimization Complete</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                <div><strong>Original Tokens:</strong> ${originalTokens}</div>
                <div><strong>Optimized Tokens:</strong> ${optimizedTokens}</div>
                <div><strong>Tokens Saved:</strong> ${tokensSaved}</div>
                <div><strong>Reduction:</strong> ${Math.round(reduction * 100)}%</div>
            </div>
            <div style="margin-top: 12px; font-size: 12px; color: #065f46;">
                <strong>Energy Saved:</strong> ~${energySaved.toFixed(4)} kWh
            </div>
            <button onclick="copyOptimizedPrompt()" style="width: 100%; margin-top: 12px; padding: 8px; background: #22c55e; color: white; border: none; border-radius: 6px; cursor: pointer;">Copy Optimized Prompt</button>
        </div>
    `;
    resultDiv.style.display = 'block';
}

function copyOptimizedPrompt() {
    // In a real implementation, this would copy the actual optimized prompt
    navigator.clipboard.writeText('Optimized prompt would be copied here');
    showNotification('📋 Optimized prompt copied to clipboard!', 'success');
}

function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'pro-modal';
    modal.innerHTML = `
        <div class="pro-modal-content" style="max-width: 500px; max-height: 600px; overflow-y: auto;">
            <h3>${title}</h3>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function closeModal() {
    const modals = document.querySelectorAll('.pro-modal:not(.hidden)');
    modals.forEach(modal => modal.remove());
}

function openSettings() {
    showNotification('⚙️ Settings panel - Coming soon!', 'info');
}

function viewHistory() {
    showNotification('📊 History view - Coming soon!', 'info');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideProModal();
        closeModal();
    }
});

// Initialize power monitoring
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updatePower') {
        updatePowerData();
    }
});