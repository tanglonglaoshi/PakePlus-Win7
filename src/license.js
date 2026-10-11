/* ============================================================================
 *  PhysBoard 本地授权系统  license.js
 *  ---------------------------------------------------------------------------
 *  必须在 app.js 之前加载。
 *  密钥与算法必须与"注册机.html"中的完全一致！
 * ============================================================================ */
(function () {
'use strict';

/* ==========================================================================
 * 1. 密钥（必须与注册机 _secret() 完全一致！）
 * ========================================================================== */
function _secret() {
  var a = 'T4ngL';
  var b = 'aoZha';
  var c = 'ng_Ph';
  var d = 'ysBoa';
  var e = 'rd_20';
  var f = '24_v1';
  return a + b + c + d + e + f + '_S3cr3t#9f2c1a';
}

/* ==========================================================================
 * 2. SHA-256（纯 JS 同步实现）
 * ========================================================================== */
var K256 = new Uint32Array([
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
]);

function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

function sha256Bytes(bytes) {
  var H = new Uint32Array([
    0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,
    0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19
  ]);
  var len = bytes.length;
  var bitLen = len * 8;
  var totalLen = (((len + 9) >> 6) + 1) << 6;
  var buf = new Uint8Array(totalLen);
  buf.set(bytes);
  buf[len] = 0x80;
  var dv = new DataView(buf.buffer);
  dv.setUint32(totalLen - 8, Math.floor(bitLen / 4294967296));
  dv.setUint32(totalLen - 4, bitLen >>> 0);

  var w = new Uint32Array(64);
  for (var off = 0; off < totalLen; off += 64) {
    for (var t = 0; t < 16; t++) w[t] = dv.getUint32(off + t * 4);
    for (var t2 = 16; t2 < 64; t2++) {
      var x = w[t2 - 15], y = w[t2 - 2];
      var s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
      var s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);
      w[t2] = (w[t2 - 16] + s0 + w[t2 - 7] + s1) >>> 0;
    }
    var a = H[0], b = H[1], c = H[2], d = H[3];
    var e = H[4], f = H[5], g = H[6], h = H[7];
    for (var i = 0; i < 64; i++) {
      var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      var ch = (e & f) ^ (~e & g);
      var t1 = (h + S1 + ch + K256[i] + w[i]) >>> 0;
      var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var t3 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t3) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  var out = '';
  for (var k = 0; k < 8; k++) {
    out += ('00000000' + H[k].toString(16)).slice(-8);
  }
  return out;
}

function utf8Bytes(str) {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
  var out = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 63)); }
    else if (c < 0xd800 || c >= 0xe000) {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    } else {
      i++;
      var c2 = str.charCodeAt(i);
      var cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63),
               0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    }
  }
  return new Uint8Array(out);
}

function sha256(str) { return sha256Bytes(utf8Bytes(str)); }

/* ==========================================================================
 * 3. 激活码算法（必须与注册机完全一致！）
 * ========================================================================== */
function cleanDeviceId(s) {
  return String(s == null ? '' : s).replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
}

function calcCode(devId) {
  var clean = cleanDeviceId(devId);
  if (clean.length !== 16) return '';
  var h = sha256('PB-ACTIVATE-V1::' + clean + '::' + _secret()).toUpperCase();
  return h.slice(0, 16).replace(/(.{4})(?=.)/g, '$1-');
}

/* ==========================================================================
 * 4. 设备指纹
 * ========================================================================== */
function getDeviceFingerprint() {
  try {
    var tz = 'unknown';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'; } catch (e) {}
    var parts = [
      'cores=' + (navigator.hardwareConcurrency || 0),
      'platform=' + (navigator.platform || 'unknown'),
      'lang=' + (navigator.language || 'unknown'),
      'tz=' + tz,
      'screen=' + (screen.width + 'x' + screen.height + 'x' + (screen.colorDepth || 0)),
      'dpr=' + (Math.round((window.devicePixelRatio || 1) * 100) / 100),
      'touch=' + (navigator.maxTouchPoints || 0)
    ];
    var raw = parts.join('|');
    var h = sha256('PB-DEVICE-V1::' + raw).toUpperCase();
    var id = h.slice(0, 16);
    return id.replace(/(.{4})(?=.)/g, '$1-');
  } catch (e) {
    return 'ERROR-ERROR-ERROR-ERROR';
  }
}

/* ==========================================================================
 * 5. 本地存储
 * ========================================================================== */
var LS_KEY = 'pb_license_v1';

