const express = require("express");
const { callGemini } = require("../services/gemini");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { text, length } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Please provide text to summarize." });
    }

    const targetLength = length || "medium";

    const prompt = `Summarize the following study material for a student. Target length: ${targetLength} (short = 3-4 bullet points, medium = a short paragraph plus key bullet points, long = a thorough structured summary with headings). Preserve the most important facts, definitions, and relationships. Do not add outside information.

TEXT TO SUMMARIZE:
"""
${text.trim()}
"""`;

    const summary = await callGemini(prompt);
    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
