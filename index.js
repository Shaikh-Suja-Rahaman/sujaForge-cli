/**
 * index.js — Core Entry Point for SujaForge AI
 * 
 * Copyright (c) 2026 Suja Rahaman. All rights reserved.
 * 
 * Orchestrates the application flow:
 * 1. Bootstraps CLI and displays welcome header
 * 2. Processes natural language input
 * 3. Communicates with Google Gemini using robust JSON parsing
 * 4. Executes reasoning loops: START → THINK → ACTION → OBSERVE → FINAL
 * 
 * @author Suja Rahaman
 * @project SujaForge CLI
 * @version 1.0.0
 */

import "dotenv/config";
import dns from "dns";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";
import readline from "readline";

// Alleviate Windows Node DNS issues
dns.setDefaultResultOrder("ipv4first");

import { CORE_PROMPT } from "./prompts.js";
import { performAction } from "./tools.js";
import {
  renderStartupScreen,
  renderSysConfig,
  renderHelpMenu,
  generatePromptToken,
  renderStartStep,
  renderThinkStep,
  renderActionStep,
  renderActionFeedback,
  renderObserveStep,
  renderFinalStep,
  renderReportMetrics,
  renderFault,
  renderBackoffWarning,
  triggerLoader,
  haltLoader,
  renderDivider,
  renderTermination,
} from "./ui.js";

// ─── AI Configuration ────────────────────────────────────────────────────────

const AI_MODEL_VERSION = "gemini-3.1-flash-lite-preview";

// Setup API keys (handles comma separated list for rotation)
const keyEnv = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
if (!keyEnv) {
  console.error("Critical: Provide GEMINI_API_KEYS inside your .env configuration.");
  process.exit(1);
}

const keyPool = keyEnv.split(",").map(k => k.trim());
let activeKeyCursor = 0;

// Persistent memory module
let sessionMemory = [];

// ─── Input Handling ──────────────────────────────────────────────────────────

const ioClient = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Awaits CLI input.
 * @returns {Promise<string>}
 */
function promptUser() {
  return new Promise((resolve) => {
    ioClient.question(generatePromptToken(), (reply) => {
      resolve(reply.trim());
    });
  });
}

// ─── Resilient Parsing Logic ─────────────────────────────────────────────────

/**
 * Decodes AI output JSON securely.
 * @param {string} payload 
 * @returns {object|null}
 */
function extractJsonCommand(payload) {
  if (!payload) return null;

  try {
    return JSON.parse(payload);
  } catch (e) {
    // Attempt rescue mechanisms
  }

  const mdCodeMatch = payload.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (mdCodeMatch) {
    try { return JSON.parse(mdCodeMatch[1].trim()); } catch (e) {}
  }

  const rawJsonMatch = payload.match(/\{[\s\S]*\}/);
  if (rawJsonMatch) {
    try { return JSON.parse(rawJsonMatch[0]); } catch (e) {}
  }

  try {
    const sanitized = payload
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/'/g, '"');
    const match = sanitized.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) {}

  return null;
}

// ─── Agent State Machine ─────────────────────────────────────────────────────

/**
 * Handles an objective from the user through completion.
 * @param {string} userObjective 
 */
