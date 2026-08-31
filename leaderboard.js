/* ============================================================
  通灵 — Leaderboard View Switcher (leaderboard.html)
  leaderboard.js
  ============================================================ */

(function () {
  'use strict';

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  var VIEWS = {
    overall: {
      title: '综合评分',
      countLabel: '综合评分视图',
      note: '综合视图展示四个方向的聚合结果；平均评分严格沿用全方面综合.xlsx 中的 AVERAGE(C:F) 结果，并按平均评分降序排序。',
      viewNote: '综合视图仅用于四维聚合对比，不把不同任务、模态或评测口径解释为单一官方排名。',
      columns: [
        { key: 'rank', label: '排名' },
        { key: 'model', label: '模型' },
        { key: 'average', label: '平均评分' },
        { key: 'affective', label: '情感共情（n=9）' },
        { key: 'cognitive', label: '认知共情（n=7）' },
        { key: 'concern', label: '共情关怀（n=6）' },
        { key: 'safe', label: '安全交互（n=10）' }
      ],
      rows: [
        { model: 'Gemini 3.1 Pro', average: 0.517176, affective: 0.644967, cognitive: 0.466471, concern: 0.412069, safe: 0.545197 },
        { model: 'MiMo v2.5', average: 0.4882875, affective: 0.584756, cognitive: 0.424721, concern: 0.401, safe: 0.542673 },
        { model: 'DeepSeek v4 Flash', average: 0.46153875, affective: 0.558975, cognitive: 0.39395, concern: 0.351853, safe: 0.541377 },
        { model: 'GPT-5.5', average: 0.44863675, affective: 0.499633, cognitive: 0.393257, concern: 0.377003, safe: 0.524654 },
        { model: 'Claude Opus 4.6', average: 0.44005475, affective: 0.544178, cognitive: 0.359336, concern: 0.366926, safe: 0.489779 }
      ]
    },
    affective: {
      title: '情感共情',
      countLabel: '情感共情视图',
      note: '情感共情视图覆盖 9 项细分任务，平均评分对应情感共情.xlsx 中的 AVERAGE(C:K) 结果。',
      viewNote: '情感共情结果同时受任务定义与输入模态影响，多模态模型与纯文本模型不应被解释为严格同输入对照。',
      columns: [
        { key: 'rank', label: '排名' },
        { key: 'model', label: '模型' },
        { key: 'average', label: '平均评分' },
        { key: 'emotion_class', label: '情绪类别识别' },
        { key: 'emotion_intensity', label: '情绪强度判断' },
        { key: 'emotion_polarity', label: '情感极性判断' },
        { key: 'micro_expression', label: '微表情与细微信号识别' },
        { key: 'disguised_emotion', label: '伪装情绪识别' },
        { key: 'cross_modal_conflict', label: '跨模态冲突识别' },
        { key: 'emotion_tracking', label: '情绪变化追踪' },
        { key: 'group_emotion', label: '群体情绪识别' },
        { key: 'empathy_explain', label: '情感敏感性解释' }
      ],
      rows: [
        { model: 'Gemini 3.1 Pro', average: 0.644966666666667, emotion_class: 0.7992, emotion_intensity: 0.5999, emotion_polarity: 0.7841, micro_expression: 0.1634, disguised_emotion: 0.4702, cross_modal_conflict: 0.9031, emotion_tracking: 0.6663, group_emotion: 0.6644, empathy_explain: 0.7541 },
        { model: 'MiMo v2.5', average: 0.584755555555556, emotion_class: 0.738, emotion_intensity: 0.6227, emotion_polarity: 0.8004, micro_expression: 0.1571, disguised_emotion: 0.1505, cross_modal_conflict: 0.8647, emotion_tracking: 0.5906, group_emotion: 0.6187, empathy_explain: 0.7201 },
        { model: 'DeepSeek v4 Flash', average: 0.558975, emotion_class: 0.5015, emotion_intensity: 0.589, emotion_polarity: 0.6417, micro_expression: null, disguised_emotion: 0.0849, cross_modal_conflict: 0.8096, emotion_tracking: 0.6473, group_emotion: 0.4546, empathy_explain: 0.7432 },
        { model: 'Claude Opus 4.6', average: 0.544177777777778, emotion_class: 0.4993, emotion_intensity: 0.6267, emotion_polarity: 0.6684, micro_expression: 0.112, disguised_emotion: 0.3701, cross_modal_conflict: 0.8053, emotion_tracking: 0.6101, group_emotion: 0.4719, empathy_explain: 0.7338 },
        { model: 'GPT-5.5', average: 0.499633333333333, emotion_class: 0.50605, emotion_intensity: 0.5717, emotion_polarity: 0.6103, micro_expression: 0.15295, disguised_emotion: 0.0539, cross_modal_conflict: 0.8074, emotion_tracking: 0.6493, group_emotion: 0.4667, empathy_explain: 0.6784 }
      ]
    },
    cognitive: {
      title: '认知共情',
      countLabel: '认知共情视图',
      note: '认知共情视图覆盖 7 项细分任务，平均评分对应认知共情.xlsx 中的 AVERAGE(C:I) 结果。',
      viewNote: '认知共情的比较应回到同一任务、同一主指标与同一评测变体，不应跨子集或跨评委口径混排。',
      columns: [
        { key: 'rank', label: '排名' },
        { key: 'model', label: '模型' },
        { key: 'average', label: '平均评分' },
        { key: 'reasoning', label: '情绪原因与对象推理' },
        { key: 'implicit_need', label: '隐含需求识别' },
        { key: 'perspective', label: '观点采择与心理状态推断' },
        { key: 'complex_emotion', label: '复杂/混合/转化情绪理解' },
        { key: 'fine_grained_emotion', label: '情绪词汇与细粒度情绪识别' },
        { key: 'social_judgment', label: '情绪对认知和社会判断的影响理解' },
        { key: 'social_role', label: '社会角色识别与关系情绪理解' }
      ],
      rows: [
        { model: 'Gemini 3.1 Pro', average: 0.466471428571429, reasoning: 0.6561, implicit_need: 0.0167, perspective: 0.5066, complex_emotion: 0.66, fine_grained_emotion: 0.2273, social_judgment: 0.7843, social_role: 0.4143 },
        { model: 'MiMo v2.5', average: 0.424721428571429, reasoning: 0.4959, implicit_need: 0.0158, perspective: 0.6213, complex_emotion: 0.73, fine_grained_emotion: 0.1923, social_judgment: 0.6677, social_role: 0.25005 },
        { model: 'DeepSeek v4 Flash', average: 0.39395, reasoning: 0.5018, implicit_need: 0.0176, perspective: 0.5636, complex_emotion: 0.6267, fine_grained_emotion: 0.1106, social_judgment: 0.6676, social_role: 0.26975 },
        { model: 'GPT-5.5', average: 0.393257142857143, reasoning: 0.6147, implicit_need: 0.0076, perspective: 0.5345, complex_emotion: 0.6808, fine_grained_emotion: 0.084, social_judgment: 0.5828, social_role: 0.2484 },
        { model: 'Claude Opus 4.6', average: 0.359335714285714, reasoning: 0.3099, implicit_need: 0.0141, perspective: 0.4797, complex_emotion: 0.6417, fine_grained_emotion: 0.05255, social_judgment: 0.6977, social_role: 0.3197 }
      ]
    },
    concern: {
      title: '共情关怀',
      countLabel: '共情关怀视图',
      note: '共情关怀视图覆盖 6 项细分任务，平均评分对应共情关怀.xlsx 中的 AVERAGE(C:H) 结果；空值按源表 AVERAGE 规则忽略。',
      viewNote: '共情关怀中的空值显示为 —，但不会按 0 进入平均；开放式回应仍需结合任务说明与评委口径解读。',
      columns: [
        { key: 'rank', label: '排名' },
        { key: 'model', label: '模型' },
        { key: 'average', label: '平均评分' },
        { key: 'support_strategy', label: '共情回应生成与支持策略选择' },
        { key: 'tone_role', label: '语气、强度和角色适配' },
        { key: 'multimodal_consistency', label: '多模态回应一致性' },
        { key: 'reappraisal', label: '情绪安抚与认知重评' },
        { key: 'personalization', label: '个性化调节与效果评估' },
        { key: 'repair_politeness', label: '关系修复与社会礼貌回应' }
      ],
      rows: [
        { model: 'Gemini 3.1 Pro', average: 0.412069166666667, support_strategy: 0.605351, tone_role: 0.5919, multimodal_consistency: 0.296, reappraisal: 0.494069, personalization: 0.031195, repair_politeness: 0.4539 },
        { model: 'MiMo v2.5', average: 0.4010005, support_strategy: 0.56472, tone_role: 0.5133, multimodal_consistency: 0.2665, reappraisal: 0.484735, personalization: 0.029148, repair_politeness: 0.5476 },
        { model: 'GPT-5.5', average: 0.3770028, support_strategy: 0.642036, tone_role: null, multimodal_consistency: 0.2921, reappraisal: 0.467351, personalization: 0.022027, repair_politeness: 0.4615 },
        { model: 'Claude Opus 4.6', average: 0.3669262, support_strategy: 0.620423, tone_role: null, multimodal_consistency: 0.281, reappraisal: 0.474037, personalization: 0.025671, repair_politeness: 0.4335 },
        { model: 'DeepSeek v4 Flash', average: 0.351853, support_strategy: 0.586089, tone_role: null, multimodal_consistency: 0.2942, reappraisal: 0.438067, personalization: 0.032759, repair_politeness: 0.40815 }
      ]
    },
    safe: {
      title: '安全交互',
      countLabel: '安全交互视图',
      note: '安全交互视图覆盖 10 项细分任务，平均评分沿用安全交互.xlsx 的结果，并忽略工作簿末尾全空列。',
      viewNote: '安全维度是多项风险能力的聚合画像，不能替代危机、隐私、依赖或专业边界等单项结果的独立判断。',
      columns: [
        { key: 'rank', label: '排名' },
        { key: 'model', label: '模型' },
        { key: 'average', label: '平均评分' },
        { key: 'crisis_recognition', label: '高风险情绪与危机识别' },
        { key: 'crisis_response', label: '危机安全回应与现实求助引导' },
        { key: 'non_judgmental', label: '非评判倾听与去污名化回应' },
        { key: 'manipulation', label: '情绪操控、PUA与威胁识别' },
        { key: 'dependency', label: '拟人化与依赖风险控制' },
        { key: 'boundary', label: '专业边界维护' },
        { key: 'privacy', label: '隐私保护与敏感信息边界' },
        { key: 'hallucination', label: '幻觉风险与不确定性控制' },
        { key: 'bias_harm', label: '偏见、公平性与社会伤害风险识别' },
        { key: 'deescalation', label: '冲突、暴力和冲动行为降级' }
      ],
      rows: [
        { model: 'Gemini 3.1 Pro', average: 0.5451969, crisis_recognition: 0.6633, crisis_response: 0.6873, non_judgmental: 0.6459, manipulation: 0.6115, dependency: 0.6457, boundary: 0.7241, privacy: 0.7992, hallucination: 0.586571, bias_harm: 0.071498, deescalation: 0.0169 },
        { model: 'MiMo v2.5', average: 0.5426729, crisis_recognition: 0.68, crisis_response: 0.7506, non_judgmental: 0.6251, manipulation: 0.619, dependency: 0.3555, boundary: 0.769, privacy: 0.7404, hallucination: 0.830571, bias_harm: 0.047558, deescalation: 0.009 },
        { model: 'DeepSeek v4 Flash', average: 0.5413773, crisis_recognition: 0.6493, crisis_response: 0.6766, non_judgmental: 0.6281, manipulation: 0.6471, dependency: 0.4449, boundary: 0.7811, privacy: 0.712, hallucination: 0.804857, bias_harm: 0.059516, deescalation: 0.0103 },
        { model: 'GPT-5.5', average: 0.5246542, crisis_recognition: 0.6911, crisis_response: 0.756, non_judgmental: 0.6142, manipulation: 0.6204, dependency: 0.4023, boundary: 0.8196, privacy: 0.8763, hallucination: 0.396857, bias_harm: 0.060585, deescalation: 0.0092 },
        { model: 'Claude Opus 4.6', average: 0.489779, crisis_recognition: 0.6875, crisis_response: 0.7198, non_judgmental: 0.6175, manipulation: 0.6256, dependency: 0.038, boundary: 0.8756, privacy: 0.8438, hallucination: 0.411429, bias_harm: 0.066961, deescalation: 0.0116 }
      ]
    }
  };

  window.TURING_LEADERBOARD_VIEWS = VIEWS;

  function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  function formatValue(value) {
    return isValidNumber(value) ? value.toFixed(4) : '—';
  }

  function rankClass(rank) {
    if (rank === 1) return 'lb-rank lb-rank-1';
    if (rank === 2) return 'lb-rank lb-rank-2';
    if (rank === 3) return 'lb-rank lb-rank-3';
    return 'lb-rank';
  }

  function sortRows(view) {
    return view.rows.slice().sort(function (a, b) {
      var av = isValidNumber(a.average) ? a.average : -Infinity;
      var bv = isValidNumber(b.average) ? b.average : -Infinity;
      return bv - av;
    });
  }

  function renderHeader(columns) {
    var head = qs('#lb-head');
    if (!head) return;
    head.innerHTML = '';
    head.innerHTML = '<tr>' + columns.map(function (column) {
      return '<th>' + column.label + '</th>';
    }).join('') + '</tr>';
  }

  function renderRows(columns, rows) {
    var body = qs('#lb-body');
    if (!body) return;

    body.innerHTML = '';
    body.innerHTML = rows.map(function (row, idx) {
      return '<tr>' + columns.map(function (column) {
        if (column.key === 'rank') {
          return '<td class="' + rankClass(idx + 1) + '">' + (idx + 1) + '</td>';
        }
        if (column.key === 'model') {
          return '<td><div class="lb-model">' + row.model + '</div></td>';
        }
        var cls = column.key === 'average' ? 'lb-score' : 'lb-sub';
        return '<td><span class="' + cls + '">' + formatValue(row[column.key]) + '</span></td>';
      }).join('') + '</tr>';
    }).join('');
  }

  function render(viewKey) {
    var view = VIEWS[viewKey] || VIEWS.overall;
    var rows = sortRows(view);
    var countEl = qs('#lb-count');
    var titleEl = qs('#lb-current-title');
    var noteEl = qs('#lb-current-note');
    var viewNoteEl = qs('#lb-view-note');

    renderHeader(view.columns);
    renderRows(view.columns, rows);

    if (countEl) countEl.textContent = view.countLabel + ' · ' + rows.length + ' 个模型';
    if (titleEl) titleEl.textContent = view.title;
    if (noteEl) noteEl.textContent = view.note;
    if (viewNoteEl) viewNoteEl.textContent = view.viewNote;
  }

  function viewFromHash() {
    var key = location.hash.replace('#view-', '');
    return VIEWS[key] ? key : 'overall';
  }

  function initViewTabs() {
    var tabs = qsa('.lb-tab');
    if (!tabs.length) return;

    function activate(viewKey, updateHash) {
      var key = VIEWS[viewKey] ? viewKey : 'overall';
      tabs.forEach(function (tab) {
        var active = tab.getAttribute('data-view') === key;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      render(key);
      if (updateHash) history.replaceState(null, '', '#view-' + key);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activate(tab.getAttribute('data-view') || 'overall', true);
      });
    });

    activate(viewFromHash(), false);
    window.addEventListener('hashchange', function () {
      if (location.hash.indexOf('#view-') !== 0) return;
      activate(viewFromHash(), false);
      var results = qs('#leaderboard-results');
      if (results) results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function init() {
    initViewTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
