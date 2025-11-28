// CSS to hide videos and thumbnails (Visuals only, audio remains)
const styles = `
    /* Hide HTML5 Video Elements */
    video {
        opacity: 0 !important; 
        visibility: hidden !important;
    }
    
    /* Hide YouTube specific player visuals but keep controls */
    .html5-video-player .video-stream {
        opacity: 0 !important;
    }

    /* Thumbnails: Blur and Dim them heavily to reduce visual distraction */
    img, 
    .ytp-cued-thumbnail-overlay, 
    ytd-thumbnail, 
    .thumbnail {
        filter: brightness(0) !important;
        opacity: 0.1 !important;
    }

    /* Keep controls visible but ensure background is dark */
    .html5-video-player {
        background-color: #000 !important;
    }
`;

// Create style element
const styleSheet = document.createElement("style");
styleSheet.id = "audio-focus-styles";
styleSheet.innerText = styles;

function applySettings() {
    chrome.storage.local.get(['globalAudioMode', 'whitelistedUrls'], (result) => {
        const isGlobalOn = result.globalAudioMode !== false;
        const whitelist = result.whitelistedUrls || [];
        const currentUrl = window.location.href;
        
        // Check if current exact URL is in whitelist
        const isWhitelisted = whitelist.some(url => currentUrl === url);

        if (isGlobalOn && !isWhitelisted) {
            if (!document.getElementById("audio-focus-styles")) {
                document.head.appendChild(styleSheet);
            }
        } else {
            const existingStyle = document.getElementById("audio-focus-styles");
            if (existingStyle) {
                existingStyle.remove();
            }
        }
    });
}

// Initial run
applySettings();

// Listen for changes in settings (from popup)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        applySettings();
    }
});
