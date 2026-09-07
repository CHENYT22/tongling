import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
const styles = read('styles.css');
const frameworkPageCss = read('framework-page.css');
const cardSystemCss = read('card-system.css');
const colorSystemCss = existsSync(fileURLToPath(new URL('color-system.css', root))) ? read('color-system.css') : '';
const siteNavigationUrl = new URL('site-navigation.js', root);
const siteNavigation = existsSync(fileURLToPath(siteNavigationUrl)) ? read('site-navigation.js') : '';
const publicDatasetXml = {
  affective: read('public-datasets-data/affective.xml'),
  cognitive: read('public-datasets-data/cognitive.xml'),
  concern: read('public-datasets-data/concern.xml'),
  safety: read('public-datasets-data/safety.xml')
};
const framework = read('framework.html');
const css = read('vitality-blue.css');
const pages = ['index.html', 'datasets.html', 'framework.html', 'leaderboard.html', 'owned.html'].map(read).join('\n');
const activeTypographyCss = [styles, css, datasetsCss, frameworkPageCss, cardSystemCss].join('\n');
const activeTypographySource = activeTypographyCss + '\n' + pages;

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
['--font-hero: 72px', '--font-display: 48px', '--font-title: 22px', '--font-body: 16px', '--font-caption: 13px'].forEach(function (token) {
  assert.ok(styles.includes(token), 'missing typography token ' + token);
});
Array.from(activeTypographySource.matchAll(/font-size\s*:\s*([^;{}"']+)(?=[;}"'])/g), (match) => match[1].trim()).forEach(function (value) {
  assert.match(value, /^var\(--font-(?:hero|display|title|body|caption)\)$/, 'unmapped font-size ' + value);
});
assert.doesNotMatch(activeTypographySource, /font\s*:[^;{}"']*(?:\d+(?:\.\d+)?px|clamp\()/, 'unmapped font shorthand');
assert.match(siteNavigation, /const\s+DIRECTORY\s*=\s*\{/);
['index.html', 'datasets.html', 'framework.html', 'owned.html', 'leaderboard.html'].forEach(function (page) {
  assert.match(siteNavigation, new RegExp("['\"]" + page.replace('.', '\\.') + "['\"]\\s*:"), 'missing directory configuration for ' + page);
  assert.match(read(page), /<script\s+src="site-navigation\.js\?v=[^"]+"><\/script>/, 'missing shared directory script on ' + page);
  assert.match(read(page), /<link\s+rel="stylesheet"\s+href="card-system\.css\?v=[^"]+"\s*\/>/, 'missing shared card system on ' + page);
  assert.match(read(page), /<link\s+rel="stylesheet"\s+href="color-system\.css\?v=[^"]+"\s*\/>/, 'missing shared color system on ' + page);
});
[
  '--color-brand-primary: #1677ff',
  '--color-text-primary: #0b1f3a',
  '--color-surface-page: #f4f8ff',
  '--cap-affective-accent: #1677ff',
  '--cap-cognitive-accent: #705cff',
  '--cap-concern-accent: #3d9fe8',
  '--cap-safety-accent: #2f9c8a',
  '--cap-safety-ink: #24766a',
  '--cap-safety-soft: #eaf7f4'
].forEach(function (token) {
  assert.ok(colorSystemCss.includes(token), 'missing semantic color token ' + token);
});
assert.match(colorSystemCss, /\.dataset-page\s*\{[^}]*--dataset-safety-accent:\s*var\(--cap-safety-accent\);[^}]*--dataset-safety-soft:\s*var\(--cap-safety-soft\);[^}]*--dataset-safety-ink:\s*var\(--cap-safety-ink\);/);
assert.match(colorSystemCss, /\.framework-page \.chain-safety\s*\{[^}]*border-top-color:\s*var\(--cap-safety-accent\);/);
assert.match(colorSystemCss, /\.framework-page :where\(\.chain-node,/,'framework surface defaults must stay lower-specificity than capability colors');
assert.match(colorSystemCss, /\.tone-safety \.capability-index\s*\{[^}]*color:\s*var\(--cap-safety-ink\);/);
assert.match(colorSystemCss, /\.dot-safe\s*\{[^}]*background:\s*var\(--cap-safety-accent\);/);
assert.match(colorSystemCss, /\.tag-safety\s*\{[^}]*background:\s*var\(--cap-safety-soft\);[^}]*color:\s*var\(--cap-safety-ink\);/);
assert.match(colorSystemCss, /\.ds-tag-safety\s*\{[^}]*color:\s*var\(--cap-safety-ink\);/,'dataset safety tags must use the accessible dark teal text');
assert.match(colorSystemCss, /\.lb-tab\[data-view="safe"\]\.active\s*\{[^}]*background:\s*var\(--cap-safety-ink\);/);
['--card-radius-data: 12px', '--card-radius-content: 14px', '--card-radius-panel: 20px', '--card-radius-list: 16px'].forEach(function (token) {
  assert.ok(cardSystemCss.includes(token), 'missing card token ' + token);
});
assert.match(cardSystemCss, /a\.card,[\s\S]*?\.framework-capability-card[\s\S]*?cursor:\s*pointer;/);
assert.match(cardSystemCss, /\.workflow-card:hover[\s\S]*?transform:\s*none;/);
assert.match(cardSystemCss, /\.chain-node[\s\S]*?border-radius:\s*var\(--card-radius-content\);/);
assert.match(cardSystemCss, /\.quickstart-section[\s\S]*?border-radius:\s*var\(--card-radius-panel\);/);
assert.match(cardSystemCss, /\.mei-card\.is-active[\s\S]*?box-shadow:/);
assert.match(cardSystemCss, /\.limitation-grid[\s\S]*?border-radius:\s*var\(--card-radius-list\);/);
assert.match(
  cardSystemCss,
  /\.lb-table-wrap\s*\{[^}]*overflow-x:\s*auto;[^}]*overflow-y:\s*hidden;/,
  'leaderboard tables must preserve horizontal scrolling'
);
assert.match(
  css,
  /\.lb-table thead th:first-child,\s*\.lb-table thead th:nth-child\(2\)\s*\{[^}]*background:\s*#f4f8ff;/,
  'sticky leaderboard headers must have an opaque background to prevent overlap artifacts'
);
assert.doesNotMatch(read('owned.html'), /class="card card-hover reveal"/);
assert.match(siteNavigation, /className\s*=\s*['"]site-directory-panel['"]/);
assert.match(siteNavigation, /panel\.dataset\.contentSize\s*=/);
assert.match(siteNavigation, /--directory-left/);
assert.match(styles, /\.site-directory-panel\[data-content-size="compact"\][\s\S]*?--directory-width:\s*440px;[\s\S]*?--directory-intro:\s*145px;/);
assert.match(styles, /\.site-directory-panel\[data-content-size="wide"\][\s\S]*?--directory-width:\s*660px;[\s\S]*?--directory-intro:\s*165px;/);
assert.match(styles, /\.site-directory-panel\[data-content-size="medium"\] \.site-directory-groups\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
assert.match(siteNavigation, /setAttribute\(['"]aria-expanded['"]/);
assert.match(siteNavigation, /event\.key\s*===\s*['"]Escape['"]/);
assert.match(siteNavigation, /addEventListener\(['"]mouseenter['"]/);
assert.match(siteNavigation, /addEventListener\(['"]focusin['"]/);
assert.match(siteNavigation, /className\s*=\s*['"]mobile-directory-group['"]/);
assert.match(siteNavigation, /IntersectionObserver/);
assert.match(styles, /\.nav-links\s*\{[^}]*margin-left:\s*auto;[^}]*gap:\s*0;/, 'desktop navigation must align as a compact group on the right');
assert.match(styles, /\.nav-links a\s*\{[^}]*font-size:\s*var\(--font-body\);[^}]*padding:\s*6px\s+10px;/, 'desktop navigation labels must use the body scale');
assert.match(styles, /@media\s*\(min-width:\s*901px\)[\s\S]*?\.nav-actions\s*\{[^}]*margin-left:\s*4px;/, 'desktop utilities must sit directly after the navigation group');
assert.match(styles, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.nav-actions\s*\{[^}]*margin-left:\s*auto;/, 'mobile header actions must remain right aligned');
assert.match(styles, /\.site-directory-panel\[data-content-size="standard"\]\s*\{[^}]*--directory-width:\s*600px;[^}]*--directory-intro:\s*160px;/, 'standard page directory must fit the approved compact footprint');
assert.match(styles, /\.site-directory-panel-inner\s*\{[^}]*gap:\s*20px;[^}]*padding:\s*18px;/, 'page directory inner spacing must be compact');
assert.match(styles, /\.nav-links \.site-directory-link\s*\{[^}]*padding:\s*7px\s+8px;[^}]*font-size:\s*var\(--font-caption\);/, 'page directory links must use the caption scale');
assert.match(frameworkPageCss, /\.framework-capability-card \.capability-question\s*\{[^}]*color:\s*#111827;/, 'framework capability questions must use the unified near-black text color');
assert.match(frameworkPageCss, /\.framework-capability-card \.capability-datasets span\s*\{[^}]*color:\s*#111827;/, 'framework dataset labels must use the unified near-black text color');
assert.match(datasetsCss, /\.dataset-page \.hero-facts > div\s*\{[^}]*min-height:\s*40px;[^}]*padding:\s*7px\s+12px;[^}]*border-radius:\s*999px;/, 'dataset hero facts must use the shared 40px pill geometry');
assert.match(frameworkPageCss, /\.framework-hero-tags span\s*\{[^}]*min-height:\s*40px;[^}]*padding:\s*7px\s+12px;[^}]*border-radius:\s*999px;/, 'framework hero tags must use the shared 40px pill geometry');
assert.match(frameworkPageCss, /\.framework-hero-tags span\s*\{[^}]*color:\s*var\(--muted\);/, 'framework hero tag labels must match the public dataset muted text color');
assert.match(read('index.html'), /<section class="hero" id="home-overview">/);
assert.match(read('index.html'), /id="home-capabilities"/);
assert.match(read('index.html'), /id="home-submit"/);
assert.match(read('framework.html'), /id="framework-overview"/);
assert.match(read('framework.html'), /id="framework-limitations"/);
assert.match(read('owned.html'), /id="owned-overview"/);
assert.match(read('owned.html'), /id="owned-signals"/);
assert.match(read('leaderboard.html'), /id="leaderboard-overview"/);
assert.match(read('leaderboard.html'), /id="leaderboard-results"/);
assert.match(leaderboard, /location\.hash\.replace\(['"]#view-['"]/);
assert.match(styles, /@media\s*\(min-width:\s*1600px\)[\s\S]*?body:not\(\.dataset-view\)\s*\{[^}]*--shell-max:\s*1480px;[^}]*--nav-max:\s*1480px;/);
assert.match(css, /@media\s*\(min-width:\s*1600px\)[\s\S]*?body:not\(\.dataset-view\) \.hero\s*\{[^}]*min-height:\s*800px;/);
assert.match(css, /@media\s*\(min-width:\s*1600px\)[\s\S]*?body:not\(\.dataset-view\) \.hero-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*\.95fr\)\s+minmax\(600px,\s*1\.05fr\);/);
assert.doesNotMatch(css, /\n\s{2}\.hero\s*\{\s*\n\s*min-height:\s*800px;/);
assert.match(css, /@media\s*\(min-width:\s*1600px\)[\s\S]*?\.owned-card\s*\{[^}]*padding:\s*64px;/);
assert.match(css, /\.owned-card\s*\{[^}]*background:\s*linear-gradient\(145deg,\s*#f8fbff\s+0%,\s*#ffffff\s+100%\);/);
assert.match(css, /@media\s*\(min-width:\s*1600px\)[\s\S]*?\.lb-table td\s*\{[^}]*padding:\s*20px\s+28px;/);
assert.match(frameworkPageCss, /@media\s*\(min-width:\s*1600px\)[\s\S]*?\.framework-hero-stats\s*\{[^}]*width:\s*420px;/);
assert.doesNotMatch(pages, /大模型情感智能/);
assert.match(pages, /通灵/);
assert.match(pages, /大模型共情智能/);
assert.match(read('index.html'), /songyu@dezhipu\.com/);
assert.match(read('framework.html'), /songyu@dezhipu\.com/);
for (const page of ['index.html', 'datasets.html', 'framework.html', 'leaderboard.html', 'owned.html']) {
  const html = read(page);
  assert.equal(/<script\b[^>]*\bsrc=["'][^"']*\bgate\.js\b/i.test(html), false, page + ' must open without password verification');
  assert.equal(/(?:src|href)=["'][^"']*(?:feedback-module\/|\bcomments\.js\b)/i.test(html), false, page + ' must not load the feedback system');
}
assert.match(read('styles.css'), /\.mei-layout[\s\S]*?minmax\(/);

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
assert.match(publicDatasets, /const wrap = create\("div", "table-scroll"\);/);
assert.match(datasetsHtml, /id="dataset-search"/);
assert.match(datasetsHtml, /id="task-filter"/);
assert.match(datasetsHtml, /id="sort-order"/);
assert.match(datasetsHtml, /id="clear-filters"/);
assert.match(datasetsHtml, /193 个可验证评测条目/);
assert.match(datasetsHtml, /可检索、筛选并在弹窗中阅读全文。/);
assert.match(datasetsCss, /\.table-scroll\s*\{[\s\S]*?overflow-x:\s*auto;/);
assert.match(datasetsCss, /\.source-resource-grid/);
assert.match(datasetsCss, /\.dataset-page \.dataset-scroll-nav\s*\{[^}]*top:\s*auto;[^}]*bottom:\s*20px;[^}]*width:\s*auto;/);
assert.match(datasetsCss, /\.dataset-page \.scroll-nav-launcher\s*\{[^}]*display:\s*flex;/);
assert.match(datasetsCss, /\.dataset-page \.scroll-nav-body\s*\{[^}]*display:\s*none;[^}]*position:\s*absolute;[^}]*bottom:\s*54px;[^}]*width:\s*240px;/);
assert.match(datasetsCss, /\.dataset-page \.dataset-scroll-nav\.is-expanded \.scroll-nav-body\s*\{\s*display:\s*block;/);
assert.doesNotMatch(datasetsCss, /@media\s*\(max-width:\s*1399px\)[\s\S]*?\.scroll-nav-launcher/);
assert.match(datasetsCss, /@media\s*\(min-width:\s*1600px\)[\s\S]*?\.dataset-page \.section-shell\s*\{[^}]*1480px/);
assert.match(datasetsCss, /\.dataset-page \.hero-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+420px;/);
assert.match(datasetsCss, /@media\s*\(min-width:\s*1600px\)[\s\S]*?\.dataset-page \.hero-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+480px;/);
assert.match(datasetsCss, /\.dataset-page \.donut-wrap\s*\{[^}]*width:\s*124px;[^}]*height:\s*124px;[^}]*flex:\s*0\s+0\s+124px;/);
assert.match(datasetsCss, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.dataset-page \.donut-wrap\s*\{[^}]*width:\s*96px;[^}]*height:\s*96px;[^}]*flex:\s*0\s+0\s+96px;/);
assert.match(datasetsCss, /\.dataset-page \.dataset-parent\s*\{[^}]*min-height:\s*90px;/);
assert.match(datasetsCss, /\.dataset-page \.category-card\s*\{[^}]*min-height:\s*90px;/);
assert.match(datasetsCss, /@media\s*\(min-width:\s*1600px\)[\s\S]*?\.dataset-page \.dataset-parent, \.dataset-page \.category-card\s*\{[^}]*min-height:\s*104px;/);
assert.match(publicDatasets, /applyCategoryPalette\(detailDialog, entry\.category\);/);
assert.match(datasetsCss, /\.dataset-page \.detail-eyebrow\s*\{[^}]*border:\s*1px solid var\(--accent\);[^}]*background:\s*var\(--category-soft\);[^}]*color:\s*var\(--category-ink\);/);
assert.match(datasetsCss, /\.dataset-page \.section-nav-button\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent;/);
assert.match(datasetsCss, /\.dataset-page \.dataset-detail-nav\s*\{[^}]*display:\s*grid;[^}]*grid-template-rows:\s*repeat\(10,\s*minmax\(0,\s*1fr\)\);[^}]*overflow:\s*hidden;/);
assert.match(datasetsCss, /\.dataset-page \.section-nav-button\s*\{[^}]*margin:\s*0;/);
assert.doesNotMatch(datasetsCss, /\.dataset-page \.section-nav-button\s*\{[^}]*border-left-width:/);
assert.match(datasetsCss, /\.dataset-page \.section-nav-button\.is-active\s*\{[^}]*background:\s*var\(--white\);[^}]*color:\s*var\(--blue\);/);
assert.doesNotMatch(datasetsCss, /\.dataset-page \.section-nav-button\.is-active\s*\{[^}]*box-shadow:/);
assert.match(datasetsCss, /\.dataset-page \.browser-toolbar\s*\{[^}]*grid-template-columns:\s*176px\s+140px/);
assert.match(datasetsCss, /@media\s*\(min-width:\s*1600px\)[\s\S]*?\.dataset-page \.browser-toolbar\s*\{[^}]*grid-template-columns:\s*184px\s+160px/);
assert.match(styles, /\.subpage-hero h1\.section-title\s*\{[^}]*font-size:\s*var\(--font-hero\);/);
assert.match(css, /\.hero-title\s*\{[^}]*font-size:\s*var\(--font-hero\);/);
assert.match(datasetsCss, /\.dataset-page \.hero-title\s*\{[^}]*font-size:\s*var\(--font-hero\);[^}]*line-height:\s*1\.1;/);

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

assert.match(read('leaderboard.html'), /综合结果/);
assert.doesNotMatch(read('leaderboard.html'), /非官方总排名/);
assert.match(read('owned.html'), /通灵/);
assert.match(read('owned.html'), /共情智能/);

console.log('PASS: UI fixes and all public dataset synchronization checks are present');
