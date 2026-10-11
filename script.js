function drawCircularArrow(context, x, y, radius, startAngleDeg, endAngleDeg, color = '#3498db', counterclockwise = false) {
  const startAngle = startAngleDeg * (Math.PI / 180);
  const endAngle = endAngleDeg * (Math.PI / 180);

  context.save();

  context.beginPath();
  context.arc(x, y, radius, startAngle, endAngle, counterclockwise);
  context.lineWidth = 4;
  context.strokeStyle = color;
  context.stroke();

  const tipX = x + radius * Math.cos(endAngle);
  const tipY = y + radius * Math.sin(endAngle);

  //Draw and rotate the arrowhead correctly based on direction very important 
  context.translate(tipX, tipY);
  
  if (counterclockwise) {
    // Flip the rotation 180
    context.rotate(endAngle + Math.PI);
  } else {
    context.rotate(endAngle);
  }

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(-8, -12);
  context.lineTo(8, -12);
  context.closePath();
  context.fillStyle = color;
  context.fill();
  context.restore();
}

function arcPath(cx, cy, radius, startDeg, endDeg, counterclockwise = false) {
  const a0 = startDeg * (Math.PI / 180);
  const a1 = endDeg * (Math.PI / 180);
  let span = a1 - a0;
  if (counterclockwise) {
    while (span > 0) span -= Math.PI * 2;
  } else {
    while (span < 0) span += Math.PI * 2;
  }

  return {
    length: Math.abs(span) * radius,
    at(u) {
      const t = Math.min(Math.max(u, 0), 1);
      const a = a0 + span * t;
      return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
    },
  };
}

function drawText(context, text, x, y, font = '16px Arial', color = '#ffffff') {
  context.save();
  context.font = font;
  context.fillStyle = color;
  context.fillText(text, x, y);
  context.restore();
}

function drawCircle(context, x, y, radius, fillColor = '#3498db', strokeColor = '#2980b9', lineWidth = 2) {
  context.save();
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  
  if (fillColor) {
    context.fillStyle = fillColor;
    context.fill();
  }
  
  if (strokeColor && lineWidth > 0) {
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeColor;
    context.stroke();
  }
  
  context.restore();
}

function drawExchangeArrow(context, xTail, xHead, y, bulge, color) {
  const controlX = (xTail + xHead) / 2;
  const controlY = y + bulge;

  context.save();
  context.beginPath();
  context.moveTo(xTail, y);
  context.quadraticCurveTo(controlX, controlY, xHead, y);
  context.lineWidth = 4;
  context.lineCap = 'round';
  context.strokeStyle = color;
  context.stroke();

  // A quadratic curve! math is somtimes usefull
  context.translate(xHead, y);
  context.rotate(Math.atan2(y - controlY, xHead - controlX));
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(-16, -9);
  context.lineTo(-16, 9);
  context.closePath();
  context.fillStyle = color;
  context.fill();
  context.restore();
}

function drawLabelBox(context, text, x, y, fill, textColor) {
  context.save();
  context.font = '18px Arial';
  const w = context.measureText(text).width + 26;
  const h = 34;
  const left = x - w / 2;
  const top = y - h / 2;
  const r = 8;

  context.beginPath();
  context.moveTo(left + r, top);
  context.lineTo(left + w - r, top);
  context.quadraticCurveTo(left + w, top, left + w, top + r);
  context.lineTo(left + w, top + h - r);
  context.quadraticCurveTo(left + w, top + h, left + w - r, top + h);
  context.lineTo(left + r, top + h);
  context.quadraticCurveTo(left, top + h, left, top + h - r);
  context.lineTo(left, top + r);
  context.quadraticCurveTo(left, top, left + r, top);
  context.closePath();
  context.fillStyle = fill;
  context.fill();

  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, x, y + 1);
  context.restore();
}

function drawLabelBoxRightAligned(context, text, rightX, y, fill, textColor) {
  context.save();
  context.font = '18px Arial';
  const w = context.measureText(text).width + 26;
  context.restore();
  drawLabelBox(context, text, rightX - w / 2, y, fill, textColor);
}

