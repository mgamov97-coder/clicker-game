const ACHIEVEMENTS = [
  { id: 'first_soul',    icon: '💀', name: 'First Soul',          desc: 'Collect 1 soul',                    check: () => G.soulsTotal >= 1 },
  { id: 'souls_100',     icon: '🌑', name: 'Darkness Calls',      desc: 'Collect 100 souls',                 check: () => G.soulsTotal >= 100 },
  { id: 'souls_1k',      icon: '⚰️', name: 'Graveyard',           desc: 'Collect 1,000 souls',               check: () => G.soulsTotal >= 1_000 },
  { id: 'souls_10k',     icon: '🦇', name: 'Army of the Dead',    desc: 'Collect 10,000 souls',              check: () => G.soulsTotal >= 10_000 },
  { id: 'souls_100k',    icon: '🔮', name: 'Dark Sorcerer',       desc: 'Collect 100,000 souls',             check: () => G.soulsTotal >= 100_000 },
  { id: 'souls_1m',      icon: '🌋', name: 'Lord of Darkness',    desc: 'Collect 1,000,000 souls',           check: () => G.soulsTotal >= 1_000_000 },
  { id: 'souls_1b',      icon: '👑', name: 'Dark God',            desc: 'Collect 1 billion souls',           check: () => G.soulsTotal >= 1_000_000_000 },
  { id: 'souls_1t',      icon: '♾️', name: 'Beyond Darkness',     desc: 'Collect 1 trillion souls',          check: () => G.soulsTotal >= 1e12 },
  { id: 'building_1',    icon: '🏗️', name: 'First Stone',         desc: 'Buy 1 building',                    check: () => totalBuildings() >= 1 },
  { id: 'building_10',   icon: '🏘️', name: 'Settlement',          desc: 'Buy 10 buildings',                  check: () => totalBuildings() >= 10 },
  { id: 'building_50',   icon: '🏰', name: 'Dark City',           desc: 'Buy 50 buildings',                  check: () => totalBuildings() >= 50 },
  { id: 'building_100',  icon: '🌆', name: 'Empire of Darkness',  desc: 'Buy 100 buildings',                 check: () => totalBuildings() >= 100 },
  { id: 'building_200',  icon: '🌍', name: 'Dark World',          desc: 'Buy 200 buildings',                 check: () => totalBuildings() >= 200 },
  { id: 'all_buildings', icon: '🔱', name: 'Total Control',       desc: 'Buy at least 1 of every type',      check: () => BUILDINGS.every(b => G.buildings[b.id]?.count >= 1) },
  { id: 'upgrades_5',    icon: '✨', name: 'Sorcerer',            desc: 'Buy 5 curses',                      check: () => G.upgrades.size >= 5 },
  { id: 'upgrades_all',  icon: '🌟', name: 'Archmage of Darkness',desc: 'Buy all curses',                    check: () => G.upgrades.size >= UPGRADES.length },
  { id: 'prestige_1',    icon: '🔄', name: 'Rebirth',             desc: 'Prestige for the first time',       check: () => G.prestigeCount >= 1 },
  { id: 'prestige_5',    icon: '💫', name: 'Eternal Cycle',       desc: 'Prestige 5 times',                  check: () => G.prestigeCount >= 5 },
  { id: 'prestige_10',   icon: '🌀', name: 'The Infinite',        desc: 'Prestige 10 times',                 check: () => G.prestigeCount >= 10 },
  { id: 'throne_1',      icon: '😱', name: 'Throne Claimed',      desc: 'Buy the Throne of Darkness',        check: () => G.buildings.throne?.count >= 1 },
  { id: 'ps_1000',       icon: '⚡', name: 'Dark Stream',         desc: '1,000 souls per second',            check: () => G.soulsPerSec >= 1_000 },
  { id: 'ps_1m',         icon: '🌊', name: 'Ocean of Darkness',   desc: '1,000,000 souls per second',        check: () => G.soulsPerSec >= 1_000_000 },
  { id: 'kingdoms_5',    icon: '⚔️', name: 'Conqueror',           desc: 'Conquer 5 kingdoms',                check: () => (G.kingdoms?.size ?? 0) >= 5 },
  { id: 'kingdoms_all',  icon: '🌌', name: 'Lord of the Universe',desc: 'Conquer all kingdoms',              check: () => (G.kingdoms?.size ?? 0) >= KINGDOMS.length },
  { id: 'clicks_1000',   icon: '👊', name: 'Tireless',            desc: 'Click 1,000 times',                 check: () => G.totalClicks >= 1000 },
  { id: 'clicks_10k',    icon: '💪', name: 'Obsessed',            desc: 'Click 10,000 times',                check: () => G.totalClicks >= 10_000 },
];

function totalBuildings() {
  return Object.values(G.buildings).reduce((s, b) => s + b.count, 0);
}

function checkAchievements() {
  let changed = false;
  for (const a of ACHIEVEMENTS) {
    if (!G.achievements.has(a.id) && a.check()) {
      G.achievements.add(a.id);
      showToast(`🏆 ${a.name}`, 'toast-ach');
      addLog(`Achievement: ${a.name} — ${a.desc}`, 'log-ach');
      Sounds.achievement();
      changed = true;
    }
  }
  if (changed) UI.updateAchievements();
}
