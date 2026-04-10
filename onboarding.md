# Onboarding Guide: Markdown-Driven E2E Testing with Claude

This guide walks you through setting up a new project that uses Claude to execute E2E tests defined in markdown files, with Allure reporting and GitHub Actions CI.

No Playwright scripts, no test framework code — Claude reads a test plan and drives the browser directly.

---

## Quick Start (One Command)

If you have the bootstrap script from this repo, you can scaffold an entire project in one prompt:

```bash
bash scripts/bootstrap.sh \
  --name "My App" \
  --url "https://myapp.example.com" \
  --login-url "https://myapp.example.com/login" \
  --dir "./my-app-tests" \
  --private
```

Or run without flags to be prompted interactively:

```bash
bash scripts/bootstrap.sh
```

This creates a ready-to-go project with:
- `CLAUDE.md`, `RULES.md`, `TEMPLATE.md` (configured for your app)
- `package.json` with `allure-commandline` + npm scripts
- `scripts/generate-allure-results.js` (markdown-to-Allure parser)
- CI workflows (test runner + Allure deploy to GitHub Pages)
- Playwright MCP config
- Git repo with initial commit

After running the bootstrap, skip to [Post-Setup](#post-setup-github-repo--secrets) to create the GitHub repo and add secrets.

If you prefer to set things up manually, continue with the step-by-step guide below.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | 20+ | Allure CLI, Playwright MCP server |
| [Git](https://git-scm.com/) | 2.x | Version control |
| [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) | Latest | Runs tests locally and in CI |
| [GitHub CLI (`gh`)](https://cli.github.com/) | Latest | Repo creation, CI secrets |
| Java JDK | 17+ | Required by Allure CLI (CI only — npm package bundles it locally) |

### API Keys Needed

| Key | Where to get it | Used for |
|-----|-----------------|----------|
| Anthropic API key | [console.anthropic.com](https://console.anthropic.com/) | Claude Code (local + CI) |
| Mailosaur API key *(optional)* | [mailosaur.com](https://mailosaur.com/) | Email/SMS verification |

---

## Step 1: Create the Repository

```bash
mkdir my-app-tests
cd my-app-tests
git init
```

## Step 2: Project Structure

Create the following directory structure:

```
my-app-tests/
  .github/
    mcp-config.json          # Playwright MCP server config (for CI)
    workflows/
      e2e-test.yml            # Test runner workflow
      deploy-reports.yml      # Allure report deployment to GitHub Pages
  scripts/
    generate-allure-results.js  # Markdown-to-Allure JSON parser
  test-plans/
    RULES.md                  # Execution rules (read by Claude before every run)
    TEMPLATE.md               # Copy this to create new test plans
  test-reports/               # Generated markdown reports (committed by CI)
  CLAUDE.md                   # Project instructions for Claude
  package.json                # allure-commandline + npm scripts
  .gitignore
```

## Step 3: Install Dependencies

```bash
npm init -y
npm install --save-dev allure-commandline
```

Your `package.json` scripts should include:

```json
{
  "scripts": {
    "allure:generate": "node scripts/generate-allure-results.js",
    "allure:report": "node scripts/generate-allure-results.js && allure generate allure-results --clean -o allure-report",
    "allure:open": "npm run allure:report && allure open allure-report",
    "allure:serve": "node scripts/generate-allure-results.js && allure serve allure-results"
  }
}
```

## Step 4: Configure CLAUDE.md

This is the most important file. Claude reads it at the start of every session. Adapt this to your application:

```markdown
# CLAUDE.md – Markdown-Driven Testing for [Your App Name]

This project uses markdown files to define and execute tests against [your app].
No scripts — Claude drives the browser directly from test plan definitions.

## Application Under Test
| Field | Value |
|-------|-------|
| App | [Your App Name] |
| URL | [Your app base URL] |
| Login | [Your login URL] |
| Environment | [Test/Staging/etc.] |

## How It Works
1. Test plans live in `test-plans/` as `.md` files
2. Claude reads a test plan, opens the browser, and executes each test case
3. Results are saved to `test-reports/[scenario]-[date].md`

## Running Tests
When asked to run a test plan:
1. Read `test-plans/RULES.md` first
2. Read the target test plan
3. Execute each test case using browser tools (snapshot, click, fill, assert)
4. Generate a report in `test-reports/`

## Key Rules
- Never guess — always snapshot the browser before acting
- Never hardcode credentials — use env variables
- On failure: screenshot, note what happened, continue to next test case
- Every assertion must be explicitly checked and marked pass/fail
- Reuse existing test data — don't create new records unless required
```

## Step 5: Configure RULES.md

Create `test-plans/RULES.md`. This file governs how Claude executes every test. Key sections:

- **Before Testing** — read the full plan, check prereqs, navigate and snapshot
- **During Testing** — snapshot before/after every action, never assume page state
- **Assertions** — `[x]` for pass, `[!]` for fail, never skip
- **On Failure** — screenshot, note expected vs actual, continue to next TC
- **Test Data** — list approved test accounts and data to avoid creating records
- **Email/SMS Verification** — API details for your verification service (Mailosaur, etc.)

See `test-plans/RULES.md` in this repo for the full reference.

## Step 6: Configure MCP (Playwright Browser)

Create `.github/mcp-config.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp", "--headless"]
    }
  }
}
```

For **local** use, add the Playwright MCP server to your Claude Code config:
- Open Claude Code settings or run `/mcp`
- Add the same Playwright MCP server entry

This gives Claude browser tools: `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill_form`, etc.

## Step 7: Configure .gitignore

```
.playwright-mcp/
*.png
*.jpeg
!test-reports/screenshots/**/*.png
!test-reports/screenshots/**/*.jpeg
node_modules/
_site/
allure-results/
allure-report/
```

## Step 8: Write Your First Test Plan

Copy `test-plans/TEMPLATE.md` and fill in your test cases. Each test case follows this format:

```markdown
## TC-01: [Description]
- **Type:** Happy path | Negative | Edge case
- **Login:** [account]
- **URL:** [starting page]
- **Steps:**
  1. Navigate to [page]
  2. Click [button]
  3. Fill [field] with [value]
  4. Snapshot to confirm
  5. Click [submit]
- **Expected result:** [What should happen]
- **Assertions:**
  - [ ] [Thing to verify]
  - [ ] [Another thing]
```

Tips for writing good test plans:
- Be specific about UI elements ("Click the **Save** button in the top-right")
- Include snapshot checkpoints between actions
- Write assertions that can be verified visually from a browser snapshot
- Use the Accounts and Test Data sections to avoid hardcoding values

## Step 9: Run Tests Locally

```bash
# Start Claude Code in the project directory
claude

# Then ask it to run a test plan:
> run test-plans/e2e-login.md
```

Claude will:
1. Read RULES.md and the test plan
2. Open a browser via Playwright MCP
3. Execute each step, snapshotting before/after
4. Generate a markdown report in `test-reports/`

## Step 10: Set Up Allure Reports Locally

Allure turns your markdown test reports into an interactive HTML dashboard with pass/fail breakdowns, trend charts, and per-assertion drill-down.

### How it works

1. Claude runs tests and produces markdown reports in `test-reports/`
2. `scripts/generate-allure-results.js` parses those reports into Allure-compatible JSON in `allure-results/`
3. The Allure CLI generates an HTML report from the JSON

### Local commands

```bash
npm install

# Quick: parse + open interactive dashboard in browser
npm run allure:serve

# Or generate a static report
npm run allure:report

# Open the static report
npm run allure:open
```

### What you see in the Allure dashboard

- **Overview** — total pass/fail/skipped with pie chart
- **Suites** — drill into each module (Login, Notifications, etc.)
- **Test cases** — each TC expands to show individual assertion steps with pass/fail
- **Graphs** — trend charts across runs (when history is available)
- **Environment** — app URL, browser, run type
- **Categories** — groups failures by type (failed assertions, not yet executed, etc.)

### The parser understands this markdown format

The parser (`generate-allure-results.js`) reads your markdown reports and extracts:

| Markdown pattern | What it maps to |
|-----------------|-----------------|
| `## TC-01: Description` | Allure test case name |
| `**Status:** PASS/FAIL` | Test status |
| `- [x] assertion text` | Passed step |
| `- [!] assertion text` | Failed step |
| `- [ ] assertion text` | Skipped step |
| `**Steps executed:** 7/7` | Parameter in test details |
| Meta table (Module, Date, etc.) | Suite name, environment info |
| Issues table (Severity) | Allure severity labels |

---

## Step 11: Set Up CI (GitHub Actions)

### 11a. Add GitHub Secrets

```bash
gh secret set ANTHROPIC_API_KEY    # Your Anthropic API key
gh secret set ADMIN_USER           # Login username
gh secret set APP_PASSWORD         # Login password
```

### 11b. Test Workflow (`e2e-test.yml`)

This workflow runs the tests and produces artifacts:

1. Checkout + Node.js + `npm ci` + install Playwright
2. Run Claude via `anthropics/claude-code-action@v1` with a test plan prompt
3. Post the markdown report to the GitHub Actions job summary
4. **Generate Allure results** from the markdown report
5. Upload both `test-report` and `allure-results` as artifacts
6. Commit the markdown report back to `main`

Supports:
- **Manual dispatch** — pick a test plan from a dropdown
- **Scheduled runs** — cron (e.g. daily at midnight)

To add a new test plan to the CI dropdown, add it to the `options` list in the workflow file.

See `.github/workflows/e2e-test.yml` in this repo for the full reference.

### 11c. Deploy Workflow (`deploy-reports.yml`)

This workflow builds and deploys the Allure HTML dashboard to GitHub Pages:

1. **Triggers on:** report committed to `main`, test workflow completion, or manual dispatch
2. **Generates Allure results** from ALL committed markdown reports (not just the latest)
3. **Fetches trend history** from the current GitHub Pages deployment — this is how you get trend charts showing pass/fail rates over time
4. **Merges history** into results so Allure picks it up
5. **Generates the HTML report** via `npx allure-commandline generate`
6. **Deploys to GitHub Pages**

Requirements:
- Java 17+ (installed via `actions/setup-java`)
- `package-lock.json` must be committed (for `npm ci`)

See `.github/workflows/deploy-reports.yml` in this repo for the full reference.

### 11d. Enable GitHub Pages

Go to **Settings > Pages** in your repo and set:
- Source: **GitHub Actions**

The Allure dashboard will be available at `https://<org>.github.io/<repo>/`.

### CI Pipeline Flow

```
e2e-test.yml                          deploy-reports.yml
  |                                     |
  |- Run tests (Claude + Playwright)    |- Triggered by: push to test-reports/
  |- Generate markdown report           |   OR test workflow completion
  |- Parse to Allure JSON               |   OR manual dispatch
  |- Upload artifacts                   |
  |- Commit report to main --------+--->|- Checkout main (latest reports)
                                        |- Parse ALL reports to Allure JSON
                                        |- Fetch history from GitHub Pages
                                        |- Generate Allure HTML report
                                        |- Deploy to GitHub Pages
```

---

## Post-Setup: GitHub Repo + Secrets

After scaffolding (via bootstrap or manually), create the repo and configure secrets:

```bash
# Create GitHub repo and push
gh repo create my-app-tests --private --source=. --push

# Add required secrets
gh secret set ANTHROPIC_API_KEY    # Your Anthropic API key
gh secret set ADMIN_USER           # Login username for the app
gh secret set APP_PASSWORD         # Login password for the app

# Enable GitHub Pages: Settings > Pages > Source: GitHub Actions
```

Then write your first test plan, run it locally, and push. CI + Allure will take it from there.

---

## Adding a New Test Plan

1. Copy `test-plans/TEMPLATE.md` to `test-plans/e2e-<feature>.md`
2. Fill in the Meta, Accounts, and Test Cases sections
3. Add the new plan name to the `options` list in `e2e-test.yml`
4. Run locally first: `> run test-plans/e2e-<feature>.md`
5. Commit and push — CI will pick it up

## Adding Email/SMS Verification

If your tests need to verify sent emails or SMS:

1. Sign up for [Mailosaur](https://mailosaur.com/) (recommended — supports both email + SMS)
2. Create a server, note your server ID and API key
3. Add verification details to `test-plans/RULES.md` under a dedicated section
4. Update test recipient records in your app to use Mailosaur inbox addresses
5. In test plans, add a verification step after send actions:
   - "Call the Mailosaur API to verify the email was received"
   - Claude will use `WebFetch` or `browser_navigate` to check the API

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Claude doesn't see browser tools | Ensure Playwright MCP is configured (`.github/mcp-config.json` for CI, Claude Code settings for local) |
| `npm ci` fails in CI | Make sure `package-lock.json` is committed |
| Allure report is empty | Check that `test-reports/` has `.md` files with the expected format (TC headers, status lines, assertion checkboxes) |
| Deploy workflow doesn't trigger | Ensure GitHub Pages source is set to "GitHub Actions" in repo settings |
| Tests time out in CI | Increase `timeout-minutes` in the workflow (default: 90). Reduce test plan scope if needed. |
| Claude skips steps or guesses | Check that RULES.md has the "Zero Tolerance for Skipping" section and snapshot rules |

---

## Quick Start Checklist

- [ ] Node.js 20+ installed
- [ ] Claude Code CLI installed and authenticated
- [ ] Repository created with the directory structure above
- [ ] `CLAUDE.md` configured for your app
- [ ] `test-plans/RULES.md` configured with test data and execution rules
- [ ] `.github/mcp-config.json` created with Playwright MCP
- [ ] Playwright MCP added to local Claude Code config
- [ ] `package.json` created with `allure-commandline`
- [ ] `scripts/generate-allure-results.js` copied from reference repo
- [ ] At least one test plan written in `test-plans/`
- [ ] First local test run completed successfully
- [ ] GitHub secrets set (`ANTHROPIC_API_KEY`, `ADMIN_USER`, `APP_PASSWORD`)
- [ ] CI workflows added and tested
- [ ] GitHub Pages enabled (source: GitHub Actions)
