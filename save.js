const SAVE_KEY = 'darkLord_v1';

function saveGame() {
  const data = {
    souls:          G.souls,
    soulsTotal:     G.soulsTotal,
    darkPower:      G.darkPower,
    prestigeCount:  G.prestigeCount,
    totalClicks:    G.totalClicks  || 0,
    totalSpent:     G.totalSpent   || 0,
    lastSave:       Date.now(),
    buildings:      {},
    upgrades:       [...G.upgrades],
    achievements:   [...G.achievements],
    kingdoms:       [...(G.kingdoms || [])],
  };
  for (const b of BUILDINGS) {
    data.buildings[b.id] = { ...G.buildings[b.id] };
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    G.souls         = data.souls         ?? 0;
    G.soulsTotal    = data.soulsTotal    ?? 0;
    G.darkPower     = data.darkPower     ?? 0;
    G.prestigeCount = data.prestigeCount ?? 0;
    G.totalClicks   = data.totalClicks   ?? 0;
    G.totalSpent    = data.totalSpent    ?? 0;

    for (const b of BUILDINGS) {
      if (data.buildings?.[b.id]) G.buildings[b.id] = data.buildings[b.id];
    }
    G.upgrades     = new Set(data.upgrades     ?? []);
    G.achievements = new Set(data.achievements ?? []);
    G.kingdoms     = new Set(data.kingdoms     ?? []);

    // Offline income (max 8 hours)
    const elapsed = Math.min((Date.now() - (data.lastSave ?? Date.now())) / 1000, 28800);
    if (elapsed > 10) {
      recalcPerSec();
      if (G.soulsPerSec > 0) {
        const offline = elapsed * G.soulsPerSec;
        G.souls      += offline;
        G.soulsTotal += offline;
        setTimeout(() => {
          addLog(`While you were away (${fmtTime(elapsed)}): +${fmt(offline)} souls`, 'log-soul');
          showToast(`Offline: +${fmt(offline)} souls`);
        }, 500);
      }
    }
  } catch (e) {
    console.warn('Save load error', e);
  }
}
