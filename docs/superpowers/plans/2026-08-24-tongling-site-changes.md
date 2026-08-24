# Tongling Site Changes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply every change listed in `tuling网页修改清单.md` to the original `tuling - 副本.zip` source while preserving all behavior and styling outside that list.

**Architecture:** Keep the original static HTML/CSS/JavaScript project as the base and port only requirement-mapped hunks from `tongling.zip/tuling-public-datasets`. Add the supplied catalog/XML/image runtime as an isolated public-dataset data layer, expose leaderboard views for the two SVG radar consumers, and exclude all reference-package engineering snapshots from delivery.

**Tech Stack:** Static HTML5, CSS3, browser JavaScript, SVG, Fetch API, DOMParser, Node.js assertion scripts, Python HTTP server.

**Spec:** `docs/superpowers/specs/2026-08-24-tongling-site-changes-design.md`

## Global Constraints

- Use `tuling - 副本.zip` as the sole base source; never replace the project wholesale with the reference directory.
- Implement only checklist items A-01 through V-05 and preserve the existing feedback module, comments behavior, navigation behavior, and `data.js` bytes.
- Treat each “修改件表现” cell as the required behavior; treat “设计团队确认项” and “建议确认顺序” as non-authorizing acceptance notes.
- Use `tongling.zip/tuling-public-datasets` only as the exact implementation/resource reference.
- Exclude `.git`, `.codex-sync`, `127.0.0.1%3A8766`, reference GitHub configuration, and this plan/spec from the final website package.
- Do not fabricate brand copy, dataset content, metrics, images, tables, or counts.
- Preserve relative paths so the site runs through a local HTTP server without a build step.

## File Responsibility Map

- `public-datasets-data/catalog.json`: four-category index and verified totals.
- `public-datasets-data/*.xml`: 193 entries, ten display fields per entry, and expanded embedded tables.
- `public-datasets-data/assets/doc-*.jpg`: the 21 supplied local document images.
- `public-datasets.js`: catalog/XML loading, filtering, URL state, safe content rendering, and dataset-detail interaction.
- `datasets-integrated.css`: public-dataset page layout and responsive behavior only.
- `framework-page.css`: framework page layout and responsive behavior only.
- `leaderboard.js`: existing table renderer plus `window.TURING_LEADERBOARD_VIEWS` shared data interface.
- `app.js`: homepage SVG radar rendering using the shared leaderboard views.
- `subpages.js`: framework tabs, radar rendering/interpretation, and existing shared subpage behavior.
- HTML files: requirement-scoped structure and copy.
- `styles.css`, `vitality-blue.css`, `animations.css`: shared and page-specific presentation changes required by the checklist.
- `tools/verify-ui-fixes.mjs`: executable regression contract for resource counts and key UI hooks.

## Checklist Coverage

- Task 2: D-14, D-15, D-17, V-01.
- Task 3: D-01 through D-13, D-16, V-02, and the dataset-page portion of V-03.
- Task 4: A-01 through A-08, H-01, L-01, O-01, and the shared copy portion of V-05.
- Task 5: H-02 through H-09 and the shared-view interface portion of L-03.
- Task 6: F-01 through F-15.
- Task 7: L-01 through L-03 and O-01 final verification.
- Task 8: V-01 through V-05 packaging, compatibility, visual regression, and handoff evidence.

---

### Task 1: Establish the Failing Regression Contract

**Files:**
- Modify: `tools/verify-ui-fixes.mjs`
- Reference: `C:\Users\32286\Documents\Codex\2026-08-24\wy\work\tongling-reference\tuling-public-datasets\tools\verify-ui-fixes.mjs`

**Interfaces:**
- Consumes: original site files from the repository root.
- Produces: one Node assertion script that validates public-dataset counts, key UI hooks, radar hooks, and framework links.

- [ ] **Step 1: Replace the existing narrow assertions with the supplied full regression contract**

Use `apply_patch` to make `tools/verify-ui-fixes.mjs` read these files:

```js
const app = read('app.js');
const leaderboard = read('leaderboard.js');
const publicDatasets = read('public-datasets.js');
const datasetsHtml = read('datasets.html');
const datasetsCss = read('datasets-integrated.css');
const publicDatasetXml = {
  affective: read('public-datasets-data/affective.xml'),
  cognitive: read('public-datasets-data/cognitive.xml'),
  concern: read('public-datasets-data/concern.xml'),
  safety: read('public-datasets-data/safety.xml')
};
```