function loadSaved() {
  try { return localStorage.getItem(LS_KEY) || ''; }
  catch (e) { return ''; }
}

function saveCode(code) {
  try { localStorage.setItem(LS_KEY, code); return true; }
  catch (e) { return false; }
}

/* ==========================================================================
 * 6. 检查授权（app.js 会调用此方法）
 * ========================================================================== */
function check() {
  var saved = loadSaved();
  if (!saved) return false;
  var devId = getDeviceFingerprint();
  var expected = calcCode(devId);
  if (!expected) return false;
  return saved === expected;
}

/* ==========================================================================
 * 7. 激活界面
 * ========================================================================== */
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function injectStyles() {
  if (document.getElementById('pbLicenseStyles')) return;
  var style = document.createElement('style');
  style.id = 'pbLicenseStyles';
  style.textContent = `
    .pb-license-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(4, 10, 22, .88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: pbLicFade .25s ease;
      font-family: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: #e6edf7;
    }
    @keyframes pbLicFade { from { opacity: 0 } to { opacity: 1 } }
    @keyframes pbLicIn {
      from { opacity: 0; transform: translateY(12px) scale(.97) }
      to   { opacity: 1; transform: none }
    }
    .pb-license-card {
      width: 100%; max-width: 460px;
      background: linear-gradient(160deg, rgba(24,36,60,.98), rgba(14,22,40,.98));
      border: 1px solid rgba(120,180,255,.28);
      border-radius: 20px;
      box-shadow: 0 30px 80px rgba(0,8,24,.7), 0 0 60px rgba(56,189,248,.12);
      padding: 32px 28px 24px;
      animation: pbLicIn .3s cubic-bezier(.34, 1.3, .64, 1);
    }
    .pb-license-head {
      display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
    }
    .pb-license-head svg {
      width: 30px; height: 30px; color: #38bdf8; flex: none;
      filter: drop-shadow(0 0 10px rgba(56,189,248,.5));
    }
    .pb-license-head h2 {
      margin: 0; font-size: 19px; letter-spacing: .5px; font-weight: 600;
    }
    .pb-license-msg {
      margin: 0 0 22px; font-size: 13.5px; color: #8fa3c0; line-height: 1.7;
    }
    .pb-license-field { margin-bottom: 18px; }
    .pb-license-field label {
      display: block; font-size: 12px; color: #8fa3c0;
      letter-spacing: .5px; margin-bottom: 8px;
    }
    .pb-license-id-row { display: flex; gap: 8px; }
    .pb-license-id-row input { flex: 1; min-width: 0; }
    .pb-license-id-row button {
      flex: none; padding: 0 18px; height: 52px;
      background: rgba(120,180,255,.12);
      border: 1px solid rgba(120,180,255,.25);
      border-radius: 12px;
      color: #bae6fd; font-size: 13.5px; font-weight: 500;
      cursor: pointer; transition: .15s; font-family: inherit;
    }
    .pb-license-id-row button:hover {
      background: rgba(120,180,255,.22); color: #fff;
    }
    .pb-license-card input {
      width: 100%; height: 52px; padding: 0 14px;
      background: rgba(8,16,32,.6);
      border: 1px solid rgba(120,180,255,.22);
      border-radius: 12px;
      color: #e6edf7; outline: none;
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: 17px; letter-spacing: 1.5px;
      transition: border-color .15s, box-shadow .15s;
    }
    .pb-license-card input:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56,189,248,.13);
    }
    .pb-license-card input#pbLicDevId {
      color: #7dd3fc; font-weight: 600;
    }
    .pb-license-card input::placeholder { color: #5b6b84; }
    .pb-license-status {
      min-height: 20px; font-size: 12.5px; margin: 4px 0 14px;
      letter-spacing: .3px; color: #8fa3c0;
    }
    .pb-license-status.ok { color: #4ade80; }
    .pb-license-status.bad { color: #fca5a5; }
    .pb-license-btn {
      width: 100%; height: 52px;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      color: #fff; font-size: 15px; font-weight: 600;
      letter-spacing: 1px; font-family: inherit;
      border: none; border-radius: 12px; cursor: pointer;
      box-shadow: 0 6px 20px rgba(56,189,248,.35);
      transition: .15s;
    }
    .pb-license-btn:hover {
      filter: brightness(1.1);
      box-shadow: 0 8px 26px rgba(56,189,248,.5);
    }
    .pb-license-btn:active { transform: scale(.98); }
    .pb-license-btn:disabled {
      opacity: .5; cursor: default; filter: none;
    }
    .pb-license-foot {
      margin-top: 22px; padding-top: 18px;
      border-top: 1px solid rgba(120,180,255,.12);
      font-size: 12px; color: #6b7c96; line-height: 1.9;
    }
    .pb-license-foot b { color: #8fa3c0; font-weight: 600; }
  `;
  document.head.appendChild(style);
}

