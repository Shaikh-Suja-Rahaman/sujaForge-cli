# SujaForge CLI

An AI-powered conversational CLI agent built by **Suja Rahaman**. This interactive terminal application utilizes Google Gemini to process natural language instructions, perform intelligent reasoning loops, and automatically generate fully functional websites on your local machine.

## Overview

The SujaForge CLI implements an agentic loop pattern (`START → THINK → TOOL → OBSERVE → OUTPUT`) allowing the LLM to write multi-file projects systematically. You can chat with the AI directly, instruct it to build websites like a Scaler Academy clone, and watch it reason, construct folders, write HTML/CSS/JS, and open the result in your browser.

## Getting Started

1. Set up your environment variables by creating a `.env` file at the root of the project:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the CLI:
   ```bash
   npm start
   ```

## Features

- **Interactive CLI UI**: Beautiful gradient headers, custom chalk-colored console logs, and step-by-step progress tracking.
- **Autonomous File Writing**: The AI can generate recursive folders, write stylesheets, html, and script files via sandboxed tools.
- **Robust Tool Handling**: Includes automatic fallback handling for malformed JSON or markdown code block wrapper issues from the LLM.
- **Auto Browser Launch**: Automatically opens the generated HTML outputs upon task completion.

## Disclaimer

Built by Suja Rahaman for web development generation workflows.
