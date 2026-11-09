import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initSiteBackground } from '../src/scripts/site-background.ts';

class FakeTarget {
  listeners = new Map();
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
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
  width = 1280,
  readyState = 'complete',
  hidden = false,
} = {}) {
  const idleCallbacks = new Map();
  let nextIdleId = 1;
  const media = new FakeTarget();
  media.matches = true;
  const view = new FakeTarget();
  view.innerWidth = width;
  view.matchMedia = () => media;
  view.requestIdleCallback = (callback, options) => {
    const id = nextIdleId++;
    idleCallbacks.set(id, { callback, options });
    return id;
  };
  view.cancelIdleCallback = (id) => idleCallbacks.delete(id);
  view.runIdle = () => {
    const [id, item] = idleCallbacks.entries().next().value ?? [];
    if (!item) return false;
    idleCallbacks.delete(id);
    item.callback({ didTimeout: true, timeRemaining: () => 0 });
    return true;
  };
  view.idleCount = () => idleCallbacks.size;

  const document = new FakeTarget();
  document.readyState = readyState;
  document.hidden = hidden;
  document.hasFocus = () => true;
  document.defaultView = view;
  const outer = {
    attributes: new Set(),
    toggleAttribute(name, value) {
      if (value) this.attributes.add(name);
      else this.attributes.delete(name);
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
    hasAttribute(name) {
      return this.attributes.has(name);
    },
  };
  const host = {
    ownerDocument: document,
    parentElement: outer,
    id: 'site-stars',
  };
  return { document, host, idleCallbacks, media, outer, view };
}

function fakeContainer() {
  return {
    playCalls: 0,
    pauseCalls: 0,
    destroyCalls: 0,
    play() {
      this.playCalls++;
    },
    pause() {
      this.pauseCalls++;
    },
    destroy() {
      this.destroyCalls++;
    },
  };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

test('starts one animation loop after idle and suspends only for hidden tabs or reduced motion', async () => {
  const { host, outer, view, document, media } = fixture();
  const container = fakeContainer();
  let call;
  const cleanup = initSiteBackground(host, async (...args) => {
    call = args;
    return container;
  });
  assert.equal(outer.hasAttribute('data-background-active'), true);
  assert.equal(view.idleCount(), 1);
  assert.equal(call, undefined, 'library loading waits for idle time');
  assert.equal(view.runIdle(), true);
  await flushPromises();
  assert.equal(call[0], host);
  assert.equal(call[1].autoPlay, false);
  assert.equal(call[1].fullScreen.enable, false);
  assert.equal(call[1].detectRetina, false);
  assert.equal(call[1].fpsLimit, 30);
  assert.equal(call[1].particles.number.value, 52);
  assert.equal(call[1].particles.links.distance, 145);
  assert.equal(call[1].particles.links.opacity, 0.11);
  assert.equal(call[1].particles.links.width, 0.6);
  assert.deepEqual(call[1].particles.move.speed, { min: 0.18, max: 0.4 });
  assert.equal(
    container.playCalls,
    1,
    'one activation starts exactly one render loop',
  );

  view.dispatch('blur');
  assert.equal(
    outer.hasAttribute('data-background-active'),
    true,
    'visible page continues without window focus',
  );
  assert.equal(container.pauseCalls, 0);
  view.dispatch('focus');
  assert.equal(container.playCalls, 1, 'focus does not add render loops');
  document.hidden = true;
  document.dispatch('visibilitychange');
  assert.equal(outer.hasAttribute('data-background-active'), false);
  assert.equal(container.pauseCalls, 1);
  document.hidden = false;
  document.dispatch('visibilitychange');
  assert.equal(container.playCalls, 2);
  document.dispatch('visibilitychange');
  assert.equal(
    container.playCalls,
    2,
    'repeated notifications do not duplicate render loops',
  );
  media.matches = false;
  media.dispatch('change');
  assert.equal(outer.hasAttribute('data-background-active'), false);
  assert.equal(container.pauseCalls, 2);

  cleanup();
  assert.equal(container.destroyCalls, 1);
  assert.equal(outer.hasAttribute('data-background-active'), false);
  assert.equal(document.listenerCount('visibilitychange'), 0);
  assert.equal(view.listenerCount('blur'), 0);
  assert.equal(view.listenerCount('focus'), 0);
  assert.equal(view.listenerCount('pagehide'), 0);
  assert.equal(view.listenerCount('pageshow'), 0);
  assert.equal(media.listenerCount('change'), 0);
});

test('a hidden or reduced-motion change during async loading keeps the resolved canvas paused', async () => {
  for (const suspend of ['hidden', 'reduced']) {
    const { document, host, media, outer, view } = fixture({ width: 390 });
    const container = fakeContainer();
    let resolveLoader;
    let options;
    const cleanup = initSiteBackground(host, (_host, loadedOptions) => {
      options = loadedOptions;
      return new Promise((resolve) => {
        resolveLoader = resolve;
      });
    });
    assert.equal(view.runIdle(), true);
    assert.equal(outer.hasAttribute('data-background-active'), true);
    if (suspend === 'hidden') {
      document.hidden = true;
      document.dispatch('visibilitychange');
    } else {
      media.matches = false;
      media.dispatch('change');
    }
    assert.equal(outer.hasAttribute('data-background-active'), false);
    assert.equal(options.fpsLimit, 24);
    assert.equal(options.particles.number.value, 24);
    resolveLoader(container);
    await flushPromises();
    assert.equal(container.playCalls, 0);
    assert.equal(container.pauseCalls, 1);
    assert.equal(container.destroyCalls, 0);
    if (suspend === 'hidden') {
      document.hidden = false;
      document.dispatch('visibilitychange');
    } else {
      media.matches = true;
      media.dispatch('change');
    }
    assert.equal(outer.hasAttribute('data-background-active'), true);
    assert.equal(container.playCalls, 1);
    cleanup();
  }
});

test('cleanup cancels scheduled or late loading work and removes page lifecycle listeners', async () => {
  const scheduled = fixture({ readyState: 'interactive' });
  const cleanupScheduled = initSiteBackground(scheduled.host, async () => {
    throw new Error('should not start before load');
  });
  assert.equal(scheduled.view.listenerCount('load'), 1);
  cleanupScheduled();
  assert.equal(scheduled.view.listenerCount('load'), 0);

  const { host, outer, view } = fixture();
  let resolveLoader;
  const cleanup = initSiteBackground(
    host,
    () =>
      new Promise((resolve) => {
        resolveLoader = resolve;
      }),
  );
  view.runIdle();
  cleanup();
  const container = fakeContainer();
  resolveLoader(container);
  await flushPromises();
  assert.equal(container.destroyCalls, 1);
  assert.equal(outer.hasAttribute('data-background-active'), false);
  assert.equal(view.idleCount(), 0);
});
