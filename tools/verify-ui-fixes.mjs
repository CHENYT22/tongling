import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');

const catalog = JSON.parse(read('public-datasets-data/catalog.json'));
assert.equal(catalog.totalEntries, 193);
assert.equal(catalog.totalTasks, 33);
assert.equal(catalog.totalSections, 1930);
assert.equal(catalog.categories.length, 4);

const app = read('app.js');
const leaderboard = read('leaderboard.js');
const publicDatasets = read('public-datasets.js');
const datasetsHtml = read('datasets.html');
const datasetsCss = read('datasets-integrated.css');
const indexHtml = read('index.html');
const styles = read('styles.css');
const subpages = read('subpages.js');
const frameworkCss = read('framework-page.css');
const publicDatasetXml = {
  affective: read('public-datasets-data/affective.xml'),
  cognitive: read('public-datasets-data/cognitive.xml'),
  concern: read('public-datasets-data/concern.xml'),
  safety: read('public-datasets-data/safety.xml')
};
const framework = read('framework.html');
const ownedHtml = read('owned.html');
const css = read('vitality-blue.css');
const pages = ['index.html', 'datasets.html', 'framework.html', 'leaderboard.html', 'owned.html'].map(read).join('\n');

const combinedDatasetXml = Object.values(publicDatasetXml).join('\n');
const countMatches = (value, pattern) => (value.match(pattern) || []).length;

function tableBySheetId(xml, sheetId) {
  const match = xml.match(new RegExp('<table[^>]*data-sheet-id="' + sheetId + '"[^>]*>[\\s\\S]*?</table>'));
  assert.ok(match, 'missing embedded sheet ' + sheetId);
  return match[0];
}

function assertTableShape(xml, sheetId, totalRows, columns) {
  const table = tableBySheetId(xml, sheetId);
  const head = table.match(/<thead>[\s\S]*?<\/thead>/)?.[0] || '';
  assert.equal(countMatches(table, /<tr(?:\s|>)/g), totalRows, sheetId + ' total row count');
  assert.equal(countMatches(head, /<th(?:\s|>)/g), columns, sheetId + ' column count');
}

