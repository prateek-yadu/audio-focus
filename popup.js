document.addEventListener('DOMContentLoaded', async () => {
    const globalToggle = document.getElementById('global-toggle');
    const siteOverride = document.getElementById('site-override');
    const statusBadge = document.getElementById('status-indicator');
    
    // Get current tab URL to handle per-site overrides
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = tab ? tab.url : '';

    // Load saved settings
    chrome.storage.local.get(['globalAudioMode', 'whitelistedUrls'], (result) => {
        const isGlobalOn = result.globalAudioMode !== false; // Default to true if undefined
        const whitelist = result.whitelistedUrls || [];
        const isWhitelisted = whitelist.includes(currentUrl);

        // Set UI State
        globalToggle.checked = isGlobalOn;
        siteOverride.checked = isWhitelisted; // If whitelisted, toggle is ON
        
        updateStatusUI(isGlobalOn, isWhitelisted);
    });

    // Handle Global Toggle
    globalToggle.addEventListener('change', () => {
        const newState = globalToggle.checked;
        chrome.storage.local.set({ globalAudioMode: newState });
        updateStatusUI(newState, siteOverride.checked);
    });

    // Handle Site Override Toggle
    siteOverride.addEventListener('change', () => {
        const shouldWhitelist = siteOverride.checked;
        
        chrome.storage.local.get(['whitelistedUrls'], (result) => {
            let whitelist = result.whitelistedUrls || [];
            
            if (shouldWhitelist) {
                if (!whitelist.includes(currentUrl)) whitelist.push(currentUrl);
            } else {
                whitelist = whitelist.filter(url => url !== currentUrl);
            }

            chrome.storage.local.set({ whitelistedUrls: whitelist });
            updateStatusUI(globalToggle.checked, shouldWhitelist);
        });
    });

    function updateStatusUI(globalOn, pageWhitelisted) {
        if (globalOn && !pageWhitelisted) {
            statusBadge.textContent = "ACTIVE";
            statusBadge.className = "status-badge active";
        } else {
            statusBadge.textContent = "PAUSED";
            statusBadge.className = "status-badge inactive";
        }
    }
});
