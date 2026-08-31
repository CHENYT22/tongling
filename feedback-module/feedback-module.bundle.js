(function (global) {
  'use strict';

  var STYLE_TEXT = "/* Reusable feedback module styles */\n.comment-toggle {\n  position: fixed;\n  right: 24px;\n  bottom: 24px;\n  z-index: 1202;\n  width: 46px;\n  height: 46px;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--white, #ffffff);\n  background: var(--blue, #1677ff);\n  box-shadow: 0 12px 32px rgba(22, 119, 255, .36);\n  transition: transform .2s var(--ease, ease), background .2s var(--ease, ease), box-shadow .2s var(--ease, ease);\n}\n\n.comment-list-toggle {\n  position: fixed;\n  right: 24px;\n  bottom: 88px;\n  z-index: 1202;\n  width: 46px;\n  height: 46px;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--blue, #1677ff);\n  background: var(--white, #ffffff);\n  border: 1px solid rgba(22, 119, 255, .18);\n  box-shadow: 0 10px 26px rgba(7, 29, 66, .16);\n  transition: transform .2s var(--ease, ease), color .2s var(--ease, ease), background .2s var(--ease, ease), border-color .2s var(--ease, ease);\n}\n\n.comment-list-toggle:hover {\n  transform: translateY(-2px);\n  color: var(--white, #ffffff);\n  background: var(--blue, #1677ff);\n  border-color: var(--blue, #1677ff);\n}\n\n.comment-list-toggle.active {\n  color: var(--white, #ffffff);\n  background: var(--ink, #0b1f3a);\n  border-color: var(--ink, #0b1f3a);\n}\n\n.comment-list-toggle.has-comments::after {\n  content: '';\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: #f04452;\n}\n\n.comment-toggle:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 16px 38px rgba(22, 119, 255, .44);\n}\n\n.comment-toggle.active {\n  background: var(--ink, #0b1f3a);\n}\n\n.comment-toggle svg,\n.comment-panel svg {\n  width: 21px;\n  height: 21px;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1.8;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n\n.comment-layer {\n  position: absolute;\n  inset: 0;\n  z-index: 1198;\n  pointer-events: none;\n}\n\n.comment-pin {\n  position: absolute;\n  width: 30px;\n  height: 30px;\n  transform: translate(-50%, -50%);\n  border-radius: 15px 15px 15px 3px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  pointer-events: auto;\n  color: var(--white, #ffffff);\n  background: var(--blue, #1677ff);\n  border: 2px solid var(--white, #ffffff);\n  box-shadow: 0 5px 16px rgba(7, 29, 66, .28);\n  font-family: 'DM Sans', sans-serif;\n  font-size: 12px;\n  font-weight: 700;\n  transition: transform .2s var(--ease, ease), background .2s var(--ease, ease);\n}\n\n.comment-pin:hover,\n.comment-pin.active {\n  transform: translate(-50%, -50%) scale(1.12);\n  background: var(--purple, #705cff);\n}\n\n.comment-pin-draft {\n  pointer-events: none;\n  background: var(--purple, #705cff);\n  animation: comment-pin-in .25s var(--ease, ease) both;\n}\n\n@keyframes comment-pin-in {\n  from { opacity: 0; transform: translate(-50%, -50%) scale(.55); }\n  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }\n}\n\n.comment-placing,\n.comment-placing * {\n  cursor: crosshair !important;\n}\n\n.comment-placing .comment-toggle,\n.comment-placing .comment-toggle * {\n  cursor: pointer !important;\n}\n\n.comment-panel {\n  position: fixed;\n  top: 16px;\n  right: 16px;\n  bottom: 88px;\n  z-index: 1201;\n  width: min(380px, calc(100vw - 32px));\n  display: flex;\n  flex-direction: column;\n  background: var(--white, #ffffff);\n  border: 1px solid var(--line, #d9e5f5);\n  border-radius: 16px;\n  box-shadow: 0 24px 70px rgba(7, 29, 66, .24);\n  opacity: 0;\n  transform: translateX(calc(100% + 32px));\n  pointer-events: none;\n  overflow: hidden;\n  transition: opacity .25s var(--ease, ease), transform .25s var(--ease, ease);\n}\n\n.comment-panel.open {\n  opacity: 1;\n  transform: translateX(0);\n  pointer-events: auto;\n}\n\n.comment-panel-head {\n  min-height: 76px;\n  padding: 16px 18px;\n  border-bottom: 1px solid var(--line, #d9e5f5);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n}\n\n.comment-panel-kicker {\n  display: block;\n  color: var(--blue, #1677ff);\n  font-family: 'DM Sans', sans-serif;\n  font-size: 10px;\n  font-weight: 700;\n  letter-spacing: .12em;\n}\n\n.comment-panel-head h2 {\n  font-family: 'Noto Sans SC', sans-serif;\n  font-size: 17px;\n  font-weight: 600;\n  line-height: 1.35;\n}\n\n.comment-panel-id {\n  display: inline-block;\n  margin-top: 6px;\n  color: var(--muted, #63758d);\n  font-family: 'DM Sans', sans-serif;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: .08em;\n}\n\n.comment-panel-close {\n  width: 36px;\n  height: 36px;\n  border-radius: 8px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--muted, #63758d);\n}\n\n.comment-panel-close:hover {\n  color: var(--ink, #0b1f3a);\n  background: var(--paper, #f4f8ff);\n}\n\n.comment-compose,\n.comment-reply {\n  padding: 18px;\n}\n\n.comment-compose {\n  overflow-y: auto;\n}\n\n.comment-compose label {\n  display: block;\n  margin: 0 0 6px;\n  color: var(--ink, #0b1f3a);\n  font-size: 12px;\n  font-weight: 600;\n}\n\n.comment-compose label:not(:first-child) {\n  margin-top: 16px;\n}\n\n.comment-compose input,\n.comment-compose textarea,\n.comment-reply textarea {\n  width: 100%;\n  border: 1px solid var(--line, #d9e5f5);\n  border-radius: 8px;\n  outline: none;\n  background: #f8fbff;\n  padding: 10px 12px;\n  color: var(--ink, #0b1f3a);\n  font: inherit;\n  font-size: 14px;\n  line-height: 1.55;\n  resize: vertical;\n  transition: border-color .2s var(--ease, ease), box-shadow .2s var(--ease, ease);\n}\n\n.comment-compose input:focus,\n.comment-compose textarea:focus,\n.comment-reply textarea:focus {\n  border-color: var(--blue, #1677ff);\n  box-shadow: 0 0 0 3px rgba(22, 119, 255, .1);\n}\n\n.comment-form-actions,\n.comment-thread-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 12px;\n}\n\n.comment-form-actions {\n  justify-content: flex-end;\n}\n\n.comment-primary,\n.comment-secondary,\n.comment-icon-action {\n  min-height: 36px;\n  border-radius: 8px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 7px;\n  padding: 0 13px;\n  font-size: 13px;\n  font-weight: 600;\n}\n\n.comment-primary {\n  color: var(--white, #ffffff);\n  background: var(--blue, #1677ff);\n}\n\n.comment-primary svg,\n.comment-icon-action svg {\n  width: 16px;\n  height: 16px;\n}\n\n.comment-secondary,\n.comment-icon-action {\n  color: var(--muted, #63758d);\n  background: var(--paper, #f4f8ff);\n}\n\n.comment-icon-action:hover {\n  color: var(--blue, #1677ff);\n}\n\n.comment-icon-action.danger:hover {\n  color: #d9363e;\n}\n\n.comment-storage-note {\n  margin-top: 14px;\n  text-align: center;\n  color: var(--muted, #63758d);\n  font-size: 11px;\n}\n\n.comment-storage-note.error {\n  color: #d9363e;\n}\n\n.comment-list-wrap {\n  flex: 1;\n  overflow-y: auto;\n  padding: 10px 14px 16px;\n}\n\n.comment-list-empty {\n  margin: 18px;\n  padding: 14px 16px;\n  border: 1px dashed var(--line, #d9e5f5);\n  border-radius: 10px;\n  color: var(--muted, #63758d);\n  font-size: 13px;\n  line-height: 1.6;\n  background: #f8fbff;\n}\n\n.comment-list-item {\n  width: 100%;\n  text-align: left;\n  border: 1px solid var(--line, #d9e5f5);\n  border-radius: 10px;\n  background: var(--white, #ffffff);\n  padding: 11px 12px;\n  margin-top: 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  transition: border-color .2s var(--ease, ease), box-shadow .2s var(--ease, ease), transform .2s var(--ease, ease);\n}\n\n.comment-list-item:first-child {\n  margin-top: 0;\n}\n\n.comment-list-item:hover {\n  border-color: var(--blue, #1677ff);\n  box-shadow: 0 8px 20px rgba(22, 119, 255, .12);\n  transform: translateY(-1px);\n}\n\n.comment-list-top {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}\n\n.comment-list-top b {\n  color: var(--ink, #0b1f3a);\n  font-size: 13px;\n  font-weight: 700;\n}\n\n.comment-list-top time {\n  color: var(--muted, #63758d);\n  font-size: 11px;\n}\n\n.comment-list-body {\n  color: #31455f;\n  font-size: 13px;\n  line-height: 1.6;\n}\n\n.comment-list-id {\n  color: var(--blue, #1677ff);\n  font-family: 'DM Sans', sans-serif;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: .06em;\n}\n\n.comment-list-meta {\n  color: var(--muted, #63758d);\n  font-size: 11px;\n}\n\n.comment-thread {\n  flex: 1;\n  overflow-y: auto;\n  padding: 6px 18px 18px;\n}\n\n.comment-message {\n  display: grid;\n  grid-template-columns: 34px 1fr;\n  gap: 10px;\n  padding: 16px 0;\n  border-bottom: 1px solid var(--line, #d9e5f5);\n}\n\n.comment-avatar {\n  width: 34px;\n  height: 34px;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--white, #ffffff);\n  background: var(--ink, #0b1f3a);\n  font-family: 'DM Sans', sans-serif;\n  font-size: 12px;\n  font-weight: 700;\n}\n\n.comment-meta {\n  display: flex;\n  align-items: baseline;\n  gap: 8px;\n}\n\n.comment-meta b {\n  font-size: 13px;\n  font-weight: 600;\n}\n\n.comment-meta time {\n  color: var(--muted, #63758d);\n  font-size: 11px;\n}\n\n.comment-message-id {\n  margin-top: 4px;\n  color: var(--blue, #1677ff);\n  font-family: 'DM Sans', sans-serif;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: .06em;\n}\n\n.comment-message p {\n  margin-top: 5px;\n  color: #31455f;\n  font-size: 13.5px;\n  line-height: 1.65;\n}\n\n.comment-reply {\n  border-top: 1px solid var(--line, #d9e5f5);\n  background: var(--white, #ffffff);\n}\n\n.comment-thread-actions {\n  justify-content: flex-start;\n}\n\n.comment-public-label {\n  color: var(--muted, #63758d);\n  font-size: 11px;\n}\n\n.comment-send {\n  width: 36px;\n  padding: 0;\n  margin-left: auto;\n}\n\n@media (max-width: 600px) {\n  .comment-toggle {\n    right: 16px;\n    bottom: 16px;\n  }\n\n  .comment-list-toggle {\n    right: 16px;\n    bottom: 76px;\n  }\n\n  .comment-panel {\n    top: auto;\n    right: 8px;\n    bottom: 78px;\n    left: 8px;\n    width: auto;\n    max-height: min(620px, calc(100vh - 94px));\n    transform: translateY(calc(100% + 96px));\n  }\n\n  .comment-panel.open {\n    transform: translateY(0);\n  }\n\n  .comment-icon-action span {\n    display: none;\n  }\n}\n";

  function ensureStyleOnce() {
    if (document.getElementById('turing-feedback-module-style')) return;
    var style = document.createElement('style');
    style.id = 'turing-feedback-module-style';
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
  }

  function createFeedbackModule(config) {
    var cfg = Object.assign({
      apiUrl: '',
      apiKey: '',
      deletePassword: '',
      storagePrefix: 'feedback-module',
      pagePath: '',
      pagePathResolver: null,
      pollInterval: 20000,
      canDelete: null
    }, config || {});

    if (!cfg.apiUrl || !cfg.apiKey) {
      throw new Error('Feedback module requires apiUrl and apiKey.');
    }

    var API_URL = cfg.apiUrl;
    var API_KEY = cfg.apiKey;
    var DELETE_PASSWORD = String(cfg.deletePassword || '');
    var pagePath = resolvePagePath(cfg);
    var keyPrefix = String(cfg.storagePrefix || 'feedback-module');
    var authorTokenKey = keyPrefix + '-author-token';
    var hiddenCommentsKey = keyPrefix + '-hidden-comments';
    var legacyAnchorCacheKey = keyPrefix + '-legacy-anchor-cache';
    var authorToken = ensureAuthorToken();
    var state = {
      comments: [],
      placing: false,
      activeId: null,
      draft: null,
      listOpen: false,
      syncing: false,
      supportsAuthorToken: true,
      supportsAnchorColumns: true
    };

    var layer;
    var toggle;
    var listToggle;
    var panel;
    var legacyAnchorCache;
    var hiddenCommentCache;

    function resolvePagePath(options) {
      if (typeof options.pagePathResolver === 'function') {
        var resolved = options.pagePathResolver();
        if (typeof resolved === 'string' && resolved) return resolved;
      }
      if (typeof options.pagePath === 'string' && options.pagePath) {
        return options.pagePath;
      }
      var pathEnd = location.pathname.split('/').filter(Boolean).pop() || '';
      return /\.html$/i.test(pathEnd) ? pathEnd : 'index.html';
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function ensureAuthorToken() {
      var token = '';
      try {
        token = localStorage.getItem(authorTokenKey) || '';
        if (!token) {
          token = Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
          localStorage.setItem(authorTokenKey, token);
        }
      } catch (error) {
        token = Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
      }
      return token;
    }

    function readLegacyAnchorCache() {
      if (legacyAnchorCache) return legacyAnchorCache;
      try {
        legacyAnchorCache = JSON.parse(localStorage.getItem(legacyAnchorCacheKey) || '{}');
        if (!legacyAnchorCache || typeof legacyAnchorCache !== 'object') legacyAnchorCache = {};
      } catch (error) {
        legacyAnchorCache = {};
      }
      return legacyAnchorCache;
    }

    function getCachedAnchor(commentId) {
      var cache = readLegacyAnchorCache();
      var pageCache = cache[pagePath] || {};
      return pageCache[String(commentId)] || null;
    }

    function setCachedAnchor(commentId, anchor) {
      if (!commentId || !anchor || !anchor.selector) return;
      var cache = readLegacyAnchorCache();
      if (!cache[pagePath]) cache[pagePath] = {};
      cache[pagePath][String(commentId)] = {
        selector: anchor.selector,
        offsetX: Number(clamp01(anchor.offsetX).toFixed(6)),
        offsetY: Number(clamp01(anchor.offsetY).toFixed(6))
      };
      legacyAnchorCache = cache;
      try {
        localStorage.setItem(legacyAnchorCacheKey, JSON.stringify(cache));
      } catch (error) {}
    }

    function readHiddenComments() {
      if (hiddenCommentCache) return hiddenCommentCache;
      try {
        hiddenCommentCache = JSON.parse(localStorage.getItem(hiddenCommentsKey) || '{}');
        if (!hiddenCommentCache || typeof hiddenCommentCache !== 'object') hiddenCommentCache = {};
      } catch (error) {
        hiddenCommentCache = {};
      }
      return hiddenCommentCache;
    }

    function isCommentHidden(commentId) {
      var cache = readHiddenComments();
      var pageHidden = cache[pagePath] || {};
      return !!pageHidden[String(commentId)];
    }

    function clearHiddenComment(commentId) {
      if (!commentId) return;
      var cache = readHiddenComments();
      var pageHidden = cache[pagePath] || {};
      delete pageHidden[String(commentId)];
      cache[pagePath] = pageHidden;
      hiddenCommentCache = cache;
      try {
        localStorage.setItem(hiddenCommentsKey, JSON.stringify(cache));
      } catch (error) {}
    }

    function feedbackDisplayId(comment) {
      if (!comment || !comment.id) return 'FB-UNKNOWN';
      return 'FB-' + String(comment.id).replace(/-/g, '').slice(0, 8).toUpperCase();
    }

    function apiRequest(query, options) {
      var configOptions = options || {};
      configOptions.headers = Object.assign({
        apikey: API_KEY,
        Authorization: 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      }, configOptions.headers || {});
      return fetch(API_URL + (query || ''), configOptions).then(function (response) {
        if (!response.ok) {
          return response.text().then(function (message) {
            throw new Error(message || '留言服务请求失败');
          });
        }
        if (response.status === 204) return null;
        return response.json();
      });
    }

    function isMissingColumnError(error, columnName) {
      var text = String(error && error.message || '');
      var column = String(columnName || '').toLowerCase();
      if (!column || text.toLowerCase().indexOf(column) === -1) return false;
      return /42703|PGRST204/i.test(text) || /does not exist|could not find/i.test(text);
    }

    function clamp01(value) {
      return Math.max(0, Math.min(1, value));
    }

    function escapeCssIdentifier(value) {
      if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
      return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
    }

    function buildElementSelector(element) {
      if (!element || element.nodeType !== 1) return '';
      if (element.id) return '#' + escapeCssIdentifier(element.id);
      var parts = [];
      var node = element;
      while (node && node.nodeType === 1 && node !== document.body && parts.length < 7) {
        var part = node.tagName.toLowerCase();
        if (node.id) {
          part = '#' + escapeCssIdentifier(node.id);
          parts.unshift(part);
          break;
        }
        if (node.classList && node.classList.length) {
          part += '.' + escapeCssIdentifier(node.classList.item(0));
        } else if (node.parentNode) {
          var siblings = node.parentNode.children;
          var index = 1;
          for (var i = 0; i < siblings.length; i += 1) {
            if (siblings[i] === node) {
              index = i + 1;
              break;
            }
          }
          part += ':nth-child(' + index + ')';
        }
        parts.unshift(part);
        node = node.parentElement;
      }
      return parts.join(' > ');
    }

    function resolveAnchorDescriptor(target, clientX, clientY) {
      var semantic = { section: true, article: true, main: true, header: true, footer: true, nav: true, aside: true, li: true, figure: true, table: true, tr: true, td: true, th: true, img: true, canvas: true, svg: true, form: true, button: true, a: true };
      var node = target && target.nodeType === 1 ? target : (target && target.parentElement);
      var anchor = null;
      while (node && node !== document.body) {
        var tag = node.tagName ? node.tagName.toLowerCase() : '';
        if (node.hasAttribute('data-comment-anchor') || node.id || semantic[tag]) {
          anchor = node;
          break;
        }
        node = node.parentElement;
      }
      if (!anchor) anchor = document.body;
      var rect = anchor.getBoundingClientRect();
      var width = Math.max(rect.width, 1);
      var height = Math.max(rect.height, 1);
      var selector = buildElementSelector(anchor);
      if (!selector) return null;
      return {
        selector: selector,
        offsetX: Number(clamp01((clientX - rect.left) / width).toFixed(6)),
        offsetY: Number(clamp01((clientY - rect.top) / height).toFixed(6))
      };
    }

    function getElementAtPagePoint(pageX, pageY) {
      var clientX = pageX - window.scrollX;
      var clientY = pageY - window.scrollY;
      if (clientX < 0 || clientY < 0 || clientX > window.innerWidth || clientY > window.innerHeight) return null;
      var targetX = Math.max(0, Math.min(window.innerWidth - 1, clientX));
      var targetY = Math.max(0, Math.min(window.innerHeight - 1, clientY));
      var prevDisplay = '';
      if (layer) {
        prevDisplay = layer.style.display;
        layer.style.display = 'none';
      }
      var element = document.elementFromPoint(targetX, targetY);
      if (layer) layer.style.display = prevDisplay;
      if (!element) return null;
      return { element: element, clientX: targetX, clientY: targetY };
    }

    function inferLegacyAnchor(comment) {
      if (!comment || comment.anchorSelector) return;
      var x = Number(comment.x);
      var y = Number(comment.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      var cached = getCachedAnchor(comment.id);
      if (cached && cached.selector) {
        comment.anchorSelector = cached.selector;
        comment.anchorOffsetX = Number(cached.offsetX);
        comment.anchorOffsetY = Number(cached.offsetY);
        return;
      }
      var hit = getElementAtPagePoint(x, y);
      if (!hit) return;
      var anchor = resolveAnchorDescriptor(hit.element, hit.clientX, hit.clientY);
      if (!anchor) return;
      comment.anchorSelector = anchor.selector;
      comment.anchorOffsetX = anchor.offsetX;
      comment.anchorOffsetY = anchor.offsetY;
      setCachedAnchor(comment.id, anchor);
    }

    function getPinPosition(comment) {
      if (comment && comment.anchorSelector) {
        var anchor = document.querySelector(comment.anchorSelector);
        if (anchor) {
          var rect = anchor.getBoundingClientRect();
          return {
            x: window.scrollX + rect.left + rect.width * clamp01(comment.anchorOffsetX || 0),
            y: window.scrollY + rect.top + rect.height * clamp01(comment.anchorOffsetY || 0)
          };
        }
      }
      return { x: Number(comment.x) || 0, y: Number(comment.y) || 0 };
    }

    function createRafThrottle(fn) {
      var queued = false;
      return function () {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(function () {
          queued = false;
          fn();
        });
      };
    }

    function loadComments() {
      if (state.syncing) return Promise.resolve();
      state.syncing = true;
      var fields = 'id,parent_id,x,y,author,message,resolved,created_at';
      if (state.supportsAuthorToken) fields += ',author_token';
      if (state.supportsAnchorColumns) fields += ',anchor_selector,anchor_offset_x,anchor_offset_y';
      var query = '?page_path=eq.' + encodeURIComponent(pagePath) + '&select=' + fields + '&order=created_at.asc';
      return apiRequest(query).then(function (rows) {
        var roots = [];
        var rootsById = {};
        rows.forEach(function (row) {
          if (row.parent_id) return;
          if (isCommentHidden(row.id)) return;
          var comment = mapRow(row);
          inferLegacyAnchor(comment);
          comment.replies = [];
          roots.push(comment);
          rootsById[comment.id] = comment;
        });
        rows.forEach(function (row) {
          if (isCommentHidden(row.id)) return;
          if (row.parent_id && rootsById[row.parent_id]) {
            rootsById[row.parent_id].replies.push(mapRow(row));
          }
        });
        state.comments = roots;
        renderPins();
        if (state.activeId) renderPanel();
      }).catch(function (error) {
        if (state.supportsAuthorToken && isMissingColumnError(error, 'author_token')) {
          state.supportsAuthorToken = false;
          state.syncing = false;
          return loadComments();
        }
        if (state.supportsAnchorColumns && (isMissingColumnError(error, 'anchor_selector') || isMissingColumnError(error, 'anchor_offset_x') || isMissingColumnError(error, 'anchor_offset_y'))) {
          state.supportsAnchorColumns = false;
          state.syncing = false;
          return loadComments();
        }
        showServiceError(error);
      }).then(function () {
        state.syncing = false;
      });
    }

    function mapRow(row) {
      return {
        id: row.id,
        parentId: row.parent_id,
        authorToken: row.author_token || '',
        x: row.x,
        y: row.y,
        anchorSelector: row.anchor_selector || '',
        anchorOffsetX: Number(row.anchor_offset_x),
        anchorOffsetY: Number(row.anchor_offset_y),
        author: row.author,
        message: row.message,
        resolved: row.resolved,
        createdAt: row.created_at
      };
    }

    function showServiceError(error) {
      console.error('Comments service:', error);
      if (!panel || !panel.classList.contains('open')) return;
      var note = panel.querySelector('.comment-storage-note');
      if (note) {
        note.textContent = '暂时无法连接公共留言服务，请稍后重试';
        note.classList.add('error');
      }
    }

    function getErrorText(error) {
      var text = String(error && error.message || '');
      if (!text) return '未知错误';
      try {
        var parsed = JSON.parse(text);
        if (parsed && (parsed.message || parsed.error_description || parsed.hint)) {
          return String(parsed.message || parsed.error_description || parsed.hint);
        }
      } catch (parseError) {
        // Keep original text when response is not JSON.
      }
      return text;
    }

    function setBusy(form, busy) {
      Array.prototype.slice.call(form.querySelectorAll('button, input, textarea')).forEach(function (control) {
        control.disabled = busy;
      });
    }

    function formatTime(timestamp) {
      var date = new Date(timestamp);
      var today = new Date();
      if (date.toDateString() === today.toDateString()) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    }

    function icon(name) {
      var icons = {
        comment: '<path d="M5 5.8A2.8 2.8 0 0 1 7.8 3h8.4A2.8 2.8 0 0 1 19 5.8v5.4a2.8 2.8 0 0 1-2.8 2.8h-5.7L6 18v-4.3a2.8 2.8 0 0 1-1-2.1V5.8Z"/>',
        list: '<path d="M4.5 6.5h15m-15 5h15m-15 5h15"/><path d="M2.8 6.5h.4m-.4 5h.4m-.4 5h.4"/>',
        close: '<path d="m6 6 12 12M18 6 6 18"/>',
        trash: '<path d="M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3 4v5m4-5v5"/>',
        send: '<path d="m4 4 17 8-17 8 3-8-3-8Zm3 8h14"/>'
      };
      return '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[name] + '</svg>';
    }

    function init() {
      ensureStyleOnce();
      layer = document.createElement('div');
      layer.className = 'comment-layer';
      layer.setAttribute('aria-live', 'polite');
      toggle = document.createElement('button');
      toggle.className = 'comment-toggle';
      toggle.type = 'button';
      toggle.title = '反馈留言';
      toggle.setAttribute('aria-label', '开启反馈留言模式');
      toggle.innerHTML = icon('comment');
      listToggle = document.createElement('button');
      listToggle.className = 'comment-list-toggle';
      listToggle.type = 'button';
      listToggle.title = '查看全部反馈';
      listToggle.setAttribute('aria-label', '查看当前页面全部反馈');
      listToggle.innerHTML = icon('list') + '<span class="comment-list-dot" aria-hidden="true"></span>';
      panel = document.createElement('aside');
      panel.className = 'comment-panel';
      panel.setAttribute('aria-label', '反馈留言');
      document.body.appendChild(layer);
      document.body.appendChild(listToggle);
      document.body.appendChild(toggle);
      document.body.appendChild(panel);

      toggle.addEventListener('click', function () {
        if (state.activeId || state.draft) {
          closePanel();
        } else {
          state.listOpen = false;
          setPlacing(!state.placing);
        }
      });

      listToggle.addEventListener('click', function () {
        if (state.listOpen) {
          closePanel();
          return;
        }
        state.listOpen = true;
        state.activeId = null;
        state.draft = null;
        setPlacing(false);
        renderPanel();
      });

      document.addEventListener('click', handlePageClick, true);
      var syncPinPositions = createRafThrottle(function () {
        if (!state.comments.length && !state.draft) return;
        renderPins();
      });
      window.addEventListener('scroll', syncPinPositions, { passive: true });
      window.addEventListener('resize', function () { updateBadge(); syncPinPositions(); });
      window.addEventListener('resize', syncPinPositions);
      document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closePanel(); });
      renderPins();
      loadComments();
      window.setInterval(function () {
        if (!document.hidden && !state.draft) loadComments();
      }, Math.max(5000, Number(cfg.pollInterval) || 20000));
    }

    function setPlacing(enabled) {
      state.placing = enabled;
      if (enabled) state.listOpen = false;
      document.body.classList.toggle('comment-placing', enabled);
      toggle.classList.toggle('active', enabled);
      if (listToggle) listToggle.classList.toggle('active', state.listOpen);
      toggle.setAttribute('aria-label', enabled ? '退出反馈留言模式' : '开启反馈留言模式');
      toggle.innerHTML = icon(enabled ? 'close' : 'comment');
      updateBadge();
    }

    function handlePageClick(event) {
      if (!state.placing || event.target.closest('.comment-toggle, .comment-panel, .comment-pin')) return;
      if (event.target.closest('a, button, input, textarea, select, dialog')) return;
      event.preventDefault();
      event.stopPropagation();
      state.draft = {
        x: Math.max(16, Math.min(document.documentElement.scrollWidth - 16, event.pageX)),
        y: Math.max(16, event.pageY),
        anchor: resolveAnchorDescriptor(event.target, event.clientX, event.clientY)
      };
      state.listOpen = false;
      state.activeId = null;
      setPlacing(false);
      renderPins();
      renderPanel();
    }

    function renderPins() {
      var visible = state.comments.filter(function (comment) { return !comment.resolved; });
      layer.innerHTML = visible.map(function (comment) {
        var position = getPinPosition(comment);
        var index = state.comments.indexOf(comment) + 1;
        return '<button class="comment-pin' + (state.activeId === comment.id ? ' active' : '') + '" type="button" data-comment-id="' + comment.id + '" style="left:' + position.x + 'px;top:' + position.y + 'px" aria-label="查看第 ' + index + ' 条反馈">' + index + '</button>';
      }).join('');
      if (state.draft) {
        layer.innerHTML += '<span class="comment-pin comment-pin-draft" style="left:' + state.draft.x + 'px;top:' + state.draft.y + 'px">+</span>';
      }
      Array.prototype.slice.call(layer.querySelectorAll('[data-comment-id]')).forEach(function (pin) {
        pin.addEventListener('click', function (event) {
          event.stopPropagation();
          state.activeId = pin.getAttribute('data-comment-id');
          state.listOpen = false;
          state.draft = null;
          setPlacing(false);
          renderPins();
          renderPanel();
        });
      });
      updateBadge();
    }

    function updateBadge() {
      var count = state.comments.filter(function (comment) { return !comment.resolved; }).length;
      if (!listToggle) return;
      var isMobile = window.innerWidth <= 860;
      listToggle.style.position = 'fixed';
      listToggle.style.right = isMobile ? '16px' : '24px';
      listToggle.style.bottom = isMobile ? '76px' : '88px';
      listToggle.style.zIndex = '1202';
      listToggle.style.width = '46px';
      listToggle.style.height = '46px';
      listToggle.style.borderRadius = '50%';
      listToggle.style.display = 'flex';
      listToggle.style.alignItems = 'center';
      listToggle.style.justifyContent = 'center';
      listToggle.style.pointerEvents = 'auto';
      listToggle.style.border = state.listOpen ? '1px solid #0b1f3a' : '1px solid rgba(22, 119, 255, .18)';
      listToggle.style.background = state.listOpen ? '#0b1f3a' : '#ffffff';
      listToggle.style.color = state.listOpen ? '#ffffff' : '#1677ff';
      listToggle.style.boxShadow = '0 10px 26px rgba(7, 29, 66, .16)';
      var listIcon = listToggle.querySelector('svg');
      if (listIcon) {
        listIcon.style.width = '19px';
        listIcon.style.height = '19px';
        listIcon.style.fill = 'none';
        listIcon.style.stroke = 'currentColor';
        listIcon.style.strokeWidth = '1.8';
        listIcon.style.strokeLinecap = 'round';
        listIcon.style.strokeLinejoin = 'round';
      }
      var dot = listToggle.querySelector('.comment-list-dot');
      if (dot) {
        dot.style.position = 'absolute';
        dot.style.top = '8px';
        dot.style.right = '8px';
        dot.style.width = '7px';
        dot.style.height = '7px';
        dot.style.borderRadius = '50%';
        dot.style.background = '#f04452';
        dot.style.display = count > 0 ? 'block' : 'none';
      }
      listToggle.classList.toggle('has-comments', count > 0);
      listToggle.classList.toggle('active', state.listOpen);
    }

    function renderPanel() {
      var comment = state.comments.filter(function (item) { return item.id === state.activeId; })[0];
      panel.classList.add('open');
      if (state.draft) {
        panel.innerHTML = panelHeader('新建反馈') + '<form class="comment-compose" data-new-comment>' + '<label for="comment-author">你的名字</label>' + '<input id="comment-author" name="author" maxlength="30" placeholder="匿名访客" autocomplete="name">' + '<label for="comment-message">留言内容</label>' + '<textarea id="comment-message" name="message" maxlength="500" rows="5" placeholder="描述问题或提出建议…" required autofocus></textarea>' + '<div class="comment-form-actions"><button type="button" class="comment-secondary" data-comment-cancel>取消</button>' + '<button type="submit" class="comment-primary">发布反馈 ' + icon('send') + '</button></div>' + '<p class="comment-storage-note">公开留言，所有访问者均可查看</p></form>';
        bindPanelActions();
        window.setTimeout(function () {
          var textarea = panel.querySelector('textarea');
          if (textarea) textarea.focus();
        }, 0);
        return;
      }
      if (state.listOpen) {
        panel.innerHTML = panelHeader('当前页面反馈') + renderListHtml();
        bindPanelActions();
        return;
      }
      if (!comment) {
        closePanel();
        return;
      }
      panel.innerHTML = panelHeader('反馈 #' + (state.comments.indexOf(comment) + 1), comment) + '<div class="comment-thread">' + messageHtml(comment) + (comment.replies || []).map(messageHtml).join('') + '</div>' + '<form class="comment-reply" data-reply>' + '<textarea name="message" maxlength="500" rows="3" placeholder="回复这条反馈…" required></textarea>' + '<div class="comment-thread-actions"><span class="comment-public-label">公开回复</span>' + (canDelete(comment) ? '<button type="button" class="comment-icon-action danger" data-delete title="删除反馈">' + icon('trash') + '<span>删除</span></button>' : '') + '<button type="submit" class="comment-primary comment-send" title="发送回复">' + icon('send') + '</button></div></form>';
      bindPanelActions(comment);
    }

    function canDelete(comment) {
      if (!comment) return false;
      if (typeof cfg.canDelete === 'function') return !!cfg.canDelete(comment);
      if (typeof cfg.canDelete === 'boolean') return cfg.canDelete;
      return true;
    }

    function panelHeader(title, comment) {
      var idLine = comment ? '<span class="comment-panel-id">ID ' + escapeHtml(feedbackDisplayId(comment)) + '</span>' : '';
      return '<div class="comment-panel-head"><div><span class="comment-panel-kicker">COMMENTS</span><h2>' + escapeHtml(title) + '</h2>' + idLine + '</div><button type="button" class="comment-panel-close" data-comment-close aria-label="关闭">' + icon('close') + '</button></div>';
    }

    function messageHtml(message) {
      return '<article class="comment-message"><div class="comment-avatar">' + escapeHtml((message.author || '匿名').slice(0, 1).toUpperCase()) + '</div><div><div class="comment-meta"><b>' + escapeHtml(message.author || '匿名访客') + '</b><time>' + formatTime(message.createdAt) + '</time></div><div class="comment-message-id">' + escapeHtml(feedbackDisplayId(message)) + '</div><p>' + escapeHtml(message.message).replace(/\n/g, '<br>') + '</p></div></article>';
    }

    function renderListHtml() {
      if (!state.comments.length) {
        return '<div class="comment-list-empty">当前页面还没有反馈，点击右下角留言按钮即可创建第一条反馈。</div>';
      }
      var items = state.comments.map(function (item) {
        var preview = escapeHtml(item.message || '').replace(/\n/g, ' ').slice(0, 54);
        var suffix = (item.message || '').length > 54 ? '…' : '';
        var count = (item.replies || []).length;
        var status = item.resolved ? '已处理' : '进行中';
        return '<button type="button" class="comment-list-item" data-open-comment="' + item.id + '">' + '<span class="comment-list-top"><b>反馈 #' + (state.comments.indexOf(item) + 1) + '</b><time>' + formatTime(item.createdAt) + '</time></span>' + '<span class="comment-list-id">' + escapeHtml(feedbackDisplayId(item)) + '</span>' + '<span class="comment-list-body">' + preview + suffix + '</span>' + '<span class="comment-list-meta">' + status + ' · ' + count + ' 条回复</span></button>';
      }).join('');
      return '<div class="comment-list-wrap">' + items + '</div>';
    }

    function bindPanelActions(comment) {
      var close = panel.querySelector('[data-comment-close]');
      var cancel = panel.querySelector('[data-comment-cancel]');
      if (close) close.addEventListener('click', closePanel);
      if (cancel) cancel.addEventListener('click', closePanel);
      var openButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-open-comment]'));
      if (openButtons.length) {
        openButtons.forEach(function (button) {
          button.addEventListener('click', function () {
            state.activeId = button.getAttribute('data-open-comment');
            state.listOpen = false;
            state.draft = null;
            setPlacing(false);
            renderPins();
            renderPanel();
          });
        });
        return;
      }
      var createForm = panel.querySelector('[data-new-comment]');
      if (createForm) {
        createForm.addEventListener('submit', function (event) {
          event.preventDefault();
          var data = new FormData(createForm);
          var message = String(data.get('message') || '').trim();
          if (!message) return;
          var payload = {
            page_path: pagePath,
            x: state.draft.x,
            y: state.draft.y,
            author: String(data.get('author') || '').trim() || '匿名访客',
            message: message,
            resolved: false
          };
          if (state.supportsAuthorToken) payload.author_token = authorToken;
          if (state.supportsAnchorColumns && state.draft.anchor) {
            payload.anchor_selector = state.draft.anchor.selector;
            payload.anchor_offset_x = state.draft.anchor.offsetX;
            payload.anchor_offset_y = state.draft.anchor.offsetY;
          }
          setBusy(createForm, true);
          apiRequest('', {
            method: 'POST',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify(payload)
          }).then(function (rows) {
            state.activeId = rows[0].id;
            if (rows[0] && rows[0].id && state.draft && state.draft.anchor) setCachedAnchor(rows[0].id, state.draft.anchor);
            state.draft = null;
            return loadComments();
          }).catch(function (error) {
            setBusy(createForm, false);
            showServiceError(error);
          });
        });
      }
      var replyForm = panel.querySelector('[data-reply]');
      if (replyForm && comment) {
        replyForm.addEventListener('submit', function (event) {
          event.preventDefault();
          var replyInput = replyForm.querySelector('textarea[name="message"]');
          var message = String(replyInput ? replyInput.value : '').trim();
          if (!message) return;
          setBusy(replyForm, true);
          var replyPayload = {
            parent_id: comment.id,
            page_path: pagePath,
            author: '访客',
            message: message
          };
          if (state.supportsAuthorToken) replyPayload.author_token = authorToken;
          apiRequest('', {
            method: 'POST',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify(replyPayload)
          }).then(loadComments).catch(function (error) {
            setBusy(replyForm, false);
            showServiceError(error);
          });
        });
        var deleteBtn = panel.querySelector('[data-delete]');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', function () {
            var password = window.prompt('请输入删除密码以彻底删除该反馈');
            if (password == null) return;
            if (password !== DELETE_PASSWORD) {
              window.alert('密码错误，无法删除反馈');
              return;
            }
            if (!window.confirm('确认后将从数据库彻底删除这条反馈及其全部回复，是否继续？')) return;
            setBusy(replyForm, true);
            var removeChildren = apiRequest('?parent_id=eq.' + encodeURIComponent(comment.id), {
              method: 'DELETE',
              headers: { Prefer: 'return=minimal' }
            });
            removeChildren.then(function () {
              return apiRequest('?id=eq.' + encodeURIComponent(comment.id), {
                method: 'DELETE',
                headers: { Prefer: 'return=minimal' }
              });
            }).then(function () {
              clearHiddenComment(comment.id);
              state.comments = state.comments.filter(function (item) { return item.id !== comment.id; });
              closePanel();
              renderPins();
              return loadComments();
            }).catch(function (error) {
              showServiceError(error);
              window.alert('删除失败：' + getErrorText(error));
            }).then(function () {
              setBusy(replyForm, false);
            });
          });
        }
      }
    }

    function closePanel() {
      state.activeId = null;
      state.draft = null;
      state.listOpen = false;
      setPlacing(false);
      panel.classList.remove('open');
      panel.innerHTML = '';
      renderPins();
    }

    function mount() {
      if (document.querySelector('.comment-toggle')) return;
      init();
    }

    return { mount: mount };
  }

  function initFeedbackModule(config) {
    var instance = createFeedbackModule(config || {});
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function onReady() {
        document.removeEventListener('DOMContentLoaded', onReady);
        instance.mount();
      });
    } else {
      instance.mount();
    }
    return instance;
  }

  global.TuringFeedbackModule = {
    init: initFeedbackModule
  };
})(window);
