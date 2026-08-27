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
    openId: "",
    detailTrigger: null
  };

  const customSelects = new WeakMap();

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
    const donut = qs("#category-donut");
    donut.style.background = "conic-gradient(" + stops.join(",") + ")";
    revealCategoryDonut(donut);

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

  function revealCategoryDonut(donut) {
    if (!donut || donut.dataset.revealed === "true") return;
    donut.dataset.revealed = "true";
    const distribution = donut.closest(".distribution");
    function replayCategoryDonut() {
      donut.classList.remove("is-revealing");
      if (distribution) distribution.classList.remove("donut-is-revealing");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      void donut.offsetWidth;
      donut.classList.add("is-revealing");
      if (distribution) distribution.classList.add("donut-is-revealing");
    }
    donut.closest(".donut-wrap").addEventListener("click", replayCategoryDonut);
    requestAnimationFrame(replayCategoryDonut);
  }

  function setCategory(categoryId) {
    closeEntryDetail(false);
    state.category = categoryId;
    if (state.task) {
      const category = categoryById(categoryId);
      if (category && !category.tasks.some(function (task) { return task.name === state.task; })) state.task = "";
    }
    renderDatasetNavigation();
    populateTaskFilter();
    renderActiveFilters();
    const hasEntries = renderEntries();
    syncCategoryToUrl(false);
    resetDatasetListScroll(hasEntries);
  }

  function categoryCard(category, count, taskCount, description) {
    const selected = state.category === category.id;
    const button = create("button", "category-card" + (selected ? " is-active" : ""));
    button.type = "button";
    button.dataset.category = category.id;
    button.style.setProperty("--accent", category.color);
    const top = create("div", "category-card-top");
    const identity = create("div", "category-identity");
    const dot = create("i", "category-dot");
    identity.append(dot, create("span", "", category.name));
    top.append(identity, create("strong", "", count));
    button.append(top, create("p", "", description), create("small", "", taskCount + " 个细分任务"));
    button.setAttribute("aria-pressed", selected ? "true" : "false");
    button.addEventListener("click", function () { setCategory(button.dataset.category); });
    return button;
  }

  function renderCategoryCards() {
    const container = qs("#category-stats");
    container.replaceChildren();
    state.catalog.categories.forEach(function (category) {
      container.appendChild(categoryCard(category, category.count, category.taskCount, category.description));
    });
  }

  function updateOverviewButton() {
    const button = qs("#dataset-overview-button");
    const active = !state.category && !state.task;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  }

  function renderDatasetNavigation() {
    updateOverviewButton();
    renderCategoryCards();
    renderTaskMap();
  }

  function focusResultsOnCompactScreens() {
    if (window.matchMedia("(max-width: 900px)").matches) {
      qs("#browser").scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    }
  }

  function selectTask(categoryId, taskName) {
    state.category = categoryId || state.category;
    state.task = taskName;
    renderDatasetNavigation();
    populateTaskFilter();
    renderActiveFilters();
    renderEntries();
    syncCategoryToUrl(false);
    focusResultsOnCompactScreens();
  }

  function closeCustomSelect(select, restoreFocus) {
    const api = customSelects.get(select);
    if (!api) return;
    api.control.classList.remove("is-open");
    api.trigger.setAttribute("aria-expanded", "false");
    api.menu.hidden = true;
    if (restoreFocus) api.trigger.focus();
  }

  function closeOtherCustomSelects(current) {
    document.querySelectorAll(".custom-select-control.is-open").forEach(function (control) {
      const select = qs("select", control);
      if (select && select !== current) closeCustomSelect(select, false);
    });
  }

  function focusCustomOption(api, direction) {
    const options = Array.from(api.menu.querySelectorAll(".custom-select-option"));
    if (!options.length) return;
    const focused = document.activeElement;
    const current = Math.max(0, options.indexOf(focused));
    const next = direction === "last"
      ? options.length - 1
      : direction === "first"
        ? 0
        : (current + direction + options.length) % options.length;
    options[next].focus();
  }

  function refreshCustomSelect(select) {
    const api = customSelects.get(select);
    if (!api) return;
    const selected = select.options[select.selectedIndex] || select.options[0];
    api.value.textContent = selected ? selected.textContent : "请选择";
    api.menu.replaceChildren();

    function appendOption(option, parent) {
      const button = create("button", "custom-select-option", option.textContent);
      button.type = "button";
      button.setAttribute("role", "option");
      button.dataset.value = option.value;
      button.setAttribute("aria-selected", option.selected ? "true" : "false");
      button.disabled = option.disabled;
      button.addEventListener("click", function () {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        refreshCustomSelect(select);
        closeCustomSelect(select, true);
      });
      button.addEventListener("keydown", function (event) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          focusCustomOption(api, event.key === "ArrowDown" ? 1 : -1);
        } else if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          focusCustomOption(api, event.key === "Home" ? "first" : "last");
        } else if (event.key === "Escape") {
          event.preventDefault();
          closeCustomSelect(select, true);
        }
      });
      parent.appendChild(button);
    }

    Array.from(select.children).forEach(function (node) {
      if (node.tagName === "OPTGROUP") {
        const group = create("div", "custom-select-group");
        group.setAttribute("role", "group");
        group.setAttribute("aria-label", node.label);
        group.appendChild(create("div", "custom-select-group-label", node.label));
        Array.from(node.children).forEach(function (option) { appendOption(option, group); });
        api.menu.appendChild(group);
      } else if (node.tagName === "OPTION") {
        appendOption(node, api.menu);
      }
    });
  }

  function initCustomSelect(select) {
    if (!select || customSelects.has(select)) return;
    const control = select.closest(".custom-select-control");
    if (!control) return;

    select.classList.add("custom-select-native");
    const trigger = create("button", "custom-select-trigger");
    trigger.type = "button";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", select.getAttribute("aria-label") || "选择选项");
    const value = create("span", "custom-select-value");
    trigger.appendChild(value);

    const menu = create("div", "custom-select-menu");
    menu.id = select.id + "-menu";
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", select.getAttribute("aria-label") || "选择选项");
    menu.hidden = true;
    trigger.setAttribute("aria-controls", menu.id);
    control.append(trigger, menu);

    const api = { control: control, trigger: trigger, value: value, menu: menu };
    customSelects.set(select, api);
    refreshCustomSelect(select);

    trigger.addEventListener("click", function () {
      const opening = !control.classList.contains("is-open");
      closeOtherCustomSelects(select);
      if (!opening) {
        closeCustomSelect(select, false);
        return;
      }
      control.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      menu.hidden = false;
    });
    trigger.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        closeOtherCustomSelects(select);
        control.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        menu.hidden = false;
        requestAnimationFrame(function () {
          const selectedOption = qs('.custom-select-option[aria-selected="true"]', menu);
          if (selectedOption) selectedOption.focus();
          else focusCustomOption(api, event.key === "ArrowDown" ? "first" : "last");
        });
      } else if (event.key === "Escape") {
        closeCustomSelect(select, false);
      }
    });
    document.addEventListener("pointerdown", function (event) {
      if (!control.contains(event.target)) closeCustomSelect(select, false);
    });
  }

  function renderTaskMap() {
    const container = qs("#task-groups");
    container.replaceChildren();
    const categories = state.category ? [categoryById(state.category)] : [];

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
    else description.textContent = "选择上方能力类别后查看对应细分任务。";
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
    refreshCustomSelect(select);
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
    body.appendChild(layout);
    if (entry.sections.length) activate(0);
  }

  function closeEntryDetail(restoreFocus) {
    const layer = qs("#dataset-detail-layer");
    const content = qs("#dataset-detail-content");
    if (!layer || layer.hidden) return;
    layer.hidden = true;
    if (content) content.replaceChildren();
    Array.from(document.querySelectorAll(".entry-card.is-open")).forEach(function (card) {
      card.classList.remove("is-open");
      const button = qs(".entry-head", card);
      if (button) button.setAttribute("aria-expanded", "false");
    });
    state.openId = "";
    if (restoreFocus && state.detailTrigger && state.detailTrigger.isConnected) state.detailTrigger.focus();
    state.detailTrigger = null;
  }

  function positionEntryDetailLayer(head, layer) {
    const shell = qs(".entry-list-shell");
    if (!shell) return;
    const shellRect = shell.getBoundingClientRect();
    const headRect = head.getBoundingClientRect();
    const top = Math.max(12, Math.round(headRect.bottom - shellRect.top + 10));
    layer.style.setProperty("--detail-layer-top", top + "px");
  }

  function openEntryDetail(entry, card, head) {
    closeEntryDetail(false);
    const layer = qs("#dataset-detail-layer");
    const content = qs("#dataset-detail-content");
    if (!layer || !content) return;
    card.classList.add("is-open");
    head.setAttribute("aria-expanded", "true");
    state.openId = entry.id;
    state.detailTrigger = head;
    buildEntryDetail(entry, content);
    positionEntryDetailLayer(head, layer);
    layer.hidden = false;
    layer.scrollTop = 0;
  }

  function resetDatasetListScroll(hasEntries) {
    if (!hasEntries) return;
    const list = qs("#entry-list");
    if (!list) return;
    requestAnimationFrame(function () {
      list.scrollTop = 0;
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
    if (entry.links.length) tags.appendChild(create("span", "entry-tag resource-tag", entry.links.length + " 个外部资源"));
    const chevron = create("span", "entry-chevron");
    chevron.setAttribute("aria-hidden", "true");
    head.append(index, title, tags, chevron);

    head.addEventListener("click", function () {
      openEntryDetail(entry, card, head);
    });

    card.appendChild(head);
    return card;
  }

  function renderEntries() {
    const entries = filteredEntries();
    const list = qs("#entry-list");
    list.replaceChildren();
    updateResultsHeader(entries);

    if (!entries.length) {
      const empty = create("div", "no-results");
      empty.append(create("b", "", "未找到匹配的数据集"), create("span", "", "调整关键词或清除筛选后重试。"));
      list.appendChild(empty);
      return false;
    }

    const fragment = document.createDocumentFragment();
    entries.forEach(function (entry) { fragment.appendChild(buildEntryCard(entry)); });
    list.appendChild(fragment);
    return true;
  }

  function updateResultsHeader(entries) {
    const category = state.category ? categoryById(state.category) : null;
    const title = state.task || (category ? category.name + "数据集" : "全部数据集");
    const path = ["数据总览"];
    if (category) path.push(category.name);
    if (state.task) path.push(state.task);
    qs("#dataset-results-title").textContent = title;
    qs("#dataset-breadcrumb").textContent = path.join(" / ");
    qs("#result-count").textContent = "显示 " + entries.length + " / " + state.catalog.totalEntries + " 条评测条目";
  }

  function syncAndRender() {
    renderDatasetNavigation();
    populateTaskFilter();
    renderActiveFilters();
    renderEntries();
  }

  function bindControls() {
    const search = qs("#dataset-search");
    initCustomSelect(qs("#task-filter"));
    initCustomSelect(qs("#sort-order"));
    qs("#dataset-detail-close").addEventListener("click", function () { closeEntryDetail(true); });
    qs("#dataset-overview-button").addEventListener("click", function () {
      closeEntryDetail(false);
      state.category = "";
      state.task = "";
      renderDatasetNavigation();
      populateTaskFilter();
      renderActiveFilters();
      const hasEntries = renderEntries();
      syncCategoryToUrl(false);
      resetDatasetListScroll(hasEntries);
    });
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
      refreshCustomSelect(qs("#sort-order"));
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
      } else if (event.key === "Escape" && !qs("#dataset-detail-layer").hidden) {
        closeEntryDetail(true);
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
