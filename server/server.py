from fastapi import FastAPI
from fastapi.responses import JSONResponse
import speedtest
from speedtest import ConfigRetrievalError

app = FastAPI()

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
      content={"error": "Speedtest service unavailable", "detail": "Unable to connect to Speedtest.net servers. This may be due to firewall, proxy, or network restrictions."}
    )
  except Exception as e:
    return JSONResponse(
      status_code=500,
      content={"error": "Speedtest failed", "detail": str(e)}
    )