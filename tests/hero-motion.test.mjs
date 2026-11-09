import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initHeroMotion } from '../src/scripts/hero-motion.ts';

class FakeTarget {
  listeners = new Map();
  addEventListener(type, listener) {
    const group = this.listeners.get(type) ?? new Set();
    group.add(listener);
    this.listeners.set(type, group);
  }
  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }
  dispatch(type, event = {}) {
    for (const listener of [...(this.listeners.get(type) ?? [])])
      listener({ type, ...event });
  }
  listenerCount(type) {
    return this.listeners.get(type)?.size ?? 0;
  }
}

function fixture({
  hover = true,
  finePointer = true,
  noPreference = true,
} = {}) {
  const pendingFrames = new Map();
  let nextFrame = 1;
  const media = new Map([
    ['(hover: hover)', hover],
    ['(pointer: fine)', finePointer],
    ['(prefers-reduced-motion: no-preference)', noPreference],
  ]);
  const mediaQueries = new Map();
  class MediaQuery extends FakeTarget {
    constructor(query) {
      super();
      this.query = query;
      this.matches = media.get(query);
    }
    set(value) {
      this.matches = value;
      this.dispatch('change');
    }
  }
  const view = new FakeTarget();
  view.matchMedia = (query) => {
    if (!mediaQueries.has(query))
      mediaQueries.set(query, new MediaQuery(query));
    return mediaQueries.get(query);
  };
  view.requestAnimationFrame = (callback) => {
    const id = nextFrame++;
    pendingFrames.set(id, callback);
    return id;
  };
  view.cancelAnimationFrame = (id) => pendingFrames.delete(id);
  view.runFrame = (time) => {
    const entry = pendingFrames.entries().next().value;
    if (!entry) return false;
    const [id, callback] = entry;
    pendingFrames.delete(id);
    callback(time);
    return true;
  };
  view.frameCount = () => pendingFrames.size;
  view.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
      this.disconnected = false;
      view.lastObserver = this;
    }
    observe(target) {
      this.target = target;
    }
    disconnect() {
      this.disconnected = true;
    }
    intersect(isIntersecting) {
      this.callback([{ target: this.target, isIntersecting }]);
    }
  };

  const document = new FakeTarget();
  document.hidden = false;
  document.defaultView = view;
  const style = { transform: 'scale(1.2)' };
  const layer = { dataset: { depth: '0.55', rotation: '7' }, style };
  const root = Object.assign(new FakeTarget(), {
    ownerDocument: document,
    attributes: new Set(),
    layer,
    getBoundingClientRectCalls: 0,
    getBoundingClientRect() {
      this.getBoundingClientRectCalls++;
      return { left: 100, top: 50, width: 200, height: 100 };
    },
    querySelectorAll(selector) {
      return selector === '[data-motion-layer]' ? [layer] : [];
    },
    toggleAttribute(name, value) {
      if (value) this.attributes.add(name);
      else this.attributes.delete(name);
    },
    hasAttribute(name) {
      return this.attributes.has(name);
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
  });
  return {
    root,
    layer,
    style,
    view,
    document,
    mediaQueries,
    getBoundingRectCalls: () => root.getBoundingClientRectCalls,
  };
}

test('parallax follows bounded pointer targets, settles, and eases back on leave', () => {
  const { root, style, view } = fixture();
  const cleanup = initHeroMotion(root);
  view.lastObserver.intersect(true);
  assert.equal(root.hasAttribute('data-motion-active'), true);
  const rectCalls = root.getBoundingClientRectCalls;
  root.dispatch('pointermove', {
    pointerType: 'mouse',
    clientX: 400,
    clientY: 0,
  });
  assert.equal(
    root.getBoundingClientRectCalls,
    rectCalls,
    'pointermove uses cached geometry',
  );
  assert.equal(view.frameCount(), 1);
  view.runFrame(16);
  const firstFrame = parseTransform(style.transform);
  assert.ok(
    firstFrame.x > 0 && firstFrame.x < 9.9,
    'spring lags behind target',
  );
  assert.ok(firstFrame.y < 0 && firstFrame.y > -7.7);
  assert.ok(firstFrame.rotation > 7 && firstFrame.rotation < 8.65);
  for (let time = 32; time < 3000 && view.frameCount(); time += 16)
    view.runFrame(time);
  assert.equal(view.frameCount(), 0, 'RAF stops after spring settles');
  const settled = parseTransform(style.transform);
  assert.ok(Math.abs(settled.x - 9.9) < 0.001);
  assert.ok(Math.abs(settled.y + 7.7) < 0.001);
  assert.ok(Math.abs(settled.rotation - 8.65) < 0.001);
  root.dispatch('pointerleave');
  assert.equal(view.frameCount(), 1);
  for (let time = 3016; time < 6000 && view.frameCount(); time += 16)
    view.runFrame(time);
  assert.equal(
    style.transform,
    'translate3d(0.000px, 0.000px, 0) rotate(7.000deg)',
  );
  cleanup();
  assert.equal(style.transform, 'scale(1.2)');
});

