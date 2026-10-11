/* ============================================================================
 *  电子白板 · 图形库  shapes.js
 *  ---------------------------------------------------------------------------
 *  用法：
 *    1) 把本文件和 HTML 放在同一个文件夹；
 *    2) 在 HTML 里、主 <script> 之前引入： <script src="shapes.js"></script>
 *
 *  加新图形：
 *    在文件最末尾追加一段 shape({...}) 即可，保存刷新页面就生效。
 * ============================================================================ */

(function () {
'use strict';

/* ==========================================================================
 * 0. 全局注册表
 * ========================================================================== */
const PB = window.PhysBoard = window.PhysBoard || {
  shapes: {},
  paramDefs: {},
  categories: [],
  register(d) { this.shapes[d.key] = d; },
  category(id, label) { this.categories.push({ id, label }); },
  param(key, def) { this.paramDefs[key] = def; }
};

const shape = (d) => PB.register(d);
const cat   = (id, label) => PB.category(id, label);
const param = (key, def) => PB.param(key, def);

/* ==========================================================================
 * 1. 分类
 * ========================================================================== */
cat('basic',  '基础');
cat('mech',   '力学');
cat('wave',   '振动与波');
cat('optics', '光学');
cat('em',     '电磁');
cat('text',   '文字');
cat('sketch', '简笔画');
cat('anim',   '动画');


/* ==========================================================================
 * 2. 可调参数定义（同名参数只保留一份最终定义）
 *    注意：原文件中部分参数重复定义，此处保留最后一次生效的版本。
 * ========================================================================== */

/* ---- 基础几何 / 力学 ---- */
param('a0',     { label: '起始角', min: -180, max: 180, step: 1, def: -90, unit: '°' });
param('sweep',  { label: '张角',   min: 0,    max: 360, step: 1, def: 90,  unit: '°' });
param('thick',  { label: '槽宽',   min: 2,    max: 80,  step: 1, def: 16 });
param('coils',  { label: '圈数',   min: 2,    max: 30,  step: 1, def: 8 });
param('paraP',  { label: '开口',   min: 1,    max: 5,   step: 0.1,  def: 2 });
param('spiralT',{ label: '圈数',   min: 1,    max: 20,  step: 1,    def: 5 });
param('cycR',   { label: '半径比', min: 0.2,  max: 1.5, step: 0.05, def: 1 });
param('cycN',   { label: '拱数',   min: 1,    max: 8,   step: 1,    def: 3 });

/* ---- 网格 / 坐标系 ---- */
param('step',   { label: '网格间距', min: 8, max: 200, step: 1, def: 40, unit: 'px' });

/* ---- 新增可调参数 ---- */
param('amp',        { label: '振幅',   min: 0,    max: 1,    step: 0.05, def: 0.5 });
param('tickGap',    { label: '刻度距', min: 4,    max: 40,   step: 1,    def: 10   });
param('groundGap',  { label: '阴影距', min: 6,    max: 40,   step: 1,    def: 18   });
param('chargeSign', { label: '电性',   min: 0,    max: 1,    step: 1,    def: 0    });
param('axisTick',   { label: '刻度',   min: 0,    max: 1,    step: 1,    def: 1    });
param('springAmp',  { label: '弹簧幅', min: 0.03, max: 0.25, step: 0.01, def: 0.09 });

param('bowlPeriod', { label: '周期',     min: 0.3, max: 6,  step: 0.1, def: 1.6, unit: 's' });
param('bowlAmp',    { label: '最大摆角', min: 0,   max: 90, step: 1,   def: 60,  unit: '°' });
param('bowlBallR',  { label: '球半径',   min: 2,   max: 20, step: 0.5, def: 6 });

/* ---- 波动 ---- */
param('cycles',   { label: '周期数', min: 0.5, max: 10,  step: 0.5,  def: 2 });
param('phase',    { label: '相位',   min: 0,   max: 360, step: 5,    def: 0, unit: '°' });
param('waveAxis', { label: '坐标轴', min: 0,   max: 1,   step: 1,    def: 1, unit: '0无1有' });

/* ---- 电磁 / 场 ---- */
param('ringTheta0', { label: '初始摆角', min: 5,   max: 90,  step: 1,    def: 60,  unit: '°' });
param('ringK',      { label: '质量比k',  min: 0.2, max: 8,   step: 0.1,  def: 2 });
param('ringLen',    { label: '绳长比',   min: 0.3, max: 1.0, step: 0.05, def: 0.7 });
param('ringPeriod', { label: '基准周期', min: 0.5, max: 4,   step: 0.1,  def: 1.5, unit: 's' });

/* ---- 光学 ---- */
param('hue7',    { label: '颜色',     min: 0,   max: 6,  step: 1,    def: 0 });
param('density', { label: '条纹密度', min: 3,   max: 30, step: 1,    def: 12 });
param('distort', { label: '畸变强度', min: 0,   max: 100, step: 1,   def: 30, unit: '%' });

/* ==========================================================================
 * 3. 共用绘制片段
 * ========================================================================== */

/* 正多边形工厂 */
function polyDraw(n) {
  return function (c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    const rx = b.w / 2, ry = b.h / 2;
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n;
      const x = cx + rx * Math.cos(a);
      const y = cy + ry * Math.sin(a);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.closePath();
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  };
}

/* ==========================================================================
 * 4. 基础图形
 * ========================================================================== */

/* ---- 画笔（工具栏用，不出现在图形栏） ---- */
shape({
  key: 'pen', cat: 'basic', geom: 'path', label: '画笔', hidden: true,
  icon: '<path d="M16.6 3.4a2.1 2.1 0 0 1 3 3L8.2 17.8 4 19l1.2-4.2L16.6 3.4z"/>',
  draw(c, o) {
    if (o.points.length === 1) {
      const p = o.points[0];
      c.beginPath();
      c.arc(p.x, p.y, (o.size || 4) / 2, 0, Math.PI * 2);
      c.fillStyle = o.color;
      c.fill();
    } else {
      c.beginPath();
      o.points.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y));
      c.stroke();
    }
  }
});

/* ---- 橡皮（工具栏用） ---- */
shape({
  key: 'eraser', cat: 'basic', geom: 'path', label: '橡皮', hidden: true,
  icon: '<path d="M8.5 20l-4.2-4.2a2 2 0 0 1 0-2.8l7.3-7.3a2 2 0 0 1 2.8 0l4.7 4.7a2 2 0 0 1 0 2.8L13.2 20H8.5z"/><path d="M20 20h-9"/>',
  draw(c, o) {
    c.save();
    c.globalCompositeOperation = 'destination-out';
    const w = Math.max(10, (o.size || 4) * 3);
    c.lineWidth = w;
    c.strokeStyle = 'rgba(0,0,0,1)';
    if (o.points.length === 1) {
      const p = o.points[0];
      c.beginPath();
      c.arc(p.x, p.y, w / 2, 0, Math.PI * 2);
      c.fillStyle = 'rgba(0,0,0,1)';
      c.fill();
    } else {
      c.beginPath();
      o.points.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y));
      c.stroke();
    }
    c.restore();
  }
});

/* ---- 1. 实线段 ---- */
shape({
  key: 'line', cat: 'basic', geom: 'line', label: '实线段',
  icon: '<path d="M4 20L20 4"/>',
  draw(c, o) {
    c.save();
    c.setLineDash([]);
    c.beginPath();
    c.moveTo(o.x1, o.y1);
    c.lineTo(o.x2, o.y2);
    c.stroke();
    c.restore();
  }
});

/* ---- 2. 虚线段 ---- */
shape({
  key: 'dashedLine', cat: 'basic', geom: 'line', label: '虚线段',
  icon: '<path d="M4 20L20 4" stroke-dasharray="3 3"/>',
  draw(c, o) {
    const lw = o.size || 4;
    c.save();
    c.setLineDash([lw * 2.6, lw * 2.2]);
    c.beginPath();
    c.moveTo(o.x1, o.y1);
    c.lineTo(o.x2, o.y2);
    c.stroke();
    c.restore();
  }
});

/* ---- 3. 箭头 ---- */
shape({
  key: 'arrow', cat: 'basic', geom: 'line', label: '箭头',
  icon: '<path d="M4 20L20 4"/><path d="M13 4h7v7"/>',
  draw(c, o, U) {
    c.beginPath();
    c.moveTo(o.x1, o.y1);
    c.lineTo(o.x2, o.y2);
    c.stroke();
    U.arrowHead(c, o.x1, o.y1, o.x2, o.y2, o.size || 4);
  }
});

/* ---- 4. 双箭头 ---- */
shape({
  key: 'dblArrow', cat: 'basic', geom: 'line', label: '双箭头',
  icon: '<path d="M4 12h16"/><path d="M7 9l-3 3 3 3"/><path d="M17 9l3 3-3 3"/>',
  draw(c, o, U) {
    c.beginPath();
    c.moveTo(o.x1, o.y1);
    c.lineTo(o.x2, o.y2);
    c.stroke();
    U.arrowHead(c, o.x1, o.y1, o.x2, o.y2, o.size || 4);
    U.arrowHead(c, o.x2, o.y2, o.x1, o.y1, o.size || 4);
  }
});

/* ---- 5. 矩形 ---- */
shape({
  key: 'rect', cat: 'basic', geom: 'box', label: '矩形', fill: true,
  icon: '<rect x="4" y="6" width="16" height="12" rx="1"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    c.beginPath();
    c.rect(b.x1, b.y1, b.w, b.h);
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  }
});

/* ---- 圆角矩形 ---- */
shape({
  key: 'roundedRect', cat: 'basic', geom: 'box', label: '圆角矩形', fill: true,
  icon: '<rect x="4" y="6" width="16" height="12" rx="3"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const r = Math.min(b.w, b.h) * 0.18;
    c.beginPath();
    if (c.roundRect) {
      c.roundRect(b.x1, b.y1, b.w, b.h, r);
    } else {
      c.moveTo(b.x1 + r, b.y1);
      c.lineTo(b.x2 - r, b.y1);
      c.quadraticCurveTo(b.x2, b.y1, b.x2, b.y1 + r);
      c.lineTo(b.x2, b.y2 - r);
      c.quadraticCurveTo(b.x2, b.y2, b.x2 - r, b.y2);
      c.lineTo(b.x1 + r, b.y2);
      c.quadraticCurveTo(b.x1, b.y2, b.x1, b.y2 - r);
      c.lineTo(b.x1, b.y1 + r);
      c.quadraticCurveTo(b.x1, b.y1, b.x1 + r, b.y1);
      c.closePath();
    }
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  }
});

/* ---- 6. 圆形 ---- */
shape({
  key: 'circle', cat: 'basic', geom: 'box', label: '圆形', fill: true,
  icon: '<circle cx="12" cy="12" r="8.5"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2;
    const cy = b.y1 + b.h / 2;
    const r = Math.min(b.w, b.h) / 2;
    c.beginPath();
    c.arc(cx, cy, Math.max(r, 0.1), 0, Math.PI * 2);
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  }
});

/* ---- 6b. 椭圆 ---- */
shape({
  key: 'ellipse', cat: 'basic', geom: 'box', label: '椭圆', fill: true,
  icon: '<ellipse cx="12" cy="12" rx="8.5" ry="6"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    c.beginPath();
    c.ellipse(b.x1 + b.w / 2, b.y1 + b.h / 2,
              Math.max(b.w / 2, 0.1), Math.max(b.h / 2, 0.1), 0, 0, Math.PI * 2);
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  }
});

/* ---- 7. 扇形 ---- */
shape({
  key: 'sector', cat: 'basic', geom: 'box', label: '扇形', fill: true,
  icon: '<path d="M6 18V7A11 11 0 0 1 17 18Z"/>',
  params: ['a0', 'sweep'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    const r = Math.min(b.w, b.h) / 2;
    const a0 = U.rad(o.a0 ?? -90);
    const sw = U.rad(o.sweep ?? 90);
    c.beginPath();
    c.moveTo(cx, cy);
    c.arc(cx, cy, Math.max(r, 1), a0, a0 + sw);
    c.closePath();
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  }
});

shape({
  key: 'isoTriangle', cat: 'basic', geom: 'box', label: '等腰三角形', fill: true,
  icon: '<path d="M12 4l9 16H3z"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    c.beginPath();
    c.moveTo(b.x1 + b.w / 2, b.y1);
    c.lineTo(b.x1 + b.w, b.y1 + b.h);
    c.lineTo(b.x1, b.y1 + b.h);
    c.closePath();
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  }
});

/* ---- 9. 直角三角形（方向随拖动自动判断） ---- */
shape({
  key: 'rightTriangle', cat: 'basic', geom: 'box', label: '直角三角形', fill: true,
  icon: '<path d="M4 4v16h16z"/>',
  draw(c, o, U) {
    const b = U.bbox(o);

    /* 根据原始起止点的水平位移判断倾角方向：
     *   o.x2 > o.x1（向右拖）→ 斜边朝右，直角在左下
     *   o.x2 < o.x1（向左拖）→ 斜边朝左，直角在右下
     *   水平位移过小（近乎竖直拖动）→ 默认斜边朝右 */
    const dx = (o.x2 ?? 0) - (o.x1 ?? 0);
    const flip = Math.abs(dx) > 1 ? (dx < 0 ? 1 : 0) : 0;

    c.beginPath();
    if (!flip) {
      c.moveTo(b.x1, b.y1);
      c.lineTo(b.x1, b.y2);
      c.lineTo(b.x2, b.y2);
    } else {
      c.moveTo(b.x2, b.y1);
      c.lineTo(b.x2, b.y2);
      c.lineTo(b.x1, b.y2);
    }
    c.closePath();
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  }
});
/* ---- 10. 平行四边形 ---- */
param('paraSkew', { label: '倾斜量', min: 0, max: 100, step: 1, def: 20, unit: '%' });
param('paraDir',  { label: '倾斜方向', min: 0, max: 1, step: 1, def: 0, unit: '0左1右' });

shape({
  key: 'parallelogram', cat: 'basic', geom: 'box', label: '平行四边形', fill: true,
  icon: '<path d="M6 6h14l-4 12H2z"/>',
  params: ['paraSkew', 'paraDir'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const pct = Math.max(0, Math.min(100, o.paraSkew ?? 20));
    const offset = b.w * (pct / 100);
    const toRight = (o.paraDir ?? 0) < 0.5;

    c.beginPath();
    if (toRight) {
      c.moveTo(b.x1 + offset, b.y1);
      c.lineTo(b.x2, b.y1);
      c.lineTo(b.x2 - offset, b.y2);
      c.lineTo(b.x1, b.y2);
    } else {
      c.moveTo(b.x1, b.y1);
      c.lineTo(b.x2 - offset, b.y1);
      c.lineTo(b.x2, b.y2);
      c.lineTo(b.x1 + offset, b.y2);
    }
    c.closePath();
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  }
});

/* ---- 11. 菱形 ---- */
shape({
  key: 'diamond', cat: 'basic', geom: 'box', label: '菱形', fill: true,
  icon: '<path d="M12 3l9 9-9 9-9-9z"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    c.beginPath();
    c.moveTo(cx, b.y1);
    c.lineTo(b.x2, cy);
    c.lineTo(cx, b.y2);
    c.lineTo(b.x1, cy);
    c.closePath();
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  }
});

/* ---- 12. 梯形 ---- */
param('trapTop',  { label: '上边宽度', min: 0, max: 100, step: 1, def: 70, unit: '%' });
param('trapType', { label: '形状', min: 0, max: 2, step: 1, def: 1, unit: '——0左1等腰2右' });

shape({
  key: 'trapezoid', cat: 'basic', geom: 'box', label: '等腰梯形', fill: true,
  icon: '<path d="M6 6h12l3 12H3z"/>',
  params: ['trapTop', 'trapType'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const topW = b.w * (Math.max(0, Math.min(100, o.trapTop ?? 70)) / 100);
    const type = Math.round(o.trapType ?? 1);

    c.beginPath();
    if (type === 0) {
      c.moveTo(b.x1, b.y1);
      c.lineTo(b.x1 + topW, b.y1);
      c.lineTo(b.x2, b.y2);
      c.lineTo(b.x1, b.y2);
    } else if (type === 2) {
      c.moveTo(b.x2 - topW, b.y1);
      c.lineTo(b.x2, b.y1);
      c.lineTo(b.x2, b.y2);
      c.lineTo(b.x1, b.y2);
    } else {
      const inset = (b.w - topW) / 2;
      c.moveTo(b.x1 + inset, b.y1);
      c.lineTo(b.x2 - inset, b.y1);
      c.lineTo(b.x2, b.y2);
      c.lineTo(b.x1, b.y2);
    }
    c.closePath();
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  }
});

/* ---- 13. 五边形 ---- */
shape({
  key: 'pentagon', cat: 'basic', geom: 'box', label: '五边形', fill: true,
  icon: '<path d="M12 3.5l8.5 6.2-3.2 10H6.7l-3.2-10z"/>',
  draw: polyDraw(5)
});

/* ---- 14. 六边形 ---- */
shape({
  key: 'hexagon', cat: 'basic', geom: 'box', label: '六边形', fill: true,
  icon: '<path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z"/>',
  draw: polyDraw(6)
});

/* ---- 15. 半圆弧槽 ---- */
shape({
  key: 'halfArcSlot', cat: 'basic', geom: 'box', label: '半圆弧槽', fill: true,
  icon: '<path d="M3 5h3a6 6 0 0 0 12 0h3v14H3z"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const r  = Math.min(b.w / 2, b.h);
    const cx = b.x1 + b.w / 2;
    c.beginPath();
    c.moveTo(b.x1, b.y1);
    c.lineTo(cx - r, b.y1);
    c.arc(cx, b.y1, r, Math.PI, 0, true);
    c.lineTo(b.x2, b.y1);
    c.lineTo(b.x2, b.y2);
    c.lineTo(b.x1, b.y2);
    c.closePath();
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.15); c.fill(); }
    c.stroke();
  }
});

/* ---- 16. 四分之一圆弧槽 ---- */
shape({
  key: 'quarterArcSlot', cat: 'basic', geom: 'box', label: '四分之一圆弧槽', fill: true,
  icon: '<path d="M10 4h10v16H4V10a6 6 0 0 0 6-6z"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const r = Math.min(b.w, b.h);
    c.beginPath();
    c.moveTo(b.x1 + r, b.y1);
    c.lineTo(b.x2, b.y1);
    c.lineTo(b.x2, b.y2);
    c.lineTo(b.x1, b.y2);
    c.lineTo(b.x1, b.y1 + r);
    c.arc(b.x1, b.y1, r, Math.PI / 2, 0, true);
    c.closePath();
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.15); c.fill(); }
    c.stroke();
  }
});

/* ---- 17. 可调圆弧槽（增加退化兜底） ---- */
param('arcSlotL', { label: '左圆心角', min: 0, max: 90, step: 1, def: 0,  unit: '°' });
param('arcSlotR', { label: '右圆心角', min: 0, max: 90, step: 1, def: 60, unit: '°' });

shape({
  key: 'arcSlotVar', cat: 'basic', geom: 'box', label: '可调圆弧槽', fill: true,
  icon: '<path d="M3 20A19 19 0 0 0 19.45 10.5H21.45V20Z"/>',
  params: ['arcSlotL', 'arcSlotR'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const r = Math.min(b.w / 2, b.h);
    const cx = b.x1 + b.w / 2;
    const cy = b.y1;
    const aL = ((o.arcSlotL ?? 0)  * Math.PI) / 180;
    const aR = ((o.arcSlotR ?? 60) * Math.PI) / 180;
    const gap = Math.min(16, r * 0.5);

    const minX = cx;
    const minY = cy + r;

    /* 兜底：左右圆心角都接近 0 → 图形退化成一条水平线段，否则完全不可见 */
    if (aL < 0.005 && aR < 0.005) {
      c.beginPath();
      c.moveTo(b.x1, minY);
      c.lineTo(b.x2, minY);
      if (o.fill) { c.fillStyle = U.alpha(o.color, 0.15); c.fill(); }
      c.stroke();
      return;
    }

    c.beginPath();

    if (aR > 0.005) {
      const rightAngle = Math.PI / 2 - aR;
      const xR = cx + r * Math.cos(rightAngle);
      const yR = cy + r * Math.sin(rightAngle);

      c.moveTo(minX, minY);
      c.arc(cx, cy, r, Math.PI / 2, rightAngle, true);
      c.lineTo(xR + gap, yR);
      c.lineTo(xR + gap, cy + r);
      c.lineTo(minX, minY);
    }

    if (aL > 0.005) {
      const leftAngle = Math.PI / 2 + aL;
      const xL = cx + r * Math.cos(leftAngle);
      const yL = cy + r * Math.sin(leftAngle);

      c.moveTo(minX, minY);
      c.arc(cx, cy, r, Math.PI / 2, leftAngle, false);
      c.lineTo(xL - gap, yL);
      c.lineTo(xL - gap, cy + r);
      c.lineTo(minX, minY);
    }

    c.closePath();

    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.15); c.fill(); }
    c.stroke();
  }
});

/* ---- 18. 网格 ---- */
shape({
  key: 'grid', cat: 'basic', geom: 'box', label: '网格',
  icon: '<path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  params: ['step'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const step = Math.max(8, o.step ?? 40);
    c.save();
    c.lineWidth = Math.max(0.5, (o.size || 4) * 0.28);
    c.strokeStyle = U.alpha(o.color, 0.45);
    for (let x = b.x1; x <= b.x2 + 0.5; x += step) {
      c.beginPath(); c.moveTo(x, b.y1); c.lineTo(x, b.y2); c.stroke();
    }
    for (let y = b.y1; y <= b.y2 + 0.5; y += step) {
      c.beginPath(); c.moveTo(b.x1, y); c.lineTo(b.x2, y); c.stroke();
    }
    c.restore();
    c.strokeRect(b.x1, b.y1, b.w, b.h);
  }
});

/* ---- 直角坐标系 ---- */
param('axisXDir',  { label: 'x 方向',     min: 0, max: 1,  step: 1, def: 0, unit: '0右1左' });
param('axisYDir',  { label: 'y 方向',     min: 0, max: 1,  step: 1, def: 0, unit: '0上1下' });
param('axisMajor', { label: '主网格',     min: 0, max: 20, step: 1, def: 0, unit: '格' });
param('axisMinor', { label: '次网格等分', min: 0, max: 20, step: 1, def: 0, unit: '份' });

shape({
  key: 'axis', cat: 'basic', geom: 'box', label: '直角坐标系',
  icon: '<path d="M4 20V4M4 20h16"/><path d="M1 7l3-3 3 3"/><path d="M17 17l3 3-3 3"/>',
  params: ['axisXDir', 'axisYDir', 'axisMajor', 'axisMinor'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const xRight = (o.axisXDir ?? 0) < 0.5;
    const yUp    = (o.axisYDir ?? 0) < 0.5;

    const ox   = xRight ? b.x1 : b.x2;
    const oy   = yUp    ? b.y2 : b.y1;
    const xEnd = xRight ? b.x2 : b.x1;
    const yEnd = yUp    ? b.y1 : b.y2;

    const N = Math.max(0, Math.round(o.axisMajor ?? 0));
    const M = Math.max(0, Math.round(o.axisMinor ?? 0));

    const mainCells = N > 0 ? N : 1;
    const cw = b.w / mainCells;
    const ch = b.h / mainCells;

    if (N > 0) {
      c.save();
      c.lineWidth = Math.max(0.5, (o.size || 4) * 0.28);
      c.strokeStyle = U.alpha(o.color, 0.45);
      for (let i = 1; i < N; i++) {
        const x = b.x1 + i * cw;
        c.beginPath(); c.moveTo(x, b.y1); c.lineTo(x, b.y2); c.stroke();
        const y = b.y1 + i * ch;
        c.beginPath(); c.moveTo(b.x1, y); c.lineTo(b.x2, y); c.stroke();
      }
      c.restore();
    }

    if (M > 0) {
      c.save();
      c.setLineDash([3, 3]);
      c.lineWidth = Math.max(0.3, (o.size || 4) * 0.14);
      c.strokeStyle = U.alpha(o.color, 0.25);
      for (let i = 0; i < mainCells; i++) {
        for (let j = 1; j < M; j++) {
          const x = b.x1 + i * cw + (cw / M) * j;
          c.beginPath(); c.moveTo(x, b.y1); c.lineTo(x, b.y2); c.stroke();
          const y = b.y1 + i * ch + (ch / M) * j;
          c.beginPath(); c.moveTo(b.x1, y); c.lineTo(b.x2, y); c.stroke();
        }
      }
      c.restore();
    }

    c.beginPath();
    c.moveTo(ox, oy); c.lineTo(xEnd, oy);
    c.moveTo(ox, oy); c.lineTo(ox, yEnd);
    c.stroke();
    U.arrowHead(c, ox, oy, xEnd, oy, o.size || 4);
    U.arrowHead(c, ox, oy, ox, yEnd, o.size || 4);

    const step = 40;
    const tick = 5;
    c.save();
    c.lineWidth = Math.max(0.6, (o.size || 4) * 0.4);

    const tickYDir = yUp ? 1 : -1;
    for (let d = step; d < b.w - 4; d += step) {
      const x = xRight ? ox + d : ox - d;
      c.beginPath();
      c.moveTo(x, oy);
      c.lineTo(x, oy + tick * tickYDir);
      c.stroke();
    }

    const tickXDir = xRight ? 1 : -1;
    for (let d = step; d < b.h - 4; d += step) {
      const y = yUp ? oy - d : oy + d;
      c.beginPath();
      c.moveTo(ox, y);
      c.lineTo(ox + tick * tickXDir, y);
      c.stroke();
    }
    c.restore();
  }
});


/* ==========================================================================
 * 5. 力学
 * ========================================================================== */



/* ---- 滑轮 ---- */
shape({
  key: 'pulley', cat: 'mech', geom: 'box', label: '滑轮', fill: true,
  icon: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2" fill="currentColor"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    const r = Math.min(b.w, b.h) / 2;
    c.beginPath();
    c.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2);
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.12); c.fill(); }
    c.stroke();
    c.beginPath();
    c.arc(cx, cy, Math.max(2, r * 0.12), 0, Math.PI * 2);
    c.fillStyle = o.color;
    c.fill();
  }
});

/* ---- 弹簧 ---- */
shape({
  key: 'spring', cat: 'mech', geom: 'line', label: '弹簧',
  icon: '<path d="M2 12h2.5l1.5-4 3 8 3-8 3 8 1.5-4H21"/>',
  params: ['coils', 'springAmp'],
  draw(c, o) {
    const x1 = o.x1, y1 = o.y1, x2 = o.x2, y2 = o.y2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 2) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); return; }
    const ux = dx / len, uy = dy / len;
    const nx = -uy, ny = ux;
    const coils = Math.max(2, o.coils ?? 8);
    const ampFrac = Math.max(0.03, Math.min(0.25, o.springAmp ?? 0.09));
    const amp = Math.min(20, len * ampFrac);
    const endFrac = 0.08;
    const s0 = len * endFrac, s1 = len * (1 - endFrac);
    const segs = coils * 16;

    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x1 + ux * s0, y1 + uy * s0);
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const s = s0 + (s1 - s0) * t;
      const off = Math.sin(t * coils * Math.PI * 2) * amp;
      c.lineTo(x1 + ux * s + nx * off, y1 + uy * s + ny * off);
    }
    c.lineTo(x2, y2);
    c.stroke();
  }
});

/* ---- 单摆 ---- */
shape({
  key: 'pendulum', cat: 'mech', geom: 'line', label: '单摆',
  icon: '<path d="M12 3v13"/><circle cx="12" cy="18" r="3"/>',
  draw(c, o, U) {
    c.beginPath();
    c.moveTo(o.x1, o.y1);
    c.lineTo(o.x2, o.y2);
    c.stroke();
    c.beginPath();
    c.arc(o.x1, o.y1, Math.max(3, (o.size || 4) * 1.2), 0, Math.PI * 2);
    c.fillStyle = o.color;
    c.fill();
    const r = Math.max(6, (o.size || 4) * 2.2);
    c.beginPath();
    c.arc(o.x2, o.y2, r, 0, Math.PI * 2);
    c.fillStyle = U.alpha(o.color, 0.55);
    c.fill();
    c.stroke();
  }
});

/* ---- 小车 ---- */
shape({
  key: 'cart', cat: 'mech', geom: 'box', label: '小车', fill: true,
  icon: '<rect x="4" y="9" width="16" height="8" rx="1"/><circle cx="8" cy="19" r="2"/><circle cx="16" cy="19" r="2"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const bodyH = b.h * 0.6;
    const bodyY = b.y1 + b.h - bodyH - b.h * 0.18;
    c.beginPath();
    c.rect(b.x1, bodyY, b.w, bodyH);
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.2); c.fill(); }
    c.stroke();
    const wr = b.h * 0.16;
    const wy = b.y1 + b.h - wr;
    c.beginPath(); c.arc(b.x1 + b.w * 0.25, wy, wr, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(b.x1 + b.w * 0.75, wy, wr, 0, Math.PI * 2); c.stroke();
  }
});

/* ---- 小球 ---- */
shape({
  key: 'ball', cat: 'mech', geom: 'box', label: '小球', fill: true,
  icon: '<circle cx="12" cy="12" r="8"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    const r = Math.min(b.w, b.h) / 2;
    c.beginPath();
    c.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2);
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.2); c.fill(); }
    c.stroke();
  }
});

/* ---- 地面 ---- */
param('groundUp', { label: '锯齿方向', min: 0, max: 1, step: 1, def: 0, unit: '0下1上' });

shape({
  key: 'ground', cat: 'mech', geom: 'line', label: '地面',
  icon: '<path d="M3 15h18"/><path d="M5 15l-2 4M9 15l-2 4M13 15l-2 4M17 15l-2 4M21 15l-2 4"/>',
  params: ['groundGap', 'groundUp'],
  draw(c, o) {
    c.beginPath();
    c.moveTo(o.x1, o.y1);
    c.lineTo(o.x2, o.y2);
    c.stroke();

    const dx = o.x2 - o.x1, dy = o.y2 - o.y1;
    const len = Math.hypot(dx, dy);
    if (len < 2) return;
    const ux = dx / len, uy = dy / len;
    let nx = -uy, ny = ux;
    const up = (o.groundUp ?? 0) >= 0.5;
    if (up ? ny > 0 : ny < 0) { nx = -nx; ny = -ny; }
    const tickLen = 10;
    const spacing = Math.max(6, o.groundGap ?? 18);

    c.save();
    c.lineWidth = Math.max(0.7, (o.size || 4) * 0.5);
    for (let s = 0; s <= len; s += spacing) {
      const px = o.x1 + ux * s;
      const py = o.y1 + uy * s;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px + nx * tickLen - ux * tickLen * 0.5,
               py + ny * tickLen - uy * tickLen * 0.5);
      c.stroke();
    }
    c.restore();
  }
});

/* ---- 传送带 ---- */
shape({
  key: 'conveyor', cat: 'mech', geom: 'box', label: '传送带', fill: true,
  icon: '<circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/>' +
        '<path d="M6 9h12M6 15h12"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cy = (b.y1 + b.y2) / 2;
    const R = Math.max(4, Math.min(b.h / 2, b.w / 4));
    const cx1 = b.x1 + R;
    const cx2 = b.x2 - R;

    c.beginPath();
    c.moveTo(cx1, cy - R);
    c.lineTo(cx2, cy - R);
    c.moveTo(cx1, cy + R);
    c.lineTo(cx2, cy + R);
    c.stroke();

    c.beginPath();
    c.moveTo(cx1 + R, cy);
    c.arc(cx1, cy, R, 0, Math.PI * 2);
    c.moveTo(cx2 + R, cy);
    c.arc(cx2, cy, R, 0, Math.PI * 2);
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.18); c.fill(); }
    c.stroke();
  }
});

/* ---- 铁轨截面 ---- */
shape({
  key: 'railCross', cat: 'mech', geom: 'box', label: '铁轨截面',
  icon: '<rect x="3" y="2" width="4" height="8"/>' +
        '<rect x="17" y="2" width="4" height="8"/>' +
        '<rect x="1" y="10" width="22" height="3"/>' +
        '<path d="M3 13h18l2 7H1z"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const { x1, y1, x2, y2, w, h } = b;

    const railTopY   = y1;
    const railBotY   = y1 + h * 0.40;
    const sleeperTop = y1 + h * 0.38;
    const sleeperBot = y1 + h * 0.58;
    const ballastTop = y1 + h * 0.52;
    const ballastBot = y2;

    const btInset = w * 0.10;
    const bbInset = w * 0.02;
    c.beginPath();
    c.moveTo(x1 + btInset, ballastTop);
    c.lineTo(x2 - btInset, ballastTop);
    c.lineTo(x2 - bbInset, ballastBot);
    c.lineTo(x1 + bbInset, ballastBot);
    c.closePath();
    c.fillStyle = 'rgba(161,136,127,0.35)';
    c.fill();
    c.stroke();

    c.save();
    c.fillStyle = 'rgba(120,100,95,0.45)';
    const ballastH = ballastBot - ballastTop;
    const dotCount = 36;
    for (let i = 0; i < dotCount; i++) {
      const s1 = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
      const s2 = Math.sin(i * 78.2330 + 1.2345) * 43758.5453;
      const rx = s1 - Math.floor(s1);
      const ry = s2 - Math.floor(s2);
      const yFrac = ry;
      const leftX  = x1 + btInset + (bbInset - btInset) * yFrac;
      const rightX = x2 - btInset - (bbInset - btInset) * yFrac;
      const px = leftX + rx * (rightX - leftX);
      const py = ballastTop + 4 + ry * (ballastH - 8);
      c.beginPath();
      c.arc(px, py, 1.3, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    const slInset = w * 0.06;
    c.beginPath();
    c.rect(x1 + slInset, sleeperTop, w - slInset * 2, sleeperBot - sleeperTop);
    c.fillStyle = 'rgba(141,110,99,0.75)';
    c.fill();
    c.stroke();

    const railW    = w * 0.09;
    const railPos  = [x1 + w * 0.28, x1 + w * 0.72];
    const railTotH = railBotY - railTopY;
    const headH = railTotH * 0.30;
    const webH  = railTotH * 0.40;
    const footH = railTotH * 0.30;
    const footW = railW * 1.15;

    railPos.forEach(rxc => {
      c.beginPath();
      c.rect(rxc - railW / 2, railTopY, railW, headH);
      c.fillStyle = '#9e9e9e';
      c.fill();
      c.stroke();

      const webW = railW * 0.35;
      c.beginPath();
      c.rect(rxc - webW / 2, railTopY + headH, webW, webH);
      c.fillStyle = '#bdbdbd';
      c.fill();
      c.stroke();

      c.beginPath();
      c.rect(rxc - footW / 2, railTopY + headH + webH, footW, footH);
      c.fillStyle = '#9e9e9e';
      c.fill();
      c.stroke();
    });
  }
});


/* ==========================================================================
 * 6. 波动
 * ========================================================================== */

/* 波形采样：t ∈ [0,1]，返回 [-1, 1] */
function waveSample(type, t, cycles, phase) {
  const arg = 2 * Math.PI * cycles * t + phase;
  switch (type) {
    case 'sine':
      return Math.sin(arg);

    case 'square':
      return Math.sin(arg) >= 0 ? 1 : -1;

    case 'tri': {
      let p = arg / (2 * Math.PI);
      p = p - Math.floor(p);
      if (p < 0.25) return 4 * p;
      if (p < 0.75) return 2 - 4 * p;
      return 4 * p - 4;
    }

    case 'saw': {
      let p = arg / (2 * Math.PI);
      p = p - Math.floor(p);
      return 2 * p - 1;
    }

    case 'half': {
      const s = Math.sin(arg);
      return s > 0 ? s : 0;
    }

    case 'full':
      return Math.abs(Math.sin(arg));

    case 'standing':
      return Math.sin(arg) * Math.abs(Math.sin(Math.PI * t));

    case 'damped': {
      const env = Math.exp(-3 * t);
      return Math.sin(arg) * env;
    }

    case 'am': {
      const carrier = Math.sin(arg);
      const env = 0.6 + 0.4 * Math.sin(2 * Math.PI * 2 * t);
      return carrier * env;
    }

    case 'beat': {
      const f1 = cycles - 0.5;
      const f2 = cycles + 0.5;
      return 0.5 * (Math.sin(2 * Math.PI * f1 * t + phase)
                  + Math.sin(2 * Math.PI * f2 * t + phase));
    }

    case 'pulse': {
      const center = 0.5;
      const w = 0.15;
      const g = Math.exp(-Math.pow(t - center, 2) / (2 * w * w));
      const carrier = Math.cos(2 * Math.PI * cycles * (t - center) + phase);
      return g * carrier;
    }

    default:
      return Math.sin(arg);
  }
}

function waveDraw(type) {
  return function (c, o, U) {
    const b = U.bbox(o);
    const cycles   = Math.max(0.5, o.cycles ?? 2);
    const ampFrac  = Math.max(0, Math.min(1, o.amp ?? 0.5));
    const phase    = ((o.phase ?? 0) * Math.PI) / 180;
    const showAxis = (o.waveAxis ?? 1) >= 0.5;

    const padX = b.w * 0.06;
    const padY = b.h * 0.10;
    const cy   = (b.y1 + b.y2) / 2;
    const amp  = (b.h / 2 - padY) * ampFrac;

    const axX   = b.x1 + padX;
    const left  = axX;
    const right = b.x2 - padX;

    if (showAxis) {
      const axTop   = b.y1 + padY * 0.4;
      const axRight = b.x2 - padX * 0.4;

      c.beginPath();
      c.moveTo(axX, b.y2 - padY * 0.4);
      c.lineTo(axX, axTop);
      c.stroke();
      U.arrowHead(c, axX, b.y2 - padY * 0.4, axX, axTop, o.size || 4);

      c.beginPath();
      c.moveTo(axX, cy);
      c.lineTo(axRight, cy);
      c.stroke();
      U.arrowHead(c, axX, cy, axRight, cy, o.size || 4);
    }

    const N = Math.max(160, Math.round(b.w * 1.4));
    c.beginPath();
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = left + (right - left) * t;
      const s = waveSample(type, t, cycles, phase);
      const y = cy - amp * s;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  };
}

/* ===== 周期波 ===== */
shape({
  key: 'sine', cat: 'wave', geom: 'box', label: '正弦波', fill: false,
  icon: '<path d="M2 12q3-8 6 0t6 0t6 0"/>',
  params: ['cycles', 'amp', 'phase', 'waveAxis'],
  draw: waveDraw('sine')
});

shape({
  key: 'square', cat: 'wave', geom: 'box', label: '方波', fill: false,
  icon: '<path d="M3 16V8h6v8h6V8h6"/>',
  params: ['cycles', 'amp', 'phase', 'waveAxis'],
  draw: waveDraw('square')
});

shape({
  key: 'triWave', cat: 'wave', geom: 'box', label: '三角波', fill: false,
  icon: '<path d="M3 16l3-8 3 8 3-8 3 8 3-8 3 8"/>',
  params: ['cycles', 'amp', 'phase', 'waveAxis'],
  draw: waveDraw('tri')
});

shape({
  key: 'sawWave', cat: 'wave', geom: 'box', label: '锯齿波', fill: false,
  icon: '<path d="M2 16l6-8v8l6-8v8l6-8"/>',
  params: ['cycles', 'amp', 'phase', 'waveAxis'],
  draw: waveDraw('saw')
});

/* ===== 整流 ===== */
shape({
  key: 'halfRect', cat: 'wave', geom: 'box', label: '半波整流', fill: false,
  icon: '<path d="M2 16q3-8 6 0h2q3-8 6 0h2"/>',
  params: ['cycles', 'amp', 'phase', 'waveAxis'],
  draw: waveDraw('half')
});

shape({
  key: 'fullRect', cat: 'wave', geom: 'box', label: '全波整流', fill: false,
  icon: '<path d="M2 16q3-8 6 0q3-8 6 0q3-8 6 0"/>',
  params: ['cycles', 'amp', 'phase', 'waveAxis'],
  draw: waveDraw('full')
});

/* ===== 振动 ===== */
shape({
  key: 'standing', cat: 'wave', geom: 'box', label: '驻波', fill: false,
  icon: '<path d="M3 12q3-6 6 0t6 0t6 0"/>',
  params: ['cycles', 'amp', 'phase', 'waveAxis'],
  draw: waveDraw('standing')
});

shape({
  key: 'dampedWave', cat: 'wave', geom: 'box', label: '阻尼振荡', fill: false,
  icon: '<path d="M2 12q2-7 4 0q2 7 4 0q2-5 4 0q2 5 4 0q2-3 4 0"/>',
  params: ['cycles', 'amp', 'phase', 'waveAxis'],
  draw: waveDraw('damped')
});

/* ===== 调制 ===== */
shape({
  key: 'amWave', cat: 'wave', geom: 'box', label: '调幅波', fill: false,
  icon: '<path d="M2 12q2-5 4 0q2-9 5 0q2-9 5 0q2 9 5 0q2 5 4 0"/>',
  params: ['cycles', 'amp', 'phase', 'waveAxis'],
  draw: waveDraw('am')
});

shape({
  key: 'beatWave', cat: 'wave', geom: 'box', label: '拍', fill: false,
  icon: '<path d="M2 12q2-4 3 0q2 4 3 0q2-8 4 0q2 8 4 0q2-4 3 0"/>',
  params: ['cycles', 'amp', 'phase', 'waveAxis'],
  draw: waveDraw('beat')
});

/* ===== 脉冲 ===== */
shape({
  key: 'pulse', cat: 'wave', geom: 'box', label: '脉冲波', fill: false,
  icon: '<path d="M2 16q5-14 10 0h10"/>',
  params: ['cycles', 'amp', 'phase', 'waveAxis'],
  draw: waveDraw('pulse')
});


/* ==========================================================================
 * 7. 水波（含干涉、3D）
 * ========================================================================== */

function drawHyperbola(c, cx, cy, d, lambda, k, extend) {
  const a = Math.abs(k) * lambda / 2;
  if (a >= d) return;

  if (a < 1e-6) {
    c.beginPath();
    c.moveTo(cx, cy - extend);
    c.lineTo(cx, cy + extend);
    c.stroke();
    return;
  }

  const b = Math.sqrt(d * d - a * a);
  const sign = k >= 0 ? 1 : -1;
  const tMax = Math.asinh(extend / b);
  const N = 60;

  c.beginPath();
  for (let i = 0; i <= N; i++) {
    const t = -tMax + (2 * tMax) * i / N;
    const px = sign * a * Math.cosh(t);
    const py = b * Math.sinh(t);
    if (i === 0) c.moveTo(cx + px, cy + py);
    else c.lineTo(cx + px, cy + py);
  }
  c.stroke();
}

param('rippleCount', { label: '波纹数', min: 2, max: 12, step: 1, def: 6 });

shape({
  key: 'waterTop', cat: 'wave', geom: 'box', label: '水波（俯视）', fill: false,
  icon: '<circle cx="12" cy="12" r="2" fill="currentColor"/>' +
        '<circle cx="12" cy="12" r="5"/>' +
        '<circle cx="12" cy="12" r="8"/>' +
        '<circle cx="12" cy="12" r="11"/>',
  params: ['rippleCount'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2;
    const cy = b.y1 + b.h / 2;
    const maxR = Math.max(b.w, b.h) * 0.75;
    const count = Math.max(2, Math.round(o.rippleCount ?? 6));
    const gap = maxR / count;

    c.save();
    c.beginPath();
    c.rect(b.x1, b.y1, b.w, b.h);
    c.clip();
    c.lineWidth = Math.max(0.8, (o.size || 4) * 0.5);

    for (let i = 0; i < count; i++) {
      const r = gap * (i + 1);
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.setLineDash(i % 2 === 0 ? [] : [5, 5]);
      c.stroke();
    }
    c.setLineDash([]);
    c.restore();

    c.beginPath();
    c.arc(cx, cy, Math.max(2, (o.size || 4) * 0.8), 0, Math.PI * 2);
    c.fillStyle = o.color;
    c.fill();
  }
});

param('srcSep',    { label: '波源间距', min: 5, max: 80, step: 1, def: 30, unit: '%' });
param('phaseInv',  { label: '相位',     min: 0, max: 1,  step: 1, def: 0, unit: '0同1反' });
param('showNodes', { label: '干涉线',   min: 0, max: 1,  step: 1, def: 1 });

shape({
  key: 'waterInterf', cat: 'wave', geom: 'box', label: '水波干涉（俯视）', fill: false,
  icon: '<circle cx="9" cy="12" r="1.5" fill="currentColor"/>' +
        '<circle cx="15" cy="12" r="1.5" fill="currentColor"/>' +
        '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>' +
        '<circle cx="9" cy="12" r="9"/><circle cx="15" cy="12" r="9"/>',
  params: ['rippleCount', 'srcSep', 'phaseInv', 'showNodes'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2;
    const cy = b.y1 + b.h / 2;
    const count = Math.max(2, Math.round(o.rippleCount ?? 6));
    const sepFrac = Math.max(0.05, Math.min(0.8, (o.srcSep ?? 30) / 100));
    const d = Math.min(b.w, b.h) * sepFrac / 2;
    const maxR = Math.hypot(b.w, b.h) * 0.7;
    const gap = maxR / count;
    const inv = (o.phaseInv ?? 0) >= 0.5;
    const showNodes = (o.showNodes ?? 1) >= 0.5;

    const s1 = { x: cx - d, y: cy };
    const s2 = { x: cx + d, y: cy };

    c.save();
    c.beginPath();
    c.rect(b.x1, b.y1, b.w, b.h);
    c.clip();

    c.lineWidth = Math.max(0.7, (o.size || 4) * 0.4);
    for (let i = 0; i < count; i++) {
      const r = gap * (i + 1);
      c.beginPath();
      c.arc(s1.x, s1.y, r, 0, Math.PI * 2);
      c.setLineDash(i % 2 === 0 ? [] : [5, 5]);
      c.stroke();
    }

    for (let i = 0; i < count; i++) {
      const r = gap * (i + 1);
      c.beginPath();
      c.arc(s2.x, s2.y, r, 0, Math.PI * 2);
      const isCrest = (i % 2 === 0) !== inv;
      c.setLineDash(isCrest ? [] : [5, 5]);
      c.stroke();
    }

    if (showNodes) {
      c.save();
      const extend = Math.max(b.w, b.h) * 0.8;
      const maxN = Math.min(15, Math.ceil(2 * d / gap));

      for (let n = -maxN; n <= maxN; n++) {
        const kC = inv ? n + 0.5 : n;
        c.strokeStyle = U.alpha(o.color, 0.55);
        c.lineWidth = Math.max(1, (o.size || 4) * 0.55);
        c.setLineDash([]);
        drawHyperbola(c, cx, cy, d, gap, kC, extend);

        const kD = inv ? n : n + 0.5;
        c.strokeStyle = U.alpha(o.color, 0.3);
        c.lineWidth = Math.max(0.6, (o.size || 4) * 0.3);
        c.setLineDash([4, 4]);
        drawHyperbola(c, cx, cy, d, gap, kD, extend);
      }
      c.restore();
    }

    c.setLineDash([]);
    c.restore();

    [s1, s2].forEach(s => {
      c.beginPath();
      c.arc(s.x, s.y, Math.max(2.5, (o.size || 4) * 1), 0, Math.PI * 2);
      c.fillStyle = o.color;
      c.fill();
    });
  }
});

param('tilt', { label: '视角', min: 25, max: 85, step: 1, def: 60, unit: '°' });

shape({
  key: 'water3D', cat: 'wave', geom: 'box', label: '水波（3D）', fill: false,
  icon: '<ellipse cx="12" cy="13" rx="10" ry="6"/>' +
        '<ellipse cx="12" cy="13" rx="6" ry="3.5"/>' +
        '<ellipse cx="12" cy="13" rx="2" ry="1.2"/>',
  params: ['tilt', 'rippleCount'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2;
    const cy = b.y1 + b.h / 2;
    const tiltDeg = Math.max(25, Math.min(85, o.tilt ?? 60));
    const tilt = tiltDeg * Math.PI / 180;
    const count = Math.max(2, Math.round(o.rippleCount ?? 5));

    const scaleX = b.w / 2 * 0.92;
    const scaleY = b.h / 2 * 0.92;
    const scaleZ = Math.min(b.w, b.h) / 2 * 0.75;
    const sinT = Math.sin(tilt);
    const cosT = Math.cos(tilt);

    function project(x, y, z) {
      return {
        sx: cx + x * scaleX,
        sy: cy - y * scaleY * sinT - z * scaleZ * cosT
      };
    }

    function waveZ(x, y) {
      const r = Math.hypot(x, y);
      return Math.cos(Math.PI * count * r) * Math.exp(-r * 1.2);
    }

    const N = 72;
    const cells = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x0 = -1 + 2 * i / N;
        const x1 = -1 + 2 * (i + 1) / N;
        const y0 = -1 + 2 * j / N;
        const y1 = -1 + 2 * (j + 1) / N;
        const z00 = waveZ(x0, y0);
        const z10 = waveZ(x1, y0);
        const z11 = waveZ(x1, y1);
        const z01 = waveZ(x0, y1);
        cells.push({
          x0, x1, y0, y1, z00, z10, z11, z01,
          zAvg: (z00 + z10 + z11 + z01) / 4,
          yAvg: (y0 + y1) / 2
        });
      }
    }
    cells.sort((a, b) => b.yAvg - a.yAvg);

    c.save();
    c.lineJoin = 'round';
    for (const cell of cells) {
      const p00 = project(cell.x0, cell.y0, cell.z00);
      const p10 = project(cell.x1, cell.y0, cell.z10);
      const p11 = project(cell.x1, cell.y1, cell.z11);
      const p01 = project(cell.x0, cell.y1, cell.z01);

      c.beginPath();
      c.moveTo(p00.sx, p00.sy);
      c.lineTo(p10.sx, p10.sy);
      c.lineTo(p11.sx, p11.sy);
      c.lineTo(p01.sx, p01.sy);
      c.closePath();

      const h = Math.max(0, Math.min(1, (cell.zAvg + 1) / 2));
      const lum = 38 + 54 * h;
      const col = `hsl(210, 70%, ${lum}%)`;
      c.fillStyle = col;
      c.strokeStyle = col;
      c.lineWidth = 0.6;
      c.fill();
      c.stroke();
    }
    c.restore();
  }
});

shape({
  key: 'waterInterf3D', cat: 'wave', geom: 'box', label: '水波干涉（3D）', fill: false,
  icon: '<ellipse cx="9"  cy="13" rx="5" ry="3"/>' +
        '<ellipse cx="15" cy="13" rx="5" ry="3"/>' +
        '<ellipse cx="12" cy="13" rx="10" ry="6"/>',
  params: ['tilt', 'rippleCount', 'srcSep', 'phaseInv'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2;
    const cy = b.y1 + b.h / 2;
    const tiltDeg = Math.max(25, Math.min(85, o.tilt ?? 60));
    const tilt = tiltDeg * Math.PI / 180;
    const count = Math.max(2, Math.round(o.rippleCount ?? 5));
    const sepFrac = Math.max(0.05, Math.min(0.8, (o.srcSep ?? 30) / 100));
    const inv = (o.phaseInv ?? 0) >= 0.5;

    const scaleX = b.w / 2 * 0.92;
    const scaleY = b.h / 2 * 0.92;
    const scaleZ = Math.min(b.w, b.h) / 2 * 0.75;
    const sinT = Math.sin(tilt);
    const cosT = Math.cos(tilt);

    function project(x, y, z) {
      return {
        sx: cx + x * scaleX,
        sy: cy - y * scaleY * sinT - z * scaleZ * cosT
      };
    }

    const sx1 = -sepFrac / 2;
    const sx2 =  sepFrac / 2;
    const phase2 = inv ? Math.PI : 0;

    function waveZ(x, y) {
      const r1 = Math.hypot(x - sx1, y);
      const r2 = Math.hypot(x - sx2, y);
      const w1 = Math.cos(Math.PI * count * r1) * Math.exp(-r1 * 0.9);
      const w2 = Math.cos(Math.PI * count * r2 + phase2) * Math.exp(-r2 * 0.9);
      return (w1 + w2) / 2;
    }

    const N = 80;
    const cells = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x0 = -1 + 2 * i / N;
        const x1 = -1 + 2 * (i + 1) / N;
        const y0 = -1 + 2 * j / N;
        const y1 = -1 + 2 * (j + 1) / N;
        const z00 = waveZ(x0, y0);
        const z10 = waveZ(x1, y0);
        const z11 = waveZ(x1, y1);
        const z01 = waveZ(x0, y1);
        cells.push({
          x0, x1, y0, y1, z00, z10, z11, z01,
          zAvg: (z00 + z10 + z11 + z01) / 4,
          yAvg: (y0 + y1) / 2
        });
      }
    }
    cells.sort((a, b) => b.yAvg - a.yAvg);

    c.save();
    c.lineJoin = 'round';
    for (const cell of cells) {
      const p00 = project(cell.x0, cell.y0, cell.z00);
      const p10 = project(cell.x1, cell.y0, cell.z10);
      const p11 = project(cell.x1, cell.y1, cell.z11);
      const p01 = project(cell.x0, cell.y1, cell.z01);

      c.beginPath();
      c.moveTo(p00.sx, p00.sy);
      c.lineTo(p10.sx, p10.sy);
      c.lineTo(p11.sx, p11.sy);
      c.lineTo(p01.sx, p01.sy);
      c.closePath();

      const h = Math.max(0, Math.min(1, (cell.zAvg + 1) / 2));
      const lum = 38 + 54 * h;
      const col = `hsl(210, 70%, ${lum}%)`;
      c.fillStyle = col;
      c.strokeStyle = col;
      c.lineWidth = 0.6;
      c.fill();
      c.stroke();
    }
    c.restore();
  }
});


/* ==========================================================================
 * 8. 多普勒效应
 * ========================================================================== */

param('dopRatio', { label: '波速/源速', min: 0.33, max: 8, step: 0.05, def: 2 });
param('dopWaves', { label: '波前数',   min: 3,    max: 16, step: 1,   def: 8 });

shape({
  key: 'doppler', cat: 'wave', geom: 'box', label: '多普勒效应', fill: false,
  icon: '<circle cx="10" cy="12" r="3"/>' +
        '<circle cx="10" cy="12" r="6"/>' +
        '<circle cx="10" cy="12" r="9"/>' +
        '<circle cx="15" cy="12" r="1.8" fill="currentColor"/>' +
        '<path d="M12 12h5"/>',
  params: ['dopRatio', 'dopWaves'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const ratio = Math.max(0.33, Math.min(8, o.dopRatio ?? 2));
    const N = Math.max(3, Math.round(o.dopWaves ?? 8));
    const span = N - 1;

    const pad = Math.min(b.w, b.h) * 0.06;
    const Sx = (b.w - 2 * pad) / (span * (ratio + Math.max(ratio, 1)));
    const Sy = (b.h - 2 * pad) / (2 * ratio * span);
    const S = Math.min(Sx, Sy);

    const startX = b.x1 + pad + ratio * span * S;
    const cy = b.y1 + b.h / 2;

    c.save();
    c.lineWidth = Math.max(0.6, (o.size || 4) * 0.45);
    c.strokeStyle = U.alpha(o.color, 0.65);

    for (let i = 0; i < N; i++) {
      const px = startX + i * S;
      const r = ratio * (N - 1 - i) * S;
      if (r < 0.4) continue;
      c.beginPath();
      c.arc(px, cy, r, 0, Math.PI * 2);
      c.stroke();
    }

    c.save();
    c.strokeStyle = U.alpha(o.color, 0.35);
    c.setLineDash([4, 3]);
    c.beginPath();
    c.moveTo(startX, cy);
    c.lineTo(startX + span * S, cy);
    c.stroke();
    c.setLineDash([]);
    c.restore();

    c.beginPath();
    c.arc(startX + span * S, cy, Math.max(3, (o.size || 4) * 1.2), 0, Math.PI * 2);
    c.fillStyle = o.color;
    c.fill();

    c.restore();
  }
});


/* ==========================================================================
 * 9. 波的衍射
 * ========================================================================== */

param('difWave', { label: '波长', min: 5,  max: 60, step: 1, def: 15, unit: 'px' });
param('difSlit', { label: '缝宽', min: 2,  max: 80, step: 1, def: 80, unit: 'px' });

shape({
  key: 'diffract', cat: 'wave', geom: 'box', label: '波的衍射', fill: false,
  icon: '<path d="M4 4v16M8 4v16"/>' +
        '<path d="M12 4v6M12 14v6"/>' +
        '<path d="M14 8a6 6 0 0 1 0 8"/>' +
        '<path d="M14 5a9 9 0 0 1 0 14"/>',
  params: ['difWave', 'difSlit'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const wavelength = Math.max(4, o.difWave ?? 20);
    const slit = Math.max(2, o.difSlit ?? 12);

    const wallX  = b.x1 + b.w * 0.5;
    const cy     = b.y1 + b.h / 2;
    const slitT  = cy - slit / 2;
    const slitB  = cy + slit / 2;

    c.save();
    c.lineWidth = Math.max(0.6, (o.size || 4) * 0.42);
    c.strokeStyle = U.alpha(o.color, 0.6);

    for (let x = b.x1 + 4; x < wallX - 4; x += wavelength) {
      c.beginPath();
      c.moveTo(x, b.y1 + 4);
      c.lineTo(x, b.y2 - 4);
      c.stroke();
    }

    c.save();
    c.strokeStyle = o.color;
    c.lineWidth = Math.max(1.5, (o.size || 4) * 0.9);
    c.beginPath();
    c.moveTo(wallX, b.y1 + 4); c.lineTo(wallX, slitT);
    c.moveTo(wallX, slitB);    c.lineTo(wallX, b.y2 - 4);
    c.stroke();
    c.restore();

    const spread = Math.PI / 2 * Math.min(1, 2 * wavelength / slit);
    const maxR = Math.max(b.w, b.h);
    for (let i = 1; i * wavelength < maxR; i++) {
      c.beginPath();
      c.arc(wallX, cy, i * wavelength, -spread, spread);
      c.stroke();
    }

    c.restore();
  }
});


/* ==========================================================================
 * 10. 惠更斯原理（反射 / 折射）
 * ========================================================================== */

param('huyType',  { label: '类型',   min: 0, max: 1,   step: 1,   def: 0,   unit: '0反射1折射' });
param('huyAngle', { label: '入射角', min: 20, max: 75, step: 1,   def: 50,  unit: '°' });
param('huyN',     { label: '折射率', min: 1.1, max: 3, step: 0.1, def: 1.5 });

shape({
  key: 'huygens', cat: 'wave', geom: 'box', label: '惠更斯原理', fill: false,
  icon: '<path d="M2 16h20"/>' +
        '<path d="M4 3l5 13"/>' +
        '<circle cx="9"  cy="16" r="4"/>' +
        '<circle cx="14" cy="16" r="2"/>' +
        '<path d="M6 16l10-7"/>',
  params: ['huyType', 'huyAngle', 'huyN'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const type = Math.round(o.huyType ?? 0);
    const thetaDeg = Math.max(20, Math.min(75, o.huyAngle ?? 50));
    const theta = thetaDeg * Math.PI / 180;
    const n = Math.max(1.1, o.huyN ?? 1.5);
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    const yI = b.y1 + b.h * 0.55;
    const cx = b.x1 + b.w / 2;

    const spacing = b.w * 0.14;
    const P = [
      { x: cx - spacing, y: yI },
      { x: cx,           y: yI },
      { x: cx + spacing, y: yI }
    ];

    const R = spacing * sinT;
    const arrowSize = Math.max(3, (o.size || 4) * 0.7);

    c.save();
    c.lineWidth = Math.max(0.7, (o.size || 4) * 0.45);
    c.strokeStyle = U.alpha(o.color, 0.55);

    c.beginPath();
    c.moveTo(b.x1, yI);
    c.lineTo(b.x2, yI);
    c.stroke();

    c.save();
    c.strokeStyle = U.alpha(o.color, 0.5);
    if (type === 0) {
      for (let i = 0; i < 3; i++) {
        const r = (2 - i) * R;
        if (r < 0.5) continue;
        c.beginPath();
        c.arc(P[i].x, P[i].y, r, Math.PI, Math.PI * 2);
        c.stroke();
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const r = (2 - i) * R / n;
        if (r < 0.5) continue;
        c.beginPath();
        c.arc(P[i].x, P[i].y, r, 0, Math.PI);
        c.stroke();
      }
    }
    c.restore();

    const tl = b.w * 0.60;
    c.save();
    c.strokeStyle = U.alpha(o.color, 0.85);
    c.lineWidth = Math.max(1, (o.size || 4) * 0.7);

    if (type === 0) {
      const dxF = -cosT, dyF = -sinT;
      c.beginPath();
      c.moveTo(P[2].x + tl * dxF, P[2].y + tl * dyF);
      c.lineTo(P[2].x - tl * 0.35 * dxF, P[2].y - tl * 0.35 * dyF);
      c.stroke();
    } else {
      const sinP = sinT / n;
      const cosP = Math.sqrt(Math.max(0, 1 - sinP * sinP));
      const dxF = -cosP, dyF = sinP;
      c.beginPath();
      c.moveTo(P[2].x + tl * dxF, P[2].y + tl * dyF);
      c.lineTo(P[2].x - tl * 0.35 * dxF, P[2].y - tl * 0.35 * dyF);
      c.stroke();
    }
    c.restore();

    const hUp = yI - b.y1;
    const maxL = hUp * 0.80 / cosT;
    const spanL = 2 * spacing * sinT;
    const L0 = Math.max(maxL * 0.15, maxL - spanL);
    const L = [L0, L0 + spacing * sinT, L0 + 2 * spacing * sinT];

    c.save();
    c.strokeStyle = o.color;
    c.lineWidth = Math.max(0.9, (o.size || 4) * 0.6);

    for (let i = 0; i < 3; i++) {
      const Qx = P[i].x - L[i] * sinT;
      const Qy = P[i].y - L[i] * cosT;
      c.beginPath();
      c.moveTo(Qx, Qy);
      c.lineTo(P[i].x, P[i].y);
      c.stroke();
      const mx = (Qx + P[i].x) / 2;
      const my = (Qy + P[i].y) / 2;
      U.arrowHead(c, Qx, Qy, mx, my, arrowSize);
    }
    c.restore();

    c.save();
    c.strokeStyle = o.color;
    c.lineWidth = Math.max(0.9, (o.size || 4) * 0.6);

    if (type === 0) {
      const maxM = hUp * 0.55 / cosT;
      const M = [
        maxM,
        Math.max(maxM * 0.20, maxM - spacing * sinT),
        Math.max(maxM * 0.20, maxM - 2 * spacing * sinT)
      ];
      for (let i = 0; i < 3; i++) {
        const Tx = P[i].x + M[i] * sinT;
        const Ty = P[i].y - M[i] * cosT;
        c.beginPath();
        c.moveTo(P[i].x, P[i].y);
        c.lineTo(Tx, Ty);
        c.stroke();
        const mx = (P[i].x + Tx) / 2;
        const my = (P[i].y + Ty) / 2;
        U.arrowHead(c, P[i].x, P[i].y, mx, my, arrowSize);
      }
    } else {
      const sinP = sinT / n;
      const cosP = Math.sqrt(Math.max(0, 1 - sinP * sinP));
      const hDn = b.y2 - yI;
      const maxN = hDn * 0.80 / cosP;
      const N = [
        maxN,
        Math.max(maxN * 0.20, maxN - spacing * sinP),
        Math.max(maxN * 0.20, maxN - 2 * spacing * sinP)
      ];
      for (let i = 0; i < 3; i++) {
        const Sx = P[i].x + N[i] * sinP;
        const Sy = P[i].y + N[i] * cosP;
        c.beginPath();
        c.moveTo(P[i].x, P[i].y);
        c.lineTo(Sx, Sy);
        c.stroke();
        const mx = (P[i].x + Sx) / 2;
        const my = (P[i].y + Sy) / 2;
        U.arrowHead(c, P[i].x, P[i].y, mx, my, arrowSize);
      }
    }
    c.restore();

    P.forEach(p => {
      c.beginPath();
      c.arc(p.x, p.y, Math.max(1.5, (o.size || 4) * 0.6), 0, Math.PI * 2);
      c.fillStyle = o.color;
      c.fill();
    });

    c.restore();
  }
});


/* ==========================================================================
 * 11. 光学（干涉 / 衍射）
 * ========================================================================== */

const HUE7 = [
  '#e53935',  // 红
  '#fb8c00',  // 橙
  '#fdd835',  // 黄
  '#43a047',  // 绿
  '#00acc1',  // 青
  '#1e88e5',  // 蓝
  '#8e24aa'   // 紫
];

function hex2rgb(hex) {
  const h = hex.replace('#', '');
  const s = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fillField(c, b, fn) {
  const w = Math.max(1, Math.ceil(b.w));
  const h = Math.max(1, Math.ceil(b.h));
  const tmp = document.createElement('canvas');
  tmp.width = w; tmp.height = h;
  const tctx = tmp.getContext('2d');
  const img = tctx.createImageData(w, h);
  const data = img.data;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const i = (py * w + px) * 4;
      const rgba = fn(px / w, py / h, w, h);
      data[i]     = rgba[0];
      data[i + 1] = rgba[1];
      data[i + 2] = rgba[2];
      data[i + 3] = rgba[3];
    }
  }
  tctx.putImageData(img, 0, 0);
  c.drawImage(tmp, Math.floor(b.x1), Math.floor(b.y1));
}

function strokeFrame(c, b) {
  c.save();
  c.strokeStyle = 'rgba(120,120,120,0.55)';
  c.lineWidth = 1;
  c.strokeRect(b.x1, b.y1, b.w, b.h);
  c.restore();
}

/* ---- 双缝干涉条纹 ---- */
shape({
  key: 'doubleSlit', cat: 'optics', geom: 'box', label: '双缝干涉',
  icon: '<path d="M3 4v16M8 4v16M16 4v16M21 4v16"/>' +
        '<path d="M3 8h5M8 8h8M16 8h5" stroke-opacity="0.35"/>' +
        '<path d="M3 12h5M8 12h8M16 12h5" stroke-opacity="0.7"/>' +
        '<path d="M3 16h5M8 16h8M16 16h5" stroke-opacity="0.35"/>',
  params: ['hue7', 'density'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const [r, g, bl] = hex2rgb(HUE7[Math.round(o.hue7 ?? 0) % 7]);
    const N = Math.max(2, Math.round(o.density ?? 12));
    fillField(c, b, (ux) => {
      const t = ux - 0.5;
      const u = t * N * 2;
      const I = Math.cos(Math.PI * u) ** 2;
      return [r, g, bl, Math.round(I * 255)];
    });
    strokeFrame(c, b);
  }
});

/* ---- 单缝衍射条纹 ---- */
param('slitWidth', { label: '缝宽 a/λ', min: 0.5, max: 10, step: 0.1, def: 3 });
param('slitLight', { label: '光源',    min: 0,   max: 7,  step: 1,   def: 0, unit: '0白1红2橙3黄4绿5青6蓝7紫' });

shape({
  key: 'singleSlit', cat: 'optics', geom: 'box', label: '单缝衍射',
  icon: '<path d="M3 4v16M21 4v16"/><path d="M10 4v16M14 4v16"/>' +
        '<path d="M3 12h7M14 12h7" stroke-opacity="0.9"/>',
  params: ['slitWidth', 'slitLight'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const aRatio = Math.max(0.5, Math.min(10, o.slitWidth ?? 3));
    const light  = Math.round(o.slitLight ?? 0);

    const WL_R = 1.30, WL_G = 1.00, WL_B = 0.80;
    const monoWL = [1.30, 1.15, 1.05, 1.00, 0.95, 0.88, 0.80];

    function sinc2(x) {
      if (Math.abs(x) < 1e-6) return 1;
      const s = Math.sin(x) / x;
      return s * s;
    }

    function intensity(u, wlr) {
      const beta = Math.PI * (aRatio / wlr) * u;
      return sinc2(beta);
    }

    if (light === 0) {
      fillField(c, b, (ux) => {
        const u = 2 * ux - 1;
        const IR = intensity(u, WL_R);
        const IG = intensity(u, WL_G);
        const IB = intensity(u, WL_B);
        return [
          Math.round(255 * IR),
          Math.round(255 * IG),
          Math.round(255 * IB),
          255
        ];
      });
    } else {
      const [r, g, bl] = hex2rgb(HUE7[(light - 1) % 7]);
      const wl = monoWL[light - 1];
      fillField(c, b, (ux) => {
        const u = 2 * ux - 1;
        const I = intensity(u, wl);
        return [
          Math.round(r * I),
          Math.round(g * I),
          Math.round(bl * I),
          255
        ];
      });
    }

    strokeFrame(c, b);
  }
});

/* ---- 牛顿环 ---- */
shape({
  key: 'newtonRing', cat: 'optics', geom: 'box', label: '牛顿环',
  icon: '<circle cx="12" cy="12" r="2"/>' +
        '<circle cx="12" cy="12" r="5"/>' +
        '<circle cx="12" cy="12" r="8"/>',
  params: ['hue7', 'density'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const [r, g, bl] = hex2rgb(HUE7[Math.round(o.hue7 ?? 0) % 7]);
    const N = Math.max(2, Math.round(o.density ?? 10));
    fillField(c, b, (ux, uy, w, h) => {
      const px = ux * w - w / 2;
      const py = uy * h - h / 2;
      const rmax = Math.min(w, h) / 2;
      const r2 = (px * px + py * py) / (rmax * rmax);
      if (r2 > 1) return [255, 255, 255, 0];
      const I = Math.sin(Math.PI * N * r2) ** 2;
      return [r, g, bl, Math.round(I * 255)];
    });
    strokeFrame(c, b);
  }
});

/* ---- 泊松亮斑 ---- */
param('shadowR', { label: '阴影半径', min: 0.2, max: 0.75, step: 0.05, def: 0.5 });

shape({
  key: 'poissonSpot', cat: 'optics', geom: 'box', label: '泊松亮斑',
  icon: '<circle cx="12" cy="12" r="8" stroke-opacity="0.4"/>' +
        '<circle cx="12" cy="12" r="5" stroke-opacity="0.7"/>' +
        '<circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  params: ['hue7', 'density', 'shadowR'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const [r, g, bl] = hex2rgb(HUE7[Math.round(o.hue7 ?? 0) % 7]);
    const N = Math.max(3, Math.round(o.density ?? 8));
    const shadowR = Math.max(0.2, Math.min(0.75, o.shadowR ?? 0.5));

    fillField(c, b, (ux, uy, w, h) => {
      const px = ux * w - w / 2;
      const py = uy * h - h / 2;
      const rmax = Math.min(w, h) / 2;
      const viewR = Math.sqrt(px * px + py * py) / rmax;

      if (viewR > 1) return [255, 255, 255, 0];

      const rr = viewR / shadowR;

      const x = Math.PI * N * rr;
      const osc = Math.cos(x) ** 2;

      const spot = Math.exp(-((rr / 0.06) ** 2));

      const edgeEnv = Math.exp(-Math.pow((rr - 1) * 2.5, 2));

      let I;
      if (rr < 1) {
        const darkBg = 0.02;
        const edgeRings = edgeEnv * osc * 0.55;
        const innerRings = Math.exp(-rr * 4) * osc * 0.08;
        I = darkBg + spot + edgeRings + innerRings;
      } else {
        const base = 0.9;
        const approach = 1 - Math.exp(-(rr - 1) * 2.5);
        const boundaryRing = edgeEnv * (1 - osc) * 0.55 * (1 - approach);
        I = base - boundaryRing;
      }

      const fade = viewR > 0.92 ? Math.max(0, (1 - viewR) / 0.08) : 1;

      I = Math.max(0, Math.min(1, I));
      return [r, g, bl, Math.round(I * fade * 255)];
    });
    strokeFrame(c, b);
  }
});

/* ---- 检测玻璃平整度 ---- */
param('distortX',   { label: '缺陷 X',   min: 0,   max: 1,  step: 0.02, def: 0.6 });
param('distortY',   { label: '缺陷 Y',   min: 0,   max: 1,  step: 0.02, def: 0.5 });
param('distortDir', { label: '凸起方向', min: 0,   max: 1,  step: 1,    def: 1,  unit: '0左1右' });

shape({
  key: 'glassFlatness', cat: 'optics', geom: 'box', label: '玻璃平整度',
  icon: '<path d="M3 4v16M21 4v16"/>' +
        '<path d="M6 6v12M9 6v12M12 6v10.5M15 6v13.5M18 6v12" ' +
        'stroke-opacity="0.85"/>',
  params: ['hue7', 'density', 'distort', 'distortX', 'distortY', 'distortDir'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const [r, g, bl] = hex2rgb(HUE7[Math.round(o.hue7 ?? 0) % 7]);
    const N = Math.max(3, Math.round(o.density ?? 12));
    const D = (o.distort ?? 30) / 100;
    const px = o.distortX ?? 0.6;
    const py = o.distortY ?? 0.5;
    const dirSign = (o.distortDir ?? 1) >= 0.5 ? 1 : -1;

    const aspect = b.w / b.h;
    const bumpAmp = D * 2.5;
    const sigma = 0.18;

    fillField(c, b, (ux, uy) => {
      let phase = ux * N;

      if (D > 0.001) {
        const dx = (ux - px) * aspect;
        const dy = (uy - py);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const bump = Math.exp(-((dist / sigma) ** 2));
        phase += dirSign * bump * bumpAmp;
      }

      const I = Math.cos(Math.PI * phase) ** 2;
      return [r, g, bl, Math.round(I * 255)];
    });

    strokeFrame(c, b);
  }
});


/* ==========================================================================
 * 12. 电磁（基础元件与场）
 * ========================================================================== */

/* ---- 条形磁铁 ---- */
shape({
  key: 'magnet', cat: 'em', geom: 'box', label: '条形磁铁',
  icon: '<rect x="4" y="8" width="16" height="8" rx="1"/><path d="M12 8v8"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const halfW = b.w / 2;
    c.save();
    c.fillStyle = '#e53935';
    c.fillRect(b.x1, b.y1, halfW, b.h);
    c.fillStyle = '#1e88e5';
    c.fillRect(b.x1 + halfW, b.y1, halfW, b.h);

    c.strokeStyle = o.color;
    c.lineWidth = Math.max(1, (o.size || 4) * 0.4);
    c.strokeRect(b.x1, b.y1, b.w, b.h);
    c.beginPath();
    c.moveTo(b.x1 + halfW, b.y1);
    c.lineTo(b.x1 + halfW, b.y2);
    c.stroke();

    c.fillStyle = '#fff';
    c.font = 'bold ' + Math.max(9, Math.min(b.h * 0.5, b.w * 0.25)) + 'px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('N', b.x1 + halfW * 0.5, b.y1 + b.h / 2);
    c.fillText('S', b.x1 + halfW * 1.5, b.y1 + b.h / 2);
    c.restore();
  }
});

/* ---- 蹄形磁铁 ---- */
param('swapPole', { label: '换极', min: 0, max: 1, step: 1, def: 0 });

shape({
  key: 'horseshoe', cat: 'em', geom: 'box', label: '蹄形磁铁',
  icon: '<path d="M4 3v14h16V3h-4v10H8V3z"/>',
  params: ['swapPole'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const armW  = Math.min(b.w * 0.3,  b.h * 0.4);
    const baseH = Math.min(b.h * 0.35, b.w * 0.4);
    const cx    = (b.x1 + b.x2) / 2;

    const swap = (o.swapPole ?? 0) >= 0.5;
    const leftColor  = swap ? '#1e88e5' : '#e53935';
    const rightColor = swap ? '#e53935' : '#1e88e5';

    c.fillStyle = leftColor;
    c.fillRect(b.x1, b.y1, armW, b.h - baseH);
    c.fillRect(b.x1, b.y2 - baseH, cx - b.x1, baseH);

    c.fillStyle = rightColor;
    c.fillRect(b.x2 - armW, b.y1, armW, b.h - baseH);
    c.fillRect(cx, b.y2 - baseH, b.x2 - cx, baseH);

    c.save();
    c.lineWidth   = Math.max(1, (o.size || 4) * 0.5);
    c.strokeStyle = o.color || '#1a1a1a';
    c.beginPath();
    c.moveTo(b.x1, b.y1);
    c.lineTo(b.x1 + armW, b.y1);
    c.lineTo(b.x1 + armW, b.y2 - baseH);
    c.lineTo(b.x2 - armW, b.y2 - baseH);
    c.lineTo(b.x2 - armW, b.y1);
    c.lineTo(b.x2, b.y1);
    c.lineTo(b.x2, b.y2);
    c.lineTo(b.x1, b.y2);
    c.closePath();
    c.stroke();
    c.restore();

    c.save();
    c.fillStyle = '#fff';
    const fs = Math.max(9, Math.min(b.h * 0.16, armW * 0.65));
    c.font = 'bold ' + fs + 'px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(swap ? 'S' : 'N', b.x1 + armW / 2, b.y1 + fs * 0.9);
    c.fillText(swap ? 'N' : 'S', b.x2 - armW / 2, b.y1 + fs * 0.9);
    c.restore();
  }
});

/* ---- 点电荷（按拖动方向区分正负） ---- */
shape({
  key: 'charge', cat: 'em', geom: 'box', label: '点电荷',
  icon: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>',
  params: ['chargeSign'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    const r = Math.min(b.w, b.h) / 2;

    /* 根据原始起止点的水平位移判断电性：
     *   向右拖 (x2 > x1) → 正电荷（红色 +）
     *   向左拖 (x2 < x1) → 负电荷（蓝色 −）
     *   水平位移过小（近乎竖直拖动）→ 回退到 chargeSign 参数
     * 说明：x1/x2 是主脚本拖动时持续更新的原始坐标，
     *       平移、缩放不会改变二者之差的符号，所以电性稳定。 */
    const dx = (o.x2 ?? 0) - (o.x1 ?? 0);
    let neg;
    if (Math.abs(dx) > 1) {
      neg = dx < 0;
    } else {
      neg = (o.chargeSign ?? 0) >= 0.5;
    }

    c.beginPath();
    c.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2);
    c.fillStyle = neg ? 'rgba(30,136,229,0.18)' : 'rgba(229,57,53,0.18)';
    c.fill();
    c.stroke();

    c.beginPath();
    if (!neg) {
      /* 正电荷：+ 号 */
      c.moveTo(cx - r * 0.5, cy); c.lineTo(cx + r * 0.5, cy);
      c.moveTo(cx, cy - r * 0.5); c.lineTo(cx, cy + r * 0.5);
    } else {
      /* 负电荷：− 号 */
      c.moveTo(cx - r * 0.5, cy); c.lineTo(cx + r * 0.5, cy);
    }
    c.stroke();
  }
});

/* ---- 磁场方向 ---- */
param('fieldInto', { label: '方向', min: 0, max: 1,  step: 1, def: 0 });
param('fieldRows', { label: '行数', min: 2, max: 20, step: 1, def: 6 });
param('fieldCols', { label: '列数', min: 2, max: 20, step: 1, def: 8 });

shape({
  key: 'magField', cat: 'em', geom: 'box', label: '磁场方向',
  icon: '<path d="M5 5l3 3M8 5l-3 3"/>' +
        '<path d="M16 5l3 3M19 5l-3 3"/>' +
        '<path d="M5 14l3 3M8 14l-3 3"/>' +
        '<circle cx="17.5" cy="15.5" r="1.2" fill="currentColor"/>',
  params: ['fieldInto', 'fieldRows', 'fieldCols'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const into = (o.fieldInto ?? 0) < 0.5;
    const rows = Math.max(2, Math.round(o.fieldRows ?? 6));
    const cols = Math.max(2, Math.round(o.fieldCols ?? 8));

    const cellW = b.w / cols;
    const cellH = b.h / rows;
    const unit  = Math.min(cellW, cellH);
    const arm   = unit * 0.26;
    const dotR  = unit * 0.13;

    c.save();
    c.lineCap = 'round';
    c.lineWidth = Math.max(1.2, (o.size || 4) * 0.5);
    c.strokeStyle = o.color;
    c.fillStyle   = o.color;

    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const cx = b.x1 + cellW * (col + 0.5);
        const cy = b.y1 + cellH * (r + 0.5);

        if (into) {
          c.beginPath();
          c.moveTo(cx - arm, cy - arm);
          c.lineTo(cx + arm, cy + arm);
          c.moveTo(cx + arm, cy - arm);
          c.lineTo(cx - arm, cy + arm);
          c.stroke();
        } else {
          c.beginPath();
          c.arc(cx, cy, dotR, 0, Math.PI * 2);
          c.fill();
        }
      }
    }
    c.restore();
  }
});

/* ---- 电池 ---- */
shape({
  key: 'battery', cat: 'em', geom: 'box', label: '电池',
  icon: '<path d="M3 10v4M5 10v4M9 9v6M13 10v4M17 9v6M19 10v4"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cy = b.y1 + b.h / 2;
    const x1 = b.x1 + b.w * 0.35;
    const x2 = b.x1 + b.w * 0.65;
    const h1 = b.h * 0.55;
    const h2 = b.h * 0.35;
    c.beginPath();
    c.moveTo(b.x1, cy); c.lineTo(x1, cy);
    c.moveTo(x2, cy); c.lineTo(b.x2, cy);
    c.moveTo(x1, cy - h1 / 2); c.lineTo(x1, cy + h1 / 2);
    c.moveTo(x2, cy - h2 / 2); c.lineTo(x2, cy + h2 / 2);
    c.stroke();
  }
});

/* ---- 电阻（矩形符号） ---- */
shape({
  key: 'resistor', cat: 'em', geom: 'box', label: '电阻',
  icon: '<rect x="6.5" y="9" width="11" height="6" rx="0.6" fill="none"/>' +
        '<path d="M3 12h3.5M17.5 12H21"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cy = b.y1 + b.h / 2;

    /* 矩形宽度取包围盒宽度的 70%，居中放置；
     * 高度取包围盒高度，但限制在合理范围内，避免太扁或太胖。 */
    const rectW = b.w * 0.70;
    const rectH = Math.max(6, Math.min(b.h, rectW * 0.45));
    const rectX = b.x1 + (b.w - rectW) / 2;
    const rectY = cy - rectH / 2;

    /* 左右引线：从包围盒两端连到矩形左右边 */
    c.beginPath();
    c.moveTo(b.x1, cy);
    c.lineTo(rectX, cy);
    c.moveTo(rectX + rectW, cy);
    c.lineTo(b.x2, cy);
    c.stroke();

    /* 矩形本体：如果勾选了填充就填充 */
    c.beginPath();
    c.rect(rectX, rectY, rectW, rectH);
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.22); c.fill(); }
    c.stroke();
  }
});

/* ---- 电容 ---- */
shape({
  key: 'capacitor', cat: 'em', geom: 'box', label: '电容',
  icon: '<path d="M3 12h6M15 12h6M9 8v8M15 8v8"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cy = b.y1 + b.h / 2;
    const x1 = b.x1 + b.w * 0.35;
    const x2 = b.x1 + b.w * 0.65;
    c.beginPath();
    c.moveTo(b.x1, cy); c.lineTo(x1, cy);
    c.moveTo(x2, cy); c.lineTo(b.x2, cy);
    c.moveTo(x1, b.y1 + b.h * 0.15); c.lineTo(x1, b.y2 - b.h * 0.15);
    c.moveTo(x2, b.y1 + b.h * 0.15); c.lineTo(x2, b.y2 - b.h * 0.15);
    c.stroke();
  }
});

/* ---- 灯泡 ---- */
shape({
  key: 'bulb', cat: 'em', geom: 'box', label: '灯泡',
  icon: '<circle cx="12" cy="12" r="7"/><path d="M9 9l6 6M15 9l-6 6"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    const r = Math.min(b.w, b.h) / 2;
    c.beginPath();
    c.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2);
    if (o.fill) { c.fillStyle = U.alpha(o.color, 0.12); c.fill(); }
    c.stroke();
    const d = r * 0.68;
    c.beginPath();
    c.moveTo(cx - d, cy - d); c.lineTo(cx + d, cy + d);
    c.moveTo(cx + d, cy - d); c.lineTo(cx - d, cy + d);
    c.stroke();
  }
});

/* ---- 电池组 ---- */
shape({
  key: 'batteryGroup', cat: 'em', geom: 'box', label: '电池组',
  icon: '<path d="M3 10v4M6 8v8M10 10v4M13 8v8M17 10v4M21 8v8"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cy = (b.y1 + b.y2) / 2;
    const longH  = b.h * 0.75;
    const shortH = b.h * 0.42;
    const xStart = b.x1 + b.w * 0.08;
    const xEnd   = b.x2 - b.w * 0.08;

    c.beginPath();
    c.moveTo(b.x1, cy); c.lineTo(xStart, cy);
    c.moveTo(xEnd, cy); c.lineTo(b.x2, cy);
    c.stroke();

    const n = 4;
    for (let i = 0; i < n; i++) {
      const x = xStart + (xEnd - xStart) * (i + 0.5) / n;
      const h = (i % 2 === 0 ? longH : shortH);
      c.beginPath();
      c.moveTo(x, cy - h / 2);
      c.lineTo(x, cy + h / 2);
      c.stroke();
    }
  }
});

/* ---- 开关 ---- */
param('switchOn', { label: '闭合', min: 0, max: 1, step: 1, def: 1 });

shape({
  key: 'switch', cat: 'em', geom: 'box', label: '开关',
  icon: '<path d="M3 12h3"/><path d="M18 12h3"/>' +
        '<circle cx="7.5" cy="12" r="1.3"/>' +
        '<circle cx="16.5" cy="12" r="1.3"/>' +
        '<path d="M7.5 12l9-3"/>',
  params: ['switchOn'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const cy = (b.y1 + b.y2) / 2;
    const x1 = b.x1 + b.w * 0.28;
    const x2 = b.x1 + b.w * 0.72;

    c.beginPath();
    c.moveTo(b.x1, cy); c.lineTo(x1, cy);
    c.moveTo(x2, cy); c.lineTo(b.x2, cy);
    c.stroke();

    c.beginPath(); c.arc(x1, cy, 2.5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(x2, cy, 2.5, 0, Math.PI * 2); c.stroke();

    const on = (o.switchOn ?? 1) >= 0.5;
    c.beginPath();
    c.moveTo(x1, cy);
    if (on) c.lineTo(x2, cy);
    else    c.lineTo(x2, cy - b.h * 0.45);
    c.stroke();
  }
});

/* ---- 单刀双掷开关 ---- */
param('spdtState', { label: '位置', min: 0, max: 1, step: 1, def: 0 });

shape({
  key: 'spdt', cat: 'em', geom: 'box', label: '单刀双掷',
  icon: '<path d="M3 12h3"/><circle cx="7" cy="12" r="1.2"/>' +
        '<path d="M7 12l9-4"/>' +
        '<circle cx="17" cy="8" r="1.2"/><circle cx="17" cy="16" r="1.2"/>' +
        '<path d="M17 8h4M17 16h4"/>',
  params: ['spdtState'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const cy = (b.y1 + b.y2) / 2;
    const cx = b.x1 + b.w * 0.28;
    const xa = b.x1 + b.w * 0.7;
    const ya = b.y1 + b.h * 0.22;
    const yb = b.y2 - b.h * 0.22;

    c.beginPath();
    c.moveTo(b.x1, cy); c.lineTo(cx, cy);
    c.moveTo(xa, ya); c.lineTo(b.x2, ya);
    c.moveTo(xa, yb); c.lineTo(b.x2, yb);
    c.stroke();

    c.beginPath(); c.arc(cx, cy, 2.5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(xa, ya, 2.5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(xa, yb, 2.5, 0, Math.PI * 2); c.stroke();

    const up = (o.spdtState ?? 0) < 0.5;
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(xa, up ? ya : yb);
    c.stroke();
  }
});

/* ---- 电流表 ---- */
shape({
  key: 'ammeter', cat: 'em', geom: 'box', label: '电流表',
  icon: '<circle cx="12" cy="12" r="8"/><path d="M10 15l2-5 2 5"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    const r = Math.min(b.w, b.h) / 2;
    c.beginPath(); c.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2); c.stroke();
    c.save();
    c.fillStyle = o.color;
    c.font = 'bold ' + (r * 1.05) + 'px sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('A', cx, cy + r * 0.05);
    c.restore();
  }
});

/* ---- 电压表 ---- */
shape({
  key: 'voltmeter', cat: 'em', geom: 'box', label: '电压表',
  icon: '<circle cx="12" cy="12" r="8"/><path d="M9 9l3 6 3-6"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    const r = Math.min(b.w, b.h) / 2;
    c.beginPath(); c.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2); c.stroke();
    c.save();
    c.fillStyle = o.color;
    c.font = 'bold ' + (r * 1.05) + 'px sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('V', cx, cy + r * 0.05);
    c.restore();
  }
});

/* ---- 电动机 ---- */
shape({
  key: 'motor', cat: 'em', geom: 'box', label: '电动机',
  icon: '<circle cx="12" cy="12" r="8"/><path d="M9 16V8l3 4 3-4v8"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    const r = Math.min(b.w, b.h) / 2;
    c.beginPath(); c.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2); c.stroke();
    c.save();
    c.fillStyle = o.color;
    c.font = 'bold ' + (r * 1.0) + 'px sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('M', cx, cy + r * 0.05);
    c.restore();
  }
});

/* ---- 滑动变阻器 ---- */
shape({
  key: 'rheostat', cat: 'em', geom: 'box', label: '滑动变阻器',
  icon: '<rect x="4" y="11" width="16" height="4"/>' +
        '<path d="M12 11V6"/><path d="M9 6h6"/><path d="M3 13h1M20 13h1"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cy = (b.y1 + b.y2) / 2;
    const rectW = b.w * 0.7;
    const rectH = b.h * 0.38;
    const rectX = b.x1 + (b.w - rectW) / 2;
    const rectY = cy - rectH / 2;

    c.beginPath();
    c.moveTo(b.x1, cy); c.lineTo(rectX, cy);
    c.moveTo(rectX + rectW, cy); c.lineTo(b.x2, cy);
    c.stroke();

    c.strokeRect(rectX, rectY, rectW, rectH);

    const sx = rectX + rectW * 0.5;
    const topY = b.y1 + b.h * 0.08;
    c.beginPath();
    c.moveTo(sx, topY); c.lineTo(sx, rectY);
    c.stroke();
    const ah = rectH * 0.55;
    c.beginPath();
    c.moveTo(sx - ah * 0.8, rectY - ah);
    c.lineTo(sx, rectY);
    c.lineTo(sx + ah * 0.8, rectY - ah);
    c.stroke();

    c.beginPath();
    c.moveTo(sx - rectW * 0.12, topY);
    c.lineTo(sx + rectW * 0.12, topY);
    c.stroke();
  }
});


/* ==========================================================================
 * 13. 电场线专题
 * ========================================================================== */

const EFH = {
  fieldAt(x, y, charges) {
    let ex = 0, ey = 0;
    for (const ch of charges) {
      const dx = x - ch.x, dy = y - ch.y;
      const r2 = dx * dx + dy * dy;
      if (r2 < 1e-4) continue;
      const r3 = r2 * Math.sqrt(r2);
      ex += ch.q * dx / r3;
      ey += ch.q * dy / r3;
    }
    return { ex, ey };
  },
  trace(x, y, charges, box, dir) {
    const pts = [{ x, y }];
    const md   = Math.min(box.w, box.h);
    const step = md / 300;
    const pad  = md * 0.03;
    let endCharge = null;
    for (let i = 0; i < 5000; i++) {
      const { ex, ey } = this.fieldAt(x, y, charges);
      const m = Math.hypot(ex, ey);
      if (m < 1e-12) break;
      x += dir * step * ex / m;
      y += dir * step * ey / m;
      pts.push({ x, y });
      let near = false;
      for (const ch of charges) {
        if (Math.hypot(x - ch.x, y - ch.y) < step * 2) {
          near = true;
          endCharge = ch;
          break;
        }
      }
      if (near) break;
      if (x < box.x1 - pad || x > box.x2 + pad ||
          y < box.y1 - pad || y > box.y2 + pad) break;
    }
    return { pts, endCharge };
  }
};

function drawChargeDot(c, x, y, q, r, strokeColor) {
  c.save();
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = q > 0 ? 'rgba(229,57,53,0.92)' : 'rgba(30,136,229,0.92)';
  c.fill();
  c.lineWidth = 1.5;
  c.strokeStyle = strokeColor || '#1a1a1a';
  c.stroke();
  c.fillStyle = '#fff';
  c.font = 'bold ' + (r * 1.4) + 'px sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(q > 0 ? '+' : '\u2212', x, y + r * 0.05);
  c.restore();
}

function drawFieldLineSet(c, box, charges, opts, strokeColor, size) {
  const o = Object.assign({ seedsPerCharge: 14 }, opts || {});
  const md = Math.min(box.w, box.h);
  const r0 = md * 0.055;
  const paths = [];
  const hasPos = charges.some(ch => ch.q > 0);
  const hasNeg = charges.some(ch => ch.q < 0);

  const seedMul = q => Math.max(0.5, Math.min(2.5, Math.abs(q)));

  for (const ch of charges) {
    if (hasPos && ch.q <= 0) continue;
    if (!hasPos && ch.q >= 0) continue;
    const dir = ch.q > 0 ? +1 : -1;
    const seedCount = Math.max(4, Math.round(o.seedsPerCharge * seedMul(ch.q)));
    for (let i = 0; i < seedCount; i++) {
      const ang = (i / seedCount) * Math.PI * 2;
      const sx = ch.x + r0 * Math.cos(ang);
      const sy = ch.y + r0 * Math.sin(ang);
      const res = EFH.trace(sx, sy, charges, box, dir);
      if (res.pts.length > 3) paths.push({ pts: res.pts, dir });
    }
  }

  if (hasPos && hasNeg) {
    for (const ch of charges) {
      if (ch.q >= 0) continue;
      const seedCount = Math.max(4, Math.round(o.seedsPerCharge * seedMul(ch.q)));
      for (let i = 0; i < seedCount; i++) {
        const ang = (i / seedCount) * Math.PI * 2;
        const sx = ch.x + r0 * Math.cos(ang);
        const sy = ch.y + r0 * Math.sin(ang);
        const res = EFH.trace(sx, sy, charges, box, -1);
        if (res.pts.length > 3 && !(res.endCharge && res.endCharge.q > 0)) {
          paths.push({ pts: res.pts.slice().reverse(), dir: +1 });
        }
      }
    }
  }

  c.save();
  c.lineWidth   = Math.max(1, (size || 4) * 0.4);
  c.strokeStyle = strokeColor;
  c.lineCap     = 'round';

  for (const { pts } of paths) {
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    c.stroke();
  }

  const arrowLen = md * 0.022;
  const arrowWid = arrowLen * 0.5;
  c.fillStyle = strokeColor;
  for (const { pts, dir } of paths) {
    const mid = Math.max(2, Math.floor(pts.length * 0.5));
    const a = pts[mid - 1], b = pts[mid];
    let ax = b.x - a.x, ay = b.y - a.y;
    if (dir < 0) { ax = -ax; ay = -ay; }
    const m = Math.hypot(ax, ay);
    if (m < 1e-6) continue;
    ax /= m; ay /= m;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    c.beginPath();
    c.moveTo(mx + ax * arrowLen, my + ay * arrowLen);
    c.lineTo(mx - ax * arrowLen * 0.3 - ay * arrowWid,
             my - ay * arrowLen * 0.3 + ax * arrowWid);
    c.lineTo(mx - ax * arrowLen * 0.3 + ay * arrowWid,
             my - ay * arrowLen * 0.3 - ax * arrowWid);
    c.closePath();
    c.fill();
  }
  c.restore();
}

function chargeDotRadius(md, q, charges) {
  const maxAbsQ = Math.max(...charges.map(ch => Math.abs(ch.q)));
  return md * 0.055 * Math.sqrt(Math.abs(q) / maxAbsQ);
}

shape({
  key: 'efPos', cat: 'em', geom: 'box', label: '正点电荷',
  icon: '<circle cx="12" cy="12" r="2" fill="#e53935"/>' +
        '<path d="M12 12L12 3M12 12L12 21M12 12L3 12M12 12L21 12" stroke-opacity="0.7"/>' +
        '<path d="M12 12L5 5M12 12L19 5M12 12L5 19M12 12L19 19" stroke-opacity="0.5"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    const chR = Math.min(b.w, b.h) * 0.035;
    drawFieldLineSet(c, b, [{ x: cx, y: cy, q: 1 }], { seedsPerCharge: 14 }, o.color, o.size);
    drawChargeDot(c, cx, cy, 1, chR, o.color);
  }
});

shape({
  key: 'efNeg', cat: 'em', geom: 'box', label: '负点电荷',
  icon: '<circle cx="12" cy="12" r="2" stroke="#1e88e5" fill="#1e88e5"/>' +
        '<path d="M12 3L12 7M12 17L12 21M3 12L7 12M17 12L21 12" stroke-opacity="0.7"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = b.x1 + b.w / 2, cy = b.y1 + b.h / 2;
    const chR = Math.min(b.w, b.h) * 0.035;
    drawFieldLineSet(c, b, [{ x: cx, y: cy, q: -1 }], { seedsPerCharge: 14 }, o.color, o.size);
    drawChargeDot(c, cx, cy, -1, chR, o.color);
  }
});

shape({
  key: 'efDipole', cat: 'em', geom: 'box', label: '等量异种电荷',
  icon: '<circle cx="5" cy="12" r="2" fill="#e53935"/>' +
        '<circle cx="19" cy="12" r="2" fill="#1e88e5"/>' +
        '<path d="M7 12L17 12" stroke-opacity="0.7"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const md = Math.min(b.w, b.h);
    const cy = b.y1 + b.h / 2;
    const dx = b.w * 0.18;
    const charges = [
      { x: b.x1 + b.w / 2 - dx, y: cy, q:  1 },
      { x: b.x1 + b.w / 2 + dx, y: cy, q: -1 }
    ];
    drawFieldLineSet(c, b, charges, { seedsPerCharge: 16 }, o.color, o.size);
    for (const ch of charges) drawChargeDot(c, ch.x, ch.y, ch.q, md * 0.038, o.color);
  }
});

shape({
  key: 'efSameSign', cat: 'em', geom: 'box', label: '等量同种电荷',
  icon: '<circle cx="5" cy="12" r="2" fill="#e53935"/>' +
        '<circle cx="19" cy="12" r="2" fill="#e53935"/>' +
        '<path d="M7 10Q12 6 17 10M7 14Q12 18 17 14" stroke-opacity="0.6"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const md = Math.min(b.w, b.h);
    const cy = b.y1 + b.h / 2;
    const dx = b.w * 0.18;
    const charges = [
      { x: b.x1 + b.w / 2 - dx, y: cy, q: 1 },
      { x: b.x1 + b.w / 2 + dx, y: cy, q: 1 }
    ];
    drawFieldLineSet(c, b, charges, { seedsPerCharge: 12 }, o.color, o.size);
    for (const ch of charges) drawChargeDot(c, ch.x, ch.y, ch.q, md * 0.038, o.color);
  }
});

param('chargeRatio', { label: '电荷比', min: 1, max: 3, step: 0.1, def: 2 });

shape({
  key: 'efHeteroUneven', cat: 'em', geom: 'box', label: '非等量异种电荷',
  icon: '<circle cx="5" cy="12" r="3" fill="#e53935"/>' +
        '<circle cx="19" cy="12" r="1.7" fill="#1e88e5"/>' +
        '<path d="M8 12L17 12" stroke-opacity="0.7"/>',
  params: ['chargeRatio'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const md = Math.min(b.w, b.h);
    const cy = b.y1 + b.h / 2;
    const dx = b.w * 0.18;
    const ratio = Math.max(1, Math.min(3, o.chargeRatio ?? 2));
    const charges = [
      { x: b.x1 + b.w / 2 - dx, y: cy, q:  ratio },
      { x: b.x1 + b.w / 2 + dx, y: cy, q: -1 }
    ];
    drawFieldLineSet(c, b, charges, { seedsPerCharge: 14 }, o.color, o.size);
    for (const ch of charges) {
      drawChargeDot(c, ch.x, ch.y, ch.q, chargeDotRadius(md, ch.q, charges), o.color);
    }
  }
});

shape({
  key: 'efHomoUneven', cat: 'em', geom: 'box', label: '非等量同种电荷',
  icon: '<circle cx="5" cy="12" r="3" fill="#e53935"/>' +
        '<circle cx="19" cy="12" r="1.7" fill="#e53935"/>',
  params: ['chargeRatio'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const md = Math.min(b.w, b.h);
    const cy = b.y1 + b.h / 2;
    const dx = b.w * 0.18;
    const ratio = Math.max(1, Math.min(3, o.chargeRatio ?? 2));
    const charges = [
      { x: b.x1 + b.w / 2 - dx, y: cy, q: ratio },
      { x: b.x1 + b.w / 2 + dx, y: cy, q: 1 }
    ];
    drawFieldLineSet(c, b, charges, { seedsPerCharge: 12 }, o.color, o.size);
    for (const ch of charges) {
      drawChargeDot(c, ch.x, ch.y, ch.q, chargeDotRadius(md, ch.q, charges), o.color);
    }
  }
});

param('uniRows', { label: '条数', min: 2, max: 20, step: 1, def: 7 });
param('uniDir',  { label: '方向', min: 0,  max: 1,  step: 1, def: 0 });

shape({
  key: 'efUniform', cat: 'em', geom: 'box', label: '匀强电场',
  icon: '<path d="M3 6h18M3 12h18M3 18h18"/>' +
        '<path d="M19 4l3 2-3 2M19 10l3 2-3 2M19 16l3 2-3 2"/>',
  params: ['uniRows', 'uniDir'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const rows = Math.max(2, Math.round(o.uniRows ?? 7));
    const dir  = (o.uniDir ?? 0) < 0.5 ? 'h' : 'v';
    const ah   = Math.min(b.w, b.h) * 0.025;

    c.save();
    c.lineWidth   = Math.max(1, (o.size || 4) * 0.4);
    c.strokeStyle = o.color;
    c.fillStyle   = o.color;

    if (dir === 'h') {
      const gap = b.h / rows;
      for (let i = 0; i < rows; i++) {
        const y = b.y1 + gap * (i + 0.5);
        c.beginPath(); c.moveTo(b.x1, y); c.lineTo(b.x2, y); c.stroke();
        const ax = b.x1 + b.w * 0.75;
        c.beginPath();
        c.moveTo(ax + ah, y);
        c.lineTo(ax - ah * 0.3, y - ah * 0.6);
        c.lineTo(ax - ah * 0.3, y + ah * 0.6);
        c.closePath(); c.fill();
      }
    } else {
      const gap = b.w / rows;
      for (let i = 0; i < rows; i++) {
        const x = b.x1 + gap * (i + 0.5);
        c.beginPath(); c.moveTo(x, b.y1); c.lineTo(x, b.y2); c.stroke();
        const ay = b.y1 + b.h * 0.75;
        c.beginPath();
        c.moveTo(x, ay + ah);
        c.lineTo(x - ah * 0.6, ay - ah * 0.3);
        c.lineTo(x + ah * 0.6, ay - ah * 0.3);
        c.closePath(); c.fill();
      }
    }
    c.restore();
  }
});




/* ==========================================================================
 * 15. 文字
 * ========================================================================== */
shape({
  key: 'text', cat: 'text', geom: 'text', label: '文字',
  icon: '<path d="M5 6.5v-2h14v2"/><path d="M12 4.5v15"/><path d="M9 19.5h6"/>',

  fonts: {
    system:   'system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif',
    hei:      '"Microsoft YaHei","PingFang SC","Heiti SC","SimHei",sans-serif',
    song:     '"SimSun","Songti SC","STSong",serif',
    kai:      '"KaiTi","STKaiti","Kaiti SC",serif',
    fangsong: '"FangSong","STFangsong",serif',
    mono:     'ui-monospace,Menlo,Consolas,"Courier New",monospace',
    serif:    'Georgia,"Times New Roman",Times,serif',
    hand:     '"Comic Sans MS","Segoe Print","Bradley Hand",cursive'
  },

  params: ['fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'textAlign'],

  textDefaults: {
    fontFamily: 'system',
    fontSize:   24,
    bold:       false,
    italic:     false,
    underline:  false,
    textAlign:  'left'
  },

  draw(c, o) {
    const fonts = this.fonts || {};
    const fam = fonts[o.fontFamily] || fonts.system ||
                'system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
    const fs = Math.max(6, o.fontSize || 24);
    const raw = (o.text == null) ? '' : String(o.text);
    const lines = raw.split('\n');
    const lh = fs * 1.3;
    const align = o.textAlign || 'left';

    c.save();
    c.setLineDash([]);
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.font = (o.italic ? 'italic ' : '') +
             (o.bold ? '700 ' : '400 ') + fs + 'px ' + fam;
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
});


/* ==========================================================================
 * 16. 力学补充（弹簧振子 / 纸带 / 连接体 / 板块模型 / 两物块弹簧）
 * ========================================================================== */

/* ---- 水平弹簧振子 ---- */
shape({
  key: 'springOscillator', cat: 'mech', geom: 'box', label: '弹簧振子',
  icon: '<path d="M3 3v18"/>' +
        '<path d="M3 12h1l1-3 2 6 2-6 2 6 2-6 1 3h1"/>' +
        '<rect x="16" y="7" width="6" height="10"/>',
  params: ['coils'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const { x1, y1, x2, y2, w, h } = b;

    const groundY  = y1 + h * 0.85;
    const blockH   = h * 0.35;
    const blockW   = Math.min(blockH, w * 0.18);
    const blockX   = x2 - blockW - w * 0.02;
    const blockY   = groundY - blockH;
    const springCY = blockY + blockH / 2;

    const wallW    = Math.max(5, w * 0.04);
    const wallTop  = springCY - h * 0.20;
    const wallBot  = groundY;

    c.beginPath();
    c.moveTo(x1, groundY);
    c.lineTo(x2, groundY);
    c.stroke();

    c.save();
    c.lineWidth = Math.max(0.7, (o.size || 4) * 0.45);
    for (let sx = x1 + 4; sx <= x2 - 4; sx += 12) {
      c.beginPath();
      c.moveTo(sx, groundY);
      c.lineTo(sx - 6, groundY + 8);
      c.stroke();
    }
    c.restore();

    c.save();
    c.fillStyle = 'rgba(120,120,120,0.35)';
    c.fillRect(x1, wallTop, wallW, wallBot - wallTop);
    c.strokeRect(x1, wallTop, wallW, wallBot - wallTop);
    c.restore();

    const sx1   = x1 + wallW;
    const sx2   = blockX;
    const coils = Math.max(4, Math.round(o.coils ?? 10));
    const len   = sx2 - sx1;
    const amp   = Math.min(h * 0.07, len * 0.08);
    const endFrac = 0.10;
    const s0 = sx1 + len * endFrac;
    const s1 = sx2 - len * endFrac;
    const segs = coils * 20;

    c.beginPath();
    c.moveTo(sx1, springCY);
    c.lineTo(s0, springCY);
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const x = s0 + (s1 - s0) * t;
      const y = springCY + Math.sin(t * coils * Math.PI * 2) * amp;
      c.lineTo(x, y);
    }
    c.lineTo(sx2, springCY);
    c.stroke();

    c.save();
    c.fillStyle = 'rgba(100,150,200,0.35)';
    c.fillRect(blockX, blockY, blockW, blockH);
    c.strokeRect(blockX, blockY, blockW, blockH);
    c.restore();

    c.save();
    c.fillStyle = o.color || '#1a1a1a';
    const fs = Math.min(blockW, blockH) * 0.55;
    c.font = 'italic bold ' + fs + 'px system-ui,sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('m', blockX + blockW / 2, blockY + blockH / 2);
    c.restore();
  }
});

/* ---- 竖直弹簧振子 ---- */
shape({
  key: 'springOscV', cat: 'mech', geom: 'box', label: '竖直弹簧振子',
  icon: '<path d="M3 3h18"/>' +
        '<path d="M12 3v1l-3 1.5 6 3-6 3 6 3-6 3 3 1.5v1"/>' +
        '<rect x="7" y="17" width="10" height="5"/>',
  params: ['coils'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const { x1, y1, x2, y2, w, h } = b;

    const cx = (x1 + x2) / 2;

    const ceilH    = Math.max(4, h * 0.03);
    const blockW   = Math.min(w * 0.45, h * 0.22);
    const blockH   = blockW * 0.75;
    const blockBot = y2;
    const blockTop = blockBot - blockH;
    const blockL   = cx - blockW / 2;
    const blockR   = cx + blockW / 2;

    const springTop = y1 + ceilH;
    const springBot = blockTop;

    c.save();
    c.fillStyle = 'rgba(120,120,120,0.35)';
    c.fillRect(x1, y1, w, ceilH);
    c.strokeRect(x1, y1, w, ceilH);
    c.restore();

    c.save();
    c.lineWidth = Math.max(0.7, (o.size || 4) * 0.45);
    for (let sx = x1 + 6; sx <= x2 - 6; sx += 14) {
      c.beginPath();
      c.moveTo(sx, y1 + ceilH);
      c.lineTo(sx + 6, y1);
      c.stroke();
    }
    c.restore();

    const len   = springBot - springTop;
    const coils = Math.max(4, Math.round(o.coils ?? 10));
    const amp   = Math.min(w * 0.12, len * 0.07);
    const endFrac = 0.10;
    const s0 = springTop + len * endFrac;
    const s1 = springBot - len * endFrac;
    const segs = coils * 20;

    c.beginPath();
    c.moveTo(cx, springTop);
    c.lineTo(cx, s0);
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const y = s0 + (s1 - s0) * t;
      const x = cx + Math.sin(t * coils * Math.PI * 2) * amp;
      c.lineTo(x, y);
    }
    c.lineTo(cx, springBot);
    c.stroke();

    c.save();
    c.fillStyle = 'rgba(100,150,200,0.35)';
    c.fillRect(blockL, blockTop, blockW, blockH);
    c.strokeRect(blockL, blockTop, blockW, blockH);
    c.restore();

    c.save();
    c.fillStyle = o.color || '#1a1a1a';
    const fs = Math.min(blockW, blockH) * 0.62;
    c.font = 'italic bold ' + fs + 'px system-ui,sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('m', cx, blockTop + blockH / 2);
    c.restore();
  }
});

/* ---- 打点计时器纸带 ---- */
param('tapeDots',  { label: '点数',   min: 3,  max: 20, step: 1,   def: 7   });
param('tapeAccel', { label: '加速度', min: -3, max: 3,  step: 0.1, def: 1.5 });

shape({
  key: 'tickerTape', cat: 'mech', geom: 'box', label: '纸带',
  icon: '<rect x="2" y="9" width="20" height="6" rx="1"/>' +
        '<circle cx="5.5"  cy="12" r="0.8" fill="currentColor"/>' +
        '<circle cx="8.5"  cy="12" r="0.8" fill="currentColor"/>' +
        '<circle cx="12.5" cy="12" r="0.8" fill="currentColor"/>' +
        '<circle cx="18"   cy="12" r="0.8" fill="currentColor"/>',
  params: ['tapeDots', 'tapeAccel'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const { x1, y1, x2, y2, w, h } = b;
    const cy = (y1 + y2) / 2;

    c.save();
    c.fillStyle = '#ffffff';
    c.fillRect(x1, y1, w, h);
    c.strokeRect(x1, y1, w, h);
    c.restore();

    const n = Math.max(4, Math.round(o.tapeDots ?? 7));
    const a = Math.max(-3, Math.min(3, o.tapeAccel ?? 1.5));
    const t = a / 3;
    const dd = t * (0.9 / (n - 1));
    const d0 = 1 - ((n - 2) / 2) * dd;

    const positions = [0];
    let d = d0;
    for (let i = 1; i < n; i++) {
      positions.push(positions[i - 1] + d);
      d += dd;
    }
    const total = positions[n - 1];

    const margin = 0.06;
    const usable = 1 - 2 * margin;
    const dotR = Math.min(h * 0.16, (w / n) * 0.28);

    c.save();
    c.fillStyle = o.dotColor || '#000000';
    for (let i = 0; i < n; i++) {
      const px = x1 + w * (margin + usable * positions[i] / total);
      c.beginPath();
      c.arc(px, cy, Math.max(1, dotR), 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
});

/* ---- 两物块 + 弹簧连接 ---- */
param('twoBlockCoils', { label: '圈数', min: 4, max: 30, step: 1, def: 10 });
param('twoBlockComp',  { label: '压缩', min: -1, max: 1,  step: 0.1, def: 0 });

shape({
  key: 'twoBlocksSpring', cat: 'mech', geom: 'box', label: '两物块弹簧',
  icon: '<rect x="2" y="8" width="5" height="8"/>' +
        '<path d="M7 12h1l1-3 2 6 2-6 2 6 1-3h1"/>' +
        '<rect x="17" y="8" width="5" height="8"/>',
  params: ['twoBlockCoils', 'twoBlockComp'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const { x1, y1, x2, y2, w, h } = b;
    const cy = (y1 + y2) / 2;

    const blockH = h * 0.55;
    const blockW = Math.min(w * 0.20, blockH * 0.9);
    const blockTop = cy - blockH / 2;
    const blockBot = cy + blockH / 2;

    const comp   = Math.max(-1, Math.min(1, o.twoBlockComp ?? 0));
    const gapMax = w - 2 * blockW;
    const gap    = gapMax * (0.65 - 0.35 * comp);
    const midGap = Math.max(blockW * 0.5, gap);

    const totalW = 2 * blockW + midGap;
    const startX = (x1 + x2 - totalW) / 2;

    const leftL  = startX;
    const leftR  = leftL + blockW;
    const rightL = leftR + midGap;
    const rightR = rightL + blockW;

    c.save();
    c.fillStyle = 'rgba(100,150,200,0.35)';
    c.fillRect(leftL, blockTop, blockW, blockH);
    c.strokeRect(leftL, blockTop, blockW, blockH);
    c.restore();

    c.save();
    c.fillStyle = 'rgba(200,120,100,0.35)';
    c.fillRect(rightL, blockTop, blockW, blockH);
    c.strokeRect(rightL, blockTop, blockW, blockH);
    c.restore();

    const sx1 = leftR;
    const sx2 = rightL;
    const coils = Math.max(4, Math.round(o.twoBlockCoils ?? 10));
    const len = sx2 - sx1;
    const amp = Math.min(h * 0.10, len * 0.14);

    if (len > 4) {
      const endFrac = 0.10;
      const s0 = sx1 + len * endFrac;
      const s1 = sx2 - len * endFrac;
      const segs = coils * 20;

      c.beginPath();
      c.moveTo(sx1, cy);
      c.lineTo(s0, cy);
      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const x = s0 + (s1 - s0) * t;
        const y = cy + Math.sin(t * coils * Math.PI * 2) * amp;
        c.lineTo(x, y);
      }
      c.lineTo(sx2, cy);
      c.stroke();
    } else {
      c.beginPath();
      c.moveTo(sx1, cy);
      c.lineTo(sx2, cy);
      c.stroke();
    }

    c.save();
    c.fillStyle = o.color || '#1a1a1a';
    const fs = Math.min(blockW, blockH) * 0.55;
    c.font = 'italic bold ' + fs + 'px system-ui,sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('m\u2081', leftL  + blockW / 2, cy);
    c.fillText('m\u2082', rightL + blockW / 2, cy);
    c.restore();
  }
});

/* ---- 板块模型 ---- */
param('plateShift', { label: '物块位置', min: 0, max: 1, step: 0.05, def: 0.25 });

shape({
  key: 'blockOnBoard', cat: 'mech', geom: 'box', label: '板块模型',
  icon: '<rect x="2"  y="11" width="20" height="4"/>' +
        '<rect x="4"  y="5"  width="7"  height="6"/>' +
        '<path d="M2 15h20"/>',
  params: ['plateShift'],
  draw(c, o, U) {
    const b = U.bbox(o);
    const { x1, y1, x2, y2, w, h } = b;

    const groundY  = y2;
    const boardH   = h * 0.14;
    const boardTop = groundY - boardH;
    const boardBot = groundY;

    const blockH   = h * 0.36;
    const blockW   = w * 0.22;
    const blockBot = boardTop;
    const blockTop = blockBot - blockH;

    const shift   = Math.max(0, Math.min(1, o.plateShift ?? 0.25));
    const padX    = w * 0.04;
    const usable  = w - blockW - padX * 2;
    const blockL  = x1 + padX + usable * shift;
    const blockR  = blockL + blockW;

    c.beginPath();
    c.moveTo(x1, groundY);
    c.lineTo(x2, groundY);
    c.stroke();

    c.save();
    c.lineWidth = Math.max(0.7, (o.size || 4) * 0.45);
    for (let sx = x1 + 4; sx <= x2 - 4; sx += 12) {
      c.beginPath();
      c.moveTo(sx, groundY);
      c.lineTo(sx - 6, groundY + 8);
      c.stroke();
    }
    c.restore();

    c.save();
    c.fillStyle = 'rgba(180,150,110,0.55)';
    c.fillRect(x1, boardTop, w, boardH);
    c.strokeRect(x1, boardTop, w, boardH);
    c.restore();

    c.save();
    c.fillStyle = 'rgba(100,150,200,0.45)';
    c.fillRect(blockL, blockTop, blockW, blockH);
    c.strokeRect(blockL, blockTop, blockW, blockH);
    c.restore();

    c.save();
    c.fillStyle = o.color || '#1a1a1a';
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    const fs1 = Math.min(blockW, blockH) * 0.55;
    c.font = 'italic bold ' + fs1 + 'px system-ui,sans-serif';
    c.fillText('m', blockL + blockW / 2, blockTop + blockH / 2);

    const fs2 = Math.min(boardH * 1.0, w * 0.06);
    c.font = 'italic bold ' + fs2 + 'px system-ui,sans-serif';
    const mRightZone = blockR + (x2 - blockR) / 2;
    const mLeftZone  = x1 + (blockL - x1) / 2;
    const labelX = (mRightZone - blockR > blockW * 0.6) ? mRightZone : mLeftZone;
    c.fillText('M', labelX, boardTop + boardH / 2);
    c.restore();
  }
});

/* ---- 连接体 ---- */
shape({
  key: 'connectorBlocks', cat: 'mech', geom: 'box', label: '连接体',
  icon: '<rect x="2" y="12" width="8" height="6"/>' +
        '<circle cx="14" cy="8" r="2"/>' +
        '<rect x="17" y="10" width="5" height="8"/>' +
        '<path d="M10 15h4M14 10l5 0M16 8h3"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;
    const tableY = b.y1 + h * 0.35;
    c.beginPath();
    c.moveTo(b.x1, tableY); c.lineTo(b.x2 - w * 0.20, tableY);
    c.stroke();
    const blkW = w * 0.22, blkH = h * 0.18;
    c.beginPath();
    c.rect(b.x1 + w * 0.05, tableY - blkH, blkW, blkH);
    c.stroke();

    const ropeY = tableY - blkH / 2;

    const pulR = h * 0.06;
    const pulX = b.x2 - w * 0.08;
    const pulY = ropeY + pulR;
    c.beginPath(); c.arc(pulX, pulY, pulR, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(pulX, pulY, pulR * 0.15, 0, Math.PI * 2);
    c.fillStyle = o.color; c.fill();

    c.beginPath();
    c.moveTo(b.x1 + w * 0.05 + blkW, ropeY);
    c.lineTo(pulX, ropeY);
    c.stroke();

    const hangX = pulX + pulR;
    const hangTop = b.y2 - h * 0.18;
    c.beginPath();
    c.moveTo(hangX, pulY);
    c.lineTo(hangX, hangTop);
    c.stroke();
    c.beginPath();
    c.rect(hangX - w * 0.09, hangTop, w * 0.18, h * 0.18);
    c.stroke();
  }
});


/* ==========================================================================
 * 17. 简笔画
 * ========================================================================== */

shape({
  key: 'skPerson', cat: 'sketch', geom: 'box', label: '人',
  icon: '<circle cx="12" cy="5" r="2.5"/>' +
        '<path d="M12 8v7M8 11l4-3 4 3M12 15l-3 6M12 15l3 6"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = (b.x1 + b.x2) / 2;
    const w = b.w, h = b.h;
    const headR  = Math.min(w * 0.16, h * 0.12);
    const headCY = b.y1 + headR + h * 0.02;

    /* ---- 头 ---- */
    c.beginPath();
    c.arc(cx, headCY, headR, 0, Math.PI * 2);
    c.stroke();

    /* ---- 脖子 ---- */
    c.beginPath();
    c.moveTo(cx, headCY + headR);
    c.lineTo(cx, headCY + headR + h * 0.02);
    c.stroke();

    /* ---- 身体（梯形躯干） ---- */
    const neckY  = headCY + headR + h * 0.02;
    const hipY   = b.y1 + h * 0.58;
    const shoulderW = w * 0.24;
    const hipW      = w * 0.18;
    c.beginPath();
    c.moveTo(cx - shoulderW, neckY);
    c.lineTo(cx + shoulderW, neckY);
    c.lineTo(cx + hipW,      hipY);
    c.lineTo(cx - hipW,      hipY);
    c.closePath();
    c.stroke();

    /* ---- 手臂（带一点自然弧度） ---- */
    const armY = neckY + h * 0.06;
    const armD = h * 0.20;
    c.beginPath();
    c.moveTo(cx - shoulderW, armY);
    c.quadraticCurveTo(cx - shoulderW - w * 0.06, armY + armD * 0.55,
                       cx - shoulderW - w * 0.02, armY + armD);
    c.stroke();
    c.beginPath();
    c.moveTo(cx + shoulderW, armY);
    c.quadraticCurveTo(cx + shoulderW + w * 0.06, armY + armD * 0.55,
                       cx + shoulderW + w * 0.02, armY + armD);
    c.stroke();

    /* ---- 腿（略微外八字） ---- */
    const legSpread = w * 0.05;
    c.beginPath();
    c.moveTo(cx - hipW * 0.55, hipY);
    c.lineTo(cx - legSpread - hipW * 0.3, b.y2 - h * 0.02);
    c.stroke();
    c.beginPath();
    c.moveTo(cx + hipW * 0.55, hipY);
    c.lineTo(cx + legSpread + hipW * 0.3, b.y2 - h * 0.02);
    c.stroke();

    /* ---- 脚（小横线） ---- */
    c.beginPath();
    c.moveTo(cx - legSpread - hipW * 0.55, b.y2 - h * 0.02);
    c.lineTo(cx - legSpread + hipW * 0.05, b.y2 - h * 0.02);
    c.moveTo(cx + legSpread - hipW * 0.05, b.y2 - h * 0.02);
    c.lineTo(cx + legSpread + hipW * 0.55, b.y2 - h * 0.02);
    c.stroke();
  }
});


shape({
  key: 'skDrone', cat: 'sketch', geom: 'box', label: '无人机',
  icon: '<rect x="6" y="11" width="12" height="3" rx="1"/>' +
        '<path d="M8 11V7M16 11V7M3 7h18"/>' +
        '<circle cx="6" cy="7" r="1.5"/><circle cx="18" cy="7" r="1.5"/>' +
        '<path d="M8 14v3M16 14v3"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;
    const cx = (b.x1 + b.x2) / 2;
    const cy = b.y1 + h * 0.55;

    const bodyW = w * 0.46;
    const bodyH = h * 0.16;
    const bodyL = cx - bodyW / 2;
    const bodyR = cx + bodyW / 2;
    const bodyT = cy - bodyH / 2;
    const bodyB = cy + bodyH / 2;

    const armLen = bodyW * 0.85;       // 到旋翼的水平距离
    const armTopY = cy - h * 0.24;     // 旋翼平面高度
    const armOuterL = cx - armLen / 2 - bodyW * 0.15;
    const armOuterR = cx + armLen / 2 + bodyW * 0.15;

    /* ---- 起落架（两个小支架） ---- */
    c.beginPath();
    c.moveTo(cx - bodyW * 0.28, bodyB);
    c.lineTo(cx - bodyW * 0.34, b.y2 - h * 0.02);
    c.lineTo(cx - bodyW * 0.42, b.y2 - h * 0.02);
    c.stroke();
    c.beginPath();
    c.moveTo(cx + bodyW * 0.28, bodyB);
    c.lineTo(cx + bodyW * 0.34, b.y2 - h * 0.02);
    c.lineTo(cx + bodyW * 0.42, b.y2 - h * 0.02);
    c.stroke();

    /* ---- 机臂（从机身斜向上延伸到旋翼） ---- */
    c.beginPath();
    c.moveTo(bodyL + bodyW * 0.15, bodyT);
    c.lineTo(armOuterL, armTopY);
    c.stroke();
    c.beginPath();
    c.moveTo(bodyR - bodyW * 0.15, bodyT);
    c.lineTo(armOuterR, armTopY);
    c.stroke();

    /* ---- 机身（圆角矩形 + 中间云台凸起） ---- */
    const rr = Math.min(bodyW, bodyH) * 0.28;
    c.beginPath();
    if (c.roundRect) c.roundRect(bodyL, bodyT, bodyW, bodyH, rr);
    else c.rect(bodyL, bodyT, bodyW, bodyH);
    c.stroke();

    /* 机身前脸（正视图能看到的小镜头） */
    c.beginPath();
    c.arc(cx + bodyW * 0.22, cy, bodyH * 0.22, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(cx + bodyW * 0.22, cy, bodyH * 0.08, 0, Math.PI * 2);
    c.fillStyle = o.color || '#1a1a1a';
    c.fill();

    /* ---- 左右两组旋翼（正视图：看到一条水平横杆 + 两侧小电机） ---- */
    const rotorBarLen = bodyW * 0.16;
    const rotorR = h * 0.045;

    /* 左旋翼 */
    c.beginPath();
    c.moveTo(armOuterL - rotorBarLen, armTopY);
    c.lineTo(armOuterL + rotorBarLen, armTopY);
    c.stroke();
    c.beginPath();
    c.arc(armOuterL, armTopY, rotorR, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(armOuterL, armTopY, rotorR * 0.25, 0, Math.PI * 2);
    c.fillStyle = o.color || '#1a1a1a';
    c.fill();

    /* 右旋翼 */
    c.beginPath();
    c.moveTo(armOuterR - rotorBarLen, armTopY);
    c.lineTo(armOuterR + rotorBarLen, armTopY);
    c.stroke();
    c.beginPath();
    c.arc(armOuterR, armTopY, rotorR, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(armOuterR, armTopY, rotorR * 0.25, 0, Math.PI * 2);
    c.fillStyle = o.color || '#1a1a1a';
    c.fill();
  }
});


shape({
  key: 'skRobotDog', cat: 'sketch', geom: 'box', label: '机器狗',
  icon: '<rect x="5" y="10" width="12" height="6" rx="1"/>' +
        '<path d="M17 9l3-2v6l-3-1"/>' +
        '<path d="M6 16v4M9 16v4M15 16v4M18 16v4"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;
    const cx = (b.x1 + b.x2) / 2;

    const bodyW = w * 0.58;
    const bodyH = h * 0.30;
    const bodyL = cx - bodyW / 2 - w * 0.06;
    const bodyR = bodyL + bodyW;
    const bodyT = b.y1 + h * 0.38;
    const bodyB = bodyT + bodyH;

    /* ---- 身体（带圆角） ---- */
    const rr = Math.min(bodyW, bodyH) * 0.18;
    c.beginPath();
    if (c.roundRect) c.roundRect(bodyL, bodyT, bodyW, bodyH, rr);
    else c.rect(bodyL, bodyT, bodyW, bodyH);
    c.stroke();

    /* ---- 头部 ---- */
    const headW = w * 0.24;
    const headH = h * 0.24;
    const headL = bodyR - w * 0.01;
    const headT = bodyT - h * 0.08;

    const rr2 = Math.min(headW, headH) * 0.20;
    c.beginPath();
    if (c.roundRect) c.roundRect(headL, headT, headW, headH, rr2);
    else c.rect(headL, headT, headW, headH);
    c.stroke();

    /* 耳朵 / 天线 */
    c.beginPath();
    c.moveTo(headL + headW * 0.30, headT);
    c.lineTo(headL + headW * 0.24, headT - h * 0.10);
    c.stroke();
    c.beginPath();
    c.arc(headL + headW * 0.24, headT - h * 0.10, Math.max(1.5, h * 0.015), 0, Math.PI * 2);
    c.fillStyle = o.color || '#1a1a1a';
    c.fill();

    /* 摄像头（眼睛） */
    c.beginPath();
    c.arc(headL + headW * 0.72, headT + headH * 0.40, headH * 0.12, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(headL + headW * 0.72, headT + headH * 0.40, headH * 0.05, 0, Math.PI * 2);
    c.fillStyle = o.color || '#1a1a1a';
    c.fill();

    /* ---- 四条腿（膝关节可见） ---- */
    const legTopY = bodyB;
    const kneeY   = bodyB + h * 0.18;
    const footY   = b.y2 - h * 0.02;

    const legXs = [
      bodyL + bodyW * 0.18,
      bodyL + bodyW * 0.40,
      bodyL + bodyW * 0.62,
      bodyL + bodyW * 0.86
    ];

    legXs.forEach((x, i) => {
      /* 大腿 */
      c.beginPath();
      c.moveTo(x, legTopY);
      c.lineTo(x + (i < 2 ? -w * 0.02 : w * 0.02), kneeY);
      c.stroke();
      /* 小腿 */
      c.beginPath();
      c.moveTo(x + (i < 2 ? -w * 0.02 : w * 0.02), kneeY);
      c.lineTo(x, footY);
      c.stroke();
      /* 脚掌小横线 */
      c.beginPath();
      c.moveTo(x - w * 0.025, footY);
      c.lineTo(x + w * 0.025, footY);
      c.stroke();
      /* 膝关节小圆点 */
      c.beginPath();
      c.arc(x + (i < 2 ? -w * 0.02 : w * 0.02), kneeY,
            Math.max(1.5, h * 0.015), 0, Math.PI * 2);
      c.stroke();
    });

    /* ---- 尾巴 ---- */
    c.beginPath();
    c.moveTo(bodyL, bodyT + bodyH * 0.4);
    c.quadraticCurveTo(bodyL - w * 0.06, bodyT + bodyH * 0.2,
                       bodyL - w * 0.05, bodyT - h * 0.04);
    c.stroke();
  }
});

shape({
  key: 'skTrain', cat: 'sketch', geom: 'box', label: '火车',
  icon: '<rect x="3" y="9" width="10" height="8"/>' +
        '<rect x="13" y="11" width="8" height="6"/>' +
        '<circle cx="6" cy="19" r="2"/>' +
        '<circle cx="17" cy="19" r="2"/>' +
        '<path d="M5 9V6h4v3"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;

    const bodyBot = b.y1 + h * 0.76;
    const bodyTop = b.y1 + h * 0.34;
    const wheelY  = bodyBot + h * 0.10;
    const wr      = h * 0.09;

    /* 轨道 */
    c.beginPath();
    c.moveTo(b.x1 - w * 0.02, wheelY + wr + h * 0.03);
    c.lineTo(b.x2 + w * 0.02, wheelY + wr + h * 0.03);
    c.stroke();

    /* ---- 车头 ---- */
    const lw = w * 0.55;
    const rr1 = Math.min(lw, bodyBot - bodyTop) * 0.10;
    c.beginPath();
    if (c.roundRect) c.roundRect(b.x1, bodyTop, lw, bodyBot - bodyTop, rr1);
    else c.rect(b.x1, bodyTop, lw, bodyBot - bodyTop);
    c.stroke();

    /* 烟囱 */
    c.beginPath();
    c.rect(b.x1 + w * 0.10, b.y1 + h * 0.16, w * 0.11, h * 0.20);
    c.stroke();
    c.beginPath();
    c.arc(b.x1 + w * 0.155, b.y1 + h * 0.14, w * 0.055, Math.PI, 0);
    c.stroke();
    /* 蒸汽（两个小圆圈） */
    c.beginPath();
    c.arc(b.x1 + w * 0.155, b.y1 + h * 0.06, w * 0.025, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(b.x1 + w * 0.20, b.y1 + h * 0.02, w * 0.020, 0, Math.PI * 2);
    c.stroke();

    /* 车头大灯 */
    c.beginPath();
    c.arc(b.x1 + w * 0.36, bodyTop + h * 0.10, h * 0.05, 0, Math.PI * 2);
    c.stroke();

    /* 驾驶室窗 */
    c.beginPath();
    c.rect(b.x1 + w * 0.42, bodyTop + h * 0.06, w * 0.09, h * 0.14);
    c.stroke();

    /* ---- 车厢 ---- */
    const cw = w * 0.40;
    const ct = bodyTop + h * 0.10;
    const cb = bodyBot;
    const rr2 = Math.min(cw, cb - ct) * 0.10;
    c.beginPath();
    if (c.roundRect) c.roundRect(b.x2 - cw, ct, cw, cb - ct, rr2);
    else c.rect(b.x2 - cw, ct, cw, cb - ct);
    c.stroke();

    /* 车厢窗（三个小方窗） */
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.rect(b.x2 - cw + w * 0.04 + i * (cw - w * 0.08) / 3,
             ct + h * 0.05,
             (cw - w * 0.08) / 3 - w * 0.02,
             h * 0.12);
      c.stroke();
    }

    /* ---- 车轮 ---- */
    [0.14, 0.34, 0.62, 0.82].forEach(f => {
      c.beginPath();
      c.arc(b.x1 + w * f, wheelY, wr, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(b.x1 + w * f, wheelY, wr * 0.30, 0, Math.PI * 2);
      c.fillStyle = o.color || '#1a1a1a';
      c.fill();
    });

    /* ---- 连接钩（车头与车厢之间） ---- */
    c.beginPath();
    c.moveTo(b.x1 + lw, wheelY - h * 0.02);
    c.lineTo(b.x2 - cw, wheelY - h * 0.02);
    c.stroke();
  }
});



shape({
  key: 'skHSR', cat: 'sketch', geom: 'box', label: '高铁',
  icon: '<path d="M3 15V9q0-2 3-3l3-1h9q3 0 3 3v7z"/>' +
        '<circle cx="7" cy="17" r="2"/>' +
        '<circle cx="17" cy="17" r="2"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;
    const bodyBot = b.y1 + h * 0.70;
    const bodyTop = b.y1 + h * 0.28;
    const wheelY  = bodyBot + h * 0.11;
    const wr      = h * 0.075;

    /* 轨道 */
    c.beginPath();
    c.moveTo(b.x1 - w * 0.02, wheelY + wr + h * 0.025);
    c.lineTo(b.x2 + w * 0.02, wheelY + wr + h * 0.025);
    c.stroke();

    /* ---- 车身（流线型：车头圆弧 + 车顶平直） ---- */
    c.beginPath();
    c.moveTo(b.x1, bodyBot);
    c.quadraticCurveTo(b.x1 - w * 0.02, bodyTop + h * 0.05,
                       b.x1 + w * 0.10, bodyTop);
    c.lineTo(b.x2 - w * 0.05, bodyTop);
    c.quadraticCurveTo(b.x2, bodyTop, b.x2, bodyTop + h * 0.06);
    c.lineTo(b.x2, bodyBot);
    c.closePath();
    c.stroke();

    /* ---- 侧窗（一条流线窗带） ---- */
    const winY = bodyTop + h * 0.10;
    const winH = h * 0.13;
    const rrW = Math.min(winH * 0.5, w * 0.01);

    for (let i = 0; i < 5; i++) {
      const wl = b.x1 + w * (0.13 + i * 0.17);
      const ww = w * 0.14;
      if (wl + ww > b.x2 - w * 0.04) break;

      c.beginPath();
      if (c.roundRect) {
        c.roundRect(wl, winY, ww, winH, rrW);
      } else {
        c.rect(wl, winY, ww, winH);
      }
      c.stroke();
    }

    /* 车头大灯 */
    c.beginPath();
    c.arc(b.x1 + w * 0.06, bodyBot - h * 0.08, h * 0.025, 0, Math.PI * 2);
    c.fillStyle = o.color || '#1a1a1a';
    c.fill();

    /* ---- 车轮 ---- */
    [0.20, 0.48, 0.76].forEach(f => {
      c.beginPath();
      c.arc(b.x1 + w * f, wheelY, wr, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(b.x1 + w * f, wheelY, wr * 0.32, 0, Math.PI * 2);
      c.fillStyle = o.color || '#1a1a1a';
      c.fill();
    });
  }
});



shape({
  key: 'skBike', cat: 'sketch', geom: 'box', label: '自行车',
  icon: '<circle cx="5" cy="17" r="3.5"/><circle cx="19" cy="17" r="3.5"/>' +
        '<path d="M5 17h5M5 17l3-8h8l3 8M10 17l6-8M10 17l-2-8"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;

    /* 车轮半径、车轮中心 */
    const r  = Math.min(h * 0.24, w * 0.17);
    const cy = b.y2 - r;
    const rx = b.x1 + r;      // 后轮花鼓
    const fx = b.x2 - r;      // 前轮花鼓

    /* 五通（脚踏中心）*/
    const bx = rx + (fx - rx) * 0.42;
    const by = cy + r * 0.10;

    /* 座管束（坐垫位置）*/
    const sx = bx - r * 0.80;
    const sy = b.y1 + h * 0.38;

    /* 头管顶部（车把下方）*/
    const hx = fx - w * 0.03;
    const hy = b.y1 + h * 0.40;

    /* ---- 车轮（双圈 + 花鼓 + 辐条）---- */
    [rx, fx].forEach(cx => {
      c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(cx, cy, r * 0.78, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(cx, cy, r * 0.10, 0, Math.PI * 2);
      c.fillStyle = o.color || '#1a1a1a'; c.fill(); c.stroke();

      c.save();
      c.lineWidth = Math.max(0.5, (o.size || 4) * 0.28);
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * r * 0.10, cy + Math.sin(a) * r * 0.10);
        c.lineTo(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78);
        c.stroke();
      }
      c.restore();
    });

    /* ---- 车架（菱形）---- */
    c.beginPath();
    c.moveTo(rx, cy); c.lineTo(bx, by);   // 后下叉
    c.moveTo(rx, cy); c.lineTo(sx, sy);   // 后上叉
    c.moveTo(bx, by); c.lineTo(sx, sy);   // 座管
    c.moveTo(bx, by); c.lineTo(hx, hy);   // 下管
    c.moveTo(sx, sy); c.lineTo(hx, hy);   // 上管
    c.moveTo(hx, hy); c.lineTo(fx, cy);   // 前叉
    c.stroke();

    /* ---- 坐垫 ---- */
    c.beginPath();
    c.moveTo(sx - r * 0.55, sy - r * 0.02);
    c.quadraticCurveTo(sx + r * 0.05, sy - r * 0.18,
                       sx + r * 0.32, sy - r * 0.04);
    c.stroke();
    c.beginPath();
    c.moveTo(sx, sy - r * 0.02); c.lineTo(sx, sy + r * 0.06);
    c.stroke();

    /* ---- 车把 ---- */
    c.beginPath();
    c.moveTo(hx, hy); c.lineTo(hx, hy - h * 0.07);
    c.stroke();
    c.beginPath();
    c.moveTo(hx - r * 0.34, hy - h * 0.07);
    c.lineTo(hx + r * 0.28, hy - h * 0.07);
    c.stroke();

    /* ---- 牙盘 + 曲柄 + 脚踏 ---- */
    c.beginPath(); c.arc(bx, by, r * 0.24, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(bx, by, r * 0.06, 0, Math.PI * 2); c.stroke();

    c.beginPath();
    c.moveTo(bx, by); c.lineTo(bx + r * 0.28, by - r * 0.46);
    c.stroke();
    c.beginPath();
    c.moveTo(bx + r * 0.16, by - r * 0.46);
    c.lineTo(bx + r * 0.42, by - r * 0.46);
    c.stroke();

    c.beginPath();
    c.moveTo(bx, by); c.lineTo(bx - r * 0.28, by + r * 0.46);
    c.stroke();
    c.beginPath();
    c.moveTo(bx - r * 0.42, by + r * 0.46);
    c.lineTo(bx - r * 0.16, by + r * 0.46);
    c.stroke();
  }
});

shape({
  key: 'skMoto', cat: 'sketch', geom: 'box', label: '摩托车',
  icon: '<circle cx="5" cy="17" r="3.5"/><circle cx="19" cy="17" r="3.5"/>' +
        '<path d="M5 17l5-6h5l4 6M15 11l-2-4h4M10 12l1 5"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;

    /* 车轮 */
    const rF = Math.min(h * 0.24, w * 0.17);   // 前轮半径
    const rR = rF * 0.92;                       // 后轮稍小
    const cy = b.y2 - rF;
    const fx = b.x2 - rF;
    const rx = b.x1 + rR;

    /* 转向头 */
    const stX = fx - w * 0.06;
    const stY = b.y1 + h * 0.26;

    /* 车把 */
    const hbY = b.y1 + h * 0.10;
    const hbX = stX - w * 0.02;

    /* 油箱 */
    const tkX1 = stX - w * 0.13;    // 油箱后缘
    const tkX2 = stX - w * 0.01;    // 油箱前缘
    const tkTopY = stY - h * 0.02;
    const tkBotY = stY + h * 0.12;

    /* 座椅 */
    const seX1 = b.x1 + w * 0.16;
    const seX2 = tkX1 + w * 0.01;
    const seY  = tkBotY - h * 0.01;

    /* 发动机 */
    const enX = rx + (fx - rx) * 0.50;
    const enY = cy - rF * 0.20;
    const enW = w * 0.16;
    const enH = h * 0.16;

    /* 后摇臂枢轴 */
    const pvX = enX + w * 0.02;
    const pvY = enY + enH * 0.55;

    /* ---- 车轮（双圈 + 轮毂 + 辐条）---- */
    [[rx, rR], [fx, rF]].forEach(([cx, r]) => {
      c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(cx, cy, r * 0.74, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
      c.fillStyle = o.color || '#1a1a1a'; c.fill(); c.stroke();

      c.save();
      c.lineWidth = Math.max(0.6, (o.size || 4) * 0.34);
      for (let i = 0; i < 5; i++) {
        const a = i * 2 * Math.PI / 5 - Math.PI / 2;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * r * 0.18, cy + Math.sin(a) * r * 0.18);
        c.lineTo(cx + Math.cos(a) * r * 0.74, cy + Math.sin(a) * r * 0.74);
        c.stroke();
      }
      c.restore();
    });

    /* ---- 前叉 ---- */
    c.beginPath();
    c.moveTo(stX, stY); c.lineTo(fx, cy);
    c.stroke();

    /* ---- 后摇臂 ---- */
    c.beginPath();
    c.moveTo(pvX, pvY); c.lineTo(rx, cy);
    c.stroke();

    /* ---- 主车架（座椅 → 转向头 → 枢轴）---- */
    c.beginPath();
    c.moveTo(seX2, seY); c.lineTo(stX, stY);
    c.stroke();
    c.beginPath();
    c.moveTo(seX2, seY); c.lineTo(pvX, pvY);
    c.stroke();

    /* ---- 油箱（圆润倒梯形）---- */
    c.beginPath();
    c.moveTo(tkX1, tkBotY);
    c.quadraticCurveTo(tkX1 - w * 0.012, tkTopY,
                       tkX1 + w * 0.02,  tkTopY);
    c.lineTo(tkX2 - w * 0.01, tkTopY);
    c.quadraticCurveTo(tkX2, tkTopY, tkX2, tkBotY);
    c.closePath();
    c.stroke();

    /* ---- 座椅 ---- */
    c.beginPath();
    c.moveTo(seX1, seY);
    c.quadraticCurveTo(seX1 + w * 0.02, seY - h * 0.025,
                       seX2 + w * 0.01, seY);
    c.stroke();
    c.beginPath();
    c.moveTo(seX1, seY);
    c.quadraticCurveTo(seX1 + w * 0.03, seY + h * 0.045,
                       seX2, seY + h * 0.035);
    c.stroke();

    /* ---- 车把 ---- */
    c.beginPath();
    c.moveTo(stX, stY); c.lineTo(hbX, hbY);
    c.stroke();
    c.beginPath();
    c.moveTo(hbX - w * 0.05, hbY);
    c.lineTo(hbX + w * 0.04, hbY);
    c.stroke();
    /* 后视镜小柄 */
    c.beginPath();
    c.moveTo(hbX - w * 0.02, hbY - h * 0.005);
    c.lineTo(hbX - w * 0.03, hbY - h * 0.035);
    c.stroke();

    /* ---- 发动机（圆角矩形）---- */
    const rr2 = Math.min(enW, enH) * 0.18;
    c.beginPath();
    if (c.roundRect) {
      c.roundRect(enX - enW / 2, enY - enH / 2, enW, enH, rr2);
    } else {
      c.rect(enX - enW / 2, enY - enH / 2, enW, enH);
    }
    c.stroke();

    /* ---- 排气管（从前下方绕到后轮上）---- */
    c.beginPath();
    c.moveTo(enX - enW * 0.45, enY + enH * 0.30);
    c.quadraticCurveTo((enX + rx) / 2, cy + rF * 0.55,
                       rx + rR * 0.30,   cy + rR * 0.30);
    c.stroke();
  }
});


shape({
  key: 'skJ20', cat: 'sketch', geom: 'box', label: '歼-20',
  icon: '<path d="M2 13l18-3-5 3 4 4-3-1-3 2-1-3-8 2 3-3z"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;
    const cy = (b.y1 + b.y2) / 2;
    const noseX = b.x2;
    const tailX = b.x1;

    /* ---- 主机身 ---- */
    c.beginPath();
    c.moveTo(noseX, cy);                                        // 机头
    c.lineTo(b.x1 + w * 0.72, cy - h * 0.08);                   // 前段上沿
    c.lineTo(b.x1 + w * 0.62, cy - h * 0.12);                   // 座舱后
    c.lineTo(tailX, cy - h * 0.14);                             // 尾段上沿
    c.lineTo(tailX, cy + h * 0.14);                             // 尾段下沿
    c.lineTo(b.x1 + w * 0.62, cy + h * 0.12);
    c.lineTo(b.x1 + w * 0.72, cy + h * 0.08);
    c.closePath();
    c.stroke();

    /* ---- 座舱盖 ---- */
    c.beginPath();
    c.moveTo(b.x1 + w * 0.74, cy - h * 0.04);
    c.quadraticCurveTo(b.x1 + w * 0.68, cy - h * 0.20,
                       b.x1 + w * 0.58, cy - h * 0.12);
    c.stroke();

    /* ---- 主翼（大三角翼）---- */
    c.beginPath();
    c.moveTo(b.x1 + w * 0.60, cy - h * 0.06);
    c.lineTo(b.x1 + w * 0.18, cy - h * 0.48);
    c.lineTo(b.x1 + w * 0.30, cy - h * 0.06);
    c.closePath();
    c.stroke();

    c.beginPath();
    c.moveTo(b.x1 + w * 0.60, cy + h * 0.06);
    c.lineTo(b.x1 + w * 0.18, cy + h * 0.48);
    c.lineTo(b.x1 + w * 0.30, cy + h * 0.06);
    c.closePath();
    c.stroke();

    /* ---- 鸭翼（小前翼）---- */
    c.beginPath();
    c.moveTo(b.x1 + w * 0.78, cy - h * 0.04);
    c.lineTo(b.x1 + w * 0.66, cy - h * 0.18);
    c.lineTo(b.x1 + w * 0.72, cy - h * 0.04);
    c.closePath();
    c.stroke();

    c.beginPath();
    c.moveTo(b.x1 + w * 0.78, cy + h * 0.04);
    c.lineTo(b.x1 + w * 0.66, cy + h * 0.18);
    c.lineTo(b.x1 + w * 0.72, cy + h * 0.04);
    c.closePath();
    c.stroke();

    /* ---- 外倾双垂尾 ---- */
    c.beginPath();
    c.moveTo(b.x1 + w * 0.16, cy - h * 0.08);
    c.lineTo(b.x1 + w * 0.04, cy - h * 0.38);
    c.lineTo(b.x1 + w * 0.10, cy - h * 0.08);
    c.closePath();
    c.stroke();

    c.beginPath();
    c.moveTo(b.x1 + w * 0.16, cy + h * 0.08);
    c.lineTo(b.x1 + w * 0.04, cy + h * 0.38);
    c.lineTo(b.x1 + w * 0.10, cy + h * 0.08);
    c.closePath();
    c.stroke();

    /* ---- 发动机喷口 ---- */
    c.beginPath();
    c.ellipse(tailX + w * 0.01, cy, h * 0.05, h * 0.10, 0, 0, Math.PI * 2);
    c.stroke();
  }
});



shape({
  key: 'skCarrier', cat: 'sketch', geom: 'box', label: '航空母舰',
  icon: '<path d="M3 15h18v3H3z"/>' +
        '<path d="M6 15v-5h6v5"/>' +
        '<path d="M8 10V7h2v3"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;

    const deckY = b.y1 + h * 0.52;
    const deckH = h * 0.20;

    /* ---- 飞行甲板（前端上翘）---- */
    c.beginPath();
    c.moveTo(b.x1 - w * 0.01, deckY + deckH);
    c.lineTo(b.x1 + w * 0.08, deckY - h * 0.02);
    c.lineTo(b.x2, deckY - h * 0.02);
    c.lineTo(b.x2, deckY + deckH);
    c.closePath();
    c.stroke();

    /* ---- 甲板中线（斜角甲板虚线） ---- */
    c.save();
    c.setLineDash([5, 4]);
    c.lineWidth = Math.max(0.5, (o.size || 4) * 0.35);
    c.beginPath();
    c.moveTo(b.x1 + w * 0.08, deckY + deckH * 0.6);
    c.lineTo(b.x2 - w * 0.04, deckY + deckH * 0.4);
    c.stroke();
    c.restore();

    /* ---- 舰岛 ---- */
    const islX = b.x1 + w * 0.66;
    const islW = w * 0.12;
    const islH = h * 0.28;
    const rr = Math.min(islW, islH) * 0.15;
    c.beginPath();
    if (c.roundRect) c.roundRect(islX, deckY - islH, islW, islH, rr);
    else c.rect(islX, deckY - islH, islW, islH);
    c.stroke();

    /* 桅杆 */
    c.beginPath();
    c.moveTo(islX + islW * 0.5, deckY - islH);
    c.lineTo(islX + islW * 0.5, deckY - islH - h * 0.14);
    c.stroke();
    /* 雷达（横杆） */
    c.beginPath();
    c.moveTo(islX + islW * 0.2, deckY - islH - h * 0.10);
    c.lineTo(islX + islW * 0.8, deckY - islH - h * 0.10);
    c.stroke();

    /* ---- 舰载机（3 架简化三角形） ---- */
    [0.22, 0.40, 0.55].forEach((f, i) => {
      const px = b.x1 + w * f;
      const py = deckY + deckH * 0.5;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px + w * 0.05, py);
      c.lineTo(px + w * 0.025, py - h * 0.05);
      c.closePath();
      c.stroke();
      /* 机翼 */
      c.beginPath();
      c.moveTo(px + w * 0.025, py - h * 0.02);
      c.lineTo(px - w * 0.01,  py - h * 0.02);
      c.moveTo(px + w * 0.025, py - h * 0.02);
      c.lineTo(px + w * 0.06,  py - h * 0.02);
      c.stroke();
    });

    /* ---- 舰体（船身）---- */
    c.beginPath();
    c.moveTo(b.x1, deckY + deckH);
    c.lineTo(b.x2, deckY + deckH);
    c.lineTo(b.x2 - w * 0.06, b.y2);
    c.lineTo(b.x1 + w * 0.08, b.y2);
    c.closePath();
    c.stroke();

    /* 船身吃水线 */
    c.beginPath();
    c.moveTo(b.x1 + w * 0.04, deckY + deckH + (b.y2 - deckY - deckH) * 0.55);
    c.lineTo(b.x2 - w * 0.03, deckY + deckH + (b.y2 - deckY - deckH) * 0.55);
    c.stroke();
  }
});



shape({
  key: 'skPistol', cat: 'sketch', geom: 'box', label: '手枪',
  icon: '<path d="M3 9h14l2 3h2v3h-4l-2-2h-4l-3 6H4l2-6H3z"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;

    const slideY = b.y1 + h * 0.22;
    const slideH = h * 0.20;
    const slideR = b.x1 + w * 0.94;

    /* ---- 套筒 ---- */
    const rr = slideH * 0.12;
    c.beginPath();
    if (c.roundRect) {
      c.roundRect(b.x1, slideY, slideR - b.x1, slideH, rr);
    } else {
      c.rect(b.x1, slideY, slideR - b.x1, slideH);
    }
    c.stroke();

    /* 套筒前端的准星座 */
    c.beginPath();
    c.moveTo(b.x1 + w * 0.04, slideY);
    c.lineTo(b.x1 + w * 0.05, slideY - h * 0.04);
    c.lineTo(b.x1 + w * 0.07, slideY - h * 0.04);
    c.lineTo(b.x1 + w * 0.08, slideY);
    c.stroke();

    /* 抛壳口 */
    c.beginPath();
    c.rect(b.x1 + w * 0.28, slideY + slideH * 0.22,
           w * 0.22, slideH * 0.44);
    c.stroke();

    /* ---- 枪管前端 ---- */
    c.beginPath();
    c.rect(slideR, slideY + slideH * 0.30,
           w * 0.04, slideH * 0.40);
    c.stroke();

    /* ---- 扳机护圈 ---- */
    c.beginPath();
    c.arc(b.x1 + w * 0.32, slideY + slideH + h * 0.075,
          h * 0.085, Math.PI * 0.10, Math.PI * 0.95);
    c.stroke();

    /* 扳机 */
    c.beginPath();
    c.moveTo(b.x1 + w * 0.30, slideY + slideH + h * 0.02);
    c.quadraticCurveTo(b.x1 + w * 0.32, slideY + slideH + h * 0.09,
                       b.x1 + w * 0.29, slideY + slideH + h * 0.13);
    c.stroke();

    /* ---- 握把 ---- */
    c.beginPath();
    c.moveTo(b.x1 + w * 0.10, slideY + slideH);
    c.lineTo(b.x1 + w * 0.30, slideY + slideH);
    c.lineTo(b.x1 + w * 0.22, b.y2);
    c.lineTo(b.x1 + w * 0.02, b.y2);
    c.closePath();
    c.stroke();

    /* 握把纹路（斜线） */
    c.save();
    c.lineWidth = Math.max(0.5, (o.size || 4) * 0.28);
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      const x1 = b.x1 + w * 0.10 + (b.x1 + w * 0.22 - (b.x1 + w * 0.10)) * t;
      const x2 = b.x1 + w * 0.30 + (b.x1 + w * 0.02 - (b.x1 + w * 0.30)) * t;
      const y = slideY + slideH + (b.y2 - slideY - slideH) * t;
      c.beginPath();
      c.moveTo(x1 + w * 0.02, y);
      c.lineTo(x2 + w * 0.03, y);
      c.stroke();
    }
    c.restore();
  }
});



/* ---- 11. 苹果 ---- */
shape({
  key: 'skApple', cat: 'sketch', geom: 'box', label: '苹果',
  icon: '<path d="M12 6c-3-2-7 0-7 5s3 9 5 9 2-1 2-1 0 1 2 1 5-4 5-9-4-7-7-5z"/>' +
        '<path d="M12 6V3M12 3q2-1 4 0"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = (b.x1 + b.x2) / 2;
    const w = b.w, h = b.h;

    /* 果实（两个圆弧构成心形苹果轮廓） */
    const topY = b.y1 + h * 0.22;
    const botY = b.y2 - h * 0.05;
    const halfW = w * 0.40;

    c.beginPath();
    c.moveTo(cx, topY);
    c.bezierCurveTo(cx - halfW * 1.2, topY - h * 0.10,
                    cx - halfW * 1.1, botY,
                    cx, botY);
    c.bezierCurveTo(cx + halfW * 1.1, botY,
                    cx + halfW * 1.2, topY - h * 0.10,
                    cx, topY);
    c.closePath();
    c.stroke();

    /* 果柄 */
    c.beginPath();
    c.moveTo(cx, topY);
    c.lineTo(cx + w * 0.02, b.y1 + h * 0.05);
    c.stroke();

    /* 叶子 */
    const leafX = cx + w * 0.02;
    const leafY = b.y1 + h * 0.07;
    c.beginPath();
    c.moveTo(leafX, leafY);
    c.quadraticCurveTo(leafX + w * 0.14, leafY - h * 0.05,
                       leafX + w * 0.20, leafY + h * 0.02);
    c.quadraticCurveTo(leafX + w * 0.10, leafY + h * 0.06, leafX, leafY);
    c.closePath();
    c.stroke();
  }
});

/* ---- 12. 羽毛球 ---- */
shape({
  key: 'skShuttlecock', cat: 'sketch', geom: 'box', label: '羽毛球',
  icon: '<path d="M9 10l3 11 3-11z"/>' +
        '<path d="M9 10l-2-6h10l-2 6z"/>' +
        '<path d="M10 4l1.5 6M14 4l-1.5 6"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = (b.x1 + b.x2) / 2;
    const w = b.w, h = b.h;

    /* 球头（半圆，位于下方） */
    const headR = w * 0.14;
    const headCY = b.y2 - headR;
    c.beginPath();
    c.arc(cx, headCY, headR, 0, Math.PI * 2);
    c.stroke();

    /* 羽毛裙（梯形，向上张开） */
    const skirtTop = b.y1 + h * 0.05;
    const skirtBot = headCY - headR * 0.9;
    const topHalf   = w * 0.34;
    const botHalf   = w * 0.12;

    c.beginPath();
    c.moveTo(cx - botHalf, skirtBot);
    c.lineTo(cx - topHalf, skirtTop);
    c.lineTo(cx + topHalf, skirtTop);
    c.lineTo(cx + botHalf, skirtBot);
    c.closePath();
    c.stroke();

    /* 羽毛骨架线 */
    c.save();
    c.lineWidth = Math.max(0.5, (o.size || 4) * 0.3);
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      const topX = cx - topHalf + (topHalf * 2) * t;
      const botX = cx - botHalf + (botHalf * 2) * t;
      c.beginPath();
      c.moveTo(botX, skirtBot);
      c.lineTo(topX, skirtTop);
      c.stroke();
    }
    c.restore();
  }
});

/* ---- 13. 篮球 ---- */
shape({
  key: 'skBasketball', cat: 'sketch', geom: 'box', label: '篮球',
  icon: '<circle cx="12" cy="12" r="9"/>' +
        '<path d="M3 12h18M12 3v18"/>' +
        '<path d="M5 5q7 7 14 0M5 19q7-7 14 0"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = (b.x1 + b.x2) / 2;
    const cy = (b.y1 + b.y2) / 2;
    const r = Math.min(b.w, b.h) / 2;

    /* 球体 */
    c.beginPath();
    c.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2);
    c.stroke();

    /* 中间竖线 */
    c.beginPath();
    c.moveTo(cx, cy - r); c.lineTo(cx, cy + r);
    /* 中间横线 */
    c.moveTo(cx - r, cy); c.lineTo(cx + r, cy);
    c.stroke();

    /* 两条弧线（左右侧） */
    c.beginPath();
    c.moveTo(cx, cy - r);
    c.bezierCurveTo(cx - r * 0.9, cy - r * 0.6,
                    cx - r * 0.9, cy + r * 0.6,
                    cx, cy + r);
    c.stroke();
    c.beginPath();
    c.moveTo(cx, cy - r);
    c.bezierCurveTo(cx + r * 0.9, cy - r * 0.6,
                    cx + r * 0.9, cy + r * 0.6,
                    cx, cy + r);
    c.stroke();
  }
});

/* ---- 14. 足球 ---- */
shape({
  key: 'skFootball', cat: 'sketch', geom: 'box', label: '足球',
  icon: '<circle cx="12" cy="12" r="9"/>' +
        '<path d="M12 7l3 2-1 4h-4l-1-4z"/>' +
        '<path d="M12 7V4M6 9L4 7M18 9l2-2M8 14l-3 2M16 14l3 2M12 17v3"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = (b.x1 + b.x2) / 2;
    const cy = (b.y1 + b.y2) / 2;
    const r = Math.min(b.w, b.h) / 2;

    c.beginPath();
    c.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2);
    c.stroke();

    /* 中央五边形 */
    const pentR = r * 0.30;
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
      pts.push({ x: cx + pentR * Math.cos(a), y: cy + pentR * Math.sin(a) });
    }
    c.beginPath();
    pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y));
    c.closePath();
    c.stroke();

    /* 从五边形各顶点向球边发线 */
    c.save();
    c.lineWidth = Math.max(0.5, (o.size || 4) * 0.35);
    pts.forEach(p => {
      const dx = p.x - cx, dy = p.y - cy;
      const m = Math.hypot(dx, dy);
      const ex = cx + dx / m * r;
      const ey = cy + dy / m * r;
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(ex, ey);
      c.stroke();
    });
    c.restore();
  }
});

/* ---- 15. 乒乓球（球拍 + 球） ---- */
shape({
  key: 'skPingpong', cat: 'sketch', geom: 'box', label: '乒乓球',
  icon: '<ellipse cx="10" cy="10" rx="6" ry="7"/>' +
        '<path d="M13 15l4 6"/>' +
        '<circle cx="19" cy="8" r="3"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;

    /* 球拍面（椭圆） */
    const padCX = b.x1 + w * 0.42;
    const padCY = b.y1 + h * 0.42;
    const padRX = w * 0.28;
    const padRY = h * 0.34;
    c.beginPath();
    c.ellipse(padCX, padCY, padRX, padRY, 0, 0, Math.PI * 2);
    c.stroke();

    /* 拍面内框 */
    c.save();
    c.lineWidth = Math.max(0.5, (o.size || 4) * 0.3);
    c.beginPath();
    c.ellipse(padCX, padCY, padRX * 0.85, padRY * 0.85, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();

    /* 拍柄 */
    const handleX1 = padCX + padRX * 0.55;
    const handleY1 = padCY + padRY * 0.85;
    const handleX2 = padCX + padRX * 1.6;
    const handleY2 = padCY + padRY * 1.7;
    c.save();
    c.lineWidth = Math.max(3, (o.size || 4) * 1.4);
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(handleX1, handleY1);
    c.lineTo(handleX2, handleY2);
    c.stroke();
    c.restore();

    /* 乒乓球（右上角小圆） */
    const ballR = Math.min(w, h) * 0.09;
    c.beginPath();
    c.arc(b.x1 + w * 0.82, b.y1 + h * 0.26, ballR, 0, Math.PI * 2);
    c.stroke();
  }
});




shape({
  key: 'rainbow', cat: 'sketch', geom: 'box', label: '彩虹',
  icon: '<path d="M3 18a9 9 0 0 1 18 0"/>' +
        '<path d="M5 18a7 7 0 0 1 14 0" stroke-opacity="0.75"/>' +
        '<path d="M7 18a5 5 0 0 1 10 0" stroke-opacity="0.5"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = (b.x1 + b.x2) / 2;
    const baseY = b.y2 - h_rel(b) * 0.08;
    const Rmax = Math.min(b.w / 2, b.h * 0.92) * 0.92;
    const colors = ['#e53935','#fb8c00','#fdd835','#43a047','#00acc1','#1e88e5','#8e24aa'];
    const arcW = Rmax * 0.075;

    function h_rel(x) { return b.h; }

    c.save();
    c.lineWidth = arcW;
    c.lineCap = 'butt';
    for (let i = 0; i < 7; i++) {
      c.strokeStyle = colors[i];
      const r = Rmax - arcW * (i + 0.5);
      c.beginPath();
      c.arc(cx, baseY, r, Math.PI, Math.PI * 2);
      c.stroke();
    }
    c.restore();

    /* 左侧云朵 */
    const cloudY = baseY;
    const cloudR = Rmax * 0.16;
    const cloudX = cx - Rmax - cloudR * 0.55;
    c.beginPath();
    c.arc(cloudX,          cloudY - cloudR * 0.20, cloudR * 0.65, 0, Math.PI * 2);
    c.arc(cloudX + cloudR * 0.75, cloudY - cloudR * 0.55, cloudR * 0.85, 0, Math.PI * 2);
    c.arc(cloudX + cloudR * 1.60, cloudY - cloudR * 0.20, cloudR * 0.65, 0, Math.PI * 2);
    c.stroke();

    /* 右侧云朵 */
    const cloudX2 = cx + Rmax + cloudR * 0.55;
    c.beginPath();
    c.arc(cloudX2,          cloudY - cloudR * 0.20, cloudR * 0.65, 0, Math.PI * 2);
    c.arc(cloudX2 - cloudR * 0.75, cloudY - cloudR * 0.55, cloudR * 0.85, 0, Math.PI * 2);
    c.arc(cloudX2 - cloudR * 1.60, cloudY - cloudR * 0.20, cloudR * 0.65, 0, Math.PI * 2);
    c.stroke();
  }
});


shape({
  key: 'heart', cat: 'sketch', geom: 'box', label: '心形',
  icon: '<path d="M12 21C5 16 2 12 2 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 10 2.5C22 12 19 16 12 21z"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = (b.x1 + b.x2) / 2;
    const w = b.w, h = b.h;
    const topLobeY = b.y1 + h * 0.22;
    const botY = b.y2 - h * 0.02;
    const halfW = w * 0.46;

    c.beginPath();
    c.moveTo(cx, b.y1 + h * 0.40);
    c.bezierCurveTo(cx - halfW * 0.30, b.y1 + h * 0.06,
                    cx - halfW,        b.y1 + h * 0.20,
                    cx - halfW,        topLobeY + h * 0.20);
    c.bezierCurveTo(cx - halfW,        botY - h * 0.20,
                    cx - halfW * 0.35, botY - h * 0.06,
                    cx,                botY);
    c.bezierCurveTo(cx + halfW * 0.35, botY - h * 0.06,
                    cx + halfW,        botY - h * 0.20,
                    cx + halfW,        topLobeY + h * 0.20);
    c.bezierCurveTo(cx + halfW,        b.y1 + h * 0.20,
                    cx + halfW * 0.30, b.y1 + h * 0.06,
                    cx,                b.y1 + h * 0.40);
    c.closePath();
    c.stroke();

    /* 右上角高光 */
    c.save();
    c.lineWidth = Math.max(0.6, (o.size || 4) * 0.35);
    c.beginPath();
    c.moveTo(cx + halfW * 0.30, b.y1 + h * 0.20);
    c.quadraticCurveTo(cx + halfW * 0.45, b.y1 + h * 0.26,
                       cx + halfW * 0.40, b.y1 + h * 0.38);
    c.stroke();
    c.restore();
  }
});


shape({
  key: 'star5', cat: 'sketch', geom: 'box', label: '五角星',
  icon: '<path d="M12 2l2.9 6.5L22 9.3l-5 4.8 1.3 7L12 17.7 5.7 21l1.3-7-5-4.8 7.1-.8z"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const cx = (b.x1 + b.x2) / 2;
    const cy = (b.y1 + b.y2) / 2;
    const Rx = b.w / 2;
    const Ry = b.h / 2;

    /* 正五角星：外顶点半径 R，内凹点半径 r = R·sin(18°)/sin(54°) ≈ 0.382R */
    const rRatio = 0.382;
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const rr = (i % 2 === 0) ? 1 : rRatio;
      pts.push({ x: cx + Rx * rr * Math.cos(a),
                 y: cy + Ry * rr * Math.sin(a) });
    }
    c.beginPath();
    pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y));
    c.closePath();
    c.stroke();
  }
});



shape({
  key: 'spaceStation', cat: 'sketch', geom: 'box', label: '空间站',
  icon: '<rect x="9" y="4" width="6" height="16" rx="1"/>' +
        '<rect x="2" y="10" width="6" height="4" rx="0.5"/>' +
        '<rect x="16" y="10" width="6" height="4" rx="0.5"/>' +
        '<path d="M8 12h1M15 12h1"/>',
  draw(c, o, U) {
    const b = U.bbox(o);
    const w = b.w, h = b.h;
    const cx = (b.x1 + b.x2) / 2;
    const cy = (b.y1 + b.y2) / 2;

    /* ---- 核心舱 ---- */
    const coreW = w * 0.14;
    const coreH = h * 0.62;
    const rr = Math.min(coreW, coreH) * 0.22;
    c.beginPath();
    if (c.roundRect) c.roundRect(cx - coreW / 2, cy - coreH / 2, coreW, coreH, rr);
    else c.rect(cx - coreW / 2, cy - coreH / 2, coreW, coreH);
    c.stroke();

    /* 核心舱横向分隔 */
    c.save();
    c.lineWidth = Math.max(0.5, (o.size || 4) * 0.3);
    [0.25, 0.50, 0.75].forEach(f => {
      const y = cy - coreH / 2 + coreH * f;
      c.beginPath();
      c.moveTo(cx - coreW / 2, y);
      c.lineTo(cx + coreW / 2, y);
      c.stroke();
    });
    c.restore();

    /* ---- 太阳能板 ---- */
    const panelW = w * 0.32;
    const panelH = h * 0.16;

    [-1, 1].forEach(dir => {
      const px = dir < 0
        ? cx - coreW / 2 - panelW - w * 0.015
        : cx + coreW / 2 + w * 0.015;

      const rrP = Math.min(panelW, panelH) * 0.08;
      c.beginPath();
      if (c.roundRect) c.roundRect(px, cy - panelH / 2, panelW, panelH, rrP);
      else c.rect(px, cy - panelH / 2, panelW, panelH);
      c.stroke();

      /* 格纹 */
      c.save();
      c.lineWidth = Math.max(0.4, (o.size || 4) * 0.25);
      const cols = 5, rows = 2;
      for (let i = 1; i < cols; i++) {
        const gx = px + panelW * i / cols;
        c.beginPath();
        c.moveTo(gx, cy - panelH / 2);
        c.lineTo(gx, cy + panelH / 2);
        c.stroke();
      }
      for (let j = 1; j < rows; j++) {
        const gy = cy - panelH / 2 + panelH * j / rows;
        c.beginPath();
        c.moveTo(px, gy);
        c.lineTo(px + panelW, gy);
        c.stroke();
      }
      c.restore();

      /* 连接杆 */
      c.beginPath();
      const x1 = dir < 0 ? cx - coreW / 2 : cx + coreW / 2;
      const x2 = dir < 0 ? px + panelW : px;
      c.moveTo(x1, cy);
      c.lineTo(x2, cy);
      c.stroke();
    });

    /* ---- 上下对接口 ---- */
    c.beginPath();
    c.arc(cx, cy - coreH / 2 - h * 0.02, coreW * 0.42, Math.PI, 0, false);
    c.stroke();
    c.beginPath();
    c.arc(cx, cy + coreH / 2 + h * 0.02, coreW * 0.42, 0, Math.PI, false);
    c.stroke();
  }
});


/* ==========================================================================
 * 18. 动画图形：圆环-小球 / 半圆槽小球 / 弹簧连接体
 * ========================================================================== */
/* ---- 半圆槽小球（对应 anim_sliding_slot_ball） ---- */
param('ssbTheta0', { label: '初始摆角', min: 1,    max: 90, step: 1,    def: 50,  unit: '°' });
param('ssbK',      { label: '质量比 k', min: 0.05, max: 10, step: 0.05, def: 3 });
param('ssbBallR',  { label: '球半径',   min: 2,    max: 20, step: 0.5,  def: 5 });
param('ssbPeriod', { label: '周期',     min: 0.2,  max: 6,  step: 0.1,  def: 1.5, unit: 's' });
/* ---- 光滑圆环-小球 ---- */
shape({
  key: 'anim_ring_ball',
  cat: 'anim',
  geom: 'rect',
  label: '光滑圆环-小球',
  icon: '<line x1="2" y1="6" x2="22" y2="6"/>' +
        '<circle cx="9" cy="6" r="2"/>' +
        '<line x1="9" y1="6" x2="15" y2="16"/>' +
        '<circle cx="15" cy="16" r="2" fill="currentColor"/>',
  animatable: true,
  params: ['ringTheta0', 'ringK', 'ringLen', 'ringPeriod'],

  draw(c, o, U2) {
    const AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
    const b  = U2.bbox(o);

    const theta0 = ((o.ringTheta0 != null ? o.ringTheta0 : 60) * Math.PI) / 180;
    const k      = Math.max(0.05, o.ringK || 2);
    const Lratio = Math.max(0.2, Math.min(1.0, o.ringLen || 0.7));
    const T0     = Math.max(0.2, o.ringPeriod || 1.5);
    const omega0 = 2 * Math.PI / T0;

    if (!o._ringState ||
        o._ringTheta0Cache !== theta0 ||
        o._ringKCache      !== k) {
      o._ringState = { theta: theta0, omega: 0, lastT: AN.t, trail: [] };
      o._ringTheta0Cache = theta0;
      o._ringKCache      = k;
    }
    const S = o._ringState;

    let dTau = (AN.t - S.lastT) * omega0;
    if (!isFinite(dTau) || dTau < 0 || dTau > 0.5) {
      S.theta = theta0; S.omega = 0; dTau = 0;
      S.trail = [];
    }
    S.lastT = AN.t;

    if (dTau > 1e-7) {
      const nSub = Math.max(1, Math.ceil(dTau / 0.02));
      const h    = dTau / nSub;
      const kp1  = k + 1;
      const accel = (th, om) => {
        const s = Math.sin(th);
        return -s * (Math.cos(th) * om * om + kp1) / (k + s * s);
      };
      for (let i = 0; i < nSub; i++) {
        const th = S.theta, om = S.omega;
        const k1t = om,             k1o = accel(th, om);
        const k2t = om + h * 0.5 * k1o, k2o = accel(th + h * 0.5 * k1t, om + h * 0.5 * k1o);
        const k3t = om + h * 0.5 * k2o, k3o = accel(th + h * 0.5 * k2t, om + h * 0.5 * k2o);
        const k4t = om + h * k3o,       k4o = accel(th + h * k3t, om + h * k3o);
        S.theta += h / 6 * (k1t + 2 * k2t + 2 * k3t + k4t);
        S.omega += h / 6 * (k1o + 2 * k2o + 2 * k3o + k4o);
      }
    }

    const theta = S.theta;
    const sinT  = Math.sin(theta);
    const cosT  = Math.cos(theta);

    const rodY  = b.y1 + 10;
    const cx    = (b.x1 + b.x2) / 2;
    const Lpix  = Math.min(b.h - 20, b.w * 0.6) * Lratio;

    const xRing = cx - Lpix * sinT / (k + 1);
    const xBall = cx + Lpix * sinT * k / (k + 1);
    const yBall = rodY + Lpix * cosT;

    c.beginPath();
    c.moveTo(b.x1, rodY);
    c.lineTo(b.x2, rodY);
    c.stroke();

    c.save();
    c.setLineDash([3, 3]);
    c.lineWidth = Math.max(1, (o.size || 4) * 0.4);
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.3);
    c.beginPath();
    c.moveTo(xRing, rodY);
    c.lineTo(xRing, rodY + Lpix);
    c.stroke();
    c.restore();

    c.save();
    c.lineWidth = Math.max(1.2, (o.size || 4) * 0.55);
    c.beginPath();
    c.moveTo(xRing, rodY);
    c.lineTo(xBall, yBall);
    c.stroke();
    c.restore();

    if (!S.trail) S.trail = [];
    if (AN.playing) {
      const lastP = S.trail.length ? S.trail[S.trail.length - 1] : null;
      if (!lastP || Math.hypot(xBall - lastP.x, yBall - lastP.y) > 2) {
        S.trail.push({ x: xBall, y: yBall });
        if (S.trail.length > 1200) S.trail.shift();
      }
    }
    if (S.trail.length > 1) {
      c.save();
      c.setLineDash([5, 4]);
      c.strokeStyle = 'rgba(229,57,53,0.55)';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(S.trail[0].x, S.trail[0].y);
      for (let i = 1; i < S.trail.length; i++) {
        c.lineTo(S.trail[i].x, S.trail[i].y);
      }
      c.stroke();
      c.restore();
    }

    const ringRad = Math.max(4, Math.min(8, Lpix * 0.06));
    c.save();
    c.lineWidth = Math.max(2, (o.size || 4) * 0.6);
    c.beginPath();
    c.arc(xRing, rodY, ringRad, 0, Math.PI * 2);
    c.fillStyle = '#fff';
    c.fill();
    c.stroke();
    c.restore();

    const ballR = Math.max(5, Math.min(Lpix * 0.08, b.w * 0.06));
    c.beginPath();
    c.arc(xBall, yBall, ballR, 0, Math.PI * 2);
    c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.6);
    c.fill();
    c.stroke();
    c.save();
    c.beginPath();
    c.arc(xBall - ballR * 0.3, yBall - ballR * 0.3, ballR * 0.28, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.fill();
    c.restore();

    if (Math.abs(theta) > 0.05) {
      const arcR = Math.min(Lpix * 0.28, 34);
      c.save();
      c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.4);
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(xRing, rodY, arcR, Math.PI / 2, Math.PI / 2 - theta, theta > 0);
      c.stroke();
      c.restore();
    }

    c.save();
    c.fillStyle = 'rgba(229,57,53,0.8)';
    c.beginPath();
    c.arc(cx, rodY + 4, 3, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
});

/* ---- 半圆凹槽 + 小球 ---- */
shape({
  key: 'anim_sliding_slot_ball',
  cat: 'anim',
  geom: 'box',
  label: '半圆槽小球',
  icon: '<path d="M3 5h3a6 6 0 0 0 12 0h3v14H3z"/><circle cx="12" cy="9" r="2" fill="currentColor"/>',
  animatable: true,
  params: ['ssbTheta0', 'ssbK', 'ssbBallR', 'ssbPeriod'],

  draw(c, o, U2) {
    const AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
    const b  = U2.bbox(o);

    const theta0 = ((o.ssbTheta0 != null ? o.ssbTheta0 : 50) * Math.PI) / 180;
    const k      = Math.max(0.05, o.ssbK || 3);
    const ballR0 = Math.max(2, o.ssbBallR || 5);
    const T0     = Math.max(0.2, o.ssbPeriod || 1.5);
    const omega0 = (2 * Math.PI) / T0;

    if (!window.__ssbStates) window.__ssbStates = new WeakMap();
    let S = window.__ssbStates.get(o);
    if (!S || S.theta0 !== theta0 || S.k !== k) {
      S = { theta: theta0, omega: 0, lastT: AN.t, theta0, k, trail: [] };
      window.__ssbStates.set(o, S);
    }

    let dTau = (AN.t - S.lastT) * omega0;
    if (!isFinite(dTau) || dTau < 0 || dTau > 0.5) {
      S.theta = theta0; S.omega = 0; dTau = 0;
      S.trail = [];
    }
    S.lastT = AN.t;

    if (dTau > 1e-7) {
      const nSub = Math.max(1, Math.ceil(dTau / 0.02));
      const h    = dTau / nSub;
      const accel = (th, om) => {
        const s = Math.sin(th);
        return -s * (Math.cos(th) * om * om + k) / (k + s * s);
      };
      for (let i = 0; i < nSub; i++) {
        const th = S.theta, om = S.omega;
        const k1t = om,             k1o = accel(th, om);
        const k2t = om + h*0.5*k1o, k2o = accel(th + h*0.5*k1t, om + h*0.5*k1o);
        const k3t = om + h*0.5*k2o, k3o = accel(th + h*0.5*k2t, om + h*0.5*k2o);
        const k4t = om + h*k3o,     k4o = accel(th + h*k3t, om + h*k3o);
        S.theta += h/6 * (k1t + 2*k2t + 2*k3t + k4t);
        S.omega += h/6 * (k1o + 2*k2o + 2*k3o + k4o);
      }
    }

    const theta = S.theta;
    const sinT  = Math.sin(theta);
    const cosT  = Math.cos(theta);

    const bw  = b.w, bh = b.h;
    const r   = Math.min(bw / 2, bh * 0.9);
    const rEff = Math.max(r - ballR0, r * 0.3);
    const topY = b.y1;
    const botY = b.y2;
    const cx   = (b.x1 + b.x2) / 2;

    const X0 = cx - rEff * Math.sin(theta0) / (k + 1);

    const X_slot = X0 - rEff * (sinT - Math.sin(theta0)) / (k + 1);
    const X_ball = X_slot + rEff * sinT;
    const Y_ball = topY + rEff * cosT;

    const slotLeft  = X_slot - bw / 2;
    const slotRight = X_slot + bw / 2;

    c.beginPath();
    c.moveTo(slotLeft, topY);
    c.lineTo(X_slot - r, topY);
    c.arc(X_slot, topY, r, Math.PI, 0, true);
    c.lineTo(slotRight, topY);
    c.lineTo(slotRight, botY);
    c.lineTo(slotLeft, botY);
    c.closePath();
    if (o.fill) {
      c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.15);
      c.fill();
    }
    c.stroke();

    c.save();
    c.setLineDash([3, 3]);
    c.lineWidth   = Math.max(1, (o.size || 4) * 0.4);
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.35);

    c.beginPath();
    c.moveTo(X_slot, topY);
    c.lineTo(X_slot, topY + r);
    c.stroke();

    c.beginPath();
    c.moveTo(X_slot, topY);
    c.lineTo(X_ball, Y_ball);
    c.stroke();
    c.restore();

    c.beginPath();
    c.arc(X_ball, Y_ball, ballR0, 0, Math.PI * 2);
    c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.65);
    c.fill();
    c.stroke();

    c.save();
    c.beginPath();
    c.arc(X_ball - ballR0 * 0.3, Y_ball - ballR0 * 0.3, ballR0 * 0.28, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.fill();
    c.restore();

    if (!S.trail) S.trail = [];
    if (AN.playing) {
      const lastP = S.trail.length ? S.trail[S.trail.length - 1] : null;
      if (!lastP || Math.hypot(X_ball - lastP.x, Y_ball - lastP.y) > 2) {
        S.trail.push({ x: X_ball, y: Y_ball });
        if (S.trail.length > 1500) S.trail.shift();
      }
    }
    if (S.trail.length > 1) {
      c.save();
      c.setLineDash([5, 4]);
      c.strokeStyle = 'rgba(229,57,53,0.55)';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(S.trail[0].x, S.trail[0].y);
      for (let i = 1; i < S.trail.length; i++) {
        c.lineTo(S.trail[i].x, S.trail[i].y);
      }
      c.stroke();
      c.restore();
    }

    c.save();
    c.fillStyle = 'rgba(229,57,53,0.8)';
    c.beginPath();
    c.arc(cx, topY + 3, 2.5, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
});

/* ---- 弹簧连接体（实验室参考系） ---- */
param('sprV0',     { label: '初速度v₀', min: 0.1, max: 1.5, step: 0.05, def: 0.4, unit: '×宽/s' });
param('sprPeriod', { label: '周期T',     min: 0.4, max: 2.5, step: 0.1,  def: 1.2, unit: 's' });
param('sprKR',     { label: '质量比B/A', min: 0.3, max: 4,   step: 0.1,  def: 1 });
param('sprGap',    { label: '弹簧原长',  min: 0.10, max: 0.35, step: 0.01, def: 0.18, unit: '×宽' });
param('sprSize',   { label: '物块大小',  min: 10,  max: 40,  step: 1,    def: 22 });

shape({
  key: 'anim_spring_cart',
  cat: 'anim',
  geom: 'box',
  label: '弹簧连接体',
  icon: '<rect x="2" y="9" width="4" height="6" fill="currentColor"/>' +
        '<rect x="18" y="9" width="4" height="6" fill="currentColor"/>' +
        '<path d="M6 12 L8 9 L10.5 15 L13 9 L15.5 15 L18 12" ' +
        'fill="none" stroke="currentColor" stroke-width="1.2"/>',
  animatable: true,
  params: ['sprV0', 'sprPeriod', 'sprKR', 'sprGap', 'sprSize'],

  draw(c, o, U2) {
    const AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
    const b  = U2.bbox(o);

    const v0   = Math.max(0.05, o.sprV0     ?? 0.4);
    const T    = Math.max(0.2,  o.sprPeriod ?? 1.2);
    const k    = Math.max(0.1,  o.sprKR     ?? 1);
    const gapR = Math.max(0.05, Math.min(0.5, o.sprGap ?? 0.18));
    const blkH = Math.max(8, Math.min(b.h * 0.5, o.sprSize ?? 22));

    if (!window.__sprCartStates) window.__sprCartStates = new WeakMap();
    let S = window.__sprCartStates.get(o);
    const sig = v0 + '|' + T + '|' + k + '|' + gapR + '|' + b.w + '|' + blkH;
    if (!S || S.sig !== sig) {
      S = { tLocal: 0, lastT: AN.t, sig };
      window.__sprCartStates.set(o, S);
    }
    let dT = AN.t - S.lastT;
    if (!isFinite(dT) || dT < 0 || dT > 0.5) {
      S.tLocal = 0;
      dT = 0;
    }
    S.tLocal += dT;
    S.lastT = AN.t;

    const MA = 1, MB = k, M = MA + MB;
    const w  = b.w;
    const groundY = b.y2 - 2;
    const blkW = Math.max(10, blkH * 0.75);
    const L0   = gapR * w;
    const D0   = L0 + blkW;
    const v0_px  = v0 * w;
    const vcm_px = v0_px / M;
    const omega  = 2 * Math.PI / T;
    const A_rel  = v0_px / omega;

    const xA0  = b.x1 + 0.15 * w;
    const xcm0 = xA0 + (MB / M) * D0;

    const t = S.tLocal;
    const r_rel = -A_rel * Math.sin(omega * t);
    const xcm   = xcm0 + vcm_px * t;
    const xA    = xcm - (MB / M) * (D0 + r_rel);
    const xB    = xcm + (MA / M) * (D0 + r_rel);

    const lineW = Math.max(1, (o.size || 4) * 0.55);

    c.save();
    c.lineWidth = lineW;
    c.beginPath();
    c.moveTo(b.x1, groundY);
    c.lineTo(b.x2, groundY);
    c.stroke();
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.32);
    c.lineWidth = Math.max(0.8, (o.size || 4) * 0.4);
    for (let x = b.x1 + 8; x < b.x2 - 4; x += 12) {
      c.beginPath();
      c.moveTo(x, groundY + 1);
      c.lineTo(x + 4, groundY + 5);
      c.stroke();
    }
    c.restore();

    const springY = groundY - blkH / 2;
    const spX1 = xA + blkW / 2;
    const spX2 = xB - blkW / 2;
    const spLen = spX2 - spX1;

    c.save();
    c.lineWidth = Math.max(1, (o.size || 4) * 0.55);
    if (spLen < 6) {
      c.beginPath();
      c.moveTo(spX1, springY);
      c.lineTo(spX2, springY);
      c.stroke();
    } else {
      const coils = Math.max(4, Math.min(12, Math.round(spLen / 11)));
      const amp   = Math.min(9, spLen / (coils * 2.5));
      const total = coils * 2;
      c.beginPath();
      c.moveTo(spX1, springY);
      for (let i = 1; i < total; i++) {
        const x = spX1 + spLen * (i / total);
        const dy = (i % 2 === 0 ? -amp : amp);
        c.lineTo(x, springY + dy);
      }
      c.lineTo(spX2, springY);
      c.stroke();
    }
    c.restore();

    const drawBlock = (cx, label) => {
      const bx = cx - blkW / 2;
      const by = groundY - blkH;
      c.save();
      c.beginPath();
      c.rect(bx, by, blkW, blkH);
      c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.20);
      c.fill();
      c.lineWidth = Math.max(1.2, (o.size || 4) * 0.7);
      c.stroke();
      if (blkW >= 12 && blkH >= 12) {
        c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.92);
        c.font = 'bold ' + Math.min(blkW, blkH) * 0.6 + 'px system-ui, sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(label, cx, by + blkH / 2);
      }
      c.restore();
    };
    drawBlock(xA, 'A');
    drawBlock(xB, 'B');

    c.save();
    c.setLineDash([2, 4]);
    c.strokeStyle = 'rgba(229,57,53,0.5)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(xcm, b.y1 + 4);
    c.lineTo(xcm, groundY);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = 'rgba(229,57,53,0.85)';
    c.beginPath();
    c.moveTo(xcm, b.y1 + 10);
    c.lineTo(xcm - 5, b.y1 + 3);
    c.lineTo(xcm + 5, b.y1 + 3);
    c.closePath();
    c.fill();
    c.restore();

    const vA_px = vcm_px + (MB / M) * A_rel * omega * Math.cos(omega * t);
    const vB_px = vcm_px - (MA / M) * A_rel * omega * Math.cos(omega * t);
    const drawArrow = (px, py, v) => {
      const len = v * 0.25;
      if (Math.abs(len) < 6) return;
      const dir = Math.sign(len);
      c.save();
      c.strokeStyle = '#43a047';
      c.fillStyle = '#43a047';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px + len, py);
      c.stroke();
      c.beginPath();
      c.moveTo(px + len, py);
      c.lineTo(px + len - 6 * dir, py - 4);
      c.lineTo(px + len - 6 * dir, py + 4);
      c.closePath();
      c.fill();
      c.restore();
    };
    drawArrow(xA, groundY - blkH - 8, vA_px);
    drawArrow(xB, groundY - blkH - 8, vB_px);
  }
});


/* ==========================================================================
 * 19. 类抛体运动
 * ========================================================================== */
(function () {
  var PB2 = window.PhysBoard;
  if (!PB2 || !PB2.shapes) return;

  var shape2 = function (d) {
    if (!d || !d.key) return;
    if (typeof PB2.register === 'function') PB2.register(d);
    else PB2.shapes[d.key] = d;
  };
  var cat2 = function (id, label) {
    if (!id) return;
    if (typeof PB2.category === 'function') PB2.category(id, label || id);
    else if (!PB2.categories.some(function (c) { return c.id === id; })) {
      PB2.categories.push({ id: id, label: label || id });
    }
  };

  if (!PB2.paramDefs) PB2.paramDefs = {};
  PB2.paramDefs.animPeriod = PB2.paramDefs.animPeriod ||
    { label: "周期",       min: 0.5,  max: 10,  step: 0.1, def: 2.5, unit: "s" };
  PB2.paramDefs.animV0 = PB2.paramDefs.animV0 ||
    { label: "初速度",     min: 1,    max: 100, step: 1,   def: 40 };
  PB2.paramDefs.animTheta0 = PB2.paramDefs.animTheta0 ||
    { label: "速度方向",   min: -180, max: 180, step: 1,   def: 60,  unit: "°" };
  PB2.paramDefs.animAccel = PB2.paramDefs.animAccel ||
    { label: "加速度",     min: 0,    max: 100, step: 1,   def: 20 };
  PB2.paramDefs.animThetaA = PB2.paramDefs.animThetaA ||
    { label: "加速度方向", min: -180, max: 180, step: 1,   def: -90, unit: "°" };

  shape2({
    key: "anim_projectile2",
    cat: "anim",
    geom: "rect",
    label: "类抛体运动",
    icon: '<path d="M3 19 Q 12 4 21 15"/><circle cx="3" cy="19" r="1.6" fill="currentColor"/>',
    animatable: true,
    params: ["animPeriod", "animV0", "animTheta0", "animAccel", "animThetaA"],

    draw: function (c, o, U) {
      var AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
      var b = U.bbox(o);
      var pad = 18;
      var innerW = b.w - pad * 2;
      var innerH = b.h - pad * 2;
      if (innerW < 12 || innerH < 12) return;

      var v0   = (o.animV0     != null ? o.animV0     : 40);
      var th0  = (o.animTheta0 != null ? o.animTheta0 : 60)  * Math.PI / 180;
      var aMag = (o.animAccel  != null ? o.animAccel  : 20);
      var thA  = (o.animThetaA != null ? o.animThetaA : -90) * Math.PI / 180;

      var vx0 = v0 * Math.cos(th0);
      var vy0 = v0 * Math.sin(th0);
      var ax  = aMag * Math.cos(thA);
      var ay  = aMag * Math.sin(thA);

      var startX = b.x1 + pad;
      var startY = b.y2 - pad;

      var N = 140;
      var pts = [];
      var maxPosX = 0, maxPosY = 0;
      for (var i = 0; i <= N; i++) {
        var s = i / N;
        var x = vx0 * s + 0.5 * ax * s * s;
        var y = vy0 * s + 0.5 * ay * s * s;
        pts.push({ x: x, y: y });
        if (x > maxPosX) maxPosX = x;
        if (y > maxPosY) maxPosY = y;
      }

      var scaleX = maxPosX > 1e-6 ? innerW / maxPosX : Infinity;
      var scaleY = maxPosY > 1e-6 ? innerH / maxPosY : Infinity;
      var scale  = Math.min(scaleX, scaleY);
      if (!isFinite(scale) || scale <= 0) scale = 1;

      var toSX = function (px) { return startX + px * scale; };
      var toSY = function (py) { return startY - py * scale; };

      var baseColor = o.color || "#1a1a1a";
      var baseSize  = o.size  || 4;

      c.save();
      c.setLineDash([5, 4]);
      c.globalAlpha = 0.30;
      c.strokeStyle = baseColor;
      c.lineWidth = Math.max(1, baseSize * 0.7);
      c.beginPath();
      for (var k = 0; k <= N; k++) {
        var sx = toSX(pts[k].x), sy = toSY(pts[k].y);
        if (k === 0) c.moveTo(sx, sy); else c.lineTo(sx, sy);
      }
      c.stroke();
      c.restore();

      var T = Math.max(0.2, o.animPeriod || 2.5);
      var prog = ((AN.t || 0) % T) / T;
      if (prog < 0) prog += 1;
      var curIdx = Math.max(0, Math.min(N, Math.round(prog * N)));

      c.save();
      c.strokeStyle = baseColor;
      c.lineWidth = Math.max(1.4, baseSize * 0.8);
      c.beginPath();
      for (var m = 0; m <= curIdx; m++) {
        var mx = toSX(pts[m].x), my = toSY(pts[m].y);
        if (m === 0) c.moveTo(mx, my); else c.lineTo(mx, my);
      }
      c.stroke();
      c.restore();

      var ballR = Math.max(4, Math.min(innerW, innerH) * 0.045);

      c.save();
      c.globalAlpha = 0.40;
      c.fillStyle = baseColor;
      c.beginPath();
      c.arc(startX, startY, ballR * 0.55, 0, Math.PI * 2);
      c.fill();
      c.restore();

      var cur = pts[curIdx];
      var bx = toSX(cur.x), by = toSY(cur.y);
      c.save();
      c.globalAlpha = 0.72;
      c.fillStyle = baseColor;
      c.beginPath();
      c.arc(bx, by, ballR, 0, Math.PI * 2);
      c.fill();
      c.restore();
      c.beginPath();
      c.arc(bx, by, ballR, 0, Math.PI * 2);
      c.strokeStyle = baseColor;
      c.lineWidth = Math.max(1, baseSize * 0.6);
      c.stroke();

      var vxNow = vx0 + ax * prog;
      var vyNow = vy0 + ay * prog;
      var vMag = Math.sqrt(vxNow * vxNow + vyNow * vyNow);
      if (vMag > 1e-6) {
        var vLen = Math.min(innerW, innerH) * 0.22;
        var vex = bx + (vxNow / vMag) * vLen;
        var vey = by - (vyNow / vMag) * vLen;
        c.save();
        c.strokeStyle = "#43a047";
        c.lineWidth = Math.max(1.5, ballR * 0.42);
        c.beginPath();
        c.moveTo(bx, by);
        c.lineTo(vex, vey);
        c.stroke();
        U.arrowHead(c, bx, by, vex, vey, c.lineWidth);
        c.restore();
      }

      if (aMag > 1e-6) {
        var aLen = Math.min(innerW, innerH) * 0.18;
        var aex = bx + (ax / aMag) * aLen;
        var aey = by - (ay / aMag) * aLen;
        c.save();
        c.strokeStyle = "#f57c00";
        c.lineWidth = Math.max(1.4, ballR * 0.38);
        c.beginPath();
        c.moveTo(bx, by);
        c.lineTo(aex, aey);
        c.stroke();
        U.arrowHead(c, bx, by, aex, aey, c.lineWidth);
        c.restore();
      }
    }
  });
})();


/* ==========================================================================
 * 20. 一维碰撞
 * ========================================================================== */
(function () {
  var PB2 = window.PhysBoard;
  if (!PB2 || !PB2.shapes) return;

  if (!PB2.paramDefs) PB2.paramDefs = {};
  if (!PB2.paramDefs.animM1)
    PB2.paramDefs.animM1 = { label:'m₁', min:0.1, max:10, step:0.1, def:1, unit:'kg' };
  if (!PB2.paramDefs.animM2)
    PB2.paramDefs.animM2 = { label:'m₂', min:0.1, max:10, step:0.1, def:1, unit:'kg' };
  if (!PB2.paramDefs.animV1)
    PB2.paramDefs.animV1 = { label:'v₁', min:-10, max:10, step:0.1, def:3, unit:'m/s' };
  if (!PB2.paramDefs.animV2)
    PB2.paramDefs.animV2 = { label:'v₂', min:-10, max:10, step:0.1, def:-2, unit:'m/s' };
  if (!PB2.paramDefs.animRestitution)
    PB2.paramDefs.animRestitution = { label:'恢复系数', min:0, max:1, step:0.05, def:1 };

  if (!PB2.categories.some(function (c) { return c.id === 'anim'; })) {
    PB2.categories.push({ id: 'anim', label: '动画' });
  }

  function withAlpha(color, a) {
    var h = String(color || '#1a1a1a').replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(0,0,0,' + a + ')';
    return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')';
  }

  function drawVelArrow(c, x, y, v, color) {
    if (Math.abs(v) < 0.05) return;
    var len = Math.min(50, Math.abs(v) * 8);
    var dir = v > 0 ? 1 : -1;
    var ex = x + dir * len;
    c.save();
    c.strokeStyle = withAlpha(color, 0.55);
    c.fillStyle = withAlpha(color, 0.55);
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(ex - dir * 6, y);
    c.stroke();
    c.beginPath();
    c.moveTo(ex, y);
    c.lineTo(ex - dir * 6, y - 4);
    c.lineTo(ex - dir * 6, y + 4);
    c.closePath();
    c.fill();
    c.restore();
  }

  var def = {
    key: 'anim_collision1d',
    cat: 'anim',
    geom: 'rect',
    label: '一维碰撞',
    fill: false,
    icon: '<circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="3"/>',
    animatable: true,
    params: ['animM1', 'animM2', 'animV1', 'animV2', 'animRestitution'],

    draw: function (c, o, U) {
      var AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
      var b = U.bbox(o);
      if (b.w < 60 || b.h < 40) return;

      var m1 = (o.animM1 != null ? o.animM1 : 1);
      var m2 = (o.animM2 != null ? o.animM2 : 1);
      var v1 = (o.animV1 != null ? o.animV1 : 3);
      var v2 = (o.animV2 != null ? o.animV2 : -2);
      var e  = (o.animRestitution != null ? o.animRestitution : 1);

      var W = 10;
      var scale = b.w / W;

      var r1 = 0.30 * Math.cbrt(m1);
      var r2 = 0.30 * Math.cbrt(m2);

      var x10 = r1;
      var x20 = W - r2;

      var tC = Infinity;
      if (v1 > v2 + 1e-9) {
        var gap = (x20 - x10) - (r1 + r2);
        if (gap > 1e-9) tC = gap / (v1 - v2);
      }

      var sM = m1 + m2;
      var v1p = ((m1 - e * m2) * v1 + (1 + e) * m2 * v2) / sM;
      var v2p = ((1 + e) * m1 * v1 + (m2 - e * m1) * v2) / sM;

      var T = isFinite(tC) ? (tC * 2 + 0.6) : 5;
      var t = AN.t % T;

      var x1, x2, V1, V2;
      if (t < tC) {
        x1 = x10 + v1 * t;
        x2 = x20 + v2 * t;
        V1 = v1; V2 = v2;
      } else {
        var xc1 = x10 + v1 * tC;
        var xc2 = x20 + v2 * tC;
        x1 = xc1 + v1p * (t - tC);
        x2 = xc2 + v2p * (t - tC);
        V1 = v1p; V2 = v2p;
      }

      var py   = (b.y1 + b.y2) / 2;
      var px1  = b.x1 + x1 * scale;
      var px2  = b.x1 + x2 * scale;
      var rpx1 = r1 * scale;
      var rpx2 = r2 * scale;

      var alpha1 = 0.9 / (1 + 0.2 * m1);
      var alpha2 = 0.9 / (1 + 0.2 * m2);

      var color = o.color || '#1a1a1a';

      c.save();
      c.beginPath();
      var floorY = py + Math.max(rpx1, rpx2) + 4;
      c.moveTo(b.x1, floorY);
      c.lineTo(b.x2, floorY);
      c.strokeStyle = withAlpha(color, 0.25);
      c.setLineDash([5, 4]);
      c.lineWidth = 1.5;
      c.stroke();
      c.restore();

      c.save();
      c.beginPath();
      c.arc(px1, py, rpx1, 0, Math.PI * 2);
      c.fillStyle = withAlpha(color, alpha1);
      c.fill();
      c.strokeStyle = color;
      c.lineWidth = Math.max(1.4, (o.size || 4) * 0.55);
      c.stroke();
      c.restore();

      c.save();
      c.beginPath();
      c.arc(px2, py, rpx2, 0, Math.PI * 2);
      c.fillStyle = withAlpha(color, alpha2);
      c.fill();
      c.strokeStyle = color;
      c.lineWidth = Math.max(1.4, (o.size || 4) * 0.55);
      c.stroke();
      c.restore();

      c.save();
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = color;
      var fs1 = Math.max(10, Math.min(rpx1 * 0.95, 22));
      c.font = '600 ' + fs1 + 'px system-ui,"PingFang SC","Microsoft YaHei",sans-serif';
      c.fillText('m₁', px1, py);
      c.restore();

      c.save();
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = color;
      var fs2 = Math.max(10, Math.min(rpx2 * 0.95, 22));
      c.font = '600 ' + fs2 + 'px system-ui,"PingFang SC","Microsoft YaHei",sans-serif';
      c.fillText('m₂', px2, py);
      c.restore();

      drawVelArrow(c, px1, py - rpx1 - 14, V1, color);
      drawVelArrow(c, px2, py - rpx2 - 14, V2, color);
    }
  };

  if (typeof PB2.register === 'function') PB2.register(def);
  else PB2.shapes[def.key] = def;
})();


/* ==========================================================================
 * 21. 近代物理
 * ========================================================================== */
(function () {
  var PB2 = window.PhysBoard;
  if (!PB2) return;

  var shape2 = function (d) {
    if (!d || !d.key) return;
    if (typeof PB2.register === 'function') PB2.register(d);
    else PB2.shapes[d.key] = d;
  };
  var cat2 = function (id, label) {
    if (typeof PB2.category === 'function') PB2.category(id, label);
    else if (!PB2.categories.some(function (c) { return c.id === id; })) {
      PB2.categories.push({ id: id, label: label });
    }
  };

  cat2('modern', '近代物理');

  function withAlpha(color, a) {
    var h = String(color || '#1a1a1a').replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(0,0,0,' + a + ')';
    return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')';
  }
  var FONT = 'system-ui,"PingFang SC","Microsoft YaHei",sans-serif';

  shape2({
    key: 'atom_structure', cat: 'modern', geom: 'rect', label: '原子结构',
    fill: true,
    icon: '<circle cx="12" cy="12" r="2" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="currentColor"/><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor"/>',
    draw: function (c, o, U) {
      var b = U.bbox(o);
      var cx = (b.x1 + b.x2) / 2, cy = (b.y1 + b.y2) / 2;
      var R = Math.min(b.w, b.h) * 0.42;

      var angles = [0, 60, 120];
      for (var i = 0; i < angles.length; i++) {
        c.save();
        c.translate(cx, cy);
        c.rotate(angles[i] * Math.PI / 180);
        c.beginPath();
        c.ellipse(0, 0, R, R * 0.38, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }

      var eTs = [0.4, 1.9, 3.6];
      for (var i = 0; i < angles.length; i++) {
        var a = angles[i] * Math.PI / 180;
        var t = eTs[i];
        var ex = R * Math.cos(t);
        var ey = R * 0.38 * Math.sin(t);
        var px = cx + ex * Math.cos(a) - ey * Math.sin(a);
        var py = cy + ex * Math.sin(a) + ey * Math.cos(a);
        c.beginPath();
        c.arc(px, py, Math.max(2.5, R * 0.06), 0, Math.PI * 2);
        c.fillStyle = withAlpha(o.color, 0.7);
        c.fill();
        c.stroke();
      }

      c.beginPath();
      c.arc(cx, cy, R * 0.15, 0, Math.PI * 2);
      c.fillStyle = withAlpha(o.color, 0.5);
      c.fill();
      c.stroke();

      c.beginPath();
      c.arc(cx - R * 0.05, cy - R * 0.04, R * 0.05, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(cx + R * 0.05, cy + R * 0.04, R * 0.05, 0, Math.PI * 2);
      c.stroke();
    }
  });

  param('nInit',     { label: '初始能级', min: 1, max: 5, step: 1, def: 3 });
  param('nFinal',    { label: '最终能级', min: 1, max: 5, step: 1, def: 1 });
  param('arrowHue',  { label: '箭头色',   min: 0, max: 6, step: 1, def: 0 });

  shape2({
    key: 'hydrogen_levels', cat: 'modern', geom: 'rect', label: '氢原子能级',
    fill: false,
    icon: '<line x1="3" y1="20" x2="21" y2="20" stroke="currentColor"/>' +
          '<line x1="3" y1="14" x2="21" y2="14" stroke="currentColor"/>' +
          '<line x1="3" y1="9"  x2="21" y2="9"  stroke="currentColor"/>' +
          '<line x1="3" y1="5"  x2="21" y2="5"  stroke="currentColor"/>',
    params: ['nInit', 'nFinal', 'arrowHue'],
    draw: function (c, o, U) {
      var b = U.bbox(o);
      var x1 = b.x1 + 12, x2 = b.x2 - 12;
      var yTop = b.y1 + 14, yBot = b.y2 - 14;
      var h = yBot - yTop;

      var levels = [
        { n: 1, frac: 0,      E: -13.60, text: 'n=1    -13.6 eV' },
        { n: 2, frac: 0.75,   E: -3.40,  text: 'n=2    -3.40 eV'  },
        { n: 3, frac: 0.889,  E: -1.51,  text: 'n=3    -1.51 eV'  },
        { n: 4, frac: 0.9375, E: -0.85,  text: 'n=4    -0.85 eV'  },
        { n: 5, frac: 1.0,    E: 0,      text: 'n=∞    0'         }
      ];

      var fs = Math.max(9, Math.min(12, h * 0.08));
      c.font = fs + 'px ' + FONT;
      c.textBaseline = 'bottom';
      c.textAlign = 'left';

      for (var i = 0; i < levels.length; i++) {
        var L = levels[i];
        L.y = yBot - L.frac * h;
        c.beginPath();
        c.moveTo(x1, L.y);
        c.lineTo(x2, L.y);
        c.stroke();
        c.fillStyle = o.color;
        c.fillText(L.text, x1 + 2, L.y - 2);
      }

      var nI = Math.max(1, Math.min(5, Math.round(o.nInit  ?? 3)));
      var nF = Math.max(1, Math.min(5, Math.round(o.nFinal ?? 1)));
      if (nI === nF) return;

      var from = levels[nI - 1];
      var to   = levels[nF - 1];

      var arrowColor = (typeof HUE7 !== 'undefined')
        ? HUE7[Math.round(o.arrowHue ?? 0) % 7]
        : '#e53935';

      var arrowX = x1 + (x2 - x1) * 0.72;
      var ah = 7;

      c.save();
      c.setLineDash([6, 4]);
      c.lineWidth = Math.max(1, (o.size || 4) * 0.45);
      c.strokeStyle = arrowColor;
      c.beginPath();
      c.moveTo(arrowX, from.y);
      c.lineTo(arrowX, to.y);
      c.stroke();
      c.restore();

      var uy = to.y > from.y ? 1 : -1;
      c.beginPath();
      c.moveTo(arrowX, to.y);
      c.lineTo(arrowX - 4, to.y - uy * ah);
      c.lineTo(arrowX + 4, to.y - uy * ah);
      c.closePath();
      c.fillStyle = arrowColor;
      c.fill();

      var dE = Math.abs(from.E - to.E);
      var absorb = to.E > from.E;
      var label = 'ΔE = ' + dE.toFixed(2) + ' eV  (' + (absorb ? '吸收' : '发射') + ')';

      var midY = (from.y + to.y) / 2;
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.fillStyle = arrowColor;
      c.fillText(label, arrowX + 10, midY);
    }
  });

})();


/* ==========================================================================
 * 22. 圆锥摆
 * ========================================================================== */
(function () {
  var PB2 = window.PhysBoard;
  if (!PB2) return;

  var shape2 = function (d) {
    if (!d || !d.key) return;
    if (typeof PB2.register === 'function') PB2.register(d);
    else PB2.shapes[d.key] = d;
  };
  var cat2 = function (id, label) {
    if (typeof PB2.category === 'function') PB2.category(id, label);
    else if (!PB2.categories.some(function (c) { return c.id === id; })) {
      PB2.categories.push({ id: id, label: label });
    }
  };

  function withAlpha(color, a) {
    var h = String(color || '#1a1a1a').replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(0,0,0,' + a + ')';
    return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')';
  }

  if (!PB2.paramDefs) PB2.paramDefs = {};
  if (!PB2.paramDefs.animGravity)
    PB2.paramDefs.animGravity = { label:'重力加速度', min:1, max:30, step:0.5, def:10, unit:'m/s²' };
  if (!PB2.paramDefs.conicalL)
    PB2.paramDefs.conicalL = { label:'摆长', min:0.2, max:2, step:0.05, def:1, unit:'m' };
  if (!PB2.paramDefs.conicalTheta)
    PB2.paramDefs.conicalTheta = { label:'摆角', min:5, max:80, step:1, def:30, unit:'°' };

  shape2({
    key: 'anim_conical_pendulum',
    cat: 'anim',
    geom: 'rect',
    label: '圆锥摆',
    fill: false,
    icon: '<line x1="12" y1="3" x2="6" y2="18"/><line x1="12" y1="3" x2="18" y2="18"/><ellipse cx="12" cy="18" rx="6" ry="2" fill="none" stroke="currentColor"/><circle cx="18" cy="18" r="1.6" fill="currentColor"/>',
    animatable: true,
    params: ['conicalL', 'conicalTheta', 'animGravity'],

    draw: function (c, o, U) {
      var AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
      var b = U.bbox(o);
      if (b.w < 40 || b.h < 40) return;

      var L  = (o.conicalL != null ? o.conicalL : 1);
      var th = (o.conicalTheta != null ? o.conicalTheta : 30) * Math.PI / 180;
      var g  = (o.animGravity != null ? o.animGravity : 10);

      var sinT = Math.sin(th), cosT = Math.cos(th);
      if (cosT < 0.05) cosT = 0.05;

      var padTop = 12, padBot = 24, padX = 14;
      var maxH = b.h - padTop - padBot;
      var maxR = Math.min(b.w / 2 - padX, b.w * 0.46);

      var LpxByH = maxH / cosT;
      var LpxByR = sinT > 1e-6 ? maxR / sinT : Infinity;
      var Lpx = Math.min(LpxByH, LpxByR);
      if (Lpx < 30) return;

      var pivotX = (b.x1 + b.x2) / 2;
      var pivotY = b.y1 + padTop;

      var radiusPx = Lpx * sinT;
      var heightPx = Lpx * cosT;
      var ballPlaneY = pivotY + heightPx;

      var KY = 0.32;
      var ellipseRY = radiusPx * KY;

      var omega = Math.sqrt(g / (L * cosT));
      var T = 2 * Math.PI / omega;

      var phi = 2 * Math.PI * (AN.t / T);

      c.save();
      c.setLineDash([4, 4]);
      c.strokeStyle = withAlpha(o.color, 0.30);
      c.lineWidth = Math.max(1, (o.size || 4) * 0.35);
      c.beginPath();
      c.moveTo(pivotX, pivotY);
      c.lineTo(pivotX, ballPlaneY);
      c.stroke();
      c.restore();

      c.save();
      c.setLineDash([5, 4]);
      c.strokeStyle = withAlpha(o.color, 0.40);
      c.lineWidth = Math.max(1, (o.size || 4) * 0.35);
      c.beginPath();
      c.ellipse(pivotX, ballPlaneY, radiusPx, ellipseRY, 0, Math.PI, 2 * Math.PI, false);
      c.stroke();
      c.restore();

      var arcR = Math.min(34, Lpx * 0.28);
      c.save();
      c.strokeStyle = withAlpha(o.color, 0.55);
      c.lineWidth = Math.max(1, (o.size || 4) * 0.35);
      c.beginPath();
      c.arc(pivotX, pivotY, arcR, Math.PI / 2, Math.PI / 2 - th, true);
      c.stroke();
      c.restore();

      c.save();
      c.fillStyle = o.color;
      c.font = Math.max(11, Math.min(14, Lpx * 0.08)) +
               'px system-ui,"PingFang SC","Microsoft YaHei",sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      var midAng = Math.PI / 2 - th / 2;
      c.fillText('θ',
        pivotX + Math.cos(midAng) * (arcR + 12),
        pivotY + Math.sin(midAng) * (arcR + 12));
      c.restore();

      c.save();
      c.beginPath();
      c.arc(pivotX, pivotY, Math.max(3, Lpx * 0.025), 0, Math.PI * 2);
      c.fillStyle = o.color;
      c.fill();
      c.restore();

      var bx = pivotX + radiusPx * Math.cos(phi);
      var by = ballPlaneY + ellipseRY * Math.sin(phi);
      var ballR = Math.max(5, Lpx * 0.055);

      var inFront = Math.sin(phi) >= 0;

      var drawStringAndBall = function () {
        c.save();
        c.beginPath();
        c.moveTo(pivotX, pivotY);
        c.lineTo(bx, by);
        c.strokeStyle = o.color;
        c.lineWidth = Math.max(1.2, (o.size || 4) * 0.5);
        c.stroke();
        c.restore();
        c.save();
        c.beginPath();
        c.arc(bx, by, ballR, 0, Math.PI * 2);
        c.fillStyle = withAlpha(o.color, 0.60);
        c.fill();
        c.strokeStyle = o.color;
        c.lineWidth = Math.max(1.4, (o.size || 4) * 0.55);
        c.stroke();
        c.restore();
      };

      if (!inFront) drawStringAndBall();

      c.save();
      c.strokeStyle = withAlpha(o.color, 0.75);
      c.lineWidth = Math.max(1, (o.size || 4) * 0.35);
      c.beginPath();
      c.ellipse(pivotX, ballPlaneY, radiusPx, ellipseRY, 0, 0, Math.PI, false);
      c.stroke();
      c.restore();

      if (inFront) drawStringAndBall();

      c.save();
      c.fillStyle = o.color;
      c.font = Math.max(10, Math.min(12, Lpx * 0.07)) +
               'px ui-monospace,Menlo,Consolas,monospace';
      c.textAlign = 'left';
      c.textBaseline = 'alphabetic';
      c.fillText(
        'ω = ' + omega.toFixed(2) + ' rad/s   T = ' + T.toFixed(2) + ' s',
        b.x1 + 6, b.y2 - 6
      );
      c.restore();
    }
  });
})();


/* ==========================================================================
 * 23. 弹簧振子动画（竖直 / 水平）
 * ========================================================================== */
param('vsPeriod', { label: '周期',     min: 0.3, max: 4,  step: 0.1, def: 1.2, unit: 's' });
param('vsAmp',    { label: '振幅',     min: 5,   max: 100, step: 1,  def: 40 });
param('vsCoils',  { label: '弹簧圈数', min: 3,   max: 20,  step: 1,  def: 8 });
param('vsBlock',  { label: '物块大小', min: 12,  max: 60,  step: 1,  def: 28 });

param('hsPeriod', { label: '周期',     min: 0.3, max: 4,  step: 0.1, def: 1.2, unit: 's' });
param('hsAmp',    { label: '振幅',     min: 5,   max: 100, step: 1,  def: 40 });
param('hsCoils',  { label: '弹簧圈数', min: 3,   max: 20,  step: 1,  def: 8 });
param('hsBlock',  { label: '物块大小', min: 12,  max: 60,  step: 1,  def: 28 });

/* ---- 竖直弹簧振子动画 ---- */
shape({
  key: 'anim_spring_vertical',
  cat: 'anim',
  geom: 'box',
  label: '竖直弹簧振子',
  icon: '<line x1="4" y1="3" x2="20" y2="3"/>' +
        '<path d="M12 3 L9 6 L15 9 L9 12 L15 15 L12 17" ' +
        'fill="none" stroke="currentColor" stroke-width="1.2"/>' +
        '<rect x="7" y="17" width="10" height="5" fill="currentColor"/>',
  animatable: true,
  params: ['vsPeriod', 'vsAmp', 'vsCoils', 'vsBlock'],

  draw(c, o, U2) {
    const AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
    const b  = U2.bbox(o);

    const T      = Math.max(0.2, o.vsPeriod || 1.2);
    const omega  = (2 * Math.PI) / T;
    const blockH = Math.max(8, Math.min(b.h * 0.35, o.vsBlock || 28));
    const blockW = blockH * 1.1;
    const coils  = Math.max(3, Math.min(20, Math.round(o.vsCoils || 8)));

    const cx       = (b.x1 + b.x2) / 2;
    const topY     = b.y1 + 8;
    const beamHalf = Math.min(b.w * 0.35, 60);

    const eqBlockTop = b.y1 + b.h / 2 - blockH / 2;

    const maxAmp = Math.max(5, b.h / 2 - blockH / 2 - 28);
    const amp    = Math.max(3, Math.min(o.vsAmp || 40, maxAmp));

    const yOff   = amp * Math.cos(omega * AN.t);
    const blockY = eqBlockTop + yOff;

    c.beginPath();
    c.moveTo(cx - beamHalf, topY);
    c.lineTo(cx + beamHalf, topY);
    c.stroke();

    c.save();
    c.lineWidth = Math.max(1, (o.size || 4) * 0.4);
    for (let x = cx - beamHalf + 3; x < cx + beamHalf - 2; x += 8) {
      c.beginPath();
      c.moveTo(x, topY);
      c.lineTo(x - 4, topY - 5);
      c.stroke();
    }
    c.restore();

    const springTopY = topY + 1;
    const springBotY = Math.max(springTopY + 4, blockY);
    const springAmp  = Math.min(12, blockW * 0.55);
    const total = coils * 2;
    c.beginPath();
    c.moveTo(cx, springTopY);
    if (springBotY - springTopY < 12) {
      c.lineTo(cx, springBotY);
    } else {
      for (let i = 1; i < total; i++) {
        const yy = springTopY + (springBotY - springTopY) * i / total;
        const xx = cx + (i % 2 === 0 ? -springAmp : springAmp);
        c.lineTo(xx, yy);
      }
      c.lineTo(cx, springBotY);
    }
    c.stroke();

    c.save();
    c.setLineDash([3, 4]);
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.3);
    c.lineWidth = 1;
    const eqY = eqBlockTop + blockH / 2;
    c.beginPath();
    c.moveTo(b.x1 + 6, eqY);
    c.lineTo(b.x2 - 6, eqY);
    c.stroke();
    c.restore();

    c.beginPath();
    c.rect(cx - blockW / 2, blockY, blockW, blockH);
    c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.22);
    c.fill();
    c.stroke();

    const v = -amp * omega * Math.sin(omega * AN.t);
    if (Math.abs(v) > 3) {
      const dir = Math.sign(v);
      const vlen = Math.min(50, Math.abs(v) * 0.15);
      const arrowX = cx + blockW / 2 + 8;
      const startY = blockY + blockH / 2;

      c.save();
      c.strokeStyle = '#43a047';
      c.fillStyle   = '#43a047';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(arrowX, startY);
      c.lineTo(arrowX, startY + vlen * dir);
      c.stroke();
      c.beginPath();
      c.moveTo(arrowX, startY + vlen * dir);
      c.lineTo(arrowX - 4, startY + vlen * dir - 6 * dir);
      c.lineTo(arrowX + 4, startY + vlen * dir - 6 * dir);
      c.closePath();
      c.fill();
      c.restore();
    }
  }
});

/* ---- 水平弹簧振子动画 ---- */
shape({
  key: 'anim_spring_horizontal',
  cat: 'anim',
  geom: 'box',
  label: '水平弹簧振子',
  icon: '<line x1="3" y1="4" x2="3" y2="20"/>' +
        '<path d="M3 12 L6 9 L9 15 L12 9 L15 15 L18 12" ' +
        'fill="none" stroke="currentColor" stroke-width="1.2"/>' +
        '<rect x="18" y="8" width="4" height="8" fill="currentColor"/>',
  animatable: true,
  params: ['hsPeriod', 'hsAmp', 'hsCoils', 'hsBlock'],

  draw(c, o, U2) {
    const AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
    const b  = U2.bbox(o);

    const T      = Math.max(0.2, o.hsPeriod || 1.2);
    const omega  = (2 * Math.PI) / T;
    const blockH = Math.max(8, Math.min(b.h * 0.45, o.hsBlock || 28));
    const blockW = blockH;
    const coils  = Math.max(3, Math.min(20, Math.round(o.hsCoils || 8)));

    const groundY = b.y2 - 4;
    const wallX   = b.x1 + 6;
    const wallTop = b.y1 + 8;
    const cy      = groundY - blockH / 2 - 2;

    const eqCenterX = b.x1 + b.w / 2;

    const maxAmp = Math.max(5, b.w / 2 - blockW / 2 - 28);
    const amp    = Math.max(3, Math.min(o.hsAmp || 40, maxAmp));

    const xOff = amp * Math.cos(omega * AN.t);
    const blockCenterX = eqCenterX + xOff;

    c.beginPath();
    c.moveTo(b.x1, groundY);
    c.lineTo(b.x2, groundY);
    c.stroke();

    c.save();
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.35);
    c.lineWidth = Math.max(0.8, (o.size || 4) * 0.4);
    for (let x = b.x1 + 8; x < b.x2 - 4; x += 12) {
      c.beginPath();
      c.moveTo(x, groundY + 1);
      c.lineTo(x + 4, groundY + 5);
      c.stroke();
    }
    c.restore();

    c.beginPath();
    c.moveTo(wallX, wallTop);
    c.lineTo(wallX, groundY);
    c.stroke();

    c.save();
    c.lineWidth = Math.max(1, (o.size || 4) * 0.5);
    for (let y = wallTop + 3; y < groundY - 2; y += 8) {
      c.beginPath();
      c.moveTo(wallX, y);
      c.lineTo(wallX - 5, y + 4);
      c.stroke();
    }
    c.restore();

    c.save();
    c.setLineDash([3, 4]);
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.3);
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(eqCenterX, b.y1 + 6);
    c.lineTo(eqCenterX, groundY - 2);
    c.stroke();
    c.restore();

    const springLeftX  = wallX + 2;
    const springRightX = blockCenterX - blockW / 2;
    const springAmp    = Math.min(12, blockH * 0.55);
    const springLen    = springRightX - springLeftX;
    const total = coils * 2;

    c.beginPath();
    c.moveTo(springLeftX, cy);
    if (springLen < 12) {
      c.lineTo(Math.max(springLeftX, springRightX), cy);
    } else {
      for (let i = 1; i < total; i++) {
        const xx = springLeftX + springLen * i / total;
        const yy = cy + (i % 2 === 0 ? -springAmp : springAmp);
        c.lineTo(xx, yy);
      }
      c.lineTo(springRightX, cy);
    }
    c.stroke();

    c.beginPath();
    c.rect(blockCenterX - blockW / 2, cy - blockH / 2, blockW, blockH);
    c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.22);
    c.fill();
    c.stroke();

    if (blockW >= 14 && blockH >= 14) {
      c.save();
      c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.9);
      c.font = 'bold ' + Math.min(blockW, blockH) * 0.55 + 'px system-ui, sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('m', blockCenterX, cy);
      c.restore();
    }

    const v = -amp * omega * Math.sin(omega * AN.t);
    if (Math.abs(v) > 3) {
      const dir = Math.sign(v);
      const vlen = Math.min(50, Math.abs(v) * 0.15);
      const arrowY = cy - blockH / 2 - 10;
      const startX = blockCenterX;

      c.save();
      c.strokeStyle = '#43a047';
      c.fillStyle   = '#43a047';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(startX, arrowY);
      c.lineTo(startX + vlen * dir, arrowY);
      c.stroke();
      c.beginPath();
      c.moveTo(startX + vlen * dir, arrowY);
      c.lineTo(startX + vlen * dir - 6 * dir, arrowY - 4);
      c.lineTo(startX + vlen * dir - 6 * dir, arrowY + 4);
      c.closePath();
      c.fill();
      c.restore();
    }
  }
});


/* ==========================================================================
 * 24. 带电粒子在正交电磁场中的运动（旋轮线）
 * ========================================================================== */
param('cyc_v0',  { label: '初速度v₀',    min: 0.1, max: 1.5, step: 0.05, def: 0.5,  unit: '×宽/s' });
param('cyc_ang', { label: '初速方向',    min: -180, max: 180, step: 5,  def: 0,    unit: '°' });
param('cyc_vd',  { label: '漂移速度',    min: 0,   max: 1.5, step: 0.05, def: 0.2,  unit: '×宽/s' });
param('cyc_T',   { label: '回旋周期',    min: 0.5, max: 5,   step: 0.1,  def: 3,    unit: 's' });
param('cyc_B',   { label: '磁场0外1里',  min: 0,   max: 1,   step: 1,    def: 0 });
param('cyc_sV',  { label: '显示速度',    min: 0,   max: 1,   step: 1,    def: 1 });
param('cyc_sFL', { label: '显示F洛伦兹', min: 0,   max: 1,   step: 1,    def: 1 });
param('cyc_sFE', { label: '显示F电场',   min: 0,   max: 1,   step: 1,    def: 0 });

function __cycArrow(c, x1, y1, x2, y2, color) {
  const dx = x2 - x1, dy = y2 - y1;
  const L = Math.hypot(dx, dy);
  if (L < 4) return;
  const ux = dx / L, uy = dy / L;
  const hL = Math.min(11, L * 0.42);
  const hW = hL * 0.55;
  c.save();
  c.strokeStyle = color;
  c.fillStyle   = color;
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2 - ux * hL * 0.6, y2 - uy * hL * 0.6);
  c.stroke();
  c.beginPath();
  c.moveTo(x2, y2);
  c.lineTo(x2 - ux * hL - uy * hW, y2 - uy * hL + ux * hW);
  c.lineTo(x2 - ux * hL + uy * hW, y2 - uy * hL - ux * hW);
  c.closePath();
  c.fill();
  c.restore();
}

shape({
  key: 'anim_cycloid',
  cat: 'anim',
  geom: 'box',
  label: '旋轮线运动',
  icon: '<path d="M2 16 Q 6 4 10 16 Q 14 4 18 16" fill="none" ' +
        'stroke="currentColor" stroke-width="1.4"/>',
  animatable: true,
  params: ['cyc_v0', 'cyc_ang', 'cyc_vd', 'cyc_T', 'cyc_B', 'cyc_sV', 'cyc_sFL', 'cyc_sFE'],

  draw(c, o, U2) {
    const AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
    const b  = U2.bbox(o);

    const W        = b.w;
    const v0_unit  = Math.max(0.02, o.cyc_v0  ?? 0.5);
    const ang0     = ((o.cyc_ang ?? 0) * Math.PI) / 180;
    const vd_unit  = Math.max(0,    o.cyc_vd  ?? 0.2);
    const T        = Math.max(0.3,  o.cyc_T   ?? 3);
    const Bdir     = Math.round(o.cyc_B || 0);
    const Bsign    = Bdir === 0 ? 1 : -1;
    const showV    = (o.cyc_sV  ?? 1) > 0.5;
    const showFL   = (o.cyc_sFL ?? 1) > 0.5;
    const showFE   = (o.cyc_sFE ?? 0) > 0.5;

    const v0     = v0_unit * W;
    const vd_mag = vd_unit * W;
    const omega  = Bsign * 2 * Math.PI / T;
    const vd_eff = vd_mag * Bsign;

    const ux0 = v0 * Math.cos(ang0) - vd_eff;
    const uy0 = v0 * Math.sin(ang0);

    let xFrac = 0.5;
    if (vd_eff >  0.02 * W) xFrac = 0.22;
    else if (vd_eff < -0.02 * W) xFrac = 0.78;
    const originX = b.x1 + b.w * xFrac;
    const originY = b.y1 + b.h * 0.5;

    const toCanvas = (xp, yp) => ({ x: originX + xp, y: originY - yp });

    const posAt = (tt) => {
      if (Math.abs(omega) < 1e-4) {
        return { x: (vd_eff + ux0) * tt, y: uy0 * tt };
      }
      const w = omega * tt;
      const s = Math.sin(w), co = Math.cos(w);
      return {
        x: vd_eff * tt + (1 / omega) * (ux0 * s - uy0 * (co - 1)),
        y:              (1 / omega) * (ux0 * (co - 1) + uy0 * s)
      };
    };
    const velAt = (tt) => {
      const w = omega * tt;
      const s = Math.sin(w), co = Math.cos(w);
      return {
        x: vd_eff + ux0 * co + uy0 * s,
        y:         -ux0 * s  + uy0 * co
      };
    };

    c.save();
    c.beginPath();
    c.rect(b.x1, b.y1, b.w, b.h);
    c.clip();

    c.save();
    c.setLineDash([3, 5]);
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.22);
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(b.x1, originY);
    c.lineTo(b.x2, originY);
    c.stroke();
    c.restore();

    const tNow = AN.t;
    const tWin = Math.min(tNow, T * 2);

    if (tWin > 0.01) {
      const t0 = tNow - tWin;
      const N  = Math.max(30, Math.min(200, Math.round(tWin / T * 100)));
      c.save();
      c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.55);
      c.lineWidth = Math.max(1.2, (o.size || 4) * 0.5);
      c.beginPath();
      for (let i = 0; i <= N; i++) {
        const tt = t0 + tWin * i / N;
        const pp = posAt(tt);
        const cv = toCanvas(pp.x, pp.y);
        i === 0 ? c.moveTo(cv.x, cv.y) : c.lineTo(cv.x, cv.y);
      }
      c.stroke();
      c.restore();
    }

    c.save();
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.35);
    c.lineWidth = 1;
    c.beginPath();
    c.arc(originX, originY, 3, 0, Math.PI * 2);
    c.stroke();
    c.restore();

    const posP = posAt(tNow);
    const velP = velAt(tNow);
    const posC = toCanvas(posP.x, posP.y);
    const vMag = Math.hypot(velP.x, velP.y);

    const arrowScale = 55 / Math.max(v0, 1e-3);
    const arrowCap   = 90;

    if (showFE && Math.abs(vd_eff) > 0.5) {
      const base = Math.min(arrowCap, Math.abs(vd_eff) * arrowScale);
      if (base > 4) {
        __cycArrow(c, posC.x, posC.y, posC.x, posC.y - base, '#1e88e5');
      }
    }

    if (showFL && vMag > 0.5) {
      const fx =  omega * velP.y;
      const fy = -omega * velP.x;
      const fm = Math.hypot(fx, fy);
      if (fm > 1e-6) {
        const base = Math.min(arrowCap, vMag * arrowScale);
        const ux = fx / fm, uy = fy / fm;
        __cycArrow(c, posC.x, posC.y,
                   posC.x + ux * base, posC.y - uy * base, '#e53935');
      }
    }

    if (showV && vMag > 0.5) {
      const vLen = Math.min(arrowCap, vMag * arrowScale);
      const ux = velP.x / vMag, uy = velP.y / vMag;
      __cycArrow(c, posC.x, posC.y,
                 posC.x + ux * vLen, posC.y - uy * vLen, '#43a047');
    }

    const pR = Math.max(5, Math.min(9, W * 0.014));
    c.save();
    c.beginPath();
    c.arc(posC.x, posC.y, pR, 0, Math.PI * 2);
    c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.75);
    c.fill();
    c.lineWidth = Math.max(1.2, (o.size || 4) * 0.6);
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.95);
    c.stroke();
    c.beginPath();
    c.arc(posC.x - pR * 0.3, posC.y - pR * 0.3, pR * 0.3, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,255,255,0.75)';
    c.fill();
    c.restore();

    const indX = b.x2 - 22;
    const indY = b.y1 + 22;
    const indR = 10;
    c.save();
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.6);
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(indX, indY, indR, 0, Math.PI * 2);
    c.stroke();
    if (Bsign > 0) {
      c.beginPath();
      c.arc(indX, indY, 3, 0, Math.PI * 2);
      c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.75);
      c.fill();
    } else {
      const d = indR * 0.7;
      c.beginPath();
      c.moveTo(indX - d, indY - d); c.lineTo(indX + d, indY + d);
      c.moveTo(indX + d, indY - d); c.lineTo(indX - d, indY + d);
      c.stroke();
    }
    c.restore();

    c.save();
    c.font = '11px system-ui, sans-serif';
    c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.55);
    c.textAlign = 'right';
    c.textBaseline = 'top';
    c.fillText(Bsign > 0 ? 'B ⊙' : 'B ⊗', b.x2 - 6, b.y1 + 4);
    c.restore();

    c.restore();
  }
});


/* ==========================================================================
 * 25. 单摆（大角度周期修正）
 * ========================================================================== */
param('pd_a0', { label: '释放角度', min: 0,   max: 90,  step: 1,    def: 60,  unit: '°' });
param('pd_L',  { label: '摆长',     min: 0.2, max: 1.2, step: 0.05, def: 0.7, unit: 'm' });
param('pd_g',  { label: '重力g',    min: 1,   max: 20,  step: 0.1,  def: 9.8, unit: 'm/s²' });
param('pd_r',  { label: '球半径',   min: 2,   max: 15,  step: 0.5,  def: 6,   unit: 'px' });

function __pd_EllipticK(k) {
  if (k < 1e-8) return Math.PI / 2;
  let a = 1, b = Math.sqrt(1 - k * k);
  for (let i = 0; i < 20; i++) {
    const aN = (a + b) / 2;
    const bN = Math.sqrt(a * b);
    if (Math.abs(aN - bN) < 1e-12) { a = aN; break; }
    a = aN; b = bN;
  }
  return Math.PI / (2 * a);
}
function __pd_PeriodFactor(theta0) {
  const k = Math.sin(theta0 / 2);
  return (2 / Math.PI) * __pd_EllipticK(k);
}

shape({
  key: 'anim_simple_pendulum',
  cat: 'anim',
  geom: 'box',
  label: '单摆(修正)',
  icon: '<circle cx="12" cy="3.5" r="1.3" fill="currentColor"/>' +
        '<line x1="12" y1="3.5" x2="17.5" y2="17"/>' +
        '<circle cx="17.5" cy="17" r="2.3" fill="currentColor"/>',
  animatable: true,
  params: ['pd_a0', 'pd_L', 'pd_g', 'pd_r'],

  draw(c, o, U2) {
    const AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
    const b  = U2.bbox(o);

    const L     = Math.max(0.1, o.pd_L ?? 0.7);
    const g     = Math.max(0.5, o.pd_g ?? 9.8);
    const rBall = Math.max(2,   o.pd_r ?? 6);
    const a0    = ((o.pd_a0 ?? 60) * Math.PI) / 180;

    const T0     = 2 * Math.PI * Math.sqrt(L / g);
    const kFac   = __pd_PeriodFactor(a0);
    const T_phys = T0 * kFac;

    if (!window.__pdStates) window.__pdStates = new WeakMap();
    let S = window.__pdStates.get(o);
    const sig = L + '|' + g + '|' + a0;
    if (!S || S.sig !== sig || AN.t < S.lastT) {
      S = { theta: a0, omega: 0, lastT: AN.t, sig };
      window.__pdStates.set(o, S);
    }

    let dt = AN.t - S.lastT;
    if (!isFinite(dt) || dt < 0 || dt > 0.5) dt = 0;

    if (dt > 1e-6) {
      const hMax = 0.001;
      const nSub = Math.min(80, Math.max(1, Math.ceil(dt / hMax)));
      const h    = dt / nSub;
      const acc  = th => -(g / L) * Math.sin(th);
      for (let i = 0; i < nSub; i++) {
        const th = S.theta, om = S.omega;
        const k1t = om,             k1o = acc(th);
        const k2t = om + h*0.5*k1o, k2o = acc(th + h*0.5*k1t);
        const k3t = om + h*0.5*k2o, k3o = acc(th + h*0.5*k2t);
        const k4t = om + h*k3o,     k4o = acc(th + h*k3t);
        S.theta += h/6 * (k1t + 2*k2t + 2*k3t + k4t);
        S.omega += h/6 * (k1o + 2*k2o + 2*k3o + k4o);
      }
    }
    S.lastT = AN.t;
    const theta = S.theta;

    const Lmax  = 1.2;
    const ratio = Math.sqrt(Math.max(0, Math.min(1, L / Lmax)));
    const maxV  = Math.min(b.h - 40, b.w * 0.45) - rBall;
    const Lpx   = Math.max(20, maxV * ratio);

    const pivotX = (b.x1 + b.x2) / 2;
    const pivotY = b.y1 + 24;

    const ballX = pivotX + Lpx * Math.sin(theta);
    const ballY = pivotY + Lpx * Math.cos(theta);

    c.save();
    c.lineWidth = Math.max(1, (o.size || 4) * 0.5);
    const beamHalf = Math.min(b.w * 0.25, Lpx * 0.5 + 12);
    c.beginPath();
    c.moveTo(pivotX - beamHalf, pivotY);
    c.lineTo(pivotX + beamHalf, pivotY);
    c.stroke();
    c.beginPath();
    c.moveTo(pivotX, pivotY);
    c.lineTo(pivotX, b.y1);
    c.stroke();
    for (let x = pivotX - beamHalf + 3; x < pivotX + beamHalf - 2; x += 9) {
      c.beginPath();
      c.moveTo(x, pivotY);
      c.lineTo(x - 4, pivotY + 5);
      c.stroke();
    }
    c.restore();

    c.save();
    c.setLineDash([3, 5]);
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.3);
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(pivotX, pivotY);
    c.lineTo(pivotX, pivotY + Lpx + 5);
    c.stroke();
    c.restore();

    if (a0 > 0.02) {
      c.save();
      c.setLineDash([2, 5]);
      c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.2);
      c.lineWidth = 1;
      const xL = pivotX + Lpx * Math.sin(a0);
      const yL = pivotY + Lpx * Math.cos(a0);
      const xR = pivotX + Lpx * Math.sin(-a0);
      const yR = pivotY + Lpx * Math.cos(-a0);
      c.beginPath();
      c.moveTo(pivotX, pivotY); c.lineTo(xL, yL);
      c.moveTo(pivotX, pivotY); c.lineTo(xR, yR);
      c.stroke();
      c.restore();
    }

    if (Math.abs(theta) > 0.04) {
      const arcR = Math.min(Lpx * 0.35, 45);
      c.save();
      c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.5);
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(pivotX, pivotY, arcR, Math.PI / 2, Math.PI / 2 - theta, theta > 0);
      c.stroke();
      c.restore();
    }

    c.save();
    c.lineWidth = Math.max(1.2, (o.size || 4) * 0.55);
    c.beginPath();
    c.moveTo(pivotX, pivotY);
    c.lineTo(ballX, ballY);
    c.stroke();
    c.restore();

    c.save();
    c.beginPath();
    c.arc(pivotX, pivotY, 3.5, 0, Math.PI * 2);
    c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.6);
    c.fill();
    c.restore();

    c.beginPath();
    c.arc(ballX, ballY, rBall, 0, Math.PI * 2);
    c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.7);
    c.fill();
    c.stroke();
    c.save();
    c.beginPath();
    c.arc(ballX - rBall * 0.3, ballY - rBall * 0.3, rBall * 0.3, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.fill();
    c.restore();

    if (Math.abs(theta) > 0.04) {
      c.save();
      c.font = 'bold 12px system-ui, sans-serif';
      c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.75);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      const deg = (theta * 180 / Math.PI).toFixed(0);
      const labelR = Math.min(Lpx * 0.35, 45) + 16;
      const labelAng = Math.PI / 2 - theta / 2;
      const lx = pivotX + labelR * Math.cos(labelAng);
      const ly = pivotY + labelR * Math.sin(labelAng);
      c.fillText(deg + '°', lx, ly);
      c.restore();
    }

    const panelW = 118;
    const panelH = 54;
    const panelX = b.x2 - panelW - 6;
    const panelY = b.y2 - panelH - 6;

    c.save();
    c.fillStyle = 'rgba(255, 255, 255, 0.85)';
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.18);
    c.lineWidth = 1;
    const rr = 6;
    c.beginPath();
    c.moveTo(panelX + rr, panelY);
    c.lineTo(panelX + panelW - rr, panelY);
    c.quadraticCurveTo(panelX + panelW, panelY, panelX + panelW, panelY + rr);
    c.lineTo(panelX + panelW, panelY + panelH - rr);
    c.quadraticCurveTo(panelX + panelW, panelY + panelH,
                       panelX + panelW - rr, panelY + panelH);
    c.lineTo(panelX + rr, panelY + panelH);
    c.quadraticCurveTo(panelX, panelY + panelH, panelX, panelY + panelH - rr);
    c.lineTo(panelX, panelY + rr);
    c.quadraticCurveTo(panelX, panelY, panelX + rr, panelY);
    c.closePath();
    c.fill();
    c.stroke();

    c.font = '10px system-ui, sans-serif';
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    const colGray = U2.alpha(o.color || '#1a1a1a', 0.55);
    const colBlue = '#1e88e5';
    const colRed  = '#e53935';

    const lineX1 = panelX + 7;
    const lineY1 = panelY + 13;
    const lineY2 = panelY + 27;
    const lineY3 = panelY + 41;
    const valX   = panelX + panelW - 7;

    c.fillStyle = colGray;
    c.fillText('T₀ 理论', lineX1, lineY1);
    c.fillStyle = colBlue;
    c.textAlign = 'right';
    c.fillText(T0.toFixed(3) + ' s', valX, lineY1);

    c.fillStyle = colGray;
    c.textAlign = 'left';
    c.fillText('T 修正', lineX1, lineY2);
    c.fillStyle = colRed;
    c.textAlign = 'right';
    c.fillText(T_phys.toFixed(3) + ' s', valX, lineY2);

    c.fillStyle = colGray;
    c.textAlign = 'left';
    c.fillText('T/T₀', lineX1, lineY3);
    c.fillStyle = (kFac > 1.03) ? colRed : colGray;
    c.textAlign = 'right';
    c.fillText('×' + kFac.toFixed(4), valX, lineY3);

    c.restore();

    if (kFac > 1.03) {
      c.save();
      c.font = '10px system-ui, sans-serif';
      c.fillStyle = 'rgba(229,57,53,0.8)';
      c.textAlign = 'left';
      c.textBaseline = 'top';
      c.fillText('大角度修正', b.x1 + 6, b.y1 + 4);
      c.fillStyle = 'rgba(229,57,53,0.55)';
      c.font = '9px ui-monospace, monospace';
      c.fillText('T = T₀·(2/π)·K(k)', b.x1 + 6, b.y1 + 17);
      c.restore();
    }
  }
});


/* ==========================================================================
 * 26. 圆弧轨道 + 小球（四种特殊初速度）
 * ========================================================================== */
param('sb5R', { label: '轨道半径', min: 60,  max: 200, step: 5,    def: 120, unit: 'px' });
param('sb5r', { label: '球半径',   min: 3,   max: 15,  step: 0.5,  def: 8,   unit: 'px' });
param('sb5special', { label: '特殊值0-4', min: 0, max: 4, step: 1, def: 0 });
param('sb5k', { label: '相对速度k', min: 0.5, max: 3,  step: 0.05, def: 1.5 });
param('sb5g', { label: '重力g',    min: 1,   max: 20,  step: 0.1,  def: 9.8, unit: 'm/s²' });

var __sb5_SpecialList = [
  null,
  { name: '刚好到圆心等高处',   formula: 'v₀ = √(2gR)',       alpha: 2 },
  { name: '脱轨后抛到最低点',   formula: 'v₀ = √(7gR/2)',     alpha: 3.5 },
  { name: '脱轨后抛出后过圆心', formula: 'v₀ = √((2+√3)gR)', alpha: 2 + Math.sqrt(3) },
  { name: '刚好到最高点',       formula: 'v₀ = √(5gR)',       alpha: 5 }
];

function __sb5_step(S, h, P) {
  const { g_px, R_eff, cx, cy, groundY, r_ball, b, v0_px, v0_2 } = P;
  const groundCenterY = groundY - r_ball;

  if (S.phase === 'approach') {
    S.x += S.vx * h;
    if (S.x >= cx) {
      S.x = cx; S.y = groundCenterY;
      S.phase = 'onTrack'; S.theta = 0;
      S.omega = v0_px / R_eff;
    }
    return;
  }

  if (S.phase === 'onTrack') {
    const acc = th => -(g_px / R_eff) * Math.sin(th);
    const k1t = S.omega, k1o = acc(S.theta);
    const k2t = S.omega + h * 0.5 * k1o, k2o = acc(S.theta + h * 0.5 * k1t);
    const k3t = S.omega + h * 0.5 * k2o, k3o = acc(S.theta + h * 0.5 * k2t);
    const k4t = S.omega + h * k3o,       k4o = acc(S.theta + h * k3t);
    S.theta += h / 6 * (k1t + 2 * k2t + 2 * k3t + k4t);
    S.omega += h / 6 * (k1o + 2 * k2o + 2 * k3o + k4o);

    if (S.theta <= 0 && S.omega < 0) {
      S.theta = 0; S.x = cx; S.y = groundCenterY;
      S.vx = -v0_px; S.vy = 0;
      S.phase = 'onGround';
      return;
    }

    if (S.theta >= Math.PI) {
      const vT2 = v0_2 - 4 * g_px * R_eff;
      S.theta = Math.PI; S.x = cx; S.y = cy - R_eff;
      if (vT2 > 0) {
        S.vx = -Math.sqrt(vT2); S.vy = 0;
        S.phase = 'projectile';
      } else {
        S.vx = 0; S.vy = 0;
        S.phase = 'onGround';
      }
      return;
    }

    const cosT = Math.cos(S.theta), sinT = Math.sin(S.theta);
    const v2 = v0_2 - 2 * g_px * R_eff * (1 - cosT);
    const N  = v2 / R_eff + g_px * cosT;
    if (N < 0 && sinT > 0.01) {
      let cosD = 2 / 3 - v0_2 / (3 * g_px * R_eff);
      cosD = Math.max(-1, Math.min(1, cosD));
      const thetaD = Math.acos(cosD);
      S.theta = thetaD;
      S.x = cx + R_eff * Math.sin(thetaD);
      S.y = cy + R_eff * Math.cos(thetaD);
      const vD2 = Math.max(0, v0_2 - 2 * g_px * R_eff * (1 - Math.cos(thetaD)));
      const vD  = Math.sqrt(vD2);
      S.vx =  vD * Math.cos(thetaD);
      S.vy = -vD * Math.sin(thetaD);
      S.phase = 'projectile';
    }
    return;
  }

  if (S.phase === 'projectile') {
    S.x += S.vx * h;
    S.y += S.vy * h;
    S.vy += g_px * h;
    if (S.y >= groundCenterY) {
      S.y = groundCenterY; S.vy = 0;
      S.phase = 'onGround';
    }
    return;
  }

  if (S.phase === 'onGround') {
    S.x += S.vx * h;
    if (S.x < b.x1 - 150 || S.x > b.x2 + 150) {
      S.phase = 'approach';
      S.x = Math.max(b.x1 + 12, cx - R_eff * 2 - 50);
      S.y = groundCenterY; S.vx = v0_px; S.vy = 0;
      S.theta = 0; S.omega = 0;
      S.trail = [];
    }
  }
}

shape({
  key: 'anim_slot_ball5',
  cat: 'anim',
  geom: 'box',
  label: '圆弧轨道(特殊速度)',
  icon: '<path d="M3 18 Q 12 4 21 18" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
        '<circle cx="8" cy="16" r="1.8" fill="currentColor"/>',
  animatable: true,
  params: ['sb5R', 'sb5r', 'sb5special', 'sb5k', 'sb5g'],

  draw(c, o, U2) {
    const AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
    const b  = U2.bbox(o);

    const R_user = o.sb5R ?? 120;
    const r_user = o.sb5r ?? 8;
    const k_free = o.sb5k ?? 1.5;
    const g_m    = o.sb5g ?? 9.8;
    const sIdx   = Math.round(o.sb5special ?? 0);
    const special = __sb5_SpecialList[sIdx] || null;

    const maxR = Math.min(b.w * 0.40, b.h * 0.72);
    const R    = Math.min(maxR, (R_user / 200) * maxR);
    const r_ball = Math.min(R * 0.20, (r_user / 15) * maxR * 0.06);
    const R_eff  = Math.max(1, R - r_ball);

    const alpha = special ? special.alpha : k_free * k_free;

    const g_px = g_m * 16;
    const v0_2  = alpha * g_px * R_eff;
    const v0_px = Math.sqrt(v0_2);
    const v_ref = Math.sqrt(g_px * R_eff);

    const cx = (b.x1 + b.x2) / 2;
    const groundY = b.y2 - 3;
    const cy = groundY - R;
    const groundCenterY = groundY - r_ball;

    if (!window.__sb5States) window.__sb5States = new WeakMap();
    let S = window.__sb5States.get(o);
    const sig = R + '|' + r_ball + '|' + alpha + '|' + g_px + '|' + b.x1 + '|' + b.x2 + '|' + groundY;

    const startX = Math.max(b.x1 + 12, cx - R_eff * 2 - 50);
    const resetState = () => {
      S = {
        sig, phase: 'approach', theta: 0, omega: 0,
        x: startX, y: groundCenterY, vx: v0_px, vy: 0,
        lastT: AN.t, trail: [],
      };
      window.__sb5States.set(o, S);
    };
    if (!S || S.sig !== sig) resetState();

    let dt = AN.t - S.lastT;
    if (!isFinite(dt) || dt < 0 || dt > 0.5) { resetState(); dt = 0; }
    S.lastT = AN.t;

    if (dt > 0) {
      const maxStep = 0.002;
      const nSub = Math.min(200, Math.max(1, Math.ceil(dt / maxStep)));
      const h = dt / nSub;
      const P = { g_px, R_eff, cx, cy, groundY, r_ball, b, v0_px, v0_2 };
      for (let i = 0; i < nSub; i++) __sb5_step(S, h, P);
    }

    let ballX, ballY;
    if (S.phase === 'onTrack') {
      ballX = cx + R_eff * Math.sin(S.theta);
      ballY = cy + R_eff * Math.cos(S.theta);
    } else {
      ballX = S.x; ballY = S.y;
    }

    if (S.phase === 'onTrack' || S.phase === 'projectile') {
      if (!S.trail) S.trail = [];
      const last = S.trail.length ? S.trail[S.trail.length - 1] : null;
      if (!last || Math.hypot(ballX - last.x, ballY - last.y) > 2.5) {
        S.trail.push({ x: ballX, y: ballY });
        if (S.trail.length > 1000) S.trail.shift();
      }
    }

    const lineW = Math.max(1, (o.size || 4) * 0.55);

    c.save();
    c.lineWidth = lineW;
    c.beginPath(); c.moveTo(b.x1, groundY); c.lineTo(b.x2, groundY); c.stroke();
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.32);
    c.lineWidth = Math.max(0.8, (o.size || 4) * 0.4);
    for (let x = b.x1 + 8; x < b.x2 - 4; x += 12) {
      c.beginPath();
      c.moveTo(x, groundY + 1); c.lineTo(x + 4, groundY + 5); c.stroke();
    }
    c.restore();

    c.save();
    c.lineWidth = lineW * 1.6;
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.85);
    c.beginPath();
    c.arc(cx, cy, R, Math.PI / 2, -Math.PI / 2, true);
    c.stroke();
    c.restore();

    c.save();
    c.setLineDash([3, 5]);
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.25);
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, groundY); c.stroke();
    c.restore();

    if (S.trail && S.trail.length > 1) {
      c.save();
      c.setLineDash([5, 4]);
      c.strokeStyle = 'rgba(229,57,53,0.55)';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(S.trail[0].x, S.trail[0].y);
      for (let i = 1; i < S.trail.length; i++) c.lineTo(S.trail[i].x, S.trail[i].y);
      c.stroke();
      c.restore();
    }

    c.beginPath();
    c.arc(ballX, ballY, r_ball, 0, Math.PI * 2);
    c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.72);
    c.fill();
    c.lineWidth = Math.max(1.2, (o.size || 4) * 0.6);
    c.stroke();
    c.save();
    c.beginPath();
    c.arc(ballX - r_ball * 0.3, ballY - r_ball * 0.3, r_ball * 0.3, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
    c.restore();

    let vspeed = 0, vdx = 0, vdy = 0;
    if (S.phase === 'onTrack') {
      vspeed = Math.sqrt(Math.max(0, v0_2 - 2 * g_px * R_eff * (1 - Math.cos(S.theta))));
      const sgn = Math.sign(S.omega) || 1;
      vdx =  sgn * Math.cos(S.theta);
      vdy = -sgn * Math.sin(S.theta);
    } else {
      vspeed = Math.hypot(S.vx, S.vy);
      if (vspeed > 1e-6) { vdx = S.vx / vspeed; vdy = S.vy / vspeed; }
    }
    if (vspeed > 5) {
      const arrLen = Math.min(70, vspeed * 0.22);
      const ex = ballX + vdx * arrLen, ey = ballY + vdy * arrLen;
      c.save();
      c.strokeStyle = '#43a047'; c.fillStyle = '#43a047';
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(ballX, ballY); c.lineTo(ex, ey); c.stroke();
      const hL = Math.min(12, arrLen * 0.35), hW = hL * 0.6;
      c.beginPath();
      c.moveTo(ex, ey);
      c.lineTo(ex - vdx * hL - vdy * hW, ey - vdy * hL + vdx * hW);
      c.lineTo(ex - vdx * hL + vdy * hW, ey - vdy * hL - vdx * hW);
      c.closePath(); c.fill();
      c.restore();
    }

    let sitLabel, sitColor, angleLabel, angleColor;
    if (alpha >= 5) {
      sitLabel = '顶部平抛'; sitColor = '#e53935';
      angleLabel = '脱离角 360°(2π)'; angleColor = '#e53935';
    } else if (alpha < 2) {
      sitLabel = '返回'; sitColor = '#7a8598';
      const cosMax = Math.max(-1, Math.min(1, 1 - alpha / 2));
      const maxDeg = Math.acos(cosMax) * 180 / Math.PI;
      angleLabel = '最大角 ' + maxDeg.toFixed(1) + '°'; angleColor = '#7a8598';
    } else {
      sitLabel = '脱离'; sitColor = '#f57c00';
      const cosD = Math.max(-1, Math.min(1, 2 / 3 - alpha / 3));
      const detachDeg = Math.acos(cosD) * 180 / Math.PI;
      angleLabel = '脱离角 ' + detachDeg.toFixed(1) + '°'; angleColor = '#f57c00';
    }

    c.save();
    c.font = 'bold 11px system-ui, sans-serif';
    c.textAlign = 'left'; c.textBaseline = 'bottom';
    c.fillStyle = sitColor;
    c.fillText(sitLabel + '  α = ' + alpha.toFixed(2), b.x1 + 8, b.y2 - 22);
    c.fillStyle = angleColor;
    c.fillText(angleLabel, b.x1 + 8, b.y2 - 6);
    c.restore();

    const vNorm = vspeed / v_ref;
    const panelW = 130, panelH = 26;
    const panelX = b.x2 - panelW - 6, panelY = b.y2 - panelH - 6;

    c.save();
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.strokeStyle = U2.alpha(o.color || '#1a1a1a', 0.18);
    c.lineWidth = 1;
    const rr = 5;
    c.beginPath();
    c.moveTo(panelX + rr, panelY);
    c.lineTo(panelX + panelW - rr, panelY);
    c.quadraticCurveTo(panelX + panelW, panelY, panelX + panelW, panelY + rr);
    c.lineTo(panelX + panelW, panelY + panelH - rr);
    c.quadraticCurveTo(panelX + panelW, panelY + panelH, panelX + panelW - rr, panelY + panelH);
    c.lineTo(panelX + rr, panelY + panelH);
    c.quadraticCurveTo(panelX, panelY + panelH, panelX, panelY + panelH - rr);
    c.lineTo(panelX, panelY + rr);
    c.quadraticCurveTo(panelX, panelY, panelX + rr, panelY);
    c.closePath();
    c.fill(); c.stroke();

    c.font = '11px system-ui, sans-serif';
    c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillStyle = U2.alpha(o.color || '#1a1a1a', 0.6);
    c.fillText('当前 |v| =', panelX + 7, panelY + panelH / 2);

    c.font = 'bold 11.5px ui-monospace, Menlo, monospace';
    c.fillStyle = '#43a047';
    c.textAlign = 'right';
    c.fillText(vNorm.toFixed(3) + '·√(gR)', panelX + panelW - 7, panelY + panelH / 2);
    c.restore();

    if (special) {
      const sW = 168, sH = 40;
      const sX = b.x1 + 6, sY = b.y1 + 6;

      c.save();
      c.fillStyle = 'rgba(227,240,255,0.92)';
      c.strokeStyle = '#b8dcfb';
      c.lineWidth = 1;
      const rr2 = 6;
      c.beginPath();
      c.moveTo(sX + rr2, sY);
      c.lineTo(sX + sW - rr2, sY);
      c.quadraticCurveTo(sX + sW, sY, sX + sW, sY + rr2);
      c.lineTo(sX + sW, sY + sH - rr2);
      c.quadraticCurveTo(sX + sW, sY + sH, sX + sW - rr2, sY + sH);
      c.lineTo(sX + rr2, sY + sH);
      c.quadraticCurveTo(sX, sY + sH, sX, sY + sH - rr2);
      c.lineTo(sX, sY + rr2);
      c.quadraticCurveTo(sX, sY, sX + rr2, sY);
      c.closePath();
      c.fill(); c.stroke();

      c.font = 'bold 10.5px system-ui, sans-serif';
      c.fillStyle = '#1e88e5';
      c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText(special.name, sX + 8, sY + 12);

      c.font = 'bold 12px ui-monospace, Menlo, monospace';
      c.fillStyle = '#0d47a1';
      c.fillText(special.formula, sX + 8, sY + 28);
      c.restore();
    }
  }
});


/* ==========================================================================
 * 27. 开普勒第二定律
 * ========================================================================== */
(function () {
  var PB2 = window.PhysBoard;
  if (!PB2) return;

  var shape2 = function (d) {
    if (!d || !d.key) return;
    if (typeof PB2.register === 'function') PB2.register(d);
    else PB2.shapes[d.key] = d;
  };

  function withAlpha(color, a) {
    var h = String(color || '#1a1a1a').replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(0,0,0,' + a + ')';
    return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')';
  }

  if (!PB2.paramDefs) PB2.paramDefs = {};
  if (!PB2.paramDefs.kepE)
    PB2.paramDefs.kepE = { label: '偏心率', min: 0, max: 0.75, step: 0.01, def: 0.55 };
  if (!PB2.paramDefs.kepSeg)
    PB2.paramDefs.kepSeg = { label: '分段数', min: 6, max: 24, step: 2, def: 12 };
  if (!PB2.paramDefs.kepPeriod)
    PB2.paramDefs.kepPeriod = { label: '周期', min: 1, max: 10, step: 0.5, def: 4, unit: 's' };

  shape2({
    key: 'anim_kepler2',
    cat: 'anim',
    geom: 'rect',
    label: '开普勒第二定律',
    icon: '<ellipse cx="12" cy="12" rx="9" ry="6" fill="none" stroke="currentColor"/>' +
          '<circle cx="18.5" cy="12" r="1.5" fill="currentColor"/>',
    animatable: true,
    params: ['kepE', 'kepSeg', 'kepPeriod'],

    draw: function (c, o, U) {
      var AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
      var b = U.bbox(o);
      if (b.w < 80 || b.h < 80) return;

      var e = Math.max(0, Math.min(0.75, o.kepE != null ? o.kepE : 0.55));
      var N = Math.max(6, Math.round(o.kepSeg || 12));
      var T = Math.max(0.5, o.kepPeriod || 4);

      var tLocal = AN.t % T;
      if (!isFinite(tLocal) || tLocal < 0) tLocal = 0;

      var a = 1;
      var bSemi = Math.sqrt(1 - e * e);
      var cOff = e;

      var margin = 26;
      var availW = b.w - 2 * margin;
      var availH = b.h - 2 * margin - 26;
      var scale = Math.min(availW / (2 * a), availH / (2 * bSemi));
      if (scale < 25) return;

      var cx = b.x1 + b.w / 2;
      var cy = b.y1 + (b.h - 26) / 2 + 6;
      var sunX = cx + cOff * scale;
      var sunY = cy;

      function solveE(M) {
        M = ((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        var E = M + e * Math.sin(M);
        for (var i = 0; i < 12; i++) {
          var f = E - e * Math.sin(E) - M;
          var fp = 1 - e * Math.cos(E);
          var dE = f / fp;
          E -= dE;
          if (Math.abs(dE) < 1e-10) break;
        }
        return E;
      }
      function posAt(t) {
        var M = 2 * Math.PI * (t / T);
        var E = solveE(M);
        return {
          x: cx + a * Math.cos(E) * scale,
          y: cy - bSemi * Math.sin(E) * scale
        };
      }

      function fillSector(t1, t2, fillColor) {
        if (t2 - t1 < 1e-5) return;
        c.beginPath();
        c.moveTo(sunX, sunY);
        var steps = Math.max(4, Math.round(28 * (t2 - t1) / (T / N)));
        for (var i = 0; i <= steps; i++) {
          var t = t1 + (t2 - t1) * i / steps;
          var p = posAt(t);
          c.lineTo(p.x, p.y);
        }
        c.closePath();
        c.fillStyle = fillColor;
        c.fill();
      }

      function strokeEllipse() {
        c.beginPath();
        var steps = 120;
        for (var i = 0; i <= steps; i++) {
          var E = i / steps * 2 * Math.PI;
          var px = cx + a * Math.cos(E) * scale;
          var py = cy - bSemi * Math.sin(E) * scale;
          if (i === 0) c.moveTo(px, py);
          else c.lineTo(px, py);
        }
        c.closePath();
        c.stroke();
      }

      var dt = T / N;
      var kDone = Math.floor(tLocal / dt);
      if (kDone > N) kDone = N;

      var colA = 'rgba(30, 136, 229, 0.32)';
      var colB = 'rgba(245, 124, 0, 0.32)';

      for (var k = 0; k < kDone; k++) {
        var t1 = k * dt;
        var t2 = (k + 1) * dt;
        fillSector(t1, t2, (k % 2 === 0) ? colA : colB);
      }

      if (kDone < N) {
        var t1c = kDone * dt;
        var t2c = tLocal;
        if (t2c > t1c + 1e-5) {
          fillSector(t1c, t2c, (kDone % 2 === 0) ? colA : colB);
        }
      }

      c.save();
      c.strokeStyle = withAlpha(o.color, 0.75);
      c.lineWidth = Math.max(1.4, (o.size || 4) * 0.55);
      strokeEllipse();
      c.restore();

      c.save();
      c.setLineDash([3, 4]);
      c.strokeStyle = withAlpha(o.color, 0.22);
      c.lineWidth = 1;
      for (var k = Math.max(1, kDone + 1); k <= N; k++) {
        var p = posAt(k * dt);
        c.beginPath();
        c.moveTo(sunX, sunY);
        c.lineTo(p.x, p.y);
        c.stroke();
      }
      c.restore();

      c.save();
      c.strokeStyle = withAlpha(o.color, 0.35);
      c.lineWidth = 1;
      for (var k = 1; k <= kDone; k++) {
        var p = posAt(k * dt);
        c.beginPath();
        c.moveTo(sunX, sunY);
        c.lineTo(p.x, p.y);
        c.stroke();
      }
      c.restore();

      var curP = posAt(tLocal);
      c.save();
      c.strokeStyle = 'rgba(229, 57, 53, 0.9)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(sunX, sunY);
      c.lineTo(curP.x, curP.y);
      c.stroke();
      c.restore();

      var sunR = Math.max(5, scale * 0.075);
      c.save();
      var grd = c.createRadialGradient(sunX, sunY, sunR * 0.5,
                                        sunX, sunY, sunR * 3.5);
      grd.addColorStop(0, 'rgba(255, 179, 0, 0.55)');
      grd.addColorStop(1, 'rgba(255, 179, 0, 0)');
      c.fillStyle = grd;
      c.beginPath();
      c.arc(sunX, sunY, sunR * 3.5, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      c.fillStyle = '#ffb300';
      c.fill();
      c.strokeStyle = '#e65100';
      c.lineWidth = 1.2;
      c.stroke();
      c.restore();

      var planetR = Math.max(4, scale * 0.055);
      c.save();
      c.beginPath();
      c.arc(curP.x, curP.y, planetR, 0, Math.PI * 2);
      c.fillStyle = withAlpha(o.color || '#1a1a1a', 0.85);
      c.fill();
      c.strokeStyle = withAlpha(o.color || '#1a1a1a', 0.95);
      c.lineWidth = 1.4;
      c.stroke();
      c.restore();

      c.save();
      c.font = 'bold 11px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
      c.fillStyle = withAlpha(o.color, 0.80);
      c.textAlign = 'left';
      c.textBaseline = 'top';
      c.fillText('开普勒第二定律：相等时间扫过相等面积', b.x1 + 8, b.y1 + 6);
      c.font = '10px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
      c.fillStyle = withAlpha(o.color, 0.50);
      c.fillText('把周期 T 等分为 ' + N + ' 段，每段内扫过的面积相等',
                 b.x1 + 8, b.y1 + 22);
      c.restore();

      c.save();
      c.font = '11px ui-monospace, Menlo, Consolas, monospace';
      c.fillStyle = withAlpha(o.color, 0.60);
      c.textAlign = 'center';
      c.textBaseline = 'bottom';
      var progress = tLocal / T;
      c.fillText(
        'e = ' + e.toFixed(2) + '   N = ' + N + '   ' +
        '进度 ' + (progress * 100).toFixed(0) + '%',
        b.x1 + b.w / 2, b.y2 - 6
      );
      c.restore();
    }
  });
})();


/* ==========================================================================
 * 28. 四类卫星（含可调卫星）
 * ========================================================================== */
param('satAlt',   { label: '可调轨道半径', min: 1.2, max: 8, step: 0.1, def: 3.5, unit: 'Rₑ' });
param('satSpeed', { label: '动画倍速',     min: 0.25, max: 5, step: 0.25, def: 1, unit: '×' });

shape({
  key: 'anim_satellites',
  cat: 'anim',
  geom: 'box',
  label: '四类卫星',
  icon: '<circle cx="12" cy="12" r="3.5" fill="currentColor"/>' +
        '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" ' +
        'stroke-width="0.9" stroke-dasharray="2 2"/>' +
        '<circle cx="12" cy="4" r="1.4" fill="currentColor"/>' +
        '<circle cx="20" cy="12" r="1.4" fill="currentColor"/>',
  animatable: true,
  params: ['satAlt', 'satSpeed'],

  draw(c, o, U2) {
    const AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
    const b  = U2.bbox(o);
    if (b.w < 100 || b.h < 100) return;

    const speed = Math.max(0.1, o.satSpeed ?? 1);

    const cx = (b.x1 + b.x2) / 2;
    const cy = (b.y1 + b.y2) / 2;
    const margin = Math.max(18, Math.min(b.w, b.h) * 0.05);
    const maxR = Math.min(b.w, b.h) / 2 - margin;

    const Rg_factor = 6.617;
    const Rearth = maxR / Rg_factor;

    const rGround = 1.00;
    const rLEO    = 1.05;
    const rGEO    = Rg_factor;
    const rUser   = Math.max(1.2, Math.min(8, o.satAlt ?? 3.5));

    const T_EARTH = 60;
    const omegaE  = 2 * Math.PI / T_EARTH;
    const omegaAt = r => omegaE * Math.pow(rGEO / r, 1.5);

    const omegaGround = omegaE;
    const omegaLEO    = omegaAt(rLEO);
    const omegaGEO    = omegaAt(rGEO);
    const omegaUser   = omegaAt(rUser);

    const tScaled = AN.t * speed;

    const thetaGround = omegaGround * tScaled;
    const thetaLEO    = omegaLEO    * tScaled;
    const thetaGEO    = omegaGEO    * tScaled;
    const thetaUser   = omegaUser   * tScaled;

    const posAt = (r, th) => ({
      x: cx + r * Math.cos(th),
      y: cy - r * Math.sin(th)
    });

    const pGround = posAt(Rearth * rGround, thetaGround);
    const pLEO    = posAt(Rearth * rLEO,    thetaLEO);
    const pGEO    = posAt(Rearth * rGEO,    thetaGEO);
    const pUser   = posAt(Rearth * rUser,   thetaUser);

    if (!window.__satStates) window.__satStates = new WeakMap();
    let S = window.__satStates.get(o);
    const sig = Rearth.toFixed(2) + '|' + rUser.toFixed(2);
    if (!S || S.sig !== sig) {
      S = { sig, lastT: AN.t,
            trails: { ground: [], leo: [], geo: [], user: [] } };
      window.__satStates.set(o, S);
    }
    if (AN.t < S.lastT - 0.1) {
      S.trails = { ground: [], leo: [], geo: [], user: [] };
    }
    S.lastT = AN.t;

    const MAX_TRAIL = Math.max(20, Math.round(72 / speed));
    if (AN.playing) {
      const push = (key, p) => {
        const arr = S.trails[key];
        arr.push({ x: p.x, y: p.y });
        if (arr.length > MAX_TRAIL) arr.shift();
      };
      push('ground', pGround);
      push('leo',    pLEO);
      push('geo',    pGEO);
      push('user',   pUser);
    }

    const drawOrbit = (r, color) => {
      c.save();
      c.setLineDash([4, 5]);
      c.strokeStyle = color;
      c.lineWidth = 1;
      c.beginPath();
      c.arc(cx, cy, Rearth * r, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    };
    drawOrbit(rLEO,  'rgba(0, 229, 255, 0.26)');
    drawOrbit(rUser, 'rgba(224, 64, 251, 0.30)');
    drawOrbit(rGEO,  'rgba(255, 152, 0, 0.30)');

    const drawTrail = (key, rgbaPrefix) => {
      const arr = S.trails[key];
      if (arr.length < 2) return;
      c.save();
      c.lineCap  = 'round';
      c.lineJoin = 'round';
      c.lineWidth = 2.2;
      const n = arr.length;
      for (let i = 1; i < n; i++) {
        const a = i / n;
        const alpha = Math.max(0, (a - 0.15) / 0.85);
        c.strokeStyle = rgbaPrefix + (alpha * 0.85).toFixed(3) + ')';
        c.beginPath();
        c.moveTo(arr[i - 1].x, arr[i - 1].y);
        c.lineTo(arr[i].x,     arr[i].y);
        c.stroke();
      }
      c.restore();
    };
    drawTrail('user',   'rgba(224, 64, 251, ');
    drawTrail('geo',    'rgba(255, 152, 0, ');
    drawTrail('leo',    'rgba(0, 229, 255, ');
    drawTrail('ground', 'rgba(255, 213, 79, ');

    const earthGrad = c.createRadialGradient(
      cx - Rearth * 0.3, cy - Rearth * 0.3, Rearth * 0.1,
      cx, cy, Rearth
    );
    earthGrad.addColorStop(0,   '#4fc3f7');
    earthGrad.addColorStop(0.55, '#1e88e5');
    earthGrad.addColorStop(1,   '#0d47a1');

    c.save();
    c.beginPath();
    c.arc(cx, cy, Rearth, 0, Math.PI * 2);
    c.fillStyle = earthGrad;
    c.fill();
    c.strokeStyle = 'rgba(13, 71, 161, 0.9)';
    c.lineWidth = 1.2;
    c.stroke();
    c.restore();

    c.save();
    c.beginPath();
    c.arc(cx, cy, Rearth, 0, Math.PI * 2);
    c.clip();
    const earthRot = omegaE * tScaled;
    c.strokeStyle = 'rgba(255, 255, 255, 0.20)';
    c.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const ang = earthRot + i * Math.PI / 3;
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(ang) * Rearth,
               cy - Math.sin(ang) * Rearth);
      c.stroke();
    }
    c.fillStyle = 'rgba(76, 175, 80, 0.32)';
    for (let i = 0; i < 5; i++) {
      const ang = earthRot + i * (2 * Math.PI / 5) + 0.4;
      const rr  = Rearth * (0.30 + 0.28 * ((i * 7) % 5) / 5);
      c.beginPath();
      c.arc(cx + Math.cos(ang) * rr,
            cy - Math.sin(ang) * rr,
            Rearth * 0.13, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    c.save();
    c.fillStyle = 'rgba(255, 255, 255, 0.55)';
    c.beginPath();
    c.arc(cx, cy, 1.6, 0, Math.PI * 2);
    c.fill();
    c.restore();

    const drawSat = (p, r, color) => {
      c.save();
      const grd = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      grd.addColorStop(0, color.replace('rgb(', 'rgba(').replace(')', ', 0.55)'));
      grd.addColorStop(1, color.replace('rgb(', 'rgba(').replace(')', ', 0)'));
      c.fillStyle = grd;
      c.beginPath();
      c.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
      c.fill();
      c.restore();

      c.save();
      c.beginPath();
      c.arc(p.x, p.y, r, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();
      c.strokeStyle = '#ffffff';
      c.lineWidth = 1.2;
      c.stroke();
      c.restore();
    };
    drawSat(pGround, Math.max(3.5, Rearth * 0.08), 'rgb(255, 213, 79)');
    drawSat(pLEO,    Math.max(4.0, Rearth * 0.09), 'rgb(0, 229, 255)');
    drawSat(pGEO,    Math.max(4.5, Rearth * 0.10), 'rgb(255, 152, 0)');
    drawSat(pUser,   Math.max(5.0, Rearth * 0.11), 'rgb(224, 64, 251)');

    const T_user_anim = 60 * Math.pow(rUser / rGEO, 1.5);
    const T_user_min  = T_user_anim * 24;
    let periodStr;
    if (T_user_min < 120) {
      periodStr = 'T ≈ ' + T_user_min.toFixed(0) + ' min';
    } else {
      periodStr = 'T ≈ ' + (T_user_min / 60).toFixed(1) + ' h';
    }

    const legendItems = [
      { color: 'rgb(255, 213, 79)', text: '赤道未发射（随地球自转）' },
      { color: 'rgb(0, 229, 255)',  text: '近地卫星  T ≈ 90 min' },
      { color: 'rgb(224, 64, 251)', text: '可调卫星  r = ' + rUser.toFixed(2) +
                                          ' Rₑ  ' + periodStr },
      { color: 'rgb(255, 152, 0)',  text: '同步卫星  T = 24 h' }
    ];

    c.save();
    c.font = '11px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    c.textAlign = 'left';
    c.textBaseline = 'middle';

    const legendPadX = 8;
    const legendPadY = 6;
    const lineH = 16;
    let maxTextW = 0;
    for (const it of legendItems) {
      const w = c.measureText(it.text).width;
      if (w > maxTextW) maxTextW = w;
    }
    const legendW = legendPadX * 2 + 12 + maxTextW + 4;
    const legendH = legendPadY * 2 + lineH * legendItems.length;
    const legendX = b.x1 + 8;
    const legendY = b.y1 + 8;

    const rr = 6;
    c.beginPath();
    c.moveTo(legendX + rr, legendY);
    c.lineTo(legendX + legendW - rr, legendY);
    c.quadraticCurveTo(legendX + legendW, legendY,
                       legendX + legendW, legendY + rr);
    c.lineTo(legendX + legendW, legendY + legendH - rr);
    c.quadraticCurveTo(legendX + legendW, legendY + legendH,
                       legendX + legendW - rr, legendY + legendH);
    c.lineTo(legendX + rr, legendY + legendH);
    c.quadraticCurveTo(legendX, legendY + legendH,
                       legendX, legendY + legendH - rr);
    c.lineTo(legendX, legendY + rr);
    c.quadraticCurveTo(legendX, legendY,
                       legendX + rr, legendY);
    c.closePath();
    c.fillStyle = 'rgba(255, 255, 255, 0.82)';
    c.fill();
    c.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    c.lineWidth = 1;
    c.stroke();

    let ly = legendY + legendPadY + lineH / 2;
    for (const it of legendItems) {
      c.beginPath();
      c.arc(legendX + legendPadX + 5, ly, 4, 0, Math.PI * 2);
      c.fillStyle = it.color;
      c.fill();
      c.strokeStyle = '#fff';
      c.lineWidth = 1;
      c.stroke();

      c.fillStyle = 'rgba(0, 0, 0, 0.72)';
      c.fillText(it.text, legendX + legendPadX + 15, ly);
      ly += lineH;
    }
    c.restore();
  }
});


/* ==========================================================================
 * 29. 合力与分力（可拖拽）
 * ========================================================================== */
(function () {
  var PB2 = window.PhysBoard;
  if (!PB2) return;

  var shape2 = function (d) {
    if (!d || !d.key) return;
    if (typeof PB2.register === 'function') PB2.register(d);
    else PB2.shapes[d.key] = d;
  };

  function withAlpha(color, a) {
    var h = String(color || '#1a1a1a').replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(0,0,0,' + a + ')';
    return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')';
  }

  function drawArrow(c, x1, y1, x2, y2, color, width, headSize) {
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.hypot(dx, dy);
    if (len < 1) return;
    var ux = dx / len, uy = dy / len;
    var hL = Math.min(headSize, len * 0.55);
    var hW = hL * 0.55;
    c.save();
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2 - ux * hL * 0.85, y2 - uy * hL * 0.85);
    c.stroke();
    c.beginPath();
    c.moveTo(x2, y2);
    c.lineTo(x2 - ux * hL - uy * hW, y2 - uy * hL + ux * hW);
    c.lineTo(x2 - ux * hL + uy * hW, y2 - uy * hL - ux * hW);
    c.closePath();
    c.fill();
    c.restore();
  }

  if (!PB2.paramDefs) PB2.paramDefs = {};
  if (!PB2.paramDefs.fcF1)
    PB2.paramDefs.fcF1 = { label: 'F₁ 大小', min: 0.2, max: 2, step: 0.05, def: 1 };
  if (!PB2.paramDefs.fcA1)
    PB2.paramDefs.fcA1 = { label: 'F₁ 角度', min: -180, max: 180, step: 1, def: 45, unit: '°' };
  if (!PB2.paramDefs.fcF2)
    PB2.paramDefs.fcF2 = { label: 'F₂ 大小', min: 0.2, max: 2, step: 0.05, def: 1 };
  if (!PB2.paramDefs.fcA2)
    PB2.paramDefs.fcA2 = { label: 'F₂ 角度', min: -180, max: 180, step: 1, def: -30, unit: '°' };
  if (!PB2.paramDefs.fcM1)
    PB2.paramDefs.fcM1 = { label: 'F₁ 拖拽模式', min: 0, max: 2, step: 1, def: 0 };
  if (!PB2.paramDefs.fcM2)
    PB2.paramDefs.fcM2 = { label: 'F₂ 拖拽模式', min: 0, max: 2, step: 1, def: 0 };

  var fcInstances = [];

  function registerInstance(o) {
    var i = fcInstances.indexOf(o);
    if (i < 0) {
      fcInstances.push(o);
      if (fcInstances.length > 30) fcInstances.shift();
    } else if (i !== fcInstances.length - 1) {
      fcInstances.splice(i, 1);
      fcInstances.push(o);
    }
  }

  var dragging = null;

  function getStageCoords(e) {
    var stage = document.getElementById('stage');
    if (!stage) {
      return { x: e.clientX, y: e.clientY };
    }
    var r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  /* 拖拽时优先使用轻量重绘接口；无则退回 resize 事件（兼容旧版 HTML） */
  function triggerRedraw() {
    if (typeof window.__pbRedraw === 'function') {
      window.__pbRedraw();
    } else {
      window.dispatchEvent(new Event('resize'));
    }
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    if (!fcInstances.length) return;
    var p = getStageCoords(e);

    for (var i = fcInstances.length - 1; i >= 0; i--) {
      var o = fcInstances[i];
      if (!o._fcHandles) continue;
      var h = o._fcHandles;
      var r = 24;
      if (Math.hypot(p.x - h.P1.x, p.y - h.P1.y) < r) {
        dragging = { obj: o, which: 1 };
        e.stopPropagation(); e.preventDefault(); return;
      }
      if (Math.hypot(p.x - h.P2.x, p.y - h.P2.y) < r) {
        dragging = { obj: o, which: 2 };
        e.stopPropagation(); e.preventDefault(); return;
      }
    }
  }

  function onPointerMove(e) {
    if (!dragging) return;
    var p = getStageCoords(e);

    var o = dragging.obj;
    var h = o._fcHandles;
    if (!h) { dragging = null; return; }
    var scale = o._fcScale || 100;

    var dx = p.x - h.O.x;
    var dy = h.O.y - p.y;

    var mode = dragging.which === 1 ? (o.fcM1 || 0) : (o.fcM2 || 0);
    var fkey = dragging.which === 1 ? 'fcF1' : 'fcF2';
    var akey = dragging.which === 1 ? 'fcA1' : 'fcA2';
    var curAngle = (o[akey] || 0) * Math.PI / 180;

    var newF, newA;

    if (mode === 1) {
      newF = o[fkey];
      newA = Math.atan2(dy, dx);
    } else if (mode === 2) {
      var cosA = Math.cos(curAngle), sinA = Math.sin(curAngle);
      var proj = dx * cosA + dy * sinA;
      newF = Math.max(0.2, Math.min(2, proj / scale));
      newA = curAngle;
    } else {
      newF = Math.hypot(dx, dy) / scale;
      newF = Math.max(0.2, Math.min(2, newF));
      newA = Math.atan2(dy, dx);
    }

    o[fkey] = Math.round(newF * 100) / 100;
    o[akey] = Math.round(newA * 180 / Math.PI);

    triggerRedraw();

    e.stopPropagation(); e.preventDefault();
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = null;
    e.stopPropagation(); e.preventDefault();
  }

  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointermove', onPointerMove, true);
  window.addEventListener('pointerup',   onPointerUp,   true);

  shape2({
    key: 'anim_force_compose',
    cat: 'anim',
    geom: 'box',
    label: '合力与分力',
    icon: '<path d="M3 19 L11 5 M11 5 L21 13" stroke="currentColor" stroke-width="1.6" ' +
          'fill="none" stroke-linecap="round"/>' +
          '<path d="M3 19 L21 13" stroke="currentColor" stroke-width="1.6" ' +
          'fill="none" stroke-dasharray="2 2"/>',
    animatable: true,
    params: ['fcF1', 'fcA1', 'fcF2', 'fcA2', 'fcM1', 'fcM2'],

    draw: function (c, o, U) {
      var b = U.bbox(o);
      if (b.w < 60 || b.h < 60) return;

      if (o.fcF1 == null) o.fcF1 = 1;
      if (o.fcA1 == null) o.fcA1 = 45;
      if (o.fcF2 == null) o.fcF2 = 1;
      if (o.fcA2 == null) o.fcA2 = -30;
      if (o.fcM1 == null) o.fcM1 = 0;
      if (o.fcM2 == null) o.fcM2 = 0;

      var scale = Math.min(b.w, b.h) * 0.32;
      o._fcScale = scale;

      var O = {
        x: b.x1 + b.w * 0.28,
        y: b.y1 + b.h * 0.72
      };

      var a1 = o.fcA1 * Math.PI / 180;
      var a2 = o.fcA2 * Math.PI / 180;

      var P1 = {
        x: O.x + o.fcF1 * scale * Math.cos(a1),
        y: O.y - o.fcF1 * scale * Math.sin(a1)
      };
      var P2 = {
        x: O.x + o.fcF2 * scale * Math.cos(a2),
        y: O.y - o.fcF2 * scale * Math.sin(a2)
      };
      var PR = {
        x: P1.x + P2.x - O.x,
        y: P1.y + P2.y - O.y
      };

      o._fcHandles = { O: O, P1: P1, P2: P2, PR: PR };
      registerInstance(o);

      var colF1 = '#1e88e5';
      var colF2 = '#e53935';
      var colR  = '#43a047';

      c.save();
      c.setLineDash([5, 4]);
      c.strokeStyle = withAlpha(o.color || '#1a1a1a', 0.35);
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(P1.x, P1.y); c.lineTo(PR.x, PR.y);
      c.moveTo(P2.x, P2.y); c.lineTo(PR.x, PR.y);
      c.stroke();
      c.restore();

      drawArrow(c, O.x, O.y, P1.x, P1.y, colF1, 3, 12);
      drawArrow(c, O.x, O.y, P2.x, P2.y, colF2, 3, 12);
      drawArrow(c, O.x, O.y, PR.x, PR.y, colR, 3.5, 14);

      c.save();
      c.beginPath();
      c.arc(O.x, O.y, 4, 0, Math.PI * 2);
      c.fillStyle = withAlpha(o.color || '#1a1a1a', 0.85);
      c.fill();
      c.restore();

      function drawHandle(p, color) {
        c.save();
        c.beginPath();
        c.arc(p.x, p.y, 9, 0, Math.PI * 2);
        c.fillStyle = 'rgba(255, 255, 255, 0.9)';
        c.fill();
        c.strokeStyle = color;
        c.lineWidth = 2;
        c.stroke();
        c.beginPath();
        c.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
        c.fillStyle = color;
        c.fill();
        c.restore();
      }
      drawHandle(P1, colF1);
      drawHandle(P2, colF2);

      c.save();
      c.textAlign = 'left';
      c.textBaseline = 'middle';

      c.font = 'bold 12px system-ui, sans-serif';
      c.fillStyle = colF1;
      c.fillText('F₁ = ' + o.fcF1.toFixed(2), P1.x + 14, P1.y - 8);
      c.font = '10px system-ui, sans-serif';
      c.fillStyle = 'rgba(0,0,0,0.5)';
      c.fillText('θ₁ = ' + Math.round(o.fcA1) + '°', P1.x + 14, P1.y + 6);

      c.font = 'bold 12px system-ui, sans-serif';
      c.fillStyle = colF2;
      c.fillText('F₂ = ' + o.fcF2.toFixed(2), P2.x + 14, P2.y - 8);
      c.font = '10px system-ui, sans-serif';
      c.fillStyle = 'rgba(0,0,0,0.5)';
      c.fillText('θ₂ = ' + Math.round(o.fcA2) + '°', P2.x + 14, P2.y + 6);

      var Fx = o.fcF1 * Math.cos(a1) + o.fcF2 * Math.cos(a2);
      var Fy = o.fcF1 * Math.sin(a1) + o.fcF2 * Math.sin(a2);
      var Fmag = Math.hypot(Fx, Fy);
      var Fang = Math.atan2(Fy, Fx) * 180 / Math.PI;
      c.font = 'bold 12.5px system-ui, sans-serif';
      c.fillStyle = colR;
      c.fillText('F = ' + Fmag.toFixed(2), PR.x + 14, PR.y - 8);
      c.font = '10px system-ui, sans-serif';
      c.fillStyle = 'rgba(0,0,0,0.5)';
      c.fillText('θ = ' + Fang.toFixed(1) + '°', PR.x + 14, PR.y + 6);
      c.restore();

      var modeName = function (m) {
        if (m === 1) return '固定大小';
        if (m === 2) return '固定方向';
        return '自由';
      };

      c.save();
      c.font = '11px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
      c.textAlign = 'right';
      c.textBaseline = 'top';

      var lx = b.x2 - 8;
      var ly = b.y1 + 8;
      c.fillStyle = 'rgba(0,0,0,0.55)';
      c.fillText('拖拽模式', lx, ly);
      c.fillStyle = colF1;
      c.fillText('F₁：' + modeName(o.fcM1), lx, ly + 16);
      c.fillStyle = colF2;
      c.fillText('F₂：' + modeName(o.fcM2), lx, ly + 32);
      c.restore();

      c.save();
      c.font = '10px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
      c.fillStyle = 'rgba(0,0,0,0.38)';
      c.textAlign = 'left';
      c.textBaseline = 'bottom';
      c.fillText('拖动箭头端点改变分力 → 观察合力随之改变',
                 b.x1 + 8, b.y2 - 6);
      c.restore();
    }
  });
})();


/* ==========================================================================
 * 30. 斜面弹簧振子
 * ========================================================================== */
(function () {
  var PB2 = window.PhysBoard;
  if (!PB2) return;

  var shape2 = function (d) {
    if (!d || !d.key) return;
    if (typeof PB2.register === 'function') PB2.register(d);
    else PB2.shapes[d.key] = d;
  };

  function withAlpha(color, a) {
    var h = String(color || '#1a1a1a').replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(0,0,0,' + a + ')';
    return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')';
  }

  if (!PB2.paramDefs) PB2.paramDefs = {};
  if (!PB2.paramDefs.spAngle)
    PB2.paramDefs.spAngle  = { label: '倾角',     min: 0,   max: 90, step: 1,    def: 30,  unit: '°' };
  if (!PB2.paramDefs.spPeriod)
    PB2.paramDefs.spPeriod = { label: '周期',     min: 0.3, max: 3,  step: 0.1,  def: 1.2, unit: 's' };
  if (!PB2.paramDefs.spAmp)
    PB2.paramDefs.spAmp    = { label: '振幅',     min: 0.05, max: 0.4, step: 0.01, def: 0.15 };
  if (!PB2.paramDefs.spBoard)
    PB2.paramDefs.spBoard  = { label: '挡板0底1顶', min: 0, max: 1, step: 1,     def: 0 };
  if (!PB2.paramDefs.spBlock)
    PB2.paramDefs.spBlock  = { label: '物块大小', min: 10,  max: 40, step: 1,    def: 22 };

  shape2({
    key: 'anim_slope_spring',
    cat: 'anim',
    geom: 'box',
    label: '斜面弹簧振子',
    icon:
      '<path d="M4 20 L20 20 L20 8 Z" fill="none" stroke="currentColor" ' +
      'stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M4 20 L1 16" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M2.5 18 L4.28 17.79 L4.74 15.57 L6.96 16.03 L7.42 13.81 L9.2 13.6" ' +
      'fill="none" stroke="currentColor" stroke-width="0.9" ' +
      'stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="-2" y="-2" width="4" height="4" fill="currentColor" ' +
      'transform="translate(10.8,12.4) rotate(-36.87)"/>',
    animatable: true,
    params: ['spAngle', 'spPeriod', 'spAmp', 'spBoard', 'spBlock'],

    draw: function (c, o, U) {
      var AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
      var b  = U.bbox(o);
      if (b.w < 80 || b.h < 80) return;

      var angleDeg = Math.max(0, Math.min(90, o.spAngle != null ? o.spAngle : 30));
      var angleShow = Math.max(0.01, Math.min(89.99, angleDeg)) * Math.PI / 180;
      var T          = Math.max(0.2, o.spPeriod != null ? o.spPeriod : 1.2);
      var ampR       = Math.max(0.03, Math.min(0.4, o.spAmp != null ? o.spAmp : 0.15));
      var boardAtTop = (o.spBoard || 0) > 0.5;
      var blockSize  = Math.max(10, Math.min(40, o.spBlock != null ? o.spBlock : 22));

      var cosA = Math.cos(angleShow);
      var sinA = Math.sin(angleShow);

      var padX  = Math.min(24, b.w * 0.06);
      var padY  = Math.min(20, b.h * 0.05);
      var infoH = 32;

      var maxW = b.w - 2 * padX;
      var maxH = b.h - 2 * padY - infoH;

      var cosSafe = Math.max(0.001, Math.abs(Math.cos(angleShow)));
      var sinSafe = Math.max(0.001, Math.abs(Math.sin(angleShow)));
      var L_byW = maxW / cosSafe;
      var L_byH = maxH / sinSafe;
      var L = Math.min(L_byW, L_byH);

      var Ax = b.x1 + padX;
      var Ay = b.y2 - padY - infoH;
      var Bx = Ax + L * Math.cos(angleShow);
      var By = Ay;
      var Cx = Bx;
      var Cy = By - L * Math.sin(angleShow);

      var ux =  Math.cos(angleShow);
      var uy = -Math.sin(angleShow);
      var nx = -Math.sin(angleShow);
      var ny = -Math.cos(angleShow);

      var posAtS = function (s) {
        return { x: Ax + s * ux, y: Ay + s * uy };
      };

      var sBoard = boardAtTop ? L : 0;
      var pBoard = posAtS(sBoard);

      var sEq = L / 2;
      var maxAmpPx = Math.max(15, L / 2 - blockSize * 1.4 - 18);
      var A_px = Math.min(ampR * L, maxAmpPx);

      var omega = 2 * Math.PI / T;
      var phase = omega * AN.t;
      var sign  = boardAtTop ? -1 : 1;
      var sBlock = sEq + sign * A_px * Math.cos(phase);
      var pBlock = posAtS(sBlock);

      var bw = blockSize * 1.15;
      var bh = blockSize;
      var boardLen   = Math.max(blockSize * 1.15, 20);
      var boardThick = Math.max(3.5, (o.size || 4) * 0.9);

      var bcx = pBlock.x + nx * (blockSize / 2);
      var bcy = pBlock.y + ny * (blockSize / 2);

      var pBoardCenter = {
        x: pBoard.x + nx * (boardLen / 2),
        y: pBoard.y + ny * (boardLen / 2)
      };

      var pBlockEdge;
      if (boardAtTop) {
        pBlockEdge = {
          x: bcx + (bw / 2) * ux,
          y: bcy + (bw / 2) * uy
        };
      } else {
        pBlockEdge = {
          x: bcx - (bw / 2) * ux,
          y: bcy - (bw / 2) * uy
        };
      }

      var pEq = posAtS(sEq);
      var eqOut = {
        x: pEq.x + nx * (blockSize * 1.6),
        y: pEq.y + ny * (blockSize * 1.6)
      };

      var strokeCol = (o.hasBorder === false) ? 'rgba(0,0,0,0)' : (o.color || '#1a1a1a');
      var fa        = (o.fillAlpha != null ? o.fillAlpha : 0.6);
      var hasFill   = (o.fill !== false && !!o.fillColor);

      var slopeFill = hasFill
                      ? withAlpha(o.fillColor, Math.max(0.04, fa * 0.30))
                      : 'rgba(0,0,0,0)';

      var blockFill   = hasFill
                        ? withAlpha(o.fillColor, Math.min(1, fa * 0.85 + 0.15))
                        : (strokeCol === 'rgba(0,0,0,0)' ? '#1a1a1a' : strokeCol);
      var blockStroke = strokeCol;

      c.save();
      c.lineWidth = Math.max(1.2, (o.size || 4) * 0.6);
      c.strokeStyle = strokeCol;
      c.fillStyle   = slopeFill;
      c.beginPath();
      c.moveTo(Ax, Ay);
      c.lineTo(Bx, By);
      c.lineTo(Cx, Cy);
      c.closePath();
      if (hasFill) c.fill();
      c.stroke();
      c.restore();

      if (Bx - Ax > 20) {
        c.save();
        c.strokeStyle = withAlpha(o.color || '#1a1a1a', 0.32);
        c.lineWidth = Math.max(0.8, (o.size || 4) * 0.4);
        for (var gx = Ax - 4; gx < Bx + 10; gx += 12) {
          c.beginPath();
          c.moveTo(gx, Ay + 1);
          c.lineTo(gx + 4, Ay + 5);
          c.stroke();
        }
        c.restore();
      }

      if (angleDeg > 1) {
        var arcR = Math.min(42, L * 0.22);
        c.save();
        c.strokeStyle = withAlpha(o.color || '#1a1a1a', 0.55);
        c.lineWidth = 1.2;
        c.beginPath();
        c.arc(Ax, Ay, arcR, -angleShow, 0, false);
        c.stroke();

        c.fillStyle = withAlpha(o.color || '#1a1a1a', 0.75);
        c.font = 'bold 12px system-ui, sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        var labelAng = -angleShow / 2;
        c.fillText('θ=' + Math.round(angleDeg) + '°',
                   Ax + Math.cos(labelAng) * (arcR + 22),
                   Ay + Math.sin(labelAng) * (arcR + 22));
        c.restore();
      }

      c.save();
      c.setLineDash([4, 4]);
      c.strokeStyle = withAlpha(o.color || '#1a1a1a', 0.35);
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(pEq.x, pEq.y);
      c.lineTo(eqOut.x, eqOut.y);
      c.stroke();
      c.restore();

      c.save();
      c.strokeStyle = withAlpha(o.color || '#1a1a1a', 0.55);
      c.lineWidth = 1.4;
      var eqMark = blockSize * 0.35;
      c.beginPath();
      c.moveTo(eqOut.x - eqMark, eqOut.y);
      c.lineTo(eqOut.x + eqMark, eqOut.y);
      c.moveTo(eqOut.x, eqOut.y - eqMark);
      c.lineTo(eqOut.x, eqOut.y + eqMark);
      c.stroke();
      c.restore();

      var pA1 = posAtS(sEq - A_px);
      var pA2 = posAtS(sEq + A_px);
      c.save();
      c.setLineDash([2, 4]);
      c.strokeStyle = withAlpha(o.color || '#1a1a1a', 0.2);
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(pA1.x, pA1.y);
      c.lineTo(pA1.x + nx * (blockSize * 1.3), pA1.y + ny * (blockSize * 1.3));
      c.moveTo(pA2.x, pA2.y);
      c.lineTo(pA2.x + nx * (blockSize * 1.3), pA2.y + ny * (blockSize * 1.3));
      c.stroke();
      c.restore();

      var springStart = pBoardCenter;
      var springEnd   = pBlockEdge;
      var sdx = springEnd.x - springStart.x;
      var sdy = springEnd.y - springStart.y;
      var sLen = Math.hypot(sdx, sdy);

      if (sLen > 10) {
        var coils = 10;
        var total = coils * 2;
        var coilAmp = blockSize * 0.45;

        var sudx = sdx / sLen;
        var sudy = sdy / sLen;
        var spdx = -sudy;
        var spdy =  sudx;

        c.save();
        c.lineWidth = Math.max(1.2, (o.size || 4) * 0.55);
        c.strokeStyle = withAlpha(o.color || '#1a1a1a', 0.9);
        c.lineCap  = 'round';
        c.lineJoin = 'round';
        c.beginPath();
        c.moveTo(springStart.x, springStart.y);
        for (var i = 1; i < total; i++) {
          var tt = i / total;
          var sx = springStart.x + sdx * tt;
          var sy = springStart.y + sdy * tt;
          var sg = (i % 2 === 0) ? -1 : 1;
          c.lineTo(sx + spdx * coilAmp * sg, sy + spdy * coilAmp * sg);
        }
        c.lineTo(springEnd.x, springEnd.y);
        c.stroke();
        c.restore();
      }

      c.save();
      c.strokeStyle = withAlpha(o.color || '#1a1a1a', 0.95);
      c.lineWidth = boardThick;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(pBoard.x + nx * 2, pBoard.y + ny * 2);
      c.lineTo(pBoard.x + nx * boardLen, pBoard.y + ny * boardLen);
      c.stroke();

      var outerX = pBoard.x + nx * boardLen;
      var outerY = pBoard.y + ny * boardLen;
      c.lineWidth = Math.max(1.4, boardThick * 0.45);
      c.strokeStyle = withAlpha(o.color || '#1a1a1a', 0.55);
      c.beginPath();
      c.moveTo(outerX + ux * boardThick * 2.2, outerY + uy * boardThick * 2.2);
      c.lineTo(outerX - ux * boardThick * 2.2, outerY - uy * boardThick * 2.2);
      c.stroke();
      c.restore();

      c.save();
      c.translate(bcx, bcy);
      c.rotate(-angleShow);

      c.fillStyle   = blockFill;
      c.strokeStyle = blockStroke;
      c.lineWidth = Math.max(1.4, (o.size || 4) * 0.7);

      c.beginPath();
      c.rect(-bw / 2, -bh / 2, bw, bh);
      c.fill();
      c.stroke();

      if (blockSize >= 16) {
        c.fillStyle = hasFill
                      ? withAlpha(o.color || '#1a1a1a', 0.9)
                      : '#ffffff';
        c.font = 'bold ' + Math.min(bw, bh) * 0.55 + 'px system-ui, sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('m', 0, 0);
      }
      c.restore();

      var v = -sign * A_px * omega * Math.sin(phase);
      if (Math.abs(v) > 4) {
        var vdir = Math.sign(v);
        var vlen = Math.min(52, Math.abs(v) * 0.18);

        var arrowStart = {
          x: bcx + nx * (blockSize * 0.62),
          y: bcy + ny * (blockSize * 0.62)
        };
        var arrowEnd = {
          x: arrowStart.x + ux * vlen * vdir,
          y: arrowStart.y + uy * vlen * vdir
        };

        c.save();
        c.strokeStyle = '#43a047';
        c.fillStyle   = '#43a047';
        c.lineWidth = 2.2;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(arrowStart.x, arrowStart.y);
        c.lineTo(arrowEnd.x, arrowEnd.y);
        c.stroke();

        var adx = arrowEnd.x - arrowStart.x;
        var ady = arrowEnd.y - arrowStart.y;
        var alen = Math.hypot(adx, ady);
        if (alen > 1) {
          var aux = adx / alen;
          var auy = ady / alen;
          var ahL = 9;
          c.beginPath();
          c.moveTo(arrowEnd.x, arrowEnd.y);
          c.lineTo(arrowEnd.x - aux * ahL - auy * ahL * 0.5,
                   arrowEnd.y - auy * ahL + aux * ahL * 0.5);
          c.lineTo(arrowEnd.x - aux * ahL + auy * ahL * 0.5,
                   arrowEnd.y - auy * ahL - aux * ahL * 0.5);
          c.closePath();
          c.fill();
        }
        c.restore();
      }

      c.save();
      c.font = '11px ui-monospace, Menlo, Consolas, monospace';
      c.fillStyle = withAlpha(o.color || '#1a1a1a', 0.55);
      c.textAlign = 'left';
      c.textBaseline = 'bottom';
      c.fillText(
        'θ=' + Math.round(angleDeg) + '°  ' +
        'T=' + T.toFixed(1) + 's  ' +
        'A=' + (A_px / L).toFixed(2) + 'L  ' +
        '挡板=' + (boardAtTop ? '顶端' : '底端'),
        b.x1 + 8, b.y2 - 6
      );
      c.restore();
    }
  });
})();


/* ==========================================================================
 * 31. 平抛运动分解
 * ========================================================================== */
(function () {
  var PB2 = window.PhysBoard;
  if (!PB2) return;

  var shape2 = function (d) {
    if (!d || !d.key) return;
    if (typeof PB2.register === 'function') PB2.register(d);
    else PB2.shapes[d.key] = d;
  };

  function withAlpha(color, a) {
    var h = String(color || '#1a1a1a').replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(0,0,0,' + a + ')';
    return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')';
  }

  if (!PB2.paramDefs) PB2.paramDefs = {};
  if (!PB2.paramDefs.projV0)
    PB2.paramDefs.projV0 = { label: '初速度 v₀', min: 0.5, max: 2.5, step: 0.1, def: 1.5 };
  if (!PB2.paramDefs.projT)
    PB2.paramDefs.projT = { label: '下落时间', min: 0.8, max: 3, step: 0.1, def: 1.6, unit: 's' };
  if (!PB2.paramDefs.projFlash)
    PB2.paramDefs.projFlash = { label: '频闪次数', min: 4, max: 20, step: 1, def: 10 };

  shape2({
    key: 'anim_projectile_decomp',
    cat: 'anim',
    geom: 'box',
    label: '平抛运动分解',
    icon: '<path d="M2 4 Q 12 20 22 20" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
          '<circle cx="2" cy="4" r="1.2" fill="currentColor"/>' +
          '<circle cx="22" cy="20" r="1.2" fill="currentColor"/>' +
          '<circle cx="22" cy="4" r="1.2" fill="currentColor"/>',
    animatable: true,
    params: ['projV0', 'projT', 'projFlash'],

    draw: function (c, o, U2) {
      var AN = (window.PhysBoard && window.PhysBoard.animState) || { t: 0 };
      var b = U2.bbox(o);
      if (b.w < 100 || b.h < 100) return;

      var v0 = Math.max(0.5, Math.min(2.5, o.projV0 != null ? o.projV0 : 1.5));
      var T  = Math.max(0.5, Math.min(4, o.projT != null ? o.projT : 1.6));
      var N  = Math.max(4, Math.min(20, Math.round(o.projFlash != null ? o.projFlash : 10)));

      if (!window.__projStates) window.__projStates = new WeakMap();
      var S = window.__projStates.get(o);
      var sig = v0 + '|' + T + '|' + b.w.toFixed(0) + '|' + b.h.toFixed(0);
      if (!S || S.sig !== sig) {
        S = { sig: sig, t0: AN.t };
        window.__projStates.set(o, S);
      }
      var t = (AN.t - S.t0) % T;
      if (!isFinite(t) || t < 0) t = 0;

      var padL = 55, padR = 55, padT = 55, padB = 55;
      var W_avail = b.w - padL - padR;
      var H_avail = b.h - padT - padB;
      if (W_avail < 60 || H_avail < 60) return;

      var v0max = 2.5;
      var scale = Math.min(W_avail / v0max, H_avail);

      var W_traj = v0 * scale;
      var H_traj = scale;

      var x0 = b.x1 + padL;
      var y0 = b.y1 + padT;
      var xEnd = x0 + W_traj;
      var yEnd = y0 + H_traj;

      var v0_px = W_traj / T;
      var g_px  = 2 * H_traj / (T * T);

      var xMain = x0 + v0_px * t;
      var yMain = y0 + 0.5 * g_px * t * t;

      var xShadow = xMain;
      var yShadow = yEnd;
      var xVert   = xEnd;
      var yVert   = yMain;

      var colMain  = '#e53935';
      var colHoriz = '#1e88e5';
      var colVert  = '#43a047';

      c.save();
      c.setLineDash([5, 4]);
      c.strokeStyle = withAlpha(o.color || '#1a1a1a', 0.45);
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(x0 - 14, yEnd);
      c.lineTo(xEnd + 14, yEnd);
      c.moveTo(xEnd, y0 - 14);
      c.lineTo(xEnd, yEnd + 14);
      c.stroke();
      c.restore();

      c.save();
      c.setLineDash([5, 4]);
      c.strokeStyle = withAlpha(colMain, 0.22);
      c.lineWidth = 1.6;
      c.beginPath();
      var Nfull = 60;
      for (var i = 0; i <= Nfull; i++) {
        var tf = T * i / Nfull;
        var xf = x0 + v0_px * tf;
        var yf = y0 + 0.5 * g_px * tf * tf;
        if (i === 0) c.moveTo(xf, yf);
        else c.lineTo(xf, yf);
      }
      c.stroke();
      c.restore();

      c.save();
      c.strokeStyle = colMain;
      c.lineWidth = 2.4;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.beginPath();
      var Ns = Math.max(12, Math.round(90 * t / T));
      for (var j = 0; j <= Ns; j++) {
        var ts = t * j / Ns;
        var xs = x0 + v0_px * ts;
        var ys = y0 + 0.5 * g_px * ts * ts;
        if (j === 0) c.moveTo(xs, ys);
        else c.lineTo(xs, ys);
      }
      c.stroke();
      c.restore();

      c.save();
      c.strokeStyle = withAlpha(colHoriz, 0.75);
      c.lineWidth = 3;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x0, yEnd);
      c.lineTo(xMain, yEnd);
      c.stroke();
      c.restore();

      c.save();
      c.strokeStyle = withAlpha(colVert, 0.75);
      c.lineWidth = 3;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(xEnd, y0);
      c.lineTo(xEnd, yMain);
      c.stroke();
      c.restore();

      c.save();
      c.setLineDash([4, 4]);
      c.lineWidth = 1.2;
      c.strokeStyle = withAlpha(colHoriz, 0.55);
      c.beginPath();
      c.moveTo(xMain, yMain);
      c.lineTo(xMain, yEnd);
      c.stroke();
      c.strokeStyle = withAlpha(colVert, 0.55);
      c.beginPath();
      c.moveTo(xMain, yMain);
      c.lineTo(xEnd, yMain);
      c.stroke();
      c.restore();

      var dtFlash = T / N;
      var flashDone = Math.floor(t / dtFlash + 1e-6);
      if (flashDone > N) flashDone = N;

      var flashR = Math.max(3.2, Math.min(5.5, scale * 0.012));

      for (var fk = 1; fk <= flashDone; fk++) {
        var tk = fk * dtFlash;
        var fx = x0 + v0_px * tk;
        var fy = y0 + 0.5 * g_px * tk * tk;

        c.save();
        c.beginPath();
        c.arc(fx, fy, flashR, 0, Math.PI * 2);
        c.fillStyle = colMain;
        c.fill();
        c.strokeStyle = '#fff';
        c.lineWidth = 1.2;
        c.stroke();
        c.restore();

        c.save();
        c.beginPath();
        c.arc(fx, yEnd, flashR, 0, Math.PI * 2);
        c.fillStyle = colHoriz;
        c.fill();
        c.strokeStyle = '#fff';
        c.lineWidth = 1.2;
        c.stroke();
        c.restore();

        c.save();
        c.beginPath();
        c.arc(xEnd, fy, flashR, 0, Math.PI * 2);
        c.fillStyle = colVert;
        c.fill();
        c.strokeStyle = '#fff';
        c.lineWidth = 1.2;
        c.stroke();
        c.restore();
      }

      c.save();
      c.beginPath();
      c.arc(x0, y0, 3.5, 0, Math.PI * 2);
      c.fillStyle = withAlpha(o.color || '#1a1a1a', 0.75);
      c.fill();
      c.restore();

      var ballR = 6.5;
      var drawBall = function (px, py, color) {
        c.save();
        var grd = c.createRadialGradient(px, py, 0, px, py, ballR * 2.8);
        grd.addColorStop(0, withAlpha(color, 0.45));
        grd.addColorStop(1, withAlpha(color, 0));
        c.fillStyle = grd;
        c.beginPath();
        c.arc(px, py, ballR * 2.8, 0, Math.PI * 2);
        c.fill();

        c.beginPath();
        c.arc(px, py, ballR, 0, Math.PI * 2);
        c.fillStyle = color;
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.5;
        c.stroke();

        c.beginPath();
        c.arc(px - ballR * 0.32, py - ballR * 0.32, ballR * 0.32, 0, Math.PI * 2);
        c.fillStyle = 'rgba(255,255,255,0.75)';
        c.fill();
        c.restore();
      };

      drawBall(xMain,   yMain,   colMain);
      drawBall(xShadow, yShadow, colHoriz);
      drawBall(xVert,   yVert,   colVert);

      var vx = v0_px;
      var vy = g_px * t;
      var vScale = 0.16;

      c.save();
      c.strokeStyle = withAlpha(colMain, 0.75);
      c.fillStyle   = withAlpha(colMain, 0.75);
      c.lineWidth = 2;
      c.lineCap = 'round';

      var axEnd = xMain + vx * vScale;
      var ayEnd = yMain + vy * vScale;
      c.beginPath();
      c.moveTo(xMain, yMain);
      c.lineTo(axEnd, ayEnd);
      c.stroke();

      var adx = axEnd - xMain;
      var ady = ayEnd - yMain;
      var alen = Math.hypot(adx, ady);
      if (alen > 2) {
        var aux = adx / alen, auy = ady / alen;
        var ahl = 8;
        c.beginPath();
        c.moveTo(axEnd, ayEnd);
        c.lineTo(axEnd - aux * ahl - auy * ahl * 0.5,
                 ayEnd - auy * ahl + aux * ahl * 0.5);
        c.lineTo(axEnd - aux * ahl + auy * ahl * 0.5,
                 ayEnd - auy * ahl - aux * ahl * 0.5);
        c.closePath();
        c.fill();
      }
      c.restore();

      c.save();
      c.font = 'bold 12px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
      c.fillStyle = withAlpha(o.color || '#1a1a1a', 0.85);
      c.textAlign = 'left';
      c.textBaseline = 'top';
      c.fillText('平抛运动分解', b.x1 + 10, b.y1 + 8);
      c.restore();

      c.save();
      c.font = '10.5px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
      c.textAlign = 'right';
      c.textBaseline = 'middle';

      var legendX = b.x2 - 10;
      var legendY = b.y1 + 14;
      var legendLineH = 16;

      var items = [
        { color: colMain,  text: '合运动（平抛）' },
        { color: colHoriz, text: '水平：匀速直线' },
        { color: colVert,  text: '竖直：自由落体' }
      ];

      for (var k = 0; k < items.length; k++) {
        var itemY = legendY + k * legendLineH;
        var textW = c.measureText(items[k].text).width;
        c.beginPath();
        c.arc(legendX - textW - 12, itemY, 4, 0, Math.PI * 2);
        c.fillStyle = items[k].color;
        c.fill();
        c.strokeStyle = '#fff';
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = 'rgba(0, 0, 0, 0.7)';
        c.fillText(items[k].text, legendX, itemY);
      }
      c.restore();

      c.save();
      c.font = '11px ui-monospace, Menlo, Consolas, monospace';
      c.fillStyle = withAlpha(o.color || '#1a1a1a', 0.55);
      c.textAlign = 'right';
      c.textBaseline = 'bottom';
      c.fillText(
        'v₀ = ' + v0.toFixed(1) +
        '   频闪 = ' + N + '次/周期' +
        '   t = ' + t.toFixed(2) + ' / ' + T.toFixed(1) + ' s',
        b.x2 - 8, b.y2 - 6
      );
      c.restore();
    }
  });
})();

/* ==========================================================================
 * 32. 立体图（斜二测投影 · 遮挡的棱用虚线）
 * ========================================================================== */
(function () {
  var PB3 = window.PhysBoard;
  if (!PB3 || !PB3.shapes) return;

  var shape3 = function (d) {
    if (!d || !d.key) return;
    if (typeof PB3.register === 'function') PB3.register(d);
    else PB3.shapes[d.key] = d;
  };

  /* ---- 分类 ---- */
  PB3.categories = PB3.categories || [];
  var hasSolid = false;
  for (var ci = 0; ci < PB3.categories.length; ci++) {
    if (PB3.categories[ci].id === 'solid') { hasSolid = true; break; }
  }
  if (!hasSolid) {
    if (typeof PB3.category === 'function') PB3.category('solid', '立体图');
    else PB3.categories.push({ id: 'solid', label: '立体图' });
  }

  /* ---- 参数 ---- */
  var pd = PB3.paramDefs = PB3.paramDefs || {};
  if (!pd.sdFlat)  pd.sdFlat  = { label: '椭圆扁平',   min: 0.12, max: 0.50, step: 0.02, def: 0.28 };
  if (!pd.sdDepth) pd.sdDepth = { label: '深度比例',   min: 0.10, max: 0.60, step: 0.02, def: 0.33 };
  if (!pd.sdCube)  pd.sdCube  = { label: '正方体吸附', type: 'toggle', def: true };
  if (!pd.sdTaper) pd.sdTaper = { label: '顶面半径比', min: 0.15, max: 0.90, step: 0.05, def: 0.50 };

  /* ---- 小工具 ---- */
  function clamp(v, lo, hi, dflt) {
    var n = (v == null || isNaN(v)) ? dflt : Number(v);
    return Math.max(lo, Math.min(hi, n));
  }
  function withA(color, a) {
    var h = String(color == null ? '#1a1a1a' : color).replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(0,0,0,' + a + ')';
    return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')';
  }
  function lineTo2(c, p, q) {
    c.beginPath();
    c.moveTo(p.x, p.y);
    c.lineTo(q.x, q.y);
    c.stroke();
  }
  function pathPoly(c, pts) {
    c.beginPath();
    for (var i = 0; i < pts.length; i++) {
      if (i === 0) c.moveTo(pts[i].x, pts[i].y);
      else c.lineTo(pts[i].x, pts[i].y);
    }
    c.closePath();
  }
  function fillPoly(c, pts, color, a) {
    pathPoly(c, pts);
    c.fillStyle = withA(color, a);
    c.fill();
  }
  function dashOn(c, lw) {
    c.setLineDash([Math.max(3, lw * 2.1), Math.max(3, lw * 1.7)]);
  }
  function dashOff(c) { c.setLineDash([]); }

  function beginSolid(c, o) {
    var lw = Math.max(1, o.size || 4);
    c.save();
    c.lineWidth = lw;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.setLineDash([]);
    c.strokeStyle = (o.hasBorder === false) ? 'rgba(0,0,0,0)' : (o.color || '#1a1a1a');
    return lw;
  }
  function endSolid(c) { c.restore(); }

  /* 立体长方体：8 个顶点 */
  function boxParts(b, ratio) {
    var m = Math.min(b.w, b.h);
    var d = Math.min(m * ratio, b.w * 0.55, b.h * 0.55);
    var bw = Math.max(2, b.w - d), bh = Math.max(2, b.h - d);
    var X = b.x1, Y = b.y2;
    return {
      d: d, bw: bw, bh: bh,
      FL : { x: X,          y: Y          },
      FR : { x: X + bw,     y: Y          },
      BR : { x: X + bw + d, y: Y - d      },
      BL : { x: X + d,      y: Y - d      },
      FTL: { x: X,          y: Y - bh     },
      FTR: { x: X + bw,     y: Y - bh     },
      BTR: { x: X + bw + d, y: Y - bh - d },
      BTL: { x: X + d,      y: Y - bh - d }
    };
  }

  /* ====================== 1. 圆柱体 ====================== */
  shape3({
    key: 'solidCylinder', cat: 'solid', geom: 'box', label: '圆柱体', fill: true,
    icon: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.6"/>' +
          '<path d="M4.5 5.5v13M19.5 5.5v13"/>' +
          '<path d="M4.5 18.5a7.5 2.6 0 0 0 15 0"/>' +
          '<path d="M4.5 18.5a7.5 2.6 0 0 1 15 0" stroke-dasharray="2 2"/>',
    params: ['sdFlat'],
    draw: function (c, o, U) {
      var b = U.bbox(o);
      var lw = beginSolid(c, o);
      var col = c.strokeStyle;
      var fa = clamp(o.fillAlpha, 0, 1, 0.6);
      var flat = clamp(o.sdFlat, 0.12, 0.50, 0.28);

      var rx = Math.max(3, b.w / 2);
      var ry = Math.max(2, Math.min(rx * flat, b.h * 0.30));
      var cx = b.x1 + b.w / 2;
      var yT = b.y1 + ry;
      var yB = b.y2 - ry;
      if (yB - yT < 2) { endSolid(c); return; }

      if (o.fill && o.fillColor) {
        c.save();
        c.fillStyle = withA(o.fillColor, fa * 0.72);
        c.beginPath();
        c.moveTo(cx - rx, yT);
        c.lineTo(cx - rx, yB);
        c.ellipse(cx, yB, rx, ry, 0, Math.PI, 0, true);
        c.lineTo(cx + rx, yT);
        c.closePath();
        c.fill();
        c.beginPath();
        c.ellipse(cx, yT, rx, ry, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      if (col !== 'rgba(0,0,0,0)') {
        dashOn(c, lw);
        c.beginPath();
        c.ellipse(cx, yB, rx, ry, 0, 0, Math.PI, true);
        c.stroke();
        dashOff(c);

        c.beginPath();
        c.ellipse(cx, yB, rx, ry, 0, Math.PI, 0, true);
        c.stroke();

        lineTo2(c, { x: cx - rx, y: yT }, { x: cx - rx, y: yB });
        lineTo2(c, { x: cx + rx, y: yT }, { x: cx + rx, y: yB });

        c.beginPath();
        c.ellipse(cx, yT, rx, ry, 0, 0, Math.PI * 2);
        c.stroke();
      }
      endSolid(c);
    }
  });

  /* ====================== 2. 长方体（正方体自动吸附） ====================== */
  shape3({
    key: 'solidBox', cat: 'solid', geom: 'box', label: '长方体', fill: true,
    icon: '<path d="M3 8h11v11H3z"/>' +
          '<path d="M3 8l5-4h11l-5 4"/>' +
          '<path d="M14 8l5-4v11l-5 4"/>' +
          '<path d="M3 19l5-4" stroke-dasharray="2 2"/>',
    params: ['sdDepth', 'sdCube'],
    draw: function (c, o, U) {
      /* 正方体吸附：包围盒接近正方形时自动修正 */
      if (o.sdCube) {
        var w0 = Math.abs(o.x2 - o.x1);
        var h0 = Math.abs(o.y2 - o.y1);
        var mn = Math.min(w0, h0);
        if (mn > 2 && Math.abs(w0 - h0) < mn * 0.22) {
          var side = (w0 + h0) / 2;
          o.x2 = o.x1 + (o.x2 >= o.x1 ? side : -side);
          o.y2 = o.y1 + (o.y2 >= o.y1 ? side : -side);
        }
      }

      var b = U.bbox(o);
      var lw = beginSolid(c, o);
      var col = c.strokeStyle;
      var fa = clamp(o.fillAlpha, 0, 1, 0.6);
      var ratio = clamp(o.sdDepth, 0.10, 0.60, 0.33);
      var P = boxParts(b, ratio);

      if (o.fill && o.fillColor) {
        fillPoly(c, [P.FL, P.FR, P.FTR, P.FTL], o.fillColor, fa);
        fillPoly(c, [P.FTL, P.FTR, P.BTR, P.BTL], o.fillColor, fa * 0.76);
        fillPoly(c, [P.FR, P.BR, P.BTR, P.FTR], o.fillColor, fa * 0.52);
      }

      if (col !== 'rgba(0,0,0,0)') {
        dashOn(c, lw);
        lineTo2(c, P.BL, P.BR);
        lineTo2(c, P.BL, P.BTL);
        lineTo2(c, P.BL, P.FL);
        dashOff(c);

        pathPoly(c, [P.FL, P.FR, P.FTR, P.FTL]); c.stroke();
        pathPoly(c, [P.FTL, P.FTR, P.BTR, P.BTL]); c.stroke();
        lineTo2(c, P.FR, P.BR);
        lineTo2(c, P.BR, P.BTR);
        lineTo2(c, P.FTR, P.BTR);
      }
      endSolid(c);
    }
  });

  /* ====================== 3. 球体 ====================== */
  shape3({
    key: 'solidSphere', cat: 'solid', geom: 'box', label: '球体', fill: true,
    icon: '<circle cx="12" cy="12" r="8.5"/>' +
          '<ellipse cx="12" cy="12" rx="8.5" ry="3.2"/>' +
          '<path d="M3.5 12a8.5 3.2 0 0 0 17 0" stroke-dasharray="2 2"/>',
    params: ['sdFlat'],
    draw: function (c, o, U) {
      var b = U.bbox(o);
      var lw = beginSolid(c, o);
      var col = c.strokeStyle;
      var fa = clamp(o.fillAlpha, 0, 1, 0.6);
      var flat = clamp(o.sdFlat, 0.12, 0.50, 0.28);

      var R = Math.max(4, Math.min(b.w, b.h) / 2);
      var cx = (b.x1 + b.x2) / 2;
      var cy = (b.y1 + b.y2) / 2;
      var ry = Math.max(2, R * flat);

      if (o.fill && o.fillColor) {
        c.beginPath();
        c.arc(cx, cy, R, 0, Math.PI * 2);
        c.fillStyle = withA(o.fillColor, fa * 0.72);
        c.fill();
      }

      if (col !== 'rgba(0,0,0,0)') {
        dashOn(c, lw);
        c.beginPath();
        c.ellipse(cx, cy, R, ry, 0, 0, Math.PI, true);
        c.stroke();
        dashOff(c);

        c.beginPath();
        c.ellipse(cx, cy, R, ry, 0, Math.PI, 0, true);
        c.stroke();

        c.beginPath();
        c.arc(cx, cy, R, 0, Math.PI * 2);
        c.stroke();
      }
      endSolid(c);
    }
  });

  /* ====================== 4. 圆锥 ====================== */
  shape3({
    key: 'solidCone', cat: 'solid', geom: 'box', label: '圆锥', fill: true,
    icon: '<path d="M12 3.5L4 18.5h16z"/>' +
          '<path d="M4 18.5a8 2.6 0 0 0 16 0"/>' +
          '<path d="M4 18.5a8 2.6 0 0 1 16 0" stroke-dasharray="2 2"/>',
    params: ['sdFlat'],
    draw: function (c, o, U) {
      var b = U.bbox(o);
      var lw = beginSolid(c, o);
      var col = c.strokeStyle;
      var fa = clamp(o.fillAlpha, 0, 1, 0.6);
      var flat = clamp(o.sdFlat, 0.12, 0.50, 0.28);

      var rx = Math.max(3, b.w / 2);
      var ry = Math.max(2, Math.min(rx * flat, b.h * 0.32));
      var cx = b.x1 + b.w / 2;
      var yB = b.y2 - ry;
      var ay = b.y1;
      if (yB - ay < 3) { endSolid(c); return; }

      if (o.fill && o.fillColor) {
        c.beginPath();
        c.moveTo(cx, ay);
        c.lineTo(cx - rx, yB);
        c.ellipse(cx, yB, rx, ry, 0, Math.PI, 0, true);
        c.closePath();
        c.fillStyle = withA(o.fillColor, fa * 0.70);
        c.fill();
      }

      if (col !== 'rgba(0,0,0,0)') {
        dashOn(c, lw);
        c.beginPath();
        c.ellipse(cx, yB, rx, ry, 0, 0, Math.PI, true);
        c.stroke();
        dashOff(c);

        c.beginPath();
        c.ellipse(cx, yB, rx, ry, 0, Math.PI, 0, true);
        c.stroke();

        lineTo2(c, { x: cx, y: ay }, { x: cx - rx, y: yB });
        lineTo2(c, { x: cx, y: ay }, { x: cx + rx, y: yB });
      }
      endSolid(c);
    }
  });

  /* ====================== 5. 三棱柱 ====================== */
  shape3({
    key: 'solidPrism3', cat: 'solid', geom: 'box', label: '三棱柱', fill: true,
    icon: '<path d="M12 3L3 8l9 5 9-5z"/>' +
          '<path d="M3 8v9l9 5 9-5V8"/>' +
          '<path d="M12 13v9"/>',
    draw: function (c, o, U) {
      var b = U.bbox(o);
      var lw = beginSolid(c, o);
      var col = c.strokeStyle;
      var fa = clamp(o.fillAlpha, 0, 1, 0.6);

      var cx = b.x1 + b.w / 2;
      var a = Math.max(5, b.w / 2);
      var th = a * 0.52;
      var H = b.h - th;
      if (H < 5) { endSolid(c); return; }
      var yB = b.y2;

      var A1 = { x: cx,     y: yB      };
      var A2 = { x: cx - a, y: yB - th };
      var A3 = { x: cx + a, y: yB - th };
      var B1 = { x: A1.x, y: A1.y - H };
      var B2 = { x: A2.x, y: A2.y - H };
      var B3 = { x: A3.x, y: A3.y - H };

      if (o.fill && o.fillColor) {
        fillPoly(c, [A1, A2, B2, B1], o.fillColor, fa * 0.85);
        fillPoly(c, [A1, A3, B3, B1], o.fillColor, fa * 0.58);
        fillPoly(c, [B1, B2, B3],      o.fillColor, fa);
      }

      if (col !== 'rgba(0,0,0,0)') {
        dashOn(c, lw);
        lineTo2(c, A2, A3);
        dashOff(c);

        pathPoly(c, [B1, B2, B3]); c.stroke();
        lineTo2(c, A1, A2);
        lineTo2(c, A1, A3);
        lineTo2(c, A1, B1);
        lineTo2(c, A2, B2);
        lineTo2(c, A3, B3);
      }
      endSolid(c);
    }
  });

    /* ====================== 6. 半圆柱 ====================== */
  shape3({
    key: 'solidHalfCyl', cat: 'solid', geom: 'box', label: '半圆柱', fill: true,
    icon: '<path d="M3 17a9 9 0 0 1 18 0z"/>' +
          '<path d="M7 13a9 9 0 0 1 10 0"/>' +
          '<path d="M3 17l4-4M21 17l-4-4"/>',
    params: ['sdDepth'],
    draw: function (c, o, U) {
      var b = U.bbox(o);
      var lw = beginSolid(c, o);
      var col = c.strokeStyle;
      var fa = clamp(o.fillAlpha, 0, 1, 0.6);
      var ratio = clamp(o.sdDepth, 0.10, 0.60, 0.30);

      var m = Math.min(b.w, b.h);
      var d = m * ratio;
      var r = Math.min((b.w - d) / 2, b.h - d);
      if (r < 4) { endSolid(c); return; }

      var cx = b.x1 + r;
      var yB = b.y2;

      var A1 = { x: cx - r,      y: yB     };  // 前面半圆 · 左端
      var A2 = { x: cx + r,      y: yB     };  // 前面半圆 · 右端
      var B1 = { x: A1.x + d,    y: yB - d };  // 后面半圆 · 左端
      var B2 = { x: A2.x + d,    y: yB - d };  // 后面半圆 · 右端
      var cF = { x: cx,          y: yB     };  // 前面半圆 · 圆心
      var cB = { x: cx + d,      y: yB - d };  // 后面半圆 · 圆心

      /* 两条半圆弧的公切线切点：
       *   平移方向 (d, -d) 与半径方向垂直 → 切点角度 = 5π/4（左上方）
       *   这是半圆弧上唯一的公切点（45° 那个切点在半圆之外） */
      var TS = Math.PI * 1.25;
      var cts = Math.cos(TS), sts = Math.sin(TS);
      var P1 = { x: cF.x + r * cts, y: cF.y + r * sts };
      var P2 = { x: cB.x + r * cts, y: cB.y + r * sts };

      if (o.fill && o.fillColor) {
        c.save();
        c.fillStyle = withA(o.fillColor, fa * 0.72);
        c.beginPath();
        c.moveTo(A1.x, A1.y);
        c.ellipse(cF.x, cF.y, r, r, 0, Math.PI, Math.PI * 2, false);
        c.lineTo(B2.x, B2.y);
        c.ellipse(cB.x, cB.y, r, r, 0, 0, Math.PI, true);
        c.closePath();
        c.fill();
        c.restore();
      }

      if (col !== 'rgba(0,0,0,0)') {
        /* ---- 被遮挡部分：虚线 ---- */
        dashOn(c, lw);
        /* 后面底边 */
        lineTo2(c, B1, B2);
        /* 后面半圆弧 · 左半段（B1 → P2，被前面实体挡住） */
        c.beginPath();
        c.ellipse(cB.x, cB.y, r, r, 0, Math.PI, TS, false);
        c.stroke();
        dashOff(c);

        /* ---- 可见部分：实线 ---- */
        /* 后面半圆弧 · 右半段（P2 → B2，露在外面） */
        c.beginPath();
        c.ellipse(cB.x, cB.y, r, r, 0, TS, Math.PI * 2, false);
        c.stroke();

        /* 前面半圆弧（完整可见） */
        c.beginPath();
        c.ellipse(cF.x, cF.y, r, r, 0, Math.PI, Math.PI * 2, false);
        c.stroke();

        /* 前面底边 */
        lineTo2(c, A1, A2);

        /* 左右两条棱 */
        /* 左棱 A1-B1：与后弧一起被遮挡 → 虚线 */
        dashOn(c, lw);
        lineTo2(c, A1, B1);
        dashOff(c);

        /* 右棱 A2-B2：可见 → 实线 */
        lineTo2(c, A2, B2);

        /* 前后半圆弧的公切线 */
        lineTo2(c, P1, P2);
      }
      endSolid(c);
    }
  });


  /* ====================== 7. 斜面体（直角三棱柱） ====================== */
  shape3({
    key: 'solidWedge', cat: 'solid', geom: 'box', label: '斜面体', fill: true,
    icon: '<path d="M3 20V8l16 12z"/>' +
          '<path d="M7 16V4l16 12"/>' +
          '<path d="M3 8l4-4M19 20l4-4"/>',
    params: ['sdDepth'],
    draw: function (c, o, U) {
      var b = U.bbox(o);
      var lw = beginSolid(c, o);
      var col = c.strokeStyle;
      var fa = clamp(o.fillAlpha, 0, 1, 0.6);
      var ratio = clamp(o.sdDepth, 0.10, 0.60, 0.33);

      var m = Math.min(b.w, b.h);
      var d = Math.min(m * ratio, b.w * 0.45, b.h * 0.45);
      var bw = b.w - d, bh = b.h - d;
      var X = b.x1, Y = b.y2;

      var A  = { x: X,         y: Y        };
      var B  = { x: X + bw,    y: Y        };
      var C  = { x: X,         y: Y - bh   };
      var A2 = { x: A.x + d,   y: A.y - d  };
      var B2 = { x: B.x + d,   y: B.y - d  };
      var C2 = { x: C.x + d,   y: C.y - d  };

      if (o.fill && o.fillColor) {
        fillPoly(c, [A, C, C2, A2], o.fillColor, fa * 0.85);
        fillPoly(c, [B, C, C2, B2], o.fillColor, fa * 0.62);
        fillPoly(c, [A, B, C],      o.fillColor, fa);
      }

      if (col !== 'rgba(0,0,0,0)') {
        dashOn(c, lw);
        lineTo2(c, A2, B2);
        dashOff(c);

        pathPoly(c, [A, B, C]); c.stroke();
        lineTo2(c, A, A2);
        lineTo2(c, C, C2);
        lineTo2(c, A2, C2);
        lineTo2(c, B, B2);
        lineTo2(c, B2, C2);
      }
      endSolid(c);
    }
  });

  /* ====================== 8. 平行板电容器 ====================== */
  shape3({
    key: 'solidCapacitor', cat: 'solid', geom: 'box', label: '平行板电容器', fill: true,
    icon: '<path d="M3 8h13l5-4H8z"/>' +
          '<path d="M3 17h13l5-4H8z"/>' +
          '<path d="M3 8v9M16 8v9M21 4v9"/>',
    params: ['sdDepth'],
    draw: function (c, o, U) {
      var b = U.bbox(o);
      var lw = beginSolid(c, o);
      var col = c.strokeStyle;
      var fa = clamp(o.fillAlpha, 0, 1, 0.6);
      var ratio = clamp(o.sdDepth, 0.10, 0.60, 0.30);

      var m = Math.min(b.w, b.h);
      var d = Math.min(m * ratio, b.h * 0.70, b.w * 0.50);
      var L = b.w - d;
      var gap = b.h - d;
      if (L < 6 || gap < 2) { endSolid(c); return; }

      var X = b.x1;
      var Yt = b.y1 + d;
      var Yb = Yt + gap;

      var U1 = { x: X,           y: Yt     };
      var U2 = { x: X + L,       y: Yt     };
      var U3 = { x: X + L + d,   y: Yt - d };
      var U4 = { x: X + d,       y: Yt - d };
      var D1 = { x: X,           y: Yb     };
      var D2 = { x: X + L,       y: Yb     };
      var D3 = { x: X + L + d,   y: Yb - d };
      var D4 = { x: X + d,       y: Yb - d };

      if (o.fill && o.fillColor) {
        fillPoly(c, [D1, D2, D3, D4], o.fillColor, fa * 0.45);
        fillPoly(c, [U1, U2, U3, U4], o.fillColor, fa);
      }

      if (col !== 'rgba(0,0,0,0)') {
        var partial = gap < d;
        dashOn(c, lw);
        lineTo2(c, D4, D3);
        if (partial) {
          lineTo2(c, D4, { x: D1.x + gap, y: Yt });
          lineTo2(c, D3, { x: D2.x + gap, y: Yt });
        }
        dashOff(c);

        lineTo2(c, D1, D2);
        lineTo2(c, D1, partial ? { x: D1.x + gap, y: Yt } : D4);
        lineTo2(c, D2, partial ? { x: D2.x + gap, y: Yt } : D3);

        pathPoly(c, [U1, U2, U3, U4]); c.stroke();
      }
      endSolid(c);
    }
  });

  /* ====================== 9. 圆台 ====================== */
  shape3({
    key: 'solidFrustum', cat: 'solid', geom: 'box', label: '圆台', fill: true,
    icon: '<ellipse cx="12" cy="5" rx="5" ry="2"/>' +
          '<ellipse cx="12" cy="19" rx="9" ry="3"/>' +
          '<path d="M7 5l-4 14M17 5l4 14"/>',
    params: ['sdFlat', 'sdTaper'],
    draw: function (c, o, U) {
      var b = U.bbox(o);
      var lw = beginSolid(c, o);
      var col = c.strokeStyle;
      var fa = clamp(o.fillAlpha, 0, 1, 0.6);
      var flat  = clamp(o.sdFlat,  0.12, 0.50, 0.28);
      var taper = clamp(o.sdTaper, 0.15, 0.90, 0.50);

      var rx1 = Math.max(3, b.w / 2);
      var ry1 = Math.max(2, Math.min(rx1 * flat, b.h * 0.26));
      var cx  = b.x1 + b.w / 2;
      var yB  = b.y2 - ry1;
      var rx2 = rx1 * taper;
      var ry2 = Math.max(1.5, ry1 * taper);
      var yT  = b.y1 + ry2;
      if (yB - yT < 3) { endSolid(c); return; }

      if (o.fill && o.fillColor) {
        c.save();
        c.fillStyle = withA(o.fillColor, fa * 0.72);
        c.beginPath();
        c.moveTo(cx - rx1, yB);
        c.lineTo(cx - rx2, yT);
        c.ellipse(cx, yT, rx2, ry2, 0, Math.PI, 0, true);
        c.lineTo(cx + rx1, yB);
        c.ellipse(cx, yB, rx1, ry1, 0, 0, Math.PI, true);
        c.closePath();
        c.fill();
        c.beginPath();
        c.ellipse(cx, yT, rx2, ry2, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      if (col !== 'rgba(0,0,0,0)') {
        dashOn(c, lw);
        c.beginPath();
        c.ellipse(cx, yB, rx1, ry1, 0, 0, Math.PI, true);
        c.stroke();
        dashOff(c);

        c.beginPath();
        c.ellipse(cx, yB, rx1, ry1, 0, Math.PI, 0, true);
        c.stroke();

        lineTo2(c, { x: cx - rx1, y: yB }, { x: cx - rx2, y: yT });
        lineTo2(c, { x: cx + rx1, y: yB }, { x: cx + rx2, y: yT });

        c.beginPath();
        c.ellipse(cx, yT, rx2, ry2, 0, 0, Math.PI * 2);
        c.stroke();
      }
      endSolid(c);
    }
  });

})();



})();