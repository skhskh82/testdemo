function createCircularPlayer(options) {
    const defaults = {
        containerId: '',
        audioSrc: '',
        fileName: 'audio.mp3',
        playerColor: '#4285F4',
        playerSize: 100,
        playerId: 'player-' + Math.random().toString(36).substr(2, 9),
        transcription: ''
    };
    const config = {...defaults, ...options};
    
    const radius = config.playerSize / 2 - 8;
    const circumference = 2 * Math.PI * radius;
    
    // Only include transcription elements for source players (blue)
    const isSourcePlayer = config.playerColor === '#4285F4';
    const transcriptionHTML = isSourcePlayer ? `
        <button class="transcription-toggle">
            <img src="images/trans_logo.png" alt="Transcript" class="transcript-icon">
        </button>
        <div class="transcription-popup">
            <div class="transcription-content">${config.transcription || 'No transcription available'}</div>
        </div>
    ` : '';
    
    const playerHTML = `
    <div class="player-wrapper" style="width: ${config.playerSize}px; height: ${config.playerSize}px;">
        <svg viewBox="0 0 ${config.playerSize} ${config.playerSize}">
            <circle cx="${config.playerSize/2}" cy="${config.playerSize/2}" r="${radius}" class="bg-circle"/>
            <circle id="progress-${config.playerId}" cx="${config.playerSize/2}" cy="${config.playerSize/2}" r="${radius}" 
                    class="progress-path" style="stroke: ${config.playerColor}"/>
        </svg>
        <div id="btn-${config.playerId}" class="play-btn" 
            style="top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 60px; height: 60px; background: ${config.playerColor}">
            <div id="icon-${config.playerId}" class="play-icon"></div>
        </div>
        ${transcriptionHTML}
    </div>
    <div class="file-name">${config.fileName}</div>
    <audio id="audio-${config.playerId}" preload="auto" data-player-type="${config.playerColor}">
        <source src="${config.audioSrc}" type="audio/${config.audioSrc.split('.').pop()}">
    </audio>`;
    
    document.getElementById(config.containerId).innerHTML = playerHTML;
    initPlayer(config.playerId, circumference, config.playerColor);
    
    if (isSourcePlayer) {
        initTranscription(config.containerId);
    }
}

function initPlayer(playerId, circumference, playerColor) {
    const audio = document.getElementById(`audio-${playerId}`);
    const progress = document.getElementById(`progress-${playerId}`);
    const icon = document.getElementById(`icon-${playerId}`);
    const btn = document.getElementById(`btn-${playerId}`);
    const tocLogo = document.querySelector('.toc-logo');

    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = circumference;

    let animationFrameId;

    function showPlayIcon() {
        icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/></svg>`;
    }

    function showPauseIcon() {
        icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    }

    function updateProgress() {
        if (audio.duration) {
            const percent = audio.currentTime / audio.duration;
            const offset = circumference - (percent * circumference);
            progress.style.strokeDashoffset = offset;
        }
        if (!audio.paused && !audio.ended) {
            animationFrameId = requestAnimationFrame(updateProgress);
        }
    }

    function updateLogo() {
        if (!tocLogo) return;
        // Map playerColor to logo image
        const logoMap = {
            '#4285F4': 'images/logo_blue.png', // Source
            '#EA4335': 'images/logo_red.png',  // Reference
            '#34A853': 'images/logo_green.png' // Generated
        };
        tocLogo.style.opacity = '0'; // Fade out
        setTimeout(() => {
            tocLogo.src = logoMap[playerColor] || 'images/logo_white.png';
            tocLogo.style.opacity = '1'; // Fade in
        }, 150); // Match CSS transition duration
    }

    function resetLogo() {
        if (!tocLogo) return;
        tocLogo.style.opacity = '0';
        setTimeout(() => {
            tocLogo.src = 'images/logo_white.png';
            tocLogo.style.opacity = '1';
        }, 150);
    }

    btn.addEventListener('click', () => {
        if (audio.paused) {
            // Pause all other players and reset their icons
            document.querySelectorAll('audio').forEach(a => {
                if (a !== audio && !a.paused) {
                    a.pause();
                    const otherPlayerId = a.id.replace('audio-', '');
                    const otherIcon = document.getElementById(`icon-${otherPlayerId}`);
                    if (otherIcon) {
                        otherIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/></svg>`;
                    }
                }
            });
            audio.play().then(() => {
                showPauseIcon();
                updateLogo(); // Update logo based on playerColor
                cancelAnimationFrame(animationFrameId);
                updateProgress();
            }).catch(console.error);
        } else {
            audio.pause();
            showPlayIcon();
            cancelAnimationFrame(animationFrameId);
            resetLogo(); // Reset to white when pausing
        }
    });

    audio.addEventListener('ended', () => {
        showPlayIcon();
        progress.style.strokeDashoffset = circumference;
        cancelAnimationFrame(animationFrameId);
        resetLogo(); // Reset to white when audio ends
    });

    showPlayIcon();
}

function initTranscription(containerId) {
    const container = document.getElementById(containerId);
    const toggle = container.querySelector('.transcription-toggle');
    const popup = container.querySelector('.transcription-popup');
    
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.toggle('active');
    });
}