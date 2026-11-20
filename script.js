/* CICS shared interactivity. Loaded at the end of every page. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile menu */
  const mb = $('.menu-btn'), nav = $('header nav');
  if (mb) mb.addEventListener('click', () => {
    nav.classList.toggle('open');
    mb.textContent = nav.classList.contains('open') ? '✕' : '☰';
  });

  /* Progress bar, back-to-top, sticky header */
  const bar = document.createElement('div'); bar.id = 'progress'; document.body.prepend(bar);
  const topBtn = document.createElement('button');
  topBtn.id = 'toTop'; topBtn.textContent = '↑'; topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  document.body.append(topBtn);
  let scrollFrame = 0;
  const onScroll = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const h = document.documentElement;
      bar.style.transform = `scaleX(${h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)})`;
      topBtn.classList.toggle('show', h.scrollTop > 600);
      $('header').classList.toggle('stuck', h.scrollTop > 10);
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Toast */
  const toastEl = document.createElement('div'); toastEl.id = 'toast'; document.body.append(toastEl);
  let tt;
  window.toast = msg => {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };

  /* Scroll reveal with stagger */
  const revealSel = 'section:not(.page-hero):not(.hero) .container > *, .stat, .prog, .card, .ach-item, .tl, .val, .logo-box, .node, .mini, .dl, .step, .club, .info, .soc, .staff, .lab, .goal';
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .08 });
  window.observeReveal = root => $$(revealSel, root).forEach(e => {
    if (e.classList.contains('reveal') || e.closest('.hero')) return;
    const sibs = [...e.parentElement.children];
    e.style.transitionDelay = Math.min(sibs.indexOf(e), 6) * 70 + 'ms';
    e.classList.add('reveal'); io.observe(e);
  });
  observeReveal(document);

  /* Count-up numbers: <b data-count="31" data-suffix="+"> */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: .5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* Typewriter: <span data-typed="one|two|three"> */
  $$('[data-typed]').forEach(el => {
    const words = el.dataset.typed.split('|'); let w = 0, i = 0, del = false;
    el.textContent = '';
    const caret = document.createElement('span'); caret.className = 'caret'; el.after(caret);
    if (reduce) { el.textContent = words[0]; return; }
    (function step() {
      const word = words[w];
      i += del ? -1 : 1;
      el.textContent = word.slice(0, i);
      let d = del ? 45 : 95;
      if (!del && i === word.length) { del = true; d = 1600; }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; d = 400; }
      setTimeout(step, d);
    })();
  });

  /* Spotlight glow that follows the cursor on cards */
  $$('.prog, .stat, .mini, .lab, .club, .ach-item, .info, .val, .mv, .goal, .card').forEach(c => {
    c.classList.add('has-spot');
    const s = document.createElement('i'); s.className = 'spot'; c.prepend(s);
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      s.style.setProperty('--mx', e.clientX - r.left + 'px');
      s.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });

  /* Particle network background in heroes */
  $$('.hero, .page-hero').forEach(host => {
    if (reduce) return;
    const cv = document.createElement('canvas'); cv.className = 'fx'; host.prepend(cv);
    const ctx = cv.getContext('2d'); let W, H, pts = [], mouse = { x: -999, y: -999 };
    const size = () => {
      const r = host.getBoundingClientRect(); W = cv.width = r.width; H = cv.height = r.height;
      const n = Math.min(70, Math.floor(W * H / 14000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 }));
    };
    size(); addEventListener('resize', size);
    host.addEventListener('pointermove', e => { const r = host.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    host.addEventListener('pointerleave', () => mouse = { x: -999, y: -999 });
    let visible = false, frame = 0, lastFrame = 0;
    const draw = now => {
      frame = 0;
      if (!visible || document.hidden) return;
      if (now - lastFrame >= 1000 / 30) {
        lastFrame = now;
        ctx.clearRect(0, 0, W, H);
        for (const p of pts) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
          if (d > 0 && d < 120) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 7); ctx.fillStyle = 'rgba(110,231,183,.8)'; ctx.fill();
        }
        for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) {
          const d = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
          if (d < 120) { ctx.strokeStyle = `rgba(110,231,183,${.28 * (1 - d / 120)})`; ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke(); }
        }
      }
      frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      if (visible && !document.hidden && !frame) {
        lastFrame = 0;
        frame = requestAnimationFrame(draw);
      }
    };
    const visibility = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) wake();
      else { cancelAnimationFrame(frame); frame = 0; }
    });
    visibility.observe(host);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else wake();
    });
  });

  /* Generic tabs: [data-tabs] > .tab-list button[data-tab] + .tab-panel[data-panel] */
  $$('[data-tabs]').forEach(box => {
    const btns = $$('[data-tab]', box), panels = $$('[data-panel]', box);
    box.activate = id => {
      btns.forEach(b => b.classList.toggle('on', b.dataset.tab === id));
      panels.forEach(p => p.classList.toggle('on', p.dataset.panel === id));
    };
    btns.forEach(b => b.addEventListener('click', () => box.activate(b.dataset.tab)));
  });
  const openHash = () => {
    const id = location.hash.slice(1); if (!id) return;
    const panel = $(`[data-panel="${id}"]`);
    if (panel) { panel.closest('[data-tabs]').activate(id); setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }
  };
  addEventListener('hashchange', openHash); openHash();

  /* Generic filter chips: [data-filter-group] with buttons[data-filter] and items[data-cat] */
  $$('[data-filter-group]').forEach(g => {
    const items = $$(g.dataset.filterGroup);
    $$('[data-filter]', g).forEach(b => b.addEventListener('click', () => {
      $$('[data-filter]', g).forEach(x => x.classList.toggle('on', x === b));
      items.forEach(it => it.classList.toggle('hide', b.dataset.filter !== 'all' && !it.dataset.cat.split(' ').includes(b.dataset.filter)));
    }));
  });

  /* Expandable track cards */
  $$('.track').forEach(t => t.addEventListener('click', () => t.classList.toggle('open')));

  /* Scrollspy for the sub navigation */
  const links = $$('.subnav a[href^="#"]');
  if (links.length) {
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && map.has(e.target.id)) {
        links.forEach(l => l.classList.remove('on'));
        const active = map.get(e.target.id);
        active.classList.add('on');
        const scroller = active.parentElement;
        const linkRect = active.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        if (linkRect.left < scrollerRect.left) scroller.scrollLeft -= scrollerRect.left - linkRect.left;
        else if (linkRect.right > scrollerRect.right) scroller.scrollLeft += linkRect.right - scrollerRect.right;
      }
    }), { rootMargin: '-35% 0px -60% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* Click-to-copy: <button data-copy="text"> */
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => {
    navigator.clipboard?.writeText(b.dataset.copy).then(() => toast('Copied: ' + b.dataset.copy));
  }));
})();
