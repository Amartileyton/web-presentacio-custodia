/**
 * APLICACIÓ WEB EXECUTIVA · PRESENTACIÓ TRIBUNAL PG-ME
 * Projecte: Millora de la Custòdia i Contencions a les ACD - Grup 3 (CGIA)
 * Arquitectura: Scrollytelling amb IntersectionObserver, Waypoint Rail & Diagrama ASME AS-IS en Canvas
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTS DEL DOM ---
  const sections = document.querySelectorAll('.story-section');
  const storyCards = document.querySelectorAll('.story-card');
  const stagePanels = document.querySelectorAll('.stage-panel');
  const waypointItems = document.querySelectorAll('.waypoint-item');
  const waypointFills = document.querySelectorAll('.waypoint-pill-fill');
  const railBtnUp = document.getElementById('rail-btn-up');
  const railBtnDown = document.getElementById('rail-btn-down');
  const mainHeader = document.getElementById('main-header');
  const floatingLogoPill = document.getElementById('floating-logo-pill');
  const currentStepIndicator = document.getElementById('current-step-label');

  // Mètriques de la Secció 2
  const metricVal1 = document.getElementById('metric-val-1');
  const metricBar1 = document.getElementById('metric-bar-1');
  const metricVal2 = document.getElementById('metric-val-2');
  const metricBar2 = document.getElementById('metric-bar-2');
  const metricVal3 = document.getElementById('metric-val-3');
  const metricBar3 = document.getElementById('metric-bar-3');
  const metricVal4 = document.getElementById('metric-val-4');
  const metricBar4 = document.getElementById('metric-bar-4');
  const triggerMetricsBtn = document.getElementById('trigger-metrics-btn');
  const metricsStatusBadge = document.getElementById('metrics-status-badge');
  let metricsState = 'asis'; // 'asis' (inicial) o 'tobe' (animat)
  let metricsAnimFrameId = null;

  // Canvas ASME de la Fase 2
  const asmeCanvas = document.getElementById('asmeCanvas');
  const asmeCtx = asmeCanvas ? asmeCanvas.getContext('2d') : null;
  const asmeStepBadge = document.getElementById('asme-step-badge');

  const ASME_WIDTH = 1520;
  const ASME_HEIGHT = 800;
  const ASME_SCALE = 2;

  if (asmeCanvas && asmeCtx) {
    asmeCanvas.width = ASME_WIDTH * ASME_SCALE;
    asmeCanvas.height = ASME_HEIGHT * ASME_SCALE;
    asmeCtx.scale(ASME_SCALE, ASME_SCALE);
  }

  let currentSectionIndex = 0;
  const totalSections = sections.length;

  // --- 1. HEADER RETRÀCTIL I FLOATING LOGO PILL AL FER SCROLL ---
  function handleHeaderScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > 40) {
      mainHeader?.classList.add('header-hidden');
      floatingLogoPill?.classList.add('pill-visible');
    } else {
      mainHeader?.classList.remove('header-hidden');
      floatingLogoPill?.classList.remove('pill-visible');
    }
  }

  // --- 2. GESTIÓ I ANIMACIÓ DELS 4 INDICADORS CLAU (AS-IS ➔ TO-BE) ---
  function setMetricsDisplay(ratio) {
    if (!metricVal1) return;
    const r = Math.min(1, Math.max(0, ratio));

    // Indicador 1: 40% -> 100%
    const v1 = Math.round(40 + (100 - 40) * r);
    metricVal1.textContent = `${v1}%`;
    if (metricBar1) metricBar1.style.width = `${v1}%`;

    // Indicador 2: 80% -> 100%
    const v2 = Math.round(80 + (100 - 80) * r);
    metricVal2.textContent = `${v2}%`;
    if (metricBar2) metricBar2.style.width = `${v2}%`;

    // Indicador 3: 13% -> 5%
    const v3 = (13 - (13 - 5) * r).toFixed(1);
    metricVal3.textContent = `${v3}%`;
    if (metricBar3) {
      const barW3 = Math.max(38.5, Math.round(100 - (r * 61.5)));
      metricBar3.style.width = `${barW3}%`;
    }

    // Indicador 4: 60% -> 15%
    const v4 = Math.round(60 - (60 - 15) * r);
    metricVal4.textContent = `${v4}%`;
    if (metricBar4) {
      const barW4 = Math.max(25, Math.round(100 - (r * 75)));
      metricBar4.style.width = `${barW4}%`;
    }
  }

  function animateMetricsTransition(fromRatio, toRatio, duration = 850) {
    if (metricsAnimFrameId) cancelAnimationFrame(metricsAnimFrameId);
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Easing cubic easeInOut
      const eased = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentRatio = fromRatio + (toRatio - fromRatio) * eased;
      setMetricsDisplay(currentRatio);

      if (progress < 1) {
        metricsAnimFrameId = requestAnimationFrame(step);
      } else {
        setMetricsDisplay(toRatio);
        metricsAnimFrameId = null;
      }
    }

    metricsAnimFrameId = requestAnimationFrame(step);
  }

  function toggleMetricsAnimation() {
    if (metricsState === 'asis') {
      metricsState = 'tobe';
      animateMetricsTransition(0, 1, 850);
      if (metricsStatusBadge) {
        metricsStatusBadge.textContent = 'Objectiu TO-BE assolit (100%)';
        metricsStatusBadge.className = 'text-[9px] text-emerald-700 font-mono font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 transition-colors shadow-2xs';
      }
    } else {
      metricsState = 'asis';
      animateMetricsTransition(1, 0, 650);
      if (metricsStatusBadge) {
        metricsStatusBadge.textContent = 'Línia Base AS-IS (Clic per animar)';
        metricsStatusBadge.className = 'text-[9px] text-pgme-blue font-mono font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 transition-colors';
      }
    }
  }

  // Estat inicial: Línia de base AS-IS (0)
  setMetricsDisplay(0);
  triggerMetricsBtn?.addEventListener('click', toggleMetricsAnimation);

  // --- 3. MOTOR GRÀFIC DEL DIAGRAMA ASME AS-IS EN CANVAS ---
  const ASME_COLORS = {
    headerBg: '#162f4d',
    laneHeaderBg: '#eaedf0',
    gridBorder: '#b8c0c8',
    startEndFill: '#e6f5ea',
    startEndStroke: '#1a8836',
    opBlueFill: '#edf3f8',
    opBlueStroke: '#2a5679',
    opOrangeFill: '#fdf2eb',
    opOrangeStroke: '#b85014',
    decFill: '#fdeded',
    decStroke: '#b92b27',
    docFill: '#fff7e6',
    docStroke: '#d48817',
    regBadge: '#c92a2a',
    waitFill: '#f4eafc',
    waitStroke: '#73299a',
    arrow: '#1c3b5e',
    textDark: '#1e293b'
  };

  function drawTextMultiLine(ctx, text, x, y, lineHeight, font, color, align = 'center') {
    if (!text || !ctx) return;
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    const lines = String(text).split('\n');
    const totalHeight = (lines.length - 1) * lineHeight;
    let startY = y - totalHeight / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, x, startY + i * lineHeight);
    });
  }

  function drawStartEnd(ctx, x, y, w, h, title, subtitle) {
    const r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = ASME_COLORS.startEndFill;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = ASME_COLORS.startEndStroke;
    ctx.stroke();

    drawTextMultiLine(ctx, title, x + w / 2, y + h / 2 - (subtitle ? 9 : 0), 15, 'bold 12px "Segoe UI", sans-serif', '#14532d');
    if (subtitle) {
      drawTextMultiLine(ctx, subtitle, x + w / 2, y + h / 2 + 12, 14, '11px "Segoe UI", sans-serif', '#166534');
    }
  }

  function drawOperation(ctx, x, y, w, h, title, subtitle, isOrange = false) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fillStyle = isOrange ? ASME_COLORS.opOrangeFill : ASME_COLORS.opBlueFill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isOrange ? ASME_COLORS.opOrangeStroke : ASME_COLORS.opBlueStroke;
    ctx.stroke();

    const titleColor = isOrange ? '#7c2d12' : '#1e3a5f';
    const subColor = isOrange ? '#b85014' : '#3b628b';

    drawTextMultiLine(ctx, title, x + w / 2, y + h / 2 - (subtitle ? 11 : 0), 15, 'bold 12px "Segoe UI", sans-serif', titleColor);
    if (subtitle) {
      drawTextMultiLine(ctx, subtitle, x + w / 2, y + h / 2 + 17, 14, '11px "Segoe UI", sans-serif', subColor);
    }
  }

  function drawDecision(ctx, x, y, w, h, title, subtitle) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(x + w, cy);
    ctx.lineTo(cx, y + h);
    ctx.lineTo(x, cy);
    ctx.closePath();
    ctx.fillStyle = ASME_COLORS.decFill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = ASME_COLORS.decStroke;
    ctx.stroke();

    drawTextMultiLine(ctx, title, cx, cy - (subtitle ? 8 : 0), 14, 'bold 11.5px "Segoe UI", sans-serif', '#881337');
    if (subtitle) {
      drawTextMultiLine(ctx, subtitle, cx, cy + 14, 13, '10.5px "Segoe UI", sans-serif', '#9f1239');
    }
  }

  function drawDocument(ctx, x, y, w, h, title, subtitle, regTag = null) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - 10);
    ctx.bezierCurveTo(
      x + w * 0.7, y + h + 8,
      x + w * 0.3, y + h - 22,
      x, y + h - 6
    );
    ctx.closePath();
    ctx.fillStyle = ASME_COLORS.docFill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = ASME_COLORS.docStroke;
    ctx.stroke();

    if (regTag) {
      const bw = 62;
      const bh = 18;
      ctx.fillStyle = ASME_COLORS.regBadge;
      ctx.fillRect(x + w - bw - 8, y - 9, bw, bh);
      drawTextMultiLine(ctx, regTag, x + w - bw / 2 - 8, y, 12, 'bold 10px "Segoe UI", sans-serif', '#ffffff');
    }

    drawTextMultiLine(ctx, title, x + w / 2, y + h / 2 - (subtitle ? 10 : 4), 15, 'bold 11.5px "Segoe UI", sans-serif', '#92400e');
    if (subtitle) {
      drawTextMultiLine(ctx, subtitle, x + w / 2, y + h / 2 + 12, 13, '10.5px "Segoe UI", sans-serif', '#b45309');
    }
  }

  function drawDelay(ctx, x, y, w, h, title, subtitle) {
    const r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fillStyle = ASME_COLORS.waitFill;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = ASME_COLORS.waitStroke;
    ctx.stroke();

    drawTextMultiLine(ctx, title, x + (w - r/3) / 2, y + h / 2 - (subtitle ? 9 : 0), 15, 'bold 12px "Segoe UI", sans-serif', '#581c87');
    if (subtitle) {
      drawTextMultiLine(ctx, subtitle, x + (w - r/3) / 2, y + h / 2 + 13, 13, '11px "Segoe UI", sans-serif', '#6b21a8');
    }
  }

  function drawArrow(ctx, points, dashed = false, label = null, labelPos = null) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = ASME_COLORS.arrow;
    ctx.lineWidth = 2;
    if (dashed) ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.restore();

    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const headLen = 9;

    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p2.x - headLen * Math.cos(angle - Math.PI / 6), p2.y - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(p2.x - headLen * Math.cos(angle + Math.PI / 6), p2.y - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = ASME_COLORS.arrow;
    ctx.fill();

    if (label && labelPos) {
      drawTextMultiLine(ctx, label, labelPos.x, labelPos.y, 12, 'bold 10.5px "Segoe UI", sans-serif', '#334155');
    }
  }

  window.renderAsmeProgress = function renderAsmeProgress(progressRatio) {
    if (!asmeCanvas || !asmeCtx) return;
    const ratio = Math.min(1, Math.max(0, progressRatio));

    // Assegurar escala 2x d'alta resolució Retina a cada frame
    asmeCtx.setTransform(ASME_SCALE, 0, 0, ASME_SCALE, 0, 0);

    // Netejar canvas
    asmeCtx.fillStyle = '#ffffff';
    asmeCtx.fillRect(0, 0, ASME_WIDTH, ASME_HEIGHT);

    // 1. ESTRUCTURA DE CARRILS (SWIMLANES) SENSE ENCAPÇALAMENT INNECESSARI
    const tableLeft = 15;
    const tableTop = 15;
    const laneHeaderWidth = 145;
    const tableWidth = ASME_WIDTH - 30;

    const lanes = [
      { height: 310, title: '1. ACD' },
      { height: 195, title: '2. UNITAT INSTRUCTORA' },
      { height: 215, title: '3. SERVEIS MÈDICS' }
    ];

    let currentY = tableTop;
    lanes.forEach((lane) => {
      asmeCtx.fillStyle = ASME_COLORS.laneHeaderBg;
      asmeCtx.fillRect(tableLeft, currentY, laneHeaderWidth, lane.height);

      asmeCtx.strokeStyle = ASME_COLORS.gridBorder;
      asmeCtx.lineWidth = 1.5;
      asmeCtx.strokeRect(tableLeft, currentY, laneHeaderWidth, lane.height);
      asmeCtx.strokeRect(tableLeft + laneHeaderWidth, currentY, tableWidth - laneHeaderWidth, lane.height);

      drawTextMultiLine(asmeCtx, lane.title, tableLeft + laneHeaderWidth / 2, currentY + lane.height / 2, 18, 'bold 13.5px "Segoe UI", sans-serif', '#1e293b');

      currentY += lane.height;
    });

    // 2. APARICIÓ SEQÜENCIAL DE LES 13 CAIXES I FLETXES SEGONS EL PROGRÉS
    // Totes les coordenades y s'han desplaçat -73px en retirar la capçalera
    let visibleSteps = 0;

    // Pas 1 (>= 0.00): INICI (Persona alterada o violenta en garjola)
    if (ratio >= 0.00) {
      drawStartEnd(asmeCtx, 205, 57, 150, 62, 'INICI', 'Persona alterada o\nviolenta en garjola');
      visibleSteps = 1;
    }

    // Pas 2 (>= 0.08): Fletxa 1 -> DEC-1 (Valoració Resp. Custòdia)
    if (ratio >= 0.08) {
      drawArrow(asmeCtx, [{x: 355, y: 88}, {x: 395, y: 88}]);
      drawDecision(asmeCtx, 395, 46, 175, 84, 'DEC-1: Valoració\nResp. Custòdia', 'Requereix contenció?');
      visibleSteps = 2;
    }

    // Pas 3 (>= 0.16): Fletxa 2 (SÍ) -> OP-1 (Execució contenció física)
    if (ratio >= 0.16) {
      drawArrow(asmeCtx, [{x: 570, y: 88}, {x: 615, y: 88}], false, 'SÍ', {x: 590, y: 76});
      drawOperation(asmeCtx, 615, 48, 190, 80, 'OP-1: Execució de la\ncontenció física', 'Immobilització reglada\nsegons protocol', false);
      visibleSteps = 3;
    }

    // Pas 4 (>= 0.25): Fletxa 3 -> ESP-1 (Manteniment de la contenció <= 30 min)
    if (ratio >= 0.25) {
      drawArrow(asmeCtx, [{x: 805, y: 88}, {x: 845, y: 88}]);
      drawDelay(asmeCtx, 845, 52, 190, 72, 'ESP-1: Manteniment\nde la contenció', 'Temps màxim ≤ 30 min');
      visibleSteps = 4;
    }

    // Pas 5 (>= 0.33): Fletxa 4 (<= 30 min) -> OP-2 (Retirada de la contenció física)
    if (ratio >= 0.33) {
      drawArrow(asmeCtx, [{x: 1035, y: 88}, {x: 1075, y: 88}], false, '≤ 30 min', {x: 1055, y: 75});
      drawOperation(asmeCtx, 1075, 48, 195, 80, 'OP-2: Retirada de\nla contenció física', 'Cessament (≤ 30m), avís mèdic\ni sol·licitud a U. Instructora', false);
      visibleSteps = 5;
    }

    // Pas 6 (>= 0.42): Fletxa 5 (Comunicació a U. Instructora) -> OP-3
    if (ratio >= 0.42) {
      drawArrow(
        asmeCtx,
        [{x: 1100, y: 128}, {x: 1100, y: 202}, {x: 710, y: 202}, {x: 710, y: 382}],
        false,
        'Sol·licitud de diligència a la U. Instructora (post-contenció)',
        {x: 905, y: 192}
      );
      drawOperation(asmeCtx, 615, 382, 195, 82, "OP-3: Inclusió de\ndiligència en l'atestat", 'Sol·licitada per ACD:\nconstància de contenció', true);
      visibleSteps = 6;
    }

    // Pas 7 (>= 0.50): Fletxes mèdiques 7a i 7b -> ESP-2 (Espera assistència mèdica)
    if (ratio >= 0.50) {
      drawArrow(
        asmeCtx,
        [{x: 915, y: 124}, {x: 915, y: 602}],
        true,
        'Sol·licitud mèdica (durant contenció)',
        {x: 805, y: 257}
      );
      drawArrow(
        asmeCtx,
        [{x: 1130, y: 128}, {x: 1130, y: 172}, {x: 975, y: 172}, {x: 975, y: 602}],
        true,
        'Sol·licitud mèdica (post-contenció)',
        {x: 1060, y: 160}
      );
      drawDelay(asmeCtx, 845, 602, 190, 72, "ESP-2: Espera d'arribada\nd'assistència mèdica", 'Desplaçament a garjola');
      visibleSteps = 7;
    }

    // Pas 8 (>= 0.59): Fletxa 6 -> DOC-1 (Diligència de contenció en SIP/Atestat REG #1)
    if (ratio >= 0.59) {
      drawArrow(asmeCtx, [{x: 810, y: 423}, {x: 1075, y: 423}]);
      drawDocument(asmeCtx, 1075, 385, 190, 78, 'DOC-1: Diligència de\ncontenció (SIP/Atestat)', "Constància documental\nen l'atestat policial", 'REG #1');
      visibleSteps = 8;
    }

    // Pas 9 (>= 0.67): Fletxa 10 -> OP-4 (Registre en l'aplicació Custòdia)
    if (ratio >= 0.67) {
      drawArrow(
        asmeCtx,
        [{x: 1180, y: 128}, {x: 1180, y: 232}],
        false,
        'Pas a registre',
        {x: 1226, y: 202}
      );
      drawOperation(asmeCtx, 1075, 232, 195, 80, "OP-4: Registre en\nl'aplicació Custòdia", 'Introducció manual de\nla contenció realitzada', true);
      visibleSteps = 9;
    }

    // Pas 10 (>= 0.75): Fletxa 8 -> OP-5 (Avaluació mèdica facultatiu)
    if (ratio >= 0.75) {
      drawArrow(asmeCtx, [{x: 1035, y: 638}, {x: 1075, y: 638}]);
      drawOperation(asmeCtx, 1075, 598, 195, 80, 'OP-5: Avaluació mèdica\nde la persona agitada', 'Exploració física i\npsicològica post-contenció', false);
      visibleSteps = 10;
    }

    // Pas 11 (>= 0.83): Fletxa 11 -> DOC-3 (Registre digital aplicació Custòdia REG #2)
    if (ratio >= 0.83) {
      drawArrow(asmeCtx, [{x: 1270, y: 272}, {x: 1310, y: 272}]);
      drawDocument(asmeCtx, 1310, 235, 170, 76, "DOC-3: Registre\naplicació Custòdia", 'Constància digital\nde la contenció', 'REG #2');
      visibleSteps = 11;
    }

    // Pas 12 (>= 0.77): Fletxa 9 -> DOC-2 (Informe / Part d'assistència mèdica)
    if (ratio >= 0.77) {
      drawArrow(asmeCtx, [{x: 1270, y: 638}, {x: 1310, y: 638}]);
      drawDocument(asmeCtx, 1310, 601, 170, 76, "DOC-2: Informe\nd'assistència mèdica", "Facultatiu adjunta\npart a l'expedient", null);
      visibleSteps = 12;
    }

    // Pas 13 (>= 0.85): Fletxes 12a, 12b, 12c -> FI SUBPROCÉS + Llegenda ASME
    if (ratio >= 0.85) {
      // 12a. DOC-3 -> FI
      drawArrow(asmeCtx, [{x: 1395, y: 235}, {x: 1395, y: 119}], false, 'Registre custòdia', {x: 1445, y: 177});
      // 12b. DOC-1 -> FI
      drawArrow(asmeCtx, [{x: 1265, y: 424}, {x: 1290, y: 424}, {x: 1290, y: 88}, {x: 1320, y: 88}], false, 'Diligència atestat', {x: 1235, y: 360});
      // 12c. DOC-2 -> FI
      drawArrow(asmeCtx, [{x: 1395, y: 601}, {x: 1395, y: 119}], true, 'Part mèdic adjuntat', {x: 1448, y: 480});

      drawStartEnd(asmeCtx, 1320, 57, 150, 62, 'FI SUBPROCÉS', 'Persona estabilitzada\ni atestat complementat');
      visibleSteps = 13;
    }

    // 3. LLEGENDA DE CONVENCIONS ASME (Inferior)
    const legY = 746;
    asmeCtx.fillStyle = '#f8fafc';
    asmeCtx.fillRect(tableLeft, legY, tableWidth, 48);
    asmeCtx.strokeStyle = ASME_COLORS.gridBorder;
    asmeCtx.lineWidth = 1;
    asmeCtx.strokeRect(tableLeft, legY, tableWidth, 48);

    asmeCtx.fillStyle = '#0f172a';
    asmeCtx.font = 'bold 11px "Segoe UI", sans-serif';
    asmeCtx.textAlign = 'left';
    asmeCtx.fillText('LLEGENDA ASME:', tableLeft + 15, legY + 26);

    drawStartEnd(asmeCtx, tableLeft + 130, legY + 10, 110, 28, 'Inici / Fi', null);
    drawOperation(asmeCtx, tableLeft + 255, legY + 10, 145, 28, 'Operació Estàndard', null, false);
    drawOperation(asmeCtx, tableLeft + 415, legY + 10, 175, 28, 'Punt de Ruptura (Manual)', null, true);
    drawDecision(asmeCtx, tableLeft + 605, legY + 6, 95, 36, 'Decisió', null);
    drawDocument(asmeCtx, tableLeft + 715, legY + 8, 140, 32, 'Diligència / Registre', null, 'REG');
    drawDelay(asmeCtx, tableLeft + 870, legY + 10, 135, 28, 'Espera / Demora', null);

    // Actualitzar el comptador de caixes de la fase
    if (asmeStepBadge) {
      asmeStepBadge.textContent = `Caixes: ${visibleSteps} / 13 (${Math.round((visibleSteps / 13) * 100)}%)`;
      if (visibleSteps === 13) {
        asmeStepBadge.className = 'px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 shadow-2xs';
      } else {
        asmeStepBadge.className = 'px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-pgme-blue/10 text-pgme-blue border border-pgme-blue/20 shadow-2xs';
      }
    }
  }

  window.descargarAsmePNG = function() {
    if (!asmeCanvas) return;
    renderAsmeProgress(1.0);
    const link = document.createElement('a');
    link.download = 'Diagrama_ASME_AS_IS_Subproces_Custodia.png';
    link.href = asmeCanvas.toDataURL('image/png');
    link.click();
  };

  // --- 4. PROGRESSIÓ DINÀMICA D'OMPLIMENT DELS PUNTS ALLARGATS & DIAGRAMA ASME ---
  let isUpdatingWaypoints = false;
  function updateWaypointFillProgress() {
    if (isUpdatingWaypoints) return;
    isUpdatingWaypoints = true;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const scrollOffset = 100;

    let activeSectionIdx = 0;

    for (let i = 0; i < totalSections; i++) {
      const section = sections[i];
      const nextSection = sections[i + 1];

      const start = (i === 0) ? 0 : section.offsetTop - scrollOffset;
      const end = nextSection 
        ? nextSection.offsetTop - scrollOffset 
        : (document.documentElement.scrollHeight - viewportHeight);

      let percent = 0;
      if (scrollY <= start) {
        percent = 0;
      } else if (scrollY >= end) {
        percent = 100;
      } else {
        const range = end - start;
        percent = range > 0 ? ((scrollY - start) / range) * 100 : 100;
      }

      percent = Math.min(100, Math.max(0, percent));

      // Actualitzar alçada de la barretina allargada
      if (waypointFills[i]) {
        waypointFills[i].style.height = `${percent.toFixed(1)}%`;
      }

      // Marcar classes d'estat
      if (waypointItems[i]) {
        if (percent >= 100) {
          waypointItems[i].classList.add('is-passed');
          waypointItems[i].classList.remove('is-active');
        } else if (percent > 0) {
          waypointItems[i].classList.add('is-active');
          waypointItems[i].classList.remove('is-passed');
        } else {
          waypointItems[i].classList.remove('is-active', 'is-passed');
        }
      }

      // Identificar quina secció està activa segons scroll
      if (scrollY >= start - 40) {
        activeSectionIdx = i;
      }

      // SINCRONITZACIÓ AMB LA FASE 2: Diagrama ASME (La caixa 13 s'integra abans d'arribar al final)
      if (i === 2) {
        // Mapegem 0%..85% d'scroll a 0..1.0 del diagrama per garantir que la caixa 13 s'integra completament
        // mentre la pantalla roman 100% fixada i congelada!
        const diagramProgress = Math.min(1.0, (percent / 85));
        if (scrollY < start) {
          renderAsmeProgress(0);
        } else if (scrollY >= end || percent >= 85) {
          renderAsmeProgress(1.0);
        } else {
          renderAsmeProgress(diagramProgress);
        }
      }
    }

    if (activeSectionIdx !== currentSectionIndex) {
      activateStage(activeSectionIdx);
    }
    isUpdatingWaypoints = false;
  }

  // Escoltador conjunt per a desplaçament d'scroll i redimensió
  window.addEventListener('scroll', () => {
    handleHeaderScroll();
    updateWaypointFillProgress();
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateWaypointFillProgress();
  }, { passive: true });

  handleHeaderScroll();
  updateWaypointFillProgress();

  // Clic a la pill per tornar dalt de tot de la pàgina
  floatingLogoPill?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- 5. ACTIVACIÓ D'ESTAT VISUAL DRET (STAGE PANELS) ---
  window.activateStage = function activateStage(stageIndex) {
    if (stageIndex < 0 || stageIndex >= totalSections) return;
    currentSectionIndex = stageIndex;

    // Mapeig de la secció cap al panell visual dret:
    // Secció 0 (Slide 1: Abast i Matriu) -> Visual Stage 1 (Diagrama ASME PG-ME)
    // Secció 1 (Slide 1b: Símptomes i Marc) -> Visual Stage 1 (Diagrama ASME PG-ME)
    // Secció 2 (Slide 2: Xoc de dades / Pinned ASME To-Be) -> Visual Stage 2
    // Secció 3 (Slide 3: Proposta To-Be) -> Visual Stage 3
    // Secció 4 (Slide 4: Implementació) -> Visual Stage 4
    // Secció 5 (Slide 5: Seguiment) -> Visual Stage 5
    const stagePanelMap = [0, 0, 1, 2, 3, 4];
    const targetPanelIdx = stagePanelMap[stageIndex] !== undefined ? stagePanelMap[stageIndex] : 0;

    // Actualitzar panells del panell fix dret
    stagePanels.forEach((panel, idx) => {
      if (idx === targetPanelIdx) {
        panel.classList.add('active-stage');
      } else {
        panel.classList.remove('active-stage');
      }
    });

    // Actualitzar targetes narratives de l'esquerra
    storyCards.forEach((c, idx) => {
      if (idx === stageIndex) {
        c.classList.add('is-active');
      } else {
        c.classList.remove('is-active');
      }
    });

    // Si s'activa la Secció 2 (ASME Pinned), s'assegura el renderitzat inicial
    if (stageIndex === 2) {
      if (typeof renderAsmeProgress === 'function') renderAsmeProgress(0.0);
    }

    // Actualitzar etiqueta de text al panell dret
    if (currentStepIndicator) {
      const stepNames = [
        "Fase 1: IDENTIFICAR EL PROCÉS A MILLORAR (Abast i Matriu)",
        "Fase 1: IDENTIFICAR EL PROCÉS A MILLORAR (Símptomes i Marc)",
        "Fase 2: ANALITZAR EL PROCÉS A MILLORAR",
        "Fase 3: PROPOSAR MILLORES EN EL PROCÉS",
        "Fase 4: IMPLEMENTAR MILLORES EN EL PROCÉS",
        "Fase 5: FER EL SEGUIMENT DE LES MILLORES IMPLANTADES"
      ];
      currentStepIndicator.textContent = stepNames[stageIndex] || `Fase ${stageIndex + 1}`;
    }
  }

  // --- 6. INTERSECTION OBSERVER PER SCROLLYTELLING PRECÍS ---
  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -25% 0px",
    threshold: [0.05, 0.2]
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const targetSection = entry.target;
        const stageIndex = parseInt(targetSection.dataset.stepIndex, 10);
        if (!isNaN(stageIndex)) {
          activateStage(stageIndex);
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  // --- 7. NAVEGACIÓ EN CLICAR ELS WAYPOINTS DEL LATERAL DRET ---
  waypointItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetStep = parseInt(item.dataset.targetStep, 10);
      navigateToSection(targetStep);
    });
  });

  // --- 8. NAVEGACIÓ PER TECLAT I FLETXES DEL RAIL ---
  function navigateToSection(index) {
    if (index >= 0 && index < totalSections) {
      const targetSection = sections[index];
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function handleAdvance() {
    // Si estem a la Secció 2 (ASME Pinned), avancem progressivament pel diagrama abans de saltar
    if (currentSectionIndex === 2) {
      const sec2 = sections[2];
      const sec3 = sections[3];
      if (sec2 && sec3) {
        const start = sec2.offsetTop - 100;
        const end = sec3.offsetTop - 100;
        const currentY = window.scrollY || document.documentElement.scrollTop;
        const stepChunk = (end - start) / 3;

        if (currentY < end - 180) {
          const targetY = Math.min(end, currentY + stepChunk);
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          return;
        }
      }
    }
    navigateToSection(Math.min(totalSections - 1, currentSectionIndex + 1));
  }

  function handlePrevious() {
    if (currentSectionIndex === 2) {
      const sec2 = sections[2];
      const sec3 = sections[3];
      if (sec2 && sec3) {
        const start = sec2.offsetTop - 100;
        const end = sec3.offsetTop - 100;
        const currentY = window.scrollY || document.documentElement.scrollTop;
        const stepChunk = (end - start) / 3;

        if (currentY > start + 180) {
          const targetY = Math.max(start, currentY - stepChunk);
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          return;
        }
      }
    }
    navigateToSection(Math.max(0, currentSectionIndex - 1));
  }

  railBtnUp?.addEventListener('click', () => {
    handlePrevious();
  });

  railBtnDown?.addEventListener('click', () => {
    handleAdvance();
  });

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
      e.preventDefault();
      handleAdvance();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
      e.preventDefault();
      handlePrevious();
    } else if (e.key === 'Home') {
      e.preventDefault();
      navigateToSection(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      navigateToSection(totalSections - 1);
    } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
      const stepIdx = parseInt(e.key, 10) - 1;
      navigateToSection(stepIdx);
    }
  });

  // --- 9. COMPONENTS INTERACTIUS DE L'ESTAT 3: TOGGLE AS-IS / TO-BE ---
  const toggleAsIsBtn = document.getElementById('toggle-asis-btn');
  const toggleToBeBtn = document.getElementById('toggle-tobe-btn');
  const viewAsIsContent = document.getElementById('view-asis-content');
  const viewToBeContent = document.getElementById('view-tobe-content');

  function setAsIsToBeMode(mode) {
    if (mode === 'tobe') {
      toggleToBeBtn?.classList.add('is-active', 'bg-pgme-blue', 'text-white');
      toggleToBeBtn?.classList.remove('text-slate-600');
      toggleAsIsBtn?.classList.remove('is-active', 'bg-pgme-blue', 'text-white');
      toggleAsIsBtn?.classList.add('text-slate-600');
      
      viewAsIsContent?.classList.add('hidden');
      viewToBeContent?.classList.remove('hidden');
    } else {
      toggleAsIsBtn?.classList.add('is-active', 'bg-pgme-blue', 'text-white');
      toggleAsIsBtn?.classList.remove('text-slate-600');
      toggleToBeBtn?.classList.remove('is-active', 'bg-pgme-blue', 'text-white');
      toggleToBeBtn?.classList.add('text-slate-600');

      viewToBeContent?.classList.add('hidden');
      viewAsIsContent?.classList.remove('hidden');
    }
  }

  toggleAsIsBtn?.addEventListener('click', () => setAsIsToBeMode('asis'));
  toggleToBeBtn?.addEventListener('click', () => setAsIsToBeMode('tobe'));

  // --- 10. COMPONENTS INTERACTIUS DE L'ESTAT 5: SIMULADOR DE SEMÀFOR I DECISIONS ---
  const trafficLightBtns = document.querySelectorAll('.traffic-btn');
  const trafficStatusMsg = document.getElementById('traffic-status-msg');

  const trafficMessages = {
    green: {
      text: "PROJECTE EN TERMINI I OBJECTIUS (VERD): Les millores organitzatives avancen segons calendari. La passarel·la TIC està en fase d'integració i es manté la data de la Prova Pilot a l'ACD Badalona (Mes 7).",
      classes: "bg-emerald-50 border-emerald-300 text-emerald-800"
    },
    amber: {
      text: "ATENCIÓ OPERATIVA (AMBRE): Es detecta una petita desviació en les sessions formatives de l'AORG per rotació de personal a OAC. S'ha activat la mesura correctora de reforç de càpsules digitals.",
      classes: "bg-amber-50 border-amber-300 text-amber-800"
    },
    red: {
      text: "DESVIACIÓ CRÍTICA (VERMELL): Retard en el desenvolupament de la passarel·la Custòdia-Atestats per manca de recurs TIC dedicat. Es requereix intervenció urgent de la CGTIC per mantenir el calendari.",
      classes: "bg-red-50 border-red-300 text-red-800"
    }
  };

  trafficLightBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.status;
      trafficLightBtns.forEach(b => b.classList.remove('ring-4', 'ring-offset-2', 'ring-slate-400', 'scale-110'));
      btn.classList.add('ring-4', 'ring-offset-2', 'ring-slate-400', 'scale-110');

      if (trafficStatusMsg && trafficMessages[color]) {
        trafficStatusMsg.className = `p-3.5 rounded-lg border text-xs leading-relaxed transition-all duration-300 ${trafficMessages[color].classes}`;
        trafficStatusMsg.textContent = trafficMessages[color].text;
      }
    });
  });

  const decisionToggles = document.querySelectorAll('.decision-toggle-btn');
  decisionToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isApproved = toggle.dataset.approved === 'true';
      if (isApproved) {
        toggle.dataset.approved = 'false';
        toggle.textContent = 'Pendent';
        toggle.className = 'decision-toggle-btn px-3 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 transition-all';
      } else {
        toggle.dataset.approved = 'true';
        toggle.textContent = 'Aprovat ✓';
        toggle.className = 'decision-toggle-btn px-3 py-1 rounded text-xs font-semibold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all';
      }
    });
  });

  
  // =========================================================================
  // --- DIAGRAMA ASME PROCÉS GENERAL DE DETENCIÓ (PG-ME) - VECTOR HD ENGINE ---
  // =========================================================================
  const asmeGenCanvas = document.getElementById('asmeGeneralCanvas');
  const btnPlayAsmeGen = document.getElementById('btn-play-asme-general');
  const btnResetAsmeGen = document.getElementById('btn-reset-asme-general');
  const sliderAsmeGen = document.getElementById('asme-general-slider');
  const badgeAsmeGen = document.getElementById('asme-general-badge');
  const readerTitle = document.getElementById('asme-reader-title');
  const readerDesc = document.getElementById('asme-reader-desc');
  const readerLane = document.getElementById('asme-reader-lane');

  if (asmeGenCanvas) {
    const genCtx = asmeGenCanvas.getContext('2d');
    const GEN_WIDTH = 1480;
    const GEN_HEIGHT = 800;
    const GEN_SCALE = 2; // Retina / Ultra HD 2x vector resolution

    asmeGenCanvas.width = GEN_WIDTH * GEN_SCALE;
    asmeGenCanvas.height = GEN_HEIGHT * GEN_SCALE;
    asmeGenCanvas.style.width = '100%';
    asmeGenCanvas.style.height = 'auto';
    genCtx.scale(GEN_SCALE, GEN_SCALE);

    const GEN_COLORS = {
      headerBg: '#013b75',
      laneHeaderBg: '#eaedf0',
      gridBorder: '#b8c0c8',
      startEndFill: '#e6f5ea',
      startEndStroke: '#1a8836',
      opBlueFill: '#edf3f8',
      opBlueStroke: '#2a5679',
      opOrangeFill: '#fdf2eb',
      opOrangeStroke: '#b85014',
      decFill: '#fdeded',
      decStroke: '#b92b27',
      docFill: '#fff7e6',
      docStroke: '#d48817',
      regBadge: '#c92a2a',
      waitFill: '#f4eafc',
      waitStroke: '#73299a',
      arrow: '#1c3b5e',
      alertFill: '#fffbeb',
      alertStroke: '#d97706',
      textDark: '#1e293b'
    };

    const NODES = {
      // CARRIL 1: USC
      N1: { id: 'N1', type: 'start', x: 165, y: 65, w: 185, h: 64, title: "INICI: Detenció al carrer", sub: "Patrulla USC (Seguretat Ciutadana)", lane: "1. USC", detail: "Inici de la custòdia policial arran de detenció en flagrant delicte o ordre judicial." },
      N2: { id: 'N2', type: 'op', x: 410, y: 65, w: 225, h: 64, title: "OP-1: Lectura drets i trasllat", sub: "Trasllat a ABP i verbal", lane: "1. USC", detail: "Lectura de drets in situ i trasllat del detingut a dependències policials (ABP)." },
      N3: { id: 'N3', type: 'doc', reg: 'REG #1', x: 695, y: 65, w: 220, h: 64, title: "DOC-1: Minuta i drets inicials", sub: "Diligència policial en paper", lane: "1. USC", detail: "Redacció de la minuta policial i acta de drets en format paper físic." },

      // CARRIL 2: OAC
      N4: { id: 'N4', type: 'op_orange', x: 410, y: 200, w: 225, h: 66, title: "OP-2: Obertura d'atestat a OAC", sub: "Reintroducció manual SIP/SGIT", lane: "2. OAC", detail: "PUNT CRÍTIC: Reintroducció manual de dades de la minuta a les aplicacions." },
      N5: { id: 'N5', type: 'alert', x: 165, y: 310, w: 225, h: 62, title: "DISFUNCIÓ AS-IS (OAC)", sub: "Criteris dispars entre 60 ABP", lane: "2. OAC", detail: "Falta d'estandardització entre unitats que genera protocols diferents i duplicats." },
      N6: { id: 'N6', type: 'doc', reg: 'REG #2', x: 695, y: 200, w: 220, h: 66, title: "DOC-2: Atestat SIP / SGIT", sub: "Full Excel control torn (duplicitat)", lane: "2. OAC", detail: "Atestat policial + gestió paral·lela en fulls Excel per al control del torn de guàrdia." },
      N7: { id: 'N7', type: 'dec', x: 965, y: 196, w: 160, h: 74, title: "DEC-1: ¿Requereix UI?", sub: "Investigació o Jutjat", lane: "2. OAC", detail: "Avaluació de si cal traspassar l'atestat a Unitat d'Investigació o passar directe a jutjat." },
      N8: { id: 'N8', type: 'op', x: 1175, y: 200, w: 215, h: 66, title: "OP-5: Tancament atestat", sub: "Verificació formal manual", lane: "2. OAC", detail: "Revisió manual i comprovació de diligències abans de la remissió judicial." },
      N9: { id: 'N9', type: 'doc', reg: 'REG #5', x: 1345, y: 200, w: 115, h: 66, title: "DOC-5: Oficis judicials", sub: "Atestat imprès paper", lane: "2. OAC", detail: "Impressió física de l'atestat per ser lliurat al Jutjat de Guàrdia en el traspàs." },

      // CARRIL 3: CUSTÒDIA / GARJOLA
      N10: { id: 'N10', type: 'op_orange', x: 410, y: 420, w: 225, h: 66, title: "OP-3: Ingrés i pertinences", sub: "3r registre manual de la dada", lane: "3. CUSTÒDIA / GARJOLA", detail: "PUNT CRÍTIC: Registre redundant de filiació i inventari de pertinences en paper i aplicació." },
      N11: { id: 'N11', type: 'doc', reg: 'REG #3', x: 695, y: 420, w: 220, h: 66, title: "DOC-3: Llibre de garjola", sub: "Llibre físic de paper", lane: "3. CUSTÒDIA / GARJOLA", detail: "Anotacions manuals en llibres en paper (alimentació, visites, medicació i incidències)." },
      N12: { id: 'N12', type: 'delay', x: 960, y: 420, w: 175, h: 66, title: "ESP-1: Estada en calabós", sub: "Espera de designació lletrat", lane: "3. CUSTÒDIA / GARJOLA", detail: "Temps d'espera passiva fins a la compareixença de l'advocat d'ofici o particular." },
      N13: { id: 'N13', type: 'op', x: 1175, y: 420, w: 215, h: 66, title: "Control manual terminis", sub: "Límit legal 72h / 24h garjola", lane: "3. CUSTÒDIA / GARJOLA", detail: "Vigilància manual dels terminis màxims de detenció preventiva (art. 520 LECrim)." },
      N14: { id: 'N14', type: 'delay', x: 1175, y: 518, w: 215, h: 62, title: "ESP-2: Immobilització", sub: "1,6h a 6,5h sense sistema", lane: "3. CUSTÒDIA / GARJOLA", detail: "Subprocés crític de contenció física i immobilització mecànica de persones agitades." },
      N15: { id: 'N15', type: 'op', x: 1345, y: 420, w: 115, h: 66, title: "OP-6: Conducció Jutjat", sub: "16.177 trasllats/any", lane: "3. CUSTÒDIA / GARJOLA", detail: "Organització de la custòdia dinàmica i conducció policial al Jutjat de Guàrdia." },
      N16: { id: 'N16', type: 'end', x: 1345, y: 518, w: 115, h: 62, title: "FI: Disposició Judicial", sub: "Lliurament o Llibertat", lane: "3. CUSTÒDIA / GARJOLA", detail: "Posada a disposició de l'Autoritat Judicial o posada en llibertat des de comissaria." },

      // CARRIL 4: UI
      N17: { id: 'N17', type: 'delay', x: 695, y: 642, w: 220, h: 66, title: "ESP-3: Espera avís manual", sub: "Traspàs d'expedient OAC a UI", lane: "4. UI", detail: "Espera de notificació verbal o física que hi ha un detingut a garjola per a instrucció." },
      N18: { id: 'N18', type: 'op', x: 960, y: 642, w: 175, h: 66, title: "OP-4: Diligències UI", sub: "Càmeres, declaració i peritatges", lane: "4. UI", detail: "Pràctica de diligències d'investigació, presa de declaració i visualització de càmeres." },
      N19: { id: 'N19', type: 'doc', reg: 'REG #4', x: 1175, y: 642, w: 215, h: 66, title: "DOC-4: Informe tècnic i actes", sub: "Declaracions a atestat global", lane: "4. UI", detail: "Incorporació dels informes pericials i declaracions policials a l'atestat global." }
    };

    const ARROWS = [
      { id: 'A1', from: 'N1', to: 'N2', pts: [{x: 350, y: 97}, {x: 410, y: 97}] },
      { id: 'A2', from: 'N2', to: 'N3', pts: [{x: 635, y: 97}, {x: 695, y: 97}] },
      { id: 'A3', from: 'N2', to: 'N4', pts: [{x: 522, y: 129}, {x: 522, y: 200}], label: 'Traspàs OAC' },
      { id: 'A4', from: 'N2', to: 'N10', pts: [{x: 450, y: 129}, {x: 450, y: 420}], label: 'Ingrés garjola' },
      { id: 'A5', from: 'N4', to: 'N6', pts: [{x: 635, y: 233}, {x: 695, y: 233}] },
      { id: 'A6', from: 'N10', to: 'N11', pts: [{x: 635, y: 453}, {x: 695, y: 453}] },
      { id: 'A7', from: 'N6', to: 'N7', pts: [{x: 915, y: 233}, {x: 965, y: 233}] },
      { id: 'A8', from: 'N11', to: 'N12', pts: [{x: 915, y: 453}, {x: 960, y: 453}] },
      { id: 'A9', from: 'N7', to: 'N17', pts: [{x: 1045, y: 270}, {x: 1045, y: 615}, {x: 805, y: 615}, {x: 805, y: 642}], label: 'SÍ (Requereix UI)' },
      { id: 'A10', from: 'N17', to: 'N18', pts: [{x: 915, y: 675}, {x: 960, y: 675}] },
      { id: 'A11', from: 'N18', to: 'N19', pts: [{x: 1135, y: 675}, {x: 1175, y: 675}] },
      { id: 'A12', from: 'N19', to: 'N8', pts: [{x: 1282, y: 642}, {x: 1282, y: 266}], label: 'Retorn informe UI' },
      { id: 'A13', from: 'N7', to: 'N8', pts: [{x: 1125, y: 233}, {x: 1175, y: 233}], label: 'NO' },
      { id: 'A14', from: 'N12', to: 'N13', pts: [{x: 1135, y: 453}, {x: 1175, y: 453}] },
      { id: 'A15', from: 'N12', to: 'N14', pts: [{x: 1047, y: 486}, {x: 1047, y: 549}, {x: 1175, y: 549}], label: 'Contenció' },
      { id: 'A16', from: 'N8', to: 'N9', pts: [{x: 1390, y: 233}, {x: 1410, y: 233}, {x: 1410, y: 200}, {x: 1402, y: 200}] },
      { id: 'A17', from: 'N9', to: 'N15', pts: [{x: 1402, y: 266}, {x: 1402, y: 420}], label: 'Tramesa' },
      { id: 'A18', from: 'N15', to: 'N16', pts: [{x: 1402, y: 486}, {x: 1402, y: 518}] }
    ];

    // Seqüència de 16 passos perfectament coordinats (DOC-4 té el seu pas autònom 11)
    const STEPS = [
      { label: "1. Detenció al carrer (USC)", target: 'N1', nodes: ['N1'], arrows: [] },
      { label: "2. Lectura de drets i trasllat (OP-1)", target: 'N2', nodes: ['N1', 'N2'], arrows: ['A1'] },
      { label: "3. Minuta i drets en paper (DOC-1)", target: 'N3', nodes: ['N1', 'N2', 'N3'], arrows: ['A1', 'A2'] },
      { label: "4. Obertura d'atestat a OAC (OP-2)", target: 'N4', nodes: ['N1', 'N2', 'N3', 'N4'], arrows: ['A1', 'A2', 'A3'] },
      { label: "5. Ingrés en garjola i pertinences (OP-3)", target: 'N10', nodes: ['N1', 'N2', 'N3', 'N4', 'N10'], arrows: ['A1', 'A2', 'A3', 'A4'] },
      { label: "6. Disfunció AS-IS per criteris dispars", target: 'N5', nodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N10'], arrows: ['A1', 'A2', 'A3', 'A4'] },
      { label: "7. Registres múltiples (DOC-2 i DOC-3)", target: 'N6', nodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N10', 'N11'], arrows: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'] },
      { label: "8. Avaluació d'investigació (DEC-1) i estada (ESP-1)", target: 'N7', nodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N10', 'N11', 'N12'], arrows: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'] },
      { label: "9. Derivació a Unitat d'Investigació (UI)", target: 'N17', nodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N10', 'N11', 'N12', 'N17'], arrows: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'] },
      { label: "10. Diligències d'investigació (OP-4)", target: 'N18', nodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N10', 'N11', 'N12', 'N17', 'N18'], arrows: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10'] },
      { label: "11. Informe tècnic i actes d'investigació (DOC-4)", target: 'N19', nodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N10', 'N11', 'N12', 'N17', 'N18', 'N19'], arrows: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11'] },
      { label: "12. Tancament d'atestat a l'OAC (OP-5)", target: 'N8', nodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N10', 'N11', 'N12', 'N17', 'N18', 'N19'], arrows: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13'] },
      { label: "13. Control manual de terminis i immobilitzacions (ESP-2)", target: 'N13', nodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N10', 'N11', 'N12', 'N13', 'N14', 'N17', 'N18', 'N19'], arrows: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15'] },
      { label: "14. Remissió d'atestat i oficis (DOC-5)", target: 'N9', nodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10', 'N11', 'N12', 'N13', 'N14', 'N17', 'N18', 'N19'], arrows: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16'] },
      { label: "15. Conducció al Jutjat de Guàrdia (OP-6)", target: 'N15', nodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10', 'N11', 'N12', 'N13', 'N14', 'N15', 'N17', 'N18', 'N19'], arrows: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17'] },
      { label: "16. FI DEL PROCÉS: Disposició judicial o llibertat", target: 'N16', nodes: Object.keys(NODES), arrows: ARROWS.map(a => a.id) }
    ];

    let genProgress = 0.0;
    let isUserScrubbing = false;
    let isGenPlaying = false;
    let genAnimId = null;
    let genLastTime = 0;
    let hoveredNodeId = null;

    // Helper exclusiu per a ASME General que reutilitza la funció global drawTextMultiLine
    const drawGenText = (text, x, y, lh, font, color, align) => drawTextMultiLine(genCtx, text, x, y, lh, font, color, align);

    function drawStartEndGen(x, y, w, h, title, sub, alpha, isHovered) {
      genCtx.save();
      genCtx.globalAlpha = alpha;
      const r = h / 2;
      genCtx.beginPath();
      genCtx.moveTo(x + r, y);
      genCtx.lineTo(x + w - r, y);
      genCtx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
      genCtx.lineTo(x + r, y + h);
      genCtx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
      genCtx.closePath();
      genCtx.fillStyle = GEN_COLORS.startEndFill;
      genCtx.fill();
      genCtx.lineWidth = isHovered ? 3.5 : 2.2;
      genCtx.strokeStyle = isHovered ? '#059669' : GEN_COLORS.startEndStroke;
      if (isHovered) {
        genCtx.shadowColor = '#10b981';
        genCtx.shadowBlur = 12;
      }
      genCtx.stroke();

      drawGenText(title, x + w / 2, y + h / 2 - (sub ? 9 : 0), 15, 'bold 13px "Segoe UI", sans-serif', '#14532d');
      if (sub) {
        drawGenText(sub, x + w / 2, y + h / 2 + 13, 13, '11.5px "Segoe UI", sans-serif', '#166534');
      }
      genCtx.restore();
    }

    function drawOperationGen(x, y, w, h, title, sub, isOrange, alpha, isHovered) {
      genCtx.save();
      genCtx.globalAlpha = alpha;
      genCtx.beginPath();
      genCtx.roundRect(x, y, w, h, 6);
      genCtx.fillStyle = isOrange ? GEN_COLORS.opOrangeFill : GEN_COLORS.opBlueFill;
      genCtx.fill();
      genCtx.lineWidth = isHovered ? 3.2 : 2;
      genCtx.strokeStyle = isHovered ? (isOrange ? '#ea580c' : '#0284c7') : (isOrange ? GEN_COLORS.opOrangeStroke : GEN_COLORS.opBlueStroke);
      if (isHovered) {
        genCtx.shadowColor = isOrange ? '#f97316' : '#38bdf8';
        genCtx.shadowBlur = 12;
      }
      genCtx.stroke();

      const titleColor = isOrange ? '#7c2d12' : '#1e3a5f';
      const subColor = isOrange ? '#b85014' : '#3b628b';
      drawGenText(title, x + w / 2, y + h / 2 - (sub ? 10 : 0), 15, 'bold 13px "Segoe UI", sans-serif', titleColor);
      if (sub) {
        drawGenText(sub, x + w / 2, y + h / 2 + 14, 13, '11.5px "Segoe UI", sans-serif', subColor);
      }
      genCtx.restore();
    }

    function drawDecisionGen(x, y, w, h, title, sub, alpha, isHovered) {
      genCtx.save();
      genCtx.globalAlpha = alpha;
      const cx = x + w / 2;
      const cy = y + h / 2;
      genCtx.beginPath();
      genCtx.moveTo(cx, y);
      genCtx.lineTo(x + w, cy);
      genCtx.lineTo(cx, y + h);
      genCtx.lineTo(x, cy);
      genCtx.closePath();
      genCtx.fillStyle = GEN_COLORS.decFill;
      genCtx.fill();
      genCtx.lineWidth = isHovered ? 3.2 : 2;
      genCtx.strokeStyle = isHovered ? '#dc2626' : GEN_COLORS.decStroke;
      if (isHovered) {
        genCtx.shadowColor = '#ef4444';
        genCtx.shadowBlur = 12;
      }
      genCtx.stroke();

      drawGenText(title, cx, cy - (sub ? 8 : 0), 14, 'bold 12.5px "Segoe UI", sans-serif', '#881337');
      if (sub) {
        drawGenText(sub, cx, cy + 14, 12, '11px "Segoe UI", sans-serif', '#9f1239');
      }
      genCtx.restore();
    }

    function drawDocumentGen(x, y, w, h, title, sub, regTag, alpha, isHovered) {
      genCtx.save();
      genCtx.globalAlpha = alpha;
      genCtx.beginPath();
      genCtx.moveTo(x, y);
      genCtx.lineTo(x + w, y);
      genCtx.lineTo(x + w, y + h - 10);
      genCtx.bezierCurveTo(
        x + w * 0.7, y + h + 8,
        x + w * 0.3, y + h - 22,
        x, y + h - 6
      );
      genCtx.closePath();
      genCtx.fillStyle = GEN_COLORS.docFill;
      genCtx.fill();
      genCtx.lineWidth = isHovered ? 3.2 : 2;
      genCtx.strokeStyle = isHovered ? '#d97706' : GEN_COLORS.docStroke;
      if (isHovered) {
        genCtx.shadowColor = '#f59e0b';
        genCtx.shadowBlur = 12;
      }
      genCtx.stroke();

      if (regTag) {
        const bw = 58;
        const bh = 17;
        genCtx.fillStyle = GEN_COLORS.regBadge;
        genCtx.fillRect(x + w - bw - 6, y - 8, bw, bh);
        drawGenText(regTag, x + w - bw / 2 - 6, y, 12, 'bold 9.5px "Segoe UI", sans-serif', '#ffffff');
      }

      drawGenText(title, x + w / 2, y + h / 2 - (sub ? 10 : 3), 15, 'bold 12.5px "Segoe UI", sans-serif', '#92400e');
      if (sub) {
        drawGenText(sub, x + w / 2, y + h / 2 + 13, 12, '11px "Segoe UI", sans-serif', '#b45309');
      }
      genCtx.restore();
    }

    function drawDelayGen(x, y, w, h, title, sub, alpha, isHovered) {
      genCtx.save();
      genCtx.globalAlpha = alpha;
      const r = h / 2;
      genCtx.beginPath();
      genCtx.moveTo(x, y);
      genCtx.lineTo(x + w - r, y);
      genCtx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
      genCtx.lineTo(x, y + h);
      genCtx.closePath();
      genCtx.fillStyle = GEN_COLORS.waitFill;
      genCtx.fill();
      genCtx.lineWidth = isHovered ? 3.5 : 2.2;
      genCtx.strokeStyle = isHovered ? '#9333ea' : GEN_COLORS.waitStroke;
      if (isHovered) {
        genCtx.shadowColor = '#a855f7';
        genCtx.shadowBlur = 12;
      }
      genCtx.stroke();

      drawGenText(title, x + (w - r/3) / 2, y + h / 2 - (sub ? 9 : 0), 15, 'bold 12.5px "Segoe UI", sans-serif', '#581c87');
      if (sub) {
        drawGenText(sub, x + (w - r/3) / 2, y + h / 2 + 13, 12, '11px "Segoe UI", sans-serif', '#6b21a8');
      }
      genCtx.restore();
    }

    function drawAlertGen(x, y, w, h, title, sub, alpha, isHovered) {
      genCtx.save();
      genCtx.globalAlpha = alpha;
      genCtx.beginPath();
      genCtx.roundRect(x, y, w, h, 6);
      genCtx.fillStyle = GEN_COLORS.alertFill;
      genCtx.fill();
      genCtx.lineWidth = isHovered ? 2.8 : 1.8;
      genCtx.setLineDash([5, 4]);
      genCtx.strokeStyle = isHovered ? '#b45309' : GEN_COLORS.alertStroke;
      if (isHovered) {
        genCtx.shadowColor = '#f59e0b';
        genCtx.shadowBlur = 10;
      }
      genCtx.stroke();
      genCtx.setLineDash([]);

      drawGenText("⚠ " + title, x + w / 2, y + h / 2 - (sub ? 9 : 0), 14, 'bold 12px "Segoe UI", sans-serif', '#b45309');
      if (sub) {
        drawGenText(sub, x + w / 2, y + h / 2 + 13, 12, '10.5px "Segoe UI", sans-serif', '#d97706');
      }
      genCtx.restore();
    }

    function drawProgressiveArrowGen(points, t, label) {
      if (t <= 0 || points.length < 2) return;

      let totalLen = 0;
      const segLens = [];
      for (let i = 0; i < points.length - 1; i++) {
        const dx = points[i+1].x - points[i].x;
        const dy = points[i+1].y - points[i].y;
        const d = Math.hypot(dx, dy);
        segLens.push(d);
        totalLen += d;
      }

      const targetDist = totalLen * Math.min(1, Math.max(0, t));
      let distCovered = 0;

      genCtx.save();
      genCtx.beginPath();
      genCtx.moveTo(points[0].x, points[0].y);

      let currentTip = points[0];
      let tipAngle = 0;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i+1];
        const segLen = segLens[i];

        if (distCovered + segLen <= targetDist) {
          genCtx.lineTo(p2.x, p2.y);
          distCovered += segLen;
          currentTip = p2;
          tipAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        } else {
          const remain = targetDist - distCovered;
          const ratio = segLen > 0 ? remain / segLen : 0;
          const nx = p1.x + (p2.x - p1.x) * ratio;
          const ny = p1.y + (p2.y - p1.y) * ratio;
          genCtx.lineTo(nx, ny);
          currentTip = { x: nx, y: ny };
          tipAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          break;
        }
      }

      genCtx.strokeStyle = GEN_COLORS.arrow;
      genCtx.lineWidth = 2.2;
      genCtx.stroke();

      if (targetDist > 8) {
        const headLen = 8.5;
        genCtx.beginPath();
        genCtx.moveTo(currentTip.x, currentTip.y);
        genCtx.lineTo(currentTip.x - headLen * Math.cos(tipAngle - Math.PI / 6), currentTip.y - headLen * Math.sin(tipAngle - Math.PI / 6));
        genCtx.lineTo(currentTip.x - headLen * Math.cos(tipAngle + Math.PI / 6), currentTip.y - headLen * Math.sin(tipAngle + Math.PI / 6));
        genCtx.closePath();
        genCtx.fillStyle = GEN_COLORS.arrow;
        genCtx.fill();

        if (t < 0.99) {
          genCtx.beginPath();
          genCtx.arc(currentTip.x, currentTip.y, 4.5, 0, Math.PI * 2);
          genCtx.fillStyle = '#0284c7';
          genCtx.shadowColor = '#38bdf8';
          genCtx.shadowBlur = 10;
          genCtx.fill();
        }
      }

      if (label && t > 0.6) {
        const midP = points[Math.floor(points.length / 2)];
        genCtx.fillStyle = '#334155';
        genCtx.font = 'bold 10px "Segoe UI", sans-serif';
        genCtx.textAlign = 'center';
        genCtx.fillText(label, midP.x + 10, midP.y - 8);
      }
      genCtx.restore();
    }

    window.renderAsmeGeneral = function renderAsmeGeneral(p) {
      genCtx.setTransform(GEN_SCALE, 0, 0, GEN_SCALE, 0, 0);
      genCtx.clearRect(0, 0, GEN_WIDTH, GEN_HEIGHT);

      genCtx.fillStyle = '#ffffff';
      genCtx.fillRect(0, 0, GEN_WIDTH, GEN_HEIGHT);

      // Sense banner ni títol superior per aprofitar el 100% de l'espai útil vertical
      const tableLeft = 14;
      const tableTop = 14;
      const laneHeaderWidth = 135;
      const tableWidth = GEN_WIDTH - 28;

      const lanes = [
        { height: 165, title: '1. USC' },
        { height: 220, title: '2. OAC' },
        { height: 205, title: '3. CUSTÒDIA / GARJOLA' },
        { height: 140, title: '4. UI' }
      ];

      let curY = tableTop;
      lanes.forEach((lane) => {
        genCtx.fillStyle = GEN_COLORS.laneHeaderBg;
        genCtx.fillRect(tableLeft, curY, laneHeaderWidth, lane.height);

        genCtx.strokeStyle = GEN_COLORS.gridBorder;
        genCtx.lineWidth = 1.2;
        genCtx.strokeRect(tableLeft, curY, laneHeaderWidth, lane.height);
        genCtx.strokeRect(tableLeft + laneHeaderWidth, curY, tableWidth - laneHeaderWidth, lane.height);

        drawGenText(lane.title, tableLeft + laneHeaderWidth / 2, curY + lane.height / 2, 18, 'bold 13.5px "Segoe UI", sans-serif', '#1e293b');

        curY += lane.height;
      });

      // Llegenda inferior
      const legY = 748;
      genCtx.fillStyle = '#f8fafc';
      genCtx.fillRect(tableLeft, legY, tableWidth, 44);
      genCtx.strokeStyle = GEN_COLORS.gridBorder;
      genCtx.lineWidth = 1;
      genCtx.strokeRect(tableLeft, legY, tableWidth, 44);

      genCtx.fillStyle = '#0f172a';
      genCtx.font = 'bold 11px "Segoe UI", sans-serif';
      genCtx.textAlign = 'left';
      genCtx.fillText('LLEGENDA ASME:', tableLeft + 15, legY + 24);

      drawStartEndGen(tableLeft + 125, legY + 8, 105, 28, 'Inici / Fi', null, 1, false);
      drawOperationGen(tableLeft + 245, legY + 8, 150, 28, 'Operació Estàndard', null, false, 1, false);
      drawOperationGen(tableLeft + 410, legY + 8, 160, 28, 'Tasques Duplicades', null, true, 1, false);
      drawDecisionGen(tableLeft + 585, legY + 4, 85, 36, 'Decisió', null, 1, false);
      drawDocumentGen(tableLeft + 685, legY + 6, 140, 32, 'Document / Registre', null, 'REG', 1, false);
      drawDelayGen(tableLeft + 840, legY + 8, 135, 28, 'Espera / Demora', null, 1, false);

      const totalSteps = STEPS.length;
      const currentStepFloat = p * (totalSteps - 1);
      const currentStepIdx = Math.min(totalSteps - 1, Math.floor(currentStepFloat));
      const stepProgress = currentStepFloat - currentStepIdx;

      const activeStep = STEPS[currentStepIdx];
      const targetNode = NODES[activeStep.target];

      if (badgeAsmeGen) {
        if (p >= 0.99) {
          badgeAsmeGen.textContent = `Procés Desenvolupat (${totalSteps}/${totalSteps})`;
          badgeAsmeGen.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all";
        } else if (p > 0.01) {
          badgeAsmeGen.textContent = `Pas ${currentStepIdx + 1}/${totalSteps}`;
          badgeAsmeGen.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-pgme-blue border border-blue-300 transition-all";
        } else {
          badgeAsmeGen.textContent = `Preparat per iniciar (0/${totalSteps})`;
          badgeAsmeGen.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 transition-all";
        }
      }

      if (sliderAsmeGen && !isUserScrubbing) {
        sliderAsmeGen.value = Math.round(p * 100);
      }

      const inspectedNode = hoveredNodeId ? NODES[hoveredNodeId] : targetNode;
      if (inspectedNode && readerTitle && readerDesc && readerLane) {
        readerTitle.textContent = inspectedNode.title;
        readerDesc.textContent = inspectedNode.detail || inspectedNode.sub;
        readerLane.textContent = inspectedNode.lane;
      }

      const visibleNodes = new Set(activeStep.nodes);
      const visibleArrows = new Set(activeStep.arrows);

      let drawingArrowId = null;
      let drawingArrowProgress = 0;
      if (currentStepIdx < totalSteps - 1) {
        const nextStep = STEPS[currentStepIdx + 1];
        const newArrows = nextStep.arrows.filter(a => !activeStep.arrows.includes(a));
        if (newArrows.length > 0) {
          drawingArrowId = newArrows[0];
          drawingArrowProgress = stepProgress;
        }
      }

      ARROWS.forEach(arrow => {
        if (visibleArrows.has(arrow.id)) {
          drawProgressiveArrowGen(arrow.pts, 1.0, arrow.label);
        } else if (arrow.id === drawingArrowId) {
          drawProgressiveArrowGen(arrow.pts, drawingArrowProgress, arrow.label);
        }
      });

      // Lògica a prova d'errors: les caixes introduïdes en passos anteriors mai parpellegen ni desapareixen!
      const prevStepNodes = currentStepIdx > 0 ? STEPS[currentStepIdx - 1].nodes : [];

      Object.keys(NODES).forEach(nid => {
        if (visibleNodes.has(nid)) {
          const node = NODES[nid];
          let alpha = 1.0;
          let scale = 1.0;

          const isNewlyBorn = !prevStepNodes.includes(nid);

          // Si el procés està completat (p >= 0.999), TOTES les caixes estan al 100%
          if (p >= 0.999 || currentStepIdx === totalSteps - 1) {
            alpha = 1.0;
            scale = 1.0;
          } else if (isNewlyBorn && stepProgress < 0.45) {
            const t = stepProgress / 0.45;
            alpha = Math.min(1.0, Math.max(0.05, t));
            scale = 0.85 + 0.15 * Math.sin(t * Math.PI / 2);
          }

          const isHovered = (hoveredNodeId === nid);

          genCtx.save();
          if (scale !== 1.0) {
            const cx = node.x + node.w / 2;
            const cy = node.y + node.h / 2;
            genCtx.translate(cx, cy);
            genCtx.scale(scale, scale);
            genCtx.translate(-cx, -cy);
          }

          if (node.type === 'start') {
            drawStartEndGen(node.x, node.y, node.w, node.h, node.title, node.sub, alpha, isHovered);
          } else if (node.type === 'end') {
            drawStartEndGen(node.x, node.y, node.w, node.h, node.title, node.sub, alpha, isHovered);
          } else if (node.type === 'op') {
            drawOperationGen(node.x, node.y, node.w, node.h, node.title, node.sub, false, alpha, isHovered);
          } else if (node.type === 'op_orange') {
            drawOperationGen(node.x, node.y, node.w, node.h, node.title, node.sub, true, alpha, isHovered);
          } else if (node.type === 'dec') {
            drawDecisionGen(node.x, node.y, node.w, node.h, node.title, node.sub, alpha, isHovered);
          } else if (node.type === 'doc') {
            drawDocumentGen(node.x, node.y, node.w, node.h, node.title, node.sub, node.reg, alpha, isHovered);
          } else if (node.type === 'delay') {
            drawDelayGen(node.x, node.y, node.w, node.h, node.title, node.sub, alpha, isHovered);
          } else if (node.type === 'alert') {
            drawAlertGen(node.x, node.y, node.w, node.h, node.title, node.sub, alpha, isHovered);
          }
          genCtx.restore();
        }
      });
    }

    function genAnimLoop(time) {
      if (!genLastTime) genLastTime = time;
      const dt = (time - genLastTime) / 1000;
      genLastTime = time;

      if (isGenPlaying) {
        genProgress += dt * (1 / 18.0);
        if (genProgress >= 1.0) {
          genProgress = 1.0;
          isGenPlaying = false;
          if (btnPlayAsmeGen) {
            btnPlayAsmeGen.innerHTML = `<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg><span>Reiniciar Procés</span>`;
          }
        }
        renderAsmeGeneral(genProgress);
      }

      if (isGenPlaying) {
        genAnimId = requestAnimationFrame(genAnimLoop);
      }
    }

    function togglePlayAsmeGen() {
      if (genProgress >= 1.0) {
        genProgress = 0.0;
      }
      isGenPlaying = !isGenPlaying;
      if (isGenPlaying) {
        genLastTime = performance.now();
        if (btnPlayAsmeGen) {
          btnPlayAsmeGen.innerHTML = `<svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg><span>Pausar</span>`;
        }
        genAnimId = requestAnimationFrame(genAnimLoop);
      } else {
        if (btnPlayAsmeGen) {
          btnPlayAsmeGen.innerHTML = `<svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg><span>Continuar</span>`;
        }
        if (genAnimId) cancelAnimationFrame(genAnimId);
      }
    }

    if (btnPlayAsmeGen) {
      btnPlayAsmeGen.addEventListener('click', togglePlayAsmeGen);
    }

    if (btnResetAsmeGen) {
      btnResetAsmeGen.addEventListener('click', () => {
        isGenPlaying = false;
        if (genAnimId) cancelAnimationFrame(genAnimId);
        genProgress = 0.0;
        if (btnPlayAsmeGen) {
          btnPlayAsmeGen.innerHTML = `<svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg><span>Reproduir Procés</span>`;
        }
        renderAsmeGeneral(0.0);
      });
    }

    if (sliderAsmeGen) {
      sliderAsmeGen.addEventListener('input', (e) => {
        isUserScrubbing = true;
        genProgress = parseInt(e.target.value, 10) / 100;
        renderAsmeGeneral(genProgress);
      });
      sliderAsmeGen.addEventListener('change', () => {
        isUserScrubbing = false;
      });
    }

    asmeGenCanvas.addEventListener('mousemove', (e) => {
      const rect = asmeGenCanvas.getBoundingClientRect();
      const scaleX = GEN_WIDTH / rect.width;
      const scaleY = GEN_HEIGHT / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      let found = null;
      Object.keys(NODES).forEach(nid => {
        const n = NODES[nid];
        if (mouseX >= n.x && mouseX <= n.x + n.w && mouseY >= n.y && mouseY <= n.y + n.h) {
          found = nid;
        }
      });

      if (found !== hoveredNodeId) {
        hoveredNodeId = found;
        asmeGenCanvas.style.cursor = found ? 'pointer' : 'default';
        renderAsmeGeneral(genProgress);
      }
    });

    asmeGenCanvas.addEventListener('mouseleave', () => {
      if (hoveredNodeId !== null) {
        hoveredNodeId = null;
        renderAsmeGeneral(genProgress);
      }
    });

    asmeGenCanvas.addEventListener('click', () => {
      togglePlayAsmeGen();
    });

    setTimeout(() => renderAsmeGeneral(0.0), 100);
    setTimeout(() => { if (typeof renderAsmeProgress === 'function') renderAsmeProgress(0.0); }, 120);
  }

  activateStage(0);
});
