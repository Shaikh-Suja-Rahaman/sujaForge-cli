# 🤖 SujaForge CLI

An AI-powered conversational CLI agent that intelligently clones the Scaler Academy website (or any website) through multi-step reasoning and dynamic DOM scraping.

Built as an Assignment for Scaler Academy — demonstrating how AI agents can think, plan, and build real websites step by step.

Powered by **Suja Rahaman**

`Node.js` `Gemini` `JavaScript` `Cheerio`

---

## ✨ What It Does

SujaForge is a conversational CLI tool that works like an autonomous web engineering engine right in your terminal:

1. You type a natural language instruction (e.g., "Clone the Scaler Academy website at https://www.scaler.com/")
2. **The agent scrapes** — dynamically visits the URL, parses the live DOM structure, and extracts actual images and layout structure.
3. **The agent thinks** — breaks the task into steps and plans the approach.
4. **The agent acts** — creates folders and files (HTML, CSS, JS) one at a time using safe file tools.
5. **The agent delivers** — opens the finished, responsive website in your browser.

The entire process is visible in the terminal with colored output, animated spinners, and step-by-step reasoning.

## 🏗️ Architecture

```text
sujaforge-cli/
├── index.js        # Main entry — interactive chat loop + agent reasoning + rate limit handling
├── prompts.js      # System prompt with Blue & White design knowledge and scraping rules
├── tools.js        # Tool definitions (generateFile, makeDir, launchInBrowser, scrapeWebsiteLayout)
├── ui.js           # CLI display helpers (chalk, ora, boxen, custom gradients)
├── package.json    # Dependencies and scripts (includes cheerio)
├── .env            # Gemini API keys (not committed)
├── .gitignore      # Ignores node_modules, .env
└── README.md       # This file
```

## 🔄 How the Agent Loop Works

The agent follows a structured reasoning loop inspired by ReAct (Reasoning + Acting):

```text
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│  START  │ ──▶ │  THINK  │ ──▶ │ ACTION  │ ──▶ │ OBSERVE  │ ──▶ │  FINAL  │
│         │     │ (×2-3)  │     │         │     │          │     │         │
│ Confirm │     │ Reason  │     │ Execute │     │ Evaluate │     │ Deliver │
│ request │     │ & plan  │     │  tool   │     │ & learn  │     │ output  │
└─────────┘     └────┬────┘     └─────────┘     └────┬─────┘     └─────────┘
                     │                                │
                     └────────────────────────────────┘
                              (loops back)
```

**Step Types:**
| Step | Purpose | Terminal Display |
| :--- | :--- | :--- |
| ⚡ **START** | Acknowledge the user's request | Sky Blue header |
| 💭 **THINK** | Reason about what to do next | Indigo italic text |
| 🛠️ **ACTION** | Execute a tool (Scrape/File Operations) | Emerald with tool name |
| 📡 **OBSERVE** | See the tool's result | Amber feedback text |
| 🎉 **FINAL** | Final response to the user | Green boxed success message |

## 🛠️ Available Tools

The agent has access to 4 purpose-built tools for safe scraping and file operations:

| Tool | Description |
| :--- | :--- |
| `scrapeWebsiteLayout(url)` | Fetches the target URL, extracts actual images, and strips noise to map the DOM. |
| `generateFile(path, content)` | Safely creates a file with the given generated code content. |
| `makeDir(path)` | Creates a directory (with recursive nested support). |
| `launchInBrowser(path)` | Opens the finalized HTML file in the user's default browser. |

> 💡 **Design Decision:** Instead of giving the agent a generic `executeCommand` tool (which could run destructive scripts), we provide specific, safe file tools. The addition of `scrapeWebsiteLayout` ensures the clone uses real-time layouts and images instead of hallucinating a generic page.

## ⚡ Resilience Features

SujaForge is built for high uptime and production-grade reliability:

**🔁 Round-Robin API Key Pool**
- Supports multiple Gemini API keys via a comma-separated `GEMINI_API_KEYS` env var.
- Cycles through keys on every request to distribute load across quota buckets.

**🛡️ Intelligent Auto-Retry with Exponential Backoff**
- Automatic retries on rate limit errors (429 / quota exceeded).
- Exponential backoff: `5s → 10s → 15s → 20s → 25s → 30s` (capped).
- The agent never crashes from rate limits — it waits patiently and retries! Auth errors fail fast immediately.

**💬 Global Conversation History**
- Chat history is maintained independently from API key rotation, so context seamlessly carries across key switches.

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- A Google Gemini API key from Google AI Studio

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/sujaforge-cli.git
cd sujaforge-cli

# 2. Install dependencies
npm install

# 3. Set your Gemini API key(s)
# Single key:
echo "GEMINI_API_KEYS=your-key-here" > .env

# Multiple keys (for Round-Robin load balancing):
echo "GEMINI_API_KEYS=key1,key2,key3" > .env

# 4. Run the agent
npm start
```

## 🎮 Usage

Once running, type your instruction:

**▶ User:** `Clone the Scaler Academy website at https://www.scaler.com/`

**The agent will:**
1. Scrape the URL to map the live DOM and extract image links.
2. Plan the website directory structure.
3. Create `styles.css` matching the customized **Blue and White** theme.
4. Create `index.html` featuring a Sticky Header, Hero, Highlights Grid, and Footer.
5. Open the final generated result automatically in your browser.

## 🎨 Generated Website Features

The cloned Scaler Academy website is actively mapped against the live site but strictly adheres to a clean, modern **Blue & White** aesthetic:

- **Top Contact Bar** — Royal blue banner with CTA.
- **Sticky Header** — Clean white navbar with logo and navigation.
- **Hero Section** — Sky blue gradient background dynamically integrating images scraped directly from the Scaler website!
- **Course Highlights** — White glassmorphic cards with soft drop-shadows.
- **Responsive Layouts** — Flexbox and CSS grids optimized for desktop and mobile.
- **Micro-interactions** — Smooth `transform: translateY` hover effects on cards and buttons.

## 🧰 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js** | Core Runtime environment |
| **Google Gemini 3.1** | AI reasoning and generation engine |
| **@google/generative-ai** | Official Gemini SDK |
| **Cheerio** | Lightning-fast HTML DOM parser for web scraping |
| **chalk** & **gradient-string** | Colored terminal text and gradient effects |
| **ora** & **boxen** | Animated loading spinners and boxed terminal messages |
| **dotenv** | Environment variable management |

## 🎬 Demo

[Watch the Demo Video](https://youtu.be/1Wm0AslQgVU)


A YouTube demo showcasing the SujaForge CLI running live, scraping the Scaler website, and deploying the customized web clone.

[Watch the Demo →](#)
