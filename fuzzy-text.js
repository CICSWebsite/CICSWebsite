/*
 * FuzzyText, vanilla JavaScript port of the React Bits component (no React needed).
 *
 * Usage:
 *   const fuzzy = FuzzyText(document.querySelector('#target'), '404', { baseIntensity: 0.2, hoverIntensity: 0.5 });
 *   fuzzy.destroy(); // optional cleanup
 *
 * Or declaratively:
 *   <h1 data-fuzzy data-fuzzy-options='{"hoverIntensity":0.6}'>Text</h1>
 *
 * Options match the React props: fontSize, fontWeight, fontFamily, color, colorSplit, trigger,
 * enableHover, baseIntensity, hoverIntensity, fuzzRange, sliceSize, fps, direction,
 * transitionDuration, intro, introDuration, clickEffect, glitchMode, glitchInterval,
 * glitchDuration, gradient, letterSpacing, className.
 */
(function (global) {
  'use strict';

  var INTRO_PEAK = 2;
  var BURST_ATTACK = 70;
  var BURST_DECAY = 240;

  function followsText(value) { return !value || /^(currentcolor|inherit)$/i.test(value); }

  var colorProbe = null;
  function toRgb(value) {
    if (!colorProbe) {
      var probe = document.createElement('canvas');
      probe.width = 1; probe.height = 1;
      colorProbe = probe.getContext('2d', { willReadFrequently: true });
    }
    if (!colorProbe) return [255, 255, 255];
    colorProbe.clearRect(0, 0, 1, 1);
    colorProbe.fillStyle = '#000';
    colorProbe.fillStyle = value;
    colorProbe.fillRect(0, 0, 1, 1);
    var d = colorProbe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  }

  function channelColor(rgb, channel, additive) {
    return 'rgb(' + rgb.map(function (v, i) { return i === channel ? v : additive ? 0 : 255; }).join(',') + ')';
  }

  function FuzzyText(host, text, options) {
    var o = Object.assign({
      fontSize: 'clamp(2rem, 8vw, 8rem)', fontWeight: 900, fontFamily: 'inherit', color: 'currentColor',
      enableHover: true, baseIntensity: 0.18, hoverIntensity: 0.5, fuzzRange: 30, fps: 60,
      direction: 'horizontal', transitionDuration: 0, clickEffect: false, glitchMode: false,
      glitchInterval: 2000, glitchDuration: 200, gradient: null, letterSpacing: 0, sliceSize: 1,
      trigger: 'hover', intro: false, introDuration: 1400, colorSplit: 0, className: ''
    }, options || {});

    text = String(text);
    var canvas = document.createElement('canvas');
    canvas.className = o.className;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', text);
    if (o.trigger === 'click') canvas.style.cursor = 'pointer';
    host.textContent = '';
    host.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var source = document.createElement('canvas');
    var sourceCtx = source.getContext('2d');
    var scratch = document.createElement('canvas');
    var scratchCtx = scratch.getContext('2d');
    var gradientKey = Array.isArray(o.gradient) && o.gradient.length >= 2 ? o.gradient.join('|') : '';
    var splitOn = o.colorSplit > 0;
    var channels = splitOn ? [0, 1, 2].map(function () {
      var layer = document.createElement('canvas');
      return { canvas: layer, ctx: layer.getContext('2d') };
    }) : [];
    if (!ctx || !sourceCtx || !scratchCtx || channels.some(function (c) { return !c.ctx; })) return { destroy: function () {} };

    var reduceMotion = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var usesInk = followsText(o.color) && !gradientKey;
    var splitPad = splitOn ? Math.ceil(o.fuzzRange * 0.5) + 4 : 0;
    var padX = o.fuzzRange + 20 + (o.direction === 'vertical' ? 0 : splitPad);
    var padY = o.direction === 'horizontal' ? 0 : o.fuzzRange + 10 + (o.direction === 'vertical' ? splitPad : 0);
    var inset = 5;
    var cancelled = false, built = false, visible = true;
    var frame = 0, resizeFrame = 0, lastFrame = 0, lastInkCheck = 0;
    var clickTimer, glitchStart, glitchEnd;
    var hovering = false, clicking = false, glitching = false, burstAt = 0;
    var introState = { start: 0, done: !o.intro };
    var eased = reduceMotion ? 0 : o.baseIntensity;
    var intensity = eased, coarse = 1, drawn = -1, ink = '', blend = 'lighter', dpr = 1, fontPx = 16;
    var rows = new Int32Array(1), cols = new Int32Array(1);
    var box = { left: 0, ascent: 0, width: 0, height: 0, cssWidth: 0, cssHeight: 0 };

    function family() { return o.fontFamily === 'inherit' ? (getComputedStyle(canvas).fontFamily || 'sans-serif') : o.fontFamily; }
    function font() { return o.fontWeight + ' ' + fontPx + 'px ' + family(); }
    function resolveInk() { return usesInk ? (getComputedStyle(canvas).color || '#000') : o.color; }
    function pixelRatio() { return Math.min(global.devicePixelRatio || 1, 2); }
    function introPending() { return !introState.done && o.intro && !reduceMotion; }

    function measureFontSize() {
      if (typeof o.fontSize === 'number') return o.fontSize;
      var probe = document.createElement('span');
      probe.style.fontSize = o.fontSize;
      (canvas.parentElement || document.body).appendChild(probe);
      var size = parseFloat(getComputedStyle(probe).fontSize);
      probe.remove();
      return isFinite(size) && size > 0 ? size : 16;
    }

    function paintText(target, tctx, tone) {
      target.width = source.width;
      target.height = source.height;
      tctx.setTransform(1, 0, 0, 1, 0, 0);
      tctx.clearRect(0, 0, target.width, target.height);
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tctx.font = font();
      tctx.textBaseline = 'alphabetic';
      if (gradientKey) {
        var stops = gradientKey.split('|');
        var fill = tctx.createLinearGradient(0, 0, box.width + inset * 2, 0);
        stops.forEach(function (stop, i) { fill.addColorStop(i / (stops.length - 1), tone(stop)); });
        tctx.fillStyle = fill;
      } else {
        tctx.fillStyle = tone(ink);
      }
      if (o.letterSpacing !== 0) {
        var x = inset;
        for (var ch of text) {
          tctx.fillText(ch, x, box.ascent);
          x += tctx.measureText(ch).width + o.letterSpacing;
        }
      } else {
        tctx.fillText(text, inset + box.left, box.ascent);
      }
    }

    function paintSource() {
      paintText(source, sourceCtx, function (v) { return v; });
      if (!splitOn) return;
      var tones = (gradientKey ? gradientKey.split('|') : [ink]).map(toRgb);
      var light = tones.reduce(function (sum, c) { return sum + (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }, 0) / tones.length >= 0.5;
      blend = light ? 'lighter' : 'multiply';
      channels.forEach(function (channel, index) {
        paintText(channel.canvas, channel.ctx, function (v) { return channelColor(toRgb(v), index, light); });
      });
    }

    function fuzz(image, shift, jitter, step, amp) {
      var sw = image.width, sh = image.height;
      var ox = Math.round(padX * dpr), oy = Math.round(padY * dpr);
      var sx = o.direction === 'vertical' ? 0 : shift;
      var sy = o.direction === 'vertical' ? shift : 0;
      function wobble() { return jitter ? Math.round((Math.random() - 0.5) * jitter) : 0; }
      if (amp < 0.5) { ctx.drawImage(image, ox + sx, oy + sy); return; }
      var x, y, w, h, index;
      if (o.direction === 'vertical') {
        for (x = 0, index = 0; x < sw; x += step, index++) {
          w = Math.min(step, sw - x);
          ctx.drawImage(image, x, 0, w, sh, ox + x, oy + cols[index] + wobble() + sy, w, sh);
        }
        return;
      }
      var both = o.direction === 'both';
      var target = both ? scratchCtx : ctx;
      if (both) scratchCtx.clearRect(0, 0, scratch.width, scratch.height);
      for (y = 0, index = 0; y < sh; y += step, index++) {
        h = Math.min(step, sh - y);
        target.drawImage(image, 0, y, sw, h, ox + rows[index] + wobble() + sx, both ? y : oy + y, sw, h);
      }
      if (!both) return;
      var reach = Math.ceil(amp / 2 + Math.abs(sx) + jitter / 2) + 1;
      var from = Math.max(0, Math.floor((ox - reach) / step) * step);
      var to = Math.min(scratch.width, ox + sw + reach);
      for (x = from; x < to; x += step) {
        w = Math.min(step, to - x);
        ctx.drawImage(scratch, x, 0, w, sh, x, oy + cols[x / step], w, sh);
      }
    }

    function draw() {
      var step = Math.max(1, Math.round(Math.max(1, o.sliceSize) * coarse * dpr));
      var amp = intensity * o.fuzzRange * dpr;
      var i;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawn = intensity;
      if (amp >= 0.5) {
        if (o.direction === 'vertical') {
          for (i = 0; i * step < source.width; i++) cols[i] = Math.round((Math.random() - 0.5) * amp);
        } else {
          for (i = 0; i * step < source.height; i++) rows[i] = Math.round((Math.random() - 0.5) * amp);
          if (o.direction === 'both') {
            for (i = 0; i * step < canvas.width; i++) cols[i] = Math.round((Math.random() - 0.5) * amp * 0.5);
          }
        }
      }
      var split = splitOn ? Math.round(o.colorSplit * (2 + intensity * o.fuzzRange * 0.18) * dpr) : 0;
      if (split < 1) { fuzz(source, 0, 0, step, amp); return; }
      var jitter = o.colorSplit * amp * 0.2;
      ctx.globalCompositeOperation = blend;
      fuzz(channels[0].canvas, -split, jitter, step, amp);
      fuzz(channels[1].canvas, 0, 0, step, amp);
      fuzz(channels[2].canvas, split, jitter, step, amp);
      ctx.globalCompositeOperation = 'source-over';
    }

    function build() {
      dpr = pixelRatio();
      fontPx = measureFontSize();
      sourceCtx.setTransform(1, 0, 0, 1, 0, 0);
      sourceCtx.font = font();
      var m = sourceCtx.measureText(text);
      var left = m.actualBoundingBoxLeft != null ? m.actualBoundingBoxLeft : 0;
      var width = left + (m.actualBoundingBoxRight != null ? m.actualBoundingBoxRight : m.width);
      if (o.letterSpacing !== 0) {
        width = -o.letterSpacing;
        for (var ch of text) width += sourceCtx.measureText(ch).width + o.letterSpacing;
      }
      var ascent = m.actualBoundingBoxAscent != null ? m.actualBoundingBoxAscent : fontPx;
      var descent = m.actualBoundingBoxDescent != null ? m.actualBoundingBoxDescent : fontPx * 0.2;
      var textWidth = Math.max(1, Math.ceil(width));
      var textHeight = Math.max(1, Math.ceil(ascent + descent));
      box = { left: left, ascent: ascent, width: textWidth, height: textHeight,
              cssWidth: textWidth + inset * 2 + padX * 2, cssHeight: textHeight + padY * 2 };
      source.width = Math.ceil((textWidth + inset * 2) * dpr);
      source.height = Math.ceil(textHeight * dpr);
      canvas.width = Math.ceil(box.cssWidth * dpr);
      canvas.height = Math.ceil(box.cssHeight * dpr);
      scratch.width = canvas.width;
      scratch.height = source.height;
      rows = new Int32Array(source.height + 1);
      cols = new Int32Array(canvas.width + 1);
      canvas.style.width = box.cssWidth + 'px';
      canvas.style.height = 'auto'; // keeps the aspect ratio if max-width shrinks the canvas
      canvas.style.maxWidth = '100%';
      if (introPending() && !introState.start) canvas.style.opacity = '0';
      ink = resolveInk();
      paintSource();
      built = true;
      draw();
    }

    function tick(now) {
      frame = 0;
      if (cancelled || !visible) return;
      frame = requestAnimationFrame(tick);
      var interval = 1000 / Math.max(1, o.fps);
      if (now - lastFrame < interval - 1) return;
      lastFrame = Math.max(lastFrame + interval, now - interval);
      if (usesInk && now - lastInkCheck > 250) {
        lastInkCheck = now;
        var next = resolveInk();
        if (next !== ink) { ink = next; paintSource(); drawn = -1; }
      }
      var base = reduceMotion ? 0 : o.baseIntensity;
      var active = o.trigger === 'always'
        ? (reduceMotion ? base : o.hoverIntensity)
        : (o.trigger !== 'click' && hovering && o.enableHover ? o.hoverIntensity : base);
      var goal = clicking || glitching ? 1 : active;
      if (o.transitionDuration > 0) {
        eased += (goal - eased) * (1 - Math.pow(0.05, 1 / o.transitionDuration));
        if (Math.abs(goal - eased) < 0.002) eased = goal;
      } else {
        eased = goal;
      }
      var level = eased, energy = 0;
      if (burstAt) {
        var age = now - burstAt;
        var env = age < BURST_ATTACK ? 1 - Math.pow(1 - age / BURST_ATTACK, 2) : Math.exp(-(age - BURST_ATTACK) / BURST_DECAY);
        if (age >= BURST_ATTACK && env < 0.004) {
          burstAt = 0;
        } else {
          var peak = Math.min(2, 0.6 + o.hoverIntensity * 1.4);
          level += (Math.max(peak, level) - level) * env;
          energy = env;
        }
      }
      if (!introState.done) {
        if (!o.intro || reduceMotion) {
          introState.done = true;
          canvas.style.opacity = '';
        } else {
          if (!introState.start) introState.start = now;
          var progress = Math.min(1, (now - introState.start) / Math.max(1, o.introDuration));
          var ienv = Math.pow(1 - progress, 2.5);
          level += (INTRO_PEAK - level) * ienv;
          energy = Math.max(energy, ienv);
          canvas.style.opacity = progress < 0.3 ? (1 - Math.pow(1 - progress / 0.3, 2)).toFixed(3) : '';
          if (progress >= 1) introState.done = true;
        }
      }
      intensity = level;
      coarse = 1 + 3 * energy * energy;
      if (intensity === 0 && drawn === 0) return;
      draw();
    }

    var observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          if (visible && built && !frame && !cancelled) frame = requestAnimationFrame(tick);
        })
      : null;
    if (observer) observer.observe(canvas);

    function isOverText(e) {
      var rect = canvas.getBoundingClientRect();
      if (!built || !rect.width || !rect.height) return false;
      var x = ((e.clientX - rect.left) * box.cssWidth) / rect.width;
      var y = ((e.clientY - rect.top) * box.cssHeight) / rect.height;
      var left = padX + inset;
      return x >= left && x <= left + box.width && y >= padY && y <= padY + box.height;
    }
    function onMove(e) { hovering = isOverText(e); }
    function onUp(e) { if (e.pointerType !== 'mouse') hovering = false; }
    function onLeave() { hovering = false; }
    function onClick() {
      if (o.trigger === 'click') { burstAt = performance.now(); return; }
      if (!o.clickEffect) return;
      clicking = true;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function () { clicking = false; }, 150);
    }
    function onResize() {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(function () {
        if (built && (measureFontSize() !== fontPx || pixelRatio() !== dpr)) build();
      });
    }

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointercancel', onLeave);
    canvas.addEventListener('click', onClick);
    global.addEventListener('resize', onResize);

    if (o.glitchMode && !reduceMotion) {
      (function schedule() {
        glitchStart = setTimeout(function () {
          glitching = true;
          glitchEnd = setTimeout(function () { glitching = false; schedule(); }, o.glitchDuration);
        }, o.glitchInterval);
      })();
    }

    fontPx = measureFontSize();
    var fontsReady = (document.fonts && document.fonts.load) ? document.fonts.load(font()).catch(function () { return document.fonts.ready; }) : Promise.resolve();
    fontsReady.then(function () {
      if (cancelled) return;
      build();
      if (visible && !frame) frame = requestAnimationFrame(tick);
    });

    return {
      destroy: function () {
        cancelled = true;
        cancelAnimationFrame(frame);
        cancelAnimationFrame(resizeFrame);
        clearTimeout(clickTimer); clearTimeout(glitchStart); clearTimeout(glitchEnd);
        if (observer) observer.disconnect();
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerdown', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointerleave', onLeave);
        canvas.removeEventListener('pointercancel', onLeave);
        canvas.removeEventListener('click', onClick);
        global.removeEventListener('resize', onResize);
        canvas.remove();
      }
    };
  }

  // Declarative init: <el data-fuzzy data-fuzzy-options='{"colorSplit":0.3}'>Text</el>
  function autoInit() {
    document.querySelectorAll('[data-fuzzy]').forEach(function (el) {
      var opts = {};
      try { opts = JSON.parse(el.getAttribute('data-fuzzy-options') || '{}'); } catch (e) {}
      FuzzyText(el, el.textContent.trim(), opts);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit);
  else autoInit();

  global.FuzzyText = FuzzyText;
})(window);