Copy the remaining assertions exactly from the inspected reference script, including these count assertions:

```js
assert.equal(countMatches(combinedDatasetXml, /<h3(?:\s|>)/g), 193, 'public dataset entry count');
assert.equal(countMatches(combinedDatasetXml, /<h4(?:\s|>)/g), 1930, 'public dataset field count');
assert.equal(countMatches(combinedDatasetXml, /data-sheet-id=/g), 968, 'expanded embedded sheet count');
```

- [ ] **Step 2: Run the contract and verify the expected failure**

Run:

```powershell
& 'C:\Users\32286\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tools\verify-ui-fixes.mjs
```

Expected: FAIL with `ENOENT` for `public-datasets.js`; this proves the original source does not already satisfy the new runtime contract.

- [ ] **Step 3: Commit the red test**

```powershell
git add -- tools/verify-ui-fixes.mjs
git commit -m "test: define tongling site regression contract"
```

---

### Task 2: Add the Verified Public-Dataset Resource Layer

**Files:**
- Create: `public-datasets-data/catalog.json`
- Create: `public-datasets-data/affective.xml`
- Create: `public-datasets-data/cognitive.xml`
- Create: `public-datasets-data/concern.xml`
- Create: `public-datasets-data/safety.xml`
- Create: `public-datasets-data/assets/doc-001.jpg` through `public-datasets-data/assets/doc-021.jpg`
- Test: `tools/verify-ui-fixes.mjs`

**Interfaces:**
- Consumes: immutable files under `C:\Users\32286\Documents\Codex\2026-08-24\wy\work\tongling-reference\tuling-public-datasets\public-datasets-data`.
- Produces: `catalog.json` with `totalEntries: 193`, `totalTasks: 33`, `totalSections: 1930`; four XML sources addressed by catalog `file` values; 21 local JPG paths.

- [ ] **Step 1: Add a temporary resource-only assertion before copying files**

Add these checks near the start of `tools/verify-ui-fixes.mjs` using `apply_patch`:

```js
const catalog = JSON.parse(read('public-datasets-data/catalog.json'));
assert.equal(catalog.totalEntries, 193);
assert.equal(catalog.totalTasks, 33);
assert.equal(catalog.totalSections, 1930);
assert.equal(catalog.categories.length, 4);
```

- [ ] **Step 2: Run and verify the resource test still fails**

Run the Node command from Task 1.

Expected: FAIL with `ENOENT` for `public-datasets-data/catalog.json`.

- [ ] **Step 3: Copy only the supplied runtime resources**

Use a mechanical binary/resource copy from the inspected reference directory:

```powershell
$reference = 'C:\Users\32286\Documents\Codex\2026-08-24\wy\work\tongling-reference\tuling-public-datasets\public-datasets-data'
New-Item -ItemType Directory -Path 'public-datasets-data\assets' -Force | Out-Null
Copy-Item -LiteralPath "$reference\catalog.json" -Destination 'public-datasets-data\catalog.json'
Copy-Item -LiteralPath "$reference\affective.xml" -Destination 'public-datasets-data\affective.xml'
Copy-Item -LiteralPath "$reference\cognitive.xml" -Destination 'public-datasets-data\cognitive.xml'
Copy-Item -LiteralPath "$reference\concern.xml" -Destination 'public-datasets-data\concern.xml'
Copy-Item -LiteralPath "$reference\safety.xml" -Destination 'public-datasets-data\safety.xml'
Copy-Item -LiteralPath "$reference\assets\doc-*.jpg" -Destination 'public-datasets-data\assets'
```

- [ ] **Step 4: Verify resource integrity independently of UI files**

Run:

