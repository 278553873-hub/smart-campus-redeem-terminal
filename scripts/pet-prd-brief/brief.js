(() => {
  const root = document.getElementById('brief-version');
  const tabs = [...document.querySelectorAll('.doc-tabs [role="tab"]')];
  const panels = { full: document.getElementById('full-version'), brief: root };
  const positions = { full: 0, brief: 0 };
  let active = 'full';
  function selectView(view, updateUrl = true) {
    view = view === 'brief' ? 'brief' : 'full';
    positions[active] = window.scrollY;
    active = view;
    tabs.forEach(tab => {
      const selected = tab.dataset.view === view;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== view; });
    document.querySelector('.skip').href = view === 'brief' ? '#report-start' : '#overview';
    if (updateUrl) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('view', view);
        url.hash = '';
        window.history.replaceState(null, '', url);
      } catch { /* 本地文件预览限制地址修改时，切换仍然可用。 */ }
      window.scrollTo({ top: positions[view], behavior: 'instant' });
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectView(tab.dataset.view));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectView(tabs[next].dataset.view);
      tabs[next].focus();
    });
  });
  selectView(new URLSearchParams(window.location.search).get('view'), false);
  document.getElementById('brief-print').addEventListener('click', () => window.print());

  const assets = { ...REPORT_DATA.assets, egg0: ART[0] };
  function hydrate(container) {
    container.querySelectorAll('[data-report-asset]').forEach(img => { img.src = assets[img.dataset.reportAsset]; });
    container.querySelectorAll('[data-report-art]').forEach(img => { img.src = ART[Number(img.dataset.reportArt)]; });
    container.querySelectorAll('.brief-egg-front').forEach(img => {
      img.style.maskImage = `url("${assets.frontMask}")`;
      img.style.webkitMaskImage = `url("${assets.frontMask}")`;
    });
    container.querySelectorAll('.pet-companion-foil-sweep').forEach(layer => {
      const mask = `url("${ART[5]}")`;
      layer.style.maskImage = mask;
      layer.style.webkitMaskImage = mask;
    });
  }
  hydrate(root);
  const card = document.getElementById('brief-pet-card');
  const viewport = document.getElementById('brief-card-viewport');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: no-preference)');
  let currentStage = 0;
  let currentEgg = 0;
  let replayTimer;
  let frame = 0;
  let pointer = null;
  let bounds = null;
  let hovered = false;
  function resetHolo() {
    cancelAnimationFrame(frame);
    frame = 0;
    const scene = card.querySelector('.pet-companion-scene');
    if (!scene) return;
    scene.dataset.holoActive = 'false';
    ['--pet-tilt-x', '--pet-tilt-y', '--pet-layer-x', '--pet-layer-y', '--pet-foil-x', '--pet-foil-y', '--pet-foil-angle'].forEach(name => scene.style.removeProperty(name));
  }
  function move(event) {
    if (!hovered || currentStage < 4 || !motionPreference.matches) return;
    pointer = { x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const scene = card.querySelector('.pet-companion-scene');
      if (!scene || !bounds || !pointer || !bounds.width || !bounds.height) return;
      const x = Math.max(-1, Math.min(1, (pointer.x - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (pointer.y - bounds.top) / bounds.height * 2 - 1));
      scene.dataset.holoActive = 'true';
      const values = { '--pet-tilt-x': `${-y * 4}deg`, '--pet-tilt-y': `${x * 4}deg`, '--pet-layer-x': `${x * 3}px`, '--pet-layer-y': `${y * 2}px`, '--pet-foil-x': `${50 + x * 24}%`, '--pet-foil-y': `${50 + y * 24}%`, '--pet-foil-angle': `${x * 65 + y * 35}deg` };
      Object.entries(values).forEach(([name, value]) => scene.style.setProperty(name, value));
    });
  }
  function chooseStage(index) {
    clearTimeout(replayTimer);
    delete card.dataset.petPlaying;
    delete card.dataset.petRestarting;
    resetHolo();
    currentStage = index;
    const stage = REPORT_DATA.stages[index];
    viewport.innerHTML = index === 0 ? REPORT_DATA.eggs[currentEgg] : REPORT_DATA.scenes[index];
    hydrate(viewport);
    const badge = document.getElementById('brief-card-stage');
    badge.textContent = stage.name;
    badge.dataset.petStage = stage.key;
    document.getElementById('brief-card-level').textContent = `lv${stage.level}`;
    document.getElementById('brief-card-score').textContent = stage.full ? '已满级' : `${stage.current}/${stage.target}`;
    document.getElementById('brief-card-fill').style.width = `${stage.ratio * 100}%`;
    const track = document.getElementById('brief-card-track');
    track.setAttribute('aria-valuemax', String(stage.full ? 1 : stage.target));
    track.setAttribute('aria-valuenow', String(stage.full ? 1 : stage.current));
    track.setAttribute('aria-valuetext', stage.full ? 'lv10，已满级' : `lv${stage.level}，本级${stage.current}分，目标${stage.target}分`);
    card.setAttribute('aria-label', `林思齐，学号01，${stage.name}，lv${stage.level}，点击播放互动`);
    document.getElementById('brief-motion-title').textContent = stage.motion;
    root.querySelectorAll('[data-report-stage]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.reportStage) === index)));
    root.querySelectorAll('[data-report-egg]').forEach(button => button.setAttribute('aria-pressed', String(index === 0 && Number(button.dataset.reportEgg) === currentEgg)));
    if (currentStage >= 4 && motionPreference.matches && card.matches(':focus-visible')) card.querySelector('.pet-companion-scene').dataset.holoActive = 'true';
  }
  root.querySelectorAll('[data-report-stage]').forEach(button => button.addEventListener('click', () => chooseStage(Number(button.dataset.reportStage))));
  root.querySelectorAll('[data-report-egg]').forEach(button => button.addEventListener('click', () => { currentEgg = Number(button.dataset.reportEgg); chooseStage(0); }));
  card.addEventListener('click', () => {
    if (!motionPreference.matches) return;
    clearTimeout(replayTimer);
    card.dataset.petRestarting = 'true';
    void card.offsetWidth;
    delete card.dataset.petRestarting;
    card.dataset.petPlaying = 'true';
    replayTimer = setTimeout(() => { delete card.dataset.petPlaying; }, 1200);
  });
  card.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    bounds = card.getBoundingClientRect();
    move(event);
  });
  card.addEventListener('pointermove', move);
  function leave() {
    hovered = false;
    pointer = null;
    resetHolo();
    if (currentStage >= 4 && motionPreference.matches && card.matches(':focus-visible')) card.querySelector('.pet-companion-scene').dataset.holoActive = 'true';
  }
  card.addEventListener('pointerleave', leave);
  card.addEventListener('pointercancel', leave);
  card.addEventListener('focus', () => {
    if (currentStage >= 4 && motionPreference.matches && card.matches(':focus-visible')) card.querySelector('.pet-companion-scene').dataset.holoActive = 'true';
  });
  card.addEventListener('blur', () => { if (!hovered) resetHolo(); });
  motionPreference.addEventListener('change', () => { if (!motionPreference.matches) { resetHolo(); clearTimeout(replayTimer); delete card.dataset.petPlaying; } });
  const evolutionPreview = document.getElementById('brief-classroom-evolution-preview');
  let evolutionStage = 0;
  const presetSelect = document.getElementById('brief-evolution-preset');
  function syncEvolutionPreview() {
    evolutionPreview.contentWindow?.postMessage({ type: 'pet-evolution-preview', stage: evolutionStage, preset: presetSelect.value }, window.location.origin === 'null' ? '*' : window.location.origin);
  }
  root.querySelectorAll('[data-evolution-stage]').forEach(button => button.addEventListener('click', () => {
    evolutionStage = Number(button.dataset.evolutionStage);
    root.querySelectorAll('[data-evolution-stage]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    syncEvolutionPreview();
  }));
  presetSelect.addEventListener('change', syncEvolutionPreview);
  evolutionPreview.addEventListener('load', syncEvolutionPreview);
  window.addEventListener('message', event => {
    if (event.source !== evolutionPreview.contentWindow) return;
    if (event.data?.type === 'pet-evolution-preview-ready') syncEvolutionPreview();
    if (event.data?.type === 'pet-evolution-preview-size' && Number.isFinite(event.data.height) && event.data.height > 0) evolutionPreview.style.height = Math.max(400, Math.min(2000, event.data.height)) + 'px';
  });
  chooseStage(0);
})();
