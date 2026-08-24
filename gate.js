(function () {
  'use strict';

  var SESSION_KEY = 'turing-gate-approved';
  var PASSWORD = 'TuLing123';

  try {
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
  } catch (error) {
    // Fall through to prompt if sessionStorage is unavailable.
  }

  var style = document.createElement('style');
  style.textContent = '' +
    'html.turing-gate-lock, html.turing-gate-lock body { overflow: hidden !important; }' +
    'html.turing-gate-lock body > *:not(.turing-gate-overlay) { visibility: hidden !important; }' +
    '.turing-gate-overlay {' +
    ' position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center;' +
    ' padding: 24px; background: radial-gradient(circle at top, rgba(22,119,255,.26), rgba(7,29,66,.94) 55%, rgba(4,12,28,.98) 100%);' +
    ' backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);' +
    '}' +
    '.turing-gate-panel {' +
    ' width: min(420px, 100%); padding: 28px; border-radius: 22px; color: #fff;' +
    ' background: linear-gradient(180deg, rgba(10,27,61,.96), rgba(7,20,45,.98)); border: 1px solid rgba(169,216,255,.16);' +
    ' box-shadow: 0 24px 70px rgba(0,0,0,.35); font-family: "DM Sans", "Noto Sans SC", sans-serif;' +
    '}' +
    '.turing-gate-kicker { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #73c4ff; }' +
    '.turing-gate-title { margin: 12px 0 8px; font-size: 28px; line-height: 1.2; font-weight: 700; }' +
    '.turing-gate-desc { margin: 0 0 18px; font-size: 14px; line-height: 1.7; color: rgba(255,255,255,.78); }' +
    '.turing-gate-input {' +
    ' width: 100%; height: 48px; padding: 0 14px; border-radius: 12px; outline: none; border: 1px solid rgba(169,216,255,.18);' +
    ' background: rgba(255,255,255,.06); color: #fff; font: inherit; font-size: 15px;' +
    '}' +
    '.turing-gate-input::placeholder { color: rgba(255,255,255,.42); }' +
    '.turing-gate-input:focus { border-color: #64b5ff; box-shadow: 0 0 0 4px rgba(22,119,255,.14); }' +
    '.turing-gate-actions { display: flex; gap: 10px; margin-top: 14px; }' +
    '.turing-gate-btn {' +
    ' flex: 1; height: 46px; border: 0; border-radius: 12px; cursor: pointer; font: inherit; font-size: 14px; font-weight: 700;' +
    '}' +
    '.turing-gate-btn.primary { color: #fff; background: linear-gradient(135deg, #1677ff, #64b5ff); }' +
    '.turing-gate-btn.secondary { color: #d6ecff; background: rgba(255,255,255,.08); }' +
    '.turing-gate-error { min-height: 20px; margin-top: 12px; font-size: 13px; color: #ff8f8f; }' +
    '@media (max-width: 640px) {' +
    ' .turing-gate-panel { padding: 22px; border-radius: 18px; }' +
    ' .turing-gate-title { font-size: 24px; }' +
    ' .turing-gate-actions { flex-direction: column; }' +
    '}';
  document.head.appendChild(style);

  document.documentElement.classList.add('turing-gate-lock');

  function unlock() {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch (error) {
      // Ignore sessionStorage failures.
    }
    document.documentElement.classList.remove('turing-gate-lock');
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function submitPassword() {
    var value = input.value || '';
    if (value === PASSWORD) {
      unlock();
      return;
    }
    error.textContent = '密码错误，请重新输入';
    input.select();
  }

  var overlay = document.createElement('div');
  overlay.className = 'turing-gate-overlay';
  overlay.innerHTML = '' +
    '<div class="turing-gate-panel" role="dialog" aria-modal="true" aria-labelledby="turing-gate-title">' +
    '  <div class="turing-gate-kicker">PRIVATE ACCESS</div>' +
    '  <h1 class="turing-gate-title" id="turing-gate-title">请输入访问密码</h1>' +
    '  <p class="turing-gate-desc">本站已启用访问保护。输入密码后，本次会话内切换页面无需重复输入。</p>' +
    '  <input class="turing-gate-input" type="password" placeholder="输入密码" autocomplete="current-password" />' +
    '  <div class="turing-gate-actions">' +
    '    <button class="turing-gate-btn secondary" type="button">清空</button>' +
    '    <button class="turing-gate-btn primary" type="button">进入项目</button>' +
    '  </div>' +
    '  <div class="turing-gate-error" aria-live="polite"></div>' +
    '</div>';

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(overlay);
    input.focus();
  });

  var input = overlay.querySelector('.turing-gate-input');
  var buttons = overlay.querySelectorAll('.turing-gate-btn');
  var clearBtn = buttons[0];
  var enterBtn = buttons[1];
  var error = overlay.querySelector('.turing-gate-error');

  clearBtn.addEventListener('click', function () {
    input.value = '';
    error.textContent = '';
    input.focus();
  });

  enterBtn.addEventListener('click', submitPassword);
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitPassword();
    }
  });
})();
