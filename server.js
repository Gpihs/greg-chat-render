// server.js
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { INSTRUCTIONS, PROMPT_VERSION } from "./prompt.js";

const k = process.env.OPENAI_API_KEY || "";
console.log("OPENAI_API_KEY (masked):", k ? `${k.slice(0,8)}...${k.slice(-6)}` : "(missing)");

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, promptVersion: PROMPT_VERSION });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { userText, history = [] } = req.body ?? {};
    const input = [
      { role: "system", content: INSTRUCTIONS },
      ...history,
      { role: "user", content: String(userText ?? "").trim() }
    ];

    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      input,
      temperature: 0.7
    });

    const reply = (resp.output_text ?? "").trim();
    res.json({ ok: true, reply, promptVersion: PROMPT_VERSION });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err?.message ?? "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on :${PORT}`));
