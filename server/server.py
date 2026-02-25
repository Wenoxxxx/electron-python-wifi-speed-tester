from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import speedtest
from speedtest import ConfigRetrievalError

app = FastAPI()

# Add CORS middleware to allow Electron app to communicate with server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/speedtest")
def run_speedtest():
  try:
    st = speedtest.Speedtest()
    st.get_best_server()
    download = st.download() / 1_000_000 #MBPS

    upload = st.upload() / 1_000_000

    ping = st.results.ping

    return {
      "download": round(download, 2),
      "upload": round(upload, 2),
      "ping": ping
    }
  except ConfigRetrievalError as e:
    return JSONResponse(
      status_code=503,
      content={"error": "Speedtest service unavailable", "detail": "Unable to connect to Speedtest.net servers. This may be due to firewall, proxy, or network restrictions.", "download": 0, "upload": 0, "ping": 0}
    )
  except Exception as e:
    return JSONResponse(
      status_code=500,
      content={"error": "Speedtest failed", "detail": str(e), "download": 0, "upload": 0, "ping": 0}
    )