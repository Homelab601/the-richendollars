import { useEffect, useState } from "react";

const API_URL = `${window.location.protocol}//${window.location.hostname}:3001`;

export default function HomelabStatus() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchHealth();

    const interval = setInterval(fetchHealth, 15000);

    return () => clearInterval(interval);
  }, []);

  async function fetchHealth() {
    try {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error("Failed to fetch health:", err);
      setHealth(null);
    }
  }

  if (!health) {
    return (
      <div className="card">
        <h2>Homelab Status</h2>
        <p className="empty">Could not reach backend health check.</p>
      </div>
    );
  }

  const systems = [
    {
      name: "Backend",
      status: health.backend.status,
      detail: `Port ${health.backend.port} • Uptime ${health.backend.uptime}`,
      level: "online",
    },
    {
      name: "Database",
      status: health.database.status,
      detail: `${health.database.articles} articles • ${health.database.fridgeNotes} fridge notes`,
      level: health.database.status === "connected" ? "online" : "offline",
    },
    {
      name: "Live Sync",
      status: health.websocket.status,
      detail: `${health.websocket.connectedDevices} device(s) connected`,
      level: "online",
    },
    {
      name: "Host",
      status: health.host.hostname,
      detail: `${health.host.platform} • ${health.host.cpuCores} CPU cores`,
      level: "online",
    },
    {
      name: "Memory",
      status: `${health.process.memoryUsedMb} MB used`,
      detail: `${health.host.freeMemoryMb} MB free of ${health.host.totalMemoryMb} MB`,
      level: "online",
    },
    {
      name: "Ryze",
      status: health.future.ryze,
      detail: "Future production host",
      level: "pending",
    },
    {
      name: "Docker",
      status: health.future.docker,
      detail: "Container deployment planned",
      level: "pending",
    },
    {
      name: "Viktor AI",
      status: health.future.viktorAi,
      detail: "Future voice/AI assistant",
      level: "offline",
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2>Homelab Status</h2>
          <p className="empty">
            Live system health • Refreshes every 15 seconds
          </p>
        </div>
      </div>

      <div className="homelab-grid">
        {systems.map((system) => (
          <div className="homelab-card" key={system.name}>
            <div className="homelab-card-top">
              <h3>{system.name}</h3>

              <span className={`status-pill ${system.level}`}>
                {system.status}
              </span>
            </div>

            <p>{system.detail}</p>
          </div>
        ))}
      </div>

      <div className="homelab-summary">
        <div>
          <strong>Started</strong>
          <span>{health.backend.startedAt}</span>
        </div>

        <div>
          <strong>Node Version</strong>
          <span>{health.process.nodeVersion}</span>
        </div>

        <div>
          <strong>App</strong>
          <span>{health.app}</span>
        </div>
      </div>
    </div>
  );
}