```powershell
$catalog = Get-Content -Raw -LiteralPath 'public-datasets-data\catalog.json' | ConvertFrom-Json
$xml = (Get-ChildItem 'public-datasets-data\*.xml' | ForEach-Object { Get-Content -Raw -LiteralPath $_.FullName }) -join "`n"
if ($catalog.totalEntries -ne 193 -or $catalog.totalTasks -ne 33 -or $catalog.totalSections -ne 1930) { throw 'Catalog totals mismatch' }
if (([regex]::Matches($xml, '<h3(?:\s|>)')).Count -ne 193) { throw 'Entry count mismatch' }
if (([regex]::Matches($xml, '<h4(?:\s|>)')).Count -ne 1930) { throw 'Field count mismatch' }
if (([regex]::Matches($xml, 'data-sheet-id=')).Count -ne 968) { throw 'Embedded sheet count mismatch' }
if ((Get-ChildItem 'public-datasets-data\assets\doc-*.jpg').Count -ne 21) { throw 'Document image count mismatch' }
```

Expected: exit 0 with no output.

- [ ] **Step 5: Commit the verified resources**

```powershell
git add -- public-datasets-data tools/verify-ui-fixes.mjs
git commit -m "feat: add verified public dataset resources"
```

---

### Task 3: Implement the Public-Dataset Page and Safe Renderer

**Files:**
- Create: `public-datasets.js`
- Create: `datasets-integrated.css`
- Modify: `datasets.html`
- Preserve behavior: `datasets.js` (Task 4 changes only its brand header comment)
- Test: `tools/verify-ui-fixes.mjs`

**Interfaces:**
- Consumes: `public-datasets-data/catalog.json`, its four XML `file` values, `?dimension=<categoryId>`, keyboard `/` and `Escape`.
- Produces: DOM containers `#dataset-search`, `#task-filter`, `#sort-order`, `#clear-filters`; `history.pushState`/`popstate` restoration; safely rendered detail panels.

- [ ] **Step 1: Add assertions for page hooks and the safe renderer**

Add these exact assertions to `tools/verify-ui-fixes.mjs`:

```js
assert.match(publicDatasets, /const SECTION_ORDER = \[/);
assert.match(publicDatasets, /function renderSourceContent\(section, panel\)/);
assert.match(publicDatasets, /const wrap = create\("div", "table-scroll"\);/);
assert.match(datasetsHtml, /id="dataset-search"/);
assert.match(datasetsHtml, /id="task-filter"/);
assert.match(datasetsHtml, /id="sort-order"/);
assert.match(datasetsHtml, /id="clear-filters"/);
assert.match(datasetsCss, /\.table-scroll\s*\{[\s\S]*?overflow-x:\s*auto;/);
assert.match(datasetsCss, /\.source-resource-grid/);
```

- [ ] **Step 2: Run and verify failure before adding page runtime**

Run the Node command from Task 1.

Expected: FAIL because `public-datasets.js` and `datasets-integrated.css` do not exist.

- [ ] **Step 3: Add the two new isolated page files from the reference package**

Copy `public-datasets.js` and `datasets-integrated.css` byte-for-byte from the inspected reference package. These are new files, so this does not rewrite an existing component.

- [ ] **Step 4: Patch only the checklist-defined `datasets.html` sections**

Use `apply_patch` with hunks derived from the reference diff to:

```html
<link rel="stylesheet" href="datasets-integrated.css?v=20260824-sheets" />
```

Replace the old single browser section with the supplied overview, capability cards, task map, and browser containers. Load the new runtime after shared scripts:

```html
<script src="public-datasets.js?v=20260824-sources"></script>
```

Keep the existing header, feedback module, comment hooks, and footer structure except for checklist-wide copy replacements handled in Task 4.

- [ ] **Step 5: Run the full contract**

Run the Node command from Task 1.

Expected: the public-dataset assertions pass; the script may next fail on an unimplemented radar assertion.

- [ ] **Step 6: Commit the dataset page slice**

```powershell
git add -- datasets.html public-datasets.js datasets-integrated.css
git commit -m "feat: add integrated public dataset browser"
```

---

### Task 4: Apply Global Brand, Terminology, Contact, Cache, and Layout Changes

**Files:**
- Modify: `index.html`
- Modify: `datasets.html`
- Modify: `framework.html`
- Modify: `leaderboard.html`
- Modify: `owned.html`
- Modify: `datasets.js`
- Modify: `gate.js`
- Modify: `styles.css`
- Modify: `vitality-blue.css`
- Modify: `animations.css`
- Test: `tools/verify-ui-fixes.mjs`

**Interfaces:**
- Consumes: all five page documents and existing shared CSS/gate behavior.
- Produces: visible brand `通灵`, platform term `大模型共情智能`, contact `songyu@dezhipu.com`, formal protection copy, versioned asset references, and the `minmax` `.mei-layout` grid.

