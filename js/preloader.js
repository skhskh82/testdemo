/* ===========================================================================
   PRELOAD ALL <audio> FILES, SHOW PROGRESS BAR, THEN BUILD PLAYERS
   ========================================================================== */

   document.addEventListener('DOMContentLoaded', () => {

    const bar   = document.getElementById('preload-bar');
    const text  = document.getElementById('preload-text');
    const cover = document.getElementById('preload');
  
    /* ---------- 1. Build manifest from the HTML ---------------------------- */
    const manifest = Array.from(document.querySelectorAll('.player-container[data-audio]'))
      .map(el => ({
        id           : el.id,
        src          : el.dataset.audio,
        color        : el.dataset.color || '#4285F4',
        file         : el.dataset.file  || (el.dataset.audio || '').split('/').pop(),
        transcription: el.dataset.transcription || '',
        el           : el                       /* keep ref for later */
      }))
      .filter(m => m.src);                      /* ignore if data‑audio missing */
  
    /* ---------- 2. Fetch with streaming progress --------------------------- */
    let totalBytes   = 0;   // sum of Content‑Length
    let loadedBytes  = 0;
    const startTime  = performance.now();
  
    async function fetchWithProgress(item) {
      const res = await fetch(item.src);
      const len = parseInt(res.headers.get('Content-Length') || 0, 10);
      totalBytes += len;
  
      const reader = res.body.getReader();
      const chunks = [];
      while (true) {
        const {done,value} = await reader.read();
        if (done) break;
        chunks.push(value);
        loadedBytes += value.byteLength;
        updateUI();
      }
      const blob = new Blob(chunks);
      item.blobUrl = URL.createObjectURL(blob);
    }
  
    function updateUI() {
      if (!totalBytes) return;                 // skip if headers missing
      const pct = (loadedBytes / totalBytes) * 100;
      bar.style.width = pct.toFixed(1) + '%';
  
      const secs  = (performance.now() - startTime) / 1000;
      const speed = (loadedBytes / 1024 / secs).toFixed(1);   // KB/s
      const mb    = n => (n / 1024 / 1024).toFixed(2);
  
      text.textContent = `Downloading ${mb(loadedBytes)} / ${mb(totalBytes)} MB • ${speed} KB/s`;
    }
  
    /* ---------- 3. After all downloads, build the players ------------------ */
    function initPlayers() {
      manifest.forEach(item => {
        createCircularPlayer({
          containerId : item.id,
          audioSrc    : item.blobUrl,
          fileName    : item.file,
          playerColor : item.color,
          transcription: item.transcription
        });
      });
    }
  
    /* ---------- 4. Run ------------------------------------------------------ */
    (async () => {
      try {
        await Promise.all(manifest.map(fetchWithProgress));
        /* small fade‑out */
        cover.style.opacity = 0;
        setTimeout(() => cover.remove(), 400);
        initPlayers();
      } catch (err) {
        console.error(err);
        text.textContent = 'Error loading audio.';
      }
    })();
  });
  