// Sped
const CYCLE_MS = 2900;

const kelvinCanvas = document.getElementById('kelvinCanvas');
const kelvinCtx = kelvinCanvas.getContext('2d');

const CO2_PATH = {
  cx: 1100, 
  cy: 200,
  radius: 150,
  startDeg: 180,
  endDeg: 90,
  durationMs: CYCLE_MS,
};
let co2Progress = 0; // 0 -> 1 along the arc
let co2Pos = { x: CO2_PATH.cx - CO2_PATH.radius, y: CO2_PATH.cy - 25 };

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function updateCO2(deltaMs) {
  co2Progress += deltaMs / CO2_PATH.durationMs;
  if (co2Progress >= 1) co2Progress -= 1; // loop back to the start of the arrow
  const t = easeInOut(co2Progress);
  const angle = (CO2_PATH.startDeg + (CO2_PATH.endDeg - CO2_PATH.startDeg) * t) * (Math.PI / 180);
  co2Pos.x = CO2_PATH.cx + CO2_PATH.radius * Math.cos(angle);
  co2Pos.y = CO2_PATH.cy + CO2_PATH.radius * Math.sin(angle) - 25; // keep the molecule body centred on the arc
}

const G3P_ART = {
  atoms: [
    { dx: 0,  color: '#e40e0e' },  // carbon
    { dx: 25, color: '#e40e0e' },  // carbon
    { dx: 50, color: '#e40e0e' },  // carbon
    { dx: 75, color: '#c2eb0d' },  // phosphorus
  ],
};

const RUBP_ART = {
  atoms: [
    { dx: -75, color: '#c2eb0d' },  // phosphorus
    { dx: -50, color: '#e40e0e' },  // carbon
    { dx: -25, color: '#e40e0e' },  // carbon
    { dx: 0,   color: '#e40e0e' },  // carbon
    { dx: 25,  color: '#e40e0e' },  // carbon
    { dx: 50,  color: '#e40e0e' },  // carbon
    { dx: 75,  color: '#c2eb0d' },  // phosphorus
  ],
};

const INTERMEDIATE_ART = {
  atoms: [
    { dx: -75, color: '#c2eb0d' },  // phosphorus
    { dx: -55, color: '#e40e0e' },  // carbon
    { dx: -35, color: '#e40e0e' },  // carbon
    { dx: -15, color: '#e40e0e' },  // carbon
    { dx: 15,  color: '#e40e0e' },  // carbon
    { dx: 35,  color: '#e40e0e' },  // carbon
    { dx: 55,  color: '#e40e0e' },  // carbon
    { dx: 75,  color: '#c2eb0d' },  // phosphorus
  ],
};

function makeArtMolecule(cx, cy, radius, startDeg, endDeg, counterclockwise, art, opts = {}) {
  const curve = arcPath(cx, cy, radius, startDeg, endDeg, counterclockwise);
  const offsets = art.atoms.map((atom) => atom.dx);

  const centre = (Math.min(...offsets) + Math.max(...offsets)) / 2;
  return {
    curve,
    art,
    centreOffset: opts.centreOffset === undefined ? centre : opts.centreOffset,
    durationMs: opts.durationMs === undefined ? CYCLE_MS : opts.durationMs,
    progress: opts.progress === undefined ? 0 : opts.progress,
    pos: curve.at(0),
  };
}

function updateArtMolecule(m, deltaMs) {
  m.progress += deltaMs / m.durationMs;
  if (m.progress >= 1) m.progress -= 1; // loop back to the start of the arrow
  m.pos = m.curve.at(easeInOut(m.progress));
}

function drawArtMolecule(m) {
  for (const atom of m.art.atoms) {
    drawCircle(kelvinCtx, m.pos.x + atom.dx - m.centreOffset, m.pos.y, 10, atom.color, atom.color, 3);
  }
}

function updateArtMolecules(deltaMs) {
  for (const m of artMolecules) updateArtMolecule(m, deltaMs);
}

function drawArtMolecules() {
  for (const m of artMolecules) drawArtMolecule(m);
}

