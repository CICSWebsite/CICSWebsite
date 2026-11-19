/*
 * BorderGlow, vanilla JavaScript port of the React Bits component (no React needed).
 * Requires border-glow.css.
 *
 * Usage:
 *   BorderGlow(element, { glowColor: '40 80 80', backgroundColor: '#120F17', borderRadius: 28 });
 *
 * Or declaratively:
 *   <div data-border-glow data-border-glow-options='{"borderRadius":24}'>...content...</div>
 *
 * Options match the React props: className, edgeSensitivity, glowColor, backgroundColor,
 * borderRadius, glowRadius, glowIntensity, coneSpread, animated, colors, fillOpacity.
 */
(function (global) {
  'use strict';

  function parseHSL(str) {
    var m = String(str).match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
    if (!m) return { h: 40, s: 80, l: 80 };
    return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
  }

  function buildGlowVars(glowColor, intensity) {
    var c = parseHSL(glowColor);
    var base = c.h + 'deg ' + c.s + '% ' + c.l + '%';
    var opacities = [100, 60, 50, 40, 30, 20, 10];
    var keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
    var vars = {};
    for (var i = 0; i < opacities.length; i++) {
      vars['--glow-color' + keys[i]] = 'hsl(' + base + ' / ' + Math.min(opacities[i] * intensity, 100) + '%)';
    }
    return vars;
  }

  var POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
  var KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
  var COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

  function buildGradientVars(colors) {
    var vars = {};
    for (var i = 0; i < 7; i++) {
      var c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
      vars[KEYS[i]] = 'radial-gradient(at ' + POSITIONS[i] + ', ' + c + ' 0px, transparent 50%)';
    }
    vars['--gradient-base'] = 'linear-gradient(' + colors[0] + ' 0 100%)';
    return vars;
  }

  function isLightColor(color) {
    var value = color.trim().replace('#', '');
    if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(value)) return false;
    var hex = value.length === 3 ? value.split('').map(function (ch) { return ch + ch; }).join('') : value;
    var r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    return r * 0.2126 + g * 0.7152 + b * 0.0722 > 180;
  }

  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInCubic(x) { return x * x * x; }

  function animateValue(opts) {
    var start = opts.start != null ? opts.start : 0;
    var end = opts.end != null ? opts.end : 100;
    var duration = opts.duration != null ? opts.duration : 1000;
    var delay = opts.delay || 0;
    var ease = opts.ease || easeOutCubic;
    var t0 = performance.now() + delay;
    var frame = 0;
    function tick() {
      var t = Math.min((performance.now() - t0) / duration, 1);
      opts.onUpdate(start + (end - start) * ease(t));
      if (t < 1) frame = requestAnimationFrame(tick);
      else if (opts.onEnd) opts.onEnd();
    }
    var timer = setTimeout(function () { frame = requestAnimationFrame(tick); }, delay);
    return function () { clearTimeout(timer); cancelAnimationFrame(frame); };
  }

  function BorderGlow(card, options) {
    var o = Object.assign({
      className: '', edgeSensitivity: 30, glowColor: '40 80 80', backgroundColor: '#120F17',
      borderRadius: 28, glowRadius: 40, glowIntensity: 1.0, coneSpread: 25, animated: false,
      colors: ['#c084fc', '#f472b6', '#38bdf8'], fillOpacity: 0.5
    }, options || {});

    // Structure: card > span.edge-light + div.border-glow-inner > original children
    var inner = document.createElement('div');
    inner.className = 'border-glow-inner';
    while (card.firstChild) inner.appendChild(card.firstChild);
    var edge = document.createElement('span');
    edge.className = 'edge-light';
    card.appendChild(edge);
    card.appendChild(inner);

    card.classList.add('border-glow-card');
    if (isLightColor(o.backgroundColor)) card.classList.add('border-glow-card--light');
    if (o.className) o.className.split(/\s+/).filter(Boolean).forEach(function (c) { card.classList.add(c); });

    var vars = Object.assign({
      '--card-bg': o.backgroundColor,
      '--edge-sensitivity': o.edgeSensitivity,
      '--border-radius': o.borderRadius + 'px',
      '--glow-padding': o.glowRadius + 'px',
      '--cone-spread': o.coneSpread,
      '--fill-opacity': o.fillOpacity
    }, buildGlowVars(o.glowColor, o.glowIntensity), buildGradientVars(o.colors));
    Object.keys(vars).forEach(function (k) { card.style.setProperty(k, vars[k]); });

    function center() {
      var r = card.getBoundingClientRect();
      return [r.width / 2, r.height / 2];
    }
    function edgeProximity(x, y) {
      var c = center(), dx = x - c[0], dy = y - c[1];
      var kx = dx !== 0 ? c[0] / Math.abs(dx) : Infinity;
      var ky = dy !== 0 ? c[1] / Math.abs(dy) : Infinity;
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    }
    function cursorAngle(x, y) {
      var c = center(), dx = x - c[0], dy = y - c[1];
      if (dx === 0 && dy === 0) return 0;
      var deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      return deg < 0 ? deg + 360 : deg;
    }

    function onMove(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      card.style.setProperty('--edge-proximity', (edgeProximity(x, y) * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', cursorAngle(x, y).toFixed(3) + 'deg');
    }
    card.addEventListener('pointermove', onMove);

    var cancels = [];
    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (o.animated && !reduce) {
      var a0 = 110, a1 = 465;
      var setAngle = function (v) { card.style.setProperty('--cursor-angle', ((a1 - a0) * (v / 100) + a0) + 'deg'); };
      card.classList.add('sweep-active');
      card.style.setProperty('--cursor-angle', a0 + 'deg');
      cancels = [
        animateValue({ duration: 500, onUpdate: function (v) { card.style.setProperty('--edge-proximity', v); } }),
        animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: setAngle }),
        animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: setAngle }),
        animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
          onUpdate: function (v) { card.style.setProperty('--edge-proximity', v); },
          onEnd: function () { card.classList.remove('sweep-active'); } })
      ];
    }

    return {
      destroy: function () {
        card.removeEventListener('pointermove', onMove);
        cancels.forEach(function (c) { c(); });
        card.classList.remove('sweep-active');
      }
    };
  }

  function autoInit() {
    document.querySelectorAll('[data-border-glow]').forEach(function (el) {
      var opts = {};
      try { opts = JSON.parse(el.getAttribute('data-border-glow-options') || '{}'); } catch (e) {}
      BorderGlow(el, opts);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit);
  else autoInit();

  global.BorderGlow = BorderGlow;
})(window);
