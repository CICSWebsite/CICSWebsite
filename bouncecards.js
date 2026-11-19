/*
 * BounceCards, vanilla JavaScript port of the React Bits component (no React needed).
 * Requires bouncecards.css.
 *
 * Usage:
 *   BounceCards(document.querySelector('#cards'), { images: ['a.jpg', { src: 'b.jpg', alt: 'B' }], cardSize: 200 });
 *
 * Or declaratively:
 *   <div data-bounce-cards data-bounce-cards-options='{"images":["a.jpg","b.jpg"],"cardSize":170}'></div>
 *
 * Options match the React props: images, containerWidth, containerHeight, cardSize, spread, rotation,
 * arc, animationDelay, animationStagger, bounciness, enableHover, pushDistance, hoverScale,
 * borderWidth, borderColor, radius, shadow, transformStyles, onCardClick, className.
 * Returns { destroy() }.
 */
(function (global) {
  'use strict';

  var PATTERN = [1, 0.5, -0.3, -1, 0.2, 0.75, -0.6, 0.35, -0.85, 0.1];

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  function parseTransform(value) {
    if (typeof value !== 'string') return null;
    var rotate = value.match(/rotate\(\s*(-?[\d.]+)deg\s*\)/);
    var translate = value.match(/translate\(\s*(-?[\d.]+)px(?:\s*,\s*(-?[\d.]+)px)?\s*\)/);
    return {
      x: translate ? Number(translate[1]) : 0,
      y: translate && translate[2] ? Number(translate[2]) : 0,
      rotate: rotate ? Number(rotate[1]) : 0
    };
  }

  function toCard(item) {
    return typeof item === 'string' ? { src: item, alt: '' } : { src: item && item.src, alt: (item && item.alt) || '' };
  }

  function BounceCards(root, options) {
    var o = Object.assign({
      images: [], className: '', containerWidth: 400, containerHeight: 400, cardSize: 200, spread: 85,
      rotation: 10, arc: 0, animationDelay: 0.5, animationStagger: 0.06, bounciness: 0.6, enableHover: true,
      pushDistance: 160, hoverScale: 1.06, borderWidth: 5, borderColor: '#ffffff', radius: 25, shadow: true,
      transformStyles: null, onCardClick: null
    }, options || {});

    var cards = o.images.map(toCard);
    var count = cards.length;
    var middle = (count - 1) / 2;
    var reach = Math.max(1, middle);
    var slots = cards.map(function (_, i) {
      var custom = o.transformStyles ? parseTransform(o.transformStyles[i]) : null;
      if (custom) return custom;
      var offset = i - middle;
      return { x: offset * o.spread, y: o.arc * Math.pow(offset / reach, 2), rotate: o.rotation * PATTERN[i % PATTERN.length] };
    });
    var s = {
      slots: slots,
      cardSize: Math.max(10, o.cardSize),
      delay: Math.max(0, o.animationDelay),
      stagger: Math.max(0, o.animationStagger),
      bounciness: clamp(o.bounciness, 0, 1),
      enableHover: o.enableHover,
      pushDistance: o.pushDistance,
      hoverScale: clamp(o.hoverScale, 0.5, 2),
      clickable: typeof o.onCardClick === 'function'
    };

    // ---- DOM ----
    root.classList.add('bounce-cards');
    if (o.className) o.className.split(/\s+/).filter(Boolean).forEach(function (c) { root.classList.add(c); });
    root.style.width = o.containerWidth + 'px';
    root.style.height = o.containerHeight + 'px';
    root.style.setProperty('--bounce-cards-size', s.cardSize + 'px');
    root.style.setProperty('--bounce-cards-border', Math.max(0, o.borderWidth) + 'px');
    root.style.setProperty('--bounce-cards-border-color', o.borderColor);
    root.style.setProperty('--bounce-cards-radius', Math.max(0, o.radius) + 'px');
    root.style.setProperty('--bounce-cards-shadow', o.shadow ? '0 1px 2px rgba(0, 0, 0, 0.12), 0 10px 28px -6px rgba(0, 0, 0, 0.32)' : 'none');
    root.style.setProperty('--bounce-cards-shadow-active', o.shadow ? '0 2px 4px rgba(0, 0, 0, 0.14), 0 22px 44px -10px rgba(0, 0, 0, 0.42)' : 'none');
    root.textContent = '';

    var cardEls = cards.map(function (card, i) {
      var el = document.createElement('div');
      el.className = 'bounce-cards__card' + (s.clickable ? ' bounce-cards__card--clickable' : '');
      el.style.zIndex = String(i + 1);
      if (s.clickable) {
        el.setAttribute('role', 'button');
        el.tabIndex = 0;
        el.setAttribute('aria-label', card.alt || 'Card ' + (i + 1));
      }
      if (card.src) {
        var img = document.createElement('img');
        img.src = card.src; img.alt = card.alt; img.draggable = false;
        el.appendChild(img);
      }
      root.appendChild(el);
      return el;
    });

    // ---- Physics ----
    var reduce = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var bodies = [];
    var state = { hovered: -1, time: 0, layer: -1 };
    var raf = 0, last = performance.now(), alive = true;

    function body(i) {
      if (!bodies[i]) {
        var slot = s.slots[i] || { x: 0, y: 0, rotate: 0 };
        bodies[i] = { x: slot.x, y: slot.y, rotate: slot.rotate, scale: reduce ? 1 : 0, vx: 0, vy: 0, vr: 0, vs: 0, born: state.time };
      }
      return bodies[i];
    }
    function step(value, velocity, target, stiffness, damping, dt) {
      var next = velocity + ((target - value) * stiffness - velocity * damping) * dt;
      return [value + next * dt, next];
    }

    function frame(now) {
      raf = 0;
      if (!alive) return;
      var dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
      last = now;
      state.time += dt;

      var hovered = s.enableHover ? state.hovered : -1;
      var popStiffness = 170;
      var popDamping = 2 * (1 - 0.85 * s.bounciness) * Math.sqrt(popStiffness);
      var moveStiffness = 210;
      var moveDamping = 2 * (reduce ? 1 : 0.72) * Math.sqrt(moveStiffness);
      var substeps = Math.ceil(dt / (1 / 240));
      var h = dt / substeps;
      var moving = 0;

      for (var i = 0; i < s.slots.length; i++) {
        var el = cardEls[i];
        if (!el) continue;
        var card = body(i);
        var slot = s.slots[i];
        var appeared = reduce || state.time - card.born >= s.delay + i * s.stagger;
        var tx = slot.x, ty = slot.y, tr = slot.rotate, ts = appeared ? 1 : 0;
        if (hovered >= 0 && appeared) {
          if (i === hovered) {
            ty = slot.y - s.cardSize * 0.04; tr = 0; ts = s.hoverScale;
          } else {
            tx = slot.x + Math.sign(i - hovered) * s.pushDistance;
          }
        }
        for (var k = 0; k < substeps; k++) {
          var r;
          r = step(card.x, card.vx, tx, moveStiffness, moveDamping, h); card.x = r[0]; card.vx = r[1];
          r = step(card.y, card.vy, ty, moveStiffness, moveDamping, h); card.y = r[0]; card.vy = r[1];
          r = step(card.rotate, card.vr, tr, moveStiffness, moveDamping, h); card.rotate = r[0]; card.vr = r[1];
          if (reduce) { card.scale = ts; card.vs = 0; }
          else { r = step(card.scale, card.vs, ts, popStiffness, popDamping, h); card.scale = r[0]; card.vs = r[1]; }
        }
        moving += Math.abs(card.vx) + Math.abs(card.vy) + Math.abs(card.vr) + Math.abs(card.vs) * 100 +
          Math.abs(tx - card.x) + Math.abs(ty - card.y) + Math.abs(tr - card.rotate) +
          Math.abs(ts - card.scale) * 100 + (appeared ? 0 : 1);
        el.style.transform = 'translate(-50%, -50%) translate3d(' + card.x.toFixed(2) + 'px, ' + card.y.toFixed(2) + 'px, 0) rotate(' +
          card.rotate.toFixed(3) + 'deg) scale(' + Math.max(0, card.scale).toFixed(4) + ')';
      }

      if (state.layer !== hovered) {
        state.layer = hovered;
        cardEls.forEach(function (el, i) {
          el.style.zIndex = i === hovered ? String(s.slots.length + 1) : String(i + 1);
          el.toggleAttribute('data-active', i === hovered);
        });
      }
      if (moving > 0.02) raf = requestAnimationFrame(frame);
    }

    function wake() {
      if (raf || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function pick(event) {
      var rect = root.getBoundingClientRect();
      var px = event.clientX - rect.left - rect.width / 2;
      var py = event.clientY - rect.top - rect.height / 2;
      var best = -1, distance = Infinity;
      s.slots.forEach(function (slot, i) {
        var gap = Math.abs(px - slot.x);
        if (gap < distance) { distance = gap; best = i; }
      });
      if (best < 0) return -1;
      var slot = s.slots[best];
      var half = s.cardSize / 2;
      if (Math.abs(py - slot.y) > half + 12 || distance > half + 12) return -1;
      if (state.hovered >= 0 && state.hovered !== best) {
        var current = s.slots[state.hovered];
        if (current && Math.abs(px - current.x) - distance < 6) return state.hovered;
      }
      return best;
    }

    function onMove(e) { var next = pick(e); if (next !== state.hovered) { state.hovered = next; wake(); } }
    function onLeave() { if (state.hovered !== -1) { state.hovered = -1; wake(); } }
    function onClick(e) {
      var index = pick(e);
      if (index < 0) return;
      var card = bodies[index];
      if (card && !reduce) card.vs -= 2.2;
      wake();
      if (o.onCardClick) o.onCardClick(index);
    }
    function onFocus(e) { var index = cardEls.indexOf(e.target); if (index >= 0) { state.hovered = index; wake(); } }
    function onKey(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var index = cardEls.indexOf(e.target);
      if (index < 0 || !s.clickable) return;
      e.preventDefault();
      if (bodies[index] && !reduce) bodies[index].vs -= 2.2;
      wake();
      o.onCardClick(index);
    }

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerdown', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('click', onClick);
    root.addEventListener('focusin', onFocus);
    root.addEventListener('focusout', onLeave);
    root.addEventListener('keydown', onKey);
    wake();

    return {
      destroy: function () {
        alive = false;
        cancelAnimationFrame(raf);
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerdown', onMove);
        root.removeEventListener('pointerleave', onLeave);
        root.removeEventListener('click', onClick);
        root.removeEventListener('focusin', onFocus);
        root.removeEventListener('focusout', onLeave);
        root.removeEventListener('keydown', onKey);
        root.textContent = '';
      }
    };
  }

  function autoInit() {
    document.querySelectorAll('[data-bounce-cards]').forEach(function (el) {
      var opts = {};
      try { opts = JSON.parse(el.getAttribute('data-bounce-cards-options') || '{}'); } catch (e) {}
      BounceCards(el, opts);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit);
  else autoInit();

  global.BounceCards = BounceCards;
})(window);
