from fastapi import FastAPI
import speedtest

app = FastAPI()

@app.get("/speedtest")
def run_speedtest():
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