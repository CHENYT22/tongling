/* ============================================================
   通灵 — Dataset Browser (datasets.html)
   datasets.js  · 193 条目 × 24 字段客户端渲染
   ============================================================ */

(function () {
  'use strict';

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  var DATA = window.TURING_DATA;
  if (!DATA) return;

  var SECTION_ORDER = ['摘要', '任务适配理由', '数据规模', '获取方式', '标注信息',
    '内容字段', '数据处理', '使用说明', '评测指标', '榜单信息',
    '许可证'];

  var VALID_DIMENSIONS = {
    affective: true,
    cognitive: true,
    concern: true,
    safety: true
  };

  var state = {
    catId: '', // '' = 全部数据集
    subtask: '',   // '' = 全部
    query: '',
    sort: 'document'
  };

  function stripHtml(s) {
    return (s || '').replace(/<[^>]+>/g, ' ');
  }

  DATA.categories.forEach(function (cat) {
    cat.subtasks.forEach(function (st) {
      st.entries.forEach(function (e) {
        e._cat = cat.name;
        e._catId = cat.id;
        e._subtask = st.name;
        e._search = [
          e.name, e.title, e.en, e.year, e.modality,
          e.access, st.name, cat.name,
          stripHtml(e.sections['摘要']),
          stripHtml(e.sections['任务适配理由'])
        ].join(' ').toLowerCase();
      });
    });
  });

  function allEntries() {
    var out = [];
    DATA.categories.forEach(function (cat) {
      cat.subtasks.forEach(function (st) {
        st.entries.forEach(function (e) { out.push(e); });
      });
    });
    return out;
  }

  function isValidDimension(dim) {
    return !!VALID_DIMENSIONS[dim];
  }

  function parseDimensionFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var dim = params.get('dimension');
    return isValidDimension(dim) ? dim : '';
  }

  function syncDimensionToUrl(replace) {
    var url = new URL(window.location.href);
    if (isValidDimension(state.catId)) {
      url.searchParams.set('dimension', state.catId);
    } else {
      url.searchParams.delete('dimension');
    }
    var nextUrl = url.pathname + (url.searchParams.toString() ? ('?' + url.searchParams.toString()) : '') + url.hash;
    if (replace) {
      window.history.replaceState({ dimension: state.catId || '' }, '', nextUrl);
    } else {
      window.history.pushState({ dimension: state.catId || '' }, '', nextUrl);
    }
  }

  /* ---------- 访问状态标签样式 ---------- */
  function accessClass(access) {
    if (/公开/.test(access)) return 'ds-tag-access';
    if (/申请/.test(access)) return 'ds-tag-access apply';
    return 'ds-tag-access unknown';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- 渲染：大类统计卡 ---------- */
  function renderCatStats() {
    var wrap = qs('#cat-stats');
    if (!wrap) return;
    var max = Math.max.apply(null, DATA.categories.map(function (c) { return c.count; }));
    var total = DATA.totalEntries || allEntries().length;
    var allPct = Math.round(total / max * 100);
    var allCard = '<div class="cat-stat' + (state.catId === '' ? ' active' : '') +
      '" data-cat="" role="button" tabindex="0">' +
      '<div class="cat-stat-name">全部数据集' +
      '<span class="cat-stat-count">' + total + '</span></div>' +
      '<div class="cat-stat-bar"><div class="cat-stat-fill" style="width:' + allPct + '%"></div></div>' +
      '<div class="cat-stat-sub">4 个能力维度</div>' +
      '</div>';

    wrap.innerHTML = allCard + DATA.categories.map(function (cat) {
      var tasks = cat.subtasks.length;
      var pct = Math.round(cat.count / max * 100);
      return '<div class="cat-stat' + (cat.id === state.catId ? ' active' : '') +
        '" data-cat="' + cat.id + '" role="button" tabindex="0">' +
        '<div class="cat-stat-name">' + cat.name +
        '<span class="cat-stat-count">' + cat.count + '</span></div>' +
        '<div class="cat-stat-bar"><div class="cat-stat-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="cat-stat-sub">' + tasks + ' 个细分任务</div>' +
        '</div>';
    }).join('');

    qsa('.cat-stat', wrap).forEach(function (el) {
      function pick() {
        state.catId = el.getAttribute('data-cat');
        state.subtask = '';
        renderCatStats();
        renderChips();
        renderList();
        syncDimensionToUrl(false);
      }
      el.addEventListener('click', pick);
      el.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); }
      });
    });
  }

  /* ---------- 渲染：细分任务 chips ---------- */
  function currentCat() {
    return DATA.categories.filter(function (c) { return c.id === state.catId; })[0] || null;
  }

  function currentSubtasks() {
    var cat = currentCat();
    if (cat) return cat.subtasks;
    var seen = {};
    var out = [];
    DATA.categories.forEach(function (category) {
      category.subtasks.forEach(function (subtask) {
        if (!seen[subtask.name]) {
          seen[subtask.name] = true;
          out.push(subtask);
        }
      });
    });
    return out;
  }

  function renderToolbar() {
    var direction = qs('#dataset-direction');
    var subtask = qs('#dataset-subtask');
    var sort = qs('#dataset-sort');
    if (!direction || !subtask || !sort) return;

    direction.innerHTML = '<option value="">全部方向</option>' + DATA.categories.map(function (cat) {
      return '<option value="' + escapeHtml(cat.id) + '">' + escapeHtml(cat.name) + '</option>';
    }).join('');
    direction.value = state.catId;

    subtask.innerHTML = '<option value="">全部细分任务</option>' + currentSubtasks().map(function (task) {
      return '<option value="' + escapeHtml(task.name) + '">' + escapeHtml(task.name) + '</option>';
    }).join('');
    subtask.value = state.subtask;
    sort.value = state.sort;
  }

  function renderChips() {
    var wrap = qs('#subtask-chips');
    if (!wrap) return;
    var cat = currentCat();
    if (!cat) {
      wrap.innerHTML = '<button class="subtask-chip active" data-sub="">全部 <span class="chip-n">' +
        (DATA.totalEntries || allEntries().length) + '</span></button>';
      return;
    }
    var chips = ['<button class="subtask-chip' + (state.subtask === '' ? ' active' : '') +
      '" data-sub="">全部 <span class="chip-n">' + cat.count + '</span></button>'];
    cat.subtasks.forEach(function (st) {
      chips.push('<button class="subtask-chip' + (state.subtask === st.name ? ' active' : '') +
        '" data-sub="' + escapeHtml(st.name) + '">' + escapeHtml(st.name) +
        ' <span class="chip-n">' + st.entries.length + '</span></button>');
    });
    wrap.innerHTML = chips.join('');

    qsa('.subtask-chip', wrap).forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.subtask = chip.getAttribute('data-sub');
        renderChips();
        renderList();
      });
    });
  }

  /* ---------- 渲染：条目列表 ---------- */
  function filterEntries() {
    var q = state.query.trim().toLowerCase();
    return allEntries().filter(function (e) {
      if (state.catId && e._catId !== state.catId) return false;
      if (state.subtask && e._subtask !== state.subtask) return false;
      if (q && e._search.indexOf(q) === -1) return false;
      return true;
    });
  }

  function sortEntries(entries) {
    var out = entries.slice();
    if (state.sort === 'name') {
      return out.sort(function (a, b) { return a.name.localeCompare(b.name, 'zh-CN'); });
    }
    if (state.sort === 'year-desc') {
      return out.sort(function (a, b) {
        var ay = Number.parseInt(a.year, 10) || 0;
        var by = Number.parseInt(b.year, 10) || 0;
        return by - ay;
      });
    }
    return out;
  }

  function compactModality(modality) {
    var text = (modality || '').trim();
    if (!text || /暂未提供/.test(text)) return '待补充';
    text = text.replace(/\s*\+\s*/g, '+').replace(/\s*\/\s*/g, '/');
    return text.length > 20 ? text.slice(0, 20) + '…' : text;
  }

  function entryHeadHtml(e, idx) {
    var yearTag = e.year && !/暂未提供/.test(e.year)
      ? '<span class="entry-year">' + escapeHtml(e.year) + '</span>' : '';
    var summary = stripHtml((e.sections && e.sections['摘要']) || '')
      .replace(/\s+/g, ' ').trim();
    var summaryHtml = summary
      ? '<div class="entry-summary">' + escapeHtml(summary) + '</div>' : '';
    return '<button class="entry-head" aria-expanded="false">' +
      '<span class="entry-idx">' + String(idx + 1).padStart(3, '0') + '</span>' +
      '<div class="entry-main">' +
      '<div class="entry-name">' + escapeHtml(e.name) + '</div>' +
      summaryHtml + '</div>' +
        '<div class="entry-tags">' +
        '<span class="ds-tag ds-tag-' + e._catId + '">' + escapeHtml(e._cat) + '</span>' +
        '<span class="ds-tag ds-tag-task">' + escapeHtml(e._subtask) + '</span>' +
        yearTag +
        '</div>' +
      '<span class="entry-chevron"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '</button>';
  }

  function entryBodyHtml(e) {
    var meta = [
      ['英文名称', escapeHtml(e.en)],
      ['条目编号', e.entryId ? '<code>' + escapeHtml(e.entryId) + '</code>' : ''],
      ['数据集编号', e.datasetId ? '<code>' + escapeHtml(e.datasetId) + '</code>' : ''],
      ['年份', escapeHtml(e.year)],
      ['模态', escapeHtml(e.modality)],
      ['官方链接', e.link && /^https?:/.test(e.link)
        ? '<a href="' + escapeHtml(e.link) + '" target="_blank" rel="noopener">' + escapeHtml(e.link) + ' ↗</a>'
        : escapeHtml(e.link)]
    ].filter(function (m) { return m[1]; });

    var html = '<div class="entry-meta-grid">' + meta.map(function (m) {
      return '<div class="entry-meta-item"><b>' + m[0] + '</b>' + m[1] + '</div>';
    }).join('') + '</div>';

    SECTION_ORDER.forEach(function (key) {
      var content = e.sections[key];
      if (content && content.trim()) {
        html += '<div class="entry-section">' +
          '<div class="entry-section-label">' + key + '</div>' +
          '<div class="entry-section-content">' + content + '</div></div>';
      }
    });
    return html;
  }

  function renderList() {
    var list = qs('#entry-list');
    var counter = qs('#result-count');
    if (!list) return;

    var entries = sortEntries(filterEntries());

    if (counter) {
      counter.textContent = '显示 ' + entries.length + ' / ' + (DATA.totalEntries || allEntries().length) + ' 条评测条目';
    }

    if (!entries.length) {
      list.innerHTML = '<div class="no-results">未找到匹配的数据集，请调整搜索或筛选条件</div>';
      return;
    }

    list.innerHTML = entries.map(function (e, i) {
      return '<div class="entry-card">' + entryHeadHtml(e, i) +
        '<div class="entry-body"></div></div>';
    }).join('');

    qsa('.entry-card', list).forEach(function (card, i) {
      var head = qs('.entry-head', card);
      var body = qs('.entry-body', card);
      head.addEventListener('click', function () {
        var open = card.classList.toggle('open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
        // 懒渲染：首次展开才注入详情
        if (open && !body.getAttribute('data-rendered')) {
          body.innerHTML = entryBodyHtml(entries[i]);
          body.setAttribute('data-rendered', '1');
        }
      });
    });
  }

  /* ---------- 搜索 ---------- */
  function initSearch() {
    var input = qs('#dataset-search');
    if (!input) return;
    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.query = input.value;
        renderList();
      }, 180);
    });
  }

  function initToolbar() {
    var direction = qs('#dataset-direction');
    var subtask = qs('#dataset-subtask');
    var sort = qs('#dataset-sort');
    var clear = qs('#dataset-clear');
    if (!direction || !subtask || !sort || !clear) return;

    direction.addEventListener('change', function () {
      state.catId = direction.value;
      state.subtask = '';
      renderToolbar();
      renderList();
      syncDimensionToUrl(false);
    });
    subtask.addEventListener('change', function () {
      state.subtask = subtask.value;
      renderList();
    });
    sort.addEventListener('change', function () {
      state.sort = sort.value;
      renderList();
    });
    clear.addEventListener('click', function () {
      state.catId = '';
      state.subtask = '';
      state.query = '';
      state.sort = 'document';
      var input = qs('#dataset-search');
      if (input) input.value = '';
      renderToolbar();
      renderList();
      syncDimensionToUrl(false);
    });
  }

  /* ---------- Init ---------- */
  function init() {
    state.catId = parseDimensionFromUrl();
    renderToolbar();
    renderList();
    initSearch();
    initToolbar();
    syncDimensionToUrl(true);

    window.addEventListener('popstate', function () {
      state.catId = parseDimensionFromUrl();
      state.subtask = '';
      renderToolbar();
      renderList();
    });

    if (state.catId) {
      var list = qs('#entry-list');
      if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
