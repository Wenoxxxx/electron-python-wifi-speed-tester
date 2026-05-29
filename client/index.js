// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  const runTestButton = document.getElementById('runTest');
  const downloadLabel = document.getElementById('download');
  const uploadLabel = document.getElementById('upload');
  const pingLabel = document.getElementById('ping');
  const statusText = document.querySelector('.status-text');
  const statusIndicator = document.querySelector('.status-indicator');

  async function runSpeedTest() {
    try {
      // Show loading state
      runTestButton.disabled = true;
      runTestButton.textContent = 'RUNNING_TEST...';
      downloadLabel.textContent = 'TESTING...';
      uploadLabel.textContent = 'TESTING...';
      pingLabel.textContent = 'TESTING...';

      if (statusText) statusText.textContent = 'TESTING_NETWORK';
      if (statusIndicator) {
        statusIndicator.className = 'status-indicator running';
      }

      const response = await fetch('http://localhost:8000/speedtest');
      const result = await response.json();

      // Check if there's an error in the response
      if (result.error) {
        downloadLabel.textContent = 'ERROR';
        uploadLabel.textContent = 'ERROR';
        pingLabel.textContent = 'ERROR';
        console.error('Speedtest error:', result.detail || result.error);
        
        if (statusText) statusText.textContent = 'SYS_ERROR';
        if (statusIndicator) {
          statusIndicator.className = 'status-indicator error';
        }
        
        runTestButton.textContent = 'RUN_TEST_SEQUENCE';
        runTestButton.disabled = false;
        return;
      }
      
      downloadLabel.textContent = `${result.download} Mbps`;
      uploadLabel.textContent = `${result.upload} Mbps`;
      pingLabel.textContent = `${result.ping} ms`;
      
      if (statusText) statusText.textContent = 'SYS_READY';
      if (statusIndicator) {
        statusIndicator.className = 'status-indicator success';
      }

      runTestButton.textContent = 'RUN_TEST_SEQUENCE';
      runTestButton.disabled = false;
    } catch (err) {
      console.error('Error fetching speed test:', err);
      downloadLabel.textContent = 'ERROR';
      uploadLabel.textContent = 'ERROR';
      pingLabel.textContent = 'ERROR';
      
      if (statusText) statusText.textContent = 'SYS_ERROR';
      if (statusIndicator) {
        statusIndicator.className = 'status-indicator error';
      }

      runTestButton.textContent = 'RUN_TEST_SEQUENCE';
      runTestButton.disabled = false;
    }
  }

  runTestButton.addEventListener('click', runSpeedTest);
});
