import "dotenv/config";
import express from "express";
import cors from "cors";
import { runAgent } from "./agent.js";

const app = express();
app.use(cors());
app.use(express.json());

// ─── Health check ────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Main chat endpoint ─────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { message, neighborhoodContextEnabled } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "message is required" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({
      error:
        "OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.",
    });
    return;
  }

  try {
    console.log(`\n📩 Question: "${message}" (neighborhood: ${!!neighborhoodContextEnabled})`);
    const result = await runAgent(message, !!neighborhoodContextEnabled);
    console.log(`✅ Answer delivered (${result.metrics.length} metrics, ${result.actions.length} actions)`);
    res.json(result);
  } catch (err: any) {
    console.error("❌ Agent error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "3001", 10);
app.listen(PORT, () => {
  console.log(`\n🚀 Seller Ops Copilot server running on http://localhost:${PORT}`);
  console.log(
    process.env.OPENAI_API_KEY
      ? "   ✅ OpenAI API key loaded"
      : "   ⚠️  OPENAI_API_KEY not set – POST /api/chat will fail"
  );
});
