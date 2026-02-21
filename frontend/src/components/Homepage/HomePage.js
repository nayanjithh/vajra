import React, { useState, useEffect } from "react";

const API = "https://vajra-backend.onrender.com";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0f1117;
    font-family: 'Inter', sans-serif;
    color: #e2e8f0;
  }

  .dashboard { min-height: 100vh; background: #0f1117; }

  /* HEADER */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 28px;
    border-bottom: 1px solid #1e2433;
  }

  .header-title { font-size: 1rem; font-weight: 600; color: #fff; }
  .header-title span { color: #38bdf8; }

  .live-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.7rem;
    font-family: 'JetBrains Mono', monospace;
    color: #4ade80;
    background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.2);
    padding: 4px 10px;
    border-radius: 20px;
  }

  .live-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #4ade80;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .logout-btn {
    background: transparent;
    border: 1px solid #1e2433;
    color: #64748b;
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    padding: 6px 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .logout-btn:hover { border-color: #ef4444; color: #ef4444; }

  /* LAYOUT */
  .main {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 20px;
    padding: 24px 28px;
    max-width: 1100px;
    margin: 0 auto;
  }

  /* CARDS */
  .card {
    background: #161b27;
    border: 1px solid #1e2433;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .card:last-child { margin-bottom: 0; }

  .card-title {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #38bdf8;
    margin-bottom: 16px;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #1e2433;
  }

  .row:last-child { border-bottom: none; }
  .row-label { font-size: 0.78rem; color: #64748b; }
  .row-value { font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: #e2e8f0; }

  .badge {
    font-size: 0.7rem;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 20px;
    font-family: 'JetBrains Mono', monospace;
  }

  .badge-green { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.25); }
  .badge-gray  { background: rgba(100,116,139,0.1); color: #64748b; border: 1px solid rgba(100,116,139,0.2); }
  .badge-red   { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.25); }
  .badge-blue  { background: rgba(56,189,248,0.1); color: #38bdf8; border: 1px solid rgba(56,189,248,0.25); }

  .volt-row { flex-direction: column; align-items: flex-start; gap: 8px; }
  .volt-header { display: flex; justify-content: space-between; width: 100%; }
  .volt-bar { width: 100%; height: 4px; background: #1e2433; border-radius: 2px; overflow: hidden; }
  .volt-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, #ef4444, #f59e0b, #4ade80);
    transition: width 0.5s;
  }

  .coord-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .coord-box {
    background: #0f1117;
    border: 1px solid #1e2433;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }

  .coord-label { font-size: 0.6rem; color: #64748b; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
  .coord-val { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #38bdf8; }

  .update-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: #334155;
    text-align: right;
    margin-top: 12px;
  }

  /* STATUS PANEL */
  .status-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    background: #161b27;
    border: 1px solid #1e2433;
    border-radius: 12px;
    padding: 40px;
  }

  .status-panel.is-alert { border-color: rgba(239,68,68,0.3); }
  .status-panel.is-safe  { border-color: rgba(74,222,128,0.2); }
  .status-panel.is-warn  { border-color: rgba(245,158,11,0.25); }

  .status-icon-wrap {
    width: 90px; height: 90px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 600;
  }

  .status-icon-wrap.safe  { background: rgba(74,222,128,0.08);  border: 2px solid rgba(74,222,128,0.3);  color: #4ade80; }
  .status-icon-wrap.alert { background: rgba(239,68,68,0.08);   border: 2px solid rgba(239,68,68,0.3);   color: #ef4444; animation: ring 2s ease-in-out infinite; }
  .status-icon-wrap.warn  { background: rgba(245,158,11,0.08);  border: 2px solid rgba(245,158,11,0.3);  color: #f59e0b; }

  @keyframes ring {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
    50%       { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
  }

  .status-text {
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .status-text.safe  { color: #4ade80; }
  .status-text.alert { color: #ef4444; }
  .status-text.warn  { color: #f59e0b; }

  .status-desc { font-size: 0.8rem; color: #64748b; text-align: center; max-width: 200px; line-height: 1.5; }

  .mini-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; }

  .mini-stat {
    background: #0f1117;
    border: 1px solid #1e2433;
    border-radius: 8px;
    padding: 14px 10px;
    text-align: center;
  }

  .mini-stat-label { font-size: 0.6rem; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
  .mini-stat-val   { font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 500; }
  .mini-stat-val.ok      { color: #4ade80; }
  .mini-stat-val.bad     { color: #ef4444; }
  .mini-stat-val.neutral { color: #64748b; }

  .action-btn {
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 12px 32px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-danger  { background: #ef4444; color: #fff; }
  .btn-danger:hover  { background: #dc2626; box-shadow: 0 4px 16px rgba(239,68,68,0.3); }

  .btn-release { background: #1e2433; color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
  .btn-release:hover { background: rgba(74,222,128,0.1); }

  @media (max-width: 860px) {
    .main { grid-template-columns: 1fr; padding: 16px; }
  }
`;

export default function HomePage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("NO DATA");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [freq, setFreq] = useState(5);

const GEOFENCE_CENTER = {
  lat: 12.9716,
  lon: 77.5946
};

const GEOFENCE_RADIUS = 500; // meters

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;

  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

  const handleLogout = async () => {
    try {
      const { signOut } = await import("firebase/auth");
      const { auth } = await import("../../firebase.js");
      await signOut(auth);
      localStorage.removeItem("firebaseToken");
      window.location.href = "/";
    } catch (err) { console.log(err); }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/api/data`);
      const json = await res.json();
      if (!json || json.error) { setStatus("NO DATA"); return; }
      setData(json);
      setLastUpdate(new Date());
      evaluateSafety(json);
    } catch { setStatus("SERVER ERROR"); }
  };

  const evaluateSafety = (vehicle) => {
    if (!vehicle?.latitude || !vehicle?.longitude) {
      setStatus("NO GPS");
      return;
    }
    const dist = distanceMeters(
      vehicle.latitude,
      vehicle.longitude,
      GEOFENCE_CENTER.lat,
      GEOFENCE_CENTER.lon
    );
  
    if (dist > GEOFENCE_RADIUS) {
      setStatus("GEOFENCE BREACH");
  
      // Optional auto-immobilize
      // toggleImmobilizer();
  
      return;
    }
    if (vehicle.voltage < 2.5) {
      setStatus("LOW VOLTAGE");
    } else if (vehicle.speed > 80) {
      setStatus("OVER SPEED");
    } else if (!vehicle.ignition) {
      setStatus("IGNITION OFF");
    } else {
      setStatus("SAFE");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleImmobilizer = async () => {
    if (!data) return;
    await fetch(`${API}/api/immobilizer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: data.immobilizer ? 0 : 1 }),
    });
    setTimeout(fetchData, 500);
  };

  const setFrequency = async () => {
    await fetch(`${API}/api/frequency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frequency: Number(freq) }),
    });
  };

  const isSafe = status === "SAFE";
  const isWarn = status === "IGNITION OFF";
  const voltPct = data ? Math.min(100, Math.max(0, ((data.voltage - 2) / 3) * 100)) : 0;
  const statusClass = isSafe ? "safe" : isWarn ? "warn" : "alert";
  const statusIcon = isSafe ? "✓" : "!";
  const statusDesc = {
    "SAFE": "All systems normal.",
    "LOW VOLTAGE": "Battery voltage critically low.",
    "OVER SPEED": "Vehicle exceeding speed limit.",
    "IGNITION OFF": "Vehicle ignition is off.",
    "NO DATA": "Waiting for vehicle data...",
    "SERVER ERROR": "Cannot reach the server.",
  }[status] || "";

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">

        <header className="header">
          <span className="header-title"><span>AURA</span> Telematics</span>
          <div className="live-pill"><div className="live-dot" />LIVE</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </header>

        <div className="main">

          {/* LEFT */}
          <div>
            <div className="card">
              <div className="card-title">Vehicle</div>
              <div className="row">
                <span className="row-label">Ignition</span>
                <span className={`badge ${data?.ignition ? "badge-green" : "badge-gray"}`}>{data?.ignition ? "ON" : "OFF"}</span>
              </div>
              <div className="row">
                <span className="row-label">Speed</span>
                <span className="row-value" style={{ color: data?.speed > 60 ? "#ef4444" : undefined }}>
                  {data?.speed ?? "--"} km/h
                </span>
              </div>
              <div className="row">
                <span className="row-label">Immobilizer</span>
                <span className={`badge ${data?.immobilizer ? "badge-red" : "badge-blue"}`}>
                  {data?.immobilizer ? "Locked" : "Unlocked"}
                </span>
              </div>
              <div className="row volt-row">
                <div className="volt-header">
                  <span className="row-label">Voltage</span>
                  <span className="row-value" style={{ color: data?.voltage < 2.5 ? "#ef4444" : undefined }}>
                    {data?.voltage ?? "--"} V
                  </span>
                </div>
                <div className="volt-bar"><div className="volt-fill" style={{ width: `${voltPct}%` }} /></div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Location</div>
              <div className="coord-grid">
                <div className="coord-box">
                  <div className="coord-label">Latitude</div>
                  <div className="coord-val">{data?.latitude ?? "--"}</div>
                </div>
                <div className="coord-box">
                  <div className="coord-label">Longitude</div>
                  <div className="coord-val">{data?.longitude ?? "--"}</div>
                </div>
              <h2>Geofence</h2>
              <p>
                <strong>Status:</strong>{" "}
                {status === "GEOFENCE BREACH" ? "OUTSIDE 🚨" : "INSIDE ✅"}
              </p>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Network</div>
              <div className="row">
                <span className="row-label">Signal</span>
                <span className="row-value">{data?.signal ?? "--"}</span>
              </div>
              <div className="row">
                <span className="row-label">Operator</span>
                <span className="row-value">{data?.operator ?? "--"}</span>
              </div>
              <div className="row">
                <span className="row-label">Frame No.</span>
                <span className="row-value" style={{ color: "#38bdf8", fontSize: "0.72rem" }}>{data?.frame ?? "--"}</span>
              </div>
              <div className="row">
                <span className="row-label">Set Frequency</span>
                <input
                  type="number"
                  value={freq}
                  min="1"
                  onChange={(e) => setFreq(e.target.value)}
                />
                <button onClick={setFrequency}>
                  Set Frequency
                </button>
              </div>
              <div className="update-time">Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : "--"}</div>
            </div>
          </div>

          {/* RIGHT */}
          <div className={`status-panel is-${statusClass}`}>
            <div className={`status-icon-wrap ${statusClass}`}>{statusIcon}</div>
            <div className={`status-text ${statusClass}`}>{status}</div>
            <p className="status-desc">{statusDesc}</p>

            <div className="mini-stats">
              <div className="mini-stat">
                <div className="mini-stat-label">Ignition</div>
                <div className={`mini-stat-val ${data?.ignition ? "ok" : "neutral"}`}>{data?.ignition ? "ON" : "OFF"}</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-label">Speed</div>
                <div className={`mini-stat-val ${(data?.speed ?? 0) > 60 ? "bad" : "ok"}`}>{data?.speed ?? "--"}</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-label">Voltage</div>
                <div className={`mini-stat-val ${(data?.voltage ?? 3) < 2.5 ? "bad" : "ok"}`}>{data?.voltage ?? "--"}V</div>
              </div>
            </div>

            {!isSafe && data && (
              <button
                className={`action-btn ${data.immobilizer ? "btn-release" : "btn-danger"}`}
                onClick={toggleImmobilizer}
              >
                {data.immobilizer ? "Release Vehicle" : "Immobilize Vehicle"}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}