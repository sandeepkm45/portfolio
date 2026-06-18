'use strict';
/* ═══════════════════════════════════════════════════
   san.dev  ·  Portfolio  ·  script.js
   Preloader · Particles · Typing · Reveal · Counters
   Terminal · Dots · Magnetic · Clock · Float Badge
═══════════════════════════════════════════════════ */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ══════════════════════════════════════════════════
   1. PRELOADER  —  <San.Dev/> animate then exit
══════════════════════════════════════════════════ */
(() => {
  document.body.style.overflow = 'hidden';

  const pl      = $('#preloader');
  const plFill  = $('#plFill');
  const plPct   = $('#plPct');
  const plStat  = $('#plStatus');
  const plTag   = $('#plTagline');
  const plBar   = $('#plBarWrap');
  const plCur   = $('#plCursor');

  const chars = {
    lt: $('#plLt'), san: $('#plSan'),
    dot: $('#plDot'), dev: $('#plDev'), cl: $('#plCl')
  };

  const statuses = ['Initializing…','Loading assets…','Almost there…','Ready!'];
  const SHOW_MS  = 2800; // minimum display time

  /* Step 1 — reveal brand characters */
  const steps = [
    [0,   () => chars.lt.classList.add('vis')],
    [280, () => chars.san.classList.add('vis')],
    [520, () => chars.dot.classList.add('vis')],
    [660, () => chars.dev.classList.add('vis')],
    [900, () => chars.cl.classList.add('vis')],
    [1050,() => { plTag.classList.add('vis'); plBar.classList.add('vis'); }]
  ];
  steps.forEach(([t, fn]) => setTimeout(fn, t));

  /* Step 2 — progress bar + status counter */
  let barStarted = false;
  function startBar() {
    if (barStarted) return; barStarted = true;
    const dur = 1500, t0 = performance.now();
    let si = 0;
    (function tick(now) {
      const p   = Math.min((now - t0) / dur, 1);
      const pct = Math.round(p * 100);
      if (plFill) plFill.style.width = pct + '%';
      if (plPct)  plPct.textContent  = pct + '%';
      const sIdx = Math.floor(p * (statuses.length - 1));
      if (sIdx !== si && plStat) { si = sIdx; plStat.textContent = statuses[si]; }
      if (p < 1) requestAnimationFrame(tick);
      else if (plStat) plStat.textContent = 'Ready!';
    })(performance.now());
  }
  setTimeout(startBar, 1100);

  /* Step 3 — exit after SHOW_MS or page load (whichever later) */
  let pageReady = false, timerDone = false;
  function tryExit() {
    if (!pageReady || !timerDone) return;
    if (plCur) plCur.classList.add('hide');
    setTimeout(() => {
      if (pl) pl.classList.add('pl-exit');
      setTimeout(() => {
        if (pl) pl.style.display = 'none';
        document.body.style.overflow = '';
        updateProgress();
        secDotsTick();
      }, 900);
    }, 120);
  }
  window.addEventListener('load', () => { pageReady = true; tryExit(); });
  setTimeout(() => { timerDone = true; tryExit(); }, SHOW_MS);
})();

