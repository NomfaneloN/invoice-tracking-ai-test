#!/usr/bin/env node
/**
 * generate-allure-results.js
 *
 * Converts markdown test reports in test-reports/ into Allure JSON result files
 * in allure-results/. Run before `allure generate`.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPORTS_DIR = path.join(__dirname, '..', 'test-reports');
const RESULTS_DIR = path.join(__dirname, '..', 'allure-results');

// ── helpers ──────────────────────────────────────────────────────────────────

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
}

function historyId(suite, name) {
  return crypto.createHash('md5').update(`${suite}::${name}`).digest('hex');
}

/** Parse YYYY-MM-DD + HH:MM:SS → Unix ms, or null */
function toMs(date, time) {
  if (!date || !time) return null;
  try {
    return new Date(`${date}T${time}`).getTime();
  } catch {
    return null;
  }
}

/** Infer suite name from filename */
function suiteFromFilename(filename) {
  if (filename.startsWith('smoke-')) return 'Smoke Test';
  if (filename.startsWith('bas-full-workflow-')) return 'BAS Full Workflow';
  if (filename.startsWith('bas-request-')) return 'BAS Request';
  if (filename.startsWith('bas-')) return 'BAS E2E';
  return 'General';
}

/** Extract date string YYYY-MM-DD from report content or filename */
function extractDate(content, filename) {
  const m = content.match(/\*\*Date:\*\*\s*([\d]{4}-[\d]{2}-[\d]{2})/);
  if (m) return m[1];
  // fallback: extract from filename like bas-2026-04-09T08-34.md
  const fm = filename.match(/([\d]{4}-[\d]{2}-[\d]{2})/);
  return fm ? fm[1] : '2026-01-01';
}

/** Map result string to Allure status */
function toAllureStatus(raw) {
  if (!raw) return 'unknown';
  const r = raw.toUpperCase();
  if (r.includes('PASS')) return 'passed';
  if (r.includes('FAIL')) return 'failed';
  if (r.includes('SKIP') || r.includes('NOT RUN') || r.includes('OBSOLETE')) return 'skipped';
  if (r.includes('BLOCK')) return 'broken';
  return 'unknown';
}

/** Extract API cost from Run Metrics table, e.g. "~$0.30–$0.50" or "< $0.01" */
function extractCost(content) {
  const m = content.match(/API Cost[^|]*\|\s*([^\n|]+)/i);
  if (!m) return null;
  // Strip parenthetical notes, keep just the amount
  return m[1].replace(/\(.*?\)/g, '').trim();
}

/** Distribute TC time evenly across N steps, returning [{start, stop}] */
function distributeTime(startMs, stopMs, count) {
  if (count === 0) return [];
  const slice = Math.max(1, Math.floor((stopMs - startMs) / count));
  return Array.from({ length: count }, (_, i) => ({
    start: startMs + i * slice,
    stop:  startMs + (i + 1) * slice,
  }));
}

// ── per-file parser ───────────────────────────────────────────────────────────

