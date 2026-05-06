/**
 * ui.js — Console UI Framework for SujaForge
 * 
 * Copyright (c) 2026 Suja Rahaman. All rights reserved.
 * 
 * Renders beautiful gradients, status steps, and text wrappers.
 * 
 * @author Suja Rahaman
 * @project SujaForge CLI
 */

import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";
import gradient from "gradient-string";

// ─── Visual Palette ──────────────────────────────────────────────────────────

const palette = {
  primary: chalk.hex("#2563EB"),     // Royal Blue
  startup: chalk.hex("#38BDF8"),     // Sky Blue
  cogitate: chalk.hex("#818CF8"),    // Indigo
  execute: chalk.hex("#34D399"),     // Emerald
  feedback: chalk.hex("#FBBF24"),    // Amber
  closure: chalk.hex("#10B981"),     // Green
  fault: chalk.hex("#EF4444"),       // Red
  muted: chalk.hex("#94A3B8"),       // Slate
  accent: chalk.hex("#60A5FA"),      // Blue 400
  light: chalk.hex("#F8FAFC"),       // Slate 50
  notice: chalk.hex("#2DD4BF"),      // Teal
};

// ─── Gradients ───────────────────────────────────────────────────────────────

const heroGradient = gradient(["#0ea5e9", "#2563eb", "#4f46e5"]);

// ─── Loading State ───────────────────────────────────────────────────────────

let activeSpinner = null;

// ─── Event Step Configurations ───────────────────────────────────────────────

const EVENT_META = {
  START: { icon: "⚡", color: palette.startup, text: "Initializing task..." },
  THINK: { icon: "💭", color: palette.cogitate, text: "Processing logic..." },
  ACTION: { icon: "🛠️ ", color: palette.execute, text: "Performing operation..." },
  OBSERVE: { icon: "📡", color: palette.feedback, text: "System feedback" },
  FINAL: { icon: "🎉", color: palette.closure, text: "Operation Successful!" },
};

/**
 * Renders the SujaForge CLI header.
 */
export function renderStartupScreen() {
  const headerText = heroGradient.multiline([
    "                                                                    ",
    "   ███████╗██╗   ██╗    ██╗ █████╗ ███████╗██████╗ ██████╗  ██████╗ ███████╗",
    "   ██╔════╝██║   ██║    ██║██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝",
    "   ███████╗██║   ██║    ██║███████║█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  ",
    "   ╚════██║██║   ██║    ██║██╔══██║██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  ",
    "   ███████║╚██████╔╝██╗ ██║██║  ██║██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗",
    "   ╚══════╝ ╚═════╝ ╚═╝ ╚═╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝",
    "                                                                    ",
  ].join("\n"));

  console.log("\n" + headerText);

  const introCard = boxen(
    palette.light("  ✨  Intelligent Web Engineering Engine  \n\n") +
    palette.muted("  Submit natural language instructions to construct  \n") +
    palette.muted("  modern, responsive web applications dynamically.  \n\n") +
    palette.accent("  Developed for Scaler Academy  ") + palette.muted(" • ") +
    palette.accent("  Created by Suja Rahaman  "),
    {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 4, right: 4 },
      borderStyle: "round",
      borderColor: "#2563EB",
    }
  );

  console.log(introCard);
}

/**
 * Displays active model configuration.
 */
export function renderSysConfig(llmName, totalKeys) {
  const vNode = process.version;
  const configString = [
    palette.muted("    ┌─ "),
    palette.notice("⚙ "),
    palette.muted("Engine: ") + palette.light(llmName),
    palette.muted("  │  "),
    palette.muted("Env: Node ") + palette.light(vNode),
    palette.muted(" ─┐"),
  ].join("");

  console.log(configString);
  console.log(
    palette.muted("    └────────────────────────────────────────────────────────────┘\n")
  );

  console.log(
    palette.muted("    💡 Suggestion: ") +
    palette.accent.bold('"Clone the Scaler Academy website"') +
    palette.muted("  or type  ") +
    palette.light.bold('"help"') +
    palette.muted(" \n")
  );
}

/**
 * Displays manual help docs.
 */
export function renderHelpMenu() {
  const content =
    palette.light.bold("  📖 SujaForge Manual\n\n") +
    palette.accent("  clone <target>") + palette.muted("  — Generate a clone of a target URL/concept\n") +
    palette.accent("  build <desc>") + palette.muted("    — Scaffold a fresh site based on description\n") +
    palette.accent("  help") + palette.muted("            — View manual\n") +
    palette.accent("  clear") + palette.muted("           — Refresh terminal view\n") +
    palette.accent("  exit / quit") + palette.muted("     — Terminate SujaForge\n\n") +

    palette.light.bold("  💡 Example Directives\n\n") +
    palette.muted('  • "Clone the Scaler Academy website"\n') +
    palette.muted('  • "Create a sleek real estate landing page"\n');

  const containerBox = boxen(content, {
    padding: 1,
    margin: { top: 0, bottom: 1, left: 3, right: 3 },
    borderStyle: "round",
    borderColor: "#38BDF8",
    title: "HELP MANUAL",
    titleAlignment: "center",
  });

  console.log(containerBox);
}

/**
 * Returns prompt formatting.
 */
export function generatePromptToken() {
  return palette.primary("  ▶ User: ");
}

/**
 * Common formatter for workflow headers.
 */