const FLOW = {
  travelMs: CYCLE_MS,
  restMs: 0,
  fadeFraction: 0.2,
  trailDots: 3,
  trailGap: 15,
};

function makeFlow(cx, cy, radius, startDeg, endDeg, counterclockwise, opts = {}) {
  const path = arcPath(cx, cy, radius, startDeg, endDeg, counterclockwise);
  const count = opts.count === undefined ? 2 : opts.count;
  const period = FLOW.travelMs + FLOW.restMs;
  const molecules = [];
  for (let i = 0; i < count; i++) {
    molecules.push({
      path,
      color: opts.color || '#f1c40f',
      radius: opts.radius || 9,
      label: opts.label || null,
      progress: 0,
      waitMs: (period * i) / count, 
      travelMs: FLOW.travelMs,
      restMs: FLOW.restMs,
    });
  }
  return molecules;
}

const calvinFlow = [];

const artMolecules = [
  makeArtMolecule(1000, 800, 400, 180, 270, false, RUBP_ART),
  makeArtMolecule(1150, 825, 500, 40, 80, false, G3P_ART),
  makeArtMolecule(1000, 1150, 200, 80, 150, false, G3P_ART),
  makeArtMolecule(1200, 850, 500, 270, 340, false, INTERMEDIATE_ART),
  makeArtMolecule(1200, 760, 500, 0, 40, false, INTERMEDIATE_ART),
  makeArtMolecule(950, 1000, 300, 150, 180, false, G3P_ART),
  makeArtMolecule(1300, 1400, 150, 180, 90, true, G3P_ART),
];

const exchangeShuttles = [
  // Right-hand side (Stage 2, reduction).
  makeShuttle(1985, 1810, 830, -45, '#f1c40f', '#22313a', 'ATP'),
  makeShuttle(1810, 1985, 912, 45, '#e67e22', '#ffffff', 'ADP'),
  makeShuttle(1992, 1832, 1130, -45, '#4cd137', '#0b2a06', 'NADPH'),
  makeShuttle(1832, 1992, 1212, 45, '#1e8449', '#ffffff', 'NADP+'),
  // Left-hand side (Stage 3, regeneration of RuBP).
  makeShuttle(570, 240, 1010, -45, '#e67e22', '#ffffff', 'ADP'),
  makeShuttle(240, 570, 1092, 45, '#f1c40f', '#22313a', 'ATP'),
];

function updateFlow(m, deltaMs) {
  if (m.waitMs > 0) {
    m.waitMs -= deltaMs;
    return;
  }
  m.progress += deltaMs / m.travelMs;
  if (m.progress >= 1) {
    m.progress -= 1;
    m.waitMs = m.restMs;
  }
}

function updateCalvinFlow(deltaMs) {
  for (const m of calvinFlow) updateFlow(m, deltaMs);
}

function flowAlpha(m) {
  const f = FLOW.fadeFraction;
  if (m.progress < f) return m.progress / f;
  if (m.progress > 1 - f) return (1 - m.progress) / f;
  return 1;
}