assert.doesNotMatch(pages, /图灵\s*2\.0/);
assert.doesNotMatch(pages, /大模型情感智能/);
assert.match(pages, /通灵/);
assert.match(pages, /大模型共情智能/);
assert.match(read('index.html'), /songyu@dezhipu\.com/);
assert.match(read('framework.html'), /songyu@dezhipu\.com/);
assert.match(read('gate.js'), /本站已启用访问保护/);
assert.match(read('styles.css'), /\.mei-layout[\s\S]*?minmax\(/);

// Interaction preview: homepage section navigation.
assert.match(indexHtml, /class="home-content-layout"/);
assert.match(indexHtml, /class="home-section-nav"/);
['home-capabilities', 'home-datasets', 'home-framework', 'home-results', 'home-goals', 'home-submit'].forEach(function (sectionId) {
  assert.match(indexHtml, new RegExp('id="' + sectionId + '"'));
  assert.match(indexHtml, new RegExp('href="#' + sectionId + '"'));
});
assert.match(app, /function initHomeSectionNav\(\)/);
assert.match(styles, /\.home-section-nav\s*\{[\s\S]*?position:\s*sticky;/);
assert.match(styles, /\.home-content-layout\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\);/);
assert.match(styles, /\.home-content-main\s*\{[\s\S]*?grid-column:\s*1;[\s\S]*?grid-row:\s*1;/);
assert.match(styles, /\.home-section-nav\s*\{[\s\S]*?top:\s*max\(88px,\s*calc\(50vh\s*-\s*168px\)\);/);
assert.match(styles, /\.home-section-nav\s*\{[\s\S]*?width:\s*150px;/);
assert.doesNotMatch(styles, /\.home-section-nav\s*\{[\s\S]*?transform:\s*translateY\(-50%\);/);
assert.match(styles, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.home-section-nav/);
assert.match(css, /\.lb-table th:first-child,\s*\.lb-table th:nth-child\(2\)\s*\{[^}]*background:\s*#ffffff;/);
assert.match(css, /\.lb-table th:nth-child\(2\),[\s\S]*?\.lb-table td:nth-child\(2\)\s*\{[\s\S]*?width:\s*156px;/);
assert.match(css, /\.lb-table th:nth-child\(2\),\s*\.lb-table td:nth-child\(2\)\s*\{[^}]*border-right:\s*1px solid var\(--line\);/);
assert.doesNotMatch(css, /\.lb-table th:nth-child\(2\),\s*\.lb-table td:nth-child\(2\)\s*\{[^}]*box-shadow:/);
assert.match(css, /\.cta-section\s*\{[\s\S]*?background:\s*linear-gradient\(180deg,\s*#eef6ff\s*0%,\s*#f8fbff\s*100%\);/);
assert.match(css, /\.cta-title\s*\{[\s\S]*?color:\s*var\(--ink\);/);
assert.match(css, /\.cta-desc\s*\{[\s\S]*?color:\s*var\(--muted\);/);
assert.match(css, /\.cta-section \.btn-light\s*\{[\s\S]*?background:\s*#ffffff;[\s\S]*?color:\s*var\(--blue\);/);
assert.doesNotMatch(css, /\.cta-section\s*\{[\s\S]*?background:\s*linear-gradient\(145deg,\s*#061936,\s*#082652\);/);

assert.match(app, /var activeKey = views\[key\] \? key : 'overview';/);
assert.match(app, /function renderRadar\(viewKey, alt\)/);
assert.match(app, /renderRadar\(activeKey, v\.alt\);/);
assert.match(app, /wrap\._setRadarView = focusView;/);

assert.match(leaderboard, /head\.innerHTML = '';/);
assert.match(leaderboard, /body\.innerHTML = '';/);
assert.match(css, /--lb-sticky-rank-width:\s*66px;/);
assert.match(css, /\.lb-table th:first-child,[\s\S]*?width:\s*var\(--lb-sticky-rank-width\);/);
assert.match(css, /\.lb-table th:nth-child\(2\),[\s\S]*?left:\s*var\(--lb-sticky-rank-width\);/);

assert.match(publicDatasets, /const SECTION_ORDER = \[/);
assert.match(publicDatasets, /String\(entry\.globalIndex\)\.padStart\(3, "0"\)/);
assert.match(publicDatasets, /sort:\s*"document"/);
assert.match(publicDatasets, /function renderSourceContent\(section, panel\)/);
assert.match(publicDatasets, /function revealCategoryDonut\(donut\)/);
assert.match(publicDatasets, /prefers-reduced-motion:\s*reduce/);
assert.match(publicDatasets, /classList\.add\("is-revealing"\)/);
assert.match(publicDatasets, /const wrap = create\("div", "table-scroll"\);/);
assert.match(datasetsHtml, /id="dataset-search"/);
assert.match(datasetsHtml, /id="task-filter"/);
assert.match(datasetsHtml, /id="sort-order"/);
assert.match(datasetsHtml, /id="clear-filters"/);
assert.match(datasetsHtml, /class="entry-list-shell"/);
assert.match(datasetsHtml, /id="dataset-detail-layer"/);
assert.match(datasetsHtml, /id="dataset-detail-close"/);
assert.match(datasetsHtml, /id="dataset-detail-content"/);
assert.match(datasetsHtml, /193 个可验证评测条目/);
assert.match(datasetsHtml, /10 项内容架构/);
assert.match(datasetsCss, /\.table-scroll\s*\{[\s\S]*?overflow-x:\s*auto;/);
assert.match(datasetsCss, /\.source-resource-grid/);
assert.match(datasetsCss, /@property\s+--donut-reveal/);
assert.match(datasetsCss, /@keyframes\s+dataset-donut-reveal/);
assert.match(datasetsCss, /\.category-donut\.is-revealing\s*\{[\s\S]*?animation:\s*dataset-donut-reveal/);
assert.match(datasetsCss, /\.distribution\.donut-is-revealing \.donut-center/);
assert.match(datasetsCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.category-donut\.is-revealing/);
assert.match(datasetsCss, /animation:\s*dataset-donut-reveal 2000ms/);
assert.match(publicDatasets, /function replayCategoryDonut\(\)/);
assert.match(datasetsHtml, /<button[^>]*class="donut-wrap"/);
// Visual consistency: public dataset page uses the shared light surface language.
assert.match(datasetsCss, /\/\* Independent page visual alignment: public datasets\. \*\//);
assert.match(datasetsCss, /\.dataset-page\s*\{[\s\S]*?--radius:\s*16px;/);
assert.match(datasetsCss, /\.dataset-page \.distribution\s*\{[\s\S]*?box-shadow:\s*none;/);
assert.match(datasetsCss, /\.dataset-sidebar\s*\{[\s\S]*?border-radius:\s*16px;[\s\S]*?box-shadow:\s*none;/);
assert.match(datasetsCss, /\.browser-panel\s*\{[\s\S]*?border-radius:\s*16px;[\s\S]*?box-shadow:\s*none;/);
// Desktop custom selects keep the native control on compact screens.
assert.match(datasetsHtml, /class="select-control custom-select-control"[\s\S]*?id="task-filter"/);
assert.match(datasetsHtml, /class="select-control sort-control custom-select-control"[\s\S]*?id="sort-order"/);
assert.match(publicDatasets, /function initCustomSelect\(select\)/);
assert.match(publicDatasets, /function refreshCustomSelect\(select\)/);
assert.match(publicDatasets, /event\.key === "ArrowDown"/);
assert.match(publicDatasets, /event\.key === "Escape"/);
assert.match(publicDatasets, /function closeEntryDetail\(/);
assert.match(publicDatasets, /function openEntryDetail\(/);
assert.match(publicDatasets, /function positionEntryDetailLayer\(head, layer\)/);
assert.match(publicDatasets, /headRect\.bottom - shellRect\.top \+ 10/);
assert.match(publicDatasets, /--detail-layer-top/);
const buildDetailStart = publicDatasets.indexOf('function buildEntryDetail');
const buildDetailEnd = publicDatasets.indexOf('function closeEntryDetail', buildDetailStart);
const buildDetailBlock = publicDatasets.slice(buildDetailStart, buildDetailEnd);
assert.doesNotMatch(buildDetailBlock, /entry-detail-head/);
assert.doesNotMatch(buildDetailBlock, /detail-eyebrow/);
assert.match(publicDatasets, /entry\.links\.length \+ " 个外部资源"/);
assert.match(publicDatasets, /function resetDatasetListScroll\(hasEntries\)/);
assert.match(publicDatasets, /requestAnimationFrame\(function \(\) \{[\s\S]*?list\.scrollTop = 0;/);
assert.match(publicDatasets, /closeEntryDetail\(false\);[\s\S]*?const hasEntries = renderEntries\(\);[\s\S]*?resetDatasetListScroll\(hasEntries\);/);
assert.match(datasetsCss, /@media\s*\(min-width:\s*901px\)[\s\S]*?\.custom-select-native/);
assert.match(datasetsCss, /\.custom-select-menu\s*\{[\s\S]*?border-radius:\s*12px;[\s\S]*?box-shadow:/);
assert.match(datasetsCss, /\.custom-select-option\[aria-selected="true"\]/);
assert.match(datasetsCss, /\.entry-list-shell\s*\{[\s\S]*?position:\s*relative;/);
assert.match(datasetsCss, /\.entry-list\s*\{[\s\S]*?overflow-y:\s*auto;/);
assert.match(datasetsCss, /\.dataset-detail-layer\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?z-index:/);
assert.match(datasetsCss, /\.dataset-detail-layer\s*\{[\s\S]*?width:\s*min\(calc\(100% - 64px\),\s*860px\);/);
assert.match(datasetsCss, /\.dataset-detail-layer\s*\{[\s\S]*?top:\s*var\(--detail-layer-top,\s*28px\);/);
assert.match(datasetsCss, /\.dataset-detail-layer\s*\{[\s\S]*?height:\s*min\(390px,\s*calc\(100% - var\(--detail-layer-top, 28px\) - 16px\)\);/);
assert.match(datasetsCss, /\.dataset-detail-layer\s*\{[\s\S]*?border-radius:\s*16px;/);
assert.match(datasetsCss, /\.dataset-detail-layer\s*\{[\s\S]*?box-shadow:/);
assert.doesNotMatch(datasetsCss, /\.dataset-detail-layer\s*\{[^}]*inset:\s*0;/);
assert.match(datasetsCss, /\.dataset-detail-close:focus-visible/);

// Interaction preview: dataset hierarchy, persistent navigation and feedback.
assert.match(datasetsHtml, /class="[^"]*dataset-workspace[^"]*"/);
assert.match(datasetsHtml, /id="dataset-sidebar"/);
assert.match(datasetsHtml, /id="dataset-overview-button"/);
assert.match(datasetsHtml, /id="dataset-results-title"/);
assert.match(publicDatasets, /function renderDatasetNavigation\(\)/);
assert.match(publicDatasets, /function updateResultsHeader\(entries\)/);
assert.doesNotMatch(publicDatasets, /categoryCard\(null,/);
assert.match(datasetsCss, /\.dataset-sidebar\s*\{[\s\S]*?position:\s*sticky;/);
assert.match(datasetsCss, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.dataset-workspace/);

assert.equal(countMatches(combinedDatasetXml, /<h3(?:\s|>)/g), 193, 'public dataset entry count');
assert.equal(countMatches(combinedDatasetXml, /<h4(?:\s|>)/g), 1930, 'public dataset field count');
assert.equal(countMatches(combinedDatasetXml, /data-sheet-id=/g), 968, 'expanded embedded sheet count');
assert.equal(countMatches(combinedDatasetXml, /<sheet(?:\s|>)/g), 0, 'unexpanded sheet placeholders');
assert.doesNotMatch(combinedDatasetXml, /细分任务理由/);
assert.doesNotMatch(combinedDatasetXml, /本地\s*(?:PDF|文件)|file:\/\/|[A-Z]:\\/i);

Object.entries(publicDatasetXml).forEach(function ([category, xml]) {
  const entries = xml.split(/(?=<h3(?:\s|>))/).slice(1);
  entries.forEach(function (entry, index) {
    assert.equal(countMatches(entry, /<h4(?:\s|>)/g), 10, category + ' entry ' + (index + 1) + ' field count');
  });
});

const epitomeMatch = publicDatasetXml.affective.match(/<h3[^>]*>EPITOME 数据集<\/h3>/);
assert.ok(epitomeMatch, 'missing affective EPITOME entry');
const epitomeStart = epitomeMatch.index;
const epitomeEnd = publicDatasetXml.affective.indexOf('<h3', epitomeStart + epitomeMatch[0].length);
const epitome = publicDatasetXml.affective.slice(epitomeStart, epitomeEnd < 0 ? undefined : epitomeEnd);
const epitomeSheetIds = Array.from(epitome.matchAll(/data-sheet-id="([^"]+)"/g), (match) => match[1]);
assert.equal(epitomeSheetIds.length, 11, 'EPITOME embedded sheet count');
['ignsZB', 'ZGUpZo', 'MtyT9j'].forEach((sheetId) => assert.ok(epitomeSheetIds.includes(sheetId), 'EPITOME missing ' + sheetId));
assertTableShape(epitome, 'ignsZB', 5, 8);
assertTableShape(epitome, 'ZGUpZo', 3, 8);
assertTableShape(epitome, 'MtyT9j', 4, 2);
['TalkLife', 'Reddit', 'RoBERTa', 'Our Model', '79.93', '68.49', '365 次引用'].forEach(function (value) {
  assert.ok(epitome.includes(value), 'EPITOME missing ' + value);
});

assert.match(framework, /href="datasets\.html\?dimension=affective"/);
assert.match(framework, /href="datasets\.html\?dimension=cognitive"/);
assert.match(framework, /href="datasets\.html\?dimension=concern"/);
assert.match(framework, /href="datasets\.html\?dimension=safety"/);
assert.match(framework, /MEI-EMPATHY-M/);
assert.match(framework, /感知线索/);
assert.match(framework, /理解处境/);
assert.match(framework, /形成回应/);
assert.match(framework, /守住边界/);
assert.match(framework, /限制与责任/);

// Interaction preview: framework cards share one clear anchor behavior.
assert.match(framework, /class="framework-jump-nav"/);
['framework-overview', 'metrics-comparability', 'coverage-overview', 'platform-toolkit'].forEach(function (sectionId) {
  assert.match(framework, new RegExp('id="' + sectionId + '"'));
  assert.match(framework, new RegExp('href="#' + sectionId + '"'));
});
assert.match(subpages, /function initFrameworkAnchors\(\)/);
assert.match(frameworkCss, /\.framework-jump-card:focus-visible/);
assert.equal(countMatches(framework, /class="framework-jump-index"/g), 0, 'compact framework jump navigation');
assert.doesNotMatch(framework, /class="framework-jump-action"/);
assert.match(framework, /<span><b>测评框架<\/b><small>查看能力结构与评测逻辑<\/small><\/span>/);
assert.match(framework, /class="framework-content-layout"/);
assert.match(framework, /framework-page\.css\?v=20260827-nav-hover/);
assert.match(framework, /subpages\.js\?v=20260827-sidebar-refresh/);
assert.match(framework, /class="framework-section-nav"/);
assert.match(framework, /class="framework-content-main"/);
const frameworkSectionIds = [
  'framework-overview', 'framework-capabilities', 'framework-architecture',
  'framework-workflow', 'metrics-comparability', 'coverage-overview',
  'framework-results', 'platform-toolkit', 'framework-limitations'
];
frameworkSectionIds.forEach(function (sectionId) {
  assert.match(framework, new RegExp('id="' + sectionId + '"[^>]*data-framework-section-target'));
  assert.match(framework, new RegExp('data-framework-section="' + sectionId + '"'));
});
assert.equal(countMatches(framework, /data-framework-section="/g), 9, 'framework side navigation item count');
assert.match(subpages, /function initFrameworkSectionNav\(\)/);
assert.match(subpages, /data-framework-section-target/);
assert.match(subpages, /IntersectionObserver/);
assert.match(frameworkCss, /\.framework-section-nav\s*\{[\s\S]*?position:\s*sticky;/);
assert.match(frameworkCss, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.framework-section-nav/);
assert.match(subpages, /function cueArchitectureProgress\(activeTab\)/);
assert.match(subpages, /classList\.add\('is-sweeping'\)/);
assert.match(subpages, /classList\.add\('is-next'\)/);
assert.match(frameworkCss, /@keyframes architecture-tab-sweep/);
assert.match(frameworkCss, /@keyframes architecture-next-cue/);
assert.match(frameworkCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.architecture-tab\.is-sweeping/);
// Visual consistency: framework page follows the same light, flat card system.
assert.match(frameworkCss, /\/\* Independent page visual alignment: evaluation framework\. \*\//);
assert.match(frameworkCss, /\.framework-stat\s*\{[\s\S]*?border-radius:\s*14px;[\s\S]*?box-shadow:\s*none;/);
assert.match(frameworkCss, /\.framework-jump-nav\s*\{[\s\S]*?box-shadow:\s*none;/);
assert.match(frameworkCss, /\.framework-capability-card,[\s\S]*?\.tool-access-card\s*\{[\s\S]*?border-radius:\s*14px;[\s\S]*?box-shadow:\s*none;/);
assert.match(frameworkCss, /\/\* Unified static information cards\. \*\//);
assert.match(frameworkCss, /\.workflow-card,[\s\S]*?\.tool-access-card,[\s\S]*?\.quickstart-steps article\s*\{[\s\S]*?background:\s*#fbfdff;[\s\S]*?box-shadow:\s*none;/);
assert.match(frameworkCss, /\.workflow-card:hover\s*\{[\s\S]*?transform:\s*none;[\s\S]*?background:\s*#fbfdff;/);
assert.match(frameworkCss, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.framework-hero \.section-label\s*\{[\s\S]*?font-size:\s*10px;[\s\S]*?letter-spacing:\s*\.06em;/);

assert.match(read('leaderboard.html'), /综合结果/);
assert.doesNotMatch(read('leaderboard.html'), /非官方总排名/);
assert.match(ownedHtml, /通灵/);
assert.match(ownedHtml, /共情智能/);
assert.equal(countMatches(ownedHtml, /class="card static-info-card reveal"/g), 3, 'owned static card count');
assert.doesNotMatch(ownedHtml, /class="card card-hover reveal"/);
assert.match(css, /\.static-info-card\s*\{[\s\S]*?box-shadow:\s*none;[\s\S]*?cursor:\s*default;/);

console.log('PASS: UI fixes and all public dataset synchronization checks are present');
