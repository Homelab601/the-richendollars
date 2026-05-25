const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const DB_FILE = "./db.json";

app.use(cors());
app.use(express.json());

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get("/articles", (req, res) => {
  res.json(readDb().articles || []);
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
  db.articles = db.articles.filter((article) => article.id !== req.params.id);
  writeDb(db);

  io.emit("articlesUpdated", db.articles);
  res.sendStatus(204);
});

io.on("connection", () => {
  console.log("Device connected to live sync");
});

httpServer.listen(3001, "0.0.0.0", () => {
  console.log("The Richendollars backend running on port 3001");
});