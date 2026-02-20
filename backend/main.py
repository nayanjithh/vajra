from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

import firebase_admin
from firebase_admin import credentials, auth, firestore

import os
import json

# =========================
# FIREBASE INIT (FIRST)
# =========================
firebase_key = os.environ.get("FIREBASE_KEY")

cred = credentials.Certificate(json.loads(firebase_key))
firebase_admin.initialize_app(cred)

db = firestore.client()

# =========================
# FASTAPI INIT
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# GLOBAL STATE (SIMPLE DEMO)
# =========================
DEVICE_TOKEN = "MY_DEVICE_123"
latest_data = {}
immobilizer_command = 0

# =========================
# MODELS
# =========================
class PacketData(BaseModel):
    packet: str

class ImmobilizerCommand(BaseModel):
    state: int

class TokenData(BaseModel):
    token: str

# =========================
# GOOGLE AUTH VERIFY
# =========================
@app.post("/auth/verify")
def verify_user(data: TokenData):
    try:
        decoded = auth.verify_id_token(data.token)
        return {
            "status": "OK",
            "uid": decoded.get("uid"),
            "email": decoded.get("email"),
            "name": decoded.get("name")
        }
    except:
        return {"error": "Invalid token"}

# =========================
# ESP32 SEND TELEMETRY
# =========================
@app.post("/api/telematics")
def receive_packet(data: PacketData, authorization: str = Header(None)):
    global latest_data, immobilizer_command

    if authorization != f"Bearer {DEVICE_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    parsed = parse_packet(data.packet)
    if "error" in parsed:
        return {"error": "Invalid packet"}

    latest_data = parsed

    # 🔥 STORE IN FIRESTORE (LATEST STATE)
    imei = parsed["imei"]

    db.collection("vehicles").document(imei).set(parsed, merge=True)

    print("Telemetry stored for:", imei)

    return {
        "status": "OK",
        "values": latest_data,
        "immobilizer": immobilizer_command
    }

# =========================
# FRONTEND GET DATA
# =========================
@app.get("/api/data")
def get_data():
    return latest_data

# =========================
# FRONTEND SET IMMOBILIZER
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
# SAFE PACKET PARSER
# =========================
def parse_packet(packet: str):
    try:
        if "*" not in packet:
            return {"error": "Missing *"}

        clean = packet[1:packet.index("*")]
        parts = clean.split(",")

        if len(parts) < 21:
            return {"error": f"Invalid field count: {len(parts)}"}

        return {
            "imei": parts[1],
            "frame": int(parts[3]),
            "operator": parts[4],
            "signal": int(parts[5]),

            "latitude": float(parts[9]) / 1_000_000,
            "longitude": float(parts[11]) / 1_000_000,
            "speed": float(parts[15]) / 100,

            "ignition_old": parts[16] == "1",
            "immobilizer": parts[17] == "1",

            "voltage": float(parts[18]) / 10,
            "timestamp": int(parts[19]),
            "server_time": int(time.time()),

            # NEW FIELD (your added ignitionValue)
            "ignition": parts[20] == "1"
        }

    except Exception as e:
        print("Parse error:", e)
        return {"error": "Invalid packet"}