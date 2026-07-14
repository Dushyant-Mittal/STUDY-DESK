// ---------- Tab switching ----------
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    panels.forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    document.querySelector(`.panel[data-panel="${tab.dataset.tab}"]`).classList.add("active");
  });
});

// ---------- Helpers ----------
async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function setLoading(el, message) {
  el.innerHTML = `<span class="loading">${message}</span>`;
}

function setError(el, message) {
  el.innerHTML = `<span class="error">⚠ ${escapeHTML(message)}</span>`;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- ASK ----------
const askBtn = document.getElementById("ask-btn");
const askInput = document.getElementById("ask-input");
const askResult = document.getElementById("ask-result");

async function doAsk() {
  const question = askInput.value.trim();
  if (!question) return;
  askBtn.disabled = true;
  setLoading(askResult, "consulting the archives…");
  try {
    const { answer } = await postJSON("/api/ask", { question });
    askResult.textContent = answer;
  } catch (err) {
    setError(askResult, err.message);
  } finally {
    askBtn.disabled = false;
  }
}
askBtn.addEventListener("click", doAsk);
askInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doAsk(); });

// ---------- SUMMARIZE ----------
const summarizeBtn = document.getElementById("summarize-btn");
const summarizeInput = document.getElementById("summarize-input");
const summarizeLength = document.getElementById("summarize-length");
const summarizeResult = document.getElementById("summarize-result");

summarizeBtn.addEventListener("click", async () => {
  const text = summarizeInput.value.trim();
  if (!text) return;
  summarizeBtn.disabled = true;
  setLoading(summarizeResult, "condensing your notes…");
  try {
    const { summary } = await postJSON("/api/summarize", {
      text,
      length: summarizeLength.value,
    });
    summarizeResult.textContent = summary;
  } catch (err) {
    setError(summarizeResult, err.message);
  } finally {
    summarizeBtn.disabled = false;
  }
});

// ---------- QUIZ ----------
const quizBtn = document.getElementById("quiz-btn");
const quizInput = document.getElementById("quiz-input");
const quizCount = document.getElementById("quiz-count");
const quizResult = document.getElementById("quiz-result");

quizBtn.addEventListener("click", async () => {
  const text = quizInput.value.trim();
  if (!text) return;
  quizBtn.disabled = true;
  setLoading(quizResult, "writing the exam…");
  try {
    const { questions } = await postJSON("/api/quiz", {
      text,
      numQuestions: quizCount.value,
    });
    renderQuiz(questions || []);
  } catch (err) {
    setError(quizResult, err.message);
  } finally {
    quizBtn.disabled = false;
  }
});

function renderQuiz(questions) {
  if (!questions.length) {
    quizResult.innerHTML = `<span class="error">No questions were generated. Try again.</span>`;
    return;
  }
  quizResult.innerHTML = "";
  questions.forEach((q, qi) => {
    const wrap = document.createElement("div");
    wrap.className = "quiz-q";
    wrap.innerHTML = `
      <div class="q-text">${qi + 1}. ${escapeHTML(q.question)}</div>
      <div class="options">
        ${q.options.map((opt, oi) => `<label data-index="${oi}">${escapeHTML(opt)}</label>`).join("")}
      </div>
      <div class="explanation">${escapeHTML(q.explanation || "")}</div>
    `;
    wrap.querySelectorAll("label").forEach((label) => {
      label.addEventListener("click", () => {
        if (wrap.classList.contains("answered")) return;
        wrap.classList.add("answered");
        const chosen = parseInt(label.dataset.index, 10);
        wrap.querySelectorAll("label").forEach((l) => {
          const idx = parseInt(l.dataset.index, 10);
          if (idx === q.correctIndex) l.classList.add("correct");
          else if (idx === chosen) l.classList.add("incorrect");
        });
      });
    });
    quizResult.appendChild(wrap);
  });
}

// ---------- FLASHCARDS ----------
const flashcardsBtn = document.getElementById("flashcards-btn");
const flashcardsInput = document.getElementById("flashcards-input");
const flashcardsCount = document.getElementById("flashcards-count");
const flashcardsResult = document.getElementById("flashcards-result");

flashcardsBtn.addEventListener("click", async () => {
  const text = flashcardsInput.value.trim();
  if (!text) return;
  flashcardsBtn.disabled = true;
  setLoading(flashcardsResult, "cutting index cards…");
  try {
    const { cards } = await postJSON("/api/flashcards", {
      text,
      numCards: flashcardsCount.value,
    });
    renderFlashcards(cards || []);
  } catch (err) {
    setError(flashcardsResult, err.message);
  } finally {
    flashcardsBtn.disabled = false;
  }
});

function renderFlashcards(cards) {
  if (!cards.length) {
    flashcardsResult.innerHTML = `<span class="error">No flashcards were generated. Try again.</span>`;
    return;
  }
  const grid = document.createElement("div");
  grid.className = "flash-grid";
  cards.forEach((c) => {
    const card = document.createElement("div");
    card.className = "flashcard";
    card.dataset.flipped = "false";
    card.innerHTML = `<span class="face-label">TERM</span>${escapeHTML(c.front)}`;
    card.addEventListener("click", () => {
      const flipped = card.dataset.flipped === "true";
      card.dataset.flipped = flipped ? "false" : "true";
      card.classList.toggle("flipped");
      card.innerHTML = flipped
        ? `<span class="face-label">TERM</span>${escapeHTML(c.front)}`
        : `<span class="face-label">DEFINITION</span>${escapeHTML(c.back)}`;
    });
    grid.appendChild(card);
  });
  flashcardsResult.innerHTML = "";
  flashcardsResult.appendChild(grid);
}
