const express = require("express");
const { callGemini } = require("../services/gemini");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Please provide a question." });
    }

    const prompt = `You are a knowledgeable, concise study assistant. Answer the student's question clearly and accurately. Use short paragraphs or bullet points where helpful. Avoid unnecessary preamble.

Question: ${question.trim()}`;

    const answer = await callGemini(prompt);
    res.json({ answer });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
