document.addEventListener('DOMContentLoaded', () => {
  const runTestButton = document.getElementById('runTest');
  const downloadLabel = document.getElementById('download');
  const uploadLabel = document.getElementById('upload');
  const pingLabel = document.getElementById('ping');
  const statusText = document.querySelector('.status-text');
  const statusIndicator = document.querySelector('.status-indicator');

  const speedLabels = [downloadLabel, uploadLabel, pingLabel];

  // Progress label injected below the button
  const progressIndicator = document.createElement('div');
  progressIndicator.id = 'progress-indicator';
  progressIndicator.style.cssText = `
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--color-blue);
    text-align: center;
    margin-top: 8px;
    min-height: 14px;
    letter-spacing: 0.05em;
  `;
  runTestButton.insertAdjacentElement('afterend', progressIndicator);

  // --- Inject a badge element into each card ---
  function createBadge(card) {
    const badge = document.createElement('span');
    badge.className = 'card-badge';
    card.appendChild(badge);
    return badge;
  }

  const downloadBadge = createBadge(document.querySelector('.download-card'));
  const uploadBadge   = createBadge(document.querySelector('.upload-card'));
  const pingBadge     = createBadge(document.querySelector('.ping-card'));

  // --- Badge state helpers ---
  function setBadge(badge, state) {
    // state: 'idle' | 'testing' | 'done' | 'failed'
    badge.classList.remove('visible', 'badge-testing', 'badge-done', 'badge-failed');
    if (state === 'idle') return;
    badge.classList.add('visible');
    if (state === 'testing') {
      badge.textContent = '[TESTING]';
      badge.classList.add('badge-testing');
    } else if (state === 'done') {
      badge.textContent = '[DONE]';
      badge.classList.add('badge-done');
    } else if (state === 'failed') {
      badge.textContent = '[FAILED]';
      badge.classList.add('badge-failed');
    }
  }

  function resetAllBadges() {
    [downloadBadge, uploadBadge, pingBadge].forEach(b => setBadge(b, 'idle'));
  }

  // --- Blink helpers ---
  function startBlink(element) { element.classList.add('measuring'); }
  function stopBlink(element)  { element.classList.remove('measuring'); }

  // --- Phase label highlight ---
  function setPhaseLabel(cardLabelSelector, active) {
    const el = document.querySelector(cardLabelSelector);
    if (!el) return;
    active ? el.classList.add('phase-active') : el.classList.remove('phase-active');
  }

  // --- Searching animation (cycles while waiting for real data) ---
  function startSearchingAnimation(element, suffix) {
    const frames = ['0.0', '- -', '···', '- -'];
    let i = 0;
    let stopped = false;
    const tick = () => {
      if (stopped) return;
      element.textContent = frames[i % frames.length] + suffix;
      i++;
      setTimeout(tick, 400);
    };
    tick();
    return () => { stopped = true; };
  }

  let stopFakeDownload = null;
  let stopFakeUpload   = null;
  let stopFakePing     = null;

  // --- Eased number counter for final confirmed values ---
  function animateValue(element, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = (eased * (end - start) + start).toFixed(1) + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  // --- Live partial update ---
  function setLive(element, value, suffix) {
    element.textContent = value.toFixed(1) + suffix;
  }

  function setStatus(text, cls) {
    if (statusText) statusText.textContent = text;
    if (statusIndicator) statusIndicator.className = `status-indicator ${cls}`;
  }

  function resetUI() {
    runTestButton.textContent = 'RUN_TEST_SEQUENCE';
    runTestButton.disabled = false;
    progressIndicator.textContent = '';
  }

  function clearAllFakeCounters() {
    if (stopFakeDownload) { stopFakeDownload(); stopFakeDownload = null; }
    if (stopFakeUpload)   { stopFakeUpload();   stopFakeUpload   = null; }
    if (stopFakePing)     { stopFakePing();     stopFakePing     = null; }
  }

  function runSpeedTest() {
    runTestButton.disabled = true;
    runTestButton.textContent = 'RUNNING_TEST...';

    // Reset everything
    downloadLabel.textContent = '-- Mbps';
    uploadLabel.textContent   = '-- Mbps';
    pingLabel.textContent     = '-- ms';
    speedLabels.forEach(stopBlink);
    document.querySelectorAll('.speed-label').forEach(el => el.classList.remove('phase-active'));
    clearAllFakeCounters();
    resetAllBadges();

    setStatus('TESTING_NETWORK', 'running');
    progressIndicator.textContent = 'Connecting to server...';

    // Instant feedback on click — all three cards go live immediately
    startBlink(downloadLabel);
    startBlink(uploadLabel);
    startBlink(pingLabel);
    setPhaseLabel('.download-card .speed-label', true);
    setPhaseLabel('.upload-card .speed-label', true);
    setPhaseLabel('.ping-card .speed-label', true);
    setBadge(downloadBadge, 'testing');
    setBadge(uploadBadge,   'testing');
    setBadge(pingBadge,     'testing');

    // Searching animation while waiting for real SSE data
    stopFakePing     = startSearchingAnimation(pingLabel,     ' ms');
    stopFakeDownload = startSearchingAnimation(downloadLabel, ' Mbps');
    stopFakeUpload   = startSearchingAnimation(uploadLabel,   ' Mbps');

    const source = new EventSource('http://localhost:8000/speedtest');

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Hard error
      if (data.error) {
        clearAllFakeCounters();
        downloadLabel.textContent = 'ERR';
        uploadLabel.textContent   = 'ERR';
        pingLabel.textContent     = 'ERR';
        speedLabels.forEach(stopBlink);
        document.querySelectorAll('.speed-label').forEach(el => el.classList.remove('phase-active'));
        setBadge(downloadBadge, 'failed');
        setBadge(uploadBadge,   'failed');
        setBadge(pingBadge,     'failed');
        setStatus('SYS_ERROR', 'error');
        progressIndicator.textContent = data.detail || 'Unknown error';
        resetUI();
        source.close();
        return;
      }

      switch (data.phase) {

        case 'ping':
          if (stopFakePing) { stopFakePing(); stopFakePing = null; }
          animateValue(pingLabel, 0, data.ping, 800, ' ms');
          progressIndicator.textContent = `PING: ${data.ping} ms — starting download...`;
          setTimeout(() => {
            stopBlink(pingLabel);
            setPhaseLabel('.ping-card .speed-label', false);
            setBadge(pingBadge, 'done');      // ping locked in
          }, 900);
          break;

        case 'download_start':
          if (stopFakeDownload) { stopFakeDownload(); stopFakeDownload = null; }
          progressIndicator.textContent = 'Measuring download speed...';
          downloadLabel.textContent = '0.0 Mbps';
          break;

        case 'download':
          setLive(downloadLabel, data.value, ' Mbps');
          break;

        case 'download_done':
          stopBlink(downloadLabel);
          setPhaseLabel('.download-card .speed-label', false);
          setBadge(downloadBadge, 'done');    // download locked in
          animateValue(downloadLabel, parseFloat(downloadLabel.textContent) || 0, data.download, 600, ' Mbps');
          progressIndicator.textContent = `↓ ${data.download} Mbps — starting upload...`;
          break;

        case 'upload_start':
          if (stopFakeUpload) { stopFakeUpload(); stopFakeUpload = null; }
          progressIndicator.textContent = 'Measuring upload speed...';
          uploadLabel.textContent = '0.0 Mbps';
          break;

        case 'upload':
          setLive(uploadLabel, data.value, ' Mbps');
          break;

        case 'upload_done':
          stopBlink(uploadLabel);
          setPhaseLabel('.upload-card .speed-label', false);
          setBadge(uploadBadge, 'done');      // upload locked in
          animateValue(uploadLabel, parseFloat(uploadLabel.textContent) || 0, data.upload, 600, ' Mbps');
          progressIndicator.textContent = `↑ ${data.upload} Mbps — finalizing...`;
          break;

        case 'done':
          clearAllFakeCounters();
          speedLabels.forEach(stopBlink);
          document.querySelectorAll('.speed-label').forEach(el => el.classList.remove('phase-active'));
          // Safety net — make sure all badges show done
          setBadge(downloadBadge, 'done');
          setBadge(uploadBadge,   'done');
          setBadge(pingBadge,     'done');
          setStatus('SYS_READY', 'success');
          progressIndicator.textContent =
            `✓ ${data.ping}ms  ↓${data.download}  ↑${data.upload} Mbps`;
          resetUI();
          source.close();
          break;
      }
    };

    source.onerror = () => {
      console.error('SSE stream error');
      clearAllFakeCounters();
      speedLabels.forEach(stopBlink);
      document.querySelectorAll('.speed-label').forEach(el => el.classList.remove('phase-active'));
      setBadge(downloadBadge, 'failed');
      setBadge(uploadBadge,   'failed');
      setBadge(pingBadge,     'failed');
      setStatus('SYS_ERROR', 'error');
      progressIndicator.textContent = 'Connection to test server lost.';
      resetUI();
      source.close();
    };
  }

  runTestButton.addEventListener('click', runSpeedTest);
});
