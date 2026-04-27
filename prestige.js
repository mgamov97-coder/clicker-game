const PRESTIGE_REQ = 1_000_000;

function calcPrestigeGain() {
  return Math.max(0, Math.floor(Math.sqrt(G.soulsTotal / PRESTIGE_REQ)));
}

function doPrestige() {
  if (G.soulsTotal < PRESTIGE_REQ) return;
  if (!confirm('Rebirth? All progress (except Dark Power and kingdoms) will be reset.')) return;

  const gain = calcPrestigeGain();
  G.darkPower     += gain;
  G.prestigeCount += 1;

  G.souls      = 0;
  G.soulsTotal = 0;
  G.upgrades   = new Set();
  for (const b of BUILDINGS) {
    G.buildings[b.id] = { count: 0, totalBought: 0 };
  }

  recalcPerSec();
  recalcPerClick();
  checkAchievements();
  saveGame();

  Sounds.prestige();
  addLog(`Rebirth #${G.prestigeCount}! +${gain} Dark Power`, 'log-pres');
  showToast(`☠ Rebirth #${G.prestigeCount}! +${gain} Dark Power`);

  UI.renderBuildings();
  UI.renderUpgrades();
  UI.updateHeader();
  UI.updateBuildings();
  UI.updateUpgrades();
  UI.updateSpells();
  UI.updatePrestige();

  switchTab('buildings');
}
