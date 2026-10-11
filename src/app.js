(function () {
'use strict';

const PB = window.PhysBoard;
if (!PB || !PB.shapes) {
  document.body.innerHTML =
    '<div style="max-width:540px;margin:100px auto;padding:30px 34px;' +
    'background:linear-gradient(160deg,rgba(24,36,60,.98),rgba(14,22,40,.98));' +
    'border:1px solid rgba(120,180,255,.25);border-radius:20px;' +
    'box-shadow:0 30px 80px rgba(0,8,24,.7);font-size:14px;' +
    'line-height:1.85;color:#fca5a5;font-family:system-ui,sans-serif;">' +
    '<b style="font-size:17px;color:#fff;">未找到图形库 shapes.js</b><br><br>' +
    '<span style="color:#b8c7de;">请确认：</span><br>' +
    '1. <code style="background:rgba(120,180,255,.15);padding:2px 8px;border-radius:6px;">shapes.js</code> 与本 HTML 放在<b>同一文件夹</b>；<br>' +
    '2. <code style="background:rgba(120,180,255,.15);padding:2px 8px;border-radius:6px;">&lt;script src="shapes.js"&gt;&lt;/script&gt;</code> 位于主脚本之前；<br>' +
    '3. 浏览器控制台（F12）若无 404，说明文件名或路径有误。</div>';
  return;
}

/* =====================================================================
 * 1. 常量
 * ===================================================================== */
const COLORS = [
  '#ffffff', '#ff0000', '#ff5500', '#ff9900', '#ffcc00', '#ffee00',
  '#88cc00', '#22cc22', '#00cc88', '#0088ff', '#4455ee', '#6644cc',
  '#aa22cc', '#dd22aa', '#000000'
];
const PEN_SIZES = [ {v:2, d:7}, {v:5, d:14}, {v:11, d:22} ];
const BORDER_SIZES = [ {v:1}, {v:3}, {v:6} ];
const DASH_STYLES = [
  { id:'solid',  svg:'<line x1="2" y1="7" x2="54" y2="7" stroke-width="2.5" stroke-linecap="round"/>' },
  { id:'dashed', svg:'<line x1="2" y1="7" x2="54" y2="7" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="9 6"/>' },
  { id:'center', svg:'<line x1="2" y1="7" x2="54" y2="7" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="18 5 3 5"/>' }
];

const TEXT_FONTS = [
  { id:'system', label:'系统默认', css:'system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif' },
  { id:'hei',    label:'黑体',     css:'"Microsoft YaHei","PingFang SC","Heiti SC","SimHei",sans-serif' },
  { id:'song',   label:'宋体',     css:'"SimSun","Songti SC","STSong",serif' },
  { id:'kai',    label:'楷体',     css:'"KaiTi","STKaiti","Kaiti SC",serif' },
  { id:'fangsong', label:'仿宋',   css:'"FangSong","STFangsong",serif' },
  { id:'mono',   label:'等宽',     css:'ui-monospace,Menlo,Consolas,"Courier New",monospace' },
  { id:'serif',  label:'西文衬线', css:'Georgia,"Times New Roman",Times,serif' },
  { id:'hand',   label:'手写体',   css:'"Comic Sans MS","Segoe Print","Bradley Hand",cursive' }
];
const TEXT_PARAMS = ['fontFamily','fontSize','bold','italic','underline','textAlign'];

const MASK_SCALE = 0.5;
const MASK_PAD = 32;

const CUSTOM_ICON = '<rect x="3" y="3" width="11" height="11" rx="2.5"/><rect x="10" y="10" width="11" height="11" rx="2.5"/>';

/* ---- 直线类图形：特殊角度吸附 ---- */
const LINE_SNAP_ANGLES = [0, 30, 37, 45, 53, 60, 90];
const LINE_SNAP_TOL = 2 * Math.PI / 180;
const LINE_SNAP_MIN_LEN = 8;

const BG_PRESETS = [
  { id:'tech', name:'科技深空',
    css:'radial-gradient(ellipse 120% 80% at 15% -10%, rgba(56,189,248,.22), transparent 55%),' +
        'radial-gradient(ellipse 100% 80% at 90% 110%, rgba(129,140,248,.20), transparent 55%),' +
        'radial-gradient(ellipse 90% 60% at 50% 50%, rgba(14,32,64,.65), transparent 70%),' +
        'linear-gradient(160deg, #060c18 0%, #0a1428 45%, #0b1020 100%)',
    swatch:'linear-gradient(160deg,#060c18,#0a1428 50%,#0b1020)', light:false, fill:'#0d1830',
    colors:['#060c18','#0a1428','#0b1020'] },

  { id:'nebula', name:'星云紫',
    css:'radial-gradient(ellipse 110% 80% at 20% -10%, rgba(192,132,252,.24), transparent 55%),' +
        'radial-gradient(ellipse 100% 80% at 90% 110%, rgba(56,189,248,.18), transparent 55%),' +
        'linear-gradient(160deg, #120a24 0%, #1a1032 50%, #0d0820 100%)',
    swatch:'linear-gradient(160deg,#120a24,#1a1032 50%,#0d0820)', light:false, fill:'#16102a',
    colors:['#120a24','#1a1032','#0d0820'] },

  { id:'aurora', name:'极光青',
    css:'radial-gradient(ellipse 110% 80% at 20% -10%, rgba(52,211,153,.20), transparent 55%),' +
        'radial-gradient(ellipse 100% 80% at 90% 110%, rgba(56,189,248,.22), transparent 55%),' +
        'linear-gradient(160deg, #041a20 0%, #062a33 50%, #04202a 100%)',
    swatch:'linear-gradient(160deg,#041a20,#062a33 50%,#04202a)', light:false, fill:'#082a33',
    colors:['#041a20','#062a33','#04202a'] },

  { id:'ocean', name:'深海蓝',
    css:'radial-gradient(ellipse 110% 80% at 18% -10%, rgba(56,189,248,.18), transparent 55%),' +
        'radial-gradient(ellipse 100% 80% at 90% 110%, rgba(30,80,180,.24), transparent 55%),' +
        'linear-gradient(160deg, #061428 0%, #0a1e3a 50%, #051228 100%)',
    swatch:'linear-gradient(160deg,#061428,#0a1e3a 50%,#051228)', light:false, fill:'#0c1e3a',
    colors:['#061428','#0a1e3a','#051228'] },

  { id:'sunset', name:'暮光橙',
    css:'radial-gradient(ellipse 110% 80% at 15% -10%, rgba(251,146,60,.22), transparent 55%),' +
        'radial-gradient(ellipse 100% 80% at 90% 110%, rgba(244,63,94,.20), transparent 55%),' +
        'linear-gradient(160deg, #2a0e0a 0%, #3d1810 50%, #20080a 100%)',
    swatch:'linear-gradient(160deg,#2a0e0a,#3d1810 50%,#20080a)', light:false, fill:'#331410',
    colors:['#2a0e0a','#3d1810','#20080a'] },

  { id:'forest', name:'松林绿',
    css:'radial-gradient(ellipse 110% 80% at 20% -10%, rgba(52,211,153,.16), transparent 55%),' +
        'radial-gradient(ellipse 100% 80% at 90% 110%, rgba(34,197,94,.18), transparent 55%),' +
        'linear-gradient(160deg, #0a1f14 0%, #13301f 50%, #071a10 100%)',
    swatch:'linear-gradient(160deg,#0a1f14,#13301f 50%,#071a10)', light:false, fill:'#0f2418',
    colors:['#0a1f14','#13301f','#071a10'] },

  { id:'eye', name:'护眼绿',
    css:'linear-gradient(160deg,#d4ecd6 0%,#c7e6cd 50%,#bfe0c6 100%)',
    swatch:'linear-gradient(160deg,#d4ecd6,#c7e6cd)', light:true, fill:'#c7e6cd',
    colors:['#d4ecd6','#c7e6cd','#bfe0c6'] },

  { id:'paper', name:'纸感米白',
    css:'linear-gradient(160deg,#fdfbf4 0%,#f7f3e8 50%,#f1ead9 100%)',
    swatch:'linear-gradient(160deg,#fdfbf4,#f1ead9)', light:true, fill:'#f7f3e8',
    colors:['#fdfbf4','#f7f3e8','#f1ead9'] },

  { id:'mist', name:'雾霾灰',
    css:'radial-gradient(ellipse 110% 80% at 15% -10%, rgba(148,163,184,.25), transparent 55%),' +
        'radial-gradient(ellipse 100% 80% at 90% 110%, rgba(100,116,139,.20), transparent 55%),' +
        'linear-gradient(160deg, #eef1f5 0%, #e3e8ee 50%, #dae0e7 100%)',
    swatch:'linear-gradient(160deg,#eef1f5,#dae0e7)', light:true, fill:'#e8edf2',
    colors:['#eef1f5','#e3e8ee','#dae0e7'] },

  { id:'white', name:'纯白',
    css:'linear-gradient(160deg,#ffffff 0%,#f7fafd 100%)',
    swatch:'linear-gradient(160deg,#ffffff,#f7fafd)', light:true, fill:'#ffffff',
    colors:['#ffffff','#fbfcfe','#f7fafd'] }
];

/* =====================================================================
 * 2. 状态
 * ===================================================================== */
const state = {
  tool: 'pen',
  penSize: 5, penColor: '#e6edf7', penDash: 'solid',
  borderSize: 3, borderColor: '#e6edf7',
  fillColor: '#38bdf8', fillAlpha: 0.6, fillActive: false,
  shapeCat: null, bg: 'tech',
  textFontFamily: 'system',
  textSize: 32,
  textBold: false,
  textItalic: false,
  textUnderline: false
};
let cloneMode = false;

let pages = [[]];
let pageIndex = 0;
let objects = pages[0];

let selection = [];
let current = null;
let drawing = false;
let selState = null;
let marquee = null;
let snapshots = [];
let snapIndex = -1;
let W = 0, H = 0, dpr = 1;
let eraseSliderEl = null;

let erasing = false;
let eraseDirty = false;
let erasedThisStroke = new Set();
let lastErasePt = null;
let lastHoverPt = null;
let lastEraserRadius = 22;
let eraserSizeMul = 1;

let saveDirHandle = null;
let cachedShapesHandle = null;

/* =====================================================================
 * 3. DOM
 * ===================================================================== */
const board = document.getElementById('board');
const preview = document.getElementById('preview');
const ctx = board.getContext('2d');
const pctx = preview.getContext('2d');

const penPanel = document.getElementById('penPanel');
const shapePanel = document.getElementById('shapePanel');
const borderPanel = document.getElementById('borderPanel');
const fillPanel = document.getElementById('fillPanel');
const paramsPanel = document.getElementById('paramsPanel');
const selBar = document.getElementById('selBar');
const catStrip = document.getElementById('catStrip');
const shapeGrid = document.getElementById('shapeGrid');
const penSizesEl = document.getElementById('penSizes');
const penColorsEl = document.getElementById('penColors');
const penStylesEl = document.getElementById('penStyles');
const borderSizesEl = document.getElementById('borderSizes');
const borderColorsEl = document.getElementById('borderColors');
const borderStylesEl = document.getElementById('borderStyles');
const fillColorsEl = document.getElementById('fillColors');
const fillAlphaInput = document.getElementById('fillAlpha');
const fillAlphaVal = document.getElementById('fillAlphaVal');
const paramsBody = document.getElementById('paramsBody');
const menuPop = document.getElementById('menuPop');
const pgLabel = document.getElementById('pgLabel');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const playAllBtn = document.getElementById('playAllBtn');
const pauseAllBtn = document.getElementById('pauseAllBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const thumbPanel = document.getElementById('thumbPanel');
const thumbScroll = document.getElementById('thumbScroll');
const thumbCount = document.getElementById('thumbCount');

/* =====================================================================
 * 4. 几何 / 颜色工具
 * ===================================================================== */
function alphaColor(hex, a) {
  if (!hex) return 'rgba(0,0,0,' + a + ')';
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const n = parseInt(h, 16);
  if (isNaN(n)) return 'rgba(0,0,0,' + a + ')';
  return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')';
}
function rotatePt(p, c, a) {
  if (!a) return { x:p.x, y:p.y };
  const cos = Math.cos(a), sin = Math.sin(a);
  const dx = p.x - c.x, dy = p.y - c.y;
  return { x:c.x + dx*cos - dy*sin, y:c.y + dx*sin + dy*cos };
}
function distToSeg(p, a, b) {
  const dx = b.x-a.x, dy = b.y-a.y;
  const l2 = dx*dx + dy*dy;
  if (l2 === 0) return Math.hypot(p.x-a.x, p.y-a.y);
  let t = ((p.x-a.x)*dx + (p.y-a.y)*dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x-(a.x+t*dx), p.y-(a.y+t*dy));
}

function isTextObj(o) {
  if (!o) return false;
  const d = PB.shapes[o.type];
  return !!(d && d.geom === 'text');
}
function getFontCss(id) {
  const f = TEXT_FONTS.find(x => x.id === id);
  return f ? f.css : TEXT_FONTS[0].css;
}
function textFontString(o) {
  const fs = Math.max(6, o.fontSize || 32);
  const fam = getFontCss(o.fontFamily);
  return (o.italic ? 'italic ' : '') + (o.bold ? '700 ' : '400 ') + fs + 'px ' + fam;
}
function measureText(o) {
  ctx.save();
  ctx.font = textFontString(o);
  const lines = String(o.text == null ? '' : o.text).split('\n');
  let w = 0;
  for (let i = 0; i < lines.length; i++) {
    const mw = ctx.measureText(lines[i]).width;
    if (mw > w) w = mw;
  }
  o.tw = w;
  o.th = Math.max(1, lines.length) * (o.fontSize || 32) * 1.3;
  ctx.restore();
}
function drawTextShape(c, o) {
  const fs = Math.max(6, o.fontSize || 32);
  const raw = (o.text == null) ? '' : String(o.text);
  const lines = raw.split('\n');
  const lh = fs * 1.3;
  const align = o.textAlign || 'left';

  c.save();
  c.setLineDash([]);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.font = textFontString(o);
  c.textBaseline = 'top';
  c.textAlign = (align === 'center' || align === 'right') ? align : 'left';

  let maxW = 0;
  for (let i = 0; i < lines.length; i++) {
    const w = c.measureText(lines[i]).width;
    if (w > maxW) maxW = w;
  }
  const totalH = lines.length * lh;

  if (o.fill && o.fillColor) {
    const padX = fs * 0.2;
    const padY = fs * 0.1;
    const a = (o.fillAlpha != null ? o.fillAlpha : 0.6);
    c.save();
    c.globalAlpha = Math.max(0, Math.min(1, a));
    c.fillStyle = o.fillColor;
    const bx = o.x - padX, by = o.y - padY;
    const bw = maxW + padX * 2, bh = totalH + padY * 2;
    const rx = Math.min(8, fs * 0.15);
    if (c.roundRect) {
      c.beginPath();
      c.roundRect(bx, by, bw, bh, rx);
      c.fill();
    } else {
      c.fillRect(bx, by, bw, bh);
    }
    c.restore();
  }

  const col = o.color || '#e6edf7';
  c.fillStyle = col;
  c.strokeStyle = col;

  let ax = o.x;
  if (align === 'center') ax = o.x + maxW / 2;
  else if (align === 'right') ax = o.x + maxW;

  for (let i = 0; i < lines.length; i++) {
    const y = o.y + i * lh;
    c.fillText(lines[i], ax, y);
    if (o.underline && lines[i]) {
      const w = c.measureText(lines[i]).width;
      let sx = ax;
      if (align === 'center') sx = ax - w / 2;
      else if (align === 'right') sx = ax - w;
      const uy = y + fs * 1.14;
      c.lineWidth = Math.max(1, fs / 16);
      c.beginPath();
      c.moveTo(sx, uy);
      c.lineTo(sx + w, uy);
      c.stroke();
    }
  }
  c.restore();
}

function getBBox(o) {
  let x1,y1,x2,y2;
  if (o.points && o.points.length) {
    x1=y1=Infinity; x2=y2=-Infinity;
    for (const p of o.points) {
      if (p.x<x1) x1=p.x; if (p.y<y1) y1=p.y;
      if (p.x>x2) x2=p.x; if (p.y>y2) y2=p.y;
    }
  } else if (isTextObj(o)) {
    if (o.tw == null || o.th == null) measureText(o);
    x1=o.x; y1=o.y; x2=o.x+(o.tw||0); y2=o.y+(o.th||0);
  } else {
    x1=Math.min(o.x1,o.x2); y1=Math.min(o.y1,o.y2);
    x2=Math.max(o.x1,o.x2); y2=Math.max(o.y1,o.y2);
  }
  return { x1, y1, x2, y2, w:x2-x1, h:y2-y1 };
}
function getWorldBBox(o) {
  const b = getBBox(o);
  const rot = o.rotation || 0;
  if (!rot) return { x1:b.x1, y1:b.y1, x2:b.x2, y2:b.y2 };
  const c = { x:(b.x1+b.x2)/2, y:(b.y1+b.y2)/2 };
  const pts = [{x:b.x1,y:b.y1},{x:b.x2,y:b.y1},{x:b.x2,y:b.y2},{x:b.x1,y:b.y2}]
    .map(p => rotatePt(p, c, rot));
  return {
    x1:Math.min(...pts.map(p=>p.x)), y1:Math.min(...pts.map(p=>p.y)),
    x2:Math.max(...pts.map(p=>p.x)), y2:Math.max(...pts.map(p=>p.y))
  };
}
function unionBBox(objs) {
  let x1=Infinity, y1=Infinity, x2=-Infinity, y2=-Infinity;
  for (const o of objs) {
    const b = getWorldBBox(o);
    if (b.x1<x1) x1=b.x1; if (b.y1<y1) y1=b.y1;
    if (b.x2>x2) x2=b.x2; if (b.y2>y2) y2=b.y2;
  }
  if (!isFinite(x1)) return { x1:0, y1:0, x2:0, y2:0 };
  return { x1, y1, x2, y2 };
}
function normRect(r) {
  const x1 = Math.min(r.x1, r.x2), y1 = Math.min(r.y1, r.y2);
  const x2 = Math.max(r.x1, r.x2), y2 = Math.max(r.y1, r.y2);
  return { x1, y1, x2, y2, w:x2-x1, h:y2-y1 };
}
const rectsIntersect = (a, b) => !(a.x2 < b.x1 || a.x1 > b.x2 || a.y2 < b.y1 || a.y1 > b.y2);
function objCenter(o) {
  if (isTextObj(o)) return { x:o.x+(o.tw||0)/2, y:o.y+(o.th||0)/2 };
  const b = getBBox(o);
  return { x:(b.x1+b.x2)/2, y:(b.y1+b.y2)/2 };
}
function copyObj(o) {
  const t = Object.assign({}, o);
  if (o.points) t.points = o.points.map(p => ({x:p.x, y:p.y}));
  return t;
}
function cloneGeo(o) {
  const g = {};
  if (o.points) g.points = o.points.map(p => ({x:p.x,y:p.y}));
  if (o.x1 !== undefined) { g.x1=o.x1; g.y1=o.y1; g.x2=o.x2; g.y2=o.y2; }
  if (isTextObj(o)) {
    g.x=o.x; g.y=o.y; g.fontSize=o.fontSize; g.tw=o.tw; g.th=o.th;
    g.fontFamily=o.fontFamily; g.bold=o.bold; g.italic=o.italic;
    g.underline=o.underline; g.textAlign=o.textAlign;
  }
  return g;
}
function applyGeo(o, g) {
  if (g.points) o.points = g.points.map(p => ({x:p.x,y:p.y}));
  if (g.x1 !== undefined) { o.x1=g.x1; o.y1=g.y1; o.x2=g.x2; o.y2=g.y2; }
  if (g.x !== undefined) {
    o.x=g.x; o.y=g.y; o.fontSize=g.fontSize; o.tw=g.tw; o.th=g.th;
    if (g.fontFamily !== undefined) o.fontFamily=g.fontFamily;
    if (g.bold !== undefined) o.bold=g.bold;
    if (g.italic !== undefined) o.italic=g.italic;
    if (g.underline !== undefined) o.underline=g.underline;
    if (g.textAlign !== undefined) o.textAlign=g.textAlign;
  }
}
function translateObj(o, dx, dy) {
  if (o.points) o.points.forEach(p => { p.x+=dx; p.y+=dy; });
  if (o.x1 !== undefined) { o.x1+=dx; o.y1+=dy; o.x2+=dx; o.y2+=dy; }
  if (isTextObj(o)) { o.x+=dx; o.y+=dy; }
}
function scaleObj(o, anchor, sx, sy) {
  const f = p => ({ x:anchor.x+(p.x-anchor.x)*sx, y:anchor.y+(p.y-anchor.y)*sy });
  if (o.points) o.points = o.points.map(f);
  if (o.x1 !== undefined) {
    const a = f({x:o.x1,y:o.y1}), b = f({x:o.x2,y:o.y2});
    o.x1=a.x; o.y1=a.y; o.x2=b.x; o.y2=b.y;
  }
  if (isTextObj(o)) {
    const a = f({x:o.x,y:o.y});
    o.x=a.x; o.y=a.y;
    o.fontSize = Math.max(6, (o.fontSize||32)*Math.abs(sy));
    measureText(o);
  }
}
function arrowHead(c, x1, y1, x2, y2, size) {
  const ang = Math.atan2(y2-y1, x2-x1);
  const hl = Math.max(12, size*4);
  const sp = 0.42;
  c.beginPath();
  c.moveTo(x2,y2); c.lineTo(x2-hl*Math.cos(ang-sp), y2-hl*Math.sin(ang-sp));
  c.moveTo(x2,y2); c.lineTo(x2-hl*Math.cos(ang+sp), y2-hl*Math.sin(ang+sp));
  c.stroke();
}

const U = {
  alpha: function (color, a) {
    const cur = U._cur;
    let base = color, al = a;
    if (cur) {
      if (typeof cur.fillAlpha === 'number') al = cur.fillAlpha;
      if (cur.fillColor && (color === cur.color || color == null)) base = cur.fillColor;
    }
    return alphaColor(base, al);
  },
  bbox: getBBox,
  arrowHead: arrowHead,
  rad: d => d*Math.PI/180,
  _cur: null
};
window.U_bbox = getBBox;

PB.shapes['__freehand'] = {
  key: '__freehand', cat: '__sys', geom: 'path', label: '画笔', hidden: true, icon: '',
  draw: function (c, o) {
    const pts = o.points;
    if (!pts || !pts.length) return;
    if (pts.length === 1) {
      c.beginPath();
      c.arc(pts[0].x, pts[0].y, Math.max(1, (o.size||3)/2), 0, Math.PI*2);
      c.fillStyle = o.color || '#e6edf7';
      c.fill();
      return;
    }
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i+1].x) / 2;
      const my = (pts[i].y + pts[i+1].y) / 2;
      c.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const last = pts[pts.length-1];
    c.lineTo(last.x, last.y);
    c.stroke();
  }
};

/* =====================================================================
 * 5. IndexedDB
 * ===================================================================== */
const IDB_NAME = 'physboard-fs', IDB_STORE = 'handles';
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => { const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key, val) {
  try {
    const db = await idbOpen();
    await new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(val, key);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (e) {}
}
async function idbGet(key) {
  try {
    const db = await idbOpen();
    return await new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  } catch (e) { return null; }
}

/* =====================================================================
 * 6. 遮罩工具
 * ===================================================================== */
function ensureMask(o) {
  if (o._mask) return o._mask;
  const bb = getBBox(o);
  const pad = MASK_PAD;
  const w = Math.max(1, Math.ceil((bb.w + pad * 2) * MASK_SCALE));
  const h = Math.max(1, Math.ceil((bb.h + pad * 2) * MASK_SCALE));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  o._mask = cv;
  o._maskPad = pad;
  return cv;
}
function cloneCanvas(src) {
  const cv = document.createElement('canvas');
  cv.width = src.width; cv.height = src.height;
  cv.getContext('2d').drawImage(src, 0, 0);
  return cv;
}
function thresholdMask(mask) {
  try {
    const mctx = mask.getContext('2d');
    const w = mask.width, h = mask.height;
    const img = mctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) {
      d[i] = d[i] >= 128 ? 255 : 0;
    }
    mctx.putImageData(img, 0, 0);
  } catch (e) {}
}
function getMaskMapping(o) {
  const bb = getBBox(o);
  const pad = o._maskPad || MASK_PAD;
  const mask = o._mask;
  const worldX1 = bb.x1 - pad;
  const worldY1 = bb.y1 - pad;
  const worldW = bb.w + pad * 2;
  const worldH = bb.h + pad * 2;
  return {
    worldX1, worldY1, worldW, worldH,
    scX: mask.width / worldW,
    scY: mask.height / worldH
  };
}
function applyEraseToObj(o, worldPt, radius) {
  if (!o._mask) return;
  const ctr = objCenter(o);
  const rot = o.rotation || 0;
  const lp = rotatePt(worldPt, ctr, -rot);
  const mask = o._mask;
  const mctx = mask.getContext('2d');
  const m = getMaskMapping(o);

  const mx = (lp.x - m.worldX1) * m.scX;
  const my = (lp.y - m.worldY1) * m.scY;
  const mrx = radius * m.scX;
  const mry = radius * m.scY;

  if (mx + mrx < 0 || my + mry < 0 || mx - mrx > mask.width || my - mry > mask.height) return;

  mctx.save();
  mctx.fillStyle = '#fff';
  mctx.beginPath();
  if (Math.abs(mrx - mry) < 0.5) {
    mctx.arc(mx, my, mrx, 0, Math.PI * 2);
  } else {
    mctx.ellipse(mx, my, mrx, mry, 0, 0, Math.PI * 2);
  }
  mctx.fill();
  mctx.restore();
}
function remapMask(o, oldBB, anchor, sx, sy) {
  if (!o._mask) return;
  if (!(sx > 0) || !(sy > 0)) return;
  const maskPad = o._maskPad || MASK_PAD;
  const oldMask = o._mask;

  const oldWorldX1 = oldBB.x1 - maskPad;
  const oldWorldY1 = oldBB.y1 - maskPad;
  const oldWorldW = oldBB.w + maskPad * 2;
  const oldWorldH = oldBB.h + maskPad * 2;

  const newBB = getBBox(o);
  const newWorldX1 = newBB.x1 - maskPad;
  const newWorldY1 = newBB.y1 - maskPad;
  const newWorldW = newBB.w + maskPad * 2;
  const newWorldH = newBB.h + maskPad * 2;

  const newMaskW = Math.max(1, Math.round(oldMask.width * (newWorldW / oldWorldW)));
  const newMaskH = Math.max(1, Math.round(oldMask.height * (newWorldH / oldWorldH)));

  const newMask = document.createElement('canvas');
  newMask.width = newMaskW;
  newMask.height = newMaskH;
  const nctx = newMask.getContext('2d');

  const kx = newWorldW / newMaskW;
  const ky = newWorldH / newMaskH;

  const a_x = (kx / sx / oldWorldW) * oldMask.width;
  const b_x = ((anchor.x - oldWorldX1) + (newWorldX1 - anchor.x) / sx) / oldWorldW * oldMask.width;
  const a_y = (ky / sy / oldWorldH) * oldMask.height;
  const b_y = ((anchor.y - oldWorldY1) + (newWorldY1 - anchor.y) / sy) / oldWorldH * oldMask.height;

  if (!isFinite(a_x) || !isFinite(a_y) || a_x === 0 || a_y === 0) return;

  const inv_a_x = 1 / a_x, inv_b_x = -b_x / a_x;
  const inv_a_y = 1 / a_y, inv_b_y = -b_y / a_y;

  try {
    nctx.setTransform(inv_a_x, 0, 0, inv_a_y, inv_b_x, inv_b_y);
    nctx.drawImage(oldMask, 0, 0);
  } catch (e) {
    return;
  }
  o._mask = newMask;
}
function findObjectsAt(worldPt, radius) {
  const result = [];
  for (const o of objects) if (hitTestErase(o, worldPt, radius)) result.push(o);
  return result;
}
function hitTestErase(o, pt, radius) {
  const ctr = objCenter(o);
  const rot = o.rotation || 0;
  const lp = rotatePt(pt, ctr, -rot);
  const pad = (o.size || 4) * 0.7 + radius;
  const def = PB.shapes[o.type];
  if (o.points) {
    if (o.points.length === 1) return Math.hypot(lp.x - o.points[0].x, lp.y - o.points[0].y) < pad;
    const step = Math.max(1, Math.floor(o.points.length / 200));
    for (let i = step; i < o.points.length; i += step) {
      if (distToSeg(lp, o.points[i-step], o.points[i]) < pad) return true;
    }
    return false;
  }
  if (def && def.geom === 'line') return distToSeg(lp, {x:o.x1,y:o.y1}, {x:o.x2,y:o.y2}) < pad;
  const b = getBBox(o);
  return lp.x >= b.x1 - pad && lp.x <= b.x2 + pad &&
         lp.y >= b.y1 - pad && lp.y <= b.y2 + pad;
}
function getEraserRadius(e) {
  let base = 22;
  if (e && (e.pointerType === 'touch' || e.pointerType === 'pen')) {
    const w = e.width || 0;
    if (w > 1) {
      base = Math.max(14, Math.min(90, w * 0.75));
    } else {
      base = 26;
    }
    if (e.pressure && e.pressure > 0.01 && e.pressure < 1) {
      base *= (0.6 + e.pressure * 0.8);
    }
  }
  return base * eraserSizeMul;
}

/* =====================================================================
 * 7. 画布尺寸
 * ===================================================================== */
function resize() {
  W = window.innerWidth; H = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  [board, preview].forEach(cv => {
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
  });
  render(); drawPreview(); updateSelBarPosition();
  if (typeof positionTextEditor === 'function') positionTextEditor();
}
window.addEventListener('resize', resize);

/* =====================================================================
 * 8. 渲染
 * ===================================================================== */
function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  for (const o of objects) drawObject(ctx, o);
}
function drawPreview() {
  pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  pctx.clearRect(0, 0, W, H);
  if (current) {
    drawObject(pctx, current);
    drawAngleHint(pctx, current);
  }
  drawSelectionOverlay();
  drawEraserCursor();
  drawSnapIndicator();
}
function drawObjectRaw(c, o) {
  const def = PB.shapes[o.type];
  if (!def || !def.draw) return;
  c.save();
  c.lineCap = 'round'; c.lineJoin = 'round';
  const lw = o.size || 4;
  c.lineWidth = lw;
  if (o.dash === 'dashed') c.setLineDash([lw * 2.6, lw * 2.2]);
  else if (o.dash === 'center') c.setLineDash([lw * 6, lw * 2.6, lw * 1, lw * 2.6]);
  else c.setLineDash([]);
  c.strokeStyle = (o.hasBorder === false) ? 'rgba(0,0,0,0)' : (o.color || '#e6edf7');
  const prev = U._cur;
  U._cur = o;
  const prevT = animState.t, prevP = animState.playing, prevS = animState.speed;
  if (def.animatable) {
    ensureAnimFields(o);
    animState.t = o.animT;
    animState.playing = o.animPlaying;
    animState.speed = o.animSpeed;
  }
  try { def.draw(c, o, U); }
  finally {
    U._cur = prev;
    animState.t = prevT; animState.playing = prevP; animState.speed = prevS;
  }
  c.restore();
}
let _tmpCanvas = null;
function getTmpCanvas(w, h) {
  if (!_tmpCanvas) _tmpCanvas = document.createElement('canvas');
  if (_tmpCanvas.width !== w) _tmpCanvas.width = w;
  if (_tmpCanvas.height !== h) _tmpCanvas.height = h;
  return _tmpCanvas;
}
function drawObject(c, o) {
  const def = PB.shapes[o.type];
  if (!def || !def.draw) return;
  if (!o._mask) {
    c.save();
    if (o.rotation) {
      const ctr = objCenter(o);
      c.translate(ctr.x, ctr.y); c.rotate(o.rotation); c.translate(-ctr.x, -ctr.y);
    }
    drawObjectRaw(c, o);
    c.restore();
    return;
  }
  const bb = getBBox(o);
  const maskPad = o._maskPad || MASK_PAD;
  const lx = bb.x1 - maskPad;
  const ly = bb.y1 - maskPad;
  const lw = bb.w + maskPad * 2;
  const lh = bb.h + maskPad * 2;
  const rs = dpr;
  const cw = Math.max(1, Math.ceil(lw * rs));
  const ch = Math.max(1, Math.ceil(lh * rs));
  const tmp = getTmpCanvas(cw, ch);
  const tctx = tmp.getContext('2d');
  tctx.setTransform(1, 0, 0, 1, 0, 0);
  tctx.clearRect(0, 0, cw, ch);
  tctx.setTransform(rs, 0, 0, rs, 0, 0);
  tctx.translate(-lx, -ly);
  drawObjectRaw(tctx, o);
  tctx.setTransform(1, 0, 0, 1, 0, 0);
  tctx.globalCompositeOperation = 'destination-out';
  tctx.imageSmoothingEnabled = true;
  try { tctx.drawImage(o._mask, 0, 0, cw, ch); } catch (err) {}
  tctx.globalCompositeOperation = 'source-over';
  c.save();
  if (o.rotation) {
    const ctr = objCenter(o);
    c.translate(ctr.x, ctr.y); c.rotate(o.rotation); c.translate(-ctr.x, -ctr.y);
  }
  c.drawImage(tmp, 0, 0, cw, ch, lx, ly, lw, lh);
  c.restore();
}
function drawEraserCursor() {
  if (state.tool !== 'eraser') return;
  if (!lastHoverPt) return;
  pctx.save();
  pctx.strokeStyle = 'rgba(248,113,113,.85)';
  pctx.fillStyle = 'rgba(248,113,113,.12)';
  pctx.lineWidth = 2;
  pctx.beginPath();
  pctx.arc(lastHoverPt.x, lastHoverPt.y, lastEraserRadius, 0, Math.PI * 2);
  pctx.fill();
  pctx.stroke();
  pctx.restore();
}

