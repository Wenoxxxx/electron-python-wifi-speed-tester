async function runSpeedTest() {
  try {
    const response = await fetch("http://localhost:8000/speedtest");
    const result = await response.json();

    document.getElementById("download").innerText = `Download: ${result.download} Mbps`;
    document.getElementById("upload").innerText = `Upload: ${result.upload} Mbps`;
    document.getElementById("ping").innerText = `Ping: ${result.ping} ms`;
  } catch (err) {
    console.error("Error fetching speed test:", err);
  }
}

document.getElementById("runTest").addEventListener("click", runSpeedTest);