function copyToClipboard(text, btn) {
  var done = function () {
    if (!btn) return;
    var old = btn.textContent;
    btn.textContent = '已复制';
    btn.disabled = true;
    setTimeout(function () { btn.textContent = old; btn.disabled = false; }, 1500);
  };
  var fallback = function () {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(fallback);
  } else {
    fallback();
  }
}

function showActivationUI(message) {
  if (document.getElementById('pbLicenseOverlay')) return;
  injectStyles();

  var devId = getDeviceFingerprint();

  var overlay = document.createElement('div');
  overlay.id = 'pbLicenseOverlay';
  overlay.className = 'pb-license-overlay';
  overlay.innerHTML =
    '<div class="pb-license-card">' +
      '<div class="pb-license-head">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="4" y="10" width="16" height="11" rx="2"/>' +
          '<path d="M8 10V7a4 4 0 0 1 8 0v3"/>' +
          '<circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none"/>' +
        '</svg>' +
        '<h2>软件未激活</h2>' +
      '</div>' +
      '<p class="pb-license-msg">' +
        escapeHtml(message || '请将下方设备特征值发送给作者，获取专属激活码。') +
      '</p>' +

      '<div class="pb-license-field">' +
        '<label>① 设备特征值（发给作者）</label>' +
        '<div class="pb-license-id-row">' +
          '<input id="pbLicDevId" readonly value="' + escapeHtml(devId) + '">' +
          '<button id="pbLicCopyId" type="button">复制</button>' +
        '</div>' +
      '</div>' +

      '<div class="pb-license-field">' +
        '<label>② 激活码</label>' +
        '<input id="pbLicCode" placeholder="XXXX-XXXX-XXXX-XXXX" ' +
        'autocomplete="off" spellcheck="false">' +
      '</div>' +

      '<div id="pbLicStatus" class="pb-license-status"></div>' +

      '<button id="pbLicActivate" class="pb-license-btn" type="button">激 活</button>' +

      '<div class="pb-license-foot">' +
        '<div><b>作者：</b>唐龙</div>' +
        '<div><b>公众号：</b>Mli随笔 · <b>B站/抖音：</b>教物理的唐长老</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  var input    = document.getElementById('pbLicCode');
  var statusEl = document.getElementById('pbLicStatus');
  var actBtn   = document.getElementById('pbLicActivate');
  var copyBtn  = document.getElementById('pbLicCopyId');

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'pb-license-status' + (type ? ' ' + type : '');
  }

  /* 输入时自动分组 */
  input.addEventListener('input', function () {
    var clean = String(input.value || '')
      .replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 16);
    input.value = clean.replace(/(.{4})(?=.)/g, '$1-');
  });

  copyBtn.addEventListener('click', function () {
    copyToClipboard(devId, copyBtn);
  });

  function tryActivate() {
    var code = String(input.value || '').trim().toUpperCase();
    if (!code) {
      setStatus('请输入激活码', 'bad');
      input.focus();
      return;
    }
    var expected = calcCode(devId);
    if (!expected) {
      setStatus('设备特征值异常，无法激活', 'bad');
      return;
    }
    if (code !== expected) {
      setStatus('激活码错误，请核对后重试', 'bad');
      return;
    }
    if (!saveCode(code)) {
      setStatus('无法保存授权（浏览器可能禁用了本地存储）', 'bad');
      return;
    }
    setStatus('激活成功！正在重新加载…', 'ok');
    actBtn.disabled = true;
    actBtn.textContent = '激活成功';
    input.disabled = true;
    setTimeout(function () { location.reload(); }, 700);
  }

  actBtn.addEventListener('click', tryActivate);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); tryActivate(); }
  });

  setTimeout(function () { try { input.focus(); } catch (e) {} }, 120);
}

/* ==========================================================================
 * 8. 导出接口（app.js 会读取 window.__pbLicense）
 * ========================================================================== */
window.__pbLicense = {
  check: check,
  showActivationUI: showActivationUI,
  getDeviceId: getDeviceFingerprint,
  calcCode: calcCode
};

})();