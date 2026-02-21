import React, { useState, useEffect, useRef } from "react";

const API = "https://vajra-backend.onrender.com";

const GEOFENCE_CENTER = { lat: 12.9716, lon: 77.5946 };
const GEOFENCE_RADIUS = 500;

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── Leaflet map component ─────────────────────────────────────────── */
function LiveMap({ vehicleLat, vehicleLon, userLat, userLon, geofenceCenter, geofenceRadius, breach }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const geofenceCircleRef = useRef(null);

  // Load Leaflet once
  useEffect(() => {
    if (mapInstanceRef.current) return;

    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => initMap();
    document.head.appendChild(script);

    return () => {};
  }, []);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [
        geofenceCenter?.lat ?? vehicleLat ?? 12.9716,
        geofenceCenter?.lon ?? vehicleLon ?? 77.5946
      ],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    const cLat = geofenceCenter?.lat ?? vehicleLat ?? 12.9716;
    const cLon = geofenceCenter?.lon ?? vehicleLon ?? 77.5946;

    // Geofence circle
    const circle = L.circle([cLat, cLon], {
      radius: geofenceRadius,
      color: breach ? "#ef4444" : "#38bdf8",
      fillColor: breach ? "#ef4444" : "#38bdf8",
      fillOpacity: 0.07,
      weight: 1.5,
      dashArray: "6 4",
    }).addTo(map);
    geofenceCircleRef.current = circle;

    // Vehicle marker
    const vehicleIcon = L.divIcon({
      html: `<div style="
        width:14px;height:14px;border-radius:50%;
        background:#38bdf8;border:2px solid #fff;
        box-shadow:0 0 10px #38bdf8;
      "></div>`,
      className: "",
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const vLat = vehicleLat ?? geofenceCenter?.lat ?? 12.9716;
    const vLon = vehicleLon ?? geofenceCenter?.lon ?? 77.5946;

    const vMarker = L.marker([vLat, vLon], { icon: vehicleIcon })
      .addTo(map)
      .bindPopup("<b>Vehicle</b>");
    vehicleMarkerRef.current = vMarker;

    // User marker (if available)
    if (userLat && userLon) {
      const userIcon = L.divIcon({
        html: `<div style="
          width:12px;height:12px;border-radius:50%;
          background:#4ade80;border:2px solid #fff;
          box-shadow:0 0 8px #4ade80;
        "></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      const uMarker = L.marker([userLat, userLon], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>You</b>");
      userMarkerRef.current = uMarker;
    }

    mapInstanceRef.current = map;
  };

  // Update vehicle marker & geofence when data changes
  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

        // Move geofence with user
    if (geofenceCircleRef.current && geofenceCenter) {
      geofenceCircleRef.current.setLatLng([
        geofenceCenter.lat,
        geofenceCenter.lon
      ]);
    }

    // 🔥 ADD THIS BLOCK
    if (mapInstanceRef.current && geofenceCenter) {
      mapInstanceRef.current.setView(
        [geofenceCenter.lat, geofenceCenter.lon],
        mapInstanceRef.current.getZoom(),
        { animate: true }
      );
    }

    if (vehicleMarkerRef.current && vehicleLat && vehicleLon) {
      vehicleMarkerRef.current.setLatLng([vehicleLat, vehicleLon]);
    }

    if (geofenceCircleRef.current) {
      geofenceCircleRef.current.setStyle({
        color: breach ? "#ef4444" : "#38bdf8",
        fillColor: breach ? "#ef4444" : "#38bdf8",
      });
    }

    if (userMarkerRef.current && userLat && userLon) {
      userMarkerRef.current.setLatLng([userLat, userLon]);
    } else if (!userMarkerRef.current && userLat && userLon && L && mapInstanceRef.current) {
      const userIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#4ade80;border:2px solid #fff;box-shadow:0 0 8px #4ade80;"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      userMarkerRef.current = L.marker([userLat, userLon], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup("<b>You</b>");
    }
  }, [vehicleLat, vehicleLon, userLat, userLon, breach]);

  return (
    <div style={{ position: "relative", height: "100%", minHeight: 280 }}>
      <div ref={mapRef} style={{ height: "100%", minHeight: 280, borderRadius: 12, zIndex: 1 }} />
      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 12, left: 12, zIndex: 1000,
        background: "rgba(15,17,23,0.85)", backdropFilter: "blur(8px)",
        border: "1px solid #1e2433", borderRadius: 8, padding: "8px 12px",
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.68rem", color: "#94a3b8" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
          Vehicle
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.68rem", color: "#94a3b8" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
          You
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.68rem", color: "#94a3b8" }}>
          <div style={{ width: 16, height: 2, background: breach ? "#ef4444" : "#38bdf8", borderRadius: 1 }} />
          Geofence ({geofenceRadius}m)
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #0a0d14; font-family: 'DM Sans', sans-serif; color: #cbd5e1; }

  .dashboard { min-height: 100vh; background: #0a0d14; }

  /* HEADER */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 28px;
    border-bottom: 1px solid #161c2a;
    background: #0a0d14;
    position: sticky; top: 0; z-index: 50;
  }

  .header-title { font-size: 0.95rem; font-weight: 600; color: #f1f5f9; letter-spacing: 0.01em; }
  .header-title span { color: #38bdf8; }

  .header-center { display: flex; align-items: center; gap: 10px; }

  .live-pill {
    display: flex; align-items: center; gap: 5px;
    font-size: 0.68rem; font-family: 'DM Mono', monospace;
    color: #4ade80;
    background: rgba(74,222,128,0.07);
    border: 1px solid rgba(74,222,128,0.18);
    padding: 4px 10px; border-radius: 20px;
    letter-spacing: 0.05em;
  }

  .live-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #4ade80;
    animation: livepulse 1.6s ease-in-out infinite;
  }

  @keyframes livepulse { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .logout-btn {
    background: transparent; border: 1px solid #1e2a3a;
    color: #475569; font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem; padding: 6px 14px; border-radius: 6px;
    cursor: pointer; transition: all 0.18s;
  }

  .logout-btn:hover { border-color: #ef4444; color: #ef4444; }

  /* LAYOUT */
  .main {
    display: grid;
    grid-template-columns: 340px 1fr;
    grid-template-rows: auto;
    gap: 16px;
    padding: 20px 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .left-col { display: flex; flex-direction: column; gap: 14px; }
  .right-col { display: flex; flex-direction: column; gap: 14px; }

  /* CARD */
  .card {
    background: #111520;
    border: 1px solid #161c2a;
    border-radius: 12px;
    padding: 18px;
  }

  .card-title {
    font-size: 0.65rem; font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: #38bdf8; margin-bottom: 14px;
    display: flex; align-items: center; gap: 6px;
  }

  .card-title::before {
    content: ''; width: 3px; height: 10px;
    background: #38bdf8; border-radius: 2px;
    box-shadow: 0 0 6px #38bdf8;
  }

  /* ROWS */
  .row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 0; border-bottom: 1px solid #161c2a;
  }
  .row:last-child { border-bottom: none; padding-bottom: 0; }

  .row-label { font-size: 0.76rem; color: #475569; }
  .row-value { font-family: 'DM Mono', monospace; font-size: 0.8rem; color: #cbd5e1; }

  /* BADGES */
  .badge {
    font-size: 0.67rem; font-family: 'DM Mono', monospace;
    padding: 3px 9px; border-radius: 20px; font-weight: 500;
  }
  .badge-green { background: rgba(74,222,128,0.09); color: #4ade80; border: 1px solid rgba(74,222,128,0.22); }
  .badge-gray  { background: rgba(71,85,105,0.15); color: #475569; border: 1px solid rgba(71,85,105,0.2); }
  .badge-red   { background: rgba(239,68,68,0.09); color: #f87171; border: 1px solid rgba(239,68,68,0.22); }
  .badge-blue  { background: rgba(56,189,248,0.09); color: #38bdf8; border: 1px solid rgba(56,189,248,0.22); }

  /* VOLTAGE */
  .volt-row { flex-direction: column; align-items: flex-start; gap: 8px; }
  .volt-header { display: flex; justify-content: space-between; width: 100%; }
  .volt-bar { width: 100%; height: 3px; background: #1e2a3a; border-radius: 2px; overflow: hidden; }
  .volt-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg,#ef4444,#f59e0b 50%,#4ade80); transition: width 0.5s; }

  /* COORDS */
  .coord-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .coord-box { background: #0a0d14; border: 1px solid #161c2a; border-radius: 8px; padding: 10px; text-align: center; }
  .coord-label { font-size: 0.58rem; color: #475569; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 3px; }
  .coord-val { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #38bdf8; }

  /* GEOFENCE STATUS */
  .geofence-status {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 12px; padding: 10px 12px; border-radius: 8px;
    border: 1px solid;
  }
  .geofence-status.inside { background: rgba(74,222,128,0.05); border-color: rgba(74,222,128,0.2); }
  .geofence-status.outside { background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.3); animation: alertBorder 2s ease-in-out infinite; }
  @keyframes alertBorder { 0%,100%{border-color:rgba(239,68,68,0.3)} 50%{border-color:rgba(239,68,68,0.7)} }

  .geo-label { font-size: 0.72rem; color: #475569; }
  .geo-val { font-size: 0.72rem; font-weight: 600; font-family: 'DM Mono', monospace; }
  .geo-val.inside { color: #4ade80; }
  .geo-val.outside { color: #f87171; }

  /* FREQUENCY */
  .freq-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
  .freq-input {
    background: #0a0d14; border: 1px solid #1e2a3a;
    color: #cbd5e1; font-family: 'DM Mono', monospace;
    font-size: 0.78rem; padding: 5px 10px; border-radius: 6px;
    width: 64px; outline: none;
    transition: border-color 0.2s;
  }
  .freq-input:focus { border-color: #38bdf8; }
  .freq-btn {
    background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.25);
    color: #38bdf8; font-family: 'DM Sans', sans-serif; font-size: 0.75rem;
    font-weight: 500; padding: 5px 12px; border-radius: 6px;
    cursor: pointer; transition: all 0.18s;
  }
  .freq-btn:hover { background: rgba(56,189,248,0.18); }

  .update-time { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: #1e2a3a; text-align: right; margin-top: 10px; }

  /* STATUS CARD */
  .status-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 20px; padding: 36px 24px;
    background: #111520; border: 1px solid #161c2a; border-radius: 12px;
    transition: border-color 0.4s;
  }
  .status-card.is-safe  { border-color: rgba(74,222,128,0.2); }
  .status-card.is-alert { border-color: rgba(239,68,68,0.3); }
  .status-card.is-warn  { border-color: rgba(245,158,11,0.25); }

  .status-icon-wrap {
    width: 80px; height: 80px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; font-weight: 700;
    transition: all 0.4s;
  }
  .status-icon-wrap.safe  { background: rgba(74,222,128,0.07); border: 2px solid rgba(74,222,128,0.28); color: #4ade80; }
  .status-icon-wrap.alert { background: rgba(239,68,68,0.07); border: 2px solid rgba(239,68,68,0.3); color: #f87171; animation: iconring 2s ease-in-out infinite; }
  .status-icon-wrap.warn  { background: rgba(245,158,11,0.07); border: 2px solid rgba(245,158,11,0.28); color: #fbbf24; }
  @keyframes iconring { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)} 50%{box-shadow:0 0 0 10px rgba(239,68,68,0)} }

  .status-text { font-size: 1.1rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
  .status-text.safe  { color: #4ade80; }
  .status-text.alert { color: #f87171; }
  .status-text.warn  { color: #fbbf24; }

  .status-desc { font-size: 0.77rem; color: #475569; text-align: center; max-width: 180px; line-height: 1.55; }

  /* MINI STATS */
  .mini-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; width: 100%; }
  .mini-stat { background: #0a0d14; border: 1px solid #161c2a; border-radius: 8px; padding: 12px 8px; text-align: center; }
  .mini-stat-label { font-size: 0.58rem; color: #475569; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 5px; }
  .mini-stat-val { font-family: 'DM Mono', monospace; font-size: 0.9rem; font-weight: 500; }
  .mini-stat-val.ok      { color: #4ade80; }
  .mini-stat-val.bad     { color: #f87171; }
  .mini-stat-val.neutral { color: #334155; }

  /* ACTION BUTTON */
  .action-btn {
    font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500;
    padding: 11px 28px; border-radius: 8px; border: none;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em;
  }
  .btn-danger  { background: #ef4444; color: #fff; }
  .btn-danger:hover  { background: #dc2626; box-shadow: 0 4px 18px rgba(239,68,68,0.35); }
  .btn-release { background: #111520; color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
  .btn-release:hover { background: rgba(74,222,128,0.08); }

  /* MAP CARD */
  .map-card {
    background: #111520; border: 1px solid #161c2a;
    border-radius: 12px; overflow: hidden;
    flex: 1; min-height: 300px;
  }

  .map-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px 10px;
  }

  .map-body { padding: 0 12px 12px; height: calc(100% - 52px); min-height: 280px; }

  /* Leaflet override for dark */
  .leaflet-container { background: #0a0d14; font-family: 'DM Sans', sans-serif; }
  .leaflet-popup-content-wrapper { background: #111520; border: 1px solid #1e2a3a; color: #cbd5e1; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
  .leaflet-popup-tip { background: #111520; }
  .leaflet-control-zoom a { background: #111520 !important; color: #38bdf8 !important; border-color: #1e2a3a !important; }
  .leaflet-control-zoom a:hover { background: #161c2a !important; }

  @media (max-width: 900px) {
    .main { grid-template-columns: 1fr; padding: 14px; }
  }
`;

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function HomePage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("NO DATA");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [freq, setFreq] = useState(5);
  const [userLocation, setUserLocation] = useState(null);
  const [freqSent, setFreqSent] = useState(false);

  const geofenceCenter = userLocation;

  // Get user's GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => console.log("Geo error:", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

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
  
    if (!geofenceCenter) {
      setStatus("WAITING USER GPS");
      return;
    }
  
    const dist = distanceMeters(
      vehicle.latitude,
      vehicle.longitude,
      geofenceCenter.lat,
      geofenceCenter.lon
    );
  
    if (dist > GEOFENCE_RADIUS) {
      setStatus("GEOFENCE BREACH");
      return;
    }
  
    if (vehicle.voltage < 2.5) setStatus("LOW VOLTAGE");
    else if (vehicle.speed > 80) setStatus("OVER SPEED");
    else if (!vehicle.ignition) setStatus("IGNITION OFF");
    else setStatus("SAFE");
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
    setFreqSent(true);
    setTimeout(() => setFreqSent(false), 2000);
  };

  const isSafe = status === "SAFE";
  const isWarn = status === "IGNITION OFF";
  const isBreach = status === "GEOFENCE BREACH";
  const voltPct = data ? Math.min(100, Math.max(0, ((data.voltage - 2) / 3) * 100)) : 0;
  const statusClass = isSafe ? "safe" : isWarn ? "warn" : "alert";
  const statusIcon = isSafe ? "✓" : "!";
  const statusDesc = {
    "SAFE": "All systems normal.",
    "LOW VOLTAGE": "Battery voltage critically low.",
    "OVER SPEED": "Vehicle exceeding speed limit.",
    "IGNITION OFF": "Vehicle ignition is off.",
    "GEOFENCE BREACH": "Vehicle has left the geofence area.",
    "NO GPS": "GPS signal unavailable.",
    "NO DATA": "Waiting for vehicle data...",
    "SERVER ERROR": "Cannot reach the server.",
  }[status] || "";

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">

        {/* HEADER */}
        <header className="header">
          <span className="header-title"><span>AURA</span> Telematics</span>
          <div className="header-center">
            <div className="live-pill"><div className="live-dot" />LIVE</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </header>

        <div className="main">

          {/* ── LEFT COLUMN ── */}
          <div className="left-col">

            {/* Vehicle Card */}
            <div className="card">
              <div className="card-title">Vehicle</div>
              <div className="row">
                <span className="row-label">Ignition</span>
                <span className={`badge ${data?.ignition ? "badge-green" : "badge-gray"}`}>{data?.ignition ? "ON" : "OFF"}</span>
              </div>
              <div className="row">
                <span className="row-label">Speed</span>
                <span className="row-value" style={{ color: data?.speed > 80 ? "#f87171" : undefined }}>
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
                  <span className="row-value" style={{ color: data?.voltage < 2.5 ? "#f87171" : undefined }}>
                    {data?.voltage ?? "--"} V
                  </span>
                </div>
                <div className="volt-bar"><div className="volt-fill" style={{ width: `${voltPct}%` }} /></div>
              </div>
            </div>

            {/* Location Card */}
            <div className="card">
              <div className="card-title">Location</div>
              <div className="coord-grid">
                <div className="coord-box">
                  <div className="coord-label">Latitude</div>
                  <div className="coord-val">{data?.latitude?.toFixed(5) ?? "--"}</div>
                </div>
                <div className="coord-box">
                  <div className="coord-label">Longitude</div>
                  <div className="coord-val">{data?.longitude?.toFixed(5) ?? "--"}</div>
                </div>
              </div>
              <div className={`geofence-status ${isBreach ? "outside" : "inside"}`}>
                <span className="geo-label">Geofence ({GEOFENCE_RADIUS}m radius)</span>
                <span className={`geo-val ${isBreach ? "outside" : "inside"}`}>
                  {isBreach ? "⚠ OUTSIDE" : "✓ INSIDE"}
                </span>
              </div>
            </div>

            {/* Network Card */}
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
              <div className="row" style={{ paddingBottom: 0 }}>
                <span className="row-label">Update Freq.</span>
                <div className="freq-row">
                  <input
                    className="freq-input"
                    type="number"
                    value={freq}
                    min="1"
                    onChange={(e) => setFreq(e.target.value)}
                  />
                  <button className="freq-btn" onClick={setFrequency}>
                    {freqSent ? "✓ Set" : "Set"}
                  </button>
                </div>
              </div>
              <div className="update-time">Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : "--"}</div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="right-col">

            {/* Status Card */}
            <div className={`status-card is-${statusClass}`}>
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
                  <div className={`mini-stat-val ${(data?.speed ?? 0) > 80 ? "bad" : "ok"}`}>{data?.speed ?? "--"}</div>
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

            {/* Map Card */}
            <div className="map-card" style={{ flex: 1, minHeight: 320 }}>
              <div className="map-header">
                <div className="card-title" style={{ marginBottom: 0 }}>Live Map</div>
                {userLocation && (
                  <span style={{ fontSize: "0.65rem", color: "#4ade80", fontFamily: "DM Mono", display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }} />
                    GPS Active
                  </span>
                )}
              </div>
              <div className="map-body">
              <LiveMap
                vehicleLat={data?.latitude}
                vehicleLon={data?.longitude}
                userLat={userLocation?.lat}
                userLon={userLocation?.lon}
                geofenceCenter={geofenceCenter}
                geofenceRadius={GEOFENCE_RADIUS}
                breach={isBreach}
              />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}