/* ══════════════════════════════════════════════════
   2. SCROLL PROGRESS BAR
══════════════════════════════════════════════════ */
const progressBar = $('#scrollProgress');
function updateProgress() {
  if (!progressBar) return;
  const total = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = (scrollY / total * 100) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

/* ══════════════════════════════════════════════════
   3. PARTICLE CANVAS  (hero)
══════════════════════════════════════════════════ */
(() => {
  const canvas = $('#particleCanvas');
  if (!canvas) return;
  const ctx   = canvas.getContext('2d');
  const C1    = '217,119,87';   // terra
  const C2    = '121,218,200';  // teal
  const COUNT = 55, LINK = 130;
  let W, H, pts = [], raf;

  class Dot {
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - .5) * .42;
      this.vy = (Math.random() - .5) * .42;
      this.r  = 1.5 + Math.random() * 1.8;
      this.a  = .14 + Math.random() * .28;
      this.c  = Math.random() > .6 ? C2 : C1;
    }
    step() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.c},${this.a})`;
      ctx.fill();
    }
  }

  function build() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    pts = Array.from({ length: COUNT }, () => { const d = new Dot(); d.reset(); return d; });
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < COUNT; i++) {
      pts[i].step(); pts[i].draw();
      for (let j = i + 1; j < COUNT; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${pts[i].c},${(1 - d / LINK) * .11})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }

  build(); frame();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
  document.addEventListener('visibilitychange', () => document.hidden ? cancelAnimationFrame(raf) : frame());
})();

/* ══════════════════════════════════════════════════
   4. NAVBAR  —  scroll shrink · active links
══════════════════════════════════════════════════ */
const navEl  = $('#navbar');
const bttBtn = $('#backToTop');
const secs   = $$('section[id]');
const navAs  = $$('.nav-links a');

function navTick() {
  const y = scrollY;
  navEl?.classList.toggle('scrolled', y > 60);
  bttBtn?.classList.toggle('visible', y > 420);
  let cur = '';
  secs.forEach(s => { if (y >= s.offsetTop - 160) cur = s.id; });
  navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
}
window.addEventListener('scroll', navTick, { passive: true });
bttBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ══════════════════════════════════════════════════
   5. MOBILE NAV
══════════════════════════════════════════════════ */
(() => {
  const ham = $('#hamburger'), mob = $('#mobNav'), cls = $('#mobClose');
  const open  = () => { mob?.classList.add('open'); ham?.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { mob?.classList.remove('open'); ham?.classList.remove('open'); document.body.style.overflow = ''; };
  ham?.addEventListener('click', open);
  cls?.addEventListener('click', close);
  $$('.mob-nav a').forEach(a => a.addEventListener('click', close));
})();

/* ══════════════════════════════════════════════════
   6. SMOOTH SCROLL
══════════════════════════════════════════════════ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.getElementById(a.getAttribute('href').slice(1));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 76, behavior: 'smooth' });
  });
});

/* ══════════════════════════════════════════════════
   7. SCROLL REVEAL
══════════════════════════════════════════════════ */
new IntersectionObserver(
  (entries, obs) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } }),
  { threshold: 0.08, rootMargin: '0px 0px -28px 0px' }
).observe ? (() => {
  const ro = new IntersectionObserver(
    (entries, obs) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } }),
    { threshold: 0.08, rootMargin: '0px 0px -28px 0px' }
  );
  $$('.reveal').forEach(el => ro.observe(el));
})() : $$('.reveal').forEach(el => el.classList.add('in'));

/* ══════════════════════════════════════════════════
   8. COUNTER ANIMATION  (stat numbers)
══════════════════════════════════════════════════ */
$$('[data-target]').forEach(el => {
  new IntersectionObserver((ents, obs) => {
    if (!ents[0].isIntersecting) return;
    obs.disconnect();
    const to = parseFloat(el.dataset.target);
    const dec = parseInt(el.dataset.decimal) || 0;
    const suf = el.dataset.suffix || '';
    const dur = 1700, t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const v = (1 - Math.pow(1 - p, 3)) * to;
      el.textContent = (p < 1 ? v : to).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }, { threshold: 0.7 }).observe(el);
});

/* ══════════════════════════════════════════════════
   9. TYPING EFFECT  (hero eyebrow)
══════════════════════════════════════════════════ */
(() => {
  const el = $('.hero .typed-text');
  if (!el) return;
  const lines = [
    'ECE Student & Embedded Maker',
    'Hardware & Software Developer',
    'Robotics Enthusiast',
    'Open to Internships 🚀',
    'ECE Student & Embedded Maker'
  ];
  let li = 0, ci = 0, del = false;
  function tick() {
    const w = lines[li];
    if (!del) {
      ci++;
      el.textContent = w.slice(0, ci);
      if (ci === w.length) {
        if (li === lines.length - 1) return;
        del = true; return setTimeout(tick, 2400);
      }
      return setTimeout(tick, 76);
    } else {
      ci--;
      el.textContent = w.slice(0, ci);
      if (ci === 0) { del = false; li = (li + 1) % lines.length; return setTimeout(tick, 320); }
      return setTimeout(tick, 40);
    }
  }
  setTimeout(tick, 3400); // start after preloader clears
})();

/* ══════════════════════════════════════════════════
   10. 3-D TILT  (skill cards)
══════════════════════════════════════════════════ */
if (!window.matchMedia('(hover:none)').matches) {
  $$('.skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) scale(1.03)`;
      card.style.transition = 'box-shadow .3s ease, border-color .3s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'box-shadow .3s ease, transform .4s ease, border-color .3s ease';
    });
  });
}

/* ══════════════════════════════════════════════════
   11. MOUSE SPOTLIGHT  (project cards)
══════════════════════════════════════════════════ */
$$('.proj-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--sx', `${e.clientX - r.left}px`);
    card.style.setProperty('--sy', `${e.clientY - r.top}px`);
    card.style.setProperty('--so', '1');
  });
  card.addEventListener('mouseleave', () => card.style.setProperty('--so', '0'));
});