function dotWithHalo(context, pos, radius, color, alpha) {
  if (alpha <= 0.01 || radius <= 0) return;
  context.save();
  context.fillStyle = color;
  context.globalAlpha = alpha * 0.3;
  context.beginPath();
  context.arc(pos.x, pos.y, radius * 2.1, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = alpha;
  context.beginPath();
  context.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawFlowMolecule(context, m) {
  const alpha = flowAlpha(m);
  if (alpha <= 0.01) return;
  const du = FLOW.trailGap / m.path.length;
  for (let k = FLOW.trailDots; k >= 1; k--) {
    const p = m.path.at(m.progress - du * k);
    dotWithHalo(context, p, m.radius * (1 - k * 0.16), m.color, alpha * (0.34 / k));
  }

  const pos = m.path.at(m.progress);
  dotWithHalo(context, pos, m.radius, m.color, alpha);

  if (m.label) {
    context.save();
    context.globalAlpha = alpha;
    context.font = 'bold 20px Arial';
    context.fillStyle = m.color;
    context.fillText(m.label, pos.x + 18, pos.y + 6);
    context.restore();
  }
}

function exchangeArrowPath(xTail, xHead, y, bulge) {
  const ctrlX = (xTail + xHead) / 2;
  const ctrlY = y + bulge;
  const steps = 40;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    pts.push({
      x: mt * mt * xTail + 2 * mt * t * ctrlX + t * t * xHead,
      y: mt * mt * y + 2 * mt * t * ctrlY + t * t * y,
    });
  }
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  const total = cum[cum.length - 1];

  return {
    length: total,
    at(u) {
      const d = Math.min(Math.max(u, 0), 1) * total;
      let i = 1;
      while (i < cum.length - 1 && cum[i] < d) i++;
      const span = cum[i] - cum[i - 1] || 1;
      const f = (d - cum[i - 1]) / span;
      return {
        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f,
        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f,
      };
    },
  };
}

function makeShuttle(xTail, xHead, y, bulge, color, textColor, label, opts = {}) {
  return {
    path: exchangeArrowPath(xTail, xHead, y, bulge),
    color,
    textColor,
    label,
    progress: opts.progress === undefined ? 0 : opts.progress,
    travelMs: opts.travelMs === undefined ? FLOW.travelMs : opts.travelMs,
    restMs: opts.restMs === undefined ? FLOW.restMs : opts.restMs,
    waitMs: opts.waitMs === undefined ? 0 : opts.waitMs,
  };
}

function updateShuttles(deltaMs) {
  for (const s of exchangeShuttles) updateFlow(s, deltaMs);
}

function drawShuttle(context, s) {
  const alpha = flowAlpha(s);
  if (alpha <= 0.01) return;

  const du = 16 / s.path.length;
  for (let k = FLOW.trailDots; k >= 1; k--) {
    const p = s.path.at(s.progress - du * k);
    dotWithHalo(context, p, 5 * (1 - k * 0.16), s.color, alpha * (0.3 / k));
  }

  const pos = s.path.at(s.progress);
  context.save();
  context.globalAlpha = alpha;
  context.font = 'bold 14px Arial';
  const w = context.measureText(s.label).width + 16;
  const h = 24;
  const r = h / 2;
  const cx = Math.min(Math.max(pos.x, w / 2 + 4), kelvinCanvas.width - w / 2 - 4);
  const left = cx - w / 2;
  const top = pos.y - h / 2;

  context.beginPath();
  context.moveTo(left + r, top);
  context.lineTo(left + w - r, top);
  context.arc(left + w - r, top + r, r, -Math.PI / 2, Math.PI / 2);
  context.lineTo(left + r, top + h);
  context.arc(left + r, top + r, r, Math.PI / 2, (3 * Math.PI) / 2);
  context.closePath();
  context.fillStyle = s.color;
  context.fill();

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = s.textColor;
  context.fillText(s.label, cx, pos.y + 1);
  context.restore();
}

function drawShuttles() {
  for (const s of exchangeShuttles) drawShuttle(kelvinCtx, s);
}

function drawKelvinDemo() {
//(x, y, radius, startAngle, endAngle, color)
drawCircularArrow(kelvinCtx, 1200, 850, 500, 270, 340, '#3498db');
drawCircularArrow(kelvinCtx, 1200, 760, 500, 0, 40, '#3498db');
drawCircularArrow(kelvinCtx, 1150, 825, 500, 40, 80, '#3498db');
drawCircularArrow(kelvinCtx, 1150, 825, 500, 40, 80, '#3498db');
drawCircularArrow(kelvinCtx, 1000, 1150, 200, 80, 150, '#3498db');
drawCircularArrow(kelvinCtx, 950, 1000, 300, 150, 180, '#3498db');
drawCircularArrow(kelvinCtx, 1000, 800, 400, 180, 270, '#3498db');
drawCircularArrow(kelvinCtx, 1100, 200, 150, 180, 90, '#3498db', true);
drawCircularArrow(kelvinCtx, 1300, 1400, 150, 180, 90, '#3498db', true);

drawText(kelvinCtx, 'Unstable Intermediate', 1600, 725, '18px Arial', '#f1c40f');
drawText(kelvinCtx, '6(G3P)', 1550, 1125, '18px Arial', '#f1c40f');
drawText(kelvinCtx, '3(CO2)', 920, 170, '18px Arial', '#f1c40f');
drawText(kelvinCtx, '5(G3P) / 1(G3P)', 1090, 1340, '18px Arial', '#f1c40f');
drawText(kelvinCtx, '1(G3P)', 1325, 1550, '18px Arial', '#f1c40f');
drawText(kelvinCtx, '5(G3P)', 725, 1200, '18px Arial', '#f1c40f');
drawText(kelvinCtx, '3 RUBP', 600, 900, '18px Arial', '#f1c40f');
drawText(kelvinCtx, 'One Phosphorus Atom', 200, 210, '18px Arial', '#eeeeee');
drawText(kelvinCtx, 'One Oxogen Atom', 200, 160, '18px Arial', '#eeeeee');

drawCircle(kelvinCtx, co2Pos.x, co2Pos.y, 10, '#e40e0e', '#e40e0e', 3);
drawCircle(kelvinCtx, co2Pos.x + 25, co2Pos.y + 25, 10, '#0a0000', '#0a0000', 3);
drawCircle(kelvinCtx, co2Pos.x - 25, co2Pos.y + 25, 10, '#0a0000', '#0a0000', 3);
drawCircle(kelvinCtx, 150, 200, 10, '#c2eb0d', '#c2eb0d', 3);


drawExchangeArrow(kelvinCtx, 1985, 1810, 830, -45, '#f1c40f');
drawLabelBox(kelvinCtx, '6 ATP', 1898, 775, '#f7ef9a', '#22313a');
drawExchangeArrow(kelvinCtx, 1810, 1985, 912, 45, '#e67e22');
drawLabelBox(kelvinCtx, '6 ADP + 6 Pi', 1898, 967, '#e67e22', '#ffffff');

drawExchangeArrow(kelvinCtx, 1992, 1832, 1130, -45, '#4cd137');
drawLabelBoxRightAligned(kelvinCtx, '6 NADPH', 1992, 1075, '#4cd137', '#0b2a06');
drawExchangeArrow(kelvinCtx, 1832, 1992, 1212, 45, '#1e8449');
drawLabelBoxRightAligned(kelvinCtx, '6 NADP+ + 6 Pi', 1992, 1267, '#1e8449', '#ffffff');

drawExchangeArrow(kelvinCtx, 570, 240, 1010, -45, '#e67e22');
drawLabelBox(kelvinCtx, '3 ADP + 3 Pi', 200, 955, '#e67e22', '#ffffff');
drawExchangeArrow(kelvinCtx, 240, 570, 1092, 45, '#f1c40f');
drawLabelBox(kelvinCtx, '3 ATP', 200, 1147, '#f7ef9a', '#22313a');
//Needs to be made to look nicer but not terrible for now at least 
drawCircle(kelvinCtx, 150, 100, 10, '#e40e0e', '#e40e0e', 3);
drawText(kelvinCtx, 'One Carbon Atom', 200, 110, '18px Arial', '#eeeeee');
drawCircle(kelvinCtx, 150, 150, 10, '#0a0000', '#0a0000', 3);



// Each molecule is drawn wherever updateArtMolecule() last placed it along its arrow.
drawArtMolecules();
drawShuttles();
for (const m of calvinFlow) drawFlowMolecule(kelvinCtx, m);
}
drawKelvinDemo();

let lastFrameTime = 0;
function animate(now) {
  const deltaMs = lastFrameTime ? Math.min(now - lastFrameTime, 100) : 16;
  lastFrameTime = now;

  updateCO2(deltaMs);
  updateArtMolecules(deltaMs);
  updateCalvinFlow(deltaMs);
  updateShuttles(deltaMs);
  kelvinCtx.clearRect(0, 0, kelvinCanvas.width, kelvinCanvas.height);
  drawKelvinDemo();
  requestAnimationFrame(animate);
}

// Start the animation loop properly
requestAnimationFrame(animate);