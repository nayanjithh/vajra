from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

app = FastAPI()

# =========================
# CORS (VERY IMPORTANT)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow React / browser
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE_TOKEN = "MY_DEVICE_123"

# =========================
# GLOBAL STORAGE
# =========================
latest_data = {}
immobilizer_command = 0


# =========================
# MODELS
# =========================
class PacketData(BaseModel):
    packet: str

class ImmobilizerCommand(BaseModel):
    state: int


# =========================
# RECEIVE PACKET FROM ESP32
# =========================
@app.post("/api/telematics")
def receive_packet(data: PacketData, authorization: str = Header(None)):
    global latest_data, immobilizer_command

    if authorization != f"Bearer {DEVICE_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    parsed = parse_packet(data.packet)
    latest_data = parsed

    return {
        "status": "OK",
        "immobilizer": immobilizer_command
    }


# =========================
# FRONTEND GET VEHICLE DATA
# =========================
@app.get("/api/data")
def get_data():
    return latest_data


# =========================
# FRONTEND SEND IMMOBILIZER COMMAND
# =========================
@app.post("/api/immobilizer")
def set_immobilizer(cmd: ImmobilizerCommand):
    global immobilizer_command
    immobilizer_command = cmd.state
    return {
        "status": "Command Stored",
        "immobilizer": immobilizer_command
    }


# =========================
# PACKET PARSER
# =========================
def parse_packet(packet: str):
    try:
        clean = packet[1:packet.index("*")]
        parts = clean.split(",")

        return {
            "imei": parts[1],
            "frame": int(parts[3]),
            "operator": parts[4],
            "signal": int(parts[5]),
            "latitude": float(parts[9]) / 1_000_000,
            "longitude": float(parts[11]) / 1_000_000,
            "speed": float(parts[15]) / 100,
            "ignition": parts[16] == "1",
            "immobilizer": parts[17] == "1",
            "voltage": float(parts[18]) / 10,
            "timestamp": int(parts[19]),
            "server_time": int(time.time())
        }
    except:
        return {"error": "Invalid packet"}