- [ ] **Step 1: Add global-copy assertions**

Read all five HTML files in the test and add:

```js
const pages = ['index.html', 'datasets.html', 'framework.html', 'leaderboard.html', 'owned.html'].map(read).join('\n');
assert.doesNotMatch(pages, /图灵\s*2\.0/);
assert.doesNotMatch(pages, /大模型情感智能/);
assert.doesNotMatch(pages, /benchmark@example\.com/);
assert.match(pages, /通灵/);
assert.match(pages, /大模型共情智能/);
assert.match(pages, /songyu@dezhipu\.com/);
assert.match(read('gate.js'), /本站已启用访问保护/);
assert.match(read('styles.css'), /\.mei-layout[\s\S]*?minmax\(/);
```

- [ ] **Step 2: Run and verify the expected global-copy failure**

Run the Node command from Task 1.

Expected: FAIL on the first retained `图灵 2.0`, `大模型情感智能`, or old email occurrence.

- [ ] **Step 3: Apply exact copy and title/footer patches**

Use `apply_patch` per file to change only checklist-governed visible text, metadata, title, footer, contact, access-protection copy, and the `datasets.js` brand header comment. Do not replace identifiers such as `window.TURING_DATA`, `window.TURING_LEADERBOARD_VIEWS`, filenames, or internal compatibility keys.

- [ ] **Step 4: Apply cache-query and layout patches**

Use the reference diff to preserve its exact cache query strings (`20260819-brand`, `20260819-radar`, `20260819-radar2`, `20260820-framework2`, `20260820-framework5`, `20260824-sheets`, `20260824-sources`, and the existing `20260810-deletefix`) and change `.mei-layout` to the supplied `minmax` grid with tightened gap. Retain all unrelated CSS rules byte-for-byte.

- [ ] **Step 5: Run the contract and inspect the scoped diff**

Run:

```powershell
& 'C:\Users\32286\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tools\verify-ui-fixes.mjs
git diff --check
git diff -- index.html datasets.html framework.html leaderboard.html owned.html gate.js styles.css vitality-blue.css animations.css
```

Expected: global-copy assertions pass; diff contains no feedback/comment logic changes.

- [ ] **Step 6: Commit global changes**

```powershell
git add -- index.html datasets.html framework.html leaderboard.html owned.html datasets.js gate.js styles.css vitality-blue.css animations.css tools/verify-ui-fixes.mjs
git commit -m "feat: apply tongling brand and shared presentation"
```

---

### Task 5: Implement Homepage and Shared Leaderboard SVG Radar Data

**Files:**
- Modify: `leaderboard.js`
- Modify: `app.js`
- Modify: `index.html`
- Modify: `vitality-blue.css`
- Modify: `animations.css`
- Test: `tools/verify-ui-fixes.mjs`

**Interfaces:**
- Consumes: `window.TURING_LEADERBOARD_DATA` and current selected view key.
- Produces: `window.TURING_LEADERBOARD_VIEWS`; `renderRadar(viewKey, alt)`; SVG in `#radar-chart`; generated legend/axis labels; reduced-motion-safe switching.

- [ ] **Step 1: Add failing interface assertions**

Add:

```js
assert.match(leaderboard, /window\.TURING_LEADERBOARD_VIEWS/);
assert.match(app, /function renderRadar\(viewKey, alt\)/);
assert.match(app, /renderRadar\(activeKey, v\.alt\);/);
assert.match(app, /wrap\._setRadarView = focusView;/);
assert.match(read('index.html'), /id="radar-chart"/);
```

- [ ] **Step 2: Run and verify failure on the absent SVG radar interface**

Run the Node command from Task 1.

Expected: FAIL on `renderRadar`, `TURING_LEADERBOARD_VIEWS`, or `#radar-chart`.

- [ ] **Step 3: Patch leaderboard shared views**

Use `apply_patch` to expose the existing five view definitions without changing table sorting or values:

```js
window.TURING_LEADERBOARD_VIEWS = VIEWS;
```

- [ ] **Step 4: Patch the homepage radar container and renderer**

Use requirement-mapped hunks from the reference implementation to replace only the static radar `<img>` with `#radar-chart`, and add the SVG renderer, legend, wrapped label logic, transition state, and existing card/tab linkage in `app.js`.

