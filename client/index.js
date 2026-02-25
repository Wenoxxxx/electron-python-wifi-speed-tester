// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  const runTestButton = document.getElementById('runTest');
  const downloadLabel = document.getElementById('download');
  const uploadLabel = document.getElementById('upload');
  const pingLabel = document.getElementById('ping');

  async function runSpeedTest() {
    try {
      // Show loading state
      runTestButton.disabled = true;
      runTestButton.textContent = 'Testing...';
      downloadLabel.textContent = 'Testing...';
      uploadLabel.textContent = 'Testing...';
      pingLabel.textContent = 'Testing...';

      const response = await fetch('http://localhost:8000/speedtest');
      
      const result = await response.json();

      // Check if there's an error in the response
      if (result.error) {
        downloadLabel.textContent = 'Error';
        uploadLabel.textContent = 'Error';
        pingLabel.textContent = 'Error';
        console.error('Speedtest error:', result.detail || result.error);
        runTestButton.textContent = '▶ Run Speed Test';
        runTestButton.disabled = false;
        return;
      }
      
      downloadLabel.textContent = `${result.download} Mbps`;
      uploadLabel.textContent = `${result.upload} Mbps`;
      pingLabel.textContent = `${result.ping} ms`;
      
      runTestButton.textContent = '▶ Run Speed Test';
      runTestButton.disabled = false;
    } catch (err) {
      console.error('Error fetching speed test:', err);
      downloadLabel.textContent = 'Error';
      uploadLabel.textContent = 'Error';
      pingLabel.textContent = 'Error';
      runTestButton.textContent = '▶ Run Speed Test';
      runTestButton.disabled = false;
    }
  }

  runTestButton.addEventListener('click', runSpeedTest);
});
