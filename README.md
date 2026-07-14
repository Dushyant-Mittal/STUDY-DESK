# The Study Desk

An AI research assistant with four tools — *Ask*, *Summarize*, *Quiz Me*, and *Flashcards* —
powered by Google Gemini, styled as a vintage card-catalog.

```
study-desk/
├── server.js              # Express app entry point
├── package.json
├── .env.example            # copy → .env and add your own key
├── services/
│   └── gemini.js           # wraps calls to the Gemini API
├── routes/
│   ├── ask.js
│   ├── summarize.js
│   ├── quiz.js
│   └── flashcards.js
└── public/                 # frontend (served statically by Express)
    ├── index.html
    ├── style.css
    └── script.js
```

---

## ⚠️ About the API key

1. Go to *https://aistudio.google.com/app/apikey*
2. Delete/regenerate that key.
3. Create a fresh key and keep it only in your local `.env` file (never in code, never committed to git).

---

## Prerequisites

- **Node.js 18 or newer** (needed for built-in `fetch`). Check with:
  ```bash
  node -v
  ```
  If you don't have it, download it from https://nodejs.org (LTS version).

---

## Step-by-step setup (Windows / your laptop)

### 1. Unzip the project
Unzip `study-desk.zip` somewhere convenient, e.g. `C:\Users\301731\Documents\study-desk`.

### 2. Open a terminal in that folder
In File Explorer, open the `study-desk` folder, click the address bar, type `cmd`, press Enter.
(Or right-click inside the folder → "Open in Terminal".)

### 3. Install dependencies
```bash
npm install
```
This downloads Express, dotenv, and cors into a `node_modules` folder.

### 4. Create your `.env` file
Copy the example file:
```bash
copy .env.example .env
```
(On Mac/Linux use `cp .env.example .env` instead.)

Open `.env` in Notepad and paste your *new* Gemini key:
```
GEMINI_API_KEY=your_new_key_here
PORT=3000
GEMINI_MODEL=gemini-2.0-flash
```

### 5. Start the server
```bash
npm start
```
You should see:
```
The Study Desk is running → http://localhost:3000
```

### 6. Open it in your browser
Go to *http://localhost:3000*

You now have a working app — type a question under *ASK*, paste notes under
*SUMMARIZE*, or generate a quiz/flashcards from any block of text.

---

## How it works

- The *frontend* (`public/`) is plain HTML/CSS/JS — no build step, no framework.
- It calls your own backend at `/api/ask`, `/api/summarize`, `/api/quiz`, `/api/flashcards`.
- The *backend* (Express) holds your Gemini API key server-side and forwards requests to
  Google's Generative Language API (`services/gemini.js`), so the key is never exposed to
  the browser.
- Quiz and Flashcards ask Gemini to return structured JSON, which the backend parses and the
  frontend renders as interactive UI (click an answer to check it; click a flashcard to flip it).

## Troubleshooting

| Problem | Fix |
|---|---|
| `Missing GEMINI_API_KEY` error in the browser | You didn't fill in `.env`, or forgot to restart `npm start` after editing it |
| `Gemini API error (401...)` | Your key is invalid/revoked — generate a new one |
| `npm install` fails | Make sure you're using Node 18+ (`node -v`) |
| Port 3000 already in use | Change `PORT=3000` to something else (e.g. `3001`) in `.env` |

## Customizing

- Change the model in `.env` (`GEMINI_MODEL=`) if you want to try a different Gemini model.
- Colors/fonts are all defined as CSS variables at the top of `public/style.css`.
- Number of quiz questions / flashcards is adjustable in the UI (1–15 and 1–20 respectively).
