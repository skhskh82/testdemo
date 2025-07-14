// Reusable player creation function
function createCircularPlayer(options) {
    const defaults = {
        containerId: '',
        audioSrc: '',
        fileName: 'audio.mp3',
        playerColor: '#4285F4',
        playerSize: 200,
        playerId: 'player-' + Math.random().toString(36).substr(2, 9)
    };
    const config = {...defaults, ...options};
    
    const radius = config.playerSize / 2 - 8;
    const circumference = 2 * Math.PI * radius;
    
    const playerHTML = `
    <div class="player-wrapper" style="width: ${config.playerSize}px; height: ${config.playerSize}px;">
        <svg viewBox="0 0 ${config.playerSize} ${config.playerSize}">
            <circle cx="${config.playerSize/2}" cy="${config.playerSize/2}" r="${radius}" class="bg-circle"/>
            <circle id="progress-${config.playerId}" cx="${config.playerSize/2}" cy="${config.playerSize/2}" r="${radius}" 
                    class="progress-path" style="stroke: ${config.playerColor}"/>
        </svg>
        <div id="btn-${config.playerId}" class="play-btn" style="top: ${radius-30}px; left: ${radius-30}px; 
             width: 60px; height: 60px; background: ${config.playerColor}">
            <div id="icon-${config.playerId}" class="play-icon"></div>
        </div>
    </div>
    <div class="file-name">${config.fileName}</div>
    <audio id="audio-${config.playerId}" preload="auto">
        <source src="${config.audioSrc}" type="audio/${config.audioSrc.split('.').pop()}">
    </audio>`;
    
    document.getElementById(config.containerId).innerHTML = playerHTML;
    initPlayer(config.playerId, circumference);
}

// Player initialization
function initPlayer(playerId, circumference) {
    const audio = document.getElementById(`audio-${playerId}`);
    const progress = document.getElementById(`progress-${playerId}`);
    const icon = document.getElementById(`icon-${playerId}`);
    const btn = document.getElementById(`btn-${playerId}`);
    
    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = circumference;
    
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
            const offset = circumference - (audio.currentTime / audio.duration * circumference);
            progress.style.strokeDashoffset = offset;
        }
    }
    
    btn.addEventListener('click', () => {
        if (audio.paused) {
            document.querySelectorAll('audio').forEach(a => {
                if (a !== audio && !a.paused) a.pause();
            });
            audio.play().then(showPauseIcon).catch(console.error);
        } else {
            audio.pause();
            showPlayIcon();
        }
    });
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
        showPlayIcon();
        progress.style.strokeDashoffset = circumference;
    });
    
    showPlayIcon();
}
