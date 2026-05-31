const express = require("express");
const cors = require("cors");
const fs = require("fs");
const os = require("os");
const net = require("net");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const startedAt = Date.now();
let connectedDevices = 0;

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const DB_FILE = "./db.json";

app.use(cors());
app.use(express.json());

function ensureDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(
        {
          articles: [],
          fridgeNotes: [],
        },
        null,
        2
      )
    );
  }

  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));

  if (!db.articles) db.articles = [];
  if (!db.fridgeNotes) db.fridgeNotes = [];

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function formatUptime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

function isDockerRunning() {
  return process.env.DOCKER_CONTAINER === "true" || fs.existsSync("/.dockerenv");
}

function checkTcpHost(host, port, timeout = 1500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

/* HEALTH */

app.get("/health", async (req, res) => {
  const dbExists = fs.existsSync(DB_FILE);

  let dbHealthy = false;
  let articleCount = 0;
  let fridgeNoteCount = 0;

  try {
    const db = readDb();
    dbHealthy = Array.isArray(db.articles) && Array.isArray(db.fridgeNotes);
    articleCount = db.articles.length;
    fridgeNoteCount = db.fridgeNotes.length;
  } catch {
    dbHealthy = false;
  }

  const memory = process.memoryUsage();
  const dockerRunning = isDockerRunning();

  const [
    ryzeOnline,
    pinkwardOnline,
    grafanaOnline,
    hexgateOnline,
    viktorOnline,
  ] = await Promise.all([
    checkTcpHost("192.168.1.20", 8006),
    checkTcpHost("192.168.1.31", 3002),
    checkTcpHost("192.168.1.31", 3003),
    checkTcpHost("192.168.1.32", 81),
    checkTcpHost("192.168.1.40", 11434),
  ]);

  res.json({
    app: "The Richendollars",
    status: "online",

    backend: {
      status: "online",
      port: 3001,
      uptime: formatUptime(Date.now() - startedAt),
      startedAt: new Date(startedAt).toLocaleString(),
    },

    database: {
      status: dbHealthy ? "connected" : "error",
      file: DB_FILE,
      exists: dbExists,
      articles: articleCount,
      fridgeNotes: fridgeNoteCount,
    },

    websocket: {
      status: "enabled",
      connectedDevices,
    },

    host: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpuCores: os.cpus().length,
      freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
      totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
    },

    process: {
      nodeVersion: process.version,
      memoryUsedMb: Math.round(memory.rss / 1024 / 1024),
    },

    infrastructure: {
      ryze: ryzeOnline ? "online" : "offline",
      pinkward: pinkwardOnline ? "online" : "offline",
      grafana: grafanaOnline ? "online" : "offline",
      hexgate: hexgateOnline ? "online" : "offline",
      viktor: viktorOnline ? "online" : "offline",
    },

    future: {
      ryze: ryzeOnline ? "online" : "offline",
      pinkward: pinkwardOnline ? "online" : "offline",
      grafana: grafanaOnline ? "online" : "offline",
      hexgate: hexgateOnline ? "online" : "offline",
      docker: dockerRunning ? "running" : "not detected",
      tailscale: "active",
      viktorAi: viktorOnline ? "online" : "future",
    },
  });
});

/* ARTICLES */

app.get("/articles", (req, res) => {
  const db = readDb();
  res.json(db.articles);
});

app.post("/articles", (req, res) => {
  const db = readDb();
  db.articles.push(req.body);
  writeDb(db);

  io.emit("articlesUpdated", db.articles);

  res.status(201).json(req.body);
});

app.put("/articles/:id", (req, res) => {
  const db = readDb();

  db.articles = db.articles.map((article) =>
    article.id === req.params.id ? req.body : article
  );

  writeDb(db);

  io.emit("articlesUpdated", db.articles);

  res.json(req.body);
});

app.delete("/articles/:id", (req, res) => {
  const db = readDb();

  db.articles = db.articles.filter(
    (article) => article.id !== req.params.id
  );

  writeDb(db);

  io.emit("articlesUpdated", db.articles);

  res.sendStatus(204);
});

/* FRIDGE NOTES */

app.get("/fridge-notes", (req, res) => {
  const db = readDb();
  res.json(db.fridgeNotes);
});

app.post("/fridge-notes", (req, res) => {
  const db = readDb();
  db.fridgeNotes.push(req.body);
  writeDb(db);

  io.emit("fridgeNotesUpdated", db.fridgeNotes);

  res.status(201).json(req.body);
});

app.put("/fridge-notes/:id", (req, res) => {
  const db = readDb();

  db.fridgeNotes = db.fridgeNotes.map((note) =>
    note.id === req.params.id ? req.body : note
  );

  writeDb(db);

  io.emit("fridgeNotesUpdated", db.fridgeNotes);

  res.json(req.body);
});

app.delete("/fridge-notes/:id", (req, res) => {
  const db = readDb();

  db.fridgeNotes = db.fridgeNotes.filter((note) => note.id !== req.params.id);

  writeDb(db);

  io.emit("fridgeNotesUpdated", db.fridgeNotes);

  res.sendStatus(204);
});

/* SOCKET.IO */

io.on("connection", (socket) => {
  connectedDevices += 1;
  console.log("Device connected to live sync");

  socket.on("disconnect", () => {
    connectedDevices = Math.max(0, connectedDevices - 1);
    console.log("Device disconnected from live sync");
  });
});

httpServer.listen(3001, "0.0.0.0", () => {
  ensureDb();
  console.log("The Richendollars backend running on port 3001");
});