async function handleUserTask(userObjective) {
  let activePayload = userObjective;
  const MAX_LOOPS = 30;
  let phaseCursor = 0;

  const jobMetrics = {
    timestamp: Date.now(),
    phaseCount: 0,
    apiHits: 0,
    generatedFiles: [],
  };

  while (phaseCursor < MAX_LOOPS) {
    phaseCursor++;
    jobMetrics.phaseCount = phaseCursor;

    const loader = triggerLoader("SujaForge is reasoning...");
    
    // Prevent strict rate limits
    await new Promise((r) => setTimeout(r, 4000));

    let llmResponse;
    const RETRY_LIMIT = 10;

    for (let tryIdx = 1; tryIdx <= RETRY_LIMIT; tryIdx++) {
      try {
        const selectedKey = keyPool[activeKeyCursor];
        activeKeyCursor = (activeKeyCursor + 1) % keyPool.length;

        haltLoader();
        triggerLoader(`SujaForge is reasoning...`);

        const genAiInstance = new GoogleGenerativeAI(selectedKey, { customFetch: fetch });
        const engine = genAiInstance.getGenerativeModel({
          model: AI_MODEL_VERSION,
          systemInstruction: CORE_PROMPT
        });

        const chatContext = engine.startChat({
          history: JSON.parse(JSON.stringify(sessionMemory)),
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
        });

        const resultObj = await chatContext.sendMessage(activePayload);
        llmResponse = resultObj.response;

        sessionMemory.push({ role: "user", parts: [{ text: activePayload }] });
        sessionMemory.push({ role: "model", parts: [{ text: llmResponse.text() }] });

        jobMetrics.apiHits++;
        break; 
      } catch (issue) {
        const errStr = issue.message;
        const isQuota = errStr.includes("429") || errStr.includes("quota") || errStr.includes("RESOURCE_EXHAUSTED");
        const isAuth = errStr.includes("API key") || errStr.includes("403") || errStr.includes("401");

        if (isAuth) {
          haltLoader();
          renderFault("Authentication blocked. Validate your .env key.");
          return;
        }

        if (isQuota && tryIdx < RETRY_LIMIT) {
          const sleepDur = Math.min(tryIdx * 5, 30);
          haltLoader();
          triggerLoader(renderBackoffWarning(tryIdx, RETRY_LIMIT, sleepDur));
          await new Promise((r) => setTimeout(r, sleepDur * 1000));
          continue;
        }

        if (tryIdx === RETRY_LIMIT) {
          haltLoader();
          renderFault(`Execution blocked: ${errStr}`);
          return;
        }

        const standardWait = tryIdx * 2000;
        haltLoader();
        triggerLoader(`Standby for ${standardWait / 1000}s...`);
        await new Promise((r) => setTimeout(r, standardWait));
      }
    }

    haltLoader();

    const outputText = llmResponse?.text();
    if (!outputText) {
      renderFault("Data drop detected. Requesting correction.");
      activePayload = JSON.stringify({ step: "OBSERVE", content: "Previous payload was blank. Reply with JSON." });
      continue;
    }

    const commandObj = extractJsonCommand(outputText);
    if (!commandObj || !commandObj.step) {
      renderFault("Structural mismatch. Requesting JSON compliance.");
      activePayload = JSON.stringify({
        step: "OBSERVE",
        content: "Format invalid. You must output exactly one JSON object with a 'step' parameter."
      });
      continue;
    }

    // ── Execute Step ──

    if (commandObj.step === "START") {
      renderStartStep(commandObj.content, phaseCursor);
      activePayload = "Proceed to the next step.";
    }

    else if (commandObj.step === "THINK") {
      renderThinkStep(commandObj.content, phaseCursor);
      activePayload = "Proceed to the next step.";
    }

    else if (commandObj.step === "ACTION") {
      const toolRef = commandObj.tool_name;
      const toolParams = commandObj.tool_data;

      renderActionStep(toolRef, toolParams, phaseCursor);

      triggerLoader(`Processing ${toolRef}...`);
      const operationFeedback = await performAction(toolRef, toolParams);
      haltLoader();

      // Log files to metrics
      if (toolRef === "generateFile" && !operationFeedback.startsWith("Error") && !operationFeedback.startsWith("Failure")) {
        const sizeExtraction = operationFeedback.match(/\(([^)]+)\)/);
        jobMetrics.generatedFiles.push({
          uri: toolParams.targetPath || "unknown",
          sizeBytes: sizeExtraction ? sizeExtraction[1] : "unknown",
        });
      }

      const wasSuccessful = !(operationFeedback.startsWith("Error") || operationFeedback.startsWith("Failure"));
      renderActionFeedback(wasSuccessful, operationFeedback);
      renderObserveStep(operationFeedback);

      activePayload = JSON.stringify({
        step: "OBSERVE",
        content: operationFeedback,
      });
    }

    else if (commandObj.step === "FINAL") {
      renderFinalStep(commandObj.content);
      renderReportMetrics(jobMetrics);
      return;
    }

    else {
      renderFault(`Unrecognized command phase: "${commandObj.step}"`);
      activePayload = JSON.stringify({
        step: "OBSERVE",
        content: `Unrecognized phase "${commandObj.step}". Permitted phases: START, THINK, ACTION, FINAL.`,
      });
    }
  }

  renderFault(`Threshold reached: ${MAX_LOOPS} maximum loops. Execution halted.`);
}

// ─── Lifecycle Application Launcher ────────────────────────────────────────────

async function bootstrap() {
  renderStartupScreen();
  renderSysConfig(AI_MODEL_VERSION, keyPool.length);

  while (true) {
    const userInput = await promptUser();

    if (!userInput) continue;

    const lowerInput = userInput.toLowerCase();
    if (["exit", "quit", "q"].includes(lowerInput)) {
      renderTermination();
      ioClient.close();
      process.exit(0);
    }

    if (lowerInput === "help") {
      renderHelpMenu();
      continue;
    }

    if (lowerInput === "clear") {
      console.clear();
      renderStartupScreen();
      renderSysConfig(AI_MODEL_VERSION, keyPool.length);
      continue;
    }

    await handleUserTask(userInput);
    renderDivider();
  }
}

// ─── Initialization ────────────────────────────────────────────────────────────

bootstrap().catch((criticalErr) => {
  renderFault(`Kernel panic: ${criticalErr.message}`);
  process.exit(1);
});
