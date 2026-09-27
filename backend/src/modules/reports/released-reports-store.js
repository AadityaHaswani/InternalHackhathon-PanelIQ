import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_DIR = path.resolve(__dirname, '../../../.data');
const STORE_FILE = path.join(STORE_DIR, 'released-reports.json');

const memoryStore = new Map();

function initStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf8');
      const data = JSON.parse(content);
      if (typeof data === 'object' && data !== null) {
        for (const [sid, row] of Object.entries(data)) {
          memoryStore.set(sid, row);
        }
      }
    }
  } catch (err) {
    console.warn('[released-reports-store] Error initializing from file:', err.message);
  }
}

function persistStore() {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    const obj = Object.fromEntries(memoryStore.entries());
    fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.warn('[released-reports-store] Error persisting store to file:', err.message);
  }
}

// Initialize on module load
initStore();

/**
 * Persists a certified released report revision for a session.
 *
 * @param {string} sessionId
 * @param {Object} revisionRow
 */
export function saveReleasedReport(sessionId, revisionRow) {
  if (!sessionId || !revisionRow) return;
  memoryStore.set(sessionId, revisionRow);
  persistStore();
}

/**
 * Retrieves the certified released report revision for a session.
 *
 * @param {string} sessionId
 * @returns {Object|null}
 */
export function getReleasedReport(sessionId) {
  if (!sessionId) return null;
  return memoryStore.get(sessionId) || null;
}

/**
 * Checks whether a session has a certified released report.
 *
 * @param {string} sessionId
 * @returns {boolean}
 */
export function isReportReleased(sessionId) {
  if (!sessionId) return false;
  return memoryStore.has(sessionId);
}

/**
 * Returns all released session IDs.
 *
 * @returns {string[]}
 */
export function getAllReleasedSessionIds() {
  return [...memoryStore.keys()];
}

/**
 * Clears memory store (used in tests).
 */
export function clearReleasedReports() {
  memoryStore.clear();
}
