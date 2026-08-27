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
    query: "",
    sort: "document",
    openId: ""
  };

  const qs = (selector, root) => (root || document).querySelector(selector);

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
    window.history[method]({ dimension: state.category }, "", next);
  }

  function renderOverview() {
    qs("#entry-total").textContent = state.catalog.totalEntries;
    qs("#task-total").textContent = state.catalog.totalTasks;

    let cursor = 0;
    const stops = [];
    state.catalog.categories.forEach(function (category) {
      const next = cursor + category.count / state.catalog.totalEntries * 100;
      stops.push(category.color + " " + cursor.toFixed(2) + "% " + next.toFixed(2) + "%");
      cursor = next;
    });
    qs("#category-donut").style.background = "conic-gradient(" + stops.join(",") + ")";

    const legend = qs("#category-legend");
    legend.replaceChildren();
    state.catalog.categories.forEach(function (category) {
      const item = create("div", "legend-item");
      const dot = create("i");
      dot.style.background = category.color;
      item.append(dot, create("span", "", category.name), create("b", "", category.count));
      legend.appendChild(item);
    });
  }

  function setCategory(categoryId) {
    state.category = categoryId;
    if (state.task) {
      const category = categoryById(categoryId);
      if (category && !category.tasks.some(function (task) { return task.name === state.task; })) state.task = "";
    }
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
    button.style.setProperty("--accent", category ? category.color : "#1677ff");
    const top = create("div", "category-card-top");
    const identity = create("div", "category-identity");
    const dot = create("i", "category-dot");
    identity.append(dot, create("span", "", category ? category.name : "全部数据"));
    top.append(identity, create("strong", "", count));
    button.append(top, create("p", "", description), create("small", "", taskCount + " 个细分任务"));
    button.setAttribute("aria-pressed", selected ? "true" : "false");
    button.addEventListener("click", function () { setCategory(button.dataset.category); });
    return button;
  }

  function renderCategoryCards() {
    const container = qs("#category-stats");
    container.replaceChildren();
    container.appendChild(categoryCard(null, state.catalog.totalEntries, state.catalog.totalTasks, "浏览四类能力的全部公开评测条目。"));
    state.catalog.categories.forEach(function (category) {
      container.appendChild(categoryCard(category, category.count, category.taskCount, category.description));
    });
  }

  function selectTask(categoryId, taskName) {
    state.category = categoryId || state.category;
    state.task = taskName;
    renderCategoryCards();
    renderTaskMap();
    populateTaskFilter();
    renderActiveFilters();
    renderEntries();
    syncCategoryToUrl(false);
    qs("#browser").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderTaskMap() {
    const container = qs("#task-groups");
    container.replaceChildren();
    const categories = state.category ? [categoryById(state.category)] : state.catalog.categories;

    categories.filter(Boolean).forEach(function (category) {
      const group = create("section", "task-group");
      group.style.setProperty("--accent", category.color);
      const heading = create("div", "task-group-heading");
      const title = create("h3");
      title.append(create("i", "category-dot"), document.createTextNode(category.name));
      heading.append(title, create("span", "", category.taskCount + " 项任务 · " + category.count + " 条数据"));
      const grid = create("div", "task-grid");
      category.tasks.forEach(function (task) {
        const active = state.task === task.name && (!state.category || state.category === category.id);
        const button = create("button", "task-button" + (active ? " is-active" : ""));
        button.type = "button";
        button.append(create("span", "", task.name), create("b", "", task.count));
        button.setAttribute("aria-pressed", active ? "true" : "false");
        button.addEventListener("click", function () {
          selectTask(category.id, active ? "" : task.name);
        });
        grid.appendChild(button);
      });
      group.append(heading, grid);
      container.appendChild(group);
    });

    const description = qs("#task-description");
    if (state.task) description.textContent = "当前任务：" + state.task;
    else if (state.category) description.textContent = "当前展示 " + categoryById(state.category).name + " 的全部细分任务。";
    else description.textContent = "33 个细分任务按四类能力分组，可直接进入对应数据列表。";
  }

  function populateTaskFilter() {
    const select = qs("#task-filter");
    const current = state.task;
    select.replaceChildren();
    select.appendChild(new Option("全部细分任务", ""));
    const categories = state.category ? [categoryById(state.category)] : state.catalog.categories;
    categories.filter(Boolean).forEach(function (category) {
      const group = document.createElement("optgroup");
      group.label = category.name;
      category.tasks.forEach(function (task) { group.appendChild(new Option(task.name + "（" + task.count + "）", task.name)); });
      select.appendChild(group);
    });
    select.value = current;
  }

  function renderActiveFilters() {
    const row = qs("#active-filter-row");
    row.replaceChildren();
    const filters = [];
    if (state.category) filters.push({ label: "能力：" + categoryById(state.category).name, clear: function () { setCategory(""); } });
    if (state.task) filters.push({ label: "任务：" + state.task, clear: function () { state.task = ""; syncAndRender(); } });
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
    const output = state.entries.filter(function (entry) {
      if (state.category && entry.category.id !== state.category) return false;
      if (state.task && entry.task !== state.task) return false;
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

  function buildEntryDetail(entry, body) {
    const detailHead = create("div", "entry-detail-head");
    const copy = create("div");
    copy.append(create("span", "detail-eyebrow", entry.category.name + " · " + entry.task), create("h3", "", entry.name));
    detailHead.appendChild(copy);
    if (entry.links.length) detailHead.appendChild(create("span", "resource-count", entry.links.length + " 个外部资源"));

    const layout = create("div", "entry-detail-layout");
    const navigation = create("nav", "section-navigation");
    navigation.setAttribute("aria-label", entry.name + "内容目录");
    const panel = create("article", "entry-panel");

    function activate(index) {
      Array.from(navigation.children).forEach(function (button, buttonIndex) {
        const active = buttonIndex === index;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderSectionContent(entry, entry.sections[index], panel);
    }

    entry.sections.forEach(function (section, index) {
      const button = create("button", "section-nav-button");
      button.type = "button";
      button.setAttribute("role", "tab");
      button.append(create("b", "", String(index + 1).padStart(2, "0")), create("span", "", section.label));
      button.addEventListener("click", function () { activate(index); });
      navigation.appendChild(button);
    });

    layout.append(navigation, panel);
    body.append(detailHead, layout);
    if (entry.sections.length) activate(0);
  }

  function closeOpenEntries(except) {
    Array.from(document.querySelectorAll(".entry-card.is-open")).forEach(function (card) {
      if (card === except) return;
      card.classList.remove("is-open");
      const button = qs(".entry-head", card);
      if (button) button.setAttribute("aria-expanded", "false");
    });
  }

  function buildEntryCard(entry) {
    const card = create("article", "entry-card");
    card.dataset.id = entry.id;
    card.style.setProperty("--accent", entry.category.color);

    const head = create("button", "entry-head");
    head.type = "button";
    head.setAttribute("aria-expanded", "false");
    const index = create("span", "entry-index", String(entry.globalIndex).padStart(3, "0"));
    const title = create("span", "entry-title");
    title.append(create("b", "", entry.name), create("small", "", shortPositioning(entry)));
    const tags = create("span", "entry-tags");
    const categoryTag = create("span", "entry-tag category-tag", entry.category.name);
    categoryTag.style.setProperty("--tag-color", entry.category.color);
    tags.append(categoryTag, create("span", "entry-tag", entry.task));
    if (entry.year && entry.year.length < 20) tags.appendChild(create("span", "entry-tag subtle-tag", entry.year));
    const chevron = create("span", "entry-chevron");
    chevron.setAttribute("aria-hidden", "true");
    head.append(index, title, tags, chevron);

    const body = create("div", "entry-body");
    head.addEventListener("click", function () {
      const opening = !card.classList.contains("is-open");
      closeOpenEntries(card);
      card.classList.toggle("is-open", opening);
      head.setAttribute("aria-expanded", opening ? "true" : "false");
      state.openId = opening ? entry.id : "";
      if (opening && !body.dataset.rendered) {
        buildEntryDetail(entry, body);
        body.dataset.rendered = "true";
      }
    });

    card.append(head, body);
    return card;
  }

  function renderEntries() {
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

  function syncAndRender() {
    renderCategoryCards();
    renderTaskMap();
    populateTaskFilter();
    renderActiveFilters();
    renderEntries();
  }

  function bindControls() {
    const search = qs("#dataset-search");
    search.addEventListener("input", function () {
      state.query = search.value.trim();
      renderActiveFilters();
      renderEntries();
    });

    qs("#task-filter").addEventListener("change", function (event) {
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

    window.addEventListener("popstate", function () {
      state.category = categoryFromUrl();
      state.task = "";
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