- [ ] **Step 5: Patch homepage copy and flow nodes**

Apply H-02, H-03, H-08, and H-09: remove the metric-strip research scale line, use supplied product-oriented capability descriptions, rename `数据范式` to `任务范式`, rename `能力评测` to `自研模型`, and use the supplied shorter CTA text. Do not alter surrounding sections.

- [ ] **Step 6: Verify radar contract and reduced-motion CSS**

Run the Node command from Task 1 and:

```powershell
rg -n "prefers-reduced-motion|radar-chart|radar-legend|radar-axis" app.js index.html vitality-blue.css animations.css
```

Expected: Node contract advances past homepage radar assertions; grep shows SVG, legend, axis, and reduced-motion hooks.

- [ ] **Step 7: Commit homepage radar changes**

```powershell
git add -- leaderboard.js app.js index.html vitality-blue.css animations.css tools/verify-ui-fixes.mjs
git commit -m "feat: add shared dynamic empathy radar"
```

---

### Task 6: Implement the Complete Framework Product Page

**Files:**
- Create: `framework-page.css`
- Modify: `framework.html`
- Modify: `subpages.js`
- Test: `tools/verify-ui-fixes.mjs`

**Interfaces:**
- Consumes: `window.TURING_LEADERBOARD_VIEWS`, four `datasets.html?dimension=<id>` links, architecture tab buttons.
- Produces: framework hero, empathy chain, ability cards, three-layer architecture tabs, six-step process, metric/formula sections, coverage summary, dynamic radar interpretations, tools, application flow, and limitations disclosure.

- [ ] **Step 1: Add framework structure assertions**

Add:

```js
assert.match(framework, /MEI-EMPATHY-M/);
assert.match(framework, /感知线索/);
assert.match(framework, /理解处境/);
assert.match(framework, /形成回应/);
assert.match(framework, /守住边界/);
assert.match(framework, /href="datasets\.html\?dimension=affective"/);
assert.match(framework, /href="datasets\.html\?dimension=cognitive"/);
assert.match(framework, /href="datasets\.html\?dimension=concern"/);
assert.match(framework, /href="datasets\.html\?dimension=safety"/);
assert.match(framework, /限制与责任/);
```

- [ ] **Step 2: Run and verify failure on missing framework sections**

Run the Node command from Task 1.

Expected: FAIL on `MEI-EMPATHY-M`, empathy-chain text, or limitations section.

- [ ] **Step 3: Add framework-only responsive styles**

Copy the supplied new `framework-page.css` file byte-for-byte. Add its versioned stylesheet link only to `framework.html`.

- [ ] **Step 4: Patch framework sections in checklist order**

Use `apply_patch` with reference hunks for F-01 through F-14. Preserve the shared header/footer and feedback hooks; change only the framework main content and requirement-scoped footer copy.

- [ ] **Step 5: Patch framework interactions in `subpages.js`**

Add the supplied architecture-tab keyboard/click handling, shared-view SVG radar rendering, and dimension-specific interpretation list updates. Preserve existing navigation toggle, reveal animation, dialog, and year initialization code.

- [ ] **Step 6: Run automated checks**

Run:

```powershell
& 'C:\Users\32286\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tools\verify-ui-fixes.mjs
git diff --check
```

Expected: all framework and prior assertions pass or the script reaches a later page-specific assertion.

- [ ] **Step 7: Commit the framework slice**

```powershell
git add -- framework.html framework-page.css subpages.js tools/verify-ui-fixes.mjs
git commit -m "feat: expand standardized evaluation framework"
```

---

### Task 7: Finish Leaderboard and Owned-Page Checklist Items

**Files:**
- Modify: `leaderboard.html`
- Modify: `leaderboard.js`
- Modify: `owned.html`
- Test: `tools/verify-ui-fixes.mjs`

**Interfaces:**
- Consumes: existing leaderboard data/table renderer and existing owned-page structure.
- Produces: concise “综合结果” explanation, stable shared views interface, and brand/terminology-only owned-page changes.

- [ ] **Step 1: Add focused page assertions**

Add:

```js
assert.match(read('leaderboard.html'), /综合结果/);
assert.doesNotMatch(read('leaderboard.html'), /非官方总排名/);
assert.match(read('owned.html'), /通灵/);
assert.match(read('owned.html'), /共情智能/);
```

