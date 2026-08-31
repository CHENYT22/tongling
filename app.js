/* ============================================================
   通灵 — Main App Logic (index.html)
   app.js  (Demo2 复建版 · 2026-08)
   ============================================================ */

(function () {
  'use strict';

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* ---------- 1. Reveal on Scroll ---------- */
  function initReveal() {
    var els = qsa('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 2. Mobile Nav ---------- */
  function initMobileNav() {
    var toggle = qs('.nav-toggle');
    var drawer = qs('.mobile-nav');
    if (!toggle || !drawer) return;

    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      drawer.classList.toggle('open');
    });

    qsa('a', drawer).forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('open');
        drawer.classList.remove('open');
      });
    });
  }

  /* ---------- 3. Submission Dialog ---------- */
  function initDialog() {
    var triggers = qsa('[data-dialog-open]');
    var dialog = qs('#submit-dialog');
    if (!dialog || !triggers.length) return;

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      });
    });

    dialog.addEventListener('click', function (e) {
      var rect = dialog.getBoundingClientRect();
      var inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                   e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) closeDialog();
    });

    var closeBtn = qs('.dialog-close', dialog);
    if (closeBtn) closeBtn.addEventListener('click', closeDialog);

    dialog.addEventListener('cancel', function (e) {
      e.preventDefault();
      closeDialog();
    });

    function closeDialog() {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }

  /* ---------- 4. Brain Animation & Index Card ---------- */

  // 四方向指标卡: [名称, min, max, 典型波动]
  var INDEX_METRICS = [
    ['Affective Empathy', 0.54, 0.65, 0.04],
    ['Cognitive Empathy', 0.36, 0.47, 0.03],
    ['Empathic Concern', 0.35, 0.42, 0.03],
    ['Safe Interaction', 0.49, 0.55, 0.02]
  ];

  var dots = [];
  var indexCard = null;
  var currentDotIdx = -1;
  var swapTimer = null;
  var rafId = null;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initBrainAnimation() {
    var stage = qs('.brain-stage');
    if (!stage) return;

    indexCard = qs('.index-card');
    dots = qsa('.brain-dot, .brain-dot-purple', stage);

    if (!dots.length) return;

    if (prefersReducedMotion) {
      if (indexCard) {
        indexCard.style.left = '50%';
        indexCard.style.top = '50%';
        indexCard.style.transform = 'translate(-50%, -50%)';
        updateCardContent();
      }
      return;
    }

    currentDotIdx = Math.floor(Math.random() * dots.length);
    updateCardContent();
    startTracking();
    swapTimer = setInterval(swapIndexCard, 7000);
  }

  function startTracking() {
    var stage = qs('.brain-stage');
    if (!stage || !indexCard) return;

    var cardLeft = 0, cardTop = 0, initialized = false;

    function tick() {
      if (currentDotIdx >= 0 && currentDotIdx < dots.length) {
        var dot = dots[currentDotIdx];
        var stageRect = stage.getBoundingClientRect();
        var dotRect = dot.getBoundingClientRect();

        var x = dotRect.left - stageRect.left + dotRect.width / 2;
        var y = dotRect.top - stageRect.top + dotRect.height / 2;

        var cardW = indexCard.offsetWidth;
        var cardH = indexCard.offsetHeight;
        var offsetX = 16;
        var offsetY = -cardH - 12;

        var targetLeft = x + offsetX;
        var targetTop  = y + offsetY;

        if (targetLeft + cardW > stageRect.width)  targetLeft = x - cardW - offsetX;
        if (targetLeft < 0)                         targetLeft = 4;
        if (targetTop  < 0)                         targetTop  = y + 16;
        if (targetTop  + cardH > stageRect.height)  targetTop  = stageRect.height - cardH - 4;

        if (!initialized) {
          cardLeft = targetLeft;
          cardTop  = targetTop;
          initialized = true;
        } else {
          // lerp factor 0.025 → ~78% toward target per second at 60fps
          cardLeft += (targetLeft - cardLeft) * 0.025;
          cardTop  += (targetTop  - cardTop)  * 0.025;
        }

        indexCard.style.left = cardLeft + 'px';
        indexCard.style.top  = cardTop  + 'px';
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
  }

  function swapIndexCard() {
    if (!indexCard || prefersReducedMotion) return;

    indexCard.classList.add('swapping');

    setTimeout(function () {
      var newIdx;
      do {
        newIdx = Math.floor(Math.random() * dots.length);
      } while (newIdx === currentDotIdx && dots.length > 1);
      currentDotIdx = newIdx;

      updateCardContent();
      indexCard.classList.remove('swapping');
    }, 900);
  }

  function updateCardContent() {
    if (!indexCard) return;

    var m = INDEX_METRICS[Math.floor(Math.random() * INDEX_METRICS.length)];
    var value = (m[1] + Math.random() * (m[2] - m[1])).toFixed(4);
    var change = (Math.random() * m[3]).toFixed(2);

    var nameEl = qs('.index-card-name', indexCard);
    var valEl = qs('.index-card-value', indexCard);

    if (nameEl) nameEl.textContent = m[0];
    if (valEl) {
      valEl.innerHTML = value + '<span class="index-card-change">↑ ' + change + '</span>';
    }
  }

  function initRadarSwitcher() {
    var wrap = qs('[data-radar-switcher]');
    if (!wrap) return;

    var tabs = qsa('.radar-tab', wrap);
    var cards = qsa('[data-radar-view]');
    var chart = qs('#radar-chart', wrap);
    var title = qs('#radar-title', wrap);
    var sub = qs('#radar-sub', wrap);
    var note = qs('#radar-note', wrap);
    var leaderboardViews = window.TURING_LEADERBOARD_VIEWS || {};
    if (!tabs.length || !chart || !title || !sub || !note) return;

    var views = {
      overview: {
        title: '共情能力雷达图',
        sub: 'n = 9 / 7 / 6 / 10',
        note: '比较五个模型在情感共情、认知共情、共情关怀、安全交互四个方向的聚合表现。',
        alt: '综合四维总览雷达图，比较五个模型在四个方向的聚合表现'
      },
      affective: {
        title: '情感共情 Affective Empathy',
        sub: 'n = 9',
        note: '关注模型能否从文本、表情、语音、图像和视频线索中识别情绪类别、强度、极性、变化与跨模态冲突。',
        alt: '情感共情雷达图，展示五个模型在九类情感共情任务上的聚合表现'
      },
      cognitive: {
        title: '认知共情 Cognitive Empathy',
        sub: 'n = 7',
        note: '关注模型能否理解用户为什么产生某种情绪，并推断其意图、需求、心理状态和社会关系。',
        alt: '认知共情雷达图，展示五个模型在七类认知共情任务上的聚合表现'
      },
      concern: {
        title: '共情关怀 Empathic Concern',
        sub: 'n = 6',
        note: '关注模型能否把对情绪和处境的理解转化为支持性、适度、具体且符合关系情境的回应。',
        alt: '共情关怀雷达图，展示五个模型在六类共情关怀任务上的聚合表现'
      },
      safe: {
        title: '安全交互 Safe / Accountable Interaction',
        sub: 'n = 10',
        note: '关注模型在危机、操纵、隐私、依赖、专业边界和不确定性等高风险情境中的识别与回应能力。',
        alt: '安全交互雷达图，展示五个模型在十类安全交互任务上的聚合表现'
      }
    };

    var modelOrder = ['Claude Opus 4.6', 'DeepSeek v4 Flash', 'Gemini 3.1 Pro', 'GPT-5.5', 'MiMo v2.5'];
    var modelColors = {
      'Claude Opus 4.6': '#7c3aed',
      'DeepSeek v4 Flash': '#2563eb',
      'Gemini 3.1 Pro': '#16a34a',
      'GPT-5.5': '#dc2626',
      'MiMo v2.5': '#d97706'
    };
    var SVG_NS = 'http://www.w3.org/2000/svg';

    function svgElement(tag, attrs, text) {
      var element = document.createElementNS(SVG_NS, tag);
      Object.keys(attrs || {}).forEach(function (key) {
        element.setAttribute(key, attrs[key]);
      });
      if (text != null) element.textContent = text;
      return element;
    }

    function point(cx, cy, radius, angle) {
      return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
    }

    function polygonPoints(count, radius, cx, cy) {
      var points = [];
      for (var i = 0; i < count; i += 1) {
        points.push(point(cx, cy, radius, -Math.PI / 2 + i * Math.PI * 2 / count).join(','));
      }
      return points.join(' ');
    }

    function axisLabel(label) {
      return String(label || '').replace(/（n=\d+）/g, '');
    }

    function labelLines(label, compact) {
      var maxChars = 10;
      if (label.length <= maxChars) return [label];

      var lines = [];
      var remaining = label;
      while (remaining.length > maxChars) {
        var breakAt = maxChars;
        for (var offset = 0; offset <= 3; offset += 1) {
          var left = maxChars - offset;
          var right = maxChars + offset;
          if (/[、/与和，,]/.test(remaining.charAt(left))) { breakAt = left + 1; break; }
          if (/[、/与和，,]/.test(remaining.charAt(right))) { breakAt = right + 1; break; }
        }
        lines.push(remaining.slice(0, breakAt));
        remaining = remaining.slice(breakAt);
      }
      if (remaining) lines.push(remaining);
      return lines;
    }

    function appendAxisLabel(parent, label, x, y, anchor, compact) {
      var lines = labelLines(label, compact);
      var text = svgElement('text', {
        x: x,
        y: y - (lines.length - 1) * 9,
        'text-anchor': anchor,
        'dominant-baseline': 'middle',
        class: 'radar-live-axis-label'
      });
      lines.forEach(function (line, index) {
        text.appendChild(svgElement('tspan', { x: x, dy: index ? '18' : '0' }, line));
      });
      parent.appendChild(text);
    }

    function chartData(viewKey) {
      var source = leaderboardViews[viewKey === 'overview' ? 'overall' : viewKey];
      if (!source) return null;
      var columns = source.columns.filter(function (column) {
        return column.key !== 'rank' && column.key !== 'model' && column.key !== 'average';
      });
      return {
        axes: columns.map(function (column) { return { key: column.key, label: axisLabel(column.label) }; }),
        rows: source.rows.slice().sort(function (a, b) {
          return modelOrder.indexOf(a.model) - modelOrder.indexOf(b.model);
        })
      };
    }

    function renderRadar(viewKey, alt) {
      var data = chartData(viewKey);
      if (!data || !data.axes.length) {
        chart.textContent = '榜单数据暂不可用';
        return;
      }

      var width = 900;
      var height = 720;
      var cx = 450;
      var cy = 390;
      var radius = data.axes.length > 8 ? 180 : 205;
      var svg = svgElement('svg', {
        viewBox: '0 0 ' + width + ' ' + height,
        class: 'radar-live-svg',
        'data-entering': 'true',
        'aria-hidden': 'true'
      });
      var grid = svgElement('g', { class: 'radar-grid' });

      for (var level = 1; level <= 5; level += 1) {
        grid.appendChild(svgElement('polygon', {
          points: polygonPoints(data.axes.length, radius * level / 5, cx, cy),
          fill: level === 5 ? '#f8fbff' : 'none',
          stroke: level === 5 ? '#bfd3ea' : '#d9e5f5',
          'stroke-width': level === 5 ? '1.25' : '1'
        }));
        grid.appendChild(svgElement('text', {
          x: cx + 5,
          y: cy - radius * level / 5 + 11,
          class: 'radar-scale-label'
        }, (level / 5).toFixed(1)));
      }

      data.axes.forEach(function (axis, index) {
        var angle = -Math.PI / 2 + index * Math.PI * 2 / data.axes.length;
        var end = point(cx, cy, radius, angle);
        var labelDistance = data.axes.length > 8 ? 112 : (data.axes.length === 7 ? 78 : 86);
        var labelPoint = point(cx, cy, radius + labelDistance, angle);
        var anchor = Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : (Math.cos(angle) > 0 ? 'start' : 'end');
        grid.appendChild(svgElement('line', {
          x1: cx, y1: cy, x2: end[0], y2: end[1], stroke: '#d9e5f5', 'stroke-width': '1'
        }));
        appendAxisLabel(grid, axis.label, labelPoint[0], labelPoint[1], anchor, data.axes.length > 8);
      });
      svg.appendChild(grid);

      data.rows.forEach(function (row, rowIndex) {
        var color = modelColors[row.model] || '#1677ff';
        var points = data.axes.map(function (axis, index) {
          var value = typeof row[axis.key] === 'number' ? row[axis.key] : 0;
          var angle = -Math.PI / 2 + index * Math.PI * 2 / data.axes.length;
          return point(cx, cy, radius * Math.max(0, Math.min(1, value)), angle);
        });
        var series = svgElement('g', { class: 'radar-series', 'data-model': row.model });
        series.appendChild(svgElement('polygon', {
          points: points.map(function (p) { return p.join(','); }).join(' '),
          fill: color,
          'fill-opacity': '0.07',
          stroke: color,
          'stroke-width': '2'
        }));
        points.forEach(function (p, index) {
          var axis = data.axes[index];
          var value = typeof row[axis.key] === 'number' ? row[axis.key] : null;
          var dot = svgElement('circle', {
            cx: p[0], cy: p[1], r: '3.2', fill: '#fff', stroke: color, 'stroke-width': '2'
          });
          dot.appendChild(svgElement('title', {}, row.model + ' · ' + axis.label + '：' + (value == null ? '—' : value.toFixed(4))));
          series.appendChild(dot);
        });
        svg.appendChild(series);
      });

      var legend = svgElement('g', { class: 'radar-live-legend' });
      var legendPositions = [[60, 32], [330, 32], [610, 32], [195, 64], [480, 64]];
      data.rows.forEach(function (row, index) {
        var x = legendPositions[index][0];
        var y = legendPositions[index][1];
        legend.appendChild(svgElement('line', {
          x1: x, y1: y, x2: x + 24, y2: y, stroke: modelColors[row.model] || '#1677ff', 'stroke-width': '3'
        }));
        legend.appendChild(svgElement('circle', {
          cx: x + 12, cy: y, r: '3.2', fill: '#fff', stroke: modelColors[row.model] || '#1677ff', 'stroke-width': '2'
        }));
        legend.appendChild(svgElement('text', { x: x + 33, y: y + 4, class: 'radar-live-legend-label' }, row.model));
      });
      svg.appendChild(legend);

      chart.replaceChildren(svg);
      chart.setAttribute('aria-label', alt);
      requestAnimationFrame(function () {
        svg.removeAttribute('data-entering');
      });
    }

    function setView(key) {
      var activeKey = views[key] ? key : 'overview';
      var v = views[activeKey];
      tabs.forEach(function (t) {
        var isActive = t.getAttribute('data-view') === activeKey;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      cards.forEach(function (card) {
        var isActive = card.getAttribute('data-radar-view') === activeKey;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      wrap.classList.add('is-switching');
      title.textContent = v.title;
      sub.textContent = v.sub;
      note.textContent = v.note;
      renderRadar(activeKey, v.alt);
      requestAnimationFrame(function () { wrap.classList.remove('is-switching'); });
    }

    function focusView(key) {
      var targetTab = tabs.filter(function (tab) {
        return tab.getAttribute('data-view') === key;
      })[0];
      setView(key);
      wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (targetTab) targetTab.focus({ preventScroll: true });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setView(tab.getAttribute('data-view'));
      });
    });

    wrap._setRadarView = focusView;
    setView('overview');
  }

  function initRadarCards() {
    var wrap = qs('[data-radar-switcher]');
    var cards = qsa('[data-radar-view]');
    if (!wrap || !cards.length || typeof wrap._setRadarView !== 'function') return;

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        wrap._setRadarView(card.getAttribute('data-radar-view'));
      });
    });
  }

  /* ---------- 5. Waveform (owned preview) ---------- */
  function initWaveform() {
    var wf = qs('.waveform');
    if (!wf) return;

    var bars = 60;
    var html = '';
    for (var i = 0; i < bars; i++) {
      var h = Math.floor(6 + Math.random() * 58);
      html += '<span style="height:' + h + 'px"></span>';
    }
    wf.innerHTML = html;
  }

  /* ---------- 6. Footer Year ---------- */
  function initYear() {
    qsa('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Init ---------- */
  function init() {
    initReveal();
    initMobileNav();
    initDialog();
    initBrainAnimation();
    initRadarSwitcher();
    initRadarCards();
    initWaveform();
    initYear();
    initLangToggle();
  }

  function initLangToggle() {
    var btn = document.querySelector('.lang-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var opts = btn.querySelectorAll('.lang-opt');
      opts.forEach(function (opt) { opt.classList.toggle('is-active'); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
