const express = require("express");
const { callGemini } = require("../services/gemini");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { text, numQuestions } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Please provide study material to quiz on." });
    }

    const count = Math.min(Math.max(parseInt(numQuestions, 10) || 5, 1), 15);

    const prompt = `Create ${count} multiple-choice quiz questions based only on the study material below. Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:

{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "one sentence explaining why the correct answer is right"
    }
  ]
}

Each question must have exactly 4 options and correctIndex referring to the 0-based index of the correct option.

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
