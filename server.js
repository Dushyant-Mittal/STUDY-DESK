require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const askRoute = require("./routes/ask");
const summarizeRoute = require("./routes/summarize");
const quizRoute = require("./routes/quiz");
const flashcardsRoute = require("./routes/flashcards");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/ask", askRoute);
app.use("/api/summarize", summarizeRoute);
app.use("/api/quiz", quizRoute);
app.use("/api/flashcards", flashcardsRoute);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Fallback error handler — keeps error shape consistent for the frontend
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong." });
});

app.listen(PORT, () => {
  console.log(`The Study Desk is running → http://localhost:${PORT}`);
});
