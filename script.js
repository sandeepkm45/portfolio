'use strict';
/* ═══════════════════════════════════════════════════
   SANDEEP KUMAR MISHRA  ·  Portfolio  ·  script.js
   Preloader · Particles · Typing · Reveal · Counters
   Tilt · Spotlight · Cursor · Nav · Mobile · Top
═══════════════════════════════════════════════════ */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ══════════════════════════════════════════════════
   1.  PRELOADER
══════════════════════════════════════════════════ */
document.body.style.overflow = 'hidden';

window.addEventListener('load', () => {
  setTimeout(() => {
    const pl = $('#preloader');
    if (pl) pl.classList.add('done');
    document.body.style.overflow = '';
    // kick off scroll-progress bar
    updateProgress();
  }, 1350);
});

/* ══════════════════════════════════════════════════
   2.  SCROLL PROGRESS BAR
══════════════════════════════════════════════════ */
const progressBar = $('#scrollProgress');

function updateProgress() {
  if (!progressBar) return;
  const total = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = (scrollY / total * 100) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

/* ══════════════════════════════════════════════════
   3.  PARTICLE CANVAS  (hero background)
══════════════════════════════════════════════════ */
(() => {
  const canvas = $('#particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const TERRA = '217,119,87';
  const COUNT = 55;
  const LINK  = 128;
  let W, H, pts = [], raf;

  class Dot {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - .5) * .45;
      this.vy = (Math.random() - .5) * .45;
      this.r  = 1.5 + Math.random() * 1.8;
      this.a  = .14 + Math.random() * .3;
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${TERRA},${this.a})`;
      ctx.fill();
    }
  }

  function build() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    pts = Array.from({ length: COUNT }, () => new Dot());
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < COUNT; i++) {
      pts[i].step();
      pts[i].draw();
      for (let j = i + 1; j < COUNT; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${TERRA},${(1 - d / LINK) * .12})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }

  build();
  frame();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });
  document.addEventListener('visibilitychange', () =>
    document.hidden ? cancelAnimationFrame(raf) : frame()
  );
})();

/* ══════════════════════════════════════════════════
   4.  NAVBAR  — active links · back-to-top · shrink
══════════════════════════════════════════════════ */
(() => {
  const nav  = $('#navbar');
  const btt  = $('#backToTop');
  const secs = $$('section[id]');
  const lnks = $$('.nav-links a');

  function tick() {
    const y = scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 60);
    if (btt) btt.classList.toggle('visible', y > 420);

    let cur = '';
    secs.forEach(s => { if (y >= s.offsetTop - 160) cur = s.id; });
    lnks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
  }

  window.addEventListener('scroll', tick, { passive: true });
  btt?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ══════════════════════════════════════════════════
   5.  MOBILE NAV
══════════════════════════════════════════════════ */
(() => {
  const ham = $('#hamburger');
  const mob = $('#mobNav');
  const cls = $('#mobClose');

  const open = () => {
    mob?.classList.add('open');
    ham?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    mob?.classList.remove('open');
    ham?.classList.remove('open');
    document.body.style.overflow = '';
  };

  ham?.addEventListener('click', open);
  cls?.addEventListener('click', close);
  $$('.mob-nav a').forEach(a => a.addEventListener('click', close));
})();

/* ══════════════════════════════════════════════════
   6.  SMOOTH SCROLL  (all hash links)
══════════════════════════════════════════════════ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 76, behavior: 'smooth' });
  });
});

/* ══════════════════════════════════════════════════
   7.  SCROLL REVEAL
══════════════════════════════════════════════════ */
const ro = new IntersectionObserver(
  (entries, obs) => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
  }),
  { threshold: 0.08, rootMargin: '0px 0px -28px 0px' }
);
$$('.reveal').forEach(el => ro.observe(el));

/* ══════════════════════════════════════════════════
   8.  COUNTER ANIMATION  (stat numbers)
══════════════════════════════════════════════════ */
$$('[data-target]').forEach(el => {
  const co = new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();

    const to     = parseFloat(el.dataset.target);
    const dec    = parseInt(el.dataset.decimal) || 0;
    const suffix = el.dataset.suffix || '';
    const dur    = 1700;
    const t0     = performance.now();

    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const v = (1 - Math.pow(1 - p, 3)) * to;   /* ease-out cubic */
      el.textContent = (p < 1 ? v : to).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());

  }, { threshold: 0.7 });
  co.observe(el);
});

/* ══════════════════════════════════════════════════
   9.  TYPING EFFECT  (hero eyebrow)
══════════════════════════════════════════════════ */
(() => {
  const el = document.querySelector('.hero .typed-text');
  if (!el) return;

  const lines = [
    'ECE Student & Embedded Maker',
    'Hardware & Software Developer',
    'Robotics Enthusiast',
    'Open to Internships 🚀',
    'ECE Student & Embedded Maker'   /* end on first phrase */
  ];

  let li = 0, ci = 0, del = false;

  function tick() {
    const word = lines[li];
    if (!del) {
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci === word.length) {
        if (li === lines.length - 1) return;  /* stop at last */
        del = true;
        return setTimeout(tick, 2400);
      }
      return setTimeout(tick, 76);
    } else {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0) {
        del = false;
        li  = (li + 1) % lines.length;
        return setTimeout(tick, 320);
      }
      return setTimeout(tick, 40);
    }
  }
  setTimeout(tick, 1800);
})();

/* ══════════════════════════════════════════════════
   10.  3-D TILT  (skill cards)
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
   11.  MOUSE SPOTLIGHT  (project cards)
══════════════════════════════════════════════════ */
$$('.proj-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--sx', `${e.clientX - r.left}px`);
    card.style.setProperty('--sy', `${e.clientY - r.top}px`);
    card.style.setProperty('--so', '1');
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--so', '0');
  });
});

/* ══════════════════════════════════════════════════
   12.  CUSTOM CURSOR  (desktop only)
══════════════════════════════════════════════════ */
(() => {
  if (window.matchMedia('(hover:none),(pointer:coarse)').matches) return;

  const ring = document.createElement('div'); ring.id = 'c-ring';
  const dot  = document.createElement('div'); dot.id  = 'c-dot';
  document.body.append(ring, dot);

  let mx = -400, my = -400, rx = -400, ry = -400;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx - 3}px,${my - 3}px)`;
  });

  (function loop() {
    rx += (mx - rx) * .13;
    ry += (my - ry) * .13;
    ring.style.transform = `translate(${rx - 18}px,${ry - 18}px)`;
    requestAnimationFrame(loop);
  })();

  const hoverEls = 'a,button,.skill-card,.proj-card,.edu-card,.chip,.clink,.aside-block li,.cpill,.tpill';
  $$(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hov'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hov'));
  });

  document.addEventListener('mouseleave', () => {
    ring.style.opacity = dot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    ring.style.opacity = dot.style.opacity = '1';
  });
})();

/* ══════════════════════════════════════════════════
   13.  TERMINAL  — animated typing on scroll
══════════════════════════════════════════════════ */
(() => {
  const body = document.querySelector('.terminal-body');
  if (!body) return;

  const lines = body.querySelectorAll('.t-line, .t-blank');
  lines.forEach(l => { l.style.opacity = '0'; });

  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    lines.forEach((l, i) => {
      setTimeout(() => {
        l.style.transition = 'opacity .25s ease';
        l.style.opacity = '1';
      }, i * 80);
    });
  }, { threshold: 0.3 });

  obs.observe(body);
})();