test('idle motion works on coarse pointers; parallax requires hover and fine pointer', () => {
  const { root, layer, view, document, mediaQueries } = fixture({
    finePointer: false,
  });
  const cleanup = initHeroMotion(root);
  view.lastObserver.intersect(true);
  assert.equal(root.hasAttribute('data-motion-active'), true);
  assert.equal(root.listenerCount('pointermove'), 0);
  root.dispatch('pointermove', {
    pointerType: 'mouse',
    clientX: 300,
    clientY: 100,
  });
  assert.equal(view.frameCount(), 0);

  mediaQueries.get('(pointer: fine)').set(true);
  assert.equal(root.hasAttribute('data-motion-active'), true);
  assert.equal(root.listenerCount('pointermove'), 1);
  root.dispatch('pointermove', {
    pointerType: 'mouse',
    clientX: 300,
    clientY: 100,
  });
  assert.equal(view.frameCount(), 1);

  mediaQueries.get('(prefers-reduced-motion: no-preference)').set(false);
  assert.equal(root.hasAttribute('data-motion-active'), false);
  assert.equal(view.frameCount(), 0);
  assert.equal(
    layer.style.transform,
    'translate3d(0.000px, 0.000px, 0) rotate(7.000deg)',
  );
  mediaQueries.get('(prefers-reduced-motion: no-preference)').set(true);
  assert.equal(root.hasAttribute('data-motion-active'), true);
  cleanup();
  assert.equal(view.listenerCount('resize'), 0);
  assert.equal(view.listenerCount('scroll'), 0);
  assert.equal(root.listenerCount('pointermove'), 0);
  assert.equal(root.listenerCount('pointerleave'), 0);
  assert.equal(document.listenerCount('visibilitychange'), 0);
  for (const query of mediaQueries.values())
    assert.equal(query.listenerCount('change'), 0);
  assert.equal(view.lastObserver.disconnected, true);
  assert.equal(view.frameCount(), 0);
  assert.equal(root.hasAttribute('data-motion-active'), false);
  assert.equal(layer.style.transform, 'scale(1.2)');
});

test('touch pointers are ignored and out-of-view motion is reset and resumed at origin', () => {
  const { root, layer, view } = fixture();
  const cleanup = initHeroMotion(root);
  view.lastObserver.intersect(true);
  root.dispatch('pointermove', {
    pointerType: 'touch',
    clientX: 300,
    clientY: 100,
  });
  assert.equal(view.frameCount(), 0);
  const observer = view.lastObserver;
  observer.intersect(false);
  assert.equal(root.hasAttribute('data-motion-active'), false);
  assert.equal(
    layer.style.transform,
    'translate3d(0.000px, 0.000px, 0) rotate(7.000deg)',
  );
  observer.intersect(true);
  assert.equal(root.hasAttribute('data-motion-active'), true);
  cleanup();
});

test('a hidden tab cancels pending motion and returns at origin when visible', () => {
  const { root, layer, view, document } = fixture();
  const cleanup = initHeroMotion(root);
  view.lastObserver.intersect(true);
  root.dispatch('pointermove', {
    pointerType: 'mouse',
    clientX: 300,
    clientY: 100,
  });
  assert.equal(view.frameCount(), 1);
  document.hidden = true;
  document.dispatch('visibilitychange');
  assert.equal(view.frameCount(), 0);
  assert.equal(root.hasAttribute('data-motion-active'), false);
  assert.equal(
    layer.style.transform,
    'translate3d(0.000px, 0.000px, 0) rotate(7.000deg)',
  );
  document.hidden = false;
  document.dispatch('visibilitychange');
  assert.equal(root.hasAttribute('data-motion-active'), true);
  assert.equal(view.frameCount(), 0);
  cleanup();
});

function parseTransform(transform) {
  const match = transform.match(
    /translate3d\(([-\d.]+)px, ([-\d.]+)px, 0\) rotate\(([-\d.]+)deg\)/,
  );
  assert.ok(match, `Unexpected transform: ${transform}`);
  return {
    x: Number(match[1]),
    y: Number(match[2]),
    rotation: Number(match[3]),
  };
}
