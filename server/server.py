from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import speedtest
import asyncio
import json
import threading
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def speedtest_stream():
    try:
        st = speedtest.Speedtest()
        st.get_best_server()

        # --- PING ---
        ping = st.results.ping
        yield f'data: {json.dumps({"phase": "ping", "ping": round(ping, 1)})}\n\n'
        await asyncio.sleep(0.05)

        # --- DOWNLOAD first (sequential like speedtest.net) ---
        yield f'data: {json.dumps({"phase": "download_start"})}\n\n'

        results = {
            "download_done": False, "download_final": 0.0,
            "upload_done":   False, "upload_final":   0.0,
        }

        def run_download():
            # threads=None lets speedtest-cli auto-pick (most accurate)
            r = st.download(threads=None)
            results["download_final"] = r / 1_000_000
            results["download_done"] = True

        dl_thread = threading.Thread(target=run_download, daemon=True)
        dl_thread.start()

        # Poll download live every 300ms
        prev_dl_bytes = 0
        prev_time = time.monotonic()

        while not results["download_done"]:
            await asyncio.sleep(0.3)
            now = time.monotonic()
            delta_time = now - prev_time
            try:
                curr = st._results.bytes_received
                delta = curr - prev_dl_bytes
                if delta_time > 0 and delta > 0:
                    mbps = (delta * 8) / (delta_time * 1_000_000)
                    yield f'data: {json.dumps({"phase": "download", "value": round(mbps, 1)})}\n\n'
                prev_dl_bytes = curr
            except Exception:
                pass
            prev_time = now

        dl_thread.join()
        yield f'data: {json.dumps({"phase": "download_done", "download": round(results["download_final"], 2)})}\n\n'
        await asyncio.sleep(0.1)

        # --- UPLOAD second (sequential, full bandwidth now available) ---
        yield f'data: {json.dumps({"phase": "upload_start"})}\n\n'

        def run_upload():
            # threads=None lets speedtest-cli auto-pick (most accurate)
            r = st.upload(threads=None)
            results["upload_final"] = r / 1_000_000
            results["upload_done"] = True

        ul_thread = threading.Thread(target=run_upload, daemon=True)
        ul_thread.start()

        # Poll upload live every 300ms
        prev_ul_bytes = 0
        prev_time = time.monotonic()

        while not results["upload_done"]:
            await asyncio.sleep(0.3)
            now = time.monotonic()
            delta_time = now - prev_time
            try:
                curr = st._results.bytes_sent
                delta = curr - prev_ul_bytes
                if delta_time > 0 and delta > 0:
                    mbps = (delta * 8) / (delta_time * 1_000_000)
                    yield f'data: {json.dumps({"phase": "upload", "value": round(mbps, 1)})}\n\n'
                prev_ul_bytes = curr
            except Exception:
                pass
            prev_time = now

        ul_thread.join()
        yield f'data: {json.dumps({"phase": "upload_done", "upload": round(results["upload_final"], 2)})}\n\n'

        # --- DONE ---
        yield f'data: {json.dumps({"phase": "done", "ping": round(ping, 1), "download": round(results["download_final"], 2), "upload": round(results["upload_final"], 2)})}\n\n'

    except Exception as e:
        yield f'data: {json.dumps({"error": True, "detail": str(e)})}\n\n'


@app.get("/speedtest")
async def run_speedtest():
    return StreamingResponse(
        speedtest_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )