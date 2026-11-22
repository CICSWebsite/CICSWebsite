/*
 * CardNav, vanilla JavaScript port of the React Bits component (no React needed).
 * Requires cardnav.css.
 *
 * Usage:
 *   CardNav(document.querySelector('#nav'), { logo: 'logo.svg', items: [...], cta: { label: 'Apply', href: '#' } });
 *
 * Options match the React props: items, logo, logoAlt, logoHref, cta, theme, surface, openOn,
 * cardEffect, stagger, bounce, speed, cardHeight, maxWidth, accentColor, menuLabel, intro,
 * defaultOpen, onOpenChange, onLinkClick, ariaLabel, className, vars (extra CSS variables).
 * Returns { open(), close(), toggle(), destroy() }.
 *
 * Site configuration lives at the bottom: any <div data-cardnav> is turned into the CICS nav.
 */
(function (global) {
  'use strict';

  var THEMES = {
    dark: {
      '--cn-panel': 'rgba(38, 35, 46, 0.72)', '--cn-solid': '#26232e', '--cn-edge': 'rgba(255, 255, 255, 0.08)',
      '--cn-highlight': 'rgba(255, 255, 255, 0.07)',
      '--cn-shadow': '0 24px 48px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
      '--cn-text': '#f4f4f5', '--cn-muted': 'rgba(244, 244, 245, 0.56)', '--cn-hover': 'rgba(255, 255, 255, 0.06)',
      '--cn-ring': 'rgba(244, 244, 245, 0.55)', '--cn-tile': 'linear-gradient(180deg, #34303d 0%, #27242f 100%)',
      '--cn-tile-rim': 'inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 10px -4px rgba(0, 0, 0, 0.6)',
      '--cn-cta': 'linear-gradient(180deg, #ffffff 0%, #ebebf0 100%)', '--cn-cta-ink': '#121016',
      '--cn-cta-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 6px 16px -6px rgba(0, 0, 0, 0.6)',
      '--cn-cta-hover': 'brightness(0.94)'
    },
    light: {
      '--cn-panel': 'rgba(244, 244, 246, 0.84)', '--cn-solid': '#f4f4f6', '--cn-edge': 'rgba(24, 24, 27, 0.07)',
      '--cn-highlight': 'rgba(255, 255, 255, 0.95)',
      '--cn-shadow': '0 24px 48px -24px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
      '--cn-text': '#18181b', '--cn-muted': 'rgba(24, 24, 27, 0.56)', '--cn-hover': 'rgba(24, 24, 27, 0.05)',
      '--cn-ring': 'rgba(24, 24, 27, 0.45)', '--cn-tile': 'linear-gradient(180deg, #ffffff 0%, #f8f8fa 100%)',
      '--cn-tile-rim': 'inset 0 0 0 1px rgba(24, 24, 27, 0.07), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(24, 24, 27, 0.22)',
      '--cn-cta': 'linear-gradient(180deg, #2c2c31 0%, #18181b 100%)', '--cn-cta-ink': '#ffffff',
      '--cn-cta-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 6px 14px -6px rgba(24, 24, 27, 0.45)',
      '--cn-cta-hover': 'brightness(1.25)'
    }
  };

  var NARROW = 560;
  var EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
  var uid = 0;

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function contrastInk(color) {
    var hex = String(color || '').trim().replace('#', '');
    if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
    var full = hex.length === 3 ? hex.split('').map(function (c) { return c + c; }).join('') : hex;
    function ch(i) {
      var v = parseInt(full.slice(i, i + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    var lum = 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
    return lum > 0.36 ? '#121016' : '#ffffff';
  }

  var ARROW_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>';

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    });
    return n;
  }

  function CardNav(host, options) {
    var o = Object.assign({
      logo: null, logoAlt: 'Logo', logoHref: '#', items: [], cta: null, theme: 'dark', surface: 'glass',
      openOn: 'click', cardEffect: 'rise', stagger: 0.12, bounce: 0.2, speed: 1, cardHeight: 176,
      maxWidth: 800, accentColor: null, menuLabel: true, intro: true, defaultOpen: false,
      onOpenChange: null, onLinkClick: null, ariaLabel: 'Main', className: '', vars: null
    }, options || {});

    var stagger = clamp(o.stagger, 0, 0.3), bounce = clamp(o.bounce, 0, 1), speed = clamp(o.speed, 0.2, 3);
    var contentId = 'card-nav-content-' + (++uid);
    var open = !!o.defaultOpen, shown = open, narrow = false;
    var leaveTimer = 0;

    // ---- Theme variables ----
    var palette = THEMES[o.theme] || THEMES.dark;
    var vars = Object.assign({}, palette, {
      '--cn-max': o.maxWidth + 'px', '--cn-bar': '60px', '--cn-inset': '8px', '--cn-gap': '8px',
      '--cn-radius': '18px', '--cn-logo': '24px', '--cn-card': o.cardHeight + 'px'
    });
    if (o.surface === 'glass') vars['--cn-blur'] = 'blur(20px) saturate(1.6)';
    if (o.surface === 'solid') { vars['--cn-panel'] = palette['--cn-solid']; vars['--cn-blur'] = 'none'; }
    if (o.accentColor) {
      vars['--cn-cta'] = o.accentColor;
      vars['--cn-cta-ink'] = contrastInk(o.accentColor) || '#ffffff';
      vars['--cn-cta-shadow'] = 'inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 6px 16px -6px rgba(0, 0, 0, 0.45)';
      vars['--cn-cta-hover'] = 'brightness(1.08)';
    }
    if (o.vars) Object.assign(vars, o.vars);

    // ---- DOM ----
    var root = el('div', 'card-nav' + (o.className ? ' ' + o.className : ''));
    Object.keys(vars).forEach(function (k) { root.style.setProperty(k, vars[k]); });
    var panel = el('div', 'card-nav__panel', { role: 'navigation', 'aria-label': o.ariaLabel });
    var bar = el('div', 'card-nav__bar');

    var menuBtn = el('button', 'card-nav__menu', { type: 'button', 'aria-expanded': String(open), 'aria-controls': contentId });
    if (!o.menuLabel) { menuBtn.setAttribute('data-icon-only', ''); }
    menuBtn.innerHTML = '<span class="card-nav__burger" aria-hidden="true"><span class="card-nav__line card-nav__line--top"></span><span class="card-nav__line card-nav__line--bottom"></span></span>' +
      (o.menuLabel ? '<span class="card-nav__menu-label"><span class="card-nav__word card-nav__word--open">Menu</span><span class="card-nav__word card-nav__word--close">Close</span></span>' : '');
    bar.appendChild(menuBtn);

    if (o.logo) {
      var logoLink = el('a', 'card-nav__logo', { href: o.logoHref, 'aria-label': o.logoAlt });
      if (typeof o.logo === 'string' && o.logo.charAt(0) === '<') logoLink.innerHTML = o.logo;
      else if (typeof o.logo === 'string') { var img = el('img', null, { src: o.logo, alt: '', draggable: 'false' }); logoLink.appendChild(img); }
      else logoLink.appendChild(o.logo);
      bar.appendChild(logoLink);
    }

    function anchor(target, cls) {
      var node = target.href ? el('a', cls, { href: target.href }) : el('button', cls, { type: 'button' });
      if (target.ariaLabel) node.setAttribute('aria-label', target.ariaLabel);
      if (target.external) { node.setAttribute('target', '_blank'); node.setAttribute('rel', 'noopener'); }
      return node;
    }

    var barCta = null, wideCta = null, ctaWrap = null;
    if (o.cta) {
      barCta = anchor(o.cta, 'card-nav__cta'); barCta.textContent = o.cta.label;
      barCta.addEventListener('click', function (e) { if (o.cta.onClick) o.cta.onClick(e); });
      bar.appendChild(barCta);
    }

    var content = el('div', 'card-nav__content', { id: contentId, 'aria-hidden': String(!open) });
    var cardsWrap = el('div', 'card-nav__cards');
    var cards = [];
    var currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var linkNodes = [];

    o.items.forEach(function (item) {
      var card = el('div', 'card-nav__card');
      if (item.bgColor) {
        card.setAttribute('data-tinted', '');
        card.style.background = item.bgColor;
        if (item.textColor) card.style.color = item.textColor;
      }
      var head = el('div', 'card-nav__card-head');
      var label = el('span', 'card-nav__label'); label.textContent = item.label; head.appendChild(label);
      if (item.description) { var d = el('p', 'card-nav__description'); d.textContent = item.description; head.appendChild(d); }
      card.appendChild(head);
      var ul = el('ul', 'card-nav__links');
      (item.links || []).forEach(function (link) {
        var li = document.createElement('li');
        var a = anchor(link, 'card-nav__link');
        a.tabIndex = open ? 0 : -1;
        a.innerHTML = '<span class="card-nav__arrow" aria-hidden="true"><span class="card-nav__arrow-icon card-nav__arrow-icon--out">' + ARROW_SVG +
          '</span><span class="card-nav__arrow-icon card-nav__arrow-icon--in">' + ARROW_SVG + '</span></span>';
        a.appendChild(document.createTextNode(link.label));
        if (link.href && link.href.split('#')[0].toLowerCase() === currentFile) a.setAttribute('aria-current', 'page');
        a.addEventListener('click', function (e) {
          if (o.onLinkClick) o.onLinkClick(link, item, e);
          setOpen(false);
        });
        linkNodes.push(a);
        li.appendChild(a); ul.appendChild(li);
      });
      card.appendChild(ul);
      cardsWrap.appendChild(card);
      cards.push(card);
    });
    content.appendChild(cardsWrap);

    if (o.cta) {
      ctaWrap = el('div', 'card-nav__cta-wrap');
      wideCta = anchor(o.cta, 'card-nav__cta card-nav__cta--wide');
      wideCta.textContent = o.cta.label;
      wideCta.tabIndex = open ? 0 : -1;
      wideCta.addEventListener('click', function (e) { if (o.cta.onClick) o.cta.onClick(e); setOpen(false); });
      ctaWrap.appendChild(wideCta);
      content.appendChild(ctaWrap);
      cards.push(ctaWrap);
    }

    var rim = el('span', 'card-nav__rim');
    panel.appendChild(bar); panel.appendChild(content); panel.appendChild(rim);
    root.appendChild(panel);
    host.textContent = '';
    host.appendChild(root);

    function syncAttrs() {
      root.toggleAttribute('data-open', open);
      root.toggleAttribute('data-shown', shown || open);
      root.toggleAttribute('data-narrow', narrow);
      menuBtn.setAttribute('aria-expanded', String(open));
      if (!o.menuLabel) menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      content.setAttribute('aria-hidden', String(!open));
      linkNodes.forEach(function (a) { a.tabIndex = open ? 0 : -1; });
      if (wideCta) wideCta.tabIndex = open ? 0 : -1;
    }

    // ---- Spring engine ----
    var reduce = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var state = { p: open ? 1 : 0, v: 0, height: 0, bar: 60 };
    var raf = 0, last = 0;

    function render() {
      state.bar = parseFloat(getComputedStyle(panel).getPropertyValue('--cn-bar')) || 60;
      panel.style.height = (state.bar + Math.max(0, state.p) * state.height) + 'px';
      var list = cards.filter(function (c) { return c.offsetParent !== null || c === ctaWrap ? true : true; });
      var count = list.length;
      var lag = count > 1 ? Math.min(stagger, 0.7 / (count - 1)) : 0;
      var span = 1 - lag * (count - 1);
      list.forEach(function (card, index) {
        var local = clamp((state.p - index * lag) / Math.max(span, 0.05), 0, 1);
        var e = easeOut(local);
        if (o.cardEffect === 'unfold') {
          card.style.transform = 'translateY(' + ((1 - e) * -10) + 'px) rotateX(' + ((1 - e) * -72) + 'deg)';
          card.style.opacity = String(clamp(local * 1.8, 0, 1));
          card.style.filter = '';
        } else if (o.cardEffect === 'fade') {
          card.style.transform = 'translateY(' + ((1 - e) * 6) + 'px)';
          card.style.opacity = String(e);
          card.style.filter = e < 0.999 ? 'blur(' + ((1 - e) * 6) + 'px)' : '';
        } else {
          card.style.transform = 'translateY(' + ((1 - e) * 26) + 'px) scale(' + (0.97 + 0.03 * e) + ')';
          card.style.opacity = String(e);
          card.style.filter = '';
        }
      });
    }

    function tick(now) {
      raf = 0;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      var target = open ? 1 : 0;
      if (reduce) { state.p = target; state.v = 0; }
      else {
        var k = 160 * speed * speed;
        var zeta = open ? 1 - 0.68 * bounce : 1;
        var steps = Math.ceil(dt / (1 / 240));
        var h = dt / steps;
        for (var i = 0; i < steps; i++) {
          state.v += (-k * (state.p - target) - 2 * zeta * Math.sqrt(k) * state.v) * h;
          state.p += state.v * h;
        }
      }
      var done = Math.abs(state.p - target) < 0.0005 && Math.abs(state.v) < 0.002;
      if (done) { state.p = target; state.v = 0; }
      render();
      if (done && target === 0) { shown = false; syncAttrs(); }
      if (!done) raf = requestAnimationFrame(tick);
    }
    function wake() { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }
    function refresh() { state.height = content.offsetHeight; render(); }

    function setOpen(next) {
      if (next === open) return;
      open = next;
      if (open) shown = true;
      syncAttrs();
      refresh();
      wake();
      if (o.onOpenChange) o.onOpenChange(open);
    }

    // ---- Observers & events ----
    var contentObserver = new ResizeObserver(refresh);
    contentObserver.observe(content);
    var rootObserver = new ResizeObserver(function () {
      var n = root.offsetWidth < NARROW;
      if (n !== narrow) { narrow = n; syncAttrs(); refresh(); }
    });
    rootObserver.observe(root);

    menuBtn.addEventListener('click', function () { setOpen(!open); });

    function onPointerDown(e) { if (open && !root.contains(e.target)) setOpen(false); }
    function onKeyDown(e) { if (open && e.key === 'Escape') { setOpen(false); menuBtn.focus(); } }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    if (o.openOn === 'hover') {
      root.addEventListener('pointerenter', function (e) {
        if (e.pointerType === 'touch') return;
        clearTimeout(leaveTimer); setOpen(true);
      });
      root.addEventListener('pointerleave', function (e) {
        if (e.pointerType === 'touch') return;
        clearTimeout(leaveTimer);
        leaveTimer = setTimeout(function () { setOpen(false); }, 160);
      });
    }

    narrow = root.offsetWidth < NARROW;
    syncAttrs();
    refresh();

    // ---- Intro: unroll the bar from its center ----
    if (o.intro && !reduce && panel.animate) {
      var w = panel.offsetWidth, hgt = panel.offsetHeight;
      var radius = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 18;
      panel.animate([
        { clipPath: 'inset(0px ' + Math.max(0, (w - hgt) / 2) + 'px round ' + (hgt / 2) + 'px)', opacity: 0 },
        { clipPath: 'inset(0px 0px round ' + radius + 'px)', opacity: 1 }
      ], { duration: 820, easing: EASE_OUT, fill: 'backwards' });
      Array.prototype.forEach.call(bar.children, function (child, i) {
        child.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 560, delay: 220 + i * 70, easing: EASE_OUT, fill: 'backwards' });
      });
    }

    if (open) wake();

    return {
      open: function () { setOpen(true); },
      close: function () { setOpen(false); },
      toggle: function () { setOpen(!open); },
      destroy: function () {
        cancelAnimationFrame(raf); clearTimeout(leaveTimer);
        contentObserver.disconnect(); rootObserver.disconnect();
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('keydown', onKeyDown);
        root.remove();
      }
    };
  }

  global.CardNav = CardNav;

  // ---- Site configuration (CICS) ----
  function initSite() {
    document.querySelectorAll('[data-cardnav]').forEach(function (host) {
      CardNav(host, {
        logo: '<span class="cn-brand"><span class="cn-seal"><img src="photos/logo.jpg" alt=""></span><b>CI<em>CS</em></b></span>',
        logoAlt: 'CICS Home',
        logoHref: 'index.html',
        ariaLabel: 'Main',
        items: [
          { label: 'About', description: 'Who we are and the people behind the college.',
            links: [{ label: 'About Us', href: 'about.html' }, { label: 'Faculty & Staff', href: 'faculty.html' }] },
          { label: 'Academics', description: 'Programs, tracks, and support for students.',
            links: [{ label: 'Academic Programs', href: 'programs.html' }, { label: 'Student Services', href: 'services.html' }] },
          { label: 'Connect', description: 'Reach out or follow the college.',
            links: [{ label: 'Contact Us', href: 'contact.html' },
                    { label: 'Facebook', href: 'https://www.facebook.com/DLSUD.CICSSG', external: true },
                    { label: 'Instagram', href: 'https://www.instagram.com/dlsud.cicssg/', external: true }] }
        ],
        cta: { label: 'Apply Now', href: 'services.html#enrollment' },
        theme: 'dark', surface: 'glass', openOn: 'click', cardEffect: 'rise',
        stagger: 0.12, bounce: 0.2, speed: 1, cardHeight: 176, maxWidth: 820,
        accentColor: '#ffc233', menuLabel: true, intro: true,
        vars: {
          '--cn-panel': 'rgba(10, 46, 28, 0.96)', '--cn-solid': '#0a2e1c', '--cn-logo': '40px',
          '--cn-tile': 'linear-gradient(180deg, #12462c 0%, #0a2e1c 100%)',
          '--cn-edge': 'rgba(255, 255, 255, 0.12)'
        }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSite);
  else initSite();
})(window);
