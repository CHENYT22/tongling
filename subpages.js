/* ============================================================
   通灵 — Shared Subpage Logic
   subpages.js  (framework / datasets / owned / leaderboard 通用)
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

  /* ---------- 3. Nav Active Highlight ---------- */
  function initNavActive() {
    var page = location.pathname.split('/').pop() || 'index.html';
    qsa('.nav-links a, .mobile-nav a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === page) {
        a.classList.add('active');
      }
    });
  }

  /* ---------- 4. Submission Dialog ---------- */
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

  /* ---------- 5. Footer Year ---------- */
  function initYear() {
    qsa('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function initRadarSwitcher() {
    var wrap = qs('[data-radar-switcher]');
    if (!wrap) return;

    var tabs = qsa('.radar-tab', wrap);
    var chart = qs('#radar-chart', wrap);
    var title = qs('#radar-title', wrap);
    var sub = qs('#radar-sub', wrap);
    var note = qs('#radar-note', wrap);
    var insightList = qs('#radar-insight-list', wrap);
    var leaderboardViews = window.TURING_LEADERBOARD_VIEWS || {};
    if (!tabs.length || !chart || !title || !sub || !note) return;

    var views = {
      overview: {
        title: '四维总览',
        sub: 'n = 9 / 7 / 6 / 10',
        note: '比较五个模型在情感共情、认知共情、共情关怀、安全交互四个方向的聚合表现。',
        alt: '综合四维总览雷达图，比较五个模型在四个方向的聚合表现',
        insights: [
          '五个模型呈现不同能力形状，没有单一模型可以代表完整共情能力。',
          '四个维度纳入的任务数量不同，雷达面积不能直接解释为能力总量。',
          'Gemini 3.1 Pro 在前三个维度的聚合结果相对更高，安全交互需要回到具体任务判断。'
        ]
      },
      affective: {
        title: '情感共情',
        sub: 'n = 9',
        note: '关注模型能否从文本、表情、语音、图像和视频线索中识别情绪类别、强度、极性、变化与跨模态冲突。',
        alt: '情感共情雷达图，展示五个模型在九类情感共情任务上的聚合表现',
        insights: [
          'Gemini 3.1 Pro 与 MiMo v2.5 在多项情绪感知任务上形成较大的能力覆盖。',
          '微表情与伪装情绪等细微信号任务整体更难，模型间差异也更明显。',
          '多模态模型可能直接接收音视频，结果同时包含模型能力与输入信息差异。'
        ]
      },
      cognitive: {
        title: '认知共情',
        sub: 'n = 7',
        note: '关注模型能否理解用户为什么产生某种情绪，并推断其意图、需求、心理状态和社会关系。',
        alt: '认知共情雷达图，展示五个模型在七类认知共情任务上的聚合表现',
        insights: [
          'Gemini 3.1 Pro 在情绪原因、关系情境和情绪影响判断等推理轴上相对更高。',
          'MiMo v2.5 在观点采择与复杂情绪理解等任务上表现突出。',
          '认知理解具有结构化差异，单一高分不能代表所有推理能力领先。'
        ]
      },
      concern: {
        title: '共情关怀',
        sub: 'n = 6',
        note: '关注模型能否把对情绪和处境的理解转化为支持性、适度、具体且符合关系情境的回应。',
        alt: '共情关怀雷达图，展示五个模型在六类共情关怀任务上的聚合表现',
        insights: [
          'Gemini 3.1 Pro 在语气、强度与角色适配上相对更高。',
          'MiMo v2.5 在关系修复与社会礼貌回应上相对更高。',
          '多模态回应一致性整体较低，理解与关怀输出不能视为同一种能力。'
        ]
      },
      safe: {
        title: '安全交互',
        sub: 'n = 10',
        note: '关注模型在危机、操纵、隐私、依赖、专业边界和不确定性等高风险情境中的识别与回应能力。',
        alt: '安全交互雷达图，展示五个模型在十类安全交互任务上的聚合表现',
        insights: [
          '危机识别、拒答、隐私、依赖与专业边界是不同的安全能力。',
          '拟人化与依赖风险控制的模型差异较明显，安全不是单一谨慎程度。',
          '聚合结果不能替代临床、高风险部署或产品安全评估。'
        ]
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
      Object.keys(attrs || {}).forEach(function (key) { element.setAttribute(key, attrs[key]); });
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

    function labelLines(label) {
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

    function appendAxisLabel(parent, label, x, y, anchor) {
      var lines = labelLines(label);
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
        appendAxisLabel(grid, axis.label, labelPoint[0], labelPoint[1], anchor);
      });
      svg.appendChild(grid);

      data.rows.forEach(function (row) {
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
        var color = modelColors[row.model] || '#1677ff';
        legend.appendChild(svgElement('line', { x1: x, y1: y, x2: x + 24, y2: y, stroke: color, 'stroke-width': '3' }));
        legend.appendChild(svgElement('circle', { cx: x + 12, cy: y, r: '3.2', fill: '#fff', stroke: color, 'stroke-width': '2' }));
        legend.appendChild(svgElement('text', { x: x + 33, y: y + 4, class: 'radar-live-legend-label' }, row.model));
      });
      svg.appendChild(legend);

      chart.replaceChildren(svg);
      chart.setAttribute('aria-label', alt);
      requestAnimationFrame(function () { svg.removeAttribute('data-entering'); });
    }

    function setView(key) {
      var activeKey = views[key] ? key : 'overview';
      var v = views[activeKey];
      tabs.forEach(function (t) {
        var isActive = t.getAttribute('data-view') === activeKey;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      wrap.classList.add('is-switching');
      title.textContent = v.title;
      sub.textContent = v.sub;
      note.textContent = v.note;
      if (insightList && v.insights) {
        insightList.replaceChildren();
        v.insights.forEach(function (item) {
          var li = document.createElement('li');
          li.textContent = item;
          insightList.appendChild(li);
        });
      }
      renderRadar(activeKey, v.alt);
      requestAnimationFrame(function () { wrap.classList.remove('is-switching'); });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setView(tab.getAttribute('data-view'));
      });
    });

    setView('overview');
  }

  function initArchitectureTabs() {
    var tabs = qsa('[data-arch-tab]');
    var panel = qs('#architecture-panel');
    var title = qs('#architecture-title');
    var copy = qs('#architecture-copy');
    var code = qs('#architecture-code code');
    if (!tabs.length || !panel || !title || !copy || !code) return;

    var layers = {
      source: {
        kicker: 'LAYER 01',
        title: '来源登记',
        copy: '不同论文与研究社区的数据在语言、标签、切分和模态上差异很大。第一步只确认来源、许可、样本划分与可用模态，不强行改写原始语义。',
        code: 'raw_dataset/\n  source_notes.md\n  license.txt\n  text / audio / image / video'
      },
      resource: {
        kicker: 'LAYER 02',
        title: '资源标准化',
        copy: '资源层用 manifest 索引 sample_id 与可用模态，文本保留原始语言，音频、图像和视频按任务需要物化。一次准备后，可以被多个任务重复使用。',
        code: 'processed_root/\n  dataset_meta.json\n  resources/\n    manifest.jsonl\n    text/ audio/ image/ video/'
      },
      task: {
        kicker: 'LAYER 03',
        title: '任务定义',
        copy: '每个任务视图声明输入字段、目标类型、标签空间和 train / dev / test 划分。分类、回归、抽取、生成和偏好判断由独立 evaluator 解释。',
        code: 'tasks/<task-name>/\n  task_meta.json\n  train.jsonl\n  dev.jsonl\n  test.jsonl'
      },
      result: {
        kicker: 'LAYER 04',
        title: '结果快照',
        copy: '结果层同时保存模型输出、解析结果、失败信息、指标和运行配置，记录模型版本、提示版本、实际模态、样本量、时间和模型评委信息。',
        code: 'results_root/\n  predictions/\n  metrics/\n  run_config/\n  snapshot_metadata.json'
      }
    };

    function showLayer(key) {
      var layer = layers[key] || layers.source;
      tabs.forEach(function (tab) {
        var active = tab.getAttribute('data-arch-tab') === key;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      panel.setAttribute('data-arch-panel', key);
      var kicker = qs('.architecture-kicker', panel);
      if (kicker) kicker.textContent = layer.kicker;
      title.textContent = layer.title;
      copy.textContent = layer.copy;
      code.textContent = layer.code;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { showLayer(tab.getAttribute('data-arch-tab')); });
    });
    showLayer('source');
  }

  /* ---------- Init ---------- */
  function init() {
    initReveal();
    initMobileNav();
    initNavActive();
    initDialog();
    initYear();
    initArchitectureTabs();
    initRadarSwitcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
