const title = document.querySelector('.title');
if (title) requestAnimationFrame(() => title.classList.add('is-visible'));

const services = document.querySelectorAll('.service');
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    replay(entry.target);
    io.unobserve(entry.target);
  });
}, { threshold: .27 });
services.forEach(s => io.observe(s));

function typeText(root) {
  const target = root.querySelector('.typed');
  if (!target) return;
  const text = 'webdesigner venlo';
  let i = 0;
  clearInterval(root._typing);
  target.textContent = '';
  root._typing = setInterval(() => {
    target.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(root._typing);
  }, 66);
  const ring = root.querySelector('.seo-ring');
  if (ring) {
    ring.animate([
      { background: 'conic-gradient(var(--green) 0deg,#e7eee9 0deg)' },
      { background: 'conic-gradient(var(--green) 352deg,#e7eee9 352deg)' }
    ], { duration: 1200, delay: 1250, easing: 'cubic-bezier(.22,.84,.28,1)', fill: 'forwards' });
  }
}

function runUptime(root) {
  const el = root.querySelector('.uptime-value');
  if (!el) return;
  const from = 99, to = 99.98, duration = 1450, start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration), e = 1 - Math.pow(1 - t, 3);
    el.textContent = (from + (to - from) * e).toFixed(2);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  animateTracer(root);
}

function animateTracer(root) {
  const path = root.querySelector('.chart path'), dot = root.querySelector('.chart-tracer');
  if (!path || !dot) return;
  const len = path.getTotalLength(), start = performance.now() + 350, duration = 2300;
  dot.style.opacity = '0';
  function step(now) {
    if (now < start) { requestAnimationFrame(step); return; }
    const t = Math.min(1, (now - start) / duration), e = 1 - Math.pow(1 - t, 2.4),
      p = path.getPointAtLength(len * e);
    dot.style.left = (p.x / 620 * 100) + '%';
    dot.style.top = (p.y / 130 * 100) + '%';
    dot.style.opacity = t < .04 ? String(t / .04) : t > .9 ? String((1 - t) / .1) : '1';
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function animateSvgPacket(root, pathSelector, dotSelector, delay, duration) {
  const path = root.querySelector(pathSelector), dot = root.querySelector(dotSelector);
  if (!path || !dot) return;
  const board = root.querySelector('.smart-board'), svg = root.querySelector('.smart-links');
  if (!board || !svg) return;
  const len = path.getTotalLength(), start = performance.now() + delay;
  dot.style.opacity = '0';
  function step(now) {
    if (now < start) { requestAnimationFrame(step); return; }
    const t = Math.min(1, (now - start) / duration),
      e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
      p = path.getPointAtLength(len * e);
    const vb = svg.viewBox.baseVal;
    dot.style.left = (p.x / vb.width * 100) + '%';
    dot.style.top = ((p.y + 11) / (vb.height + 25) * 100) + '%';
    dot.style.opacity = t < .08 ? String(t / .08) : t > .9 ? String((1 - t) / .1) : '1';
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function animateEnginePacket(root, pathSelector, dotSelector, delay, duration) {
  const path = root.querySelector(pathSelector), dot = root.querySelector(dotSelector),
    pipe = root.querySelector('.pipeline'), svg = root.querySelector('.engine-links');
  if (!path || !dot || !pipe || !svg) return;
  const len = path.getTotalLength(), start = performance.now() + delay, vb = svg.viewBox.baseVal;
  dot.style.opacity = '0';
  function step(now) {
    if (now < start) { requestAnimationFrame(step); return; }
    const t = Math.min(1, (now - start) / duration),
      e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
      p = path.getPointAtLength(len * e);
    dot.style.left = (p.x / vb.width * 100) + '%';
    dot.style.top = (p.y / vb.height * 100) + '%';
    dot.style.opacity = t < .08 ? String(t / .08) : t > .9 ? String((1 - t) / .1) : '1';
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function countTo(el, from, to, duration, delay = 0, decimals = 0) {
  if (!el) return;
  const start = performance.now() + delay;
  function tick(now) {
    if (now < start) { requestAnimationFrame(tick); return; }
    const t = Math.min(1, (now - start) / duration), e = 1 - Math.pow(1 - t, 3),
      v = from + (to - from) * e;
    el.textContent = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('nl-NL');
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function runSmart(root) {
  animateEnginePacket(root, '.ep1', '.dp1', 1250, 760);
  setTimeout(() => animateEnginePacket(root, '.ep2', '.dp1', 0, 850), 2050);
  setTimeout(() => animateEnginePacket(root, '.ep3', '.dp1', 0, 760), 3100);
  setTimeout(() => animateEnginePacket(root, '.ep4', '.dp2', 0, 800), 3180);
  const score = root.querySelector('.score-number'),
    leadScore = root.querySelector('.lead-score'),
    saved = root.querySelector('.saved-number'),
    events = root.querySelector('.event-count');
  if (score) score.textContent = '0';
  if (leadScore) leadScore.textContent = '0';
  if (saved) saved.textContent = '0';
  if (events) events.textContent = '1.243';
  countTo(score, 0, 86, 720, 2650);
  countTo(leadScore, 0, 86, 720, 2450);
  countTo(saved, 0, 18, 760, 3900);
  countTo(events, 1243, 1248, 900, 900);
}

function replay(root) {
  if (root.dataset.service === 'seo') typeText(root);
  if (root.dataset.service === 'smart') runSmart(root);
  if (root.dataset.service === 'hosting') runUptime(root);
}

document.querySelectorAll('.visual .card').forEach(card => {
  const root = card.closest('.service');
  card.addEventListener('mouseenter', () => replay(root));
  card.addEventListener('pointermove', e => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = card.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width,
      y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--mx', (x * 100) + '%');
    card.style.setProperty('--my', (y * 100) + '%');
    card.style.setProperty('--ry', ((x - .5) * 2.2) + 'deg');
    card.style.setProperty('--rx', ((.5 - y) * 1.8) + 'deg');
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
});

// Smart feature price counter
function runSmartFeature(root) {
  const el = root.querySelector('.sf-price-number');
  if (el) {
    const start = performance.now() + 3100, from = 799, to = 1649, duration = 1050;
    el.textContent = '799';
    function tick(now) {
      if (now < start) { requestAnimationFrame(tick); return; }
      const t = Math.min(1, (now - start) / duration), e = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * e).toLocaleString('nl-NL');
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const log = root.querySelector('.sf-log-text');
  if (log) {
    log.textContent = 'Nieuwe aanvraag ontvangen';
    setTimeout(() => log.textContent = 'Indicatie berekend · 84 ms', 3700);
    setTimeout(() => log.textContent = 'CRM + mail + analytics bijgewerkt', 5000);
  }
}

// Override replay to also handle the smart feature card
const originalReplay = replay;
function replayExtended(root) {
  originalReplay(root);
  if (root.dataset.service === 'smart') runSmartFeature(root);
}
// Re-observe with extended replay
services.forEach(s => {
  s._replayHandler = () => replayExtended(s);
});
document.querySelectorAll('.visual .card').forEach(card => {
  const root = card.closest('.service');
  card.removeEventListener('mouseenter', () => replay(root));
  card.addEventListener('mouseenter', () => replayExtended(root));
});
