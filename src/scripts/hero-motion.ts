type MotionLayer = HTMLElement & {
  dataset: DOMStringMap & { depth?: string; rotation?: string };
};

type Point = { x: number; y: number; rotation: number };

const STIFFNESS = 80;
const DAMPING = 15;
const MAX_DT = 0.05;
const REST_EPSILON = 0.01;

/** Adds optional idle and pointer motion to a hero; returns its disposer. */
export function initHeroMotion(root: HTMLElement): () => void {
  const defaultView = root.ownerDocument.defaultView;
  if (!defaultView) return () => {};
  const view = defaultView;
  const layers = Array.from(
    root.querySelectorAll<MotionLayer>('[data-motion-layer]'),
    (element) => ({
      element,
      depth: finiteNumber(element.dataset.depth, 0),
      rotation: finiteNumber(element.dataset.rotation, 0),
    }),
  );

  const hover = view.matchMedia('(hover: hover)');
  const finePointer = view.matchMedia('(pointer: fine)');
  const reducedMotion = view.matchMedia(
    '(prefers-reduced-motion: no-preference)',
  );
  let visible = !root.ownerDocument.hidden;
  let inView = typeof view.IntersectionObserver !== 'function';
  let disposed = false;
  let listeningForPointer = false;
  let frame: number | null = null;
  let previousTime: number | null = null;
  let rect = root.getBoundingClientRect();
  let target: Point = { x: 0, y: 0, rotation: 0 };
  let position: Point = { x: 0, y: 0, rotation: 0 };
  let velocity: Point = { x: 0, y: 0, rotation: 0 };
  const initialTransforms = layers.map(
    ({ element }) => element.style.transform,
  );

  const idleMotionActive = () => reducedMotion.matches && inView && visible;
  const pointerMotionActive = () =>
    idleMotionActive() && hover.matches && finePointer.matches;

  function render(): void {
    for (const { element, depth, rotation } of layers) {
      const x = position.x * depth;
      const y = position.y * depth;
      const tilt = position.rotation * depth;
      element.style.transform = `translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, 0) rotate(${(rotation + tilt).toFixed(3)}deg)`;
    }
  }

  function stopFrame(): void {
    if (frame !== null) view.cancelAnimationFrame(frame);
    frame = null;
    previousTime = null;
  }

  function zeroMotion(): void {
    stopFrame();
    target = { x: 0, y: 0, rotation: 0 };
    position = { x: 0, y: 0, rotation: 0 };
    velocity = { x: 0, y: 0, rotation: 0 };
    render();
  }

  function setPointerListening(shouldListen: boolean): void {
    if (shouldListen === listeningForPointer) return;
    listeningForPointer = shouldListen;
    if (shouldListen) {
      root.addEventListener('pointermove', onPointerMove, { passive: true });
      root.addEventListener('pointerleave', onPointerLeave, { passive: true });
      rect = root.getBoundingClientRect();
    } else {
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
    }
  }

  function sync(): void {
    if (disposed) return;
    const shouldRunIdleMotion = idleMotionActive();
    const shouldTrackPointer = pointerMotionActive();
    root.toggleAttribute('data-motion-active', shouldRunIdleMotion);
    setPointerListening(shouldTrackPointer);
    if (!shouldTrackPointer) zeroMotion();
  }

  function schedule(): void {
    if (frame === null && pointerMotionActive())
      frame = view.requestAnimationFrame(animate);
  }

  function animate(timestamp: number): void {
    frame = null;
    if (!pointerMotionActive()) {
      zeroMotion();
      sync();
      return;
    }

    const dt =
      previousTime === null
        ? 1 / 60
        : Math.min(MAX_DT, Math.max(0, (timestamp - previousTime) / 1000));
    previousTime = timestamp;
    const omegaSquared = STIFFNESS;
    const alpha = DAMPING / 2;
    const dampedFrequency = Math.sqrt(omegaSquared - alpha * alpha);
    const decay = Math.exp(-alpha * dt);
    let moving = false;

    for (const key of ['x', 'y', 'rotation'] as const) {
      const displacement = position[key] - target[key];
      const sin = Math.sin(dampedFrequency * dt);
      const cos = Math.cos(dampedFrequency * dt);
      const coefficient =
        (velocity[key] + alpha * displacement) / dampedFrequency;
      const nextDisplacement = decay * (displacement * cos + coefficient * sin);
      const nextVelocity =
        decay *
        (velocity[key] * cos -
          ((alpha * velocity[key] + omegaSquared * displacement) /
            dampedFrequency) *
            sin);
      position[key] = target[key] + nextDisplacement;
      velocity[key] = nextVelocity;
      if (
        Math.abs(nextDisplacement) > REST_EPSILON ||
        Math.abs(nextVelocity) > REST_EPSILON
      )
        moving = true;
    }

    if (!moving) {
      position = { ...target };
      velocity = { x: 0, y: 0, rotation: 0 };
    }
    render();
    if (moving) frame = view.requestAnimationFrame(animate);
    else previousTime = null;
  }

  function onPointerMove(event: PointerEvent): void {
    if (!pointerMotionActive() || event.pointerType === 'touch') return;
    const width = rect.width;
    const height = rect.height;
    if (width <= 0 || height <= 0) return;
    const clamp = (value: number) => Math.max(-1, Math.min(1, value));
    const x = clamp(((event.clientX - rect.left) / width) * 2 - 1);
    const y = clamp(((event.clientY - rect.top) / height) * 2 - 1);
    target = { x: x * 18, y: y * 14, rotation: x * 3 };
    schedule();
  }

  function onPointerLeave(): void {
    if (!pointerMotionActive()) return;
    target = { x: 0, y: 0, rotation: 0 };
    schedule();
  }

  function refreshRect(): void {
    if (pointerMotionActive()) rect = root.getBoundingClientRect();
  }

  function onVisibilityChange(): void {
    visible = !root.ownerDocument.hidden;
    sync();
  }

  const onMediaChange = () => sync();
  hover.addEventListener('change', onMediaChange);
  finePointer.addEventListener('change', onMediaChange);
  reducedMotion.addEventListener('change', onMediaChange);
  root.ownerDocument.addEventListener('visibilitychange', onVisibilityChange);
  view.addEventListener('resize', refreshRect, { passive: true });
  view.addEventListener('scroll', refreshRect, {
    passive: true,
    capture: true,
  });
  const observer =
    typeof view.IntersectionObserver === 'function'
      ? new view.IntersectionObserver((entries) => {
          const entry = entries.find((candidate) => candidate.target === root);
          if (entry) {
            inView = entry.isIntersecting;
            sync();
          }
        })
      : null;
  observer?.observe(root);

  sync();

  return () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    hover.removeEventListener('change', onMediaChange);
    finePointer.removeEventListener('change', onMediaChange);
    reducedMotion.removeEventListener('change', onMediaChange);
    root.ownerDocument.removeEventListener(
      'visibilitychange',
      onVisibilityChange,
    );
    view.removeEventListener('resize', refreshRect);
    view.removeEventListener('scroll', refreshRect, true);
    setPointerListening(false);
    root.removeAttribute('data-motion-active');
    zeroMotion();
    layers.forEach(({ element }, index) => {
      element.style.transform = initialTransforms[index];
    });
  };
}

function finiteNumber(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
