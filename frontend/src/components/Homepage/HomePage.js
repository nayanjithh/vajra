import React, { useState, useEffect } from "react";
import "./HomePage.css";

const API = "https://vajra-backend.onrender.com";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("NO DATA");
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/api/data`);
      const json = await res.json();

      if (!json || json.error || Object.keys(json).length === 0) {
        setStatus("NO DATA");
        setConnected(false);
        return;
      }

      setData(json);
      // setConnected(true);
      setLastUpdate(new Date());

      evaluateSafety(json);
    } catch {
      setStatus("SERVER ERROR");
      setConnected(false);
    }
  };

  const evaluateSafety = (vehicle) => {
    console.log(vehicle)
    // if (vehicle.voltage < 2.5) {
    //   setStatus("LOW VOLTAGE");
    // } else if (vehicle.speed > 80) {
    //   setStatus("OVER SPEED");
    // } else if (!vehicle.ignition) {
    //   setStatus("IGNITION OFF");
    // } else {
    //   setStatus("SAFE");
    // }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleImmobilizer = async () => {
    if (!data) return;

    const newState = data.immobilizer ? 0 : 1;

    await fetch(`${API}/api/immobilizer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state: newState }),
    });

    setTimeout(fetchData, 500);
  };

  const isAlert = status !== "SAFE" && status !== "NO DATA";

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🚗 Vajra Telematics Dashboard</h1>
        <div className="connection">
          {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </header>

      <div className="main">

        {/* LEFT PANEL */}
        <div className="panel">

          <div className="card">
            <h2>Vehicle Information</h2>
            <p><strong>Ignition:</strong> {data?.ignition ? "ON" : "OFF"}</p>
            <p><strong>Speed:</strong> {data?.speed ?? "--"} km/h</p>
            <p><strong>Immobilizer:</strong> {data?.immobilizer ? "Locked" : "Unlocked"}</p>
            <p><strong>Voltage:</strong> {data?.voltage ?? "--"} V</p>

            <h2>Location</h2>
            <p><strong>Latitude:</strong> {data?.latitude ?? "--"}</p>
            <p><strong>Longitude:</strong> {data?.longitude ?? "--"}</p>

            <h2>Network</h2>
            <p><strong>Signal:</strong> {data?.signal ?? "--"}</p>
            <p><strong>Operator:</strong> {data?.operator ?? "--"}</p>
            <p><strong>Frame No:</strong> {data?.frame ?? "--"}</p>

            <h2>Controls</h2>
            <button className="btn" onClick={toggleImmobilizer}>
              {data?.immobilizer ? "Release Vehicle" : "Immobilize Vehicle"}
            </button>
            <p className="updateTime">
              Last Update: {lastUpdate ? lastUpdate.toLocaleTimeString() : "--"}
            </p>
          </div>

        </div>

        {/* RIGHT PANEL */}
        {status === "SAFE" && (
            <div className="statusPanel safe">
              <div className="statusIcon">✔</div>
              <h2>SAFE CONDITION</h2>
            </div>
          )}

          {status !== "SAFE" && status !== "NO DATA" && (
            <div className="statusPanel alert">
              <div className="statusIcon">⚠</div>
              <h2>{status}</h2>
            </div>
          )}

          {status === "NO DATA" && (
            <div className="statusPanel nodata">
              <div className="statusIcon">?</div>
              <h2>No Data</h2>
            </div>
          )}

      </div>
    </div>
  );
}