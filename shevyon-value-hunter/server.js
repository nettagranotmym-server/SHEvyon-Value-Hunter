const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = "8114";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

let runs = [];
let progress = [];
let openStep = "training";
let takenTeams = {};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", openStep });
});

app.get("/api/teams", (req, res) => {
  res.json(takenTeams);
});

app.post("/api/teams", (req, res) => {
  const { teamId, teamName } = req.body;
  if (!teamId) return res.status(400).json({ error: "Invalid teamId" });
  if (takenTeams[teamId]) return res.status(409).json({ error: "Team already taken" });
  takenTeams[teamId] = teamName || "unknown";
  res.json({ ok: true });
});

app.get("/api/step", (req, res) => {
  res.json({ openStep });
});

app.post("/api/step", (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.status(401).json({ error: "Unauthorized" });
  const { step } = req.body;
  if (typeof step !== "string") return res.status(400).json({ error: "Invalid step" });
  openStep = step;
  res.json({ ok: true, openStep });
});

app.post("/api/progress", (req, res) => {
  const p = req.body;
  if (!p || !p.teamId) return res.status(400).json({ error: "Invalid progress data" });
  progress = progress.filter(x => x.teamId !== p.teamId);
  progress.push({ ...p, ts: Date.now() });
  res.json({ ok: true });
});

app.get("/api/progress", (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.status(401).json({ error: "Unauthorized" });
  res.json(progress);
});

app.post("/api/runs", (req, res) => {
  const run = req.body;
  if (!run || !run.teamId) return res.status(400).json({ error: "Invalid run data" });
  runs = runs.filter(r => r.teamId !== run.teamId);
  runs.push({ ...run, ts: Date.now() });
  res.json({ ok: true });
});

app.get("/api/runs", (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.status(401).json({ error: "Unauthorized" });
  res.json(runs);
});

app.delete("/api/runs", (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.status(401).json({ error: "Unauthorized" });
  runs = [];
  progress = [];
  takenTeams = {};
  openStep = "training";
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`SHEvyon Value Hunter running on port ${PORT}`);
});