/* ══════════════════════════════════════════════════
   12. TERMINAL  —  animated typing on scroll
══════════════════════════════════════════════════ */
(() => {
  const body = $('.terminal-body');
  if (!body) return;
  const lines = body.querySelectorAll('.t-line, .t-blank');
  lines.forEach(l => l.style.opacity = '0');
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    entries[0].target.closest('.terminal-card').style.removeProperty('opacity');
    lines.forEach((l, i) => setTimeout(() => { l.style.transition = 'opacity .25s ease'; l.style.opacity = '1'; }, i * 75));
  }, { threshold: 0.3 }).observe(body);
})();

/* ══════════════════════════════════════════════════
   13. LIVE TERMINAL CLOCK
══════════════════════════════════════════════════ */
(() => {
  const el = $('#termClock');
  if (!el) return;
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function update() {
    const n = new Date();
    const hh = String(n.getHours()).padStart(2,'0');
    const mm = String(n.getMinutes()).padStart(2,'0');
    const ss = String(n.getSeconds()).padStart(2,'0');
    el.textContent = `${days[n.getDay()]} ${mons[n.getMonth()]} ${n.getDate()} ${hh}:${mm}:${ss}`;
  }
  update(); setInterval(update, 1000);
})();

/* ══════════════════════════════════════════════════
   14. SECTION DOTS
══════════════════════════════════════════════════ */
const dotNav  = $('#secDots');
const dotEls  = $$('.sd');
const dotSecs = $$('section[id]');

function secDotsTick() {
  if (!dotNav) return;
  const y = scrollY;
  dotNav.classList.toggle('vis', y > 400);
  let cur = '';
  dotSecs.forEach(s => { if (y >= s.offsetTop - 200) cur = s.id; });
  dotEls.forEach(d => d.classList.toggle('active', d.getAttribute('href') === `#${cur}`));
}
window.addEventListener('scroll', secDotsTick, { passive: true });
dotEls.forEach(d => d.addEventListener('click', e => {
  e.preventDefault();
  const t = document.getElementById(d.getAttribute('href').slice(1));
  if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 76, behavior: 'smooth' });
}));

/* ══════════════════════════════════════════════════
   15. MAGNETIC BUTTONS
══════════════════════════════════════════════════ */
if (!window.matchMedia('(hover:none)').matches) {
  $$('.mag-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.28;
      const y = (e.clientY - r.top  - r.height / 2) * 0.28;
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform  = '';
      btn.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
      setTimeout(() => btn.style.transition = '', 500);
    });
  });
}

/* ══════════════════════════════════════════════════
   16. FLOAT BADGE  —  delay show · dismiss
══════════════════════════════════════════════════ */
(() => {
  const badge = $('#floatBadge');
  const xBtn  = $('#fbX');
  if (!badge) return;
  setTimeout(() => badge.classList.add('vis'), 3800);
  xBtn?.addEventListener('click', e => {
    e.stopPropagation();
    badge.classList.add('gone');
  });
})();

/* ══════════════════════════════════════════════════
   17. FOOTER YEAR
══════════════════════════════════════════════════ */
const fy = $('#fyear');
if (fy) fy.textContent = new Date().getFullYear();

/* ══════════════════════════════════════════════════
   18. ROBOT EYE BLINK  (extra animation via class toggle)
══════════════════════════════════════════════════ */
(() => {
  const eyes = $$('.eye-glow');
  if (!eyes.length) return;
  function blink() {
    eyes.forEach(e => {
      e.style.transform = 'scaleY(0.1)';
      setTimeout(() => e.style.transform = '', 120);
    });
    // random interval 3–7s
    setTimeout(blink, 3000 + Math.random() * 4000);
  }
  setTimeout(blink, 2500);
})();

/* ══════════════════════════════════════════════════
   19. CONTACT CARDS  —  staggered reveal
══════════════════════════════════════════════════ */
(() => {
  const cards = $$('.cc-card');
  if (!cards.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const i = cards.indexOf(e.target);
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
        }, i * 90);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(20px)';
    c.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(.22,1,.36,1), box-shadow .26s ease, border-color .26s ease';
    obs.observe(c);
  });
})();

/* ══════════════════════════════════════════════════
   20. SKILLS GRID  —  card pop-in stagger
══════════════════════════════════════════════════ */
(() => {
  const grid = $$('.skill-card');
  if (!grid.length) return;
  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    grid.forEach((c, i) => setTimeout(() => c.classList.add('in'), i * 60));
    obs.disconnect();
  }, { threshold: 0.1 });
  if ($('.skills-grid')) obs.observe($('.skills-grid'));
})();
