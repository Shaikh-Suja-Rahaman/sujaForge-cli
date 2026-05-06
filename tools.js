/**
 * tools.js — Core Actions for SujaForge AI
 * 
 * Copyright (c) 2026 Suja Rahaman. All rights reserved.
 * 
 * Provides file system manipulation tools for the CLI agent:
 * - generateFile: Writes a file to disk
 * - makeDir: Ensures a folder path exists
 * - launchInBrowser: Displays the built website
 * 
 * @author Suja Rahaman
 * @project SujaForge CLI
 */

import { writeFileSync, mkdirSync, existsSync, statSync } from "fs";
import { exec } from "child_process";
import { resolve, dirname } from "path";

// ─── Defined Actions ────────────────────────────────────────────────────────

/**
 * Registry mapping tool names to execution handlers
 */
export const actionHandlers = {
  generateFile,
  makeDir,
  launchInBrowser,
};

/**
 * System prompt tool documentation
 */
export const toolDocumentation = `
  Available Operations:
  
  1. generateFile(targetPath, fileContent)
     - Writes fileContent to the destination targetPath.
     - targetPath: string (e.g. "dist/index.html")
     - fileContent: string (entire source code)
     - Automatically provisions parent directories.
     - Returns a success string with file size.
  
  2. makeDir(folderPath)
     - Provisions a directory structure at folderPath.
     - folderPath: string (e.g. "dist/assets")
     - Fully recursive.
     - Returns a status confirmation.
  
  3. launchInBrowser(filePath)
     - Triggers the OS default web browser to view the HTML file.
     - filePath: string (e.g. "dist/index.html")
     - Returns status confirmation.
`;

// ─── Implementation ──────────────────────────────────────────────────────────

/**
 * Writes content to a path, auto-creating folders.
 * @param {string} targetPath 
 * @param {string} fileContent 
 * @returns {string} Status update
 */
function generateFile(targetPath, fileContent) {
  try {
    const fullPath = resolve(process.cwd(), targetPath);
    const parentFolder = dirname(fullPath);

    if (!existsSync(parentFolder)) {
      mkdirSync(parentFolder, { recursive: true });
    }

    writeFileSync(fullPath, fileContent, "utf-8");

    const fileMeta = statSync(fullPath);
    const sizeInKB = (fileMeta.size / 1024).toFixed(1);

    return `Success: Wrote to ${targetPath} (${sizeInKB} KB)`;
  } catch (error) {
    return `Failure while writing ${targetPath}: ${error.message}`;
  }
}

/**
 * Provisions a directory.
 * @param {string} folderPath 
 * @returns {string} Status update
 */
function makeDir(folderPath) {
  try {
    const fullPath = resolve(process.cwd(), folderPath);

    if (existsSync(fullPath)) {
      return `Info: Folder already exists at ${folderPath}`;
    }

    mkdirSync(fullPath, { recursive: true });
    return `Success: Created folder ${folderPath}`;
  } catch (error) {
    return `Failure while creating folder ${folderPath}: ${error.message}`;
  }
}

/**
 * Opens HTML in default OS browser.
 * @param {string} filePath 
 * @returns {Promise<string>} Status update
 */
function launchInBrowser(filePath) {
  return new Promise((resolveCb) => {
    try {
      const fullPath = resolve(process.cwd(), filePath);

      if (!existsSync(fullPath)) {
        resolveCb(`Error: Cannot find file at ${filePath}`);
        return;
      }

      const osPlatform = process.platform;
      let executeCmd;

      if (osPlatform === "win32") {
        executeCmd = `start "" "${fullPath}"`;
      } else if (osPlatform === "darwin") {
        executeCmd = `open "${fullPath}"`;
      } else {
        executeCmd = `xdg-open "${fullPath}"`;
      }

      exec(executeCmd, (err) => {
        if (err) {
          resolveCb(`Failed to launch browser: ${err.message}`);
        } else {
          resolveCb(`Launched ${filePath} in default browser successfully.`);
        }
      });
    } catch (error) {
      resolveCb(`Error opening: ${error.message}`);
    }
  });
}

/**
 * Executes a defined tool dynamically.
 * @param {string} toolName 
 * @param {*} toolData 
 * @returns {Promise<string>} Tool response
 */
export async function performAction(toolName, toolData) {
  const handlerFn = actionHandlers[toolName];

  if (!handlerFn) {
    return `Error: Tool "${toolName}" is not registered. Valid tools: ${Object.keys(actionHandlers).join(", ")}`;
  }

  try {
    if (typeof toolData === "object" && toolData !== null) {
      if (toolData.targetPath && toolData.fileContent !== undefined) {
        return await handlerFn(toolData.targetPath, toolData.fileContent);
      }
      if (toolData.targetPath) {
        return await handlerFn(toolData.targetPath);
      }
      if (toolData.folderPath) {
        return await handlerFn(toolData.folderPath);
      }
      // Provide object values mapped to arguments
      const argValues = Object.values(toolData);
      return await handlerFn(...argValues);
    }

    return await handlerFn(toolData);
  } catch (error) {
    return `Error running ${toolName}: ${error.message}`;
  }
}
