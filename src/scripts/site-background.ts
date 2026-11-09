import type { Container } from '@tsparticles/engine';
import type { ISourceOptions } from '@tsparticles/engine';

type ParticleContainer = Pick<Container, 'pause' | 'play' | 'destroy'>;
type ParticleLoader = (
  host: HTMLElement,
  options: ISourceOptions,
) => Promise<ParticleContainer | undefined>;

type IdleCapableWindow = Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/** Initializes the local particle layer and returns a complete disposer. */
export function initSiteBackground(
  host: HTMLElement,
  loader: ParticleLoader = loadParticles,
): () => void {
  const defaultView = host.ownerDocument.defaultView;
  if (!defaultView) return () => {};
  const view: IdleCapableWindow = defaultView;

  const document = host.ownerDocument;
  const outer = host.parentElement;
  const reducedMotion = view.matchMedia(
    '(prefers-reduced-motion: no-preference)',
  );
  let pageActive = true;
  let container: ParticleContainer | undefined;
  let loading = false;
  let loadFailed = false;
  let disposed = false;
  let loadTimer: number | null = null;
  let idleCallback: number | null = null;
  let waitingForLoad = false;
  let isPlaying = false;

  const isEligible = () =>
    reducedMotion.matches && !document.hidden && pageActive;

  function clearLoadSchedule(): void {
    if (loadTimer !== null) view.clearTimeout(loadTimer);
    if (idleCallback !== null) view.cancelIdleCallback?.(idleCallback);
    if (waitingForLoad) view.removeEventListener('load', onLoad);
    loadTimer = null;
    idleCallback = null;
    waitingForLoad = false;
  }

  function startContainer(): void {
    if (!container || isPlaying) return;
    // engine.load() has already completed start(); one call starts one RAF chain.
    container.play();
    isPlaying = true;
  }

  function stopContainer(): void {
    if (!container || !isPlaying) return;
    container.pause();
    isPlaying = false;
  }

  function sync(): void {
    if (disposed) return;
    const eligible = isEligible();
    outer?.toggleAttribute('data-background-active', eligible);
    if (eligible) {
      if (container) startContainer();
      else scheduleLoad();
    } else {
      clearLoadSchedule();
      stopContainer();
    }
  }

  async function initializeParticles(): Promise<void> {
    if (disposed || !isEligible() || loading || container || loadFailed) return;
    loading = true;
    try {
      const loaded = await loader(host, particleOptions(view.innerWidth));
      if (disposed) {
        loaded?.destroy();
        return;
      }
      if (!loaded) {
        loadFailed = true;
        return;
      }
      container = loaded;
      if (isEligible()) startContainer();
      else {
        container.pause();
        isPlaying = false;
      }
    } catch {
      // CSS auroras remain as the local, dependency-free visual fallback.
      loadFailed = true;
    } finally {
      loading = false;
    }
  }

  function scheduleAfterLoad(): void {
    if (typeof view.requestIdleCallback === 'function') {
      idleCallback = view.requestIdleCallback(
        () => {
          idleCallback = null;
          void initializeParticles();
        },
        { timeout: 1000 },
      );
    } else {
      loadTimer = view.setTimeout(() => {
        loadTimer = null;
        void initializeParticles();
      }, 0);
    }
  }

  function onLoad(): void {
    waitingForLoad = false;
    view.removeEventListener('load', onLoad);
    if (isEligible()) scheduleAfterLoad();
  }

  function scheduleLoad(): void {
    if (
      disposed ||
      loading ||
      container ||
      loadFailed ||
      idleCallback !== null ||
      loadTimer !== null ||
      waitingForLoad
    )
      return;
    if (document.readyState === 'complete') scheduleAfterLoad();
    else {
      waitingForLoad = true;
      view.addEventListener('load', onLoad, { once: true });
    }
  }

  function onVisibilityChange(): void {
    sync();
  }

  function onPageHide(): void {
    pageActive = false;
    sync();
  }

  function onPageShow(): void {
    pageActive = true;
    sync();
  }

  reducedMotion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', onVisibilityChange);
  view.addEventListener('pagehide', onPageHide);
  view.addEventListener('pageshow', onPageShow);
  sync();

  return () => {
    if (disposed) return;
    disposed = true;
    clearLoadSchedule();
    reducedMotion.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    view.removeEventListener('pagehide', onPageHide);
    view.removeEventListener('pageshow', onPageShow);
    outer?.removeAttribute('data-background-active');
    container?.destroy();
    container = undefined;
    isPlaying = false;
  };
}

function particleOptions(width: number): ISourceOptions {
  const mobile = width < 768;
  return {
    autoPlay: false,
    background: { color: 'transparent', opacity: 0 },
    detectRetina: false,
    fpsLimit: mobile ? 24 : 30,
    fullScreen: { enable: false },
    pauseOnBlur: false,
    pauseOnOutsideViewport: false,
    particles: {
      color: { value: ['#c4b5fd', '#a78bfa', '#ddd6fe'] },
      links: {
        enable: true,
        distance: 145,
        color: '#a78bfa',
        opacity: 0.11,
        width: 0.6,
      },
      move: {
        enable: true,
        direction: 'none',
        random: true,
        straight: false,
        speed: { min: 0.18, max: 0.4 },
        outModes: { default: 'out' },
      },
      number: {
        value: mobile ? 24 : 52,
        density: { enable: false, height: 900, width: 1600 },
      },
      opacity: {
        value: { min: 0.18, max: 0.55 },
        animation: {
          enable: true,
          speed: 0.25,
          sync: false,
        },
      },
      shape: { type: 'circle' },
      size: { value: { min: 0.7, max: 1.8 } },
    },
  };
}

async function loadParticles(
  host: HTMLElement,
  options: ISourceOptions,
): Promise<ParticleContainer | undefined> {
  const [engineModule, basicModule, interactivityModule, linksModule] =
    await Promise.all([
      import('@tsparticles/engine'),
      import('@tsparticles/basic'),
      import('@tsparticles/plugin-interactivity'),
      import('@tsparticles/interaction-particles-links'),
    ]);
  const engine = engineModule.tsParticles;
  await basicModule.loadBasic(engine);
  await interactivityModule.loadInteractivityPlugin(engine);
  await linksModule.loadParticlesLinksInteraction(engine);
  await engine.init();
  return engine.load({
    id: host.id || 'site-stars',
    element: host,
    options,
  });
}
