// ===== GAME STATE =====
const G = {
  souls:          0,
  soulsTotal:     0,
  soulsPerClick:  1,
  soulsPerSec:    0,
  darkPower:      0,
  prestigeCount:  0,
  buildings:      {},
  upgrades:       new Set(),
  achievements:   new Set(),
  kingdoms:       new Set(),
  totalClicks:    0,
  totalSpent:     0,
};

// ===== CALCULATIONS =====
function prestigeMultiplier() {
  return 1 + G.darkPower * 0.05;
}

function recalcPerSec() {
  let total = 0;
  for (const b of BUILDINGS) {
    const st = G.buildings[b.id];
    if (!st) continue;
    total += b.baseIncome * st.count * upgradeMultiplierFor(b.id);
  }
  G.soulsPerSec = total * prestigeMultiplier() * kingdomsMultiplier();
}

function recalcPerClick() {
  G.soulsPerClick = 1 * upgradeMultiplierFor('click') * prestigeMultiplier() * kingdomsMultiplier();
}

// ===== CLICK =====
function doClick(e) {
  const earned = G.soulsPerClick * getSpellClickMult();
  G.souls      += earned;
  G.soulsTotal += earned;
  G.totalClicks++;

  spawnClickFloat(e, earned);
  Sounds.click();
  checkAchievements();
  checkKingdoms();
  UI.updateHeader();
}

// ===== GAME LOOP =====
let lastFrame    = 0;
let statsTimer   = 0;
let spellUITimer = 0;

function tick(timestamp) {
  const dt = Math.min((timestamp - lastFrame) / 1000, 1);
  lastFrame = timestamp;

  if (G.soulsPerSec > 0) {
    const earned = G.soulsPerSec * getSpellIncomeMult() * dt;
    G.souls      += earned;
    G.soulsTotal += earned;
  }

  tickSpells(dt);
  tickEvents(dt);
  animateParticles(dt);

  UI.updateHeader();
  UI.updateBuildings();
  UI.updatePrestige();

  spellUITimer += dt;
  if (spellUITimer >= 0.25) {
    UI.updateSpells();
    UI.updateKingdoms();
    spellUITimer = 0;
  }

  statsTimer += dt;
  if (statsTimer >= 2) {
    checkAchievements();
    checkKingdoms();
    statsTimer = 0;
    const statsTab = document.getElementById('tab-stats');
    if (statsTab?.classList.contains('active')) UI.updateStats();
  }

  requestAnimationFrame(tick);
}

// ===== BUY BUILDING =====
function buyBuilding(id, bulk) {
  const b    = BUILDINGS.find(x => x.id === id);
  const st   = G.buildings[id];
  const qty  = bulk || 1;
  const cost = buildingCost(id, qty);
  if (G.souls < cost) return;

  G.souls        -= cost;
  G.totalSpent   += cost;
  st.count       += qty;
  st.totalBought += qty;

  recalcPerSec();
  recalcPerClick();
  checkAchievements();
  checkKingdoms();

  addLog(`Built: ${b.name} ×${qty}`, 'log-buy');
  UI.updateHeader();
  UI.updateBuildings();
  UI.updateUpgrades();
  spawnBuyParticles(window.innerWidth * 0.35, window.innerHeight * 0.5);
}

function buildingCost(id, qty) {
  const b  = BUILDINGS.find(x => x.id === id);
  const st = G.buildings[id];
  let cost = 0;
  for (let i = 0; i < qty; i++) {
    cost += Math.floor(b.baseCost * Math.pow(1.15, st.count + i));
  }
  return cost;
}

// ===== BUY UPGRADE =====
function buyUpgrade(id) {
  const upg = UPGRADES.find(x => x.id === id);
  if (!upg || G.upgrades.has(id) || G.souls < upg.cost) return;

  G.souls      -= upg.cost;
  G.totalSpent += upg.cost;
  G.upgrades.add(id);

  recalcPerSec();
  recalcPerClick();
  checkAchievements();

  addLog(`Curse: ${upg.name}`, 'log-buy');
  showToast(`✦ ${upg.name}`);
  UI.updateHeader();
  UI.updateUpgrades();
  spawnBuyParticles(window.innerWidth * 0.5, window.innerHeight * 0.4);
}

// ===== TABS =====
function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');

  if (name === 'upgrades')     UI.updateUpgrades();
  if (name === 'achievements') UI.updateAchievements();
  if (name === 'prestige')     UI.updatePrestige();
  if (name === 'kingdoms')     UI.updateKingdoms();
  if (name === 'stats')        UI.updateStats();
}

// ===== INIT =====
function init() {
  for (const b of BUILDINGS) {
    G.buildings[b.id] = { count: 0, totalBought: 0 };
  }

  loadGame();
  recalcPerSec();
  recalcPerClick();

  UI.renderBuildings();
  UI.renderUpgrades();
  UI.renderSpells();
  UI.renderKingdoms();
  UI.renderAchievements();
  UI.updateHeader();
  UI.updateBuildings();
  UI.updateUpgrades();
  UI.updateSpells();
  UI.updateKingdoms();
  UI.updatePrestige();

  document.getElementById('click-orb').addEventListener('click', doClick);
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.getElementById('prestige-btn').addEventListener('click', doPrestige);
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Reset everything? This cannot be undone.')) {
      localStorage.removeItem('darkLord_v1');
      location.reload();
    }
  });

  lastFrame = performance.now();
  requestAnimationFrame(tick);
  setInterval(saveGame, 30_000);
}

document.addEventListener('DOMContentLoaded', init);