/* 绘制时的实时角度提示 */
function drawAngleHint(c, o) {
  if (!o) return;
  if (o.points) return;
  if (o.x1 === undefined || o.x2 === undefined) return;

  const def = PB.shapes[o.type];
  const isLineShape = !!(def && def.geom === 'line');
  const isRightTri  = (o.type === 'rightTriangle');
  if (!isLineShape && !isRightTri) return;

  const dx = o.x2 - o.x1;
  const dy = o.y2 - o.y1;
  const len = Math.hypot(dx, dy);
  if (len < 14) return;
  let angDeg;
  let isSpecial = false;

  if (isRightTri) {
    angDeg = Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI;
    const TRI_SPECIAL = [30, 37, 45, 53, 60];
    for (let i = 0; i < TRI_SPECIAL.length; i++) {
      if (Math.abs(angDeg - TRI_SPECIAL[i]) < 1.2) { isSpecial = true; break; }
    }
  } else {
    angDeg = Math.atan2(-dy, dx) * 180 / Math.PI;
    if (angDeg < 0) angDeg += 360;
    if (angDeg >= 360) angDeg -= 360;
    const SPECIAL = LINE_SNAP_ANGLES;
    for (let i = 0; i < SPECIAL.length; i++) {
      const a = SPECIAL[i];
      if (Math.abs(angDeg - a) < 1.2) { isSpecial = true; break; }
      if (Math.abs(angDeg - (360 - a)) < 1.2) { isSpecial = true; break; }
    }
  }

  const mx = (o.x1 + o.x2) / 2;
  const my = (o.y1 + o.y2) / 2;
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;
  const offset = 26;

  let tx = mx + nx * offset;
  let ty = my + ny * offset;

  const text = angDeg.toFixed(1) + '°';
  c.save();
  c.font = '600 15px ui-monospace,Menlo,Consolas,monospace';
  const tw = c.measureText(text).width;
  const padX = 10, padY = 6;
  const bw = tw + padX * 2;
  const bh = 15 + padY * 2;

  if (tx - bw / 2 < 8) tx = 8 + bw / 2;
  if (tx + bw / 2 > W - 8) tx = W - 8 - bw / 2;
  if (ty - bh / 2 < 8) ty = 8 + bh / 2;
  if (ty + bh / 2 > H - 8) ty = H - 8 - bh / 2;

  const rx = tx - bw / 2, ry = ty - bh / 2;
  const r = 8;
  c.beginPath();
  c.moveTo(rx + r, ry);
  c.lineTo(rx + bw - r, ry);
  c.quadraticCurveTo(rx + bw, ry, rx + bw, ry + r);
  c.lineTo(rx + bw, ry + bh - r);
  c.quadraticCurveTo(rx + bw, ry + bh, rx + bw - r, ry + bh);
  c.lineTo(rx + r, ry + bh);
  c.quadraticCurveTo(rx, ry + bh, rx, ry + bh - r);
  c.lineTo(rx, ry + r);
  c.quadraticCurveTo(rx, ry, rx + r, ry);
  c.closePath();

  if (isSpecial) {
    c.fillStyle = 'rgba(56,189,248,.95)';
    c.strokeStyle = 'rgba(186,230,253,1)';
    c.shadowColor = 'rgba(56,189,248,.85)';
    c.shadowBlur = 14;
  } else {
    c.fillStyle = 'rgba(16,26,44,.92)';
    c.strokeStyle = 'rgba(56,189,248,.55)';
    c.shadowColor = 'rgba(56,189,248,.35)';
    c.shadowBlur = 8;
  }
  c.lineWidth = 1.6;
  c.fill();
  c.stroke();
  c.shadowBlur = 0;

  c.fillStyle = isSpecial ? '#ffffff' : '#7dd3fc';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text, tx, ty + 1);
  c.restore();
}

/* =====================================================================
 * 9. 命中检测
 * ===================================================================== */
function hitTest(o, pt) {
  const ctr = objCenter(o);
  const rot = o.rotation || 0;
  const lp = rotatePt(pt, ctr, -rot);
  const pad = Math.max(7, (o.size || 4) * 0.7);
  const def = PB.shapes[o.type];
  if (o.points) {
    if (o.points.length === 1) return Math.hypot(lp.x - o.points[0].x, lp.y - o.points[0].y) < pad + 7;
    const step = Math.max(1, Math.floor(o.points.length / 200));
    for (let i = step; i < o.points.length; i += step) {
      if (distToSeg(lp, o.points[i-step], o.points[i]) < pad + 7) return true;
    }
    return false;
  }
  if (def && def.geom === 'line') return distToSeg(lp, {x:o.x1,y:o.y1}, {x:o.x2,y:o.y2}) < pad + 7;
  const b = getBBox(o);
  return lp.x >= b.x1 - pad && lp.x <= b.x2 + pad &&
         lp.y >= b.y1 - pad && lp.y <= b.y2 + pad;
}
function getHandles(o) {
  const b = getBBox(o);
  const cx = (b.x1 + b.x2) / 2, cy = (b.y1 + b.y2) / 2;
  const rot = o.rotation || 0;
  const ctr = { x:cx, y:cy };
  const local = [
    { id:'nw', x:b.x1, y:b.y1 }, { id:'n', x:cx, y:b.y1 }, { id:'ne', x:b.x2, y:b.y1 },
    { id:'e',  x:b.x2, y:cy   }, { id:'se', x:b.x2, y:b.y2 }, { id:'s', x:cx, y:b.y2 },
    { id:'sw', x:b.x1, y:b.y2 }, { id:'w', x:b.x1, y:cy }
  ];
  const out = local.map(p => {
    const w = rotatePt(p, ctr, rot);
    return { id:p.id, x:w.x, y:w.y };
  });
  const rp = rotatePt({ x:cx, y:b.y1 - 36 }, ctr, rot);
  out.push({ id:'rotate', x:rp.x, y:rp.y });
  return out;
}
function hitHandle(o, pt) {
  for (const h of getHandles(o)) {
    const r = h.id === 'rotate' ? 16 : 11;
    if (Math.hypot(h.x - pt.x, h.y - pt.y) < r) return h;
  }
  return null;
}
function getVertices(o) {
  if (o.points) return o.points.map(p => ({x:p.x, y:p.y}));
  const def = PB.shapes[o.type];
  if (def && def.geom === 'line') return [{x:o.x1, y:o.y1}, {x:o.x2, y:o.y2}];
  return null;
}
function hitVertex(o, pt) {
  const verts = getVertices(o);
  if (!verts) return null;
  const ctr = objCenter(o);
  const rot = o.rotation || 0;
  for (let i = 0; i < verts.length; i++) {
    const wp = rotatePt(verts[i], ctr, rot);
    if (Math.hypot(wp.x - pt.x, wp.y - pt.y) < 11) return i;
  }
  return null;
}

/* =====================================================================
 * 10. 选区绘制
 * ===================================================================== */
function drawSelectionOverlay() {
  if (marquee) {
    const m = normRect(marquee);
    pctx.save();
    pctx.fillStyle = 'rgba(56,189,248,.10)';
    pctx.strokeStyle = 'rgba(56,189,248,.85)';
    pctx.lineWidth = 1.2;
    pctx.setLineDash([5,4]);
    pctx.fillRect(m.x1, m.y1, m.w, m.h);
    pctx.strokeRect(m.x1, m.y1, m.w, m.h);
    pctx.restore();
  }
  if (!selection.length) return;
  if (selection.length > 1) {
    pctx.save();
    pctx.lineWidth = 1.1; pctx.setLineDash([4,3]);
    pctx.strokeStyle = 'rgba(56,189,248,.55)';
    for (const o of selection) {
      const b = getWorldBBox(o);
      pctx.strokeRect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1);
    }
    pctx.restore();
    const bb = unionBBox(selection);
    pctx.save();
    pctx.lineWidth = 1.6; pctx.setLineDash([7,4]);
    pctx.strokeStyle = '#38bdf8';
    pctx.shadowColor = 'rgba(56,189,248,.6)'; pctx.shadowBlur = 8;
    pctx.strokeRect(bb.x1, bb.y1, bb.x2 - bb.x1, bb.y2 - bb.y1);
    pctx.restore();
    return;
  }
  const o = selection[0];
  const b = getBBox(o);
  const cx = (b.x1 + b.x2) / 2, cy = (b.y1 + b.y2) / 2;
  const rot = o.rotation || 0;
  const ctr = { x:cx, y:cy };
  const corners = [
    {x:b.x1,y:b.y1},{x:b.x2,y:b.y1},{x:b.x2,y:b.y2},{x:b.x1,y:b.y2}
  ].map(p => rotatePt(p, ctr, rot));
  pctx.save();
  pctx.lineCap = 'round'; pctx.strokeStyle = '#38bdf8';
  pctx.lineWidth = 1.4; pctx.setLineDash([6,4]);
  pctx.shadowColor = 'rgba(56,189,248,.55)'; pctx.shadowBlur = 6;
  pctx.beginPath();
  corners.forEach((p, i) => i ? pctx.lineTo(p.x, p.y) : pctx.moveTo(p.x, p.y));
  pctx.closePath(); pctx.stroke();
  pctx.setLineDash([]); pctx.shadowBlur = 0;
  const verts = getVertices(o);
  if (verts) {
    pctx.fillStyle = '#0a1428'; pctx.strokeStyle = '#38bdf8'; pctx.lineWidth = 1.6;
    for (const v of verts) {
      const wp = rotatePt(v, ctr, rot);
      pctx.beginPath(); pctx.arc(wp.x, wp.y, 4.5, 0, Math.PI * 2); pctx.fill(); pctx.stroke();
    }
  }
  for (const h of getHandles(o)) {
    if (h.id === 'rotate') {
      const topMid = rotatePt({ x:cx, y:b.y1 }, ctr, rot);
      pctx.strokeStyle = '#38bdf8'; pctx.lineWidth = 1.4;
      pctx.beginPath(); pctx.moveTo(topMid.x, topMid.y); pctx.lineTo(h.x, h.y); pctx.stroke();
      pctx.beginPath(); pctx.arc(h.x, h.y, 7, 0, Math.PI * 2);
      pctx.fillStyle = '#0a1428'; pctx.fill(); pctx.stroke();
      pctx.beginPath(); pctx.arc(h.x, h.y, 3.6, -Math.PI * 0.85, Math.PI * 0.4); pctx.stroke();
    } else {
      pctx.beginPath(); pctx.rect(h.x - 5, h.y - 5, 10, 10);
      pctx.fillStyle = '#0a1428'; pctx.fill();
      pctx.strokeStyle = '#38bdf8'; pctx.lineWidth = 1.6; pctx.stroke();
    }
  }
  pctx.restore();
}

/* =====================================================================
 * 11. 动画系统
 * ===================================================================== */
const animState = { t: 0, playing: false, speed: 1 };
PB.animState = animState;
let animRaf = null, lastTs = 0;
function isAnimDef(def) { return !!(def && def.animatable); }
function isAnimObj(o) { return !!(o && isAnimDef(PB.shapes[o.type])); }
function ensureAnimFields(o) {
  if (typeof o.animT !== 'number') o.animT = 0;
  if (typeof o.animSpeed !== 'number') o.animSpeed = 1;
  if (typeof o.animPlaying !== 'boolean') o.animPlaying = false;
}
function anyAnimPlaying() {
  for (const o of objects) if (isAnimObj(o) && o.animPlaying) return true;
  return false;
}
function registerAnimParams() {
  if (!PB.paramDefs) PB.paramDefs = {};
  const defs = {
    animPeriod:{ label:'周期', min:0.5, max:10, step:0.1, def:2.0, unit:'s' },
    animSwing: { label:'摆角', min:5, max:90, step:1, def:45, unit:'°' },
    animAmp:   { label:'振幅', min:4, max:200, step:1, def:30 },
    animPhase: { label:'相位', min:0, max:360, step:1, def:0, unit:'°' },
    animAngle: { label:'抛射角', min:10, max:80, step:1, def:45, unit:'°' }
  };
  for (const k in defs) if (!PB.paramDefs[k]) PB.paramDefs[k] = defs[k];
}
function registerTextParams() {
  if (!PB.paramDefs) PB.paramDefs = {};
  if (!PB.paramDefs.fontFamily) {
    PB.paramDefs.fontFamily = {
      label:'字体', type:'select', def:'system',
      options: TEXT_FONTS.map(f => ({ value:f.id, label:f.label, css:f.css }))
    };
  }
  if (!PB.paramDefs.fontSize) {
    PB.paramDefs.fontSize = { label:'字号', type:'range', min:8, max:200, step:1, def:32 };
  }
  if (!PB.paramDefs.bold)      PB.paramDefs.bold      = { label:'加粗',   type:'toggle', def:false };
  if (!PB.paramDefs.italic)    PB.paramDefs.italic    = { label:'斜体',   type:'toggle', def:false };
  if (!PB.paramDefs.underline) PB.paramDefs.underline = { label:'下划线', type:'toggle', def:false };
  if (!PB.paramDefs.textAlign) {
    PB.paramDefs.textAlign = {
      label:'对齐', type:'select', def:'left',
      options: [
        { value:'left',   label:'左对齐' },
        { value:'center', label:'居中' },
        { value:'right',  label:'右对齐' }
      ]
    };
  }
}
function ensureTextShapes() {
  let found = false;
  for (const k in PB.shapes) {
    const s = PB.shapes[k];
    if (!s) continue;
    if (s.geom === 'text' || s.key === 'text') {
      s.geom = 'text';
      s.draw = drawTextShape;
      s.params = TEXT_PARAMS.slice();
      found = true;
    }
  }
  return found;
}

function animTick(ts) {
  if (!anyAnimPlaying()) {
    animRaf = null; lastTs = 0; updatePlayButtons(); return;
  }
  if (!lastTs) lastTs = ts;
  const dt = Math.min((ts - lastTs) / 1000, 0.05);
  lastTs = ts;
  for (const o of objects) {
    if (isAnimObj(o) && o.animPlaying) o.animT = (o.animT || 0) + dt * (o.animSpeed || 1);
  }
  render();
  animRaf = requestAnimationFrame(animTick);
}
function startAnimLoop() { if (animRaf != null) return; lastTs = 0; animRaf = requestAnimationFrame(animTick); }
function stopAnimLoop() { if (animRaf != null) { cancelAnimationFrame(animRaf); animRaf = null; } lastTs = 0; }
function playAnimAll() {
  const anims = objects.filter(isAnimObj);
  if (!anims.length) { toast('画布上还没有动画图形'); return; }
  for (const o of anims) { ensureAnimFields(o); o.animPlaying = true; }
  updatePlayButtons(); startAnimLoop(); render();
}
function pauseAnimAll() {
  let any = false;
  for (const o of objects) {
    if (isAnimObj(o) && o.animPlaying) { o.animPlaying = false; any = true; }
  }
  updatePlayButtons(); stopAnimLoop(); render();
  if (!any) toast('当前没有正在播放的动画');
}
function togglePlayAll() { if (anyAnimPlaying()) pauseAnimAll(); else playAnimAll(); }
function resetAnimAll() {
  animState.t = 0;
  for (const o of objects) if (isAnimObj(o)) o.animT = 0;
  render(); toast('动画时间已归零');
}
function toggleObjAnim(o) {
  ensureAnimFields(o);
  o.animPlaying = !o.animPlaying;
  if (o.animPlaying) startAnimLoop(); else if (!anyAnimPlaying()) stopAnimLoop();
  updatePlayButtons(); updateSelBar(); render();
}
function resetObjAnim(o) { ensureAnimFields(o); o.animT = 0; render(); }
function updatePlayButtons() {
  const playing = anyAnimPlaying();
  playAllBtn.style.display = playing ? 'none' : '';
  pauseAllBtn.style.display = playing ? '' : 'none';
}

/* =====================================================================
 * 12. 历史记录
 * ===================================================================== */
const MAX_SNAPSHOTS = 30;
function pushSnapshot() {
  snapshots = snapshots.slice(0, snapIndex + 1);
  snapshots.push({ pages: pages.map(pg => pg.map(copyObj)), pageIndex });
  snapIndex = snapshots.length - 1;
  if (snapshots.length > MAX_SNAPSHOTS) { snapshots.shift(); snapIndex--; }
  updateHistoryButtons();
}
function restoreSnapshot(s) {
  pages = s.pages.map(pg => pg.map(o => {
    const t = copyObj(o);
    if (o._mask) t._mask = cloneCanvas(o._mask);
    return t;
  }));
  pageIndex = Math.min(s.pageIndex, pages.length - 1);
  objects = pages[pageIndex];
  selection = [];
  updateSelBar(); updatePageUI(); render(); drawPreview(); updateHistoryButtons();
}
function undo() { if (snapIndex <= 0) return; snapIndex--; restoreSnapshot(snapshots[snapIndex]); toast('已撤销'); }
function redo() { if (snapIndex >= snapshots.length - 1) return; snapIndex++; restoreSnapshot(snapshots[snapIndex]); toast('已重做'); }
function updateHistoryButtons() {
  undoBtn.disabled = snapIndex <= 0;
  redoBtn.disabled = snapIndex >= snapshots.length - 1;
}

/* =====================================================================
 * 13. 页面
 * ===================================================================== */
function updatePageUI() {
  pgLabel.textContent = (pageIndex + 1) + ' / ' + pages.length;
  document.getElementById('prevPage').disabled = pageIndex <= 0;
  document.getElementById('nextPage').disabled = pageIndex >= pages.length - 1;
  thumbCount.textContent = '共 ' + pages.length + ' 页';
}
function goPage(n) {
  if (n < 0 || n >= pages.length) return;
  pageIndex = n;
  objects = pages[pageIndex];
  selection = [];
  updateSelBar(); updatePageUI(); render(); drawPreview();
  if (thumbPanel.classList.contains('show')) {
    thumbScroll.querySelectorAll('.thumb-item').forEach((el, k) => {
      el.classList.toggle('active', k === pageIndex);
    });
  }
}
function addPage() {
  pages.push([]);
  pageIndex = pages.length - 1;
  objects = pages[pageIndex];
  selection = [];
  updateSelBar(); updatePageUI(); render(); drawPreview(); pushSnapshot();
  if (thumbPanel.classList.contains('show')) buildThumbnails();
  toast('已新建第 ' + pages.length + ' 页');
}
function deletePage(idx) {
  if (typeof idx !== 'number' || idx < 0 || idx >= pages.length) return;

  if (pages.length <= 1) {
    if (!pages[0].length) { toast('已经是空白页了'); return; }
    pages[0].length = 0;
    objects = pages[0];
    selection = [];
    pushSnapshot();
    updateSelBar(); updatePageUI(); render(); drawPreview();
    if (thumbPanel.classList.contains('show')) buildThumbnails();
    toast('已清空本页（Ctrl+Z 可撤销）');
    return;
  }

  const no = idx + 1;
  pages.splice(idx, 1);
  if (pageIndex >= pages.length) pageIndex = pages.length - 1;
  else if (idx < pageIndex) pageIndex--;

  objects = pages[pageIndex];
  selection = [];

  pushSnapshot();
  updateSelBar(); updatePageUI(); render(); drawPreview();
  if (thumbPanel.classList.contains('show')) buildThumbnails();
  toast('已删除第 ' + no + ' 页（Ctrl+Z 可撤销）');
}

/* =====================================================================
 * 14. Toast
 * ===================================================================== */
let toastTimer = null;
function toast(msg, ms) {
  let el = document.getElementById('__toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '__toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.opacity = '0'; }, ms || 2200);
}

/* =====================================================================
 * 15. 工具切换
 * ===================================================================== */
function isShapeTool(t) {
  return t !== 'select' && t !== 'pen' && t !== 'eraser' &&
         !!PB.shapes[t] && !PB.shapes[t].hidden;
}
function setTool(t, noAutoPanel) {
  if (textEditorEl && t !== state.tool) commitTextEditor();
  state.tool = t;
  const isShape = isShapeTool(t);
  document.querySelectorAll('.dbtn[data-tool]').forEach(b => {
    b.classList.toggle('active', b.dataset.tool === t);
  });
  document.getElementById('shapeBtn').classList.toggle('active', isShape);
  if (noAutoPanel) {
    penPanel.classList.remove('show');
    if (!isShape) shapePanel.classList.remove('show');
  } else {
    penPanel.classList.toggle('show', t === 'pen');
    shapePanel.classList.toggle('show', isShape);
  }
  if (isShape) {
    const def = PB.shapes[t];
    if (def && def.cat) state.shapeCat = def.cat;
    buildShapePanel();
  }
  if (t !== 'select') { selection = []; hideSubPanels(); updateSelBar(); }
  updateToolHighlight();
  setCursor(t === 'select' ? 'default' : (t === 'eraser' ? 'none' : 'crosshair'));
  drawPreview();
}
function updateToolHighlight() {
  document.querySelectorAll('.shape-cell').forEach(b => {
    b.classList.toggle('active', b.dataset.shape === state.tool);
  });
}
function setCursor(cur) { board.style.cursor = cur; }

/* =====================================================================
 * 16. 形状面板
 * ===================================================================== */
function getCategories() {
  if (Array.isArray(PB.categories) && PB.categories.length) {
    return PB.categories.filter(c => c.id !== '__sys');
  }
  const map = new Map();
  for (const k in PB.shapes) {
    const s = PB.shapes[k];
    if (s.hidden || s.cat === '__sys') continue;
    if (!map.has(s.cat)) map.set(s.cat, { id:s.cat, label:s.cat });
  }
  return [...map.values()];
}
function ensureCategoryList() {
  if (!Array.isArray(PB.categories) || !PB.categories.length) {
    const map = new Map();
    for (const k in PB.shapes) {
      const s = PB.shapes[k];
      if (s.hidden || s.cat === '__sys') continue;
      if (!map.has(s.cat)) map.set(s.cat, { id:s.cat, label:s.cat });
    }
    PB.categories = [...map.values()];
  }
}
function ensureCategory(id, label) {
  ensureCategoryList();
  if (!PB.categories.some(c => c.id === id)) {
    PB.categories.push({ id, label: label || id });
  }
}
function catHasShapes(catId) {
  for (const k in PB.shapes) {
    const s = PB.shapes[k];
    if (!s.hidden && s.cat === catId) return true;
  }
  return false;
}
function buildShapePanel() {
  const cats = getCategories().filter(c => catHasShapes(c.id));
  if (!state.shapeCat || !cats.some(c => c.id === state.shapeCat)) {
    state.shapeCat = cats.length ? cats[0].id : null;
  }
  catStrip.innerHTML = '';
  cats.forEach(c => {
    const b = document.createElement('button');
    b.className = 'cat-chip' + (c.id === state.shapeCat ? ' active' : '');
    b.textContent = c.label;
    b.addEventListener('click', () => { state.shapeCat = c.id; buildShapePanel(); });
    catStrip.appendChild(b);
  });
  attachCatDrag();
  shapeGrid.innerHTML = '';
  const frag = document.createDocumentFragment();
  let count = 0;
  for (const k in PB.shapes) {
    const s = PB.shapes[k];
    if (s.hidden || s.cat !== state.shapeCat) continue;
    count++;
    const b = document.createElement('button');
    b.className = 'shape-cell' + (state.tool === k ? ' active' : '');
    b.dataset.shape = k;
    b.title = s.label || k;
    b.innerHTML = renderShapeIcon(s.icon) + '<span>' + escapeHtml(s.label || k) + '</span>';
    b.addEventListener('click', () => {
      setTool(k);
      shapePanel.classList.remove('show');
    });
    frag.appendChild(b);
  }
  if (!count) {
    const d = document.createElement('div');
    d.className = 'shape-empty';
    d.textContent = '该类别下暂无图形';
    shapeGrid.appendChild(d);
  } else shapeGrid.appendChild(frag);
}
function attachCatDrag() {
  let isDown = false, startX = 0, scrollStart = 0, moved = false;
  catStrip.addEventListener('mousedown', e => {
    isDown = true; startX = e.clientX; scrollStart = catStrip.scrollLeft; moved = false;
    if (!e.target.closest('.cat-chip')) { catStrip.classList.add('grabbing'); e.preventDefault(); }
  });
  window.addEventListener('mousemove', e => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) { moved = true; catStrip.classList.add('grabbing'); }
    if (moved) catStrip.scrollLeft = scrollStart - dx;
  });
  window.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    catStrip.classList.remove('grabbing');
    if (moved) {
      const stopClick = ev => { ev.stopPropagation(); ev.preventDefault(); };
      catStrip.addEventListener('click', stopClick, { capture: true, once: true });
      setTimeout(() => catStrip.removeEventListener('click', stopClick, true), 0);
    }
  });
  catStrip.addEventListener('touchstart', e => {
    const t = e.touches[0];
    isDown = true; startX = t.clientX; scrollStart = catStrip.scrollLeft; moved = false;
  }, { passive: true });
  catStrip.addEventListener('touchmove', e => {
    if (!isDown) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    if (Math.abs(dx) > 5) moved = true;
    if (moved) catStrip.scrollLeft = scrollStart - dx;
  }, { passive: true });
  catStrip.addEventListener('touchend', () => {
    isDown = false;
    if (moved) {
      const stopClick = ev => { ev.stopPropagation(); ev.preventDefault(); };
      catStrip.addEventListener('click', stopClick, { capture: true, once: true });
      setTimeout(() => catStrip.removeEventListener('click', stopClick, true), 0);
    }
  });
}

