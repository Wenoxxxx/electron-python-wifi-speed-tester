# electron-python-wifi-speed-tester

A desktop internet connection speed tester built with Electron and Python — featuring real-time SSE streaming, live animated speed readings, and per-card phase badges.

---

## Tech Stack

- **Frontend**: [Electron 29.0.0](https://www.electronjs.org/), HTML, CSS, JavaScript
- **Backend**: [Python](https://www.python.org/), [FastAPI 0.129.2](https://fastapi.tiangolo.com/), [Uvicorn 0.41.0](https://www.uvicorn.org/)
- **Speed Test**: [speedtest-cli 2.1.3](https://github.com/sivel/speedtest-cli)

---

## Features

- Live download and upload speed readings updated every 300ms via Server-Sent Events
- Animated speed values with ease-out transitions on final results
- Per-card status badges — `[TESTING]`, `[DONE]`, `[FAILED]`
- Blinking indicators and phase label highlights during active measurement
- Searching animation on all cards the moment the test is triggered
- Sequential download → upload testing for accurate, non-competing results
- Error handling with visual feedback on connection failure

---

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Python 3.8+](https://www.python.org/downloads/)
- pip

---

## Installation

### 1. Install Python dependencies

```bash
cd server
pip install -r requirements.txt
```

### 2. Install Node.js dependencies

```bash
cd client
npm install
```

---

## Usage

### Step 1 — Start the Python backend

```bash
cd server
uvicorn server:app --host 127.0.0.1 --port 8000
```

The server runs at `http://127.0.0.1:8000`

### Step 2 — Start the Electron app

Open a new terminal and run:

```bash
cd client
npm start
```

The desktop app will launch. Click `RUN_TEST_SEQUENCE` to start the speed test.

---

## How it works

```
Click button
├── All three cards immediately blink + show searching animation
├── EventSource connects to /speedtest SSE endpoint
│
├── server: resolves ping → emits ping event
│   └── UI: ping animates in, [DONE] badge appears
│
├── server: starts download, emits live ticks every 300ms
│   └── UI: download card updates live, [TESTING] badge blinking
├── server: download complete → emits download_done
│   └── UI: value eases to final, [DONE] badge appears
│
├── server: starts upload, emits live ticks every 300ms
│   └── UI: upload card updates live, [TESTING] badge blinking
├── server: upload complete → emits upload_done
│   └── UI: value eases to final, [DONE] badge appears
│
└── server: emits done → UI resets, summary shown in progress bar
```

---

## API

Single streaming endpoint:

**GET** `/speedtest`
Returns a `text/event-stream` of JSON phase events:

```
data: {"phase": "ping", "ping": 14.1}
data: {"phase": "download_start"}
data: {"phase": "download", "value": 43.2}
data: {"phase": "download_done", "download": 91.4}
data: {"phase": "upload_start"}
data: {"phase": "upload", "value": 11.5}
data: {"phase": "upload_done", "upload": 24.1}
data: {"phase": "done", "ping": 14.1, "download": 91.4, "upload": 24.1}
```

---

## Acknowledgements

**Frontend**
| Package | Version | Link |
|---|---|---|
| Electron | 29.0.0 | [electronjs.org](https://www.electronjs.org/) |
| electron-reload | 2.0.0-alpha.1 | [github.com/yan-foto/electron-reload](https://github.com/yan-foto/electron-reload) |
| JetBrains Mono | — | [jetbrains.com/lp/mono](https://www.jetbrains.com/lp/mono/) |
| Space Grotesk | — | [fonts.google.com/specimen/Space+Grotesk](https://fonts.google.com/specimen/Space+Grotesk) |

**Backend**
| Package | Version | Link |
|---|---|---|
| FastAPI | 0.129.2 | [fastapi.tiangolo.com](https://fastapi.tiangolo.com/) |
| Uvicorn | 0.41.0 | [uvicorn.org](https://www.uvicorn.org/) |
| speedtest-cli | 2.1.3 | [github.com/sivel/speedtest-cli](https://github.com/sivel/speedtest-cli) |
| Pydantic | 2.12.5 | [docs.pydantic.dev](https://docs.pydantic.dev/) |
| Starlette | 0.52.1 | [starlette.io](https://www.starlette.io/) |
| AnyIO | 4.12.1 | [anyio.readthedocs.io](https://anyio.readthedocs.io/) |
| click | 8.3.1 | [click.palletsprojects.com](https://click.palletsprojects.com/) |

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Ideas for contributions

- Result history and tracking across sessions
- Speed graph over time using canvas or a chart library
- Server selection — let the user pick a specific speedtest.net server
- Light theme support
- Multi-language support
- Export results to CSV or JSON

---

## License

MIT License