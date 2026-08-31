(function () {
  "use strict";

  const DIRECTORY = {
    "index.html": {
      label: "首页",
      description: "快速了解平台定位、核心能力、数据资源与评测结果。",
      groups: [
        { label: "平台概览", links: [
          { label: "平台概览", hash: "#home-overview" },
          { label: "平台数据", hash: "#home-metrics" },
          { label: "四大核心能力", hash: "#home-capabilities" },
          { label: "公共数据集", hash: "#home-datasets" }
        ] },
        { label: "评测与参与", links: [
          { label: "四维实证评测", hash: "#home-evaluation" },
          { label: "模型榜单", hash: "#home-leaderboard" },
          { label: "平台目标", hash: "#home-goals" },
          { label: "提交评测", hash: "#home-submit" }
        ] }
      ]
    },
    "datasets.html": {
      label: "公共数据集",
      description: "按能力、细分任务与关键词快速定位 193 个评测条目。",
      groups: [
        { label: "功能概览", links: [
          { label: "公共数据概览", hash: "#overview" },
          { label: "数据集浏览器", hash: "#browser" }
        ] },
        { label: "快速筛选", links: [
          { label: "数据集分类", hash: "#categories" },
          { label: "细分任务筛选", hash: "#tasks" },
          { label: "数据集列表", hash: "#entry-list" }
        ] }
      ]
    },
    "framework.html": {
      label: "测评框架",
      description: "查看能力模型、任务组织、评测流程、指标与结果报告。",
      groups: [
        { label: "模型与数据", links: [
          { label: "数据与任务标准化", hash: "#framework-overview" },
          { label: "四维能力结构", hash: "#framework-structure" },
          { label: "四维能力模型", hash: "#framework-model" },
          { label: "数据层与任务层", hash: "#framework-layers" },
          { label: "评测流程", hash: "#framework-workflow" }
        ] },
        { label: "指标与输出", links: [
          { label: "指标与可比性", hash: "#framework-metrics" },
          { label: "覆盖概览", hash: "#framework-coverage" },
          { label: "结果报告", hash: "#framework-results" },
          { label: "平台工具", hash: "#framework-tools" },
          { label: "限制与责任", hash: "#framework-limitations" }
        ] }
      ]
    },
    "owned.html": {
      label: "自有数据集",
      description: "了解 TURING-EMO 长程多模态共情交互数据资产。",
      groups: [
        { label: "页面板块", links: [
          { label: "页面概览", hash: "#owned-overview" },
          { label: "长程多模态数据集", hash: "#owned-dataset" },
          { label: "三类信号与共情链路", hash: "#owned-signals" }
        ] }
      ]
    },
    "leaderboard.html": {
      label: "模型榜单",
      description: "在综合评分与四类能力视图之间直接切换。",
      groups: [
        { label: "页面板块", links: [
          { label: "榜单概览", hash: "#leaderboard-overview" },
          { label: "榜单结果", hash: "#leaderboard-results" }
        ] },
        { label: "榜单视图", links: [
          { label: "综合评分", hash: "#view-overall" },
          { label: "情感共情", hash: "#view-affective" },
          { label: "认知共情", hash: "#view-cognitive" },
          { label: "共情关怀", hash: "#view-concern" },
          { label: "安全交互", hash: "#view-safe" }
        ] }
      ]
    }
  };

  const currentPage = () => location.pathname.split("/").pop() || "index.html";
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const allLinks = config => config.groups.reduce((links, group) => links.concat(group.links), []);
  let openItem = null;
  let closeTimer = null;

  function createLink(page, item, className) {
    const link = document.createElement("a");
    link.className = className;
    link.href = page + item.hash;
    link.textContent = item.label;
    link.dataset.page = page;
    link.dataset.hash = item.hash;
    return link;
  }

  function closeDirectory(item, restoreFocus) {
    if (!item) return;
    const toggle = item.querySelector(".nav-directory-toggle");
    const panel = item.querySelector(".site-directory-panel");
    item.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    panel.inert = true;
    if (restoreFocus) toggle.focus({ preventScroll: true });
    if (openItem === item) openItem = null;
  }

  function closeAll(restoreFocus) {
    document.querySelectorAll(".nav-directory-item.is-open").forEach(function (item) {
      closeDirectory(item, restoreFocus);
    });
  }

  function positionPanel(item) {
    const toggle = item.querySelector(".nav-directory-toggle");
    const panel = item.querySelector(".site-directory-panel");
    panel.style.removeProperty("--directory-left");
    const panelWidth = panel.getBoundingClientRect().width;
    const toggleRect = toggle.getBoundingClientRect();
    const edge = 24;
    const half = panelWidth / 2;
    const anchor = toggleRect.left + toggleRect.width / 2;
    const left = Math.max(half + edge, Math.min(window.innerWidth - half - edge, anchor));
    panel.style.setProperty("--directory-left", left + "px");
  }

  function openDirectory(item) {
    clearTimeout(closeTimer);
    if (openItem && openItem !== item) closeDirectory(openItem, false);
    const toggle = item.querySelector(".nav-directory-toggle");
    const panel = item.querySelector(".site-directory-panel");
    positionPanel(item);
    item.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    panel.inert = false;
    openItem = item;
  }

  function scheduleClose(item) {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      if (!item.contains(document.activeElement) && !item.matches(":hover")) closeDirectory(item, false);
    }, 180);
  }

  function buildPanel(page, config, index) {
    const panel = document.createElement("div");
    panel.className = "site-directory-panel";
    const linkCount = allLinks(config).length;
    panel.dataset.contentSize = linkCount <= 3 ? "compact" : linkCount <= 5 ? "medium" : linkCount <= 8 ? "standard" : "wide";
    panel.id = "site-directory-panel-" + index;
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("aria-label", config.label + "页面目录");
    panel.inert = true;

    const inner = document.createElement("div");
    inner.className = "site-directory-panel-inner";
    const overview = document.createElement("div");
    overview.className = "site-directory-overview";
    const eyebrow = document.createElement("span");
    eyebrow.className = "site-directory-eyebrow";
    eyebrow.textContent = "PAGE DIRECTORY";
    const title = document.createElement("strong");
    title.textContent = config.label;
    const copy = document.createElement("p");
    copy.textContent = config.description;
    const enter = document.createElement("a");
    enter.className = "site-directory-enter";
    enter.href = page;
    enter.textContent = "进入" + config.label + " →";
    overview.append(eyebrow, title, copy, enter);

    const groups = document.createElement("div");
    groups.className = "site-directory-groups";
    config.groups.forEach(function (group) {
      const column = document.createElement("section");
      column.className = "site-directory-group";
      const heading = document.createElement("h2");
      heading.textContent = group.label;
      column.appendChild(heading);
      group.links.forEach(function (item) {
        column.appendChild(createLink(page, item, "site-directory-link"));
      });
      groups.appendChild(column);
    });
    inner.append(overview, groups);
    panel.appendChild(inner);
    return panel;
  }

  function handleDirectoryLink(event) {
    const link = event.currentTarget;
    const url = new URL(link.href, location.href);
    closeAll(false);
    if (url.pathname !== location.pathname || !url.hash || url.hash.indexOf("#view-") === 0) return;
    const target = document.querySelector(url.hash);
    if (!target) return;
    event.preventDefault();
    history.pushState(null, "", url.hash);
    target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
  }

  function initDesktopDirectory() {
    const nav = document.querySelector(".nav-links");
    if (!nav || nav.dataset.directoryReady === "true") return;
    nav.dataset.directoryReady = "true";
    const anchors = Array.from(nav.children).filter(function (node) { return node.tagName === "A"; });
    anchors.forEach(function (anchor, index) {
      const page = (anchor.getAttribute("href") || "").split("#")[0];
      const config = DIRECTORY[page];
      if (!config) return;
      if (page === "index.html") return;
      const item = document.createElement("div");
      item.className = "nav-directory-item";
      nav.insertBefore(item, anchor);
      item.appendChild(anchor);
      anchor.classList.add("nav-directory-page-link");

      const toggle = document.createElement("button");
      toggle.className = "nav-directory-toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-label", "展开" + config.label + "页面目录");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", "site-directory-panel-" + index);
      toggle.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="m2.5 4.5 3.5 3 3.5-3"/></svg>';
      const panel = buildPanel(page, config, index);
      item.append(toggle, panel);

      item.addEventListener("mouseenter", function () { openDirectory(item); });
      item.addEventListener("mouseleave", function () { scheduleClose(item); });
      item.addEventListener("focusin", function (event) {
        if (event.target !== toggle) openDirectory(item);
      });
      item.addEventListener("focusout", function () { scheduleClose(item); });
      toggle.addEventListener("click", function () {
        if (item.classList.contains("is-open")) closeDirectory(item, false);
        else openDirectory(item);
      });
      [anchor, toggle].forEach(function (control) {
        control.addEventListener("keydown", function (event) {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openDirectory(item);
            panel.querySelector("a").focus();
          }
        });
      });
      panel.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", handleDirectoryLink);
      });
    });

    document.addEventListener("pointerdown", function (event) {
      if (!event.target.closest(".nav-directory-item")) closeAll(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && openItem) closeDirectory(openItem, true);
    });
    window.addEventListener("scroll", function () { closeAll(false); }, { passive: true });
    window.addEventListener("resize", function () {
      if (openItem) positionPanel(openItem);
    });
  }

  function initMobileDirectory() {
    const drawer = document.querySelector(".mobile-nav");
    const toggle = document.querySelector(".nav-toggle");
    if (!drawer || drawer.dataset.directoryReady === "true") return;
    drawer.dataset.directoryReady = "true";
    drawer.replaceChildren();
    const pageNow = currentPage();

    Object.keys(DIRECTORY).forEach(function (page) {
      const config = DIRECTORY[page];
      const details = document.createElement("details");
      details.className = "mobile-directory-group";
      details.open = page === pageNow;
      const summary = document.createElement("summary");
      const label = document.createElement("span");
      label.textContent = config.label;
      const chevron = document.createElement("span");
      chevron.className = "mobile-directory-chevron";
      summary.append(label, chevron);
      const links = document.createElement("div");
      links.className = "mobile-directory-links";
      const enter = document.createElement("a");
      enter.href = page;
      enter.className = "mobile-directory-enter" + (page === pageNow ? " active" : "");
      enter.textContent = "进入" + config.label;
      links.appendChild(enter);
      allLinks(config).forEach(function (item) {
        links.appendChild(createLink(page, item, "mobile-directory-link"));
      });
      details.append(summary, links);
      details.addEventListener("toggle", function () {
        if (!details.open) return;
        drawer.querySelectorAll(".mobile-directory-group").forEach(function (other) {
          if (other !== details) other.open = false;
        });
      });
      drawer.appendChild(details);
    });

    const submit = document.createElement("a");
    submit.href = "#";
    submit.dataset.dialogOpen = "";
    submit.className = "mobile-directory-submit";
    submit.textContent = "提交测评结果 ↗";
    drawer.appendChild(submit);
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (!link.matches("[data-dialog-open]")) handleDirectoryLink.call(link, event);
        drawer.classList.remove("open");
        if (toggle) toggle.classList.remove("open");
      });
    });
  }

  function markCurrentSection(hash) {
    if (!hash) return;
    document.querySelectorAll(".site-directory-link, .mobile-directory-link").forEach(function (link) {
      const current = link.dataset.page === currentPage() && link.dataset.hash === hash;
      link.classList.toggle("is-current", current);
      if (current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function initSectionTracking() {
    const config = DIRECTORY[currentPage()];
    if (!config || typeof IntersectionObserver === "undefined") return;
    const targets = allLinks(config).map(function (item) {
      if (item.hash.indexOf("#view-") === 0) return null;
      return document.querySelector(item.hash);
    }).filter(Boolean);
    if (!targets.length) return;
    const observer = new IntersectionObserver(function (entries) {
      const visible = entries.filter(function (entry) { return entry.isIntersecting; });
      if (!visible.length) return;
      visible.sort(function (a, b) { return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top); });
      markCurrentSection("#" + visible[0].target.id);
    }, { rootMargin: "-90px 0px -62% 0px", threshold: [0, .15, .5] });
    targets.forEach(function (target) { observer.observe(target); });
    if (location.hash) markCurrentSection(location.hash);
  }

  function init() {
    initDesktopDirectory();
    initMobileDirectory();
    initSectionTracking();
    window.addEventListener("hashchange", function () { markCurrentSection(location.hash); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