function makeTouchScrollable(el) {
  if (!el) return;
  let activeId = null;
  let startX = 0, startY = 0, startTop = 0;
  let didScroll = false;

  el.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    activeId = t.identifier;
    startX = t.clientX;
    startY = t.clientY;
    startTop = el.scrollTop;
    didScroll = false;
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    if (activeId === null) return;
    let t = null;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === activeId) { t = e.touches[i]; break; }
    }
    if (!t) return;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    if (!didScroll) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        didScroll = true;
      } else if (Math.abs(dx) > 6) {
        activeId = null;
        return;
      } else {
        return;
      }
    }
    el.scrollTop = startTop - dy;
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  const endHandler = () => {
    if (didScroll) {
      const suppress = ev => { ev.stopPropagation(); ev.preventDefault(); };
      el.addEventListener('click', suppress, { capture: true, once: true });
      setTimeout(() => el.removeEventListener('click', suppress, true), 400);
    }
    activeId = null;
    didScroll = false;
  };
  el.addEventListener('touchend', endHandler);
  el.addEventListener('touchcancel', endHandler);
}

function renderShapeIcon(icon) {
  if (typeof icon === 'string' && icon.slice(0, 11) === 'data:image/') {
    return '<img src="' + icon + '" alt="" draggable="false">';
  }
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
         'stroke-linecap="round" stroke-linejoin="round">' + (icon || '') + '</svg>';
}
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* =====================================================================
 * 17. 选中标签栏
 * ===================================================================== */
function updateSelBar() {
  const show = selection.length > 0 && state.tool === 'select';
  if (!show) {
    selBar.classList.remove('show');
    hideSubPanels();
    cloneMode = false;
    document.getElementById('tagClone').classList.remove('active');
    return;
  }
  const one = selection.length === 1 ? selection[0] : null;
  const def = one ? PB.shapes[one.type] : null;
  const isAnim = !!(def && def.animatable);
  const hasParams = !!(def && def.params && def.params.length);
  const tagAnim = document.getElementById('tagAnim');
  const tagResetAnim = document.getElementById('tagResetAnim');
  const tagParams = document.getElementById('tagParams');
  const tagGroup = document.getElementById('tagGroup');
  const tagAnimIcon = document.getElementById('tagAnimIcon');
  const tagAnimText = document.getElementById('tagAnimText');
  tagAnim.style.display = isAnim ? '' : 'none';
  tagResetAnim.style.display = isAnim ? '' : 'none';
  tagParams.style.display = hasParams ? '' : 'none';
  tagGroup.style.display = selection.length >= 2 ? '' : 'none';
  if (isAnim) {
    ensureAnimFields(one);
    if (one.animPlaying) {
      tagAnimIcon.innerHTML = '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>';
      tagAnimText.textContent = '暂停';
      tagAnim.classList.add('anim-on');
    } else {
      tagAnimIcon.innerHTML = '<polygon points="7,5 19,12 7,19"/>';
      tagAnimText.textContent = '播放';
      tagAnim.classList.remove('anim-on');
    }
  }
  document.getElementById('tagBorder').classList.toggle('active', borderPanel.classList.contains('show'));
  document.getElementById('tagFill').classList.toggle('active', fillPanel.classList.contains('show'));
  document.getElementById('tagParams').classList.toggle('active', paramsPanel.classList.contains('show'));
  document.getElementById('tagClone').classList.toggle('active', cloneMode);
  selBar.classList.add('show');
  requestAnimationFrame(updateSelBarPosition);
}
function updateSelBarPosition() {
  if (!selBar.classList.contains('show')) return;
  const bb = selection.length === 1 ? getWorldBBox(selection[0]) : unionBBox(selection);
  const cx = (bb.x1 + bb.x2) / 2;
  const barW = selBar.offsetWidth || 320;
  const barH = selBar.offsetHeight || 52;
  let left = cx - barW / 2;
  let top = bb.y2 + 14;
  if (top + barH > window.innerHeight - 90) {
    const above = bb.y1 - barH - 14;
    if (above > 12) top = above;
    else top = Math.min(window.innerHeight - barH - 12, bb.y2 + 14);
  }
  if (left < 12) left = 12;
  if (left + barW > window.innerWidth - 12) left = window.innerWidth - barW - 12;
  selBar.style.left = left + 'px';
  selBar.style.top = top + 'px';
  if (borderPanel.classList.contains('show')) positionSubPanel(borderPanel);
  if (fillPanel.classList.contains('show')) positionSubPanel(fillPanel);
  if (paramsPanel.classList.contains('show')) positionSubPanel(paramsPanel);
}
function positionSubPanel(el) {
  requestAnimationFrame(() => {
    const barRect = selBar.getBoundingClientRect();
    const w = el.offsetWidth || 300;
    const h = el.offsetHeight || 200;
    let left = barRect.left + barRect.width / 2 - w / 2;
    let top = barRect.bottom + 10;
    if (top + h > window.innerHeight - 12) {
      const above = barRect.top - h - 10;
      if (above > 12) top = above;
      else top = Math.max(12, window.innerHeight - h - 12);
    }
    if (left < 12) left = 12;
    if (left + w > window.innerWidth - 12) left = window.innerWidth - w - 12;
    if (top < 12) top = 12;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  });
}
function hideSubPanels() {
  borderPanel.classList.remove('show');
  fillPanel.classList.remove('show');
  paramsPanel.classList.remove('show');
}
document.getElementById('tagAnim').addEventListener('click', () => {
  const one = selection[0];
  if (!one || !isAnimObj(one)) return;
  toggleObjAnim(one);
});
document.getElementById('tagResetAnim').addEventListener('click', () => {
  const one = selection[0];
  if (!one || !isAnimObj(one)) return;
  resetObjAnim(one);
});
document.getElementById('tagBorder').addEventListener('click', function () {
  const open = borderPanel.classList.contains('show');
  hideSubPanels();
  if (!open) { borderPanel.classList.add('show'); syncBorderUI(); positionSubPanel(borderPanel); }
  this.classList.toggle('active', !open);
  document.getElementById('tagFill').classList.remove('active');
  document.getElementById('tagParams').classList.remove('active');
});
document.getElementById('tagFill').addEventListener('click', function () {
  const open = fillPanel.classList.contains('show');
  hideSubPanels();
  if (!open) { fillPanel.classList.add('show'); syncFillUI(); positionSubPanel(fillPanel); }
  this.classList.toggle('active', !open);
  document.getElementById('tagBorder').classList.remove('active');
  document.getElementById('tagParams').classList.remove('active');
});
document.getElementById('tagParams').addEventListener('click', function () {
  const open = paramsPanel.classList.contains('show');
  hideSubPanels();
  if (!open) { buildParamsPanel(); paramsPanel.classList.add('show'); positionSubPanel(paramsPanel); }
  this.classList.toggle('active', !open);
  document.getElementById('tagBorder').classList.remove('active');
  document.getElementById('tagFill').classList.remove('active');
});
document.getElementById('tagTop').addEventListener('click', () => {
  if (!selection.length) return;
  const sel = selection.slice();
  objects = objects.filter(o => sel.indexOf(o) < 0);
  objects.push(...sel);
  pages[pageIndex] = objects;
  pushSnapshot(); render(); drawPreview();
  toast('已置顶');
});
document.getElementById('tagClone').addEventListener('click', function () {
  cloneMode = !cloneMode;
  this.classList.toggle('active', cloneMode);
  if (cloneMode) {
    toast(selection.length > 1
      ? '克隆已开启：拖动选中的 ' + selection.length + ' 个图形，会整组复制'
      : '克隆已开启：拖动图形即可复制');
  } else {
    toast('克隆已关闭');
  }
});
document.getElementById('tagDelete').addEventListener('click', () => {
  if (!selection.length) return;
  const n = selection.length;
  objects = objects.filter(o => selection.indexOf(o) < 0);
  pages[pageIndex] = objects;
  selection = [];
  pushSnapshot(); updateSelBar(); render(); drawPreview();
  toast('已删除 ' + n + ' 个图形');
  if (!objects.length) setTool('pen', true);
});

/* =====================================================================
 * 17b. 文字编辑器
 * ===================================================================== */
let textEditorEl = null;
let textEditTarget = null;
let textEditIsNew = false;
let textEditOriginalText = '';
let committingText = false;

function startNewText(pt) {
  const type = state.tool;
  const def = PB.shapes[type];
  if (!def) return;
  const base = newBase(def);
  const o = {
    type: type,
    x: pt.x,
    y: pt.y,
    text: '',
    fontFamily: base.fontFamily || state.textFontFamily || 'system',
    fontSize: base.fontSize || state.textSize || 32,
    bold: (base.bold != null) ? base.bold : !!state.textBold,
    italic: (base.italic != null) ? base.italic : !!state.textItalic,
    underline: (base.underline != null) ? base.underline : !!state.textUnderline,
    textAlign: base.textAlign || 'left',
    color: base.color || state.penColor,
    size: base.size || state.penSize,
    hasBorder: true,
    dash: 'solid',
    fill: false,
    rotation: 0
  };
  measureText(o);
  objects.push(o);
  pages[pageIndex] = objects;
  render();
  openTextEditor(o, true);
}

function openTextEditor(o, isNew) {
  if (textEditorEl) commitTextEditor();
  if (!o) return;
  textEditTarget = o;
  textEditIsNew = !!isNew;
  textEditOriginalText = o.text || '';

  const el = document.createElement('div');
  el.className = 'text-editor';
  el.innerHTML =
    '<textarea class="te-input" spellcheck="false" placeholder="输入文字…（Ctrl+Enter 完成，Esc 取消）"></textarea>' +
    '<div class="te-bar">' +
      '<select class="te-font" title="字体"></select>' +
      '<input type="number" class="te-size" min="6" max="400" step="1" title="字号">' +
      '<button class="te-btn" data-b="bold" title="加粗">B</button>' +
      '<button class="te-btn" data-b="italic" title="斜体" style="font-style:italic;">I</button>' +
      '<button class="te-btn" data-b="underline" title="下划线" style="text-decoration:underline;">U</button>' +
      '<span class="te-sep"></span>' +
      '<button class="te-btn" data-a="left" title="左对齐">⇤</button>' +
      '<button class="te-btn" data-a="center" title="居中">⇔</button>' +
      '<button class="te-btn" data-a="right" title="右对齐">⇥</button>' +
      '<span class="te-sep"></span>' +
      '<input type="color" class="te-color" title="颜色">' +
      '<button class="te-btn te-ok" data-b="ok" title="完成">✓</button>' +
      '<button class="te-btn te-cancel" data-b="cancel" title="取消">✕</button>' +
    '</div>';
  document.body.appendChild(el);
  textEditorEl = el;

  const fontSel = el.querySelector('.te-font');
  TEXT_FONTS.forEach(f => {
    const op = document.createElement('option');
    op.value = f.id; op.textContent = f.label;
    op.style.fontFamily = f.css;
    fontSel.appendChild(op);
  });
  fontSel.value = o.fontFamily || 'system';

  const ta = el.querySelector('.te-input');
  const sizeInp = el.querySelector('.te-size');
  const colorInp = el.querySelector('.te-color');

  ta.value = o.text || '';
  sizeInp.value = o.fontSize || 32;
  colorInp.value = toHexColor(o.color || '#e6edf7');

  function syncBtns() {
    el.querySelectorAll('[data-b]').forEach(b => {
      const k = b.dataset.b;
      if (k === 'bold') b.classList.toggle('on', !!o.bold);
      if (k === 'italic') b.classList.toggle('on', !!o.italic);
      if (k === 'underline') b.classList.toggle('on', !!o.underline);
    });
    el.querySelectorAll('[data-a]').forEach(b => {
      b.classList.toggle('on', (o.textAlign || 'left') === b.dataset.a);
    });
  }
  syncBtns();

  function refresh() {
    measureText(o);
    render();
    positionTextEditor();
  }

  ta.addEventListener('input', () => {
    o.text = ta.value;
    refresh();
  });
  ta.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); cancelTextEditor(); }
    else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); commitTextEditor(); }
  });

  fontSel.addEventListener('change', () => {
    o.fontFamily = fontSel.value;
    refresh();
  });
  sizeInp.addEventListener('input', () => {
    o.fontSize = Math.max(6, Math.min(400, parseInt(sizeInp.value, 10) || 32));
    refresh();
  });
  colorInp.addEventListener('input', () => {
    o.color = colorInp.value;
    refresh();
  });

  el.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const b = btn.dataset.b, a = btn.dataset.a;
    if (b === 'ok') { commitTextEditor(); return; }
    if (b === 'cancel') { cancelTextEditor(); return; }
    if (b === 'bold') { o.bold = !o.bold; }
    if (b === 'italic') { o.italic = !o.italic; }
    if (b === 'underline') { o.underline = !o.underline; }
    if (a) { o.textAlign = a; }
    syncBtns();
    refresh();
    ta.focus();
  });

  positionTextEditor();
  requestAnimationFrame(() => { try { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) {} });
}

function positionTextEditor() {
  if (!textEditorEl || !textEditTarget) return;
  const o = textEditTarget;
  const bb = getWorldBBox(o);
  const w = textEditorEl.offsetWidth || 420;
  const h = textEditorEl.offsetHeight || 160;
  let left = bb.x1;
  let top = bb.y2 + 12;
  if (top + h > window.innerHeight - 12) {
    const above = bb.y1 - h - 12;
    top = above > 12 ? above : Math.max(12, window.innerHeight - h - 12);
  }
  if (left + w > window.innerWidth - 12) left = window.innerWidth - w - 12;
  if (left < 12) left = 12;
  textEditorEl.style.left = left + 'px';
  textEditorEl.style.top = top + 'px';
}

function commitTextEditor() {
  if (committingText) return;
  committingText = true;
  try {
    const el = textEditorEl;
    const o = textEditTarget;
    const isNew = textEditIsNew;
    textEditorEl = null;
    textEditTarget = null;
    textEditIsNew = false;
    if (!el) return;
    el.remove();

    if (!o) { setTool('select'); return; }

    const txt = String(o.text == null ? '' : o.text).replace(/\s+$/, '');

    if (!txt) {
      objects = objects.filter(x => x !== o);
      pages[pageIndex] = objects;
      selection = selection.filter(x => x !== o);
      setTool('select');
      updateSelBar(); render(); drawPreview();
      return;
    }

    o.text = txt;
    measureText(o);

    state.textFontFamily = o.fontFamily || 'system';
    state.textSize = o.fontSize || 32;
    state.textBold = !!o.bold;
    state.textItalic = !!o.italic;
    state.textUnderline = !!o.underline;

    pushSnapshot();

    if (isNew) selection = [o];
    else if (selection.indexOf(o) < 0) selection = [o];

    setTool('select');

    updateSelBar(); render(); drawPreview();
  } finally {
    committingText = false;
  }
}

function cancelTextEditor() {
  const el = textEditorEl;
  const o = textEditTarget;
  const isNew = textEditIsNew;
  const orig = textEditOriginalText;
  textEditorEl = null;
  textEditTarget = null;
  textEditIsNew = false;
  if (el) el.remove();

  if (!o) { setTool('select'); return; }

  if (isNew) {
    objects = objects.filter(x => x !== o);
    pages[pageIndex] = objects;
  } else {
    o.text = orig;
    measureText(o);
  }

  selection = selection.filter(x => x !== o);

  setTool('select');

  updateSelBar(); render(); drawPreview();
}

function toHexColor(c) {
  if (!c) return '#ffffff';
  if (c[0] === '#') {
    if (c.length === 4) return '#' + c[1]+c[1]+c[2]+c[2]+c[3]+c[3];
    return c.slice(0, 7);
  }
  const m = String(c).match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (m) {
    const h = n => (+n).toString(16).padStart(2, '0');
    return '#' + h(m[1]) + h(m[2]) + h(m[3]);
  }
  return '#ffffff';
}

/* =====================================================================
 * 17c. 组合为新图形
 * ===================================================================== */
(function () { try { idbGet('shapesJsHandle').then(h => { if (h) cachedShapesHandle = h; }); } catch (e) {} })();
/* ===== 组合图形持久化：IndexedDB ===== */
const CS_DB_NAME = 'physboard-custom-shapes';
const CS_DB_STORE = 'shapes';

function csOpenDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(CS_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CS_DB_STORE)) {
        db.createObjectStore(CS_DB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function csSaveRecord(rec) {
  try {
    const db = await csOpenDB();
    await new Promise((res, rej) => {
      const tx = db.transaction(CS_DB_STORE, 'readwrite');
      tx.objectStore(CS_DB_STORE).put(rec);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (e) {
    console.warn('保存组合图形失败:', e);
  }
}

async function csLoadAll() {
  try {
    const db = await csOpenDB();
    return await new Promise((res, rej) => {
      const tx = db.transaction(CS_DB_STORE, 'readonly');
      const req = tx.objectStore(CS_DB_STORE).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
  } catch (e) {
    console.warn('加载组合图形失败:', e);
    return [];
  }
}

async function csDeleteRecord(id) {
  try {
    const db = await csOpenDB();
    await new Promise((res, rej) => {
      const tx = db.transaction(CS_DB_STORE, 'readwrite');
      tx.objectStore(CS_DB_STORE).delete(id);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (e) {}
}

async function csRestoreAll() {
  const records = await csLoadAll();
  if (!records.length) return;
  let hasNewCat = false;
  for (const rec of records) {
    if (PB.shapes[rec.id]) continue;
    if (rec.catId) {
      const exists = (PB.categories || []).some(c => c.id === rec.catId);
      if (!exists) {
        ensureCategory(rec.catId, rec.catLabel || rec.catId);
        hasNewCat = true;
      }
    }
    PB.shapes[rec.id] = buildCustomDef({
      id: rec.id,
      label: rec.label,
      cat: rec.catId || 'custom',
      baseW: rec.baseW,
      baseH: rec.baseH,
      parts: rec.parts,
      icon: rec.icon
    });
  }
  if (hasNewCat) buildShapePanel();
  render();
}
function bakeRotation(t) {
  const rot = t.rotation || 0;
  if (!rot) return t;
  const b = getBBox(t);
  const c = { x:(b.x1+b.x2)/2, y:(b.y1+b.y2)/2 };
  if (t.points) t.points = t.points.map(p => rotatePt(p, c, rot));
  if (t.x1 !== undefined) {
    const a = rotatePt({x:t.x1,y:t.y1}, c, rot);
    const d = rotatePt({x:t.x2,y:t.y2}, c, rot);
    t.x1=a.x; t.y1=a.y; t.x2=d.x; t.y2=d.y;
  }
  if (isTextObj(t)) {
    const p = rotatePt({ x:t.x, y:t.y }, c, rot); t.x = p.x; t.y = p.y;
  }
  t.rotation = 0;
  return t;
}
function normalizePart(o, bx, by, bw, bh) {
  const t = copyObj(o);
  delete t._mask; delete t._maskPad;
  bakeRotation(t);
  const nx = v => (v - bx) / bw, ny = v => (v - by) / bh;
  if (t.points) t.points = t.points.map(p => ({ x:nx(p.x), y:ny(p.y) }));
  if (t.x1 !== undefined) {
    t.x1 = nx(t.x1); t.y1 = ny(t.y1); t.x2 = nx(t.x2); t.y2 = ny(t.y2);
  }
  if (isTextObj(t)) {
    t.x = nx(t.x); t.y = ny(t.y);
    t.fontSize = (t.fontSize || 24) / bh;
    delete t.tw; delete t.th;
  }
  delete t.rotation;
  delete t.animT; delete t.animPlaying; delete t.animSpeed;
  return t;
}
function makeCustomRecord(id, label, catId, objs, icon) {
  const bb = unionBBox(objs);
  const bw = Math.max(1, bb.x2 - bb.x1), bh = Math.max(1, bb.y2 - bb.y1);
  const parts = objs.map(o => normalizePart(o, bb.x1, bb.y1, bw, bh));
  return { id, label, cat: catId, baseW: bw, baseH: bh, parts, icon: icon || CUSTOM_ICON };
}
function generateIconDataURL(rec, targetSize) {
  targetSize = targetSize || 56;
  const dprI = 2, S = Math.round(targetSize * dprI);
  const cv = document.createElement('canvas');
  cv.width = S; cv.height = S;
  const c = cv.getContext('2d');
  c.lineCap = 'round'; c.lineJoin = 'round';
  const pad = S * 0.14;
  const W2 = S - pad * 2, H2 = S - pad * 2;
  const scale = Math.min(W2 / rec.baseW, H2 / rec.baseH);
  const bw = rec.baseW * scale, bh = rec.baseH * scale;
  const offsetX = (S - bw) / 2, offsetY = (S - bh) / 2;
  const toX = nx => offsetX + nx * bw, toY = ny => offsetY + ny * bh;
  const prevCur = U._cur;
  try {
    for (const p of rec.parts) {
      const def = PB.shapes[p.type];
      if (!def || !def.draw) continue;
      const tmp = Object.assign({}, p);
      tmp.size = Math.max(1, (p.size || 4) * scale);
      if (p.points) tmp.points = p.points.map(q => ({ x: toX(q.x), y: toY(q.y) }));
      if (p.x1 !== undefined) {
        tmp.x1 = toX(p.x1); tmp.y1 = toY(p.y1);
        tmp.x2 = toX(p.x2); tmp.y2 = toY(p.y2);
      }
      if (isTextObj(p)) {
        tmp.x = toX(p.x); tmp.y = toY(p.y);
        tmp.fontSize = Math.max(4, (p.fontSize || 0.15) * bh);
        tmp.tw = null; tmp.th = null;
        measureText(tmp);
      }
      c.save();
      c.lineWidth = tmp.size;
      c.strokeStyle = tmp.color || '#e6edf7';
      if (tmp.fill) c.fillStyle = U.alpha(tmp.color || '#e6edf7', 0.16);
      const prevU = U._cur;
      U._cur = tmp;
      try { def.draw(c, tmp, U); } catch (err) {} finally { U._cur = prevU; }
      c.restore();
    }
  } finally { U._cur = prevCur; }
  try { return cv.toDataURL('image/png'); } catch (e) { return CUSTOM_ICON; }
}
function buildCustomDef(rec) {
  return {
    key: rec.id, cat: rec.cat, geom: 'rect',
    label: rec.label, icon: rec.icon || CUSTOM_ICON,
    custom: true, baseW: rec.baseW, baseH: rec.baseH, parts: rec.parts,
    draw(c, o, U2) {
      const w = o.x2 - o.x1, h = o.y2 - o.y1;
      const aw = Math.abs(w), ah = Math.abs(h);
      if (aw < 1 || ah < 1) return;
      const k = Math.min(aw / this.baseW, ah / this.baseH);
      const X = nx => o.x1 + nx * w, Y = ny => o.y1 + ny * h;
      const overrideFill = (o.fillColor && o.color && o.fillColor !== o.color) ? o.fillColor : null;
      for (const p of this.parts) {
        const def = PB.shapes[p.type];
        if (!def || !def.draw) continue;
        const tmp = Object.assign({}, p);
        tmp.size = Math.max(0.4, (p.size || 4) * k);
        if (p.points) tmp.points = p.points.map(q => ({ x:X(q.x), y:Y(q.y) }));
        if (p.x1 !== undefined) {
          tmp.x1 = X(p.x1); tmp.y1 = Y(p.y1);
          tmp.x2 = X(p.x2); tmp.y2 = Y(p.y2);
        }
        if (isTextObj(p)) {
          tmp.x = X(p.x); tmp.y = Y(p.y);
          tmp.fontSize = Math.max(6, (p.fontSize || 0.15) * ah);
          tmp.tw = null; tmp.th = null;
          measureText(tmp);
        }
        if (overrideFill) tmp.fillColor = overrideFill;
        c.save();
        c.lineCap = 'round'; c.lineJoin = 'round';
        c.lineWidth = tmp.size;
        c.strokeStyle = (o.hasBorder === false) ? 'rgba(0,0,0,0)' : (tmp.color || '#e6edf7');
        if (tmp.fill) c.fillStyle = U2.alpha(tmp.color || '#e6edf7', 0.16);
        const prevU = U2._cur;
        U2._cur = tmp;
        try { def.draw(c, tmp, U2); } catch (err) {} finally { U2._cur = prevU; }
        c.restore();
      }
    }
  };
}

/* ---- 组合弹窗 UI ---- */
const groupModal = document.getElementById('groupModal');
const gmName = document.getElementById('gmName');
const gmCat = document.getElementById('gmCat');
const gmNewCatField = document.getElementById('gmNewCatField');
const gmCatId = document.getElementById('gmCatId');
const gmCatLabel = document.getElementById('gmCatLabel');
const gmCount = document.getElementById('gmCount');
const gmTip = document.getElementById('gmTip');
const gmOk = document.getElementById('gmOk');
const gmCancel = document.getElementById('gmCancel');
const gmIconPrev = document.getElementById('gmIconPreview');

let gmSelection = [];
let gmPreviewRec = null;

function countCustomShapes() {
  let n = 0;
  for (const k in PB.shapes) if (PB.shapes[k].custom) n++;
  return n;
}
function refreshGmIconPreview() {
  const choice = (document.querySelector('input[name=gmIcon]:checked') || {}).value || 'auto';
  if (choice === 'generic' || !gmPreviewRec) {
    gmIconPrev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + CUSTOM_ICON + '</svg>';
    return;
  }
  let url = CUSTOM_ICON;
  try { url = generateIconDataURL(gmPreviewRec, 56); } catch (e) { url = CUSTOM_ICON; }
  if (typeof url === 'string' && url.slice(0, 11) === 'data:image/') {
    gmIconPrev.innerHTML = '<img src="' + url + '" alt="">';
  } else {
    gmIconPrev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + CUSTOM_ICON + '</svg>';
  }
}
function updateGmTip() {
  gmTip.innerHTML = '组合图形会保存到本机的用户数据目录中，<b>刷新和重启后仍然可用</b>。无需修改打包文件。';
  gmOk.textContent = '保存';
}
function openGroupModal() {
  if (selection.length < 2) { toast('请先选中至少两个图形'); return; }
  gmSelection = selection.slice();
  gmPreviewRec = null;
  ensureCategory('custom', '自定义');
  gmCount.textContent = gmSelection.length + ' 个';
  const cats = getCategories();
  gmCat.innerHTML = '';
  let hasCustom = false;
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = c.label;
    gmCat.appendChild(opt);
    if (c.id === 'custom') hasCustom = true;
  });
  const newOpt = document.createElement('option');
  newOpt.value = '__new__'; newOpt.textContent = '＋ 新建类别…';
  gmCat.appendChild(newOpt);
  gmCat.value = hasCustom ? 'custom' : (cats[0] ? cats[0].id : '__new__');
  gmNewCatField.style.display = gmCat.value === '__new__' ? 'block' : 'none';
  gmName.value = '自定义图形 ' + (countCustomShapes() + 1);
  gmCatId.value = ''; gmCatLabel.value = '';
  const autoRadio = document.querySelector('input[name=gmIcon][value=auto]');
  if (autoRadio) autoRadio.checked = true;
  try { gmPreviewRec = makeCustomRecord('preview', 'preview', 'preview', gmSelection); }
  catch (e) { gmPreviewRec = null; }
  refreshGmIconPreview();
  const modes = document.querySelectorAll('input[name=gmMode]');
  const preferFile = !!window.showOpenFilePicker;
  modes.forEach(m => {
    if (m.value === 'file') m.checked = preferFile;
    if (m.value === 'memory') m.checked = !preferFile;
    if (m.value === 'download') m.checked = false;
  });
  updateGmTip();
  openModal('groupModal');
  setTimeout(() => { try { gmName.focus(); gmName.select(); } catch (e) {} }, 60);
}
gmCat.addEventListener('change', () => {
  gmNewCatField.style.display = gmCat.value === '__new__' ? 'block' : 'none';
  if (gmCat.value === '__new__') setTimeout(() => gmCatId.focus(), 30);
});
document.querySelectorAll('input[name=gmMode]').forEach(m => m.addEventListener('change', updateGmTip));
document.querySelectorAll('input[name=gmIcon]').forEach(m => m.addEventListener('change', refreshGmIconPreview));
gmCancel.addEventListener('click', () => closeModal('groupModal'));
gmOk.addEventListener('click', async () => {
  const label = (gmName.value || '').trim();
  if (!label) { toast('请填写图形名称'); gmName.focus(); return; }
  let catId, catLabel, isNewCat = false;
  if (gmCat.value === '__new__') {
    catId = (gmCatId.value || '').trim();
    catLabel = (gmCatLabel.value || '').trim() || catId;
    if (!catId) { toast('请填写新类别 ID'); gmCatId.focus(); return; }
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(catId)) {
      toast('类别 ID 只能用英文字母、数字、下划线，且不能以数字开头');
      gmCatId.focus(); return;
    }
    isNewCat = !PB.categories.some(c => c.id === catId);
  } else {
    catId = gmCat.value;
    const found = (PB.categories || []).find(c => c.id === catId);
    catLabel = found ? found.label : catId;
  }
  const iconChoice = (document.querySelector('input[name=gmIcon]:checked') || {}).value || 'auto';
  const id = 'cs_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const rec = makeCustomRecord(id, label, catId, gmSelection);
  rec.icon = (iconChoice === 'auto') ? generateIconDataURL(rec, 56) : CUSTOM_ICON;
  gmOk.disabled = true;
  const oldText = gmOk.textContent;
  gmOk.textContent = '处理中…';
  try {
    await csSaveRecord({
      id: rec.id,
      label: rec.label,
      catId: catId,
      catLabel: catLabel,
      baseW: rec.baseW,
      baseH: rec.baseH,
      parts: rec.parts,
      icon: rec.icon
    });
    ensureCategory(catId, catLabel);
    PB.shapes[rec.id] = buildCustomDef(rec);
    const used = gmSelection.slice();
    objects = objects.filter(o => used.indexOf(o) < 0);
    pages[pageIndex] = objects;
    selection = [];
    pushSnapshot();
    updateSelBar(); render(); drawPreview();
    state.shapeCat = catId;
    buildShapePanel();
    setTool(rec.id);
    closeModal('groupModal');
    toast('已保存到本机 ✓（刷新后仍然可用）', 3000);
  } catch (err) {
    console.error(err);
    toast('操作失败：' + (err && err.message ? err.message : err), 3400);
  } finally {
    gmOk.disabled = false;
    gmOk.textContent = oldText;
  }
});
document.getElementById('tagGroup').addEventListener('click', () => {
  if (selection.length < 2) { toast('请先选中至少两个图形'); return; }
  openGroupModal();
});

/* =====================================================================
 * 17d. 图形库管理
 * ===================================================================== */
const libModal = document.getElementById('libModal');
const libFileInfo = document.getElementById('libFileInfo');
const libFilter = document.getElementById('libFilter');
const libCat = document.getElementById('libCat');
const libList = document.getElementById('libList');
const libDelete = document.getElementById('libDelete');
const libConfirm = document.getElementById('libConfirm');
const libConfirmBody = document.getElementById('libConfirmBody');

let libHandle = null, libText = null, libBlocks = [];
let libSelected = new Set();

const HIDDEN_LS_KEY = 'pb_hidden_shapes';
let libHidden = (function () {
  try {
    const raw = localStorage.getItem(HIDDEN_LS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch (e) { return new Set(); }
})();
let originalHiddenKeys = new Set();

function saveLibHidden() {
  try { localStorage.setItem(HIDDEN_LS_KEY, JSON.stringify([...libHidden])); } catch (e) {}
}
function collectOriginalHidden() {
  originalHiddenKeys = new Set();
  for (const k in PB.shapes) {
    if (PB.shapes[k].hidden) originalHiddenKeys.add(k);
  }
  let changed = false;
  for (const k of Array.from(libHidden)) {
    if (!PB.shapes[k]) { libHidden.delete(k); changed = true; }
  }
  if (changed) saveLibHidden();
}
function applyLibHidden() {
  for (const k in PB.shapes) {
    const s = PB.shapes[k];
    if (s.cat === '__sys') continue;
    if (libHidden.has(k) || originalHiddenKeys.has(k)) s.hidden = true;
    else s.hidden = false;
  }
}

const ICON_EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const ICON_EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 16"/><path d="M9.6 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.3 17.3 0 0 1-3.4 4.2"/><path d="M6.2 7.7A17.4 17.4 0 0 0 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 4-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

function findShapeBlocks(text) {
  const blocks = []; const N = text.length;
  let i = 0;
  while (i < N) {
    const idx = text.indexOf('shape', i);
    if (idx < 0) break;
    const before = idx > 0 ? text[idx - 1] : '';
    if (before && /[A-Za-z0-9_$.]/.test(before)) { i = idx + 5; continue; }
    let j = idx + 5;
    while (j < N && /\s/.test(text[j])) j++;
    if (text[j] !== '(') { i = idx + 5; continue; }
    j++;
    let braceStart = -1, k = j;
    while (k < N) { const ch = text[k];
      if (ch === '{') { braceStart = k; break; }
      if (ch === ')' || ch === ';') break; k++; }
    if (braceStart < 0) { i = idx + 5; continue; }
    let depth = 0, inString = null, escaped = false, inLine = false, inBlock = false, braceEnd = -1;
    let m = braceStart;
    for (; m < N; m++) {
      const ch = text[m], nx = text[m + 1];
      if (inLine) { if (ch === '\n') inLine = false; continue; }
      if (inBlock) { if (ch === '*' && nx === '/') { inBlock = false; m++; } continue; }
      if (inString) {
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === inString) inString = null; continue;
      }
      if (ch === '/' && nx === '/') { inLine = true; m++; continue; }
      if (ch === '/' && nx === '*') { inBlock = true; m++; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { braceEnd = m; break; } }
    }
    if (braceEnd < 0) { i = idx + 5; continue; }
    let endPos = braceEnd + 1;
    while (endPos < N && /\s/.test(text[endPos])) endPos++;
    if (text[endPos] === ')') endPos++;
    while (endPos < N && /\s/.test(text[endPos])) endPos++;
    if (text[endPos] === ';') endPos++;
    const inner = text.slice(braceStart, braceEnd + 1);
    const keyM = inner.match(/\bkey\s*:\s*["'`]([^"'`]+)["'`]/);
    const labelM = inner.match(/\blabel\s*:\s*["'`]([^"'`]+)["'`]/);
    const catM = inner.match(/\bcat\s*:\s*["'`]([^"'`]+)["'`]/);
    const custM = /\bcustom\s*:\s*true\b/.test(inner);
    const animM = /\banimatable\s*:\s*true\b/.test(inner);
    if (keyM) blocks.push({ start: idx, end: endPos, key: keyM[1],
      label: labelM ? labelM[1] : keyM[1], cat: catM ? catM[1] : '',
      custom: custM, animatable: animM });
    i = endPos;
  }
  return blocks;
}
function getBlockDeleteRange(text, block, prevEnd) {
  let start = block.start; let s = start;
  while (s > prevEnd && /\s/.test(text[s - 1])) s--;
  if (s >= 2 && text[s - 1] === '/' && text[s - 2] === '*') {
    let e = s - 2;
    while (e > prevEnd && !(text[e] === '*' && text[e - 1] === '/')) e--;
    if (e > prevEnd) start = e - 1;
  } else {
    let lineStart = s;
    while (lineStart > prevEnd && text[lineStart - 1] !== '\n') lineStart--;
    const lineText = text.slice(lineStart, s).trim();
    if (lineText.startsWith('//')) start = lineStart;
  }
  return { start, end: block.end };
}
function getLibItems() {
  const items = [];
  for (const key in PB.shapes) {
    const s = PB.shapes[key];
    if (s.cat === '__sys') continue;
    if (s.hidden && !libHidden.has(key)) continue;
    items.push({
      key, label: s.label || key, cat: s.cat || '',
      custom: !!s.custom, animatable: !!s.animatable,
      icon: s.icon || '',
      inFile: libBlocks.some(b => b.key === key),
      hidden: libHidden.has(key)
    });
  }
  return items;
}
function libMatches(it) {
  const f = libFilter.value;
  const c = libCat.value;
  if (c !== 'all' && it.cat !== c) return false;
  if (f === 'custom' && !it.custom) return false;
  if (f === 'builtin' && (it.custom || it.animatable)) return false;
  if (f === 'anim' && !it.animatable) return false;
  return true;
}
function refreshLibCatOptions() {
  const cur = libCat.value || 'all';
  const seen = new Set();
  const opts = [];
  const cats = (Array.isArray(PB.categories) ? PB.categories : []).filter(c => c.id !== '__sys');
  cats.forEach(c => {
    if (!seen.has(c.id)) { seen.add(c.id); opts.push({ id: c.id, label: c.label || c.id }); }
  });
  for (const key in PB.shapes) {
    const s = PB.shapes[key];
    if (s.cat === '__sys' || !s.cat) continue;
    if (!seen.has(s.cat)) { seen.add(s.cat); opts.push({ id: s.cat, label: s.cat }); }
  }
  libCat.innerHTML = '<option value="all">全部类别</option>';
  opts.forEach(o => {
    const op = document.createElement('option');
    op.value = o.id; op.textContent = o.label;
    libCat.appendChild(op);
  });
  libCat.value = (cur === 'all' || seen.has(cur)) ? cur : 'all';
}
function toggleLibHide(key) {
  const s = PB.shapes[key];
  if (!s) return;
  const willHide = !libHidden.has(key);
  if (willHide) {
    libHidden.add(key);
    s.hidden = true;
    if (state.tool === key) setTool('pen', true);
  } else {
    libHidden.delete(key);
    s.hidden = false;
  }
  saveLibHidden();
  buildShapePanel();
  renderLibList();
  toast(willHide
    ? '已隐藏：' + (s.label || key) + '（已记住，刷新后仍保持）'
    : '已恢复显示：' + (s.label || key));
}
function renderLibList() {
  refreshLibCatOptions();
  const items = getLibItems().filter(libMatches);
  libList.innerHTML = '';
  const frag = document.createDocumentFragment();

  for (const it of items) {
    const row = document.createElement('div');
    row.className = 'lib-item' + (libSelected.has(it.key) ? ' sel' : '') +
                    (it.hidden ? ' is-hidden' : '') + (it.custom ? '' : ' locked');
    row.dataset.key = it.key;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = libSelected.has(it.key);
    cb.disabled = !it.custom;
    cb.title = it.custom ? '勾选后可删除' : '内置 / 动画图形不可删除，可点右侧按钮隐藏';
    cb.addEventListener('change', () => {
      if (cb.checked) libSelected.add(it.key); else libSelected.delete(it.key);
      row.classList.toggle('sel', cb.checked);
      updateLibDeleteBtn();
    });

    const iconWrap = document.createElement('span');
    iconWrap.className = 'lib-item-icon';
    iconWrap.innerHTML = renderShapeIcon(it.icon);

    const name = document.createElement('span');
    name.className = 'lib-item-name'; name.textContent = it.label;

    const keyEl = document.createElement('span');
    keyEl.className = 'lib-item-key'; keyEl.textContent = it.key; keyEl.title = it.key;

    const catEl = document.createElement('span');
    catEl.className = 'lib-item-cat'; catEl.textContent = it.cat;

    const tag = document.createElement('span');
    if (it.animatable) { tag.className = 'lib-item-tag anim'; tag.textContent = '动画'; }
    else if (it.custom) { tag.className = 'lib-item-tag custom'; tag.textContent = '自定义'; }
    else { tag.className = 'lib-item-tag builtin'; tag.textContent = '内置'; }

    const hideBtn = document.createElement('button');
    hideBtn.type = 'button';
    hideBtn.className = 'lib-hide-btn' + (it.hidden ? ' on' : '');
    hideBtn.title = it.hidden
      ? '取消隐藏，重新显示在图形面板'
      : '隐藏：不显示在图形面板（状态会被记住，刷新后仍隐藏）';
    hideBtn.innerHTML = it.hidden ? ICON_EYE_OFF : ICON_EYE;
    hideBtn.addEventListener('click', ev => {
      ev.stopPropagation(); ev.preventDefault();
      toggleLibHide(it.key);
    });

    row.append(cb, iconWrap, name, keyEl, catEl, tag, hideBtn);

    row.addEventListener('click', ev => {
      if (ev.target === cb || ev.target.closest('.lib-hide-btn')) return;
      if (!it.custom) { toast('内置 / 动画图形不可删除，可点右侧按钮隐藏'); return; }
      if (cb.checked) { libSelected.delete(it.key); cb.checked = false; }
      else { libSelected.add(it.key); cb.checked = true; }
      row.classList.toggle('sel', cb.checked);
      updateLibDeleteBtn();
    });

    frag.appendChild(row);
  }
  libList.appendChild(frag);
  updateLibDeleteBtn();
}
function updateLibDeleteBtn() {
  for (const k of Array.from(libSelected)) {
    const s = PB.shapes[k];
    if (!s || !s.custom) libSelected.delete(k);
  }
  const n = libSelected.size;
  libDelete.disabled = n === 0;
  libDelete.textContent = n > 0 ? '删除选中 (' + n + ')' : '删除选中';
}
async function tryAutoLoadCachedFile() {
  if (libHandle && libText != null) return;
  if (!cachedShapesHandle) return;
  try {
    const opts = { mode: 'readwrite' };
    let perm = await cachedShapesHandle.queryPermission(opts);
    if (perm === 'prompt') perm = await cachedShapesHandle.requestPermission(opts);
    if (perm !== 'granted') return;
    const f = await cachedShapesHandle.getFile();
    libHandle = cachedShapesHandle;
    libText = await f.text();
    libBlocks = findShapeBlocks(libText);
    libFileInfo.textContent = '已加载：' + (libHandle.name || 'shapes.js') +
      '（识别到 ' + libBlocks.length + ' 个 shape）';
    libFileInfo.classList.add('loaded');
    renderLibList();
  } catch (e) {}
}
function openLibModal() {
  libSelected.clear();
  libFilter.value = 'all';
  libCat.value = 'all';
  refreshLibCatOptions();
  libConfirm.classList.remove('show');
  if (libHandle && libText != null) {
    libBlocks = findShapeBlocks(libText);
    libFileInfo.textContent = '已加载：' + (libHandle.name || 'shapes.js') +
      '（识别到 ' + libBlocks.length + ' 个 shape）';
    libFileInfo.classList.add('loaded');
  } else if (cachedShapesHandle) {
    libFileInfo.textContent = '记忆文件：' + (cachedShapesHandle.name || 'shapes.js') + '（正在尝试自动加载…）';
    libFileInfo.classList.remove('loaded'); libBlocks = [];
  } else {
    libFileInfo.textContent = '未加载文件 · 只操作当前会话（刷新失效）';
    libFileInfo.classList.remove('loaded'); libBlocks = [];
  }
  renderLibList();
  openModal('libModal');
  tryAutoLoadCachedFile();
}
function closeLibModal() { closeModal('libModal'); libConfirm.classList.remove('show'); }
document.getElementById('libCancel').addEventListener('click', closeLibModal);

document.getElementById('libPickFile').addEventListener('click', async () => {
  if (!window.showOpenFilePicker) { alert('当前浏览器不支持直接写入文件（请用 Chrome / Edge）。'); return; }
  let handle = null;
  try {
    const opts = {
      types: [{ description: 'JavaScript 文件', accept: { 'text/javascript': ['.js'] } }],
      excludeAcceptAllOption: false, multiple: false
    };
    const last = libHandle || cachedShapesHandle;
    if (last) opts.startIn = last; else opts.startIn = 'documents';
    [handle] = await window.showOpenFilePicker(opts);
  } catch (e) { return; }
  try {
    const file = await handle.getFile();
    const text = await file.text();
    if (text.indexOf('PhysBoard') < 0) {
      if (!confirm('选中的文件里没有发现 PhysBoard 相关代码，确定继续吗？')) return;
    }
    libHandle = handle; libText = text;
    libBlocks = findShapeBlocks(text);
    cachedShapesHandle = handle;
    await idbSet('shapesJsHandle', handle);
    libFileInfo.textContent = '已加载：' + (handle.name || 'shapes.js') + '（识别到 ' + libBlocks.length + ' 个 shape）';
    libFileInfo.classList.add('loaded');
    renderLibList();
    toast('已加载 ' + handle.name + '，识别到 ' + libBlocks.length + ' 个图形定义');
  } catch (err) { alert('读取文件失败：' + (err && err.message ? err.message : err)); }
});

libFilter.addEventListener('change', renderLibList);
libCat.addEventListener('change', renderLibList);

document.getElementById('libSelAll').addEventListener('click', () => {
  for (const it of getLibItems()) {
    if (!libMatches(it) || !it.custom) continue;
    libSelected.add(it.key);
  }
  renderLibList();
});
document.getElementById('libSelNone').addEventListener('click', () => {
  libSelected.clear();
  renderLibList();
});

libDelete.addEventListener('click', () => {
  if (!libSelected.size) return;
  const keys = Array.from(libSelected);
  const all = getLibItems();
  const delItems = keys.map(k => {
    const found = all.find(it => it.key === k);
    if (found) return found;
    const s = PB.shapes[k];
    return { key:k, label:(s && s.label) || k, cat:(s && s.cat) || '',
             custom: true, animatable: !!(s && s.animatable), inFile:false };
  });
  const usedCount = objects.filter(o => keys.indexOf(o.type) >= 0).length;
  let html = '即将删除 <b>' + delItems.length + '</b> 个自定义图形定义：<ul class="del-list">';
  for (const it of delItems) {
    const inFile = it.inFile ? '' : ' <span style="color:#97a3b6;font-size:11px;">（文件里未找到对应代码块）</span>';
    html += '<li>' + escapeHtml(it.label) +
            ' <span style="color:#97a3b6;font-size:11px;">[自定义 · ' + escapeHtml(it.key) + ']</span>' +
            inFile + '</li>';
  }
  html += '</ul>';
  if (libHandle && libText != null) {
    html += '<div style="margin-top:10px;color:#b8c7de;">将从 <b style="color:#e6edf7;">' +
            escapeHtml(libHandle.name || 'shapes.js') + '</b> 移除对应的 shape 代码块。</div>';
  } else if (cachedShapesHandle) {
    html += '<div style="margin-top:10px;color:#b8c7de;">将尝试写入记忆文件 <b style="color:#e6edf7;">' +
            escapeHtml(cachedShapesHandle.name || 'shapes.js') + '</b>；若未授权，则只从当前会话移除。</div>';
  } else {
    html += '<div style="margin-top:10px;color:#fca5a5;font-size:12px;">⚠ 未关联 shapes.js 文件，本次只会从当前会话移除，刷新后图形会恢复。</div>';
  }
  if (usedCount > 0) {
    html += '<div style="margin-top:10px;color:#fca5a5;">⚠ 画布上有 <b>' + usedCount + '</b> 个对象正在使用这些图形，将一并删除。</div>';
  }
  html += '<div style="margin-top:10px;color:#97a3b6;font-size:12px;">此操作可用 Ctrl+Z 撤销画布变化；但文件修改不可撤销。</div>';
  libConfirmBody.innerHTML = html;
  libConfirm.classList.add('show');
});
document.getElementById('libConfirmBack').addEventListener('click', () => libConfirm.classList.remove('show'));

document.getElementById('libConfirmOk').addEventListener('click', async () => {
  const keys = Array.from(libSelected).filter(k => {
    const s = PB.shapes[k];
    return s && s.custom;
  });
  if (!keys.length) { libConfirm.classList.remove('show'); return; }
  const okBtn = document.getElementById('libConfirmOk');
  okBtn.disabled = true;
  const oldText = okBtn.textContent; okBtn.textContent = '处理中…';
  try {
    let fileModified = false;
    let missingKeys = [];

    let handle = libHandle || null;
    if (!handle && cachedShapesHandle) {
      try {
        const opts = { mode: 'readwrite' };
        let perm = await cachedShapesHandle.queryPermission(opts);
        if (perm === 'prompt') perm = await cachedShapesHandle.requestPermission(opts);
        if (perm === 'granted') handle = cachedShapesHandle;
      } catch (e) {}
    }

    if (handle) {
      let text = null;
      try {
        const f = await handle.getFile();
        text = await f.text();
      } catch (e) { text = libText; }

      if (typeof text === 'string') {
        const blocks = findShapeBlocks(text);
        const present = {};
        for (const b of blocks) present[b.key] = true;
        missingKeys = keys.filter(k => !present[k]);

        const toDel = blocks.filter(b => keys.indexOf(b.key) >= 0);
        toDel.sort((a, b) => b.start - a.start);
        for (const b of toDel) {
          const idxInBlocks = blocks.indexOf(b);
          const prevEnd = idxInBlocks > 0 ? blocks[idxInBlocks - 1].end : 0;
          const range = getBlockDeleteRange(text, b, prevEnd);
          text = text.slice(0, range.start) + text.slice(range.end);
        }

        const w = await handle.createWritable();
        await w.write(text);
        await w.close();

        fileModified = true;
        libHandle = handle;
        libText = text;
        libBlocks = findShapeBlocks(text);
        cachedShapesHandle = handle;
        try { await idbSet('shapesJsHandle', handle); } catch (e) {}
      }
    }

    for (const k of keys) {
      libHidden.delete(k);
      delete PB.shapes[k];
      await csDeleteRecord(k);
    }
    saveLibHidden();

    const before = objects.length;
    objects = objects.filter(o => keys.indexOf(o.type) < 0);
    selection = selection.filter(o => objects.indexOf(o) >= 0);
    const removedObjs = before - objects.length;
    if (keys.indexOf(state.tool) >= 0) setTool('pen', true);

    let hasCurrentCat = false;
    for (const k in PB.shapes) {
      if (PB.shapes[k].cat === state.shapeCat && !PB.shapes[k].hidden) { hasCurrentCat = true; break; }
    }
    if (!hasCurrentCat) {
      for (const c of getCategories()) {
        for (const k in PB.shapes) {
          if (PB.shapes[k].cat === c.id && !PB.shapes[k].hidden) { state.shapeCat = c.id; hasCurrentCat = true; break; }
        }
        if (hasCurrentCat) break;
      }
    }

    pushSnapshot();
    buildShapePanel();
    updateSelBar(); render(); drawPreview();
    libSelected.clear(); libConfirm.classList.remove('show'); renderLibList();

    let msg = '已删除 ' + keys.length + ' 个自定义图形定义';
    if (fileModified) {
      msg += '，shapes.js 已更新 ✓';
      if (missingKeys.length) msg += '（' + missingKeys.length + ' 个在文件中未找到代码块）';
    } else {
      msg += '（未写入文件，仅当前会话，刷新后会恢复）';
    }
    if (removedObjs > 0) msg += '；清理画布对象 ' + removedObjs + ' 个';
    toast(msg, 5200);
  } catch (err) {
    console.error(err);
    alert('删除失败：' + (err && err.message ? err.message : err));
  } finally {
    okBtn.disabled = false; okBtn.textContent = oldText;
  }
});

/* =====================================================================
 * 18. 样式面板
 * ===================================================================== */
function makeSwatch(color, opts) {
  opts = opts || {};
  const b = document.createElement('button');
  b.className = 'swatch' + (opts.none ? ' none' : '') +
                (opts.black ? ' black' : '') + (opts.white ? ' white' : '');
  if (!opts.none && !opts.black && !opts.white) b.style.background = color;
  b.dataset.color = color;
  b.title = opts.none ? '无' : (color === '#000000' ? '黑色' : (color === '#ffffff' ? '白色' : color));
  return b;
}
function makeColorPicker(onPick) {
  const w = document.createElement('label');
  w.className = 'color-pick'; w.title = '自定义颜色';
  const inp = document.createElement('input');
  inp.type = 'color'; inp.value = '#7dd3fc';
  inp.addEventListener('input', e => onPick(e.target.value));
  w.appendChild(inp); return w;
}
function buildPenPanel() {
  penSizesEl.innerHTML = '';
  PEN_SIZES.forEach(sz => {
    const b = document.createElement('button');
    b.className = 'size-btn' + (state.penSize === sz.v ? ' active' : '');
    b.dataset.size = sz.v;
    const d = document.createElement('span');
    d.className = 'dot'; d.style.width = sz.d + 'px'; d.style.height = sz.d + 'px';
    b.appendChild(d);
    b.addEventListener('click', () => {
      state.penSize = sz.v; state.borderSize = sz.v;
      penSizesEl.querySelectorAll('.size-btn').forEach(x =>
        x.classList.toggle('active', +x.dataset.size === sz.v));
    });
    penSizesEl.appendChild(b);
  });
  penColorsEl.innerHTML = '';
  COLORS.forEach(c => {
    const opts = {};
    if (c === '#000000') opts.black = true;
    if (c === '#ffffff') opts.white = true;
    const b = makeSwatch(c, opts);
    b.classList.toggle('active', c.toLowerCase() === state.penColor.toLowerCase());
    b.addEventListener('click', () => {
      state.penColor = c; state.borderColor = c;
      penColorsEl.querySelectorAll('.swatch').forEach(x =>
        x.classList.toggle('active', x.dataset.color.toLowerCase() === c.toLowerCase()));
    });
    penColorsEl.appendChild(b);
  });
  penColorsEl.appendChild(makeColorPicker(c => {
    state.penColor = c; state.borderColor = c;
    penColorsEl.querySelectorAll('.swatch').forEach(x => x.classList.remove('active'));
  }));
  penStylesEl.innerHTML = '';
  DASH_STYLES.forEach(ds => {
    const b = document.createElement('button');
    b.className = 'line-btn' + (state.penDash === ds.id ? ' active' : '');
    b.dataset.dash = ds.id;
    b.innerHTML = '<svg viewBox="0 0 56 14">' + ds.svg + '</svg>';
    b.addEventListener('click', () => {
      state.penDash = ds.id;
      penStylesEl.querySelectorAll('.line-btn').forEach(x =>
        x.classList.toggle('active', x.dataset.dash === ds.id));
    });
    penStylesEl.appendChild(b);
  });
}
function buildBorderPanel() {
  borderSizesEl.innerHTML = '';
  BORDER_SIZES.forEach(sz => {
    const b = document.createElement('button');
    b.className = 'size-btn'; b.dataset.size = sz.v;
    const d = document.createElement('span');
    d.className = 'dot';
    d.style.width = (5 + sz.v * 2.6) + 'px'; d.style.height = (5 + sz.v * 2.6) + 'px';
    b.appendChild(d);
    b.addEventListener('click', () => {
      state.borderSize = sz.v; state.penSize = sz.v;
      applyToSelection(o => { o.size = sz.v; });
      borderSizesEl.querySelectorAll('.size-btn').forEach(x =>
        x.classList.toggle('active', +x.dataset.size === sz.v));
    });
    borderSizesEl.appendChild(b);
  });
  borderColorsEl.innerHTML = '';
  const noneBtn = makeSwatch('#000000', { none: true });
  noneBtn.dataset.color = '__none__';
  noneBtn.addEventListener('click', () => {
    applyToSelection(o => { o.hasBorder = false; });
    syncBorderUI();
  });
  borderColorsEl.appendChild(noneBtn);
  COLORS.forEach(c => {
    const opts = {};
    if (c === '#000000') opts.black = true;
    if (c === '#ffffff') opts.white = true;
    const b = makeSwatch(c, opts);
    b.addEventListener('click', () => {
      state.borderColor = c; state.penColor = c;
      applyToSelection(o => { o.color = c; o.hasBorder = true; });
      syncBorderUI();
    });
    borderColorsEl.appendChild(b);
  });
  borderColorsEl.appendChild(makeColorPicker(c => {
    state.borderColor = c; state.penColor = c;
    applyToSelection(o => { o.color = c; o.hasBorder = true; });
    syncBorderUI();
  }));
  borderStylesEl.innerHTML = '';
  DASH_STYLES.forEach(ds => {
    const b = document.createElement('button');
    b.className = 'line-btn'; b.dataset.dash = ds.id;
    b.innerHTML = '<svg viewBox="0 0 56 14">' + ds.svg + '</svg>';
    b.addEventListener('click', () => {
      state.penDash = ds.id;
      applyToSelection(o => { o.dash = ds.id; });
      borderStylesEl.querySelectorAll('.line-btn').forEach(x =>
        x.classList.toggle('active', x.dataset.dash === ds.id));
    });
    borderStylesEl.appendChild(b);
  });
}
function syncBorderUI() {
  const one = selection[0];
  if (!one) return;
  const size = one.size || 3;
  borderSizesEl.querySelectorAll('.size-btn').forEach(x =>
    x.classList.toggle('active', +x.dataset.size === size));
  borderColorsEl.querySelectorAll('.swatch').forEach(x => {
    if (x.dataset.color === '__none__') x.classList.toggle('active', one.hasBorder === false);
    else x.classList.toggle('active', one.hasBorder !== false &&
      x.dataset.color.toLowerCase() === (one.color || '').toLowerCase());
  });
  borderStylesEl.querySelectorAll('.line-btn').forEach(x =>
    x.classList.toggle('active', x.dataset.dash === (one.dash || 'solid')));
}
function buildFillPanel() {
  fillColorsEl.innerHTML = '';
  const noneBtn = makeSwatch('#000000', { none: true });
  noneBtn.dataset.color = '__none__';
  noneBtn.addEventListener('click', () => {
    state.fillActive = false;
    applyToSelection(o => { o.fill = false; });
    syncFillUI();
  });
  fillColorsEl.appendChild(noneBtn);
  COLORS.forEach(c => {
    const opts = {};
    if (c === '#000000') opts.black = true;
    if (c === '#ffffff') opts.white = true;
    const b = makeSwatch(c, opts);
    b.addEventListener('click', () => {
      state.fillColor = c; state.fillActive = true;
      applyToSelection(o => { o.fillColor = c; o.fill = true; });
      syncFillUI();
    });
    fillColorsEl.appendChild(b);
  });
  fillColorsEl.appendChild(makeColorPicker(c => {
    state.fillColor = c; state.fillActive = true;
    applyToSelection(o => { o.fillColor = c; o.fill = true; });
    syncFillUI();
  }));
  fillAlphaInput.addEventListener('input', () => {
    const v = +fillAlphaInput.value;
    fillAlphaVal.textContent = v + '%';
    state.fillAlpha = v / 100; state.fillActive = true;
    applyToSelection(o => { o.fillAlpha = v / 100; if (o.fill !== false) o.fill = true; });
  });
}
function syncFillUI() {
  const one = selection[0];
  if (!one) {
    fillColorsEl.querySelectorAll('.swatch').forEach(x => {
      if (x.dataset.color === '__none__') {
        x.classList.toggle('active', state.fillActive === false);
      } else {
        x.classList.toggle('active', state.fillActive !== false &&
          x.dataset.color.toLowerCase() === state.fillColor.toLowerCase());
      }
    });
    const a = Math.round(state.fillAlpha * 100);
    fillAlphaInput.value = a; fillAlphaVal.textContent = a + '%';
    return;
  }
  fillColorsEl.querySelectorAll('.swatch').forEach(x => {
    if (x.dataset.color === '__none__') x.classList.toggle('active', one.fill === false);
    else x.classList.toggle('active', one.fill !== false &&
      x.dataset.color.toLowerCase() === (one.fillColor || '').toLowerCase());
  });
  const a = Math.round((one.fillAlpha != null ? one.fillAlpha : state.fillAlpha) * 100);
  fillAlphaInput.value = a; fillAlphaVal.textContent = a + '%';
}
function buildParamsPanel() {
  const one = selection[0];
  if (!one) return;
  const def = PB.shapes[one.type];
  if (!def || !def.params || !def.params.length) {
    paramsBody.innerHTML = '<div style="color:#8fa3c0;font-size:13px;padding:8px;">该图形没有可调参数</div>';
    return;
  }
  paramsBody.innerHTML = '';
  for (const key of def.params) {
    const pd = PB.paramDefs && PB.paramDefs[key];
    if (!pd) continue;
    if (one[key] === undefined) one[key] = (pd.def !== undefined ? pd.def : pd.min);

    const block = document.createElement('div');
    block.className = 'pblock';

    if (pd.type === 'select') {
      const label = document.createElement('div');
      label.className = 'plabel';
      label.textContent = pd.label;
      const sel = document.createElement('select');
      sel.className = 'gm-input';
      (pd.options || []).forEach(op => {
        const o2 = document.createElement('option');
        o2.value = op.value; o2.textContent = op.label;
        if (op.css) o2.style.fontFamily = op.css;
        sel.appendChild(o2);
      });
      sel.value = one[key];
      sel.addEventListener('change', () => {
        one[key] = sel.value;
        if (isTextObj(one)) measureText(one);
        render(); drawPreview();
      });
      block.append(label, sel);
    }
    else if (pd.type === 'toggle') {
      const label = document.createElement('div');
      label.className = 'plabel';
      label.textContent = pd.label;
      const btn = document.createElement('button');
      btn.className = 'te-tg' + (one[key] ? ' on' : '');
      btn.textContent = one[key] ? '已开启' : '已关闭';
      btn.style.width = '100%';
      btn.addEventListener('click', () => {
        one[key] = !one[key];
        btn.classList.toggle('on', one[key]);
        btn.textContent = one[key] ? '已开启' : '已关闭';
        if (isTextObj(one)) measureText(one);
        render(); drawPreview();
      });
      block.append(label, btn);
    }
    else {
      const label = document.createElement('div');
      label.className = 'plabel';
      label.innerHTML = escapeHtml(pd.label) + ' <b>' + one[key] + (pd.unit || '') + '</b>';
      const inp = document.createElement('input');
      inp.type = 'range'; inp.min = pd.min; inp.max = pd.max; inp.step = pd.step;
      inp.value = one[key];
      inp.addEventListener('input', () => {
        const v = +inp.value;
        one[key] = v;
        label.innerHTML = escapeHtml(pd.label) + ' <b>' + v + (pd.unit || '') + '</b>';
        if (isTextObj(one)) measureText(one);
        render(); drawPreview();
      });
      block.append(label, inp);
    }
    paramsBody.appendChild(block);
  }
}
function applyToSelection(fn) {
  for (const o of selection) fn(o);
  pages[pageIndex] = objects;
  render(); drawPreview(); updateSelBarPosition();
}

/* =====================================================================
 * 19. 对象创建
 * ===================================================================== */
function newBase(def) {
  const base = {
    color: state.penColor, size: state.penSize, hasBorder: true,
    dash: state.penDash || 'solid',
    fill: false,
    fillColor: state.fillColor,
    fillAlpha: state.fillAlpha,
    rotation: 0
  };
  if (def) {
    const bc = def.color || def.stroke || def.strokeColor || def.borderColor;
    if (typeof bc === 'string') base.color = bc;
    if (typeof def.lineWidth === 'number') base.size = def.lineWidth;
    else if (typeof def.strokeWidth === 'number') base.size = def.strokeWidth;
    else if (typeof def.size === 'number') base.size = def.size;
    const bd = def.dash || def.lineStyle;
    if (typeof bd === 'string') base.dash = bd;
    if (def.hasBorder === false || def.noBorder === true) base.hasBorder = false;

    const fc = def.fillColor || def.fillStyle;
    if (typeof fc === 'string') base.fillColor = fc;
    if (typeof def.fillAlpha === 'number') base.fillAlpha = def.fillAlpha;

    if (def.defaultFill === true) {
      base.fill = true;
    }

    if (state.fillActive) {
      base.fill = true;
      base.fillColor = state.fillColor;
      base.fillAlpha = state.fillAlpha;
    }

    if (def.geom === 'text') {
      const td = (def.textDefaults && typeof def.textDefaults === 'object') ? def.textDefaults : def;
      if (typeof td.fontFamily === 'string') base.fontFamily = td.fontFamily;
      if (typeof td.fontSize === 'number') base.fontSize = td.fontSize;
      if (typeof td.bold === 'boolean') base.bold = td.bold;
      if (typeof td.italic === 'boolean') base.italic = td.italic;
      if (typeof td.underline === 'boolean') base.underline = td.underline;
      if (typeof td.textAlign === 'string') base.textAlign = td.textAlign;
      if (typeof td.color === 'string') base.color = td.color;
    }
  }
  return base;
}

function createShapeAt(p) {
  const type = state.tool;
  const def = PB.shapes[type];
  if (!def) return null;
  const base = newBase(def);
  let o;
  if (def.geom === 'path') o = Object.assign({ type, points: [{x:p.x, y:p.y}] }, base);
  else if (def.geom === 'text') {
    o = Object.assign({
      type, x:p.x, y:p.y, text:'',
      fontSize: base.fontSize || state.textSize || 32,
      fontFamily: base.fontFamily || state.textFontFamily || 'system',
      bold: (base.bold != null) ? base.bold : !!state.textBold,
      italic: (base.italic != null) ? base.italic : !!state.textItalic,
      underline: (base.underline != null) ? base.underline : !!state.textUnderline,
      textAlign: base.textAlign || 'left'
    }, base);
  }
  else {
    o = Object.assign({ type, x1:p.x, y1:p.y, x2:p.x, y2:p.y }, base);
    if (def.params && PB.paramDefs) {
      for (const k of def.params) if (PB.paramDefs[k]) o[k] = PB.paramDefs[k].def;
    }
  }
  if (def.animatable) { o.animT = 0; o.animPlaying = false; o.animSpeed = 1; }
  return o;
}
function isMeaningful(o) {
  if (!o) return false;
  if (o.points) return o.points.length > 0;
  if (isTextObj(o)) return !!o.text;
  return Math.hypot(o.x2 - o.x1, o.y2 - o.y1) > 4;
}

/* =====================================================================
 * 20. 橡皮擦逻辑
 * ===================================================================== */
function doEraseAt(worldPt, radius) {
  const touched = findObjectsAt(worldPt, radius);
  if (!touched.length) return;
  eraseDirty = true;
  for (const o of touched) {
    if (!erasedThisStroke.has(o)) {
      erasedThisStroke.add(o);
      if (o._mask) {
        o._mask = cloneCanvas(o._mask);
      } else {
        ensureMask(o);
      }
    }
    applyEraseToObj(o, worldPt, radius);
  }
}
function eraseStart(e) {
  drawing = true; erasing = true; eraseDirty = false;
  erasedThisStroke = new Set();
  const pt = { x: e.clientX, y: e.clientY };
  lastErasePt = pt; lastHoverPt = pt;
  lastEraserRadius = getEraserRadius(e);
  doEraseAt(pt, lastEraserRadius);
  render(); drawPreview();
}
function eraseMove(e) {
  const pt = { x: e.clientX, y: e.clientY };
  lastHoverPt = pt;
  lastEraserRadius = getEraserRadius(e);
  if (!lastErasePt) {
    lastErasePt = pt;
    doEraseAt(pt, lastEraserRadius);
  } else {
    const dx = pt.x - lastErasePt.x, dy = pt.y - lastErasePt.y;
    const dist = Math.hypot(dx, dy);
    const step = Math.max(1, Math.min(lastEraserRadius * 0.4, 6));
    const steps = Math.max(1, Math.ceil(dist / step));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      doEraseAt({ x: lastErasePt.x + dx * t, y: lastErasePt.y + dy * t }, lastEraserRadius);
    }
    lastErasePt = pt;
  }
  render(); drawPreview();
}
function eraseEnd() {
  erasing = false; drawing = false;
  if (eraseDirty) {
    for (const o of erasedThisStroke) {
      if (o._mask) thresholdMask(o._mask);
    }
    pushSnapshot();
    eraseDirty = false;
  }
  lastErasePt = null;
  erasedThisStroke = new Set();
}

/* =====================================================================
 * 20.5 特殊点吸附
 * ===================================================================== */
const SNAP_DEFAULT_RADIUS = 12;
const SNAP_LS_ENABLED = 'pb_snap_enabled';
const SNAP_LS_RADIUS  = 'pb_snap_radius';
let snapRadius = SNAP_DEFAULT_RADIUS;
let snapCache = null;
let snapIndicator = null;
let snapEnabled = true;

function loadSnapSettings() {
  try {
    const se = localStorage.getItem(SNAP_LS_ENABLED);
    if (se === 'off') snapEnabled = false;
    else if (se === 'on') snapEnabled = true;
    const sr = parseInt(localStorage.getItem(SNAP_LS_RADIUS), 10);
    if (!isNaN(sr)) snapRadius = Math.max(4, Math.min(40, sr));
  } catch (e) {}
  syncSnapUI();
}
function syncSnapUI() {
  const row = document.getElementById('snapToggleRow');
  if (row) {
    row.querySelectorAll('.seg-btn').forEach(b => {
      b.classList.toggle('active', (b.dataset.val === 'on') === snapEnabled);
    });
  }
  const slider = document.getElementById('snapRadius');
  const valEl  = document.getElementById('snapRadiusVal');
  const block  = document.getElementById('snapRadiusBlock');
  if (slider) {
    slider.value = snapRadius;
    slider.disabled = !snapEnabled;
  }
  if (block) {
    block.style.opacity = snapEnabled ? '1' : '.45';
    block.style.pointerEvents = snapEnabled ? '' : 'none';
  }
  if (valEl) valEl.textContent = snapRadius + ' px';
}
function collectSnapPoints(excludeSet) {
  const pts = [];
  const add = (x, y) => {
    if (typeof x === 'number' && typeof y === 'number' && isFinite(x) && isFinite(y)) {
      pts.push({ x: x, y: y });
    }
  };
  for (const o of objects) {
    if (excludeSet && excludeSet.has(o)) continue;
    const b = getWorldBBox(o);
    if (!isFinite(b.x1) || !isFinite(b.y1) || !isFinite(b.x2) || !isFinite(b.y2)) continue;
    const cx = (b.x1 + b.x2) / 2, cy = (b.y1 + b.y2) / 2;
    add(b.x1, b.y1); add(b.x2, b.y1); add(b.x2, b.y2); add(b.x1, b.y2);
    add(cx, cy);
    add(cx, b.y1); add(cx, b.y2); add(b.x1, cy); add(b.x2, cy);

    const ctr = objCenter(o);
    const rot = o.rotation || 0;

    if (o.points && o.points.length) {
      const arr = o.points;
      const step = Math.max(1, Math.ceil(arr.length / 50));
      for (let i = 0; i < arr.length; i += step) {
        const w = rotatePt(arr[i], ctr, rot);
        add(w.x, w.y);
      }
      const wp = rotatePt(arr[arr.length - 1], ctr, rot);
      add(wp.x, wp.y);
    } else {
      const verts = getVertices(o);
      if (verts && verts.length) {
        const wv = [];
        for (let i = 0; i < verts.length; i++) wv.push(rotatePt(verts[i], ctr, rot));
        for (let i = 0; i < wv.length; i++) add(wv[i].x, wv[i].y);
        if (wv.length <= 40) {
          for (let i = 0; i < wv.length; i++) {
            const a = wv[i], c = wv[(i + 1) % wv.length];
            add((a.x + c.x) / 2, (a.y + c.y) / 2);
          }
        }
      }
    }
  }
  return pts;
}
function beginSnap(excludeSet) {
  if (!snapEnabled) { snapCache = null; snapIndicator = null; return; }
  snapCache = collectSnapPoints(excludeSet);
  snapIndicator = null;
}
function endSnap() {
  snapCache = null;
  snapIndicator = null;
}
function findSnap(pt, radius) {
  if (!snapEnabled || !snapCache || !snapCache.length) return null;
  const R = radius || snapRadius;
  let best = null, bestD = R;
  for (let i = 0; i < snapCache.length; i++) {
    const c = snapCache[i];
    const d = Math.hypot(c.x - pt.x, c.y - pt.y);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}
function computeSnapFix(items) {
  if (!snapEnabled || !snapCache || !snapCache.length) { snapIndicator = null; return null; }
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const it of items) {
    const b = getWorldBBox(it.obj);
    if (!isFinite(b.x1)) continue;
    if (b.x1 < x1) x1 = b.x1;
    if (b.y1 < y1) y1 = b.y1;
    if (b.x2 > x2) x2 = b.x2;
    if (b.y2 > y2) y2 = b.y2;
  }
  if (!isFinite(x1)) { snapIndicator = null; return null; }
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const probes = [
    { x:x1, y:y1 }, { x:x2, y:y1 }, { x:x2, y:y2 }, { x:x1, y:y2 },
    { x:mx, y:my }, { x:mx, y:y1 }, { x:mx, y:y2 },
    { x:x1, y:my }, { x:x2, y:my }
  ];
  let best = null, bestD = snapRadius;
  for (const p of probes) {
    const s = findSnap(p);
    if (!s) continue;
    const d = Math.hypot(s.x - p.x, s.y - p.y);
    if (d < bestD) { bestD = d; best = { from: p, to: s }; }
  }
  if (!best) { snapIndicator = null; return null; }
  snapIndicator = best.to;
  return { dx: best.to.x - best.from.x, dy: best.to.y - best.from.y };
}
function drawSnapIndicator() {
  if (!snapIndicator) return;
  const x = snapIndicator.x, y = snapIndicator.y;
  pctx.save();
  pctx.lineWidth = 1.6;
  pctx.strokeStyle = 'rgba(56,189,248,.95)';
  pctx.shadowColor = 'rgba(56,189,248,.8)';
  pctx.shadowBlur = 8;
  pctx.beginPath();
  pctx.arc(x, y, 6.5, 0, Math.PI * 2);
  pctx.stroke();
  pctx.beginPath();
  pctx.moveTo(x - 13, y); pctx.lineTo(x - 5, y);
  pctx.moveTo(x + 5, y);  pctx.lineTo(x + 13, y);
  pctx.moveTo(x, y - 13); pctx.lineTo(x, y - 5);
  pctx.moveTo(x, y + 5);  pctx.lineTo(x, y + 13);
  pctx.stroke();
  pctx.restore();
}

/* ---- 直线 / 箭头：特殊角度吸附 ---- */
function snapLineAngle(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < LINE_SNAP_MIN_LEN) return null;

  const a = Math.atan2(dy, dx);
  let folded, toTarget;
  if (a >= 0 && a <= Math.PI / 2)      { folded = a;             toTarget = r => r; }
  else if (a > Math.PI / 2)            { folded = Math.PI - a;   toTarget = r => Math.PI - r; }
  else if (a >= -Math.PI / 2)          { folded = -a;            toTarget = r => -r; }
  else                                 { folded = Math.PI + a;   toTarget = r => r - Math.PI; }

  let bestR = null, bestD = LINE_SNAP_TOL;
  for (let i = 0; i < LINE_SNAP_ANGLES.length; i++) {
    const r = LINE_SNAP_ANGLES[i] * Math.PI / 180;
    const diff = Math.abs(folded - r);
    if (diff < bestD) { bestD = diff; bestR = r; }
  }
  if (bestR === null) return null;

  const target = toTarget(bestR);
  return { x: x1 + Math.cos(target) * len, y: y1 + Math.sin(target) * len };
}
const TRI_SNAP_ANGLES = [30, 37, 45, 53, 60];
const TRI_SNAP_TOL = 2 * Math.PI / 180;

function snapTriAngle(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < LINE_SNAP_MIN_LEN) return null;

  const angle = Math.atan2(Math.abs(dy), Math.abs(dx));
  let bestR = null, bestD = TRI_SNAP_TOL;
  for (let i = 0; i < TRI_SNAP_ANGLES.length; i++) {
    const r = TRI_SNAP_ANGLES[i] * Math.PI / 180;
    const diff = Math.abs(angle - r);
    if (diff < bestD) { bestD = diff; bestR = r; }
  }
  if (bestR === null) return null;

  const signX = dx >= 0 ? 1 : -1;
  const signY = dy >= 0 ? 1 : -1;
  return {
    x: x1 + signX * len * Math.cos(bestR),
    y: y1 + signY * len * Math.sin(bestR)
  };
}

/* =====================================================================
 * 21. 指针交互
 * ===================================================================== */
function onPointerDown(e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;

  if (textEditorEl && !textEditorEl.contains(e.target)) {
    commitTextEditor();
    return;
  }

  if (e.target.tagName !== 'CANVAS') return;
  e.preventDefault();
  hideMenu();
  const pt = { x: e.clientX, y: e.clientY };
  if (state.tool === 'select') selectDown(pt, e);
  else if (state.tool === 'pen') penDown(pt);
  else if (state.tool === 'eraser') eraseStart(e);
  else if (isShapeTool(state.tool)) shapeDown(pt);
}
function onPointerMove(e) {
  if (state.tool === 'eraser') {
    lastHoverPt = { x: e.clientX, y: e.clientY };
    lastEraserRadius = getEraserRadius(e);
    if (erasing) eraseMove(e);
    else drawPreview();
    return;
  }
  if (!drawing) {
    if (state.tool === 'select' && e.target.tagName === 'CANVAS') hoverCursor(e);
    return;
  }
  const pt = { x: e.clientX, y: e.clientY };
  if (state.tool === 'select') { selectMove(pt, e); return; }
  if (!current) return;
  if (current.points) {
    const last = current.points[current.points.length - 1];
    if (Math.hypot(pt.x - last.x, pt.y - last.y) < 1.2) return;
    current.points.push(pt);
  } else {
    const def = PB.shapes[current.type];
    const isLine = !!(def && def.geom === 'line');
    let end = pt;
    let angleLocked = false;

    if (e.shiftKey) {
      const dx = pt.x - current.x1, dy = pt.y - current.y1;
      if (isLine) {
        const len = Math.hypot(dx, dy), step = Math.PI / 4;
        const ang = Math.round(Math.atan2(dy, dx) / step) * step;
        end = { x: current.x1 + Math.cos(ang) * len, y: current.y1 + Math.sin(ang) * len };
      } else {
        const s = Math.max(Math.abs(dx), Math.abs(dy));
        end = { x: current.x1 + Math.sign(dx || 1) * s, y: current.y1 + Math.sign(dy || 1) * s };
      }
    } else if (isLine && !e.altKey) {
      const sa = snapLineAngle(current.x1, current.y1, pt.x, pt.y);
      if (sa) {
        end = { x: sa.x, y: sa.y };
        angleLocked = true;
      }
    } else if (current.type === 'isoTriangle' && !e.altKey) {
      const dxW = Math.abs(pt.x - current.x1);
      const dyH = Math.abs(pt.y - current.y1);
      if (dxW > 6 && dyH > 6) {
        const theta = Math.atan2(dyH, dxW / 2) * 180 / Math.PI;
        if (Math.abs(theta - 60) < 3) {
          const targetH = (dxW / 2) * Math.sqrt(3);
          const signY = (pt.y >= current.y1) ? 1 : -1;
          end = { x: pt.x, y: current.y1 + signY * targetH };
          angleLocked = true;
        }
      }
    } else if (current.type === 'rightTriangle' && !e.altKey) {
      const sa = snapTriAngle(current.x1, current.y1, pt.x, pt.y);
      if (sa) {
        end = { x: sa.x, y: sa.y };
        angleLocked = true;
      }
    }

    if (e.altKey) {
      snapIndicator = null;
    } else if (angleLocked) {
      snapIndicator = { x: end.x, y: end.y };
    } else {
      const sp = findSnap(end);
      if (sp) { end = { x: sp.x, y: sp.y }; snapIndicator = sp; }
      else snapIndicator = null;
    }

    current.x2 = end.x; current.y2 = end.y;
  }
  drawPreview();
}
function onPointerUp() {
  if (!drawing) return;
  if (erasing) { eraseEnd(); endSnap(); return; }
  endSnap();
  drawing = false;
  if (state.tool === 'select') {
    if (selState && selState.mode === 'marquee') finalizeMarquee();
    else if (selState && selState.changed && !selState.snapshotDone) {
      if (selState.mode === 'resize' && selState.lastAnchor && selection[0] && selection[0]._mask) {
        try {
          remapMask(selection[0], selState.startBBox, selState.lastAnchor,
                    selState.lastSX || 1, selState.lastSY || 1);
        } catch (err) {}
      }
      pushSnapshot();
    }
    selState = null; marquee = null;
    render(); drawPreview(); updateSelBar();
    return;
  }
  if (current && isMeaningful(current)) {
    objects.push(current);
    pages[pageIndex] = objects;
    pushSnapshot();
    const wasShape = isShapeTool(state.tool);
    current = null;
    render(); drawPreview();
    if (wasShape) setTool('select');
  } else {
    current = null;
    render(); drawPreview();
  }
}
function penDown(pt) {
  current = {
    type: '__freehand', points: [{x:pt.x, y:pt.y}],
    color: state.penColor, size: state.penSize,
    hasBorder: true, dash: state.penDash || 'solid',
    fill: false, rotation: 0
  };
  drawing = true; drawPreview();
}
function shapeDown(pt) {
  const def = PB.shapes[state.tool];
  if (def && def.geom === 'text') {
    startNewText(pt);
    return;
  }
  current = createShapeAt(pt);
  if (!current) return;
  beginSnap(null);
  drawing = true; drawPreview();
}
function selectDown(pt, e) {
  const ctrl = e.ctrlKey || e.metaKey;
  const shift = e.shiftKey;
  if (selection.length === 1 && !ctrl && !shift) {
    const o = selection[0];
    const vi = hitVertex(o, pt);
    if (vi !== null) {
      selState = { mode:'vertex', index:vi, startGeo:cloneGeo(o), startPt:pt, changed:false };
      beginSnap(new Set([o]));
      drawing = true; return;
    }
    const h = hitHandle(o, pt);
    if (h) {
      selState = {
        mode: h.id === 'rotate' ? 'rotate' : 'resize',
        handleId: h.id, startGeo: cloneGeo(o), startBBox: getBBox(o),
        startPt: pt, startRotation: o.rotation || 0, changed: false,
        lastAnchor: null, lastSX: 1, lastSY: 1
      };
      beginSnap(new Set([o]));
      drawing = true; return;
    }
  }
  let hit = null;
  for (let i = objects.length - 1; i >= 0; i--) {
    if (hitTest(objects[i], pt)) { hit = objects[i]; break; }
  }
  if (hit) {
    if (cloneMode) {
      let sources;
      if (selection.indexOf(hit) >= 0 && selection.length > 0) {
        sources = selection.slice();
      } else {
        sources = [hit];
        selection = [hit];
        updateSelBar();
      }
      selState = {
        mode: 'clone',
        sources: sources,
        startGeos: sources.map(o => cloneGeo(o)),
        startPt: pt,
        clones: null,
        changed: false,
        snapshotDone: false
      };
      drawing = true; setCursor('copy'); return;
    }
    if (ctrl) { if (selection.indexOf(hit) < 0) selection.push(hit); }
    else if (shift) {
      const i = selection.indexOf(hit);
      if (i >= 0) selection.splice(i, 1); else selection.push(hit);
      updateSelBar(); drawPreview(); return;
    } else if (selection.indexOf(hit) < 0) selection = [hit];
    updateSelBar();
    selState = {
      mode: 'move', startPt: pt, changed: false,
      items: selection.map(o => ({ obj:o, geo:cloneGeo(o) }))
    };
    beginSnap(new Set(selection));
    drawing = true; setCursor('move');
    return;
  }
  if (!ctrl && !shift) { selection = []; updateSelBar(); }
  marquee = { x1:pt.x, y1:pt.y, x2:pt.x, y2:pt.y };
  selState = { mode:'marquee', startPt:pt, additive: ctrl || shift };
  drawing = true; setCursor('crosshair');
}
function finalizeMarquee() {
  if (!marquee) return;
  const m = normRect(marquee);
  if (m.w < 4 && m.h < 4) return;
  const picked = objects.filter(o => rectsIntersect(getWorldBBox(o), m));
  if (selState.additive) {
    for (const o of picked) if (selection.indexOf(o) < 0) selection.push(o);
  } else selection = picked;
}
function selectMove(pt, e) {
  if (!drawing || !selState) return;

  if (selState.mode === 'clone') {
    const dx = pt.x - selState.startPt.x, dy = pt.y - selState.startPt.y;
    if (!selState.clones) {
      if (Math.hypot(dx, dy) < 4) return;
      selState.clones = selState.sources.map(o => {
        const c = copyObj(o);
        if (o._mask) c._mask = cloneCanvas(o._mask);
        return c;
      });
      objects.push(...selState.clones);
      pages[pageIndex] = objects;
      selection = selState.clones.slice();
      selState.changed = true;
      selState.snapshotDone = true;
      pushSnapshot();
      updateSelBar();
    }
    for (let i = 0; i < selState.clones.length; i++) {
      const c = selState.clones[i];
      applyGeo(c, selState.startGeos[i]);
      translateObj(c, dx, dy);
    }
    render(); drawPreview(); updateSelBarPosition();
    return;
  }

  if (selState.mode === 'marquee') {
    marquee.x2 = pt.x; marquee.y2 = pt.y;
    drawPreview(); return;
  }
  if (selState.mode === 'move') {
    let dx = pt.x - selState.startPt.x, dy = pt.y - selState.startPt.y;
    if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
    if (dx || dy) selState.changed = true;
    for (const it of selState.items) { applyGeo(it.obj, it.geo); translateObj(it.obj, dx, dy); }
    if (!e.altKey) {
      const fix = computeSnapFix(selState.items);
      if (fix) for (const it of selState.items) translateObj(it.obj, fix.dx, fix.dy);
    } else {
      snapIndicator = null;
    }
    render(); drawPreview(); updateSelBarPosition();
    return;
  }
  const o = selection[0];
  if (!o) return;
  selState.changed = true;
  if (selState.mode === 'vertex') {
    applyGeo(o, selState.startGeo);
    const rot = o.rotation || 0;
    let tx = pt.x, ty = pt.y;
    if (!e.altKey) {
      const sp = findSnap({ x: tx, y: ty });
      if (sp) { tx = sp.x; ty = sp.y; snapIndicator = sp; }
      else snapIndicator = null;
    } else snapIndicator = null;
    const dx = tx - selState.startPt.x, dy = ty - selState.startPt.y;
    const cos = Math.cos(-rot), sin = Math.sin(-rot);
    const ldx = dx*cos - dy*sin, ldy = dx*sin + dy*cos;
    if (o.points) { o.points[selState.index].x += ldx; o.points[selState.index].y += ldy; }
    else {
      const def = PB.shapes[o.type];
      if (def && def.geom === 'line') {
        if (selState.index === 0) { o.x1 += ldx; o.y1 += ldy; }
        else { o.x2 += ldx; o.y2 += ldy; }
      }
    }
  }
  else if (selState.mode === 'rotate') {
    const ctr = objCenter(o);
    const a0 = Math.atan2(selState.startPt.y - ctr.y, selState.startPt.x - ctr.x);
    const a1 = Math.atan2(pt.y - ctr.y, pt.x - ctr.x);
    o.rotation = selState.startRotation + (a1 - a0);
    if (e.shiftKey) { const step = Math.PI / 12; o.rotation = Math.round(o.rotation / step) * step; }
    snapIndicator = null;
  }
  else if (selState.mode === 'resize') {
    const b = selState.startBBox;
    const rot = o.rotation || 0;
    const bcx = (b.x1 + b.x2) / 2, bcy = (b.y1 + b.y2) / 2;
    const ctr = { x:bcx, y:bcy };

    let px = pt.x, py = pt.y;
    if (!e.altKey) {
      const sp = findSnap({ x:px, y:py });
      if (sp) { px = sp.x; py = sp.y; snapIndicator = sp; }
      else snapIndicator = null;
    } else snapIndicator = null;

    const dx = px - ctr.x, dy = py - ctr.y;
    const cos = Math.cos(-rot), sin = Math.sin(-rot);
    const lx = ctr.x + dx*cos - dy*sin, ly = ctr.y + dx*sin + dy*cos;

    let ax = bcx, ay = bcy, hx = bcx, hy = bcy, doX = false, doY = false;
    switch (selState.handleId) {
      case 'nw': ax=b.x2; ay=b.y2; hx=b.x1; hy=b.y1; doX=doY=true; break;
      case 'n':  ax=bcx;  ay=b.y2; hx=bcx;  hy=b.y1; doY=true; break;
      case 'ne': ax=b.x1; ay=b.y2; hx=b.x2; hy=b.y1; doX=doY=true; break;
      case 'e':  ax=b.x1; ay=bcy;  hx=b.x2; hy=bcy;  doX=true; break;
      case 'se': ax=b.x1; ay=b.y1; hx=b.x2; hy=b.y2; doX=doY=true; break;
      case 's':  ax=bcx;  ay=b.y1; hx=bcx;  hy=b.y2; doY=true; break;
      case 'sw': ax=b.x2; ay=b.y1; hx=b.x1; hy=b.y2; doX=doY=true; break;
      case 'w':  ax=b.x2; ay=bcy;  hx=b.x1; hy=bcy;  doX=true; break;
    }
    let sx = 1, sy = 1;
    if (doX && Math.abs(hx - ax) > 0.5) sx = (lx - ax) / (hx - ax);
    if (doY && Math.abs(hy - ay) > 0.5) sy = (ly - ay) / (hy - ay);
    if (e.shiftKey && doX && doY) {
      const s = Math.max(Math.abs(sx), Math.abs(sy));
      sx = s * Math.sign(sx || 1); sy = s * Math.sign(sy || 1);
    }
    sx = Math.max(0.03, sx); sy = Math.max(0.03, sy);
    applyGeo(o, selState.startGeo);
    scaleObj(o, { x:ax, y:ay }, sx, sy);
    selState.lastAnchor = { x:ax, y:ay };
    selState.lastSX = sx;
    selState.lastSY = sy;
  }
  render(); drawPreview(); updateSelBarPosition();
}
function hoverCursor(e) {
  if (drawing) return;
  const pt = { x: e.clientX, y: e.clientY };
  let cur = 'default';
  if (state.tool === 'pen' || isShapeTool(state.tool)) cur = 'crosshair';
  else if (state.tool === 'select') {
    if (selection.length === 1) {
      const o = selection[0];
      if (hitVertex(o, pt) !== null) cur = 'pointer';
      else {
        const h = hitHandle(o, pt);
        if (h) {
          if (h.id === 'rotate') cur = 'grab';
          else if (h.id === 'n' || h.id === 's') cur = 'ns-resize';
          else if (h.id === 'e' || h.id === 'w') cur = 'ew-resize';
          else if (h.id === 'nw' || h.id === 'se') cur = 'nwse-resize';
          else cur = 'nesw-resize';
        } else if (hitTest(o, pt)) cur = cloneMode ? 'copy' : 'move';
      }
    }
    if (cur === 'default') {
      for (let i = objects.length - 1; i >= 0; i--) {
        if (hitTest(objects[i], pt)) { cur = cloneMode ? 'copy' : 'move'; break; }
      }
    }
  }
  setCursor(cur);
}

board.addEventListener('dblclick', e => {
  if (textEditorEl) return;
  const pt = { x: e.clientX, y: e.clientY };
  for (let i = objects.length - 1; i >= 0; i--) {
    const o = objects[i];
    if (!isTextObj(o)) continue;
    if (hitTest(o, pt)) {
      if (state.tool !== 'select') setTool('select');
      selection = [o];
      updateSelBar();
      openTextEditor(o, false);
      return;
    }
  }
});

/* =====================================================================
 * 22. 快捷键
 * ===================================================================== */
window.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase();
  const inField = tag === 'input' || tag === 'textarea' || tag === 'select';

  if (e.key === 'Escape') {
    if (textEditorEl) { cancelTextEditor(); return; }
    if (document.querySelector('.modal.show')) {
      if (videoRunning) return;
      if (libConfirm.classList.contains('show')) { libConfirm.classList.remove('show'); return; }
      document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
      return;
    }
    if (eraseSliderEl) { eraseSliderEl.remove(); eraseSliderEl = null; return; }
    if (selection.length) { selection = []; updateSelBar(); drawPreview(); }
    hideMenu(); hideSubPanels(); thumbPanel.classList.remove('show');
    return;
  }
  if (textEditorEl) return;
  if (inField) return;
  if (document.querySelector('.modal.show')) return;
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault(); if (e.shiftKey) redo(); else undo(); return;
  }
  if (ctrl && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); return; }
  if (ctrl && (e.key === 'a' || e.key === 'A')) {
    e.preventDefault();
    if (state.tool !== 'select') setTool('select');
    selection = objects.slice();
    updateSelBar(); drawPreview();
    toast('已选中 ' + selection.length + ' 个图形');
    return;
  }
  if (ctrl && (e.key === 'g' || e.key === 'G')) {
    e.preventDefault();
    if (selection.length >= 2) openGroupModal();
    else toast('请先选中至少两个图形');
    return;
  }
  if (ctrl && (e.key === 'l' || e.key === 'L')) {
    e.preventDefault();
    openLibModal();
    return;
  }
  if (ctrl && (e.key === 'd' || e.key === 'D')) {
    e.preventDefault();
    if (!selection.length) return;
    const copies = selection.map(o => {
      const c = copyObj(o);
      if (o._mask) c._mask = cloneCanvas(o._mask);
      translateObj(c, 20, 20); return c;
    });
    objects.push(...copies);
    pages[pageIndex] = objects;
    selection = copies;
    pushSnapshot(); updateSelBar(); render(); drawPreview();
    return;
  }
  if (e.code === 'Space') { e.preventDefault(); togglePlayAll(); return; }
  if ((e.key === 'r' || e.key === 'R') && !ctrl) { e.preventDefault(); resetAnimAll(); return; }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (!selection.length) return;
    e.preventDefault();
    objects = objects.filter(o => selection.indexOf(o) < 0);
    pages[pageIndex] = objects;
    selection = [];
    pushSnapshot(); updateSelBar(); render(); drawPreview();
    if (!objects.length) setTool('pen', true);
    return;
  }
  if (e.key.startsWith('Arrow') && selection.length) {
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
    const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
    for (const o of selection) translateObj(o, dx, dy);
    render(); drawPreview(); updateSelBarPosition();
  }
});
window.addEventListener('wheel', e => {
  if (state.tool !== 'eraser') return;
  if (e.target.tagName !== 'CANVAS') return;
  e.preventDefault();
  eraserSizeMul += -Math.sign(e.deltaY) * 0.15;
  eraserSizeMul = Math.max(0.3, Math.min(3, eraserSizeMul));
  lastEraserRadius = getEraserRadius({ pointerType: 'mouse' });
  drawPreview();
  toast('橡皮大小：' + Math.round(eraserSizeMul * 100) + '%');
}, { passive: false });

/* =====================================================================
 * 23. 设置 / 菜单 / 弹窗
 * ===================================================================== */
function applyBg(id) {
  const preset = BG_PRESETS.find(p => p.id === id) || BG_PRESETS[0];
  state.bg = preset.id;
  document.body.style.background = preset.css;
  try { localStorage.setItem('pb_bg_id', preset.id); } catch (e) {}
  buildBgRow();
  if (preset.light && state.borderColor === '#e6edf7') {
    state.borderColor = '#1a1a1a'; state.penColor = '#1a1a1a';
  } else if (!preset.light && state.borderColor === '#1a1a1a') {
    state.borderColor = '#e6edf7'; state.penColor = '#e6edf7';
  }
}
function buildBgRow() {
  const row = document.getElementById('bgRow');
  row.innerHTML = '';
  BG_PRESETS.forEach(p => {
    const b = document.createElement('button');
    b.className = 'bg-opt' + (state.bg === p.id ? ' active' : '');
    b.innerHTML = '<span class="bg-dot" style="background:' + p.swatch + '"></span>' +
                  '<span>' + p.name + '</span>';
    b.addEventListener('click', () => applyBg(p.id));
    row.appendChild(b);
  });
}
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
['settingsModal','aboutModal','helpModal','exportModal','videoModal','groupModal','libModal','miniappModal'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', e => {
    if (e.target.id !== id) return;
    if (videoRunning) return;
    if (id === 'libModal' && libConfirm.classList.contains('show')) return;
    closeModal(id);
  });
});
document.getElementById('settingsClose').addEventListener('click', () => closeModal('settingsModal'));
document.getElementById('aboutClose').addEventListener('click', () => closeModal('aboutModal'));
document.getElementById('helpClose').addEventListener('click', () => closeModal('helpModal'));
document.getElementById('miniappClose').addEventListener('click', () => closeModal('miniappModal'));
function hideMenu() { menuPop.classList.remove('show'); }
document.getElementById('menuBtn').addEventListener('click', e => {
  e.stopPropagation(); menuPop.classList.toggle('show');
});
menuPop.addEventListener('click', e => {
  const btn = e.target.closest('.menu-item');
  if (!btn) return;
  const act = btn.dataset.act;
  hideMenu();
  if (act === 'miniapp') openMiniappLauncher();
  else if (act === 'savefile') exportDocFile();
  else if (act === 'loadfile') loadDocFile();
  else if (act === 'export') openExportModal();
  else if (act === 'video') openVideoModal();
  else if (act === 'group') {
    if (state.tool !== 'select') setTool('select');
    if (selection.length >= 2) openGroupModal();
    else toast('请先框选 / 多选两个以上图形，再执行组合');
  }
  else if (act === 'lib') openLibModal();
  else if (act === 'about') openModal('aboutModal');
  else if (act === 'help') openModal('helpModal');
  else if (act === 'settings') openModal('settingsModal');
});
document.addEventListener('click', e => {
  if (!menuPop.contains(e.target) && !e.target.closest('#menuBtn')) hideMenu();
});

(function setupSnapControls() {
  const row = document.getElementById('snapToggleRow');
  if (row) {
    row.addEventListener('click', e => {
      const b = e.target.closest('.seg-btn');
      if (!b) return;
      snapEnabled = b.dataset.val === 'on';
      try { localStorage.setItem(SNAP_LS_ENABLED, snapEnabled ? 'on' : 'off'); } catch (err) {}
      syncSnapUI();
      toast(snapEnabled
        ? '已开启吸附（半径 ' + snapRadius + ' px）'
        : '已关闭吸附');
    });
  }
  const slider = document.getElementById('snapRadius');
  const valEl  = document.getElementById('snapRadiusVal');
  if (slider) {
    slider.addEventListener('input', () => {
      snapRadius = parseInt(slider.value, 10) || SNAP_DEFAULT_RADIUS;
      if (valEl) valEl.textContent = snapRadius + ' px';
      try { localStorage.setItem(SNAP_LS_RADIUS, String(snapRadius)); } catch (err) {}
    });
  }
})();

function updateSaveDirUI() {
  const info = document.getElementById('saveDirInfo');
  const resetBtn = document.getElementById('resetSaveDirBtn');
  const tip = document.getElementById('exportDirTip');
  if (info) {
    if (saveDirHandle) {
      info.textContent = '📁 ' + (saveDirHandle.name || '已选择文件夹');
      info.classList.add('custom');
    } else {
      info.textContent = '默认下载位置';
      info.classList.remove('custom');
    }
  }
  if (resetBtn) resetBtn.style.display = saveDirHandle ? '' : 'none';
  if (tip) {
    tip.innerHTML = '保存位置：' + (saveDirHandle
      ? '<b>' + (saveDirHandle.name || '文件夹') + '</b>'
      : '默认下载位置');
  }
}

document.getElementById('pickSaveDirBtn').addEventListener('click', async () => {
  if (!window.showDirectoryPicker) {
    alert('当前浏览器不支持选择文件夹，请使用 Chrome / Edge，并通过 http(s) 或 localhost 打开页面。');
    return;
  }
  try {
    const h = await window.showDirectoryPicker({ mode: 'readwrite' });
    let perm = await h.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') perm = await h.requestPermission({ mode: 'readwrite' });
    if (perm !== 'granted') { toast('未获得文件夹写入权限'); return; }
    saveDirHandle = h;
    await idbSet('saveDirHandle', h);
    updateSaveDirUI();
    toast('已设置保存位置：' + (h.name || '文件夹'));
  } catch (e) {}
});

document.getElementById('resetSaveDirBtn').addEventListener('click', async () => {
  saveDirHandle = null;
  await idbSet('saveDirHandle', null);
  updateSaveDirUI();
  toast('已恢复为默认下载位置');
});

(async () => {
  try {
    const h = await idbGet('saveDirHandle');
    if (h) { saveDirHandle = h; updateSaveDirUI(); }
  } catch (e) {}
})();

function dataURLToBlob(dataURL) {
  const arr = dataURL.split(',');
  const m = arr[0].match(/:(.*?);/);
  const mime = m ? m[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new Blob([u8], { type: mime });
}

async function saveImageBlob(blob, filename) {
  if (saveDirHandle) {
    try {
      let perm = await saveDirHandle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') perm = await saveDirHandle.requestPermission({ mode: 'readwrite' });
      if (perm === 'granted') {
        const fh = await saveDirHandle.getFileHandle(filename, { create: true });
        const w = await fh.createWritable();
        await w.write(blob);
        await w.close();
        return { ok: true, location: (saveDirHandle.name || '文件夹') + ' / ' + filename };
      }
    } catch (e) {
      console.warn('写入指定文件夹失败，回退下载：', e);
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
  return { ok: true, location: '下载文件夹 / ' + filename };
}

function showEraseSlider() {
  if (eraseSliderEl) { eraseSliderEl.remove(); eraseSliderEl = null; }
  const btn = document.querySelector('.dbtn[data-tool="eraser"]');
  if (!btn) return;
  eraseSliderEl = document.createElement('div');
  eraseSliderEl.className = 'erase-slider-panel';
  eraseSliderEl.innerHTML =
    '<div class="erase-slider-label">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M8.5 20l-4.2-4.2a2 2 0 0 1 0-2.8l7.3-7.3a2 2 0 0 1 2.8 0l4.7 4.7a2 2 0 0 1 0 2.8L13.2 20H8.5z"/>' +
        '<path d="M20 20h-9"/></svg>' +
      '向右滑动清除本页' +
    '</div>' +
    '<input type="range" min="0" max="100" value="0" step="1">';
  document.body.appendChild(eraseSliderEl);
  const r = btn.getBoundingClientRect();
  const pw = eraseSliderEl.offsetWidth, ph = eraseSliderEl.offsetHeight;
  let left = r.left + r.width / 2 - pw / 2;
  let top = r.top - ph - 12;
  if (left < 12) left = 12;
  if (left + pw > window.innerWidth - 12) left = window.innerWidth - pw - 12;
  if (top < 12) top = r.bottom + 12;
  eraseSliderEl.style.left = left + 'px';
  eraseSliderEl.style.top = top + 'px';
  const inp = eraseSliderEl.querySelector('input');
  inp.addEventListener('input', () => {
    if (+inp.value >= 100) {
      objects.length = 0;
      pages[pageIndex] = objects;
      selection = [];
      pushSnapshot(); updateSelBar(); render(); drawPreview();
      toast('已清除本页');
      setTool('pen', true);
      setTimeout(() => {
        if (eraseSliderEl) { eraseSliderEl.remove(); eraseSliderEl = null; }
      }, 150);
    }
  });
  setTimeout(() => {
    document.addEventListener('mousedown', function closeOnOutside(ev) {
      if (eraseSliderEl && !eraseSliderEl.contains(ev.target) && ev.target !== btn && !btn.contains(ev.target)) {
        eraseSliderEl.remove();
        eraseSliderEl = null;
        document.removeEventListener('mousedown', closeOnOutside);
      }
    });
  }, 50);
}

/* =====================================================================
 * 24. 导出（图片）
 * ===================================================================== */
function openExportModal() {
  document.getElementById('exportCurrentNum').textContent = (pageIndex + 1);
  document.querySelector('input[name="exportMode"][value="current"]').checked = true;
  document.getElementById('exportRange').value = '';
  updateSaveDirUI();
  openModal('exportModal');
}
document.querySelectorAll('.export-opt').forEach(opt => {
  opt.addEventListener('click', e => {
    if (e.target && e.target.id === 'exportRange') return;
    const radio = opt.querySelector('input[type=radio]');
    if (radio) {
      radio.checked = true;
      if (radio.value === 'range') {
        setTimeout(() => {
          const inp = document.getElementById('exportRange');
          if (inp) inp.focus();
        }, 0);
      }
    }
  });
});
document.getElementById('exportCancel').addEventListener('click', () => closeModal('exportModal'));
document.getElementById('exportOk').addEventListener('click', () => {
  const mode = (document.querySelector('input[name="exportMode"]:checked') || {}).value || 'current';
  closeModal('exportModal');
  if (mode === 'current') exportPageImage(pageIndex);
  else if (mode === 'all') exportAllPages();
  else if (mode === 'range') {
    const txt = (document.getElementById('exportRange').value || '').trim();
    const list = parsePageRange(txt, pages.length);
    if (!list.length) { toast('页码范围无效'); return; }
    exportPagesList(list);
  }
});
function parsePageRange(txt, total) {
  if (!txt) return [];
  const res = new Set();
  const parts = txt.split(/[,，\s]+/).filter(Boolean);
  for (const p of parts) {
    const m = p.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) continue;
    let a = parseInt(m[1], 10);
    let b = m[2] ? parseInt(m[2], 10) : a;
    if (isNaN(a) || isNaN(b)) continue;
    if (a > b) { const t = a; a = b; b = t; }
    a = Math.max(1, a); b = Math.min(total, b);
    for (let i = a; i <= b; i++) res.add(i - 1);
  }
  return [...res].sort((x, y) => x - y);
}
function makeExportCanvas(pageObjs) {
  const tmp = document.createElement('canvas');
  tmp.width = board.width;
  tmp.height = board.height;
  const tc = tmp.getContext('2d');
  const preset = BG_PRESETS.find(p => p.id === state.bg) || BG_PRESETS[0];
  const cols = preset.colors || ['#060c18', '#0a1428', '#0b1020'];
  const grad = tc.createLinearGradient(0, 0, tmp.width, tmp.height);
  grad.addColorStop(0, cols[0]);
  grad.addColorStop(0.5, cols[1]);
  grad.addColorStop(1, cols[2]);
  tc.fillStyle = grad;
  tc.fillRect(0, 0, tmp.width, tmp.height);
  tc.save();
  tc.setTransform(dpr, 0, 0, dpr, 0, 0);
  const saved = objects;
  objects = pageObjs;
  try {
    for (const o of pageObjs) {
      try { drawObject(tc, o); } catch (e) {}
    }
  } finally { objects = saved; }
  tc.restore();
  return tmp;
}
async function exportPageImage(idx) {
  const tmp = makeExportCanvas(pages[idx]);
  const filename = '白板_第' + (idx + 1) + '页_' +
                   new Date().toISOString().slice(0,19).replace(/[:T]/g,'-') + '.png';
  const blob = dataURLToBlob(tmp.toDataURL('image/png'));
  const r = await saveImageBlob(blob, filename);
  toast('已保存到：' + r.location, 3600);
}
async function exportAllPages() {
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  let lastLoc = '';
  let n = 0;
  for (let i = 0; i < pages.length; i++) {
    const tmp = makeExportCanvas(pages[i]);
    const filename = '白板_第' + (i + 1) + '页_' + ts + '.png';
    const blob = dataURLToBlob(tmp.toDataURL('image/png'));
    const r = await saveImageBlob(blob, filename);
    lastLoc = r.location;
    n++;
    if (i < pages.length - 1) await new Promise(res => setTimeout(res, 120));
  }
  const dir = lastLoc.includes(' / ') ? lastLoc.split(' / ')[0] : lastLoc;
  toast('已保存 ' + n + ' 张到：' + dir, 3600);
}
async function exportPagesList(list) {
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  let lastLoc = '';
  let n = 0;
  for (let k = 0; k < list.length; k++) {
    const idx = list[k];
    const tmp = makeExportCanvas(pages[idx]);
    const filename = '白板_第' + (idx + 1) + '页_' + ts + '.png';
    const blob = dataURLToBlob(tmp.toDataURL('image/png'));
    const r = await saveImageBlob(blob, filename);
    lastLoc = r.location;
    n++;
    if (k < list.length - 1) await new Promise(res => setTimeout(res, 120));
  }
  const dir = lastLoc.includes(' / ') ? lastLoc.split(' / ')[0] : lastLoc;
  toast('已保存 ' + n + ' 张到：' + dir, 3600);
}

/* =====================================================================
 * 24.5 动画视频导出
 * ===================================================================== */
let videoRunning = false;
let videoAbort = false;
let videoRec = null;

function pickVideoMime() {
  const list = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4'
  ];
  for (const m of list) {
    try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) {}
  }
  return '';
}
function extFromMime(t) { return /mp4/i.test(t || '') ? 'mp4' : 'webm'; }

function paintVideoFrame(c2, cv, objs) {
  const preset = BG_PRESETS.find(p => p.id === state.bg) || BG_PRESETS[0];
  const cols = preset.colors || ['#060c18', '#0a1428', '#0b1020'];

  c2.setTransform(1, 0, 0, 1, 0, 0);
  const grad = c2.createLinearGradient(0, 0, cv.width, cv.height);
  grad.addColorStop(0, cols[0]);
  grad.addColorStop(0.5, cols[1]);
  grad.addColorStop(1, cols[2]);
  c2.fillStyle = grad;
  c2.fillRect(0, 0, cv.width, cv.height);

  const s = cv.width / W;
  c2.setTransform(s, 0, 0, s, 0, 0);
  for (const o of objs) {
    try { drawObject(c2, o); } catch (e) {}
  }
  c2.setTransform(1, 0, 0, 1, 0, 0);
}

async function recordPageVideo(pageIdx, opts, onProgress) {
  const duration = opts.duration;
  const fps = opts.fps;
  const scale = opts.scale;

  let baseScale = Math.min(window.devicePixelRatio || 1, 2) * scale;
  const maxPixels = 1920 * 1080 * 4;
  const px = W * H * baseScale * baseScale;
  if (px > maxPixels) baseScale *= Math.sqrt(maxPixels / px);

  const outW = Math.max(16, Math.round(W * baseScale));
  const outH = Math.max(16, Math.round(H * baseScale));

  const cv = document.createElement('canvas');
  cv.width = outW; cv.height = outH;
  const c2 = cv.getContext('2d');

  const mime = pickVideoMime();
  if (!mime) throw new Error('浏览器不支持视频录制（MediaRecorder）');

  const stream = cv.captureStream(fps);

  let rec;
  try {
    rec = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: Math.min(
        16000000,
        Math.max(2500000, Math.round(outW * outH * fps * 0.08))
      )
    });
  } catch (e) {
    rec = new MediaRecorder(stream);
  }

  const chunks = [];
  rec.ondataavailable = ev => { if (ev.data && ev.data.size) chunks.push(ev.data); };
  const stopped = new Promise(res => rec.addEventListener('stop', res, { once: true }));

  const savedObjects = objects;
  const savedDpr = dpr;
  const pageObjs = pages[pageIdx];
  const animObjs = pageObjs.filter(isAnimObj);

  stopAnimLoop();
  for (const o of animObjs) {
    ensureAnimFields(o);
    o.animPlaying = false;
    o.animT = 0;
  }

  objects = pageObjs;
  dpr = baseScale;

  paintVideoFrame(c2, cv, pageObjs);

  rec.start(250);
  videoRec = rec;

  await new Promise(r => setTimeout(r, 120));

  const t0 = performance.now();
  let lastSent = -1;

  await new Promise(resolve => {
    const step = () => {
      if (videoAbort) { resolve(); return; }
      const el = (performance.now() - t0) / 1000;
      if (el >= duration) { resolve(); return; }

      for (const o of animObjs) o.animT = el * (o.animSpeed || 1);
      paintVideoFrame(c2, cv, pageObjs);

      const p = Math.min(1, el / duration);
      if (onProgress && p - lastSent > 0.01) {
        lastSent = p;
        onProgress(p);
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  const aborted = videoAbort;

  for (const o of animObjs) o.animT = duration * (o.animSpeed || 1);
  paintVideoFrame(c2, cv, pageObjs);
  await new Promise(r => setTimeout(r, 280));

  if (rec.state !== 'inactive') rec.stop();
  await stopped;
  videoRec = null;

  dpr = savedDpr;
  objects = savedObjects;
  for (const o of animObjs) {
    o.animT = 0;
    o.animPlaying = false;
  }
  updatePlayButtons();
  render();
  drawPreview();

  if (aborted) return null;
  return new Blob(chunks, { type: mime.split(';')[0] });
}

document.querySelectorAll('.seg-row').forEach(row => {
  row.addEventListener('click', e => {
    const b = e.target.closest('.seg-btn');
    if (!b) return;
    if (row.id === 'snapToggleRow') return;
    row.querySelectorAll('.seg-btn').forEach(x => x.classList.toggle('active', x === b));
  });
});
function segVal(id) {
  const b = document.querySelector('#' + id + ' .seg-btn.active');
  return b ? b.dataset.val : null;
}

(function () {
  const dur = document.getElementById('videoDur');
  const lab = document.getElementById('videoDurVal');
  if (!dur) return;
  dur.addEventListener('input', () => {
    lab.textContent = (+dur.value).toFixed(1) + 's';
  });
})();

function openVideoModal() {
  openModal('videoModal');
}

document.getElementById('videoCancel').addEventListener('click', () => {
  if (videoRunning) { videoAbort = true; return; }
  closeModal('videoModal');
});

document.getElementById('videoOk').addEventListener('click', async () => {
  if (videoRunning) return;

  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    toast('当前浏览器不支持视频录制，请使用 Chrome / Edge');
    return;
  }

  const scope = segVal('videoScopeRow') || 'current';
  const duration = Math.max(0.5, +document.getElementById('videoDur').value || 5);
  const fps = +(segVal('videoFpsRow') || 30);
  const scale = +(segVal('videoResRow') || 1);

  const list = scope === 'all' ? pages.map((_, i) => i) : [pageIndex];

  const okBtn = document.getElementById('videoOk');
  const cancelBtn = document.getElementById('videoCancel');
  const progWrap = document.getElementById('videoProgressWrap');
  const progFill = document.getElementById('videoProgressFill');
  const progText = document.getElementById('videoProgressText');

  videoRunning = true;
  videoAbort = false;
  okBtn.disabled = true;
  okBtn.textContent = '录制中…';
  cancelBtn.textContent = '停止';
  progWrap.classList.add('show');
  progFill.style.width = '0%';
  progText.textContent = '0%';

  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  let savedCount = 0;
  let lastLoc = '';

  try {
    for (let k = 0; k < list.length; k++) {
      if (videoAbort) break;
      const idx = list[k];

      const blob = await recordPageVideo(idx, { duration, fps, scale }, p => {
        const overall = (k + p) / list.length;
        progFill.style.width = (overall * 100).toFixed(1) + '%';
        progText.textContent = Math.round(overall * 100) + '%';
      });

      if (videoAbort || !blob) break;

      const ext = extFromMime(blob.type);
      const filename = '白板动画_第' + (idx + 1) + '页_' + ts + '.' + ext;
      const r = await saveImageBlob(blob, filename);
      lastLoc = r.location;
      savedCount++;

      progFill.style.width = ((k + 1) / list.length * 100).toFixed(1) + '%';
      progText.textContent = Math.round((k + 1) / list.length * 100) + '%';
    }

    if (savedCount > 0) {
      const dir = lastLoc.includes(' / ') ? lastLoc.split(' / ')[0] : lastLoc;
      toast('已导出 ' + savedCount + ' 个视频到：' + dir, 3800);
    } else {
      toast('已取消导出');
    }
  } catch (err) {
    console.error(err);
    toast('导出失败：' + (err && err.message ? err.message : '未知错误'), 3200);
  } finally {
    videoRunning = false;
    videoAbort = false;
    videoRec = null;
    okBtn.disabled = false;
    okBtn.textContent = '开始录制';
    cancelBtn.textContent = '取消';
    progWrap.classList.remove('show');
    progFill.style.width = '0%';
    closeModal('videoModal');
    render();
    drawPreview();
  }
});

/* =====================================================================
 * 24.7 导出 / 加载工程文件（.json）
 * ===================================================================== */
const PB_FILE_TYPE = 'physboard-doc';
const PB_FILE_VERSION = 1;

function serializeObject(o) {
  const t = copyObj(o);
  delete t._mask;
  if (o._mask) {
    try { t._maskData = o._mask.toDataURL('image/png'); } catch (e) {}
    t._maskPad = o._maskPad || MASK_PAD;
  }
  return t;
}

function loadMaskInto(o, dataURL) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width  = img.naturalWidth  || img.width  || 1;
        cv.height = img.naturalHeight || img.height || 1;
        cv.getContext('2d').drawImage(img, 0, 0);
        o._mask = cv;
        if (!o._maskPad) o._maskPad = MASK_PAD;
      } catch (e) {}
      resolve();
    };
    img.onerror = () => resolve();
    img.src = dataURL;
  });
}

function serializeDoc() {
  const customShapes = {};
  for (const k in PB.shapes) {
    const s = PB.shapes[k];
    if (s.custom && s.parts) {
      const catObj = (PB.categories || []).find(c => c.id === s.cat);
      customShapes[k] = {
        key: k,
        label: s.label || k,
        cat: s.cat,
        catLabel: catObj ? catObj.label : s.cat,
        baseW: s.baseW,
        baseH: s.baseH,
        parts: s.parts,
        icon: s.icon || CUSTOM_ICON
      };
    }
  }
  return {
    app: '唐长老超级物理白板',
    type: PB_FILE_TYPE,
    version: PB_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    bg: state.bg,
    pageIndex: pageIndex,
    pages: pages.map(pg => pg.map(serializeObject)),
    customShapes: customShapes
  };
}

async function exportDocFile() {
  let doc;
  try { doc = serializeDoc(); }
  catch (e) { toast('导出失败：' + (e && e.message ? e.message : e)); return; }

  const text = JSON.stringify(doc);
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const filename = '白板工程_' +
    new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.json';

  try {
    const r = await saveImageBlob(blob, filename);
    const pagesN = doc.pages.length;
    const shapesN = Object.keys(doc.customShapes).length;
    toast('已导出 ' + pagesN + ' 页' +
          (shapesN ? '（含 ' + shapesN + ' 个自定义图形）' : '') +
          ' → ' + r.location, 4200);
  } catch (e) {
    toast('导出失败：' + (e && e.message ? e.message : e), 3400);
  }
}

function stopAllAnimations() {
  for (const pg of pages) {
    for (const o of pg) {
      if (isAnimObj(o)) { ensureAnimFields(o); o.animPlaying = false; }
    }
  }
  stopAnimLoop();
  updatePlayButtons();
}

async function applyDoc(doc) {
  if (!doc || typeof doc !== 'object') throw new Error('文件内容为空或格式错误');
  if (doc.type && doc.type !== PB_FILE_TYPE) throw new Error('这不是本白板导出的工程文件');
  if (!Array.isArray(doc.pages) || !doc.pages.length) throw new Error('文件中没有页面数据');
  if (doc.version && doc.version > PB_FILE_VERSION) {
    if (!confirm('该文件由更新版本导出（v' + doc.version + '），可能无法完整加载。\n仍要继续吗？')) return;
  }
  if (!confirm('加载文件会替换当前所有页面。\n当前内容仍可用 Ctrl+Z 撤销。\n\n确定继续吗？')) return;

  let newShapes = 0;
  if (doc.customShapes && typeof doc.customShapes === 'object') {
    for (const k in doc.customShapes) {
      const rec = doc.customShapes[k];
      if (!rec || !Array.isArray(rec.parts) || !rec.parts.length) continue;
      if (PB.shapes[k]) continue;

      const catId = rec.cat || 'custom';
      PB.shapes[k] = buildCustomDef({
        id: k,
        label: rec.label || k,
        cat: catId,
        baseW: rec.baseW || 100,
        baseH: rec.baseH || 100,
        parts: rec.parts,
        icon: rec.icon || CUSTOM_ICON
      });
      ensureCategory(catId, rec.catLabel || catId);
      newShapes++;

      try {
        await csSaveRecord({
          id: k, label: rec.label || k,
          catId: catId, catLabel: rec.catLabel || catId,
          baseW: rec.baseW || 100, baseH: rec.baseH || 100,
          parts: rec.parts, icon: rec.icon || CUSTOM_ICON
        });
      } catch (e) {}
    }
  }

  const maskTasks = [];
  let unknown = 0;

  const newPages = doc.pages.map(pg => {
    const arr = [];
    if (!Array.isArray(pg)) return arr;
    for (const raw of pg) {
      if (!raw || typeof raw !== 'object' || !raw.type) continue;
      if (!PB.shapes[raw.type]) { unknown++; continue; }

      const o = copyObj(raw);
      const maskData = o._maskData;
      delete o._maskData;
      if (!o._maskPad) o._maskPad = MASK_PAD;

      if (isTextObj(o)) { try { measureText(o); } catch (e) {} }
      arr.push(o);

      if (typeof maskData === 'string' && maskData.slice(0, 11) === 'data:image/') {
        maskTasks.push(loadMaskInto(o, maskData));
      }
    }
    return arr;
  });

  if (!newPages.length) newPages.push([]);
  await Promise.all(maskTasks);

  stopAllAnimations();
  pushSnapshot();

  pages = newPages;
  pageIndex = Math.min(Math.max(0, parseInt(doc.pageIndex, 10) || 0), pages.length - 1);
  objects = pages[pageIndex];
  selection = [];
  current = null;
  drawing = false;
  erasing = false;
  marquee = null;
  selState = null;

  if (doc.bg && BG_PRESETS.some(p => p.id === doc.bg)) applyBg(doc.bg);

  buildShapePanel();
  setTool('select', true);
  updateSelBar();
  updatePageUI();
  updateHistoryButtons();
  render();
  drawPreview();
  if (thumbPanel.classList.contains('show')) buildThumbnails();

  let msg = '已加载 ' + pages.length + ' 页内容';
  if (newShapes) msg += '，新增 ' + newShapes + ' 个自定义图形';
  if (unknown) msg += '（' + unknown + ' 个图形未识别，已跳过）';
  toast(msg, 4200);
}

function loadDocFile() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.json,application/json';
  inp.style.display = 'none';
  document.body.appendChild(inp);

  inp.onchange = async () => {
    const f = inp.files && inp.files[0];
    setTimeout(() => inp.remove(), 0);
    if (!f) return;
    try {
      const text = await f.text();
      const doc = JSON.parse(text);
      await applyDoc(doc);
    } catch (e) {
      console.error(e);
      toast('加载失败：' + (e && e.message ? e.message : e), 3600);
    }
  };
  inp.click();
}

(function setupDocDrop() {
  let dragDepth = 0;
  window.addEventListener('dragenter', e => {
    if (!e.dataTransfer) return;
    const hasFile = Array.from(e.dataTransfer.types || []).indexOf('Files') >= 0;
    if (!hasFile) return;
    dragDepth++;
  });
  window.addEventListener('dragover', e => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types || []).indexOf('Files') >= 0) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  });
  window.addEventListener('dragleave', () => { dragDepth = Math.max(0, dragDepth - 1); });
  window.addEventListener('drop', async e => {
    dragDepth = 0;
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    if (!/\.json$/i.test(f.name)) return;
    e.preventDefault();
    try {
      const text = await f.text();
      const doc = JSON.parse(text);
      await applyDoc(doc);
    } catch (err) {
      console.error(err);
      toast('加载失败：' + (err && err.message ? err.message : err), 3600);
    }
  });
})();

/* =====================================================================
 * 25. 缩略图
 * ===================================================================== */
pgLabel.addEventListener('click', () => {
  if (thumbPanel.classList.contains('show')) thumbPanel.classList.remove('show');
  else { buildThumbnails(); thumbPanel.classList.add('show'); }
});
document.addEventListener('click', e => {
  if (!thumbPanel.classList.contains('show')) return;
  if (thumbPanel.contains(e.target)) return;
  if (e.target.closest('.corner-br')) return;
  thumbPanel.classList.remove('show');
});
function buildThumbnails() {
  thumbScroll.innerHTML = '';
  const frag = document.createDocumentFragment();
  pages.forEach((pg, i) => {
    const item = document.createElement('div');
    item.className = 'thumb-item' + (i === pageIndex ? ' active' : '');
    item.title = '第 ' + (i + 1) + ' 页';
    const cvs = document.createElement('canvas');
    const thumbW = 240, thumbH = 150;
    const scale = Math.min(thumbW / W, thumbH / H);
    cvs.width = thumbW; cvs.height = thumbH;
    const tctx = cvs.getContext('2d');
    const preset = BG_PRESETS.find(p => p.id === state.bg) || BG_PRESETS[0];
    tctx.fillStyle = preset.light ? '#eef2f8' : '#0d1830';
    tctx.fillRect(0, 0, thumbW, thumbH);
    tctx.save();
    tctx.scale(scale, scale);
    for (const o of pg) { try { drawObject(tctx, o); } catch (err) {} }
    tctx.restore();
    const img = document.createElement('img');
    img.src = cvs.toDataURL('image/png');
    img.alt = '第 ' + (i + 1) + ' 页';
    item.appendChild(img);
    const num = document.createElement('div');
    num.className = 'thumb-num';
    num.textContent = i + 1;
    item.appendChild(num);
    item.addEventListener('click', (e) => {
      if (item._noClick) return;
      e.stopPropagation();
      goPage(i);
    });
    attachThumbDragDelete(item, i);
    frag.appendChild(item);
  });
  thumbScroll.appendChild(frag);
  thumbCount.textContent = '共 ' + pages.length + ' 页';
}
function attachThumbDragDelete(item, idx) {
  let pid = null, sx = 0, sy = 0, dx = 0, decided = false, dragging = false;
  const THRESH = 96, ARM = 60;

  item.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    pid = e.pointerId; sx = e.clientX; sy = e.clientY;
    dx = 0; decided = false; dragging = false;
    item.style.transition = 'none';
  });

  item.addEventListener('pointermove', e => {
    if (pid !== e.pointerId) return;
    const mx = e.clientX - sx, my = e.clientY - sy;

    if (!decided) {
      if (Math.abs(mx) > 8 && Math.abs(mx) >= Math.abs(my)) {
        decided = true; dragging = true;
        item.classList.add('tdragging');
        try { item.setPointerCapture(e.pointerId); } catch (err) {}
      } else if (Math.abs(my) > 10) {
        decided = true; dragging = false;
      } else return;
    }
    if (!dragging) return;

    if (e.cancelable) e.preventDefault();
    dx = Math.max(-30, mx);
    item.style.transform = 'translateX(' + dx + 'px)';
    item.style.opacity = String(1 - Math.min(1, Math.max(0, dx) / THRESH) * 0.45);
    item.classList.toggle('tarmed', dx >= ARM);
  }, { passive: false });

  const end = e => {
    if (pid !== e.pointerId) return;
    pid = null;
    if (!dragging) { item.style.transition = ''; decided = false; return; }

    item._noClick = true;
    setTimeout(() => { item._noClick = false; }, 450);
    item.classList.remove('tdragging');
    item.style.transition = 'transform .2s ease, opacity .2s ease';

    if (dx >= THRESH) {
      item.classList.add('tarmed');
      item.style.transform = 'translateX(135%)';
      item.style.opacity = '0';
      setTimeout(() => deletePage(idx), 180);
    } else {
      item.classList.remove('tarmed');
      item.style.transform = '';
      item.style.opacity = '';
    }
    dragging = false; decided = false;
  };
  item.addEventListener('pointerup', end);
  item.addEventListener('pointercancel', end);

  item.addEventListener('click', e => {
    if (item._noClick) { e.stopPropagation(); e.preventDefault(); }
  }, true);
}

/* =====================================================================
 * 26. 小程序（内置）
 * ===================================================================== */
const widgetLayer = document.getElementById('widgetLayer');
let widgetZ = 62;
let widgetSpawnCount = 0;
const openWidgets = new Map();

function makeWidgetDraggable(el) {
  const handle = el.querySelector('.widget-head');
  if (!handle) return;
  let startX = 0, startY = 0, startLeft = 0, startTop = 0, activeId = null;

  const onDown = e => {
    if (e.target.closest('.widget-close, .widget-zoom, button, input, textarea, select, .mini-btn')) return;
    const rect = el.getBoundingClientRect();
    startX = e.clientX; startY = e.clientY;
    startLeft = rect.left; startTop = rect.top;
    el.style.left = startLeft + 'px';
    el.style.top = startTop + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    widgetZ++;
    el.style.zIndex = widgetZ;
    activeId = e.pointerId;
    try { handle.setPointerCapture(activeId); } catch (err) {}
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  };
  const onMove = e => {
    if (e.pointerId !== activeId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let nl = startLeft + dx, nt = startTop + dy;
    const rect = el.getBoundingClientRect();
    const maxL = window.innerWidth - rect.width - 4;
    const maxT = window.innerHeight - rect.height - 4;
    nl = Math.max(-rect.width + 60, Math.min(maxL, nl));
    nt = Math.max(0, Math.min(maxT, nt));
    el.style.left = nl + 'px';
    el.style.top = nt + 'px';
  };
  const onUp = e => {
    if (e.pointerId !== activeId) return;
    activeId = null;
    try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onUp);
    handle.removeEventListener('pointercancel', onUp);
  };
  handle.addEventListener('pointerdown', onDown);
}

const WIDGET_ZOOM_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M4 10V4h6"/><path d="M20 14v6h-6"/>' +
  '<path d="M4 4l6 6"/><path d="M20 20l-6-6"/></svg>';

const WIDGET_ZOOM_STEPS = [1, 2, 4];

function applyWidgetScale(el, s) {
  el._scale = s;
  el.style.transform = (s === 1) ? '' : 'scale(' + s + ')';
  const zb = el.querySelector('.widget-zoom');
  if (zb) zb.classList.toggle('on', s !== 1);

  const w = el.offsetWidth * s;
  const h = el.offsetHeight * s;
  let l = parseFloat(el.style.left);
  let t = parseFloat(el.style.top);
  if (!isFinite(l)) l = el.getBoundingClientRect().left;
  if (!isFinite(t)) t = el.getBoundingClientRect().top;
  if (l + w > window.innerWidth - 8) l = window.innerWidth - w - 8;
  if (t + h > window.innerHeight - 8) t = window.innerHeight - h - 8;
  if (l < 8) l = 8;
  if (t < 8) t = 8;
  el.style.left = l + 'px';
  el.style.top = t + 'px';
}

function setupAutoHide(el, delay) {
  delay = delay || 4000;
  let timer = null;
  let hovering = false;

  function enterImmersive() {
    if (hovering) return;
    el.classList.add('immersive');
  }
  function exitImmersive() {
    el.classList.remove('immersive');
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(enterImmersive, delay);
  }

  el.addEventListener('pointerenter', () => {
    hovering = true;
    clearTimeout(timer);
    exitImmersive();
  });
  el.addEventListener('pointerleave', () => {
    hovering = false;
    schedule();
  });
  el.addEventListener('pointerdown', () => {
    clearTimeout(timer);
    exitImmersive();
  });
  el.addEventListener('pointerup', () => {
    schedule();
  });

  el._cleanupAutoHide = () => { clearTimeout(timer); };
  el._exitImmersive = exitImmersive;
  el._scheduleAutoHide = schedule;

  schedule();
}

function createWidget(appId, title, iconSvg) {
  if (openWidgets.has(appId)) {
    const w = openWidgets.get(appId);
    widgetZ++;
    w.el.style.zIndex = widgetZ;
    w.el.classList.remove('immersive');
    if (w.el._scheduleAutoHide) w.el._scheduleAutoHide();
    return w.el;
  }
  const el = document.createElement('div');
  el.className = 'widget';
  el.dataset.app = appId;
  const offset = widgetSpawnCount % 6;
  widgetSpawnCount++;
  el.style.left = (60 + offset * 26) + 'px';
  el.style.top = (110 + offset * 24) + 'px';
  el.style.zIndex = ++widgetZ;

  el.innerHTML =
    '<div class="widget-head">' +
      '<div class="widget-title">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + iconSvg + '</svg>' +
        '<span>' + escapeHtml(title) + '</span>' +
      '</div>' +
      '<button class="widget-zoom" title="放大 / 还原（1× → 2× → 4×）">' + WIDGET_ZOOM_ICON + '</button>' +
      '<button class="widget-close" title="关闭">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="widget-body"></div>';
  widgetLayer.appendChild(el);
  makeWidgetDraggable(el);

  el._scale = 1;
  el._scaleIdx = 0;
  el.querySelector('.widget-zoom').addEventListener('click', ev => {
    ev.stopPropagation();
    el._scaleIdx = (el._scaleIdx + 1) % WIDGET_ZOOM_STEPS.length;
    widgetZ++;
    el.style.zIndex = widgetZ;
    applyWidgetScale(el, WIDGET_ZOOM_STEPS[el._scaleIdx]);
  });

  const cleanup = [];
  const api = {
    el,
    body: el.querySelector('.widget-body'),
    addCleanup: fn => cleanup.push(fn),
    onClose: null
  };
  const destroy = () => {
    if (api.onClose) { try { api.onClose(); } catch (e) {} }
    cleanup.forEach(fn => { try { fn(); } catch (e) {} });
    if (el._cleanupAutoHide) { try { el._cleanupAutoHide(); } catch (e) {} }
    el.remove();
    openWidgets.delete(appId);
  };
  el.querySelector('.widget-close').addEventListener('click', destroy);
  openWidgets.set(appId, { el, destroy });
  return el;
}

function wireWidgetActions(el, handlers) {
  el.addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]');
    if (!btn || !el.contains(btn)) return;
    const act = btn.dataset.act;
    if (handlers[act]) handlers[act](btn, e);
  });
}

const pad2 = n => String(n).padStart(2, '0');
const pad3 = n => String(n).padStart(3, '0');

function openClockApp() {
  const el = createWidget('clock', '本地时间',
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
  setupAutoHide(el, 4000);
  const body = el.querySelector('.widget-body');
  body.innerHTML =
    '<div class="mini-display" data-el="time">--:--:--</div>' +
    '<div class="mini-sub" data-el="date">加载中…</div>' +
    '<div class="mini-row center">' +
      '<button class="mini-btn" data-act="fmt">24 小时制</button>' +
      '<button class="mini-btn" data-act="sec">显示秒</button>' +
      '<button class="mini-btn" data-act="date">显示日期</button>' +
    '</div>';
  const timeEl = body.querySelector('[data-el=time]');
  const dateEl = body.querySelector('[data-el=date]');
  let fmt24 = true;
  let showSec = true;
  let showDate = true;

  const weekdays = ['日','一','二','三','四','五','六'];
  function tick() {
    const d = new Date();
    let h = d.getHours();
    let ampm = '';
    if (!fmt24) {
      ampm = h >= 12 ? ' PM' : ' AM';
      h = h % 12;
      if (h === 0) h = 12;
    }
    let t = pad2(h) + ':' + pad2(d.getMinutes());
    if (showSec) t += ':' + pad2(d.getSeconds());
    timeEl.textContent = t + ampm;
    if (showDate) {
      dateEl.textContent = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() +
        '日 星期' + weekdays[d.getDay()];
      dateEl.style.display = '';
    } else {
      dateEl.style.display = 'none';
    }
  }
  tick();
  const timer = setInterval(tick, 200);
  el._cleanup = () => clearInterval(timer);

  const w = openWidgets.get('clock');
  const origDestroy = w.destroy;
  w.destroy = () => { clearInterval(timer); origDestroy(); };

  wireWidgetActions(el, {
    fmt: btn => {
      fmt24 = !fmt24;
      btn.textContent = fmt24 ? '24 小时制' : '12 小时制';
      tick();
    },
    sec: btn => {
      showSec = !showSec;
      btn.textContent = showSec ? '显示秒' : '隐藏秒';
      btn.classList.toggle('primary', showSec);
      tick();
    },
    date: btn => {
      showDate = !showDate;
      btn.textContent = showDate ? '显示日期' : '隐藏日期';
      btn.classList.toggle('primary', showDate);
      tick();
    }
  });
}

function openCountdownApp() {
  const el = createWidget('countdown', '倒计时',
    '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>');
  setupAutoHide(el, 4000);
  const body = el.querySelector('.widget-body');
  body.innerHTML =
    '<div class="mini-display md" data-el="disp">00:05:00</div>' +
    '<div class="mini-row center" data-el="setRow">' +
      '<span class="mini-label">时</span>' +
      '<input type="number" class="mini-input cd-inp" data-el="hh" min="0" max="99" value="0">' +
      '<span class="mini-label">分</span>' +
      '<input type="number" class="mini-input cd-inp" data-el="mm" min="0" max="59" value="5">' +
      '<span class="mini-label">秒</span>' +
      '<input type="number" class="mini-input cd-inp" data-el="ss" min="0" max="59" value="0">' +
    '</div>' +
    '<div class="mini-row center">' +
      '<button class="mini-btn primary" data-act="start">开始</button>' +
      '<button class="mini-btn" data-act="reset">重置</button>' +
    '</div>';

  const disp = body.querySelector('[data-el=disp]');
  const hhInp = body.querySelector('[data-el=hh]');
  const mmInp = body.querySelector('[data-el=mm]');
  const ssInp = body.querySelector('[data-el=ss]');
  const startBtn = body.querySelector('[data-act=start]');

  let remain = 300;
  let running = false;
  let endTs = 0;
  let tickId = null;
  let blinkTimer = null;

  function fmt(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
  }
  function renderDisplay() {
    disp.textContent = fmt(remain);
    const warn = remain <= 10 && remain > 0;
    disp.style.color = warn ? '#fca5a5' : '#7dd3fc';
    disp.style.textShadow = warn
      ? '0 0 20px rgba(248,113,113,.6)'
      : '0 0 20px rgba(56,189,248,.5)';
  }
  function readInputs() {
    const hh = Math.max(0, Math.min(99, parseInt(hhInp.value, 10) || 0));
    const mm = Math.max(0, Math.min(59, parseInt(mmInp.value, 10) || 0));
    const ss = Math.max(0, Math.min(59, parseInt(ssInp.value, 10) || 0));
    hhInp.value = hh; mmInp.value = mm; ssInp.value = ss;
    remain = hh * 3600 + mm * 60 + ss;
    renderDisplay();
  }
  function clearTick() {
    if (tickId) { clearInterval(tickId); tickId = null; }
  }
  function clearBlink() {
    if (blinkTimer) { clearInterval(blinkTimer); blinkTimer = null; }
    disp.style.opacity = '1';
  }
  function startBlink() {
    clearBlink();
    let on = true;
    blinkTimer = setInterval(() => { on = !on; disp.style.opacity = on ? '1' : '0.15'; }, 400);
  }
  function finish() {
    running = false;
    clearTick();
    remain = 0;
    renderDisplay();
    startBlink();
    startBtn.textContent = '开始';
    startBtn.classList.add('primary');
    if (el._exitImmersive) el._exitImmersive();
    toast('倒计时结束');
  }
  function tick() {
    const left = Math.max(0, Math.ceil((endTs - performance.now()) / 1000));
    if (left !== remain) { remain = left; renderDisplay(); }
    if (left <= 0) finish();
  }
  function start() {
    if (running) return;
    clearBlink();
    if (remain <= 0) {
      readInputs();
      if (remain <= 0) { toast('请先设置时间'); return; }
    }
    running = true;
    endTs = performance.now() + remain * 1000;
    clearTick();
    tickId = setInterval(tick, 100);
    startBtn.textContent = '暂停';
    startBtn.classList.remove('primary');
  }
  function pause() {
    if (!running) return;
    running = false;
    remain = Math.max(0, Math.ceil((endTs - performance.now()) / 1000));
    clearTick();
    renderDisplay();
    startBtn.textContent = '继续';
    startBtn.classList.add('primary');
  }
  function reset() {
    running = false;
    clearTick();
    clearBlink();
    readInputs();
    startBtn.textContent = '开始';
    startBtn.classList.add('primary');
  }

  [hhInp, mmInp, ssInp].forEach(inp => {
    inp.addEventListener('change', () => { if (!running) readInputs(); });
  });
  readInputs();

  wireWidgetActions(el, {
    start: () => { if (running) pause(); else start(); },
    reset
  });

  const w = openWidgets.get('countdown');
  const origDestroy = w.destroy;
  w.destroy = () => { running = false; clearTick(); clearBlink(); origDestroy(); };
}

function openStopwatchApp() {
  const el = createWidget('stopwatch', '秒表',
    '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5"/><path d="M9 3h6"/>');
  setupAutoHide(el, 4000);
  const body = el.querySelector('.widget-body');
  body.innerHTML =
    '<div class="mini-display" data-el="disp">00:00.00</div>' +
    '<div class="mini-row center">' +
      '<button class="mini-btn primary" data-act="start">开始</button>' +
      '<button class="mini-btn" data-act="lap">计次</button>' +
      '<button class="mini-btn danger" data-act="reset">重置</button>' +
    '</div>' +
    '<div class="lap-list" data-el="laps"></div>';
  const disp = body.querySelector('[data-el=disp]');
  const lapList = body.querySelector('[data-el=laps]');

  let running = false;
  let startTs = 0;
  let accumMs = 0;
  let rafId = null;
  let laps = [];

  function fmtMs(ms) {
    const total = Math.floor(ms);
    const m = Math.floor(total / 60000);
    const s = Math.floor((total % 60000) / 1000);
    const cs = Math.floor((total % 1000) / 10);
    return pad2(m) + ':' + pad2(s) + '.' + pad2(cs);
  }
  function currentMs() {
    return accumMs + (running ? (performance.now() - startTs) : 0);
  }
  function updateDisplay() {
    disp.textContent = fmtMs(currentMs());
  }
  function loop() {
    if (!running) return;
    updateDisplay();
    rafId = requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true;
    startTs = performance.now();
    const startBtn = body.querySelector('[data-act=start]');
    startBtn.textContent = '暂停';
    startBtn.classList.remove('primary');
    rafId = requestAnimationFrame(loop);
  }
  function pause() {
    if (!running) return;
    accumMs += performance.now() - startTs;
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    const startBtn = body.querySelector('[data-act=start]');
    startBtn.textContent = '继续';
    startBtn.classList.add('primary');
    updateDisplay();
  }
  function reset() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    accumMs = 0;
    laps = [];
    lapList.innerHTML = '';
    updateDisplay();
    const startBtn = body.querySelector('[data-act=start]');
    startBtn.textContent = '开始';
    startBtn.classList.add('primary');
  }
  function lap() {
    const t = currentMs();
    if (t === 0) return;
    laps.push(t);
    const diff = laps.length > 1 ? t - laps[laps.length - 2] : t;
    const row = document.createElement('div');
    row.className = 'lap-row';
    row.innerHTML = '<span>#' + laps.length + '</span><b>' + fmtMs(diff) + '</b><span>' + fmtMs(t) + '</span>';
    lapList.insertBefore(row, lapList.firstChild);
    if (laps.length > 50) {
      laps.shift();
      if (lapList.lastChild) lapList.removeChild(lapList.lastChild);
    }
  }
  updateDisplay();

  wireWidgetActions(el, {
    start: () => { if (running) pause(); else start(); },
    lap,
    reset
  });

  const w = openWidgets.get('stopwatch');
  const origDestroy = w.destroy;
  w.destroy = () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    origDestroy();
  };
}

const ROLLCALL_LS_KEY = 'pb_rollcall_names';
let rollcallNames = (function () {
  try {
    const raw = localStorage.getItem(ROLLCALL_LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
})();
function saveRollcallNames() {
  try { localStorage.setItem(ROLLCALL_LS_KEY, JSON.stringify(rollcallNames)); } catch (e) {}
}

function openRollcallApp() {
  const el = createWidget('rollcall', '点名器',
    '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>');
  const body = el.querySelector('.widget-body');
  body.innerHTML =
    '<div class="rollcall-stage" data-el="stage">' +
      '<div class="rollcall-name" data-el="name">准备就绪</div>' +
    '</div>' +
    '<div class="rollcall-results" data-el="results"></div>' +
    '<div class="mini-row center" style="margin-top:10px;">' +
      '<span class="mini-label">抽取</span>' +
      '<select class="mini-input" data-el="count" style="width:auto;padding:0 8px;">' +
        '<option>1</option><option>2</option><option>3</option>' +
        '<option>4</option><option>5</option><option>6</option>' +
        '<option>7</option><option>8</option><option>9</option><option>10</option>' +
      '</select>' +
      '<span class="mini-label">人</span>' +
      '<button class="mini-btn primary" data-act="roll" style="margin-left:4px;">开始抽取</button>' +
    '</div>' +
    '<div class="mini-row center" style="margin-top:6px;">' +
      '<button class="mini-btn" data-act="toggleNames">名单管理</button>' +
      '<button class="mini-btn" data-act="reset" title="清空本轮结果">重置</button>' +
    '</div>' +
    '<div class="rollcall-names-panel" data-el="namesPanel">' +
      '<textarea data-el="namesInput" placeholder="每行一个名字，例如：&#10;张三&#10;李四&#10;王五"></textarea>' +
      '<div class="mini-row" style="margin-top:6px;">' +
        '<button class="mini-btn primary" data-act="saveNames">保存名单</button>' +
        '<button class="mini-btn" data-act="loadDemo">示例名单</button>' +
        '<button class="mini-btn danger" data-act="clearNames">清空</button>' +
        '<span class="mini-label" data-el="nameCount" style="margin-left:auto;"></span>' +
      '</div>' +
      '<div class="rollcall-hint">名单会自动保存在本机浏览器中。抽取人数可在上方下拉框选择。</div>' +
    '</div>';

  const stage = body.querySelector('[data-el=stage]');
  const results = body.querySelector('[data-el=results]');
  const countSel = body.querySelector('[data-el=count]');
  const namesPanel = body.querySelector('[data-el=namesPanel]');
  const namesInput = body.querySelector('[data-el=namesInput]');
  const nameCount = body.querySelector('[data-el=nameCount]');

  let rolling = false;
  let rollTimer = null;
  let usedInRound = new Set();

  function updateNameCount() {
    nameCount.textContent = '共 ' + rollcallNames.length + ' 人';
  }
  function refreshNamesInput() {
    namesInput.value = rollcallNames.join('\n');
    updateNameCount();
  }
  refreshNamesInput();

  function pickRandomNames(count) {
    let pool = rollcallNames.filter(n => !usedInRound.has(n));
    if (pool.length < count) {
      usedInRound.clear();
      pool = rollcallNames.slice();
      if (pool.length === 0) return [];
      toast('本轮已抽完，自动开始新一轮');
    }
    const picked = [];
    const tmp = pool.slice();
    for (let i = 0; i < count && tmp.length > 0; i++) {
      const idx = Math.floor(Math.random() * tmp.length);
      picked.push(tmp[idx]);
      tmp.splice(idx, 1);
    }
    return picked;
  }

  function renderPicked(picked, settled) {
    stage.innerHTML = '';
    if (!picked.length) {
      const d = document.createElement('div');
      d.className = 'rollcall-name';
      d.textContent = rollcallNames.length ? '准备就绪' : '请先添加名单';
      stage.appendChild(d);
      return;
    }
    picked.forEach(n => {
      const d = document.createElement('div');
      d.className = 'rollcall-name' + (settled ? ' settled' : '');
      d.textContent = n;
      stage.appendChild(d);
    });
  }

  function startRoll() {
    if (rolling) return;
    if (rollcallNames.length === 0) { toast('请先在「名单管理」里添加学生'); return; }
    const count = Math.max(1, parseInt(countSel.value) || 1);
    const finalPick = pickRandomNames(count);
    if (!finalPick.length) return;
    rolling = true;
    const rollBtn = body.querySelector('[data-act=roll]');
    rollBtn.textContent = '抽取中…';
    rollBtn.disabled = true;

    const duration = 2200;
    const t0 = performance.now();
    let lastUpdate = 0;

    function step(now) {
      const el2 = now - t0;
      const t = Math.min(1, el2 / duration);
      const interval = 40 + 190 * Math.pow(t, 3);
      if (el2 - lastUpdate >= interval) {
        lastUpdate = el2;
        const tmp = [];
        for (let i = 0; i < count; i++) {
          tmp.push(rollcallNames[Math.floor(Math.random() * rollcallNames.length)]);
        }
        renderPicked(tmp, false);
      }
      if (t >= 1) {
        renderPicked(finalPick, true);
        finalPick.forEach(n => usedInRound.add(n));
        rolling = false;
        rollBtn.textContent = '开始抽取';
        rollBtn.disabled = false;
        const prev = results.textContent.trim();
        const line = finalPick.join('、');
        if (prev) results.textContent = prev + '  |  ' + line;
        else results.textContent = '本轮：' + line;
        return;
      }
      rollTimer = requestAnimationFrame(step);
    }
    rollTimer = requestAnimationFrame(step);
  }

  wireWidgetActions(el, {
    roll: startRoll,
    reset: () => {
      usedInRound.clear();
      results.textContent = '';
      renderPicked([], true);
      toast('已重置本轮结果');
    },
    toggleNames: () => {
      namesPanel.classList.toggle('show');
    },
    saveNames: () => {
      const lines = namesInput.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      rollcallNames = lines;
      saveRollcallNames();
      usedInRound.clear();
      updateNameCount();
      toast('已保存 ' + lines.length + ' 位学生');
    },
    loadDemo: () => {
      const demo = ['张三','李四','王五','赵六','钱七','孙八','周九','吴十',
                    '郑一','王二','冯三','陈四','褚五','卫六','蒋七','沈八'];
      namesInput.value = demo.join('\n');
      toast('已填入示例名单，点「保存名单」生效');
    },
    clearNames: () => {
      namesInput.value = '';
      rollcallNames = [];
      saveRollcallNames();
      usedInRound.clear();
      updateNameCount();
      renderPicked([], true);
      toast('已清空名单');
    }
  });

  const w = openWidgets.get('rollcall');
  const origDestroy = w.destroy;
  w.destroy = () => {
    if (rollTimer) cancelAnimationFrame(rollTimer);
    origDestroy();
  };
}

function openRandomApp() {
  const el = createWidget('random', '随机数',
    '<path d="M4 8h3l3 8 3-8 3 8 3-8h2"/>');
  const body = el.querySelector('.widget-body');
  body.innerHTML =
    '<div class="random-list" data-el="out" style="min-height:44px;">' +
      '<div class="mini-label" style="padding:12px;">点击下方按钮生成</div>' +
    '</div>' +
    '<div class="mini-row center">' +
      '<span class="mini-label">从</span>' +
      '<input type="number" class="mini-input" data-el="min" value="1">' +
      '<span class="mini-label">到</span>' +
      '<input type="number" class="mini-input" data-el="max" value="100">' +
      '<span class="mini-label">个数</span>' +
      '<input type="number" class="mini-input" data-el="cnt" value="1" min="1" max="30">' +
    '</div>' +
    '<div class="mini-row center" style="margin-top:8px;">' +
      '<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text-dim);cursor:pointer;">' +
        '<input type="checkbox" data-el="unique" style="accent-color:var(--accent);"> 不重复' +
      '</label>' +
    '</div>' +
    '<div class="mini-row center" style="margin-top:8px;">' +
      '<button class="mini-btn primary" data-act="gen">生成</button>' +
      '<button class="mini-btn" data-act="clear">清空</button>' +
    '</div>';

  const out = body.querySelector('[data-el=out]');
  const minInp = body.querySelector('[data-el=min]');
  const maxInp = body.querySelector('[data-el=max]');
  const cntInp = body.querySelector('[data-el=cnt]');
  const uniqueCb = body.querySelector('[data-el=unique]');

  function generate() {
    let min = parseInt(minInp.value);
    let max = parseInt(maxInp.value);
    let cnt = Math.max(1, Math.min(30, parseInt(cntInp.value) || 1));
    if (isNaN(min) || isNaN(max)) { toast('请输入有效的范围'); return; }
    if (min > max) { const t = min; min = max; max = t; }
    const range = max - min + 1;
    if (uniqueCb.checked && cnt > range) {
      toast('范围只有 ' + range + ' 个数，无法生成 ' + cnt + ' 个不重复的数');
      return;
    }
    const res = [];
    if (uniqueCb.checked) {
      const pool = [];
      for (let i = min; i <= max; i++) pool.push(i);
      for (let i = 0; i < cnt; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        res.push(pool[idx]);
        pool.splice(idx, 1);
      }
    } else {
      for (let i = 0; i < cnt; i++) {
        res.push(min + Math.floor(Math.random() * range));
      }
    }
    out.innerHTML = '';
    let i = 0;
    const step = () => {
      if (i >= res.length) return;
      const d = document.createElement('div');
      d.className = 'random-num';
      d.textContent = res[i];
      out.appendChild(d);
      i++;
      if (i < res.length) setTimeout(step, 60);
    };
    step();
  }

  wireWidgetActions(el, {
    gen: generate,
    clear: () => {
      out.innerHTML = '<div class="mini-label" style="padding:12px;">点击下方按钮生成</div>';
    }
  });
}

function openDiceApp() {
  const el = createWidget('dice', '骰子',
    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/><circle cx="16" cy="16" r="1.4" fill="currentColor"/>');
  const body = el.querySelector('.widget-body');
  body.innerHTML =
    '<div class="dice-row" data-el="row"></div>' +
    '<div class="mini-row center">' +
      '<span class="mini-label">骰子数</span>' +
      '<select class="mini-input" data-el="cnt" style="width:auto;padding:0 8px;">' +
        '<option>1</option><option>2</option><option>3</option>' +
        '<option>4</option><option>5</option><option>6</option>' +
      '</select>' +
    '</div>' +
    '<div class="mini-row center" style="margin-top:8px;">' +
      '<button class="mini-btn primary" data-act="roll">掷骰子</button>' +
      '<button class="mini-btn" data-act="reset">清空</button>' +
    '</div>';

  const row = body.querySelector('[data-el=row]');
  const cntSel = body.querySelector('[data-el=cnt]');
  let rolling = false;
  let rollTimer = null;

  const PIP_MAP = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };

  function renderDie(value) {
    const die = document.createElement('div');
    die.className = 'die';
    const on = PIP_MAP[value] || [];
    for (let i = 1; i <= 9; i++) {
      const dot = document.createElement('div');
      dot.className = 'die-dot' + (on.indexOf(i) >= 0 ? ' on' : '');
      die.appendChild(dot);
    }
    return die;
  }

  function buildDice(values) {
    row.innerHTML = '';
    values.forEach(v => row.appendChild(renderDie(v)));
  }

  function roll() {
    if (rolling) return;
    const cnt = Math.max(1, Math.min(6, parseInt(cntSel.value) || 1));
    rolling = true;
    const rollBtn = body.querySelector('[data-act=roll]');
    rollBtn.disabled = true;

    const finalValues = [];
    for (let i = 0; i < cnt; i++) finalValues.push(1 + Math.floor(Math.random() * 6));

    const duration = 1000;
    const t0 = performance.now();
    let lastUpdate = 0;

    function step(now) {
      const el2 = now - t0;
      const t = Math.min(1, el2 / duration);
      const interval = 60 + 160 * Math.pow(t, 2);
      if (el2 - lastUpdate >= interval) {
        lastUpdate = el2;
        const tmp = [];
        for (let i = 0; i < cnt; i++) tmp.push(1 + Math.floor(Math.random() * 6));
        buildDice(tmp);
        row.querySelectorAll('.die').forEach(d => d.classList.add('rolling'));
      }
      if (t >= 1) {
        buildDice(finalValues);
        rolling = false;
        rollBtn.disabled = false;
        const sum = finalValues.reduce((a, b) => a + b, 0);
        if (cnt > 1) toast('点数：' + finalValues.join(' + ') + ' = ' + sum);
        else toast('点数：' + finalValues[0]);
        return;
      }
      rollTimer = requestAnimationFrame(step);
    }
    rollTimer = requestAnimationFrame(step);
  }

  wireWidgetActions(el, {
    roll,
    reset: () => {
      row.innerHTML = '';
      toast('已清空');
    }
  });

  buildDice([1]);

  const w = openWidgets.get('dice');
  const origDestroy = w.destroy;
  w.destroy = () => {
    if (rollTimer) cancelAnimationFrame(rollTimer);
    origDestroy();
  };
}

const MINIAPPS = [
  {
    id: 'clock',
    title: '本地时间',
    sub: '数字时钟，可显示秒与日期',
    icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    open: openClockApp
  },
  {
    id: 'countdown',
    title: '倒计时',
    sub: '时/分/秒，结束闪烁提醒',
    icon: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>',
    open: openCountdownApp
  },
  {
    id: 'stopwatch',
    title: '秒表',
    sub: '支持计次，精确到百分秒',
    icon: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5"/><path d="M9 3h6"/>',
    open: openStopwatchApp
  },
  {
    id: 'rollcall',
    title: '点名器',
    sub: '滚动抽取，名单可保存',
    icon: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    open: openRollcallApp
  },
  {
    id: 'random',
    title: '随机数',
    sub: '指定范围，可批量生成',
    icon: '<path d="M4 8h3l3 8 3-8 3 8 3-8h2"/>',
    open: openRandomApp
  },
  {
    id: 'dice',
    title: '骰子',
    sub: '1~6 颗骰子，带滚动动画',
    icon: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/><circle cx="16" cy="16" r="1.4" fill="currentColor"/>',
    open: openDiceApp
  }
];

function buildMiniappLauncher() {
  const grid = document.getElementById('miniappGrid');
  grid.innerHTML = '';
  MINIAPPS.forEach(app => {
    const b = document.createElement('button');
    b.className = 'miniapp-card';
    b.dataset.app = app.id;
    b.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + app.icon + '</svg>' +
      '<div class="mac-title">' + escapeHtml(app.title) + '</div>' +
      '<div class="mac-sub">' + escapeHtml(app.sub) + '</div>';
    b.addEventListener('click', () => {
      closeModal('miniappModal');
      app.open();
    });
    grid.appendChild(b);
  });
}
function openMiniappLauncher() {
  buildMiniappLauncher();
  openModal('miniappModal');
}

/* =====================================================================
 * 窗口控制（Tauri / PakePlus 兼容）
 * ---------------------------------------------------------------------
 * 之前的实现用 await import('@tauri-apps/api/window')，
 * 打包成 PakePlus 之后裸模块名无法解析，import 抛错被 catch 吞掉，
 * 结果按钮永远停在 display:none。
 *
 * 现在改成读取 window.__TAURI__ / window.__TAURI_INTERNALS__ 全局对象，
 * 一检测到 Tauri 就立刻显示按钮，然后用全局 API 或底层 invoke 兜底。
 * ===================================================================== */

/* =====================================================================
 * 26.5 关闭前的“是否保存”提示
 * ===================================================================== */

/* 弹出「是否保存」对话框，返回 'yes' | 'no' | 'cancel' */
function askSaveBeforeClose() {
  if (document.getElementById('__closeConfirm')) {
    return Promise.resolve('cancel');
  }

  return new Promise(function (resolve) {
    var wrap = document.createElement('div');
    wrap.id = '__closeConfirm';
    wrap.className = 'modal show';
    wrap.style.zIndex = '9999';
    wrap.innerHTML =
      '<div class="modal-card" style="max-width:430px;">' +
        '<div class="modal-head">关闭程序</div>' +
        '<div class="modal-body">' +
          '<p style="margin:0 0 12px;font-size:14px;color:#e6edf7;">' +
            '关闭前是否保存当前白板内容？' +
          '</p>' +
          '<div class="tip-line">' +
            '选择「保存并关闭」会导出 <b>.json</b> 工程文件，' +
            '包含全部页面、图形与自定义组合图形。<br>' +
            '下次打开后可用 <b>菜单 → 加载文件</b> 恢复。' +
          '</div>' +
        '</div>' +
        '<div class="modal-foot">' +
          '<button type="button" class="mbtn ghost" data-cf="cancel">取消</button>' +
          '<button type="button" class="mbtn ghost" data-cf="no">不保存</button>' +
          '<button type="button" class="mbtn" data-cf="yes">保存并关闭</button>' +
        '</div>' +
      '</div>';

    var done = false;
    function finish(v) {
      if (done) return;
      done = true;
      document.removeEventListener('keydown', onKey, true);
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      resolve(v);
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        finish('cancel');
      }
    }

    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cf]');
      if (btn) finish(btn.getAttribute('data-cf'));
    });

    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(wrap);
  });
}

/* 把当前白板写成 .json —— 优先 Tauri 原生保存，其次浏览器下载
 * 返回 true 表示已保存；false 表示用户取消或失败 */
async function saveDocToDisk() {
  var doc;
  try { doc = serializeDoc(); }
  catch (e) {
    toast('生成文件失败：' + (e && e.message ? e.message : e));
    return false;
  }

  var text = JSON.stringify(doc);
  var filename = '白板工程_' +
    new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.json';

  /* ---------- ① Tauri 原生保存对话框（可用时） ---------- */
  var T = window.__TAURI__;
  var dlg   = T && T.dialog;
  var fsApi = T && T.fs;
  if (dlg && typeof dlg.save === 'function' &&
      fsApi && typeof fsApi.writeTextFile === 'function') {
    try {
      var path = await dlg.save({
        defaultPath: filename,
        filters: [{ name: '白板工程文件', extensions: ['json'] }]
      });
      if (!path) return false;               /* 用户在系统对话框里取消 */
      await fsApi.writeTextFile(path, text);
      toast('已保存到：' + path, 3600);
      return true;
    } catch (e) {
      console.warn('原生保存失败，改用浏览器方式：', e);
    }
  }

  /* ---------- ② 浏览器方式（下载 / 指定目录） ---------- */
  try {
    var blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    var r = await saveImageBlob(blob, filename);
    toast('已导出到：' + r.location, 3600);
    return true;
  } catch (e) {
    toast('保存失败：' + (e && e.message ? e.message : e), 3600);
    return false;
  }
}

async function setupWindowControls() {
  const T = window.__TAURI__;
  const internals = window.__TAURI_INTERNALS__;

  const minBtn   = document.getElementById('minimizeBtn');
  const closeBtn = document.getElementById('closeAppBtn');
  if (!minBtn || !closeBtn) return;

  // 不在 Tauri 环境 → 保持隐藏，不报错
  if (!T && !internals) return;

  // 关键：先让按钮出现，不再等 API 加载成功
  minBtn.style.display = '';
  closeBtn.style.display = '';

  /* ---------- 拿窗口对象 ---------- */
  let appWindow = null;

  if (T && T.window) {
    if (typeof T.window.getCurrentWindow === 'function') {
      appWindow = T.window.getCurrentWindow();
    } else if (T.window.getCurrent) {
      appWindow = T.window.getCurrent();
    } else if (T.window.appWindow) {
      appWindow = T.window.appWindow;
    }
  }
  if (!appWindow && T && T.appWindow) appWindow = T.appWindow;

  /* ---------- 兜底：直接调底层 invoke ---------- */
  if (!appWindow && internals && typeof internals.invoke === 'function') {
    const label =
      (internals.metadata &&
       internals.metadata.currentWindow &&
       internals.metadata.currentWindow.label) || 'main';
    appWindow = {
      minimize: () => internals.invoke('plugin:window|minimize', { label }),
      close:    () => internals.invoke('plugin:window|close',    { label })
    };
  }

  if (!appWindow) {
    console.warn('[窗口控制] 未找到可用的 Tauri 窗口 API');
    return;
  }

  /* ---------- 绑定事件 ---------- */
  minBtn.addEventListener('click', async () => {
    try { await appWindow.minimize(); }
    catch (e) { console.warn('最小化失败', e); }
  });

  closeBtn.addEventListener('click', async () => {
    /* ① 先问：是否保存？ */
    const choice = await askSaveBeforeClose();
    if (choice === 'cancel') return;

    /* ② 用户选“保存并关闭” */
    if (choice === 'yes') {
      const ok = await saveDocToDisk();
      if (!ok) {
        /* 用户在系统保存对话框里点了取消 → 放弃关闭 */
        return;
      }
      /* 浏览器下载是异步的，稍等一下再关 */
      await new Promise(r => setTimeout(r, 500));
    }

    /* ③ 无论如何，把自定义组合图形落到 IndexedDB */
    try {
      const records = [];
      for (const k in PB.shapes) {
        const s = PB.shapes[k];
        if (s.custom && s.parts) {
          records.push({
            id: k,
            label: s.label,
            catId: s.cat,
            catLabel: (PB.categories || []).find(c => c.id === s.cat)?.label || s.cat,
            baseW: s.baseW,
            baseH: s.baseH,
            parts: s.parts,
            icon: s.icon
          });
        }
      }
      for (const rec of records) await csSaveRecord(rec);
    } catch (e) {}

    /* ④ 关闭窗口 */
    try { await appWindow.close(); }
    catch (e) { window.close(); }
  });
}

/* =====================================================================
 * 27. 启动
 * ===================================================================== */
async function init() {
  /* =================================================================
   * ① 窗口控制（放在最前，未授权也要先挂载）
   * ================================================================= */
  await setupWindowControls();

  /* =================================================================
   * ② 授权检查（强制）
   * ================================================================= */
  if (!window.__pbLicense) {
    document.body.innerHTML =
      '<div style="max-width:520px;margin:100px auto;padding:30px 34px;' +
      'background:linear-gradient(160deg,rgba(24,36,60,.98),rgba(14,22,40,.98));' +
      'border:1px solid rgba(120,180,255,.25);border-radius:20px;' +
      'box-shadow:0 30px 80px rgba(0,8,24,.7);font-size:14px;' +
      'line-height:1.85;color:#fca5a5;font-family:system-ui,sans-serif;">' +
      '<b style="font-size:17px;color:#fff;">授权模块缺失</b><br><br>' +
      '<span style="color:#b8c7de;">请确认 license.js 与本页面在同一目录，' +
      '且通过 &lt;script src="license.js"&gt;&lt;/script&gt; 在 app.js 之前引入。</span></div>';
    return;
  }
  const licensed = await window.__pbLicense.check();
  if (!licensed) {
    window.__pbLicense.showActivationUI('请输入授权码');
    return;
  }
  /* ===== 授权检查结束 ===== */

  /* =================================================================
   * ③ 白板初始化
   * ================================================================= */
  let savedBg = 'tech';
  try { savedBg = localStorage.getItem('pb_bg_id') || 'tech'; } catch (e) {}
  if (!BG_PRESETS.some(p => p.id === savedBg)) savedBg = 'tech';
  state.bg = savedBg;
  const preset = BG_PRESETS.find(p => p.id === savedBg);
  document.body.style.background = preset.css;
  if (preset.light) { state.borderColor = '#1a1a1a'; state.penColor = '#1a1a1a'; }

  ensureTextShapes();
  registerTextParams();

  collectOriginalHidden();
  applyLibHidden();
  csRestoreAll().then(() => {
    buildShapePanel();
  });
  buildPenPanel(); buildBorderPanel(); buildFillPanel(); buildBgRow(); buildShapePanel();
  buildMiniappLauncher();
  makeTouchScrollable(shapeGrid);
  makeTouchScrollable(thumbScroll);
  makeTouchScrollable(libList);
  updateSaveDirUI();

  loadSnapSettings();

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  document.querySelectorAll('.dbtn[data-tool]').forEach(b => {
    const tool = b.dataset.tool;
    if (tool === 'pen') {
      b.addEventListener('click', () => {
        if (state.tool === 'pen') penPanel.classList.toggle('show');
        else setTool('pen', true);
      });
    } else if (tool === 'eraser') {
      b.addEventListener('click', () => setTool('eraser'));
      b.addEventListener('dblclick', e => { e.preventDefault(); setTool('eraser'); showEraseSlider(); });
    } else {
      b.addEventListener('click', () => setTool(tool));
    }
  });
  document.getElementById('shapeBtn').addEventListener('click', () => {
    if (shapePanel.classList.contains('show')) {
      shapePanel.classList.remove('show');
      document.getElementById('shapeBtn').classList.remove('active');
    } else {
      const cats = getCategories().filter(c => catHasShapes(c.id));
      if (!state.shapeCat && cats.length) state.shapeCat = cats[0].id;
      let first = null;
      for (const k in PB.shapes) {
        const s = PB.shapes[k];
        if (!s.hidden && s.cat === state.shapeCat) { first = k; break; }
      }
      if (first) setTool(first);
      else {
        shapePanel.classList.add('show');
        document.getElementById('shapeBtn').classList.add('active');
        penPanel.classList.remove('show');
      }
    }
  });
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);
  playAllBtn.addEventListener('click', playAnimAll);
  pauseAllBtn.addEventListener('click', pauseAnimAll);
  resetAllBtn.addEventListener('click', resetAnimAll);
  document.getElementById('prevPage').addEventListener('click', () => goPage(pageIndex - 1));
  document.getElementById('nextPage').addEventListener('click', () => goPage(pageIndex + 1));
  document.getElementById('addPage').addEventListener('click', addPage);
  document.getElementById('delPage').addEventListener('click', () => deletePage(pageIndex));

  board.addEventListener('contextmenu', e => e.preventDefault());
  preview.addEventListener('contextmenu', e => e.preventDefault());

  resize();

  snapshots = [{ pages: pages.map(pg => pg.map(copyObj)), pageIndex: 0 }];
  snapIndex = 0;
  updateHistoryButtons();
  updatePageUI();
  updatePlayButtons();
  registerAnimParams();

  setTool('pen', true);

  setTimeout(() => toast('已进入画笔状态 · 直接书写，或点「形状」开始绘图', 600), 400);
}

/* 供 shapes.js 里的交互组件使用的轻量重绘接口 */
window.__pbRedraw = function () {
  render();
  drawPreview();
  updateSelBarPosition();
};

init();

})();