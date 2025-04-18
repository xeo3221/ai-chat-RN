require("dotenv").config({ path: "../.env.local" });
const express = require("express");
const cors = require("cors");
const { google } = require("@ai-sdk/google");
const { generateText } = require("ai");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini model
const model = google("gemini-1.5-flash");

// Test endpoint
app.get("/", (req, res) => {
  res.json({ status: "API is running" });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const result = await generateText({
      model: model,
      messages,
    });

    res.json({ text: result.text });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
