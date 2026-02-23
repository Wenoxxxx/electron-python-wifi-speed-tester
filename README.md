# electron-python-wifi-speed-tester

A WiFi speed tester desktop application built with Electron and Python.

## Tech Stack

- **Frontend**: Electron 29.0.0, HTML, CSS, JavaScript
- **Backend**: Python, FastAPI, Uvicorn
- **Speed Test**: speedtest-cli

## Prerequisites

- Node.js (for Electron)
- Python 3.8+
- pip (Python package manager)

## Installation

### 1. Install Python Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies

```bash
cd client
npm install
```

## Usage

### Step 1: Start the Python Backend Server

```bash
cd server
uvicorn server:app --host 127.0.0.1 --port 8000
```

The server will run at `http://127.0.0.1:8000`

### Step 2: Start the Electron App

Open a new terminal and run:

```bash
cd client
npm start
```

The desktop application will launch. Click the "Start Speed Test" button to test your WiFi speed.

## API Endpoint

The backend exposes a single endpoint:

- **GET** `/speedtest` - Returns download speed (Mbps), upload speed (Mbps), and ping (ms)

Example response:
```json
{
  "download": 85.5,
  "upload": 25.3,
  "ping": 15
}
```

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and commit them: `git commit -m 'Add some feature'`
4. **Push to the branch**: `git push origin feature/your-feature-name`
5. **Submit a Pull Request**

### Ideas for Contributions

- Add history/tracking of speed test results
- Implement data visualization (charts/graphs)
- Add support for selecting specific test servers
- Add multi-language support
- Improve the UI/UX design
- Add light theme support

## License

MIT License