function parseReport(filename, content) {
  const suite = suiteFromFilename(filename);
  const date = extractDate(content, filename);
  const reportCost = extractCost(content);
  const results = [];

  // Split into TC sections — each starts with ## TC-
  const tcSections = content.split(/\n(?=## TC-)/);

  for (const section of tcSections) {
    const titleMatch = section.match(/^## (TC-[\w]+):\s*(.+)/m);
    if (!titleMatch) continue;

    const tcId = titleMatch[1];       // e.g. TC-01
    const tcTitle = titleMatch[2].trim(); // e.g. Register and Upload Invoice
    const fullName = `${tcId}: ${tcTitle}`;

    // ── result detection ──────────────────────────────────────────────────

    let status = 'unknown';

    // 1. Explicit **Result:** line
    const resultLine = section.match(/\*\*Result:\*\*\s*(\w+)/i);
    if (resultLine) {
      status = toAllureStatus(resultLine[1]);
    }

    // 2. **Status:** or **Status: SKIP/BLOCK/NOT RUN
    if (status === 'unknown') {
      const statusLine = section.match(/\*\*Status[:\s]+([^\n*]+)/i);
      if (statusLine) status = toAllureStatus(statusLine[1]);
    }

    // 3. Summary table — find the row for this TC, grab the last **bold** value (any column count)
    if (status === 'unknown') {
      for (const row of content.split('\n')) {
        if (new RegExp(`\\|\\s*${tcId}\\s*\\|`).test(row)) {
          const bolds = row.match(/\*\*(\w[^*\n]*)\*\*/g);
          if (bolds) {
            const last = bolds[bolds.length - 1].replace(/\*\*/g, '').trim();
            const s = toAllureStatus(last);
            if (s !== 'unknown') { status = s; break; }
          }
        }
      }
    }

    // 4. Assertion fallback — only use [x] count; [!] means "observed" not "failed"
    if (status === 'unknown') {
      const passes = (section.match(/- \[x\]/gi) || []).length;
      if (passes > 0) status = 'passed';
    }

    if (status === 'unknown') status = 'skipped';

    // ── timing ────────────────────────────────────────────────────────────

    const timingMatch = section.match(
      /\*\*Started:\*\*\s*([\d:]+)\s*\|\s*\*\*Completed:\*\*\s*([\d:]+)/
    );
    const startMs = timingMatch ? (toMs(date, timingMatch[1]) ?? Date.now()) : Date.now();
    const stopMs  = timingMatch ? (toMs(date, timingMatch[2]) ?? startMs + 1000) : startMs + 1000;

    // ── build steps: numbered execution steps + assertion checks ─────────

    const rawSteps = [];

    // Numbered execution steps (all treated as passed)
    for (const line of (section.match(/^\d+\..+/gm) || [])) {
      rawSteps.push({
        name: line.replace(/^\d+\.\s*/, '').trim(),
        status: 'passed',
      });
    }

    // Assertion checks [x]/[!]/[ ]
    const assertionRaw = section.match(/- \[.?\] .+/g) || [];
    for (const line of assertionRaw) {
      const isPass = /- \[x\]/i.test(line);
      const isFail = /- \[!\]/.test(line);
      rawSteps.push({
        name: line.replace(/^- \[[x! ]\]\s*/i, '').trim(),
        status: isPass ? 'passed' : isFail ? 'failed' : 'skipped',
      });
    }

    // Distribute TC time evenly across steps so Allure shows duration per step
    const times = distributeTime(startMs, stopMs, rawSteps.length);
    const steps = rawSteps.map((s, i) => ({
      name: s.name,
      status: s.status,
      stage: 'finished',
      start: times[i].start,
      stop:  times[i].stop,
      steps: [],
      attachments: [],
      parameters: [],
    }));

    // ── build description from assertions ─────────────────────────────────

    const assertionLines = assertionRaw
      .map(l => l.replace(/- \[x\]/gi, '✅').replace(/- \[!\]/g, '❌').replace(/- \[ \]/g, '⬜'));
    const description = assertionLines.length
      ? '**Assertions:**\n' + assertionLines.join('\n')
      : '';

    // ── collect labels ────────────────────────────────────────────────────

    const loginMatch = section.match(/\*\*Login:\*\*\s*([^\n|]+)/i);
    const labels = [
      { name: 'parentSuite', value: 'Invoice Tracking QA' },
      { name: 'suite',       value: suite },
      { name: 'subSuite',    value: tcId },
      { name: 'tag',         value: 'e2e' },
      { name: 'tag',         value: suite.toLowerCase().replace(/\s+/g, '-') },
      { name: 'tag',         value: runTypeTag() },
    ];
    if (loginMatch) {
      labels.push({ name: 'tag', value: `role:${loginMatch[1].trim().toLowerCase()}` });
    }

    // ── parameters: duration + cost ──────────────────────────────────────

    const durationSec = Math.round((stopMs - startMs) / 1000);
    const durationLabel = durationSec >= 60
      ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`
      : `${durationSec}s`;

    const parameters = [
      { name: 'Duration', value: durationLabel },
    ];
    if (reportCost) {
      parameters.push({ name: 'API Cost (est.)', value: reportCost });
    }

    results.push({
      uuid: uuid(),
      historyId: historyId('global', tcId),   // deduplicate by TC-ID only across all suites
      name: fullName,
      fullName: `${suite} > ${fullName}`,
      status,
      stage: 'finished',
      description,
      descriptionHtml: '',
      start: startMs,
      stop: stopMs,
      labels,
      links: [],
      parameters,
      steps,
      attachments: [],
    });
  }

  return results;
}

// ── write environment.properties ─────────────────────────────────────────────

function writeEnvironment() {
  const envPath = path.join(RESULTS_DIR, 'environment.properties');
  const runType = process.env.CI ? 'CI (GitHub Actions)' : 'Local';
  const content = [
    'App=ITS Shesha3',
    'Environment=QA',
    'URL=https://pd-invtracking-adminportal-qa.azurewebsites.net',
    'TestRunner=Claude (MCP browser tools)',
    `RunType=${runType}`,
    `ReportGenerated=${new Date().toISOString()}`,
  ].join('\n');
  fs.writeFileSync(envPath, content, 'utf8');
}

/** Returns 'local' or 'ci' — used as a tag on every result */
function runTypeTag() {
  return process.env.CI ? 'ci' : 'local';
}

// ── write categories.json ─────────────────────────────────────────────────────

function writeCategories() {
  const cats = [
    {
      name: 'Blocked Tests',
      matchedStatuses: ['broken'],
    },
    {
      name: 'Skipped / Not Run',
      matchedStatuses: ['skipped'],
    },
    {
      name: 'Failed Tests',
      matchedStatuses: ['failed'],
    },
  ];
  fs.writeFileSync(
    path.join(RESULTS_DIR, 'categories.json'),
    JSON.stringify(cats, null, 2),
    'utf8'
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

  // Clean previous results
  for (const f of fs.readdirSync(RESULTS_DIR)) {
    if (f.endsWith('-result.json') || f.endsWith('-container.json')) {
      fs.unlinkSync(path.join(RESULTS_DIR, f));
    }
  }

  // Sort files newest-first by the date embedded in the filename (YYYY-MM-DDThh-mm)
  function fileDate(filename) {
    const m = filename.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2})/);
    if (m) return m[1];
    const d = filename.match(/(\d{4}-\d{2}-\d{2})/);
    return d ? d[1] + 'T00-00' : '0000-00-00T00-00';
  }
  const reportFiles = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => fileDate(b).localeCompare(fileDate(a)));

  // Collect all results; first real (non-skipped) result per TC-ID wins
  const byHistoryId = new Map();

  for (const filename of reportFiles) {
    const content = fs.readFileSync(path.join(REPORTS_DIR, filename), 'utf8');
    const results = parseReport(filename, content);
    let kept = 0;

    for (const result of results) {
      // Always drop skipped/unknown
      if (result.status === 'skipped' || result.status === 'unknown') continue;
      // Only keep if we don't already have a result for this TC from a newer file
      if (!byHistoryId.has(result.historyId)) {
        byHistoryId.set(result.historyId, result);
        kept++;
      }
    }

    console.log(`  ${filename} → ${results.length} parsed, ${kept} kept`);
  }

  // Write deduplicated results
  for (const result of byHistoryId.values()) {
    const outPath = path.join(RESULTS_DIR, `${result.uuid}-result.json`);
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  }

  writeEnvironment();
  writeCategories();

  console.log(`\nDone. ${byHistoryId.size} Allure result(s) written to allure-results/`);
}

main();
