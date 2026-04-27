const KINGDOMS = [
  { id: 'k1',  name: 'Grey Marshes',       icon: '🌫️', req: 1_000,           bonus: 0.05, desc: 'Swamps at the edge of the world. +5% income.' },
  { id: 'k2',  name: 'Ashfields',          icon: '🌾', req: 10_000,          bonus: 0.05, desc: 'Scorched plains. +5% income.' },
  { id: 'k3',  name: 'Bloodstained Peaks', icon: '⛰️', req: 75_000,          bonus: 0.08, desc: 'Mountains soaked in blood. +8% income.' },
  { id: 'k4',  name: 'Dark Forest of Nar', icon: '🌲', req: 500_000,         bonus: 0.10, desc: 'A forest with no dawn. +10% income.' },
  { id: 'k5',  name: 'Cursed Sea',         icon: '🌊', req: 3_000_000,       bonus: 0.12, desc: 'The waters carry a curse. +12% income.' },
  { id: 'k6',  name: 'Shadow Citadel',     icon: '🏰', req: 20_000_000,      bonus: 0.15, desc: 'An impenetrable fortress. +15% income.' },
  { id: 'k7',  name: 'Eternal Frost',      icon: '❄️', req: 150_000_000,     bonus: 0.18, desc: 'The realm of eternal cold. +18% income.' },
  { id: 'k8',  name: 'Gates of the Abyss', icon: '🌋', req: 1_000_000_000,  bonus: 0.25, desc: 'Straight into hell. +25% income.' },
  { id: 'k9',  name: 'Celestial Throne',   icon: '⚡', req: 10_000_000_000, bonus: 0.35, desc: 'The fallen gods. +35% income.' },
  { id: 'k10', name: 'The Entire Universe',icon: '🌌', req: 1e13,            bonus: 0.50, desc: 'Darkness consumed everything. +50% income.' },
];

function kingdomsMultiplier() {
  if (!G.kingdoms) return 1;
  let mult = 1;
  for (const k of KINGDOMS) {
    if (G.kingdoms.has(k.id)) mult += k.bonus;
  }
  return mult;
}

function checkKingdoms() {
  if (!G.kingdoms) G.kingdoms = new Set();
  let changed = false;
  for (const k of KINGDOMS) {
    if (!G.kingdoms.has(k.id) && G.soulsTotal >= k.req) {
      G.kingdoms.add(k.id);
      showToast(`⚔ Conquered: ${k.name}!`, 'toast-kingdom');
      addLog(`Kingdom conquered: ${k.name}`, 'log-buy');
      Sounds.achievement();
      changed = true;
    }
  }
  if (changed) {
    recalcPerSec();
    recalcPerClick();
    UI.updateKingdoms();
  }
}
