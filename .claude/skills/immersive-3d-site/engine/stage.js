// stage.js: the runtime for immersive-3d-site.
//
// One fixed WebGL canvas behind real HTML. The page is a stack of <section data-act="name" data-span="2">.
// Each act gets a progress value p (0 at the moment its top reaches the top of the viewport, 1 when its
// bottom reaches the bottom). The engine smooths scroll and pointer, renders whichever act owns the
// viewport, and writes --p onto each section so CSS can follow the same timeline.
//
// Copy this file into the build. Do not edit it per project; write per-project behaviour in the page.
//
//   import { createStage } from './stage.js';
//   const stage = createStage({ canvas: document.querySelector('#gl') });
//   stage.act('hero', { scene, camera, update(p, s) { ... }, render(renderer) { ... } });
//   stage.start();

import * as THREE from 'three';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

export function createStage(opts = {}) {
  const canvas = opts.canvas || document.querySelector('canvas[data-stage]');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const maxDpr = opts.maxDpr ?? (coarse ? 1.5 : 2);
  const html = document.documentElement;

  // WebGL or a clean fallback. With no WebGL the page still reads: CSS shows each act's poster.
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: opts.antialias ?? !coarse, alpha: opts.alpha ?? false,
      powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserveDrawingBuffer,
    });
  } catch (e) {
    html.classList.add('no-webgl');
    console.warn('[stage] WebGL unavailable, showing posters', e);
  }
  if (renderer) {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, maxDpr));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = opts.toneMapping ?? THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = opts.exposure ?? 1;
    html.classList.add('has-webgl');
    renderer.info.autoReset = false; // reset once per frame, so stats count every pass (composers render several)
  }
  if (reduced) html.classList.add('reduced-motion');
  if (coarse) html.classList.add('touch');

  const acts = new Map();       // name -> { el, def, p, pTarget, started }
  const state = {
    renderer, reduced, coarse, THREE,
    width: innerWidth, height: innerHeight,
    pointer: { x: 0, y: 0 }, pointerTarget: { x: 0, y: 0 },
    time: 0, dt: 0, current: null, scrollY: scrollY,
    velocity: 0,                // smoothed scroll speed in px/s, signed
    frames: 0, ready: false,
  };

  // Scroll smoothing: higher lambda = snappier. Touch scrolling already has momentum, so damp less.
  const lambda = opts.smoothing ?? (coarse ? 14 : 7);
  let smoothY = scrollY, lastY = scrollY;

  function measure() {
    for (const [, a] of acts) {
      const r = a.el.getBoundingClientRect();
      a.top = r.top + scrollY;
      a.height = a.el.offsetHeight;
    }
  }

  function progressFor(a, y) {
    const travel = Math.max(1, a.height - state.height);
    return clamp((y - a.top) / travel);
  }

  function owner(y) {
    // The act whose box contains the middle of the viewport owns the canvas.
    const mid = y + state.height * 0.5;
    let best = null;
    for (const [name, a] of acts) {
      if (mid >= a.top && mid < a.top + a.height) { best = name; break; }
    }
    return best;
  }

  function resize() {
    state.width = innerWidth; state.height = innerHeight;
    if (renderer) renderer.setSize(state.width, state.height, false);
    for (const [, a] of acts) {
      const cam = a.def.camera;
      if (cam && cam.isPerspectiveCamera) { cam.aspect = state.width / state.height; cam.updateProjectionMatrix(); }
      a.def.resize?.(state.width, state.height, state);
    }
    measure();
  }

  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => {
    state.pointerTarget.x = (e.clientX / state.width) * 2 - 1;
    state.pointerTarget.y = -((e.clientY / state.height) * 2 - 1);
  }, { passive: true });

  // Reveal-on-enter for plain DOM elements: add data-reveal, style .is-in in CSS.
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }, { rootMargin: '0px', threshold: 0.15 }); // no negative bottom margin: inside a sticky frame, bottom items would never reveal
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  let fadeT = 1; // canvas cross-fade when the owning act changes and it brings its own scene

  function frame(nowMs) {
    const now = nowMs / 1000;
    const realDt = Math.min(0.5, state.time ? now - state.time : 0.016); // uncapped, for things that must finish on time
    state.dt = Math.min(0.05, state.time ? now - state.time : 0.016);
    state.time = now;
    state.frames++;

    const y = scrollY;
    smoothY = reduced ? y : damp(smoothY, y, lambda, state.dt);
    state.velocity = damp(state.velocity, (smoothY - lastY) / Math.max(state.dt, 1e-3), 6, state.dt);
    lastY = smoothY;
    state.scrollY = smoothY;

    const pl = reduced ? 0 : 6;
    state.pointer.x = pl ? damp(state.pointer.x, state.pointerTarget.x, pl, state.dt) : 0;
    state.pointer.y = pl ? damp(state.pointer.y, state.pointerTarget.y, pl, state.dt) : 0;

    for (const [, a] of acts) {
      a.p = progressFor(a, smoothY);
      a.el.style.setProperty('--p', a.p.toFixed(4));
    }

    const name = owner(smoothY);
    if (name !== state.current) {
      const prev = state.current && acts.get(state.current);
      prev?.def.exit?.(state);
      state.current = name;
      const next = name && acts.get(name);
      if (next) {
        if (!next.started) { next.def.init?.(state); next.started = true; }
        next.def.enter?.(state);
        if (prev && next.def.scene !== prev.def.scene) fadeT = 0;
      }
      html.dataset.stageAct = name || ''; // not data-act: that would make <html> match the act selectors
    }

    // Acts that share a scene with the owner still get updates, so one world can be driven by many acts.
    const cur = name && acts.get(name);
    if (cur) {
      for (const [, a] of acts) {
        if (a === cur || (a.def.scene && a.def.scene === cur.def.scene)) a.def.update?.(a.p, state);
      }
    }

    fadeT = Math.min(1, fadeT + realDt / 0.35); // real time: on a slow device a capped step would drag the fade out
    if (canvas) canvas.style.opacity = reduced ? 1 : (0.15 + 0.85 * fadeT).toFixed(3);

    if (renderer) renderer.info.reset();
    if (renderer && cur) {
      if (cur.def.render) cur.def.render(renderer, state);
      else if (cur.def.scene && cur.def.camera) renderer.render(cur.def.scene, cur.def.camera);
      const info = renderer.info.render;
      state.stats = { calls: info.calls, triangles: info.triangles, points: info.points };
    }

    if (!state.ready && state.frames > 2) { state.ready = true; html.classList.add('stage-ready'); }
  }

  const api = {
    state, renderer, THREE,
    /** Register an act. def: { scene, camera, init, enter, exit, update(p, state), render(renderer, state), resize } */
    act(name, def) {
      const el = document.querySelector(`[data-act="${name}"]:not(html)`);
      if (!el) { console.warn(`[stage] no section with data-act="${name}"`); return api; }
      const span = parseFloat(el.dataset.span || '1');
      el.style.minHeight = `${span * 100}svh`;
      acts.set(name, { el, def, p: 0, started: false, top: 0, height: 0 });
      return api;
    },
    start() {
      resize();
      if (renderer) renderer.setAnimationLoop(frame);
      else { const loop = (t) => { frame(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
      document.addEventListener('visibilitychange', () => {
        if (!renderer) return;
        renderer.setAnimationLoop(document.hidden ? null : frame);
      });
      // Re-measure once fonts and images settle, because they move section tops.
      document.fonts?.ready.then(measure);
      addEventListener('load', measure);
      return api;
    },
    progress(name) { return acts.get(name)?.p ?? 0; },
    /** True when the smoothed scroll has caught up with the real one. The verify script waits on this. */
    settled() { return Math.abs(smoothY - scrollY) < 0.5; },
    acts() { return [...acts.keys()]; },
  };

  window.__stage = api; // read by scripts/shoot.mjs
  return api;
}

// Small helpers for act code. All take p in 0..1.
export const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  expoOut: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};
/** Map p from [a, b] to [0, 1], clamped. Use it to give one act several beats: seg(p, 0.2, 0.5). */
export const seg = (p, a, b) => clamp((p - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;
export { clamp, damp };