function buildHeader(type, id) {
  const conf = EVENT_META[type] || EVENT_META.THINK;
  const iterationToken = id ? palette.muted(` [Phase ${id}]`) : "";
  return conf.color(` ${conf.icon} `) + conf.color.bold(`[${type}]`) + iterationToken + palette.muted(` ${conf.text}`);
}

export function renderStartStep(text, id) {
  console.log();
  console.log(buildHeader("START", id));
  console.log(palette.muted("     │"));
  console.log(palette.muted("     │  ") + palette.light(textWrap(text, 65)));
  console.log(palette.muted("     │"));
}

export function renderThinkStep(text, id) {
  console.log(buildHeader("THINK", id));
  console.log(palette.muted("     │"));
  console.log(palette.muted("     │  ") + chalk.italic(palette.cogitate(textWrap(text, 65))));
  console.log(palette.muted("     │"));
}

export function renderActionStep(cmdName, cmdArgs, id) {
  console.log(buildHeader("ACTION", id));
  console.log(palette.muted("     │"));
  console.log(palette.muted("     │  → ") + palette.execute.bold(cmdName) + palette.muted("(") + palette.accent(textTrim(formatPayload(cmdArgs), 80)) + palette.muted(")"));
}

export function renderActionFeedback(isOk, msg) {
  if (isOk) {
    console.log(palette.muted("     │  ") + palette.closure("✓ ") + palette.muted(msg));
  } else {
    console.log(palette.muted("     │  ") + palette.fault("✗ ") + palette.fault(msg));
  }
  console.log(palette.muted("     │"));
}

export function renderObserveStep(text) {
  console.log(palette.feedback("  📡  ") + palette.feedback.bold("[OBSERVE]") + palette.muted(" System response"));
  console.log(palette.muted("     │"));
  console.log(palette.muted("     │  ") + palette.feedback(textWrap(textTrim(text, 150), 65)));
  console.log(palette.muted("     │"));
}

export function renderFinalStep(text) {
  console.log();
  const box = boxen(
    palette.closure.bold("  🎉 Operation Successful!\n\n") +
    palette.light(textWrap(text, 55)),
    {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 3, right: 3 },
      borderStyle: "round",
      borderColor: "#10B981",
      title: "FINAL",
      titleAlignment: "center",
    }
  );
  console.log(box);
}

export function renderReportMetrics(metrics) {
  const duration = ((Date.now() - metrics.timestamp) / 1000).toFixed(1);
  const artifacts = metrics.generatedFiles.map(f => {
    return palette.muted("     • ") + palette.light(f.uri) + palette.muted(` (${f.sizeBytes})`);
  }).join("\n");

  const report =
    palette.notice.bold("  📊 Task Metrics\n\n") +
    palette.muted("  ⏱  Duration:        ") + palette.light(`${duration}s\n`) +
    palette.muted("  🔄 Phases Executed: ") + palette.light(`${metrics.phaseCount}\n`) +
    palette.muted("  📁 Artifacts Built: ") + palette.light(`${metrics.generatedFiles.length}\n`) +
    (metrics.generatedFiles.length > 0 ? "\n" + artifacts + "\n" : "");

  const box = boxen(report, {
    padding: 1,
    margin: { top: 0, bottom: 0, left: 3, right: 3 },
    borderStyle: "round",
    borderColor: "#2DD4BF",
    title: "METRICS",
    titleAlignment: "center",
  });
  console.log(box);
}

export function renderFault(msg) {
  console.log();
  console.log(palette.fault("  ❌ ") + palette.fault.bold("Fault: ") + palette.fault(msg));
  console.log();
}

export function renderBackoffWarning(tryCount, limit, wait) {
  const ratio = Math.round((tryCount / limit) * 10);
  const remain = 10 - ratio;
  const viz = palette.feedback("█".repeat(ratio)) + palette.muted("░".repeat(remain));
  return `⏳ API Throttle. Resuming in ${wait}s... [${viz}] (${tryCount}/${limit})`;
}

export function triggerLoader(msg = "SujaForge is reasoning...") {
  activeSpinner = ora({
    text: palette.muted(msg),
    spinner: "dots12",
    color: "blue",
    indent: 5,
  }).start();
  return activeSpinner;
}

export function haltLoader() {
  if (activeSpinner) {
    activeSpinner.stop();
    activeSpinner = null;
  }
}

export function renderDivider() {
  console.log(
    palette.muted("\n    ─────────────────────────────────────────────────────────\n")
  );
}

export function renderTermination() {
  console.log();
  const box = boxen(
    heroGradient("  Thank you for building with SujaForge!  \n\n") +
    palette.muted("  Engineered with ❤️  for Scaler Academy  \n") +
    palette.accent("  Created by Suja Rahaman  "),
    {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 4, right: 4 },
      borderStyle: "round",
      borderColor: "#2563EB",
    }
  );
  console.log(box);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function textWrap(text, width) {
  if (!text) return "";
  const parts = text.split(" ");
  let ln = "";
  let res = "";

  for (const p of parts) {
    if ((ln + p).length > width) {
      res += ln.trim() + "\n     │  ";
      ln = "";
    }
    ln += p + " ";
  }
  res += ln.trim();
  return res;
}

function textTrim(text, limit) {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.substring(0, limit - 3) + "...";
}

function formatPayload(payload) {
  if (!payload) return "";
  if (typeof payload === "string") return `"${payload}"`;
  if (typeof payload === "object") {
    return JSON.stringify(payload);
  }
  return String(payload);
}
