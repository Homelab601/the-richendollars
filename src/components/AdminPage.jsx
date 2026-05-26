import { useState } from "react";
import HomelabStatus from "./HomelabStatus";

const ADMIN_PASSWORD = "Minford11";

export default function AdminPage({ apiUrl }) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  function login(e) {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setUnlocked(true);
      setPassword("");
    } else {
      alert("Incorrect admin password.");
    }
  }

  async function exportBackup() {
    try {
      const articlesRes = await fetch(`${apiUrl}/articles`);
      const articles = await articlesRes.json();

      const notesRes = await fetch(`${apiUrl}/fridge-notes`);
      const fridgeNotes = await notesRes.json();

      const backup = {
        app: "The Richendollars",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        settings: {
          pwaEnabled: true,
          googleCalendarEmbedEnabled: true,
          websocketEnabled: true,
          backend: apiUrl,
        },
        homelab: {
          currentHost: "Windows development PC",
          futureHost: "Ryze",
          frontend: "Online",
          backend: "Online",
          database: "db.json connected",
          liveSync: "Socket.IO enabled",
          docker: "Future upgrade",
        },
        articles,
        fridgeNotes,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];

      link.href = url;
      link.download = `richendollars-backup-${date}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not export backup.");
      console.error("Backup failed:", err);
    }
  }

  if (!unlocked) {
    return (
      <section className="article-page">
        <div className="card form-card">
          <h2>Admin Login</h2>

          <form className="form" onSubmit={login}>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
              />
            </label>

            <button className="gold-button">Unlock Admin</button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="article-page">
      <div className="card">
        <h2>Admin Panel</h2>
        <p className="empty">System tools, backups, and homelab controls.</p>

        <div className="admin-grid">
          <button className="gold-button" onClick={exportBackup}>
            Export Backup
          </button>

          <button className="muted-button" onClick={() => setUnlocked(false)}>
            Lock Admin
          </button>
        </div>
      </div>

      <HomelabStatus />
    </section>
  );
}