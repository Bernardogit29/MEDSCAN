require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const historyRoutes = require("./src/routes/historyRoutes");
const monitoringRoutes = require("./src/routes/monitoringRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const errorHandler = require("./src/middleware/errorHandler");
const requireDb = require("./src/middleware/requireDb");

const app = express();
const PORT = process.env.PORT || 3000;
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

// Endpoint leve para monitoramento externo e health check do Render.
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.json({
    name: "MEDSCAN API",
    status: "online",
    database: require("mongoose").connection.readyState === 1 ? "connected" : "disconnected",
    disclaimer:
      "As analises sao orientativas e nao substituem uma consulta medica."
  });
});

app.use("/api/auth", requireDb, authRoutes);
app.use("/api/ai", requireDb, aiRoutes);
app.use("/api/history", requireDb, historyRoutes);
app.use("/api", requireDb, monitoringRoutes);
app.use("/api/profile", requireDb, profileRoutes);
app.use("/api/care", requireDb, require("./src/routes/careRoutes"));

app.use(errorHandler);

async function startServer() {
  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MEDSCAN API rodando na porta ${PORT}`);
  });
}

startServer();