- [ ] **Step 2: Run and verify any remaining page failure**

Run the Node command from Task 1.

Expected: FAIL if the concise leaderboard explanation or owned-page copy is not yet present.

- [ ] **Step 3: Apply only L-01 through L-03 and O-01 hunks**

Use `apply_patch` to match the supplied concise leaderboard copy and owned-page brand wording. Do not copy unrelated layout or component changes.

- [ ] **Step 4: Run the complete static contract**

Run:

```powershell
& 'C:\Users\32286\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tools\verify-ui-fixes.mjs
```

Expected: `PASS: UI fixes and all public dataset synchronization checks are present` with exit code 0.

- [ ] **Step 5: Commit final page changes**

```powershell
git add -- leaderboard.html leaderboard.js owned.html tools/verify-ui-fixes.mjs
git commit -m "feat: finalize leaderboard and owned page copy"
```

---

### Task 8: Browser Verification, Scope Audit, and Deliverable Packaging

**Files:**
- Verify: all runtime files above
- Create deliverable: `C:\Users\32286\Documents\Codex\2026-08-24\wy\outputs\tongling-modified`
- Create deliverable: `C:\Users\32286\Documents\Codex\2026-08-24\wy\outputs\tongling-modified.zip`

**Interfaces:**
- Consumes: committed working tree runtime files.
- Produces: verified standalone website directory and ZIP without engineering-only content.

- [ ] **Step 1: Run the full static and scope verification**

```powershell
& 'C:\Users\32286\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tools\verify-ui-fixes.mjs
git diff --check HEAD~7..HEAD
git status --short
git diff HEAD~7..HEAD -- data.js comments.js feedback-module
```

Expected: Node PASS; no whitespace errors; clean working tree; no diff for `data.js`, `comments.js`, or `feedback-module`.

- [ ] **Step 2: Start a local HTTP server**

```powershell
& 'C:\Users\32286\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 8766 --bind 127.0.0.1
```

Expected: server listens at `http://127.0.0.1:8766/`.

- [ ] **Step 3: Perform browser interaction and responsive QA**

Open and verify:

```text
http://127.0.0.1:8766/index.html
http://127.0.0.1:8766/datasets.html
http://127.0.0.1:8766/framework.html
http://127.0.0.1:8766/leaderboard.html
http://127.0.0.1:8766/owned.html
```

At desktop and mobile widths, verify the dynamic radar switches, dataset capability/task filtering, `/` search focus, `Escape` clear, URL back/forward restoration, entry expansion, ten-field navigation, table horizontal scrolling, framework tabs, limitations disclosure, mobile navigation, and zero console errors. Record any unverified Safari-only behavior separately instead of claiming it passed.

- [ ] **Step 4: Build the clean deliverable directory**

Use explicit copy targets and exclude engineering artifacts:

```powershell
$source = (Get-Location).Path
$output = 'C:\Users\32286\Documents\Codex\2026-08-24\wy\outputs\tongling-modified'
New-Item -ItemType Directory -Path $output -Force | Out-Null
Get-ChildItem -LiteralPath $source -Force | Where-Object { $_.Name -notin @('.git', '.github', 'docs', '.codex-sync', '127.0.0.1%3A8766') } | Copy-Item -Destination $output -Recurse -Force
```

- [ ] **Step 5: Verify the deliverable and create ZIP**

```powershell
$output = 'C:\Users\32286\Documents\Codex\2026-08-24\wy\outputs\tongling-modified'
if ((Get-ChildItem "$output\public-datasets-data\*.xml").Count -ne 4) { throw 'Deliverable XML count mismatch' }
if ((Get-ChildItem "$output\public-datasets-data\assets\doc-*.jpg").Count -ne 21) { throw 'Deliverable image count mismatch' }
Compress-Archive -LiteralPath $output -DestinationPath 'C:\Users\32286\Documents\Codex\2026-08-24\wy\outputs\tongling-modified.zip' -CompressionLevel Optimal
```

Expected: directory and ZIP exist; required resource counts are exact.

- [ ] **Step 6: Prepare the handoff report**

Report: changed and added runtime files, representative code snippets for the dataset loader/safe renderer/radar interface, static-test output, browser QA performed, unresolved browser coverage, and links to the clean folder/ZIP. Do not include process-only docs in the deliverable list.
