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
  if (r.includes('BLOCK')) return 'broken';
  if (r.includes('SKIP') || r.includes('NOT RUN') || r.includes('OBSOLETE')) return 'skipped';
  return 'unknown';
}

// ── per-file parser ───────────────────────────────────────────────────────────

function parseReport(filename, content) {
  const suite = suiteFromFilename(filename);
  const date = extractDate(content, filename);
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

    // 3. Old summary table format: | TC-01 | ... | **PASS** |
    if (status === 'unknown') {
      const tableMatch = content.match(
        new RegExp(`\\|\\s*${tcId}\\s*\\|[^|]*\\|[^|]*\\|\\s*\\*\\*(\\w[^*]*)\\*\\*`)
      );
      if (tableMatch) status = toAllureStatus(tableMatch[1]);
    }

    // 4. Assertion-style [x]/[!] — if majority pass and none fail, assume passed
    if (status === 'unknown') {
      const passes = (section.match(/- \[x\]/gi) || []).length;
      const fails = (section.match(/- \[!\]/gi) || []).length;
      if (passes > 0 || fails > 0) {
        status = fails > 0 ? 'failed' : 'passed';
      }
    }

    if (status === 'unknown') status = 'skipped';

    // ── timing ────────────────────────────────────────────────────────────

    const timingMatch = section.match(
      /\*\*Started:\*\*\s*([\d:]+)\s*\|\s*\*\*Completed:\*\*\s*([\d:]+)/
    );
    const startMs = timingMatch ? (toMs(date, timingMatch[1]) ?? Date.now()) : Date.now();
    const stopMs  = timingMatch ? (toMs(date, timingMatch[2]) ?? startMs + 1000) : startMs + 1000;

    // ── build steps from numbered list ───────────────────────────────────

    const steps = [];
    const stepLines = section.match(/^\d+\..+/gm) || [];
    for (const line of stepLines) {
      steps.push({
        name: line.replace(/^\d+\.\s*/, '').trim(),
        status: 'passed',
        stage: 'finished',
        steps: [],
        attachments: [],
        parameters: [],
      });
    }

    // ── build description from assertions ─────────────────────────────────

    const assertionLines = (section.match(/- \[.?\] .+/g) || [])
      .map(l => l.replace(/- \[x\]/g, '✅').replace(/- \[!\]/g, '❌').replace(/- \[ \]/g, '⬜'));
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
    ];
    if (loginMatch) {
      labels.push({ name: 'tag', value: `role:${loginMatch[1].trim().toLowerCase()}` });
    }

    results.push({
      uuid: uuid(),
      historyId: historyId(suite, fullName),
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
      parameters: [],
      steps,
      attachments: [],
    });
  }

  return results;
}

// ── write environment.properties ─────────────────────────────────────────────

function writeEnvironment() {
  const envPath = path.join(RESULTS_DIR, 'environment.properties');
  const content = [
    'App=ITS Shesha3',
    'Environment=QA',
    'URL=https://pd-invtracking-adminportal-qa.azurewebsites.net',
    'TestRunner=Claude (MCP browser tools)',
    `ReportGenerated=${new Date().toISOString()}`,
  ].join('\n');
  fs.writeFileSync(envPath, content, 'utf8');
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

  const reportFiles = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.md'));
  let total = 0;

  for (const filename of reportFiles) {
    const content = fs.readFileSync(path.join(REPORTS_DIR, filename), 'utf8');
    const results = parseReport(filename, content);

    for (const result of results) {
      const outPath = path.join(RESULTS_DIR, `${result.uuid}-result.json`);
      fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
    }

    console.log(`  ${filename} → ${results.length} test(s)`);
    total += results.length;
  }

  writeEnvironment();
  writeCategories();

  console.log(`\nDone. ${total} Allure result(s) written to allure-results/`);
}

main();
