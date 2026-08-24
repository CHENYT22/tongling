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
const publicDatasetXml = {
  affective: read('public-datasets-data/affective.xml'),
  cognitive: read('public-datasets-data/cognitive.xml'),
  concern: read('public-datasets-data/concern.xml'),
  safety: read('public-datasets-data/safety.xml')
};
const framework = read('framework.html');
const css = read('vitality-blue.css');

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
assert.match(datasetsHtml, /10 项内容架构/);
assert.match(datasetsCss, /\.table-scroll\s*\{[\s\S]*?overflow-x:\s*auto;/);
assert.match(datasetsCss, /\.source-resource-grid/);

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

console.log('PASS: UI fixes and all public dataset synchronization checks are present');
