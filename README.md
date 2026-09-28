# CodeToContent

> Turn any code snippet or GitHub README into synchronized, audience-ready developer content across Twitter/X, LinkedIn, and Dev.to in seconds.

CodeToContent is a full-stack developer publishing workbench powered by Google Gemini. It analyzes raw code or imported GitHub repositories and produces three distinct formats side by side, following strict developer-first writing rules.

---

## ✨ Features

- **Three Simultaneous Deliverables**:
  - **Twitter / X Thread**: 3–5 connected tweets under 275 characters each, written in a casual developer-to-developer conversational voice.
  - **LinkedIn Post**: Confident, professional engineering post focusing on trade-offs, problem solving, and architectural decisions without salesy hype.
  - **Dev.to Article Intro**: Practical, example-driven opening with title, problem hook, context setup, key takeaways, and tags.
- **GitHub README & Code Importer**:
  - Paste raw snippets in any language (TypeScript, Python, Rust, Go, SQL, etc.).
  - Or enter any GitHub repository URL (`https://github.com/owner/repo`, raw URL, or git clone format) to fetch and parse the README automatically.
- **Strict Writing Rules Engine**:
  - **Zero Em Dashes**: Never uses em dashes (`—`), replacing them with commas, colons, or clean rephrasing.
  - **No AI Clichés or Buzzwords**: Free from corporate filler ("game changer", "in today's world", "leverage", "delve into").
  - **Short, Direct Sentences**: One idea per sentence.
  - **Forbidden Sentence Openers**: Excludes transition crutches ("Additionally", "Furthermore", "Moreover", "In summary").
- **Interactive Editing & Controls**:
  - Live in-place editing for tweets, LinkedIn copy, and Dev.to sections.
  - Real-time word count and Twitter character counters with limit warnings.
  - One-click copying with visual feedback and direct LinkedIn composer launch.
  - Per-channel regeneration buttons to iterate on individual outputs.
- **Developer-Grade UI**:
  - Side-by-side equal-height 3-column layout on desktop, responsive tabbed view on mobile.
  - Dark and light theme switcher with persistent local storage.
  - Pill-shaped tone selector (`Direct`, `Story`, `Deep-Dive`, `Punchy`) and target audience settings (`Developers`, `Senior / Lead`, `Junior / Learners`).
  - Markdown export to download all three generated formats in a single `.md` file.
  - Local history drawer to reload past generations instantly.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Backend**: Node.js, Express, TSX
- **AI Engine**: `@google/genai` TypeScript SDK (Gemini 3.8 Flash with automatic fallback handling)
- **Styling**: Tailwind CSS v4 with dark mode variant support

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/code-to-content.git
   cd code-to-content
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   PORT=3000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── CodeInput.tsx          # Code editor, GitHub fetcher, tone pills & controls
│   │   ├── DevToCard.tsx          # Dev.to article preview, markdown tab & editor
│   │   ├── Header.tsx             # Navigation bar, export, theme toggle & history button
│   │   ├── HistoryModal.tsx       # Saved generations drawer with reload & delete
│   │   ├── LinkedInCard.tsx       # LinkedIn post preview, icon actions & editor
│   │   ├── Toast.tsx              # Contextual toast notification system
│   │   └── TwitterThreadCard.tsx  # Twitter thread step preview, counters & editor
│   ├── data/
│   │   └── presets.ts             # Preloaded sample snippets (JS, Rust, Python, Go, README)
│   ├── App.tsx                    # Root application component & layout state
│   ├── index.css                  # Tailwind CSS imports & custom utilities
│   ├── main.tsx                   # React DOM entry point
│   └── types.ts                   # TypeScript interfaces and type definitions
├── .env.example                   # Template for environment configuration
├── index.html                     # HTML entry point with metadata
├── metadata.json                  # AI Studio applet capabilities and configuration
├── package.json                   # Dependencies and npm scripts
├── server.ts                      # Express API server & Gemini generation logic
└── tsconfig.json                  # TypeScript compiler settings
```

---

## 📡 API Endpoints

### `POST /api/generate`
Generates all three content formats simultaneously from an input snippet or README.
- **Request Body**:
  ```json
  {
    "code": "const memoize = (fn) => ...",
    "tone": "direct",
    "audience": "developers",
    "customInstructions": "Focus on memory safety"
  }
  ```
- **Response**: Returns `{ title, summary, language, twitterThread, linkedinPost, devtoIntro }`.

### `POST /api/regenerate-channel`
Regenerates a single target channel (`twitter`, `linkedin`, or `devto`) while keeping the rest intact.
- **Request Body**:
  ```json
  {
    "channel": "linkedin",
    "code": "const memoize = (fn) => ...",
    "tone": "direct",
    "customInstructions": "Emphasize production concurrency"
  }
  ```

### `POST /api/fetch-github`
Fetches and cleans the `README.md` file from a public GitHub repository.
- **Request Body**:
  ```json
  {
    "url": "https://github.com/facebook/react"
  }
  ```
- **Response**: Returns `{ readme, repo, owner }`.

---

## 📜 Writing Rules Enforced

Every generation is evaluated against strict editorial guidelines:
1. **Never use em dashes**: Replaces em dashes with a comma, colon, or natural sentence break.
2. **Plain human language**: Eliminates corporate buzzwords and filler phrases.
3. **Short and direct**: One idea per sentence.
4. **No forbidden sentence openers**: Never starts with "Additionally", "Furthermore", "Moreover", or "In summary".
5. **Twitter**: Casual and direct, developer to developer.
6. **LinkedIn**: Confident, professional, and practical without promotional hype.
7. **Dev.to**: Technical, example-driven blog post structure with actionable takeaways.

---

## 📦 Build & Deployment

To build the client bundle for production:
```bash
npm run build
```

To run the production server:
```bash
npm start
```

---

## 📄 License

This project is licensed under the Apache-2.0 License.
