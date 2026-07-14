const express = require("express");
const { callGemini } = require("../services/gemini");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { text, numCards } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Please provide study material for flashcards." });
    }

    const count = Math.min(Math.max(parseInt(numCards, 10) || 8, 1), 20);

    const prompt = `Create ${count} flashcards based only on the study material below. Each flashcard should have a short "front" (a term or question) and a concise "back" (the definition or answer). Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:

{
  "cards": [
    { "front": "string", "back": "string" }
  ]
}

STUDY MATERIAL:
"""
${text.trim()}
"""`;

    const data = await callGemini(prompt, { json: true });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
