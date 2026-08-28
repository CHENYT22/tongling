(function () {
  "use strict";

  const SECTION_ORDER = [
    "一句话定位",
    "基本信息",
    "数据获取与处理流程",
    "标注规则与标签体系",
    "数据内容与字段形式",
    "数据规模与任务划分",
    "数据来源与使用方法",
    "使用限制",
    "Benchmark/Baseline 结果",
    "实时打榜/当前排名情况"
  ];

  const state = {
    catalog: null,
    entries: [],
    category: "",
    task: "",
    sideSelection: null,
    query: "",
    sort: "document",
    openId: ""
  };

  const qs = (selector, root) => (root || document).querySelector(selector);

  // Page-only presentation palette; the original catalog color fields stay unchanged.
  const CATEGORY_COLORS = {
    affective: "var(--dataset-affective-accent)", cognitive: "var(--dataset-cognitive-accent)",
    concern: "var(--dataset-concern-accent)", safety: "var(--dataset-safety-accent)"
  };
  const categoryColor = category => CATEGORY_COLORS[category.id] || "var(--blue)";

  function applyCategoryPalette(element, category) {
    element.style.setProperty("--accent", categoryColor(category));
    element.style.setProperty("--category-soft", "var(--dataset-" + category.id + "-soft)");
    element.style.setProperty("--category-ink", "var(--dataset-" + category.id + "-ink)");
  }

  function create(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value != null) node.textContent = value;
    return node;
  }

  function compactText(node) {
    return (node && node.textContent ? node.textContent : "").replace(/\s+/g, " ").trim();
  }

  function normalizeName(value) {
    return String(value || "")
      .replace(/^\d+(?:\.\d+)*[.、]?\s*/, "")
      .replace(/\s+(zhou|pan)$/i, "")
      .trim();
  }

  function safeExternalUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.href);
      if (!/^https?:$/.test(url.protocol)) return "";
      const hostname = url.hostname.toLowerCase();
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.endsWith("feishu.cn") ||
        hostname.endsWith("larksuite.com")
      ) return "";
      return url.href;
    } catch (_) {
      return "";
    }
  }

  function sectionByLabel(entry, label) {
    return entry.sections.find(function (section) { return section.label === label; });
  }

  function fieldFromSection(section, labels) {
    if (!section) return "";
    for (const node of section.nodes) {
      const line = compactText(node);
      for (const label of labels) {
        const match = line.match(new RegExp("^" + label + "\\s*[：:]\\s*(.+)$"));
        if (match) return match[1].trim();
      }
    }
    return "";
  }

  function parseDocument(xmlText, category) {
    const xml = new DOMParser().parseFromString("<root>" + xmlText + "</root>", "application/xml");
    if (xml.querySelector("parsererror")) {
      throw new Error(category.name + "数据格式解析失败");
    }

    const entries = [];
    let currentTask = "";
    let currentEntry = null;
    let currentSection = null;

    Array.from(xml.documentElement.children).forEach(function (node) {
      const tag = node.localName.toLowerCase();
      if (tag === "h2") {
        const heading = compactText(node);
        currentEntry = null;
        currentSection = null;
        if (/^细分任务统计/.test(heading)) {
          currentTask = "";
        } else {
          currentTask = heading.replace(/\s*[（(]\s*\d+\s*[）)]\s*$/, "").trim();
        }
        return;
      }

      if (tag === "h3" && currentTask) {
        const rawName = compactText(node);
        currentEntry = {
          id: category.id + "-" + (entries.length + 1),
          category: category,
          categoryIndex: entries.length + 1,
          task: currentTask,
          rawName: rawName,
          name: normalizeName(rawName),
          sections: [],
          links: []
        };
        entries.push(currentEntry);
        currentSection = null;
        return;
      }

      if (tag === "h4" && currentEntry) {
        const label = compactText(node);
        currentSection = { label: label, nodes: [] };
        currentEntry.sections.push(currentSection);
        return;
      }

      if (currentSection) currentSection.nodes.push(node.cloneNode(true));
    });

    entries.forEach(function (entry) {
      entry.sections.sort(function (a, b) {
        const aIndex = SECTION_ORDER.indexOf(a.label);
        const bIndex = SECTION_ORDER.indexOf(b.label);
        return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
      });

      const basic = sectionByLabel(entry, "基本信息");
      const positioning = sectionByLabel(entry, "一句话定位");
      entry.positioning = positioning ? positioning.nodes.map(compactText).filter(Boolean).join(" ") : "";
      entry.modality = fieldFromSection(basic, ["模态类型", "模态", "数据模态"]) || "";
      entry.year = fieldFromSection(basic, ["发布时间", "发布年份", "年份"]) || "";
      entry.publisher = fieldFromSection(basic, ["发布机构", "发布方", "机构"]) || "";

      const searchable = [entry.name, entry.rawName, entry.task, category.name, category.englishName];
      entry.sections.forEach(function (section) {
        searchable.push(section.label);
        section.nodes.forEach(function (node) {
          searchable.push(compactText(node));
          Array.from(node.querySelectorAll("a[href]")).forEach(function (link) {
            const href = safeExternalUrl(link.getAttribute("href"));
            if (href && !entry.links.some(function (item) { return item.href === href; })) {
              entry.links.push({ href: href, label: compactText(link) || "官方链接" });
            }
          });
        });
      });
      entry.search = searchable.join(" ").toLocaleLowerCase("zh-CN");
    });

    return entries;
  }

  function appendChildren(source, target) {
    Array.from(source.childNodes).forEach(function (child) {
      const converted = convertNode(child);
      if (converted) target.appendChild(converted);
    });
  }

  function convertNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.nodeValue || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const tag = node.localName.toLowerCase();
    if (["script", "style", "title", "callout", "figure", "cite", "sheet"].includes(tag)) return null;
    if (tag === "hr") return null;

    if (tag === "a") {
      const href = safeExternalUrl(node.getAttribute("href"));
      if (!href) {
        const fragment = document.createDocumentFragment();
        appendChildren(node, fragment);
        return fragment;
      }
      const link = document.createElement("a");
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      appendChildren(node, link);
      if (!compactText(link)) link.textContent = href;
      return link;
    }

    if (tag === "table") {
      const wrap = create("div", "table-scroll");
      const table = document.createElement("table");
      appendChildren(node, table);
      wrap.appendChild(table);
      return wrap;
    }

    if (tag === "img" || tag === "image") {
      const src = safeExternalUrl(node.getAttribute("src") || node.getAttribute("url"));
      if (!src) return null;
      const image = document.createElement("img");
      image.className = "doc-image";
      image.src = src;
      image.alt = node.getAttribute("alt") || "数据集资料图片";
      image.loading = "lazy";
      return image;
    }

    const mappedTag = ({ h5: "h5", h6: "h5", h7: "h5", h8: "h5" })[tag] || tag;
    const allowed = new Set([
      "p", "ul", "ol", "li", "b", "strong", "em", "i", "u", "s", "code", "pre",
      "blockquote", "br", "h5", "colgroup", "col", "thead", "tbody", "tfoot", "tr",
      "th", "td", "caption", "sup", "sub", "span"
    ]);
    const element = document.createElement(allowed.has(mappedTag) ? mappedTag : "div");

    if (tag === "th" || tag === "td") {
      const colspan = Number(node.getAttribute("colspan"));
      const rowspan = Number(node.getAttribute("rowspan"));
      if (colspan > 1 && colspan < 50) element.colSpan = colspan;
      if (rowspan > 1 && rowspan < 500) element.rowSpan = rowspan;
    }
    if (node.getAttribute("align") === "right") element.classList.add("align-right");
    appendChildren(node, element);
    return element;
  }

  function resourceLabel(url, value) {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const providers = [
      [/github\.com$/, "GitHub"],
      [/huggingface\.co$/, "Hugging Face"],
      [/arxiv\.org$/, "arXiv"],
      [/aclanthology\.org$/, "ACL Anthology"],
      [/kaggle\.com$/, "Kaggle"],
      [/paperswithcode\.com$/, "Papers with Code"],
      [/zenodo\.org$/, "Zenodo"],
      [/openreview\.net$/, "OpenReview"]
    ];
    const generic = /^(?:官方链接|官方项目(?:\/论文页)?|项目页|论文链接|数据集介绍页|链接|https?:\/\/)/i;
    if (value && !generic.test(value.trim())) return value.trim();
    const provider = providers.find(function (item) { return item[0].test(hostname); });
    return provider ? provider[1] : "官方资源";
  }

  function sourceResources(section) {
    const resources = [];
    const seen = new Set();

    function append(urlValue, label) {
      const href = safeExternalUrl(String(urlValue || "").replace(/[；;，,。.)）]+$/, ""));
      if (!href || seen.has(href)) return;
      seen.add(href);
      resources.push({
        href: href,
        label: resourceLabel(href, label),
        hostname: new URL(href).hostname.replace(/^www\./, "")
      });
    }

    section.nodes.forEach(function (node) {
      Array.from(node.querySelectorAll("a[href]")).forEach(function (link) {
        append(link.getAttribute("href"), compactText(link));
      });
      const text = compactText(node);
      (text.match(/https?:\/\/[^\s<>]+/g) || []).forEach(function (url) { append(url, ""); });
    });
    return resources;
  }

  function isResourceOnlyElement(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
    const text = compactText(node);
    const anchors = Array.from(node.querySelectorAll("a[href]"));
    if (anchors.length && text === anchors.map(compactText).join(" ")) return true;

    if (anchors.length) {
      const clone = node.cloneNode(true);
      Array.from(clone.querySelectorAll("a[href]")).forEach(function (link) { link.remove(); });
      const remainder = compactText(clone)
        .replace(/^(?:参考来源|官方链接|官方资源|官方项目|项目页|论文链接|论文原文|数据集介绍页)\s*[：:]?/i, "")
        .replace(/[：:；;?？|｜，,。.)（）()\s]/g, "");
      if (!remainder) return true;
    }

    const withoutUrls = text
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[：:；;?？|｜\s]/g, "")
      .toLocaleLowerCase("zh-CN");
    return /^(?:参考来源|官方链接|官方资源|官方项目|项目页|论文链接|论文原文|数据集介绍页|arxiv|github|huggingface|acl(?:anthology)?|openreview|zenodo|kaggle|paper|pdf)+$/i.test(withoutUrls);
  }

  function sourceBodyNode(node) {
    const clone = node.cloneNode(true);
    if (["ul", "ol"].includes(clone.localName.toLowerCase())) {
      Array.from(clone.children).forEach(function (child) {
        if (isResourceOnlyElement(child)) child.remove();
      });
      if (!clone.children.length) return null;
    } else if (isResourceOnlyElement(clone)) {
      return null;
    }
    return convertNode(clone);
  }

  function renderSourceContent(section, panel) {
    const resources = sourceResources(section);
    if (resources.length) {
      const resourceBlock = create("section", "source-resource-block");
      resourceBlock.appendChild(create("h5", "source-subheading", "资料入口"));
      const resourceGrid = create("div", "source-resource-grid");
      resources.forEach(function (resource) {
        const link = create("a", "source-resource-link");
        link.href = resource.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.append(create("strong", "", resource.label), create("small", "", resource.hostname));
        resourceGrid.appendChild(link);
      });
      resourceBlock.appendChild(resourceGrid);
      panel.appendChild(resourceBlock);
    }

    const body = create("section", "source-method-body");
    section.nodes.forEach(function (node) {
      const converted = sourceBodyNode(node);
      if (converted) body.appendChild(converted);
    });
    if (body.childNodes.length) {
      body.prepend(create("h5", "source-subheading", "数据与使用说明"));
      panel.appendChild(body);
    }
  }

  function renderSectionContent(entry, section, panel) {
    panel.replaceChildren();
    panel.setAttribute("aria-label", section.label);
    panel.classList.toggle("is-source-section", section.label === "数据来源与使用方法");
    if (section.label === "数据来源与使用方法") {
      renderSourceContent(section, panel);
      if (!panel.childNodes.length) panel.appendChild(create("p", "empty-section", "暂无公开信息。"));
      return;
    }
    const fragment = document.createDocumentFragment();
    section.nodes.forEach(function (node) {
      const converted = convertNode(node);
      if (converted) fragment.appendChild(converted);
    });
    if (!fragment.childNodes.length) fragment.appendChild(create("p", "empty-section", "暂无公开信息。"));
    panel.appendChild(fragment);
  }

  function categoryById(id) {
    return state.catalog.categories.find(function (category) { return category.id === id; });
  }

  function categoryFromUrl() {
    const requested = new URLSearchParams(window.location.search).get("dimension") || "";
    return categoryById(requested) ? requested : "";
  }

  function syncCategoryToUrl(replace) {
    const url = new URL(window.location.href);
    if (state.category) url.searchParams.set("dimension", state.category);
    else url.searchParams.delete("dimension");
    const next = url.pathname + (url.searchParams.toString() ? "?" + url.searchParams.toString() : "") + url.hash;
    const method = replace ? "replaceState" : "pushState";
    const side = state.sideSelection ? { categories: Array.from(state.sideSelection.categories), tasks: Array.from(selectedTasks()) } : null;
    window.history[method]({ dimension: state.category, datasetFilters: side }, "", next);
  }

  function renderOverview() {
    qs("#entry-total").textContent = state.catalog.totalEntries;
    qs("#task-total").textContent = state.catalog.totalTasks;

    let cursor = 0;
    const stops = [];
    state.catalog.categories.forEach(function (category) {
      const next = cursor + category.count / state.catalog.totalEntries * 100;
      stops.push(categoryColor(category) + " " + cursor.toFixed(2) + "% " + next.toFixed(2) + "%");
      cursor = next;
    });
    qs("#category-donut").style.background = "conic-gradient(" + stops.join(",") + ")";

    const legend = qs("#category-legend");
    legend.replaceChildren();
    state.catalog.categories.forEach(function (category) {
      const item = create("div", "legend-item");
      const dot = create("i");
      dot.style.background = categoryColor(category);
      item.append(dot, create("span", "", category.name), create("b", "", category.count));
      legend.appendChild(item);
    });
  }

  function bindBackgroundMotion() {
    const background = qs(".dataset-ambient");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let pageVisible = true;
    function update() {
      const enabled = !preference.matches;
      background.classList.toggle("is-running", enabled && pageVisible && !document.hidden);
    }
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(function (entries) {
        pageVisible = entries.some(function (entry) { return entry.isIntersecting; });
        update();
      });
      observer.observe(qs(".dataset-page"));
    }
    update();
  }

  function bindOverviewMotion() {
    const trigger = qs("#donut-replay");
    const ring = qs("#category-donut");
    let animation = null;
    let observer = null;
    function replay() {
      if (observer) observer.disconnect();
      if (animation) animation.cancel();
      animation = null;
      if (reducedMotion() || !ring.animate) return;
      animation = ring.animate([
        { transform: "rotate(-360deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 2000, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
    }
    trigger.addEventListener("click", replay);
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (event) {
      if (event.matches && animation) animation.cancel();
    });
    // Play once when the chart first appears, including entry through a lower-page anchor.
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) replay();
      }, { threshold: 0.4 });
      observer.observe(trigger);
    } else replay();
  }

  function setCategory(categoryId) {
    state.sideSelection = null;
    state.category = categoryId;
    state.task = "";
    renderCategoryCards();
    renderTaskMap();
    populateTaskFilter();
    renderActiveFilters();
    renderEntries();
    syncCategoryToUrl(false);
  }

  function categoryCard(category, count, taskCount, description) {
    const selected = state.category === (category ? category.id : "");
    const button = create("button", "category-card" + (selected ? " is-active" : ""));
    button.type = "button";
    button.dataset.category = category ? category.id : "";
    applyCategoryPalette(button, category);
    const top = create("div", "category-card-top");
    const identity = create("div", "category-identity");
    const dot = create("i", "category-dot");
    identity.append(dot, create("span", "", category ? category.name : "全部数据"));
    top.append(identity, create("strong", "", count));
    button.append(top, create("small", "", taskCount + " 个细分任务"));
    button.setAttribute("aria-controls", "entry-list task-filter");
    button.setAttribute("aria-pressed", selected ? "true" : "false");
    button.addEventListener("click", function () { setCategory(button.dataset.category); });
    return button;
  }

  function renderCategoryCards() {
    const container = qs("#category-stats");
    if (!container.children.length) {
      state.catalog.categories.forEach(function (category) {
        container.appendChild(categoryCard(category, category.count, category.taskCount, category.description));
      });
    }
    // Keep controls mounted so changing a category does not discard keyboard focus.
    Array.from(container.children).forEach(function (button) {
      const selected = selectedCategories().has(button.dataset.category);
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    const parent = qs("#all-data-toggle");
    parent.classList.toggle("is-active", !selectedCategories().size);
    parent.setAttribute("aria-pressed", selectedCategories().size ? "false" : "true");
    qs("#all-data-count").textContent = state.catalog.totalEntries;
  }

  function renderTaskMap() {
    const description = qs("#task-description");
    if (state.sideSelection) {
      description.textContent = "已选 " + state.sideSelection.categories.size + " 类全部数据、" + selectedTasks().size + " 个细分任务；按所属能力合并展示。";
      return;
    }
    if (state.task) description.textContent = "当前任务：" + state.task;
    else if (state.category) description.textContent = categoryById(state.category).description;
    else description.textContent = state.catalog.totalTasks + " 个细分任务按四类能力分组，可直接选择，自动定位到所属分类。";
  }

  function populateTaskFilter() {
    const select = qs("#task-filter");
    const current = state.task;
    select.replaceChildren();
    select.disabled = false;
    select.appendChild(new Option("全部细分任务", ""));
    const chosen = selectedCategories();
    const categories = chosen.size ? state.catalog.categories.filter(function (category) { return chosen.has(category.id); }) : state.catalog.categories;
    categories.filter(Boolean).forEach(function (category) {
      const group = document.createElement("optgroup");
      group.label = category.name;
      category.tasks.forEach(function (task) { group.appendChild(new Option(task.name + "（" + task.count + "）", task.name)); });
      select.appendChild(group);
    });
    select.value = current;
    renderTaskPicker(categories);
  }

  function closeTaskPicker(returnFocus) {
    qs("#task-picker-panel").hidden = true;
    qs("#task-picker-toggle").setAttribute("aria-expanded", "false");
    if (returnFocus) qs("#task-picker-toggle").focus({ preventScroll: true });
  }

  function renderTaskPicker(categories) {
    closeTaskPicker(false);
    qs("#task-picker-value").textContent = selectedTasks().size > 1 ? "已选 " + selectedTasks().size + " 个任务" : state.task || "全部细分任务";
    if (state.sideSelection && state.sideSelection.categories.size && selectedTasks().size) {
      qs("#task-picker-value").textContent = state.sideSelection.categories.size + " 类全部 · " + selectedTasks().size + " 个任务";
    }
    qs("#task-picker-count").textContent = categories.reduce(function (sum, category) { return sum + category.taskCount; }, 0) + " 个任务";
    const options = qs("#task-picker-options");
    options.replaceChildren();
    function option(task, count, category) {
      const button = create("button", "task-picker-option");
      button.type = "button";
      button.dataset.task = task;
      button.setAttribute("aria-pressed", (task ? selectedTasks().has(task) : !selectedTasks().size) ? "true" : "false");
      const mark = create("span", "task-picker-check");
      mark.setAttribute("aria-hidden", "true");
      button.append(mark, create("span", "task-picker-name", task || "全部细分任务"), create("span", "task-picker-number", count + " 条"));
      button.addEventListener("click", function () {
        if (!task && state.sideSelection) clearSideTasks();
        else state.sideSelection = null;
        if (task) state.category = category.id;
        state.task = task;
        syncAndRender();
        syncCategoryToUrl(false);
        closeTaskPicker(true);
      });
      return button;
    }
    options.appendChild(option("", categories.reduce(function (sum, category) { return sum + category.count; }, 0)));
    categories.forEach(function (category) {
      const group = create("section", "task-picker-group");
      applyCategoryPalette(group, category);
      const heading = create("h3", "task-picker-group-title", category.name);
      heading.id = "task-group-" + category.id;
      group.setAttribute("aria-labelledby", heading.id);
      const items = create("div", "task-picker-items");
      category.tasks.forEach(function (task) { items.appendChild(option(task.name, task.count, category)); });
      group.append(heading, items);
      options.appendChild(group);
    });
  }

  function bindTaskPicker() {
    const trigger = qs("#task-picker-toggle");
    const panel = qs("#task-picker-panel");
    function open() {
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      const selected = qs('#task-picker-options [aria-pressed="true"]') || qs('#task-picker-options button');
      const scroller = qs("#task-picker-options");
      selected.focus({ preventScroll: true });
      scroller.scrollTop += selected.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12;
    }
    trigger.addEventListener("click", function () { if (panel.hidden) open(); else closeTaskPicker(false); });
    qs("#tasks").addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        event.stopPropagation();
        closeTaskPicker(true);
      }
      if (event.target === trigger && ["ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        open();
      } else if (panel.contains(event.target) && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const items = Array.from(panel.querySelectorAll(".task-picker-option"));
        const index = items.indexOf(document.activeElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items[next].focus({ preventScroll: true });
        items[next].scrollIntoView({ block: "nearest", behavior: "instant" });
      }
    });
    document.addEventListener("click", function (event) {
      if (!panel.hidden && !panel.contains(event.target) && !trigger.contains(event.target)) closeTaskPicker(false);
    });
  }

  function renderActiveFilters() {
    const row = qs("#active-filter-row");
    row.replaceChildren();
    const filters = [];
    if (state.sideSelection) {
      state.sideSelection.categories.forEach(function (id) { filters.push({ label: "能力：" + categoryById(id).name, clear: function () { state.sideSelection.categories.delete(id); applySideSelection(); } }); });
      selectedTasks().forEach(function (task) { filters.push({ label: "任务：" + task, clear: function () { state.sideSelection.tasks.delete(task); applySideSelection(); } }); });
    } else {
      if (state.category) filters.push({ label: "能力：" + categoryById(state.category).name, clear: function () { setCategory(""); } });
      if (state.task) filters.push({ label: "任务：" + state.task, clear: function () { state.task = ""; syncAndRender(); } });
    }
    if (state.query) filters.push({ label: "搜索：" + state.query, clear: function () { state.query = ""; qs("#dataset-search").value = ""; syncAndRender(); } });
    filters.forEach(function (filter) {
      const button = create("button", "filter-chip", filter.label + " ×");
      button.type = "button";
      button.addEventListener("click", filter.clear);
      row.appendChild(button);
    });
  }

  function filteredEntries() {
    const terms = state.query.toLocaleLowerCase("zh-CN").split(/\s+/).filter(Boolean);
    const categories = selectedCategories();
    const tasks = selectedTasks();
    const output = state.entries.filter(function (entry) {
      if (state.sideSelection) {
        if ((categories.size || tasks.size) && !state.sideSelection.categories.has(entry.category.id) && !tasks.has(entry.task)) return false;
      } else {
        if (categories.size && !categories.has(entry.category.id)) return false;
        if (tasks.size && !tasks.has(entry.task)) return false;
      }
      return terms.every(function (term) { return entry.search.includes(term); });
    });
    if (state.sort === "name") {
      output.sort(function (a, b) { return a.name.localeCompare(b.name, "zh-CN", { numeric: true }); });
    } else {
      output.sort(function (a, b) { return a.globalIndex - b.globalIndex; });
    }
    return output;
  }

  function shortPositioning(entry) {
    const value = entry.positioning || "查看数据集的任务定位、数据结构、使用方式与评测结果。";
    return value.length > 150 ? value.slice(0, 150).trim() + "…" : value;
  }

  const detailDialog = qs("#dataset-detail-dialog");
  const detailContent = qs("#dataset-detail-content");
  let detailReturnState = null;
  let detailCloseTimer = null;
  let detailScrollFrame = null;
  let backdropPressed = false;
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setDetailSection(index) {
    Array.from(qs("#dataset-detail-nav").children).forEach(function (button, i) {
      button.classList.toggle("is-active", i === index);
      if (i === index) button.setAttribute("aria-current", "location");
      else button.removeAttribute("aria-current");
    });
    qs("#dataset-detail-section-select").value = String(index);
  }

  function jumpToDetailSection(index) {
    const target = detailContent.children[index];
    if (!target) return;
    const top = target.getBoundingClientRect().top - detailContent.getBoundingClientRect().top + detailContent.scrollTop;
    detailContent.scrollTo({ top: Math.max(0, top - 24), behavior: reducedMotion() ? "auto" : "smooth" });
    setDetailSection(index);
  }

  function buildEntryDetail(entry) {
    qs("#dataset-detail-title").textContent = entry.name;
    qs("#dataset-detail-category").textContent = entry.category.name + " · " + entry.task;
    const navigation = qs("#dataset-detail-nav");
    const select = qs("#dataset-detail-section-select");
    navigation.replaceChildren();
    select.replaceChildren();
    const fragment = document.createDocumentFragment();
    entry.sections.forEach(function (section, index) {
      const article = create("section", "dataset-detail-section");
      article.id = "dataset-detail-section-" + index;
      const heading = create("h3", "", section.label);
      heading.id = article.id + "-title";
      article.setAttribute("aria-labelledby", heading.id);
      const panel = create("div", "entry-panel");
      renderSectionContent(entry, section, panel);
      article.append(heading, panel);
      fragment.appendChild(article);
      const button = create("button", "section-nav-button");
      button.type = "button";
      button.setAttribute("aria-controls", article.id);
      button.append(create("b", "", String(index + 1).padStart(2, "0")), create("span", "", section.label));
      button.addEventListener("click", function () { jumpToDetailSection(index); });
      navigation.appendChild(button);
      select.appendChild(new Option(String(index + 1).padStart(2, "0") + " · " + section.label, String(index)));
    });
    detailContent.replaceChildren(fragment);
    setDetailSection(0);
  }

  function openEntryDetail(entry, trigger) {
    if (detailDialog.open || detailReturnState) return;
    buildEntryDetail(entry);
    detailReturnState = {
      x: window.scrollX, y: window.scrollY, trigger: trigger,
      bodyStyle: document.body.getAttribute("style"),
      htmlOverflow: document.documentElement.style.overflow,
      htmlScrollBehavior: document.documentElement.style.scrollBehavior
    };
    const gutter = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const bodyPadding = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    document.body.style.position = "fixed";
    document.body.style.top = -detailReturnState.y + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.paddingRight = bodyPadding + gutter + "px";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.scrollBehavior = "auto";
    state.openId = entry.id;
    trigger.setAttribute("aria-expanded", "true");
    detailDialog.showModal();
    detailContent.scrollTop = 0;
    qs(".dataset-detail-close", detailDialog).focus({ preventScroll: true });
    requestAnimationFrame(function () {
      if (detailDialog.open && !detailCloseTimer) detailDialog.classList.add("is-visible");
    });
  }

  function restoreDetailBackground() {
    if (!detailReturnState) return;
    const previous = detailReturnState;
    detailReturnState = null;
    clearTimeout(detailCloseTimer);
    detailCloseTimer = null;
    if (detailScrollFrame !== null) cancelAnimationFrame(detailScrollFrame);
    detailScrollFrame = null;
    detailDialog.classList.remove("is-visible");
    if (previous.bodyStyle === null) document.body.removeAttribute("style");
    else document.body.setAttribute("style", previous.bodyStyle);
    document.documentElement.style.overflow = previous.htmlOverflow;
    window.scrollTo({ left: previous.x, top: previous.y, behavior: "instant" });
    document.documentElement.style.scrollBehavior = previous.htmlScrollBehavior;
    state.openId = "";
    if (previous.trigger.isConnected) {
      previous.trigger.setAttribute("aria-expanded", "false");
      previous.trigger.focus({ preventScroll: true });
    }
  }

  function closeEntryDetail() {
    if (!detailDialog.open || detailCloseTimer !== null) return;
    detailDialog.classList.remove("is-visible");
    function finish() {
      detailDialog.close();
      restoreDetailBackground();
    }
    if (reducedMotion()) finish();
    else detailCloseTimer = setTimeout(finish, 180);
  }

  function bindDetailDialog() {
    qs(".dataset-detail-close", detailDialog).addEventListener("click", closeEntryDetail);
    detailDialog.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeEntryDetail();
    });
    detailDialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeEntryDetail();
    });
    detailDialog.addEventListener("close", restoreDetailBackground);
    function outside(event) {
      const rect = detailDialog.getBoundingClientRect();
      return event.target === detailDialog &&
        (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
    }
    detailDialog.addEventListener("pointerdown", function (event) { backdropPressed = outside(event); });
    detailDialog.addEventListener("click", function (event) {
      if (backdropPressed && outside(event)) closeEntryDetail();
      backdropPressed = false;
    });
    qs("#dataset-detail-section-select").addEventListener("change", function (event) {
      jumpToDetailSection(Number(event.target.value));
    });
    detailContent.addEventListener("scroll", function () {
      if (detailScrollFrame !== null) return;
      detailScrollFrame = requestAnimationFrame(function () {
        detailScrollFrame = null;
        const top = detailContent.getBoundingClientRect().top;
        let active = 0;
        Array.from(detailContent.children).forEach(function (section, index) {
          if (section.getBoundingClientRect().top - top <= 64) active = index;
        });
        // A short last section cannot reach the top of the scroll viewport.
        if (detailContent.scrollTop > 0 && detailContent.scrollTop + detailContent.clientHeight >= detailContent.scrollHeight - 2) {
          active = detailContent.children.length - 1;
        }
        setDetailSection(active);
      });
    }, { passive: true });
  }

  function buildEntryCard(entry) {
    const card = create("article", "entry-card");
    card.dataset.id = entry.id;
    applyCategoryPalette(card, entry.category);

    const head = create("button", "entry-head");
    head.type = "button";
    head.setAttribute("aria-expanded", "false");
    head.setAttribute("aria-haspopup", "dialog");
    head.setAttribute("aria-controls", "dataset-detail-dialog");
    const index = create("span", "entry-index", String(entry.globalIndex).padStart(3, "0"));
    const title = create("span", "entry-title");
    title.append(create("b", "", entry.name), create("small", "", shortPositioning(entry)));
    const tags = create("span", "entry-tags");
    const categoryTag = create("span", "entry-tag category-tag", entry.category.name);
    tags.append(categoryTag, create("span", "entry-tag", entry.task));
    if (entry.year && entry.year.length < 20) tags.appendChild(create("span", "entry-tag subtle-tag", entry.year));
    const chevron = create("span", "entry-chevron");
    chevron.setAttribute("aria-hidden", "true");
    head.append(index, title, tags, chevron);

    head.addEventListener("click", function () {
      openEntryDetail(entry, head);
    });

    card.append(head);
    return card;
  }

  function closeSortPicker(returnFocus) {
    qs("#sort-picker-panel").hidden = true;
    qs("#sort-picker-toggle").setAttribute("aria-expanded", "false");
    if (returnFocus) qs("#sort-picker-toggle").focus({ preventScroll: true });
  }

  function renderSortPicker() {
    const label = state.sort === "name" ? "名称排序" : "文档顺序";
    qs("#sort-picker-value").textContent = label;
    qs("#sort-picker-toggle").setAttribute("aria-label", "排序：" + label);
    qs("#sort-order").value = state.sort;
    qs("#sort-picker-panel").querySelectorAll("[data-sort]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.sort === state.sort ? "true" : "false");
    });
    closeSortPicker(false);
  }

  function bindSortPicker() {
    const container = qs("#sort-picker");
    const trigger = qs("#sort-picker-toggle");
    const panel = qs("#sort-picker-panel");
    const options = Array.from(panel.querySelectorAll("[data-sort]"));
    function open() {
      closeTaskPicker(false);
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      options.find(function (button) { return button.dataset.sort === state.sort; }).focus({ preventScroll: true });
    }
    trigger.addEventListener("click", function () { if (panel.hidden) open(); else closeSortPicker(false); });
    options.forEach(function (button) {
      button.addEventListener("click", function () {
        const select = qs("#sort-order");
        select.value = button.dataset.sort;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        closeSortPicker(true);
      });
    });
    container.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        event.stopPropagation();
        closeSortPicker(true);
      } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        if (panel.hidden || event.target === trigger) open();
        else {
          const index = options.indexOf(document.activeElement);
          const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
          options[next].focus({ preventScroll: true });
        }
      }
    });
    document.addEventListener("click", function (event) {
      if (!container.contains(event.target)) closeSortPicker(false);
    });
    container.addEventListener("focusout", function (event) {
      if (event.relatedTarget && !container.contains(event.relatedTarget)) closeSortPicker(false);
    });
  }

  function renderEntries() {
    syncScrollNav();
    renderSortPicker();
    const entries = filteredEntries();
    const list = qs("#entry-list");
    list.replaceChildren();
    qs("#result-count").textContent = "显示 " + entries.length + " / " + state.catalog.totalEntries + " 条评测条目";

    if (!entries.length) {
      const empty = create("div", "no-results");
      empty.append(create("b", "", "未找到匹配的数据集"), create("span", "", "调整关键词或清除筛选后重试。"));
      list.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    entries.forEach(function (entry) { fragment.appendChild(buildEntryCard(entry)); });
    list.appendChild(fragment);
  }

  function selectedCategories() {
    if (!state.sideSelection) return new Set(state.category ? [state.category] : []);
    const categories = new Set(state.sideSelection.categories);
    state.catalog.categories.forEach(function (category) {
      if (category.tasks.some(function (task) { return state.sideSelection.tasks.has(task.name); })) categories.add(category.id);
    });
    return categories;
  }

  function selectedTasks() {
    return state.sideSelection ? state.sideSelection.tasks : new Set(state.task ? [state.task] : []);
  }

  // Top-level "all tasks" broadens the currently selected branches, not all data.
  function clearSideTasks() {
    state.sideSelection.categories = selectedCategories();
    state.sideSelection.tasks.clear();
  }

  function applySideSelection() {
    const categories = selectedCategories();
    const tasks = selectedTasks();
    state.category = categories.size === 1 ? Array.from(categories)[0] : "";
    state.task = tasks.size === 1 && !state.sideSelection.categories.size ? Array.from(tasks)[0] : "";
    syncAndRender();
    syncCategoryToUrl(false);
  }

  function syncScrollNav() {
    const nav = qs("#dataset-scroll-nav");
    const categories = selectedCategories();
    const tasks = selectedTasks();
    const wholeCategories = state.sideSelection ? state.sideSelection.categories : new Set(state.task ? [] : categories);
    nav.querySelectorAll("[data-nav-category]").forEach(function (input) {
      input.checked = wholeCategories.has(input.dataset.navCategory);
      input.indeterminate = !input.checked && categories.has(input.dataset.navCategory);
    });
    nav.querySelectorAll("[data-nav-task]").forEach(function (input) { input.checked = tasks.has(input.dataset.navTask); });
    nav.querySelectorAll("[data-nav-group]").forEach(function (group) { group.classList.toggle("has-selection", categories.has(group.dataset.navGroup)); });
    qs("#scroll-nav-all").setAttribute("aria-pressed", String(!categories.size && !tasks.size));
    const count = wholeCategories.size + tasks.size;
    qs("#scroll-nav-status").hidden = !count && !state.query;
    qs("#scroll-nav-count").textContent = "已选 " + count + " 项";
  }

  function bindScrollNav() {
    const nav = qs("#dataset-scroll-nav");
    const groups = qs("#scroll-nav-groups");
    const launcher = qs("#scroll-nav-launcher");
    function checkbox(label, key, value) {
      const row = create("label", "scroll-nav-option");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.dataset[key] = value;
      row.append(input, create("span", "", label));
      return row;
    }
    state.catalog.categories.forEach(function (category) {
      const group = create("details", "scroll-nav-group");
      group.dataset.navGroup = category.id;
      applyCategoryPalette(group, category);
      group.appendChild(create("summary", "", category.name));
      const options = create("div", "scroll-nav-options");
      const all = checkbox("该类全部数据", "navCategory", category.id);
      qs("input", all).setAttribute("aria-label", category.name + "全部数据");
      options.appendChild(all);
      category.tasks.forEach(function (task) {
        const row = checkbox(task.name, "navTask", task.name);
        qs("input", row).dataset.navOwner = category.id;
        options.appendChild(row);
      });
      group.appendChild(options);
      groups.appendChild(group);
    });
    qs("#scroll-nav-all").addEventListener("click", function () { setCategory(""); });
    nav.addEventListener("change", function (event) {
      const input = event.target;
      if (!input.matches("input[type=checkbox]")) return;
      if (!state.sideSelection) state.sideSelection = { categories: new Set(state.task ? [] : selectedCategories()), tasks: selectedTasks() };
      if (input.dataset.navCategory) {
        const id = input.dataset.navCategory;
        if (input.checked) state.sideSelection.categories.add(id); else state.sideSelection.categories.delete(id);
        categoryById(id).tasks.forEach(function (task) { state.sideSelection.tasks.delete(task.name); });
      } else {
        // Choosing a specific task refines only its own branch; other branches remain intact.
        state.sideSelection.categories.delete(input.dataset.navOwner);
        if (input.checked) state.sideSelection.tasks.add(input.dataset.navTask);
        else state.sideSelection.tasks.delete(input.dataset.navTask);
      }
      const wasVisible = !nav.hidden;
      applySideSelection();
      // Keep the first refreshed result in view even after a very long list shrinks.
      if (wasVisible) qs(".result-row").scrollIntoView({ block: "start", behavior: "instant" });
    });
    qs("#scroll-nav-clear").addEventListener("click", function () { qs("#clear-filters").click(); });
    launcher.addEventListener("click", function () {
      const expanded = nav.classList.toggle("is-expanded");
      launcher.setAttribute("aria-expanded", String(expanded));
    });
    nav.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-expanded")) {
        nav.classList.remove("is-expanded");
        launcher.setAttribute("aria-expanded", "false");
        launcher.focus({ preventScroll: true });
      }
    });
    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target) && !state.openId && !qs("#dataset-detail-dialog").contains(event.target)) {
        nav.classList.remove("is-expanded");
        launcher.setAttribute("aria-expanded", "false");
      }
    });
    let scheduled = false;
    function updateVisibility() {
      scheduled = false;
      // Body locking changes viewport coordinates; keep the navigation untouched in a modal.
      if (state.openId || qs("#dataset-detail-dialog").open) return;
      const headerBottom = Math.max(0, qs(".site-header").getBoundingClientRect().bottom);
      const searchBox = qs(".search-box").getBoundingClientRect();
      nav.style.setProperty("--scroll-nav-top", Math.max(headerBottom + 24, Math.min(window.innerHeight * .3, 280)) + "px");
      const show = searchBox.bottom <= headerBottom && searchBox.top < headerBottom;
      if (!show && nav.contains(document.activeElement)) qs("#dataset-search").focus({ preventScroll: true });
      nav.hidden = !show;
    }
    function schedule() {
      if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateVisibility); }
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(schedule);
      observer.observe(qs("#tasks"));
      observer.observe(qs(".site-header"));
    }
    updateVisibility();
  }

  function syncAndRender() {
    renderCategoryCards();
    renderTaskMap();
    populateTaskFilter();
    renderActiveFilters();
    renderEntries();
  }

  function bindControls() {
    bindBackgroundMotion();
    bindOverviewMotion();
    qs("#all-data-toggle").addEventListener("click", function () { setCategory(""); });
    bindDetailDialog();
    bindTaskPicker();
    bindSortPicker();
    bindScrollNav();
    const search = qs("#dataset-search");
    search.addEventListener("input", function () {
      state.query = search.value.trim();
      renderActiveFilters();
      renderEntries();
    });

    qs("#task-filter").addEventListener("change", function (event) {
      if (!event.target.value && state.sideSelection) clearSideTasks();
      else state.sideSelection = null;
      state.task = event.target.value;
      if (state.task && !state.category) {
        const owner = state.catalog.categories.find(function (category) {
          return category.tasks.some(function (task) { return task.name === state.task; });
        });
        if (owner) state.category = owner.id;
      }
      syncAndRender();
      syncCategoryToUrl(false);
    });

    qs("#sort-order").addEventListener("change", function (event) {
      state.sort = event.target.value;
      renderEntries();
    });

    qs("#clear-filters").addEventListener("click", function () {
      state.sideSelection = null;
      state.category = "";
      state.task = "";
      state.query = "";
      state.sort = "document";
      search.value = "";
      qs("#sort-order").value = "document";
      syncAndRender();
      syncCategoryToUrl(false);
    });

    document.addEventListener("keydown", function (event) {
      if (detailDialog.open) return;
      if (event.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        event.preventDefault();
        search.focus();
      }
      if (event.key === "Escape" && document.activeElement === search) {
        search.value = "";
        state.query = "";
        search.blur();
        renderActiveFilters();
        renderEntries();
      }
    });

    window.addEventListener("popstate", function (event) {
      state.sideSelection = null;
      state.category = categoryFromUrl();
      state.task = "";
      const saved = event.state && event.state.datasetFilters;
      if (saved && Array.isArray(saved.categories) && Array.isArray(saved.tasks)) {
        const validTasks = new Set(state.catalog.categories.flatMap(function (category) { return category.tasks.map(function (task) { return task.name; }); }));
        state.sideSelection = {
          categories: new Set(saved.categories.filter(function (id) { return !!categoryById(id); })),
          tasks: new Set(saved.tasks.filter(function (task) { return validTasks.has(task); }))
        };
        state.category = selectedCategories().size === 1 ? Array.from(selectedCategories())[0] : "";
        state.task = selectedTasks().size === 1 && !state.sideSelection.categories.size ? Array.from(selectedTasks())[0] : "";
      }
      syncAndRender();
    });
  }

  async function load() {
    try {
      const catalogResponse = await fetch("public-datasets-data/catalog.json", { cache: "no-store" });
      if (!catalogResponse.ok) throw new Error("目录加载失败");
      state.catalog = await catalogResponse.json();

      const groups = await Promise.all(state.catalog.categories.map(async function (category) {
        const response = await fetch("public-datasets-data/" + category.file, { cache: "no-store" });
        if (!response.ok) throw new Error(category.name + "加载失败");
        return parseDocument(await response.text(), category);
      }));

      state.entries = groups.flat();
      state.entries.forEach(function (entry, index) { entry.globalIndex = index + 1; });
      if (state.entries.length !== state.catalog.totalEntries) throw new Error("数据条目数量校验失败");
      state.category = categoryFromUrl();
      syncCategoryToUrl(true);

      renderOverview();
      bindControls();
      syncAndRender();
    } catch (error) {
      const list = qs("#entry-list");
      list.replaceChildren(create("div", "load-error", "页面数据载入失败：" + error.message + "。请通过本地网页服务打开本页面。"));
      qs("#result-count").textContent = "载入失败";
    }
  }

